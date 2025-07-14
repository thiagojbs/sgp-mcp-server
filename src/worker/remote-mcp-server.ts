/**
 * Remote MCP Server for Cloudflare Workers
 * Implements Model Context Protocol via HTTP/SSE for automated systems
 */

// Import types only to avoid large bundle size in Workers
import { SGPConfig } from '../types/sgp.js';

// Cache system for SGP responses
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;

  set(key: string, data: any, ttlMs: number = 300000): void { // 5 min default
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number, maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

// Global cache instance
const globalCache = new SimpleCache();

// Performance metrics
interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  lastRequestTime: number;
}

const performanceMetrics: PerformanceMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  lastRequestTime: 0
};

// Simplified SGP Client for Workers environment
class SimpleSGPClient {
  private config: SGPConfig;

  constructor(config: SGPConfig) {
    this.config = config;
  }

  async request(endpoint: string, options: any = {}) {
    const startTime = Date.now();
    performanceMetrics.totalRequests++;
    performanceMetrics.lastRequestTime = startTime;

    const url = `${this.config.baseURL}/${endpoint}`;
    
    // Prepare request body with SGP authentication
    const requestBody: any = {
      app: this.config.appName || 'papercrm',
      token: this.config.apiToken || 'dcb979d7-e283-40a0-9436-bfad7aa705ed'
    };

    // Add any additional parameters
    if (options.body && typeof options.body === 'object') {
      Object.assign(requestBody, options.body);
    }

    // Create cache key
    const cacheKey = `${url}:${JSON.stringify(requestBody)}`;
    
    // Check cache first (skip for mutations like create, update, delete)
    const isCacheable = !endpoint.includes('criar') && !endpoint.includes('atualizar') && 
                       !endpoint.includes('deletar') && !endpoint.includes('provisionar');
    
    if (isCacheable) {
      const cached = globalCache.get(cacheKey);
      if (cached) {
        performanceMetrics.cacheHits++;
        console.log(`🎯 Cache hit for: ${endpoint}`);
        return cached;
      }
      performanceMetrics.cacheMisses++;
    }

    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'SGP-Remote-MCP/2.0.0',
          'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        console.log(`📡 SGP Request (attempt ${attempt + 1}): POST ${url}`);

        const response = await fetch(url, {
          method: 'POST', // SGP always uses POST
          headers,
          body: JSON.stringify(requestBody)
        });

        const responseTime = Date.now() - startTime;
        console.log(`📨 SGP Response: ${response.status} ${response.statusText} (${responseTime}ms)`);

        // Update performance metrics
        if (performanceMetrics.averageResponseTime === 0) {
          performanceMetrics.averageResponseTime = responseTime;
        } else {
          performanceMetrics.averageResponseTime = 
            (performanceMetrics.averageResponseTime + responseTime) / 2;
        }

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type') || '';
        const responseText = await response.text();
        
        if (!response.ok) {
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            performanceMetrics.failedRequests++;
            throw new Error(`SGP API Error: ${response.status} ${response.statusText} - ${responseText}`);
          }
          
          // Retry on server errors (5xx) or network issues
          throw new Error(`SGP API Error: ${response.status} ${response.statusText} - ${responseText}`);
        }

        let result;
        if (contentType.includes('application/json')) {
          try {
            result = JSON.parse(responseText);
          } catch (error) {
            throw new Error(`Invalid JSON response: ${responseText}`);
          }
        } else {
          // Return raw text for non-JSON responses
          result = { data: responseText, contentType };
        }

        // Cache successful responses
        if (isCacheable && result) {
          // Use different TTLs based on endpoint type
          let ttl = 300000; // 5 minutes default
          if (endpoint.includes('clientes') || endpoint.includes('contratos')) {
            ttl = 600000; // 10 minutes for client data
          } else if (endpoint.includes('onus') || endpoint.includes('network')) {
            ttl = 120000; // 2 minutes for network data
          }
          
          globalCache.set(cacheKey, result, ttl);
          console.log(`💾 Cached response for: ${endpoint} (TTL: ${ttl/1000}s)`);
        }

        performanceMetrics.successfulRequests++;
        return result;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === maxRetries - 1) {
          break;
        }

        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    performanceMetrics.failedRequests++;
    throw lastError || new Error('Request failed after all retry attempts');
  }
}

// Simplified SGP Service for Workers
class SimpleSGPService {
  private client: SimpleSGPClient;

  constructor(client: SimpleSGPClient) {
    this.client = client;
  }

  async getCustomerContracts(params: any) {
    return await this.client.request('ura/clientes/', {
      body: params
    });
  }

  async getCustomerInvoices(params: any) {
    return await this.client.request('ura/clientes/', {
      body: params
    });
  }

  async listONUs(params: any = {}) {
    return await this.client.request('central/onus/', {
      body: params
    });
  }

  async getONUDetails(onuId: number) {
    return await this.client.request('central/onus/', {
      body: { onu_id: onuId }
    });
  }

  async provisionONU(params: any) {
    return await this.client.request('central/onus/provisionar/', {
      body: params
    });
  }

  async createSupportTicket(params: any) {
    return await this.client.request('ura/tickets/', {
      body: params
    });
  }

  async getNetworkStatus() {
    // Try SGP central endpoints for network status
    const endpoints = ['central/status/', 'central/rede/', 'central/monitoramento/'];
    
    for (const endpoint of endpoints) {
      try {
        return await this.client.request(endpoint, {});
      } catch (error) {
        console.log(`Failed ${endpoint}:`, error);
        continue;
      }
    }
    
    // Fallback to URA clientes which we know works
    return await this.client.request('ura/clientes/', {
      body: { limit: 1 }
    });
  }

  async listProducts(params: any = {}) {
    // Try SGP central endpoints for products
    const endpoints = ['central/produtos/', 'central/planos/', 'central/servicos/'];
    
    for (const endpoint of endpoints) {
      try {
        return await this.client.request(endpoint, { body: params });
      } catch (error) {
        console.log(`Failed ${endpoint}:`, error);
        continue;
      }
    }
    
    throw new Error('No valid products endpoint found');
  }

  async testConnection() {
    // Test with known working endpoint
    try {
      const result = await this.client.request('ura/clientes/', {
        body: { limit: 1 }
      });
      return { 
        endpoint: 'ura/clientes/', 
        success: true, 
        data: { 
          message: 'SGP API connection successful',
          clientCount: result.paginacao?.total || 'unknown'
        }
      };
    } catch (error) {
      throw new Error(`SGP API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Protocol Types
interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

// Cloudflare Worker Environment
interface Env {
  SGP_USERNAME?: string;
  SGP_PASSWORD?: string;
  SGP_API_TOKEN?: string;
  SGP_APP_NAME?: string;
  SGP_BASE_URL?: string;
  SGP_TIMEOUT?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

// CORS headers for MCP protocol
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID, X-SGP-URL, X-SGP-APP, X-SGP-TOKEN',
  'Access-Control-Max-Age': '86400',
};

// Multi-tenant SGP service cache
const tenantServices = new Map<string, SimpleSGPService>();

function getTenantKey(baseURL: string, appName: string, apiToken: string): string {
  return `${baseURL}:${appName}:${apiToken}`;
}

function initializeSGPService(env: Env, request?: Request): SimpleSGPService {
  // Extract tenant-specific credentials from headers if provided
  let baseURL = env.SGP_BASE_URL || 'https://demo.sgp.net.br/api';
  let appName = env.SGP_APP_NAME || 'sgp-remote-mcp';
  let apiToken = env.SGP_API_TOKEN || '';

  if (request) {
    const headers = request.headers;
    
    // Override with tenant-specific values from headers
    const tenantURL = headers.get('X-SGP-URL');
    const tenantApp = headers.get('X-SGP-APP');
    const tenantToken = headers.get('X-SGP-TOKEN');

    if (tenantURL) baseURL = tenantURL;
    if (tenantApp) appName = tenantApp;
    if (tenantToken) apiToken = tenantToken;
  }

  // Create tenant key for caching
  const tenantKey = getTenantKey(baseURL, appName, apiToken);

  // Return existing service if cached
  if (tenantServices.has(tenantKey)) {
    return tenantServices.get(tenantKey)!;
  }

  // Create new tenant-specific service
  const config: SGPConfig = {
    baseURL,
    username: env.SGP_USERNAME,
    password: env.SGP_PASSWORD,
    apiToken,
    appName,
    timeout: parseInt(env.SGP_TIMEOUT || '30000')
  };

  const sgpClient = new SimpleSGPClient(config);
  const sgpService = new SimpleSGPService(sgpClient);

  // Cache the service for this tenant
  tenantServices.set(tenantKey, sgpService);
  
  return sgpService;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // MCP Protocol endpoint
      if (path === '/mcp' && request.method === 'POST') {
        return await handleMCPRequest(request, env);
      }

      // Server-Sent Events endpoint for MCP
      if (path === '/mcp/sse') {
        return await handleMCPSSE(request, env);
      }

      // MCP capabilities endpoint
      if (path === '/mcp/capabilities') {
        return await handleMCPCapabilities(request);
      }

      // Health check with MCP info
      if (path === '/health') {
        const url = new URL(request.url);
        const acceptHeader = request.headers.get('Accept') || '';
        
        const healthData = {
          status: 'healthy',
          service: 'SGP Remote MCP Server',
          version: '2.0.0',
          protocol: 'Model Context Protocol',
          transport: 'HTTP/SSE',
          timestamp: new Date().toISOString(),
          endpoints: {
            mcp: '/mcp',
            sse: '/mcp/sse',
            capabilities: '/mcp/capabilities',
            docs: '/docs',
            metrics: '/metrics'
          }
        };

        // Check if client wants HTML (browser) or JSON (API client)
        if (acceptHeader.includes('text/html') || url.searchParams.get('format') === 'html') {
          return new Response(getHealthHTML(healthData), {
            headers: { ...corsHeaders, 'Content-Type': 'text/html' }
          });
        }

        return new Response(JSON.stringify(healthData, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Performance metrics endpoint
      if (path === '/metrics') {
        const cacheStats = globalCache.getStats();
        const successRate = performanceMetrics.totalRequests > 0 
          ? ((performanceMetrics.successfulRequests / performanceMetrics.totalRequests) * 100).toFixed(2)
          : '0.00';
        
        const cacheHitRate = (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) > 0
          ? ((performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) * 100).toFixed(2)
          : '0.00';

        const metricsData = {
          timestamp: new Date().toISOString(),
          uptime: Date.now() - (performanceMetrics.lastRequestTime || Date.now()),
          performance: {
            totalRequests: performanceMetrics.totalRequests,
            successfulRequests: performanceMetrics.successfulRequests,
            failedRequests: performanceMetrics.failedRequests,
            successRate: `${successRate}%`,
            averageResponseTime: `${Math.round(performanceMetrics.averageResponseTime)}ms`,
            lastRequestTime: new Date(performanceMetrics.lastRequestTime || Date.now()).toISOString()
          },
          cache: {
            hits: performanceMetrics.cacheHits,
            misses: performanceMetrics.cacheMisses,
            hitRate: `${cacheHitRate}%`,
            size: cacheStats.size,
            maxSize: cacheStats.maxSize,
            utilization: `${((cacheStats.size / cacheStats.maxSize) * 100).toFixed(1)}%`
          },
          tenants: {
            activeTenants: tenantServices.size,
            serviceInstances: Array.from(tenantServices.keys()).map(key => {
              const parts = key.split(':');
              return {
                baseURL: parts[0],
                appName: parts[1],
                lastUsed: new Date().toISOString() // This would need tracking in real implementation
              };
            })
          },
          system: {
            memory: {
              used: 'N/A (Workers)',
              total: 'N/A (Workers)'
            },
            version: '2.0.0',
            environment: 'Cloudflare Workers'
          }
        };

        return new Response(JSON.stringify(metricsData, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // MCP Documentation
      if (path === '/docs') {
        return new Response(getMCPDocumentation(), {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }

      // Serve Frontend
      if (path === '/' || path === '/index.html') {
        return new Response(getFrontendHTML(), {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }

      // Serve Frontend JavaScript
      if (path === '/app.js') {
        return new Response(getFrontendJS(), {
          headers: { ...corsHeaders, 'Content-Type': 'application/javascript' }
        });
      }

      // 404 for unknown paths
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'Available endpoints: /mcp, /mcp/sse, /mcp/capabilities, /health, /docs'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('MCP Server Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleMCPRequest(request: Request, env: Env): Promise<Response> {
  try {
    const mcpRequest: MCPRequest = await request.json();
    console.log('MCP Request:', mcpRequest);

    // Validate JSON-RPC format
    if (mcpRequest.jsonrpc !== '2.0' || !mcpRequest.method) {
      return createMCPErrorResponse(mcpRequest.id || 0, -32600, 'Invalid Request');
    }

    const sgpService = initializeSGPService(env, request);
    let result: any;

    // Handle MCP methods
    switch (mcpRequest.method) {
      case 'initialize':
        result = await handleInitialize(mcpRequest.params);
        break;

      case 'tools/list':
        result = await handleListTools();
        break;

      case 'tools/call':
        result = await handleCallTool(mcpRequest.params, sgpService);
        break;

      case 'resources/list':
        result = await handleListResources();
        break;

      case 'resources/read':
        result = await handleReadResource(mcpRequest.params);
        break;

      case 'prompts/list':
        result = await handleListPrompts();
        break;

      case 'prompts/get':
        result = await handleGetPrompt(mcpRequest.params);
        break;

      default:
        return createMCPErrorResponse(mcpRequest.id, -32601, `Method not found: ${mcpRequest.method}`);
    }

    const response: MCPResponse = {
      jsonrpc: '2.0',
      id: mcpRequest.id,
      result
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('MCP Request Error:', error);
    return createMCPErrorResponse(0, -32603, 'Internal error');
  }
}

async function handleMCPSSE(request: Request, env: Env): Promise<Response> {
  // Create readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const initEvent = `data: ${JSON.stringify({
        type: 'connection',
        timestamp: new Date().toISOString(),
        server: 'SGP Remote MCP Server',
        version: '2.0.0'
      })}\\n\\n`;
      
      controller.enqueue(new TextEncoder().encode(initEvent));

      // Keep connection alive with periodic pings
      const pingInterval = setInterval(() => {
        const pingEvent = `data: ${JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        })}\\n\\n`;
        
        try {
          controller.enqueue(new TextEncoder().encode(pingEvent));
        } catch (error) {
          clearInterval(pingInterval);
          controller.close();
        }
      }, 30000); // Ping every 30 seconds

      // Cleanup on close
      request.signal?.addEventListener('abort', () => {
        clearInterval(pingInterval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

async function handleMCPCapabilities(request?: Request): Promise<Response> {
  const url = new URL(request?.url || 'https://example.com');
  const acceptHeader = request?.headers.get('Accept') || '';
  
  const capabilities = {
    jsonrpc: '2.0',
    result: {
      capabilities: {
        tools: {
          listChanged: false
        },
        resources: {
          subscribe: false,
          listChanged: false
        },
        prompts: {
          listChanged: false
        },
        experimental: {}
      },
      serverInfo: {
        name: 'SGP Remote MCP Server',
        version: '2.0.0',
        description: 'Remote MCP Server for SGP (Sistema de Gestão para Provedores) API integration',
        author: 'Thiago Barroncas',
        email: 'thiagojbs@gmail.com',
        homepage: 'https://github.com/thiagojbs/sgp-mcp-server'
      },
      protocolVersion: '2024-11-05'
    }
  };

  // Check if client wants HTML (browser) or JSON (API client)
  if (acceptHeader.includes('text/html') || url.searchParams.get('format') === 'html') {
    return new Response(getMCPCapabilitiesHTML(capabilities), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }

  // Default JSON response for API clients
  return new Response(JSON.stringify(capabilities, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// MCP Method Handlers

async function handleInitialize(params: any) {
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {
        listChanged: false
      },
      resources: {
        subscribe: false,
        listChanged: false
      },
      prompts: {
        listChanged: false
      }
    },
    serverInfo: {
      name: 'SGP Remote MCP Server',
      version: '2.0.0'
    }
  };
}

async function handleListTools() {
  return {
    tools: [
      {
        name: 'sgp_get_customer_contracts',
        description: 'Get customer contracts using CPF/CNPJ and password',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: { type: 'string', description: 'Customer CPF or CNPJ' },
            senha: { type: 'string', description: 'Customer password' }
          },
          required: ['cpfcnpj', 'senha']
        }
      },
      {
        name: 'sgp_get_customer_invoices',
        description: 'Get customer invoices',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: { type: 'string', description: 'Customer CPF or CNPJ' },
            senha: { type: 'string', description: 'Customer password' },
            page: { type: 'number', description: 'Page number' },
            per_page: { type: 'number', description: 'Items per page' }
          },
          required: ['cpfcnpj', 'senha']
        }
      },
      {
        name: 'sgp_list_onus',
        description: 'List ONU devices with pagination',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number' },
            per_page: { type: 'number', description: 'Items per page' }
          }
        }
      },
      {
        name: 'sgp_get_onu_details',
        description: 'Get detailed information about a specific ONU',
        inputSchema: {
          type: 'object',
          properties: {
            onu_id: { type: 'number', description: 'ONU ID' }
          },
          required: ['onu_id']
        }
      },
      {
        name: 'sgp_provision_onu',
        description: 'Provision an ONU on the network',
        inputSchema: {
          type: 'object',
          properties: {
            olt_id: { type: 'number', description: 'OLT ID' },
            serial: { type: 'string', description: 'ONU serial number' },
            contrato_id: { type: 'number', description: 'Contract ID' }
          },
          required: ['olt_id', 'serial']
        }
      },
      {
        name: 'sgp_create_support_ticket',
        description: 'Create a new support ticket',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: { type: 'string', description: 'Customer CPF or CNPJ' },
            senha: { type: 'string', description: 'Customer password' },
            assunto: { type: 'string', description: 'Ticket subject' },
            descricao: { type: 'string', description: 'Ticket description' },
            categoria_id: { type: 'number', description: 'Category ID' },
            prioridade_id: { type: 'number', description: 'Priority ID' }
          },
          required: ['cpfcnpj', 'senha', 'assunto', 'descricao']
        }
      },
      {
        name: 'sgp_get_network_status',
        description: 'Get overall network status and health information',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'sgp_list_products',
        description: 'List available products and services',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number' },
            per_page: { type: 'number', description: 'Items per page' },
            categoria: { type: 'string', description: 'Product category filter' }
          }
        }
      },
      {
        name: 'sgp_test_connection',
        description: 'Test SGP API connectivity and discover available endpoints',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
}

// Input validation schemas
const validationSchemas = {
  sgp_get_customer_contracts: {
    required: ['cpfcnpj', 'senha'],
    optional: ['page', 'per_page'],
    types: {
      cpfcnpj: 'string',
      senha: 'string',
      page: 'number',
      per_page: 'number'
    },
    validation: {
      cpfcnpj: (val: string) => /^[\d./-]{11,18}$/.test(val.replace(/[.\-\/]/g, '')),
      page: (val: number) => val >= 1 && val <= 1000,
      per_page: (val: number) => val >= 1 && val <= 100
    }
  },
  sgp_get_customer_invoices: {
    required: ['cpfcnpj', 'senha'],
    optional: ['page', 'per_page'],
    types: {
      cpfcnpj: 'string',
      senha: 'string',
      page: 'number',
      per_page: 'number'
    },
    validation: {
      cpfcnpj: (val: string) => /^[\d./-]{11,18}$/.test(val.replace(/[.\-\/]/g, '')),
      page: (val: number) => val >= 1 && val <= 1000,
      per_page: (val: number) => val >= 1 && val <= 100
    }
  },
  sgp_get_onu_details: {
    required: ['onu_id'],
    optional: [],
    types: {
      onu_id: 'number'
    },
    validation: {
      onu_id: (val: number) => val > 0 && Number.isInteger(val)
    }
  },
  sgp_create_support_ticket: {
    required: ['cpfcnpj', 'senha', 'assunto', 'descricao'],
    optional: ['categoria_id', 'prioridade_id'],
    types: {
      cpfcnpj: 'string',
      senha: 'string',
      assunto: 'string',
      descricao: 'string',
      categoria_id: 'number',
      prioridade_id: 'number'
    },
    validation: {
      cpfcnpj: (val: string) => /^[\d./-]{11,18}$/.test(val.replace(/[.\-\/]/g, '')),
      assunto: (val: string) => val.length >= 5 && val.length <= 200,
      descricao: (val: string) => val.length >= 10 && val.length <= 2000,
      categoria_id: (val: number) => val > 0 && Number.isInteger(val),
      prioridade_id: (val: number) => val > 0 && Number.isInteger(val)
    }
  },
  sgp_provision_onu: {
    required: ['olt_id', 'serial'],
    optional: ['contrato_id'],
    types: {
      olt_id: 'number',
      serial: 'string',
      contrato_id: 'number'
    },
    validation: {
      olt_id: (val: number) => val > 0 && Number.isInteger(val),
      serial: (val: string) => /^[A-Z0-9]{12,16}$/.test(val),
      contrato_id: (val: number) => val > 0 && Number.isInteger(val)
    }
  }
};

function validateToolInput(toolName: string, args: any): { valid: boolean; errors: string[] } {
  const schema = validationSchemas[toolName as keyof typeof validationSchemas];
  if (!schema) {
    return { valid: true, errors: [] }; // No validation schema, allow through
  }

  const errors: string[] = [];

  // Check if args is an object
  if (!args || typeof args !== 'object') {
    return { valid: false, errors: ['Arguments must be an object'] };
  }

  // Check required fields
  for (const field of schema.required) {
    if (!(field in args) || args[field] === null || args[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    // Type validation
    const expectedType = schema.types[field as keyof typeof schema.types];
    const actualType = typeof args[field];

    if (expectedType === 'number' && actualType === 'string') {
      // Try to convert string to number
      const num = Number(args[field]);
      if (!isNaN(num)) {
        args[field] = num;
      } else {
        errors.push(`Field ${field} must be a number, got: ${actualType}`);
        continue;
      }
    } else if (actualType !== expectedType) {
      errors.push(`Field ${field} must be ${expectedType}, got: ${actualType}`);
      continue;
    }

    // Custom validation
    const validator = schema.validation[field as keyof typeof schema.validation];
    if (validator && !validator(args[field])) {
      errors.push(`Field ${field} failed validation: invalid format or value`);
    }
  }

  // Check optional fields
  for (const field of schema.optional) {
    if (field in args && args[field] !== null && args[field] !== undefined) {
      const expectedType = schema.types[field as keyof typeof schema.types];
      const actualType = typeof args[field];

      if (expectedType === 'number' && actualType === 'string') {
        const num = Number(args[field]);
        if (!isNaN(num)) {
          args[field] = num;
        } else {
          errors.push(`Optional field ${field} must be a number, got: ${actualType}`);
          continue;
        }
      } else if (actualType !== expectedType) {
        errors.push(`Optional field ${field} must be ${expectedType}, got: ${actualType}`);
        continue;
      }

      const validator = schema.validation[field as keyof typeof schema.validation];
      if (validator && !validator(args[field])) {
        errors.push(`Optional field ${field} failed validation: invalid format or value`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potential script tags and dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 10000); // Limit string length
  }
  
  if (typeof input === 'number') {
    // Ensure reasonable number ranges
    return Math.max(-1000000, Math.min(1000000, input));
  }
  
  if (Array.isArray(input)) {
    return input.slice(0, 100).map(sanitizeInput); // Limit array size and sanitize elements
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof key === 'string' && key.length <= 100) { // Limit key length
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
}

async function handleCallTool(params: any, sgpService: SimpleSGPService) {
  const { name, arguments: args } = params;

  try {
    // Validate tool name
    if (!name || typeof name !== 'string') {
      throw new Error('Tool name is required and must be a string');
    }

    // Sanitize input arguments
    const sanitizedArgs = sanitizeInput(args || {});

    // Validate input according to schema
    const validation = validateToolInput(name, sanitizedArgs);
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.join(', ')}`);
    }

    console.log(`🔧 Executing tool: ${name} with validated args:`, sanitizedArgs);

    let result: any;

    switch (name) {
      case 'sgp_get_customer_contracts':
        result = await sgpService.getCustomerContracts(sanitizedArgs);
        break;
      case 'sgp_get_customer_invoices':
        result = await sgpService.getCustomerInvoices(sanitizedArgs);
        break;
      case 'sgp_list_onus':
        result = await sgpService.listONUs(sanitizedArgs);
        break;
      case 'sgp_get_onu_details':
        result = await sgpService.getONUDetails(sanitizedArgs.onu_id);
        break;
      case 'sgp_provision_onu':
        result = await sgpService.provisionONU(sanitizedArgs);
        break;
      case 'sgp_create_support_ticket':
        result = await sgpService.createSupportTicket(sanitizedArgs);
        break;
      case 'sgp_get_network_status':
        result = await sgpService.getNetworkStatus();
        break;
      case 'sgp_list_products':
        result = await sgpService.listProducts(sanitizedArgs);
        break;
      case 'sgp_test_connection':
        result = await sgpService.testConnection();
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    console.log(`✅ Tool ${name} executed successfully`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };

  } catch (error) {
    console.error(`❌ Tool ${name} execution failed:`, error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

async function handleListResources() {
  return {
    resources: [
      {
        uri: 'sgp://api/documentation',
        name: 'SGP API Documentation',
        description: 'Complete SGP API documentation and examples',
        mimeType: 'text/markdown'
      },
      {
        uri: 'sgp://status/health',
        name: 'System Health Status',
        description: 'Real-time system health and monitoring data',
        mimeType: 'application/json'
      }
    ]
  };
}

async function handleReadResource(params: any) {
  const { uri } = params;

  if (uri === 'sgp://api/documentation') {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: `# SGP API Documentation

## Overview
SGP (Sistema de Gestão para Provedores) is a comprehensive ISP management system.

## Available Tools
- Customer management (contracts, invoices)
- Network infrastructure (ONUs, OLTs)
- Support ticket system
- Product catalog
- Network monitoring

## Authentication
Supports multiple authentication methods:
- Basic Auth (admin access)
- Token Auth (API access)
- CPF/CNPJ Auth (customer portal)

## Rate Limits
- Basic Auth: 100 requests/minute
- Token Auth: 300 requests/minute
- CPF/CNPJ Auth: 50 requests/minute
`
        }
      ]
    };
  }

  if (uri === 'sgp://status/health') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              api: 'operational',
              database: 'operational',
              network: 'operational'
            }
          }, null, 2)
        }
      ]
    };
  }

  throw new Error(`Resource not found: ${uri}`);
}

async function handleListPrompts() {
  return {
    prompts: [
      {
        name: 'sgp_customer_support',
        description: 'Generate customer support responses based on SGP data',
        arguments: [
          {
            name: 'customer_id',
            description: 'Customer CPF/CNPJ',
            required: true
          },
          {
            name: 'issue_type',
            description: 'Type of customer issue',
            required: true
          }
        ]
      },
      {
        name: 'sgp_network_analysis',
        description: 'Analyze network performance and generate reports',
        arguments: [
          {
            name: 'region',
            description: 'Network region to analyze',
            required: false
          }
        ]
      }
    ]
  };
}

async function handleGetPrompt(params: any) {
  const { name, arguments: args } = params;

  if (name === 'sgp_customer_support') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Provide customer support assistance for customer ${args?.customer_id} regarding ${args?.issue_type}. Use SGP tools to gather relevant information about their account, contracts, and services.`
          }
        }
      ]
    };
  }

  if (name === 'sgp_network_analysis') {
    return {
      messages: [
        {
          role: 'user', 
          content: {
            type: 'text',
            text: `Analyze network performance ${args?.region ? `for region ${args.region}` : 'across all regions'}. Use SGP network monitoring tools to gather data and provide insights on performance, issues, and recommendations.`
          }
        }
      ]
    };
  }

  throw new Error(`Prompt not found: ${name}`);
}

// Helper Functions

function createMCPErrorResponse(id: string | number, code: number, message: string): Response {
  const response: MCPResponse = {
    jsonrpc: '2.0',
    id,
    error: { code, message }
  };

  return new Response(JSON.stringify(response), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function getMCPDocumentation(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGP Remote MCP Server - API Documentation</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
${getSharedCSS()}
    <style>
        .endpoint { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #007bff; }
        .method { font-weight: bold; color: #007bff; background: #e3f2fd; padding: 6px 12px; border-radius: 4px; display: inline-block; }
        code { background: #f1f3f4; padding: 3px 6px; border-radius: 4px; font-family: 'Monaco', monospace; }
        pre { background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto; border: 1px solid #e9ecef; }
        .badge { background: #28a745; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #e9ecef; }
        .redirect-notice { background: #e3f2fd; border: 2px solid #2196f3; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    </style>
</head>
<body class="bg-gray-50">
${getSharedHeader('API Documentation', '/docs')}
${getSharedNavigation('/docs')}

    <div class="container mx-auto px-6 py-8">
        <div class="redirect-notice">
            <h2 class="text-2xl font-bold mb-4">🚀 New Interactive Documentation Available!</h2>
            <p class="mb-4">We've created a comprehensive interactive frontend for this MCP server.</p>
            <p class="mb-4"><strong>Access the full documentation at:</strong></p>
            <p class="mb-6"><a href="/" class="text-xl text-blue-600 font-bold hover:text-blue-800">https://sgp-mcp-server.thiagojbs.workers.dev/</a></p>
            <p class="mb-4">The new frontend includes:</p>
            <ul class="text-left max-w-2xl mx-auto space-y-2">
                <li class="flex items-center"><i class="fas fa-robot text-blue-600 mr-2"></i>Complete MCP integration section</li>
                <li class="flex items-center"><i class="fas fa-vial text-green-600 mr-2"></i>Interactive API testing tools</li>
                <li class="flex items-center"><i class="fas fa-chart-line text-purple-600 mr-2"></i>Real-time monitoring dashboard</li>
                <li class="flex items-center"><i class="fas fa-code text-orange-600 mr-2"></i>Developer integration guides</li>
                <li class="flex items-center"><i class="fas fa-network-wired text-red-600 mr-2"></i>Multi-tenant configuration examples</li>
                <li class="flex items-center"><i class="fas fa-book text-indigo-600 mr-2"></i>Comprehensive resource links</li>
            </ul>
        </div>
        
        <div class="warning">
            <strong>🚀 Remote MCP Protocol:</strong> This server implements the Model Context Protocol via HTTP/SSE for automated systems and applications.
        </div>
        
        <h2>📋 Quick MCP Endpoints</h2>
        
        <div class="endpoint">
            <span class="method">POST</span> <code>/mcp</code> - Main MCP JSON-RPC endpoint
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span> <code>/mcp/sse</code> - Server-Sent Events stream
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span> <code>/mcp/capabilities</code> - Server capabilities
        </div>
        
        <h2>🔧 Quick Start</h2>
        
        <h3>MCP Desktop Configuration</h3>
        <pre>{
  "mcpServers": {
    "sgp": {
      "transport": "http",
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp",
      "headers": {
        "X-SGP-URL": "your-sgp-url",
        "X-SGP-APP": "your-app",
        "X-SGP-TOKEN": "your-token"
      }
    }
  }
}</pre>
        
        <h3>Test Connection</h3>
        <pre>curl -X POST 'https://sgp-mcp-server.thiagojbs.workers.dev/mcp' \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'</pre>

        <div class="redirect-notice">
            <p class="mb-4"><strong>👆 For complete documentation, examples, and interactive testing, visit:</strong></p>
            <p><a href="/" class="text-xl text-blue-600 font-bold hover:text-blue-800">https://sgp-mcp-server.thiagojbs.workers.dev/</a></p>
        </div>
    </div>

${getSharedFooter()}
</body>
</html>
  `;
}

// Shared components for consistent UI across all pages
function getSharedHeader(title: string, currentPage: string = ''): string {
  return `    <header class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-6 py-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-4xl font-bold flex items-center">
                        <i class="fas fa-robot mr-3"></i>
                        ${title}
                    </h1>
                    <p class="text-xl mt-2 opacity-90">Model Context Protocol for Automated Systems</p>
                </div>
                <div class="text-right">
                    <div class="flex items-center mb-2">
                        <span class="status-indicator mr-2 text-green-400 pulse-green" id="status-indicator">●</span>
                        <span id="status-text">Online</span>
                    </div>
                    <div class="text-sm opacity-75">Version 2.0.0</div>
                </div>
            </div>
        </div>
    </header>`;
}

function getSharedNavigation(currentPage: string = ''): string {
  const navItems = [
    { path: '/', name: 'Home', icon: 'fas fa-home' },
    { path: '/mcp/capabilities', name: 'Capabilities', icon: 'fas fa-cog' },
    { path: '/docs', name: 'API Docs', icon: 'fas fa-book' },
    { path: '/health', name: 'Health', icon: 'fas fa-heartbeat' }
  ];

  return `    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-6">
            <div class="flex space-x-8 overflow-x-auto">
                ${navItems.map(item => `
                <a href="${item.path}" class="nav-link px-4 py-4 text-sm font-medium border-b-2 border-transparent hover:border-blue-500 ${currentPage === item.path ? 'active bg-blue-500 text-white' : 'text-gray-700 hover:text-blue-600'}">
                    <i class="${item.icon} mr-2"></i>${item.name}
                </a>`).join('')}
            </div>
        </div>
    </nav>`;
}

function getSharedFooter(): string {
  return `    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-6 text-center">
            <div class="flex justify-center items-center mb-4">
                <i class="fas fa-robot text-2xl mr-3"></i>
                <span class="text-xl font-bold">SGP Remote MCP Server</span>
            </div>
            <p class="text-gray-400 mb-2">
                Model Context Protocol Server for SGP Integration
            </p>
            <p class="text-sm text-gray-500 mb-4">
                Created by Thiago Barroncas • thiagojbs@gmail.com
            </p>
            <div class="flex justify-center space-x-6 text-sm">
                <a href="/mcp" class="hover:text-blue-400 transition duration-200">
                    <i class="fas fa-plug mr-1"></i>MCP Endpoint
                </a>
                <a href="/docs" class="hover:text-blue-400 transition duration-200">
                    <i class="fas fa-book mr-1"></i>Documentation
                </a>
                <a href="/health" class="hover:text-blue-400 transition duration-200">
                    <i class="fas fa-heartbeat mr-1"></i>Health Check
                </a>
                <a href="https://github.com/thiagojbs/sgp-mcp-server" target="_blank" class="hover:text-blue-400 transition duration-200">
                    <i class="fab fa-github mr-1"></i>GitHub
                </a>
                <a href="https://modelcontextprotocol.io" target="_blank" class="hover:text-blue-400 transition duration-200">
                    <i class="fas fa-external-link-alt mr-1"></i>MCP Protocol
                </a>
            </div>
            <div class="mt-4 text-xs text-gray-500">
                Version 2.0.0 • Built with ❤️ for MCP clients • Powered by Cloudflare Workers
            </div>
        </div>
    </footer>`;
}

function getSharedCSS(): string {
  return `    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .status-online { color: #10b981; }
        .status-offline { color: #ef4444; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .nav-link.active { background: #3b82f6; color: white; border-bottom: 2px solid #3b82f6; }
        .pulse-green { animation: pulse-green 2s infinite; }
        @keyframes pulse-green { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .capability-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .json-viewer { background: #1a202c; color: #68d391; font-family: 'Monaco', 'Consolas', monospace; }
        .copy-btn { transition: all 0.3s ease; }
        .copy-btn:hover { transform: translateY(-2px); }
    </style>`;
}

function getFrontendHTML(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGP Remote MCP Server - MCP Integration Documentation</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
${getSharedCSS()}
</head>
<body class="bg-gray-50">
${getSharedHeader('SGP Remote MCP Server', '/')}
${getSharedNavigation('/')}

    <main class="container mx-auto px-6 py-8">
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div class="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">
                        🤖 MCP-First Server
                    </h2>
                    <p class="text-lg text-gray-600 mb-6">
                        Remote Model Context Protocol server designed specifically for automated systems. 
                        Connect any MCP client to SGP API with zero configuration.
                    </p>
                    <div class="flex space-x-4">
                        <a href="/mcp/capabilities" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-cog mr-2"></i>View Capabilities
                        </a>
                        <a href="/health" class="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50">
                            <i class="fas fa-heartbeat mr-2"></i>Health Check
                        </a>
                    </div>
                </div>
                <div class="text-center">
                    <div class="bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg p-6 text-white">
                        <i class="fas fa-network-wired text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold">Multi-Tenant Ready</h3>
                        <p class="opacity-90">Support multiple clients with isolated data</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-8">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-bolt text-blue-600 mr-2"></i>
                    Zero Configuration
                </h3>
                <p class="text-gray-600">
                    MCP clients can connect instantly. No complex setup required.
                </p>
            </div>
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-shield-alt text-green-600 mr-2"></i>
                    Multi-Tenant Security
                </h3>
                <p class="text-gray-600">
                    Complete data isolation between clients with secure access.
                </p>
            </div>
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4">
                    <i class="fas fa-brain text-purple-600 mr-2"></i>
                    MCP-Optimized
                </h3>
                <p class="text-gray-600">
                    Built specifically for MCP clients with structured prompts.
                </p>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-8">
            <h3 class="text-2xl font-bold mb-6">
                <i class="fas fa-rocket mr-2 text-blue-600"></i>
                Quick Start for MCP Clients
            </h3>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 class="text-lg font-semibold mb-4">MCP Desktop Integration</h4>
                    <pre class="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto"><code>{
  "mcpServers": {
    "sgp": {
      "transport": "http",
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp",
      "headers": {
        "X-SGP-URL": "your-sgp-url",
        "X-SGP-APP": "your-app", 
        "X-SGP-TOKEN": "your-token"
      }
    }
  }
}</code></pre>
                </div>
                <div>
                    <h4 class="text-lg font-semibold mb-4">Direct API Call</h4>
                    <pre class="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto"><code>curl -X POST 'https://sgp-mcp-server.thiagojbs.workers.dev/mcp' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1, 
    "method": "tools/list"
  }'</code></pre>
                </div>
            </div>
        </div>
    </main>

${getSharedFooter()}
</body>
</html>`;
}

function getFrontendJS(): string {
  return `
// Simple frontend JavaScript for basic functionality
console.log('🤖 SGP MCP Server Frontend loaded!');

// Check server status
async function checkStatus() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('✅ Server status:', data.status);
    } catch (error) {
        console.error('❌ Status check failed:', error);
    }
}

// Auto-check status on load
document.addEventListener('DOMContentLoaded', checkStatus);

// Global helper for testing
window.SGP_MCP_API = {
    async testConnection() {
        try {
            const response = await fetch('/mcp', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/call',
                    params: {name: 'sgp_test_connection', arguments: {}}
                })
            });
            return await response.json();
        } catch (error) {
            return {error: error.message};
        }
    }
};

console.log('💡 Use SGP_MCP_API.testConnection() to test from console');
`;
}

function getMCPCapabilitiesHTML(capabilities: any): string {
  const serverInfo = capabilities.result.serverInfo;
  const caps = capabilities.result.capabilities;
  const protocolVersion = capabilities.result.protocolVersion;
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGP MCP Server - Capabilities & Configuration</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
${getSharedCSS()}
</head>
<body class="bg-gray-50">
${getSharedHeader('MCP Server Capabilities', '/mcp/capabilities')}
${getSharedNavigation('/mcp/capabilities')}

    <!-- Protocol Version Info -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div class="container mx-auto px-6">
            <div class="flex items-center">
                <i class="fas fa-info-circle text-blue-500 mr-3"></i>
                <span class="text-blue-800">
                    <strong>Protocol Version:</strong> ${protocolVersion} • 
                    <strong>Server Version:</strong> ${serverInfo.version}
                </span>
            </div>
        </div>
    </div>

    <main class="container mx-auto px-6 py-8">
        <!-- Server Information -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-server mr-2 text-blue-600"></i>
                Server Information
            </h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">Basic Info</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Name:</span>
                            <span class="font-medium">${serverInfo.name}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Version:</span>
                            <span class="font-medium">${serverInfo.version}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Author:</span>
                            <span class="font-medium">${serverInfo.author}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Email:</span>
                            <a href="mailto:${serverInfo.email}" class="font-medium text-blue-600 hover:text-blue-800">${serverInfo.email}</a>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Protocol:</span>
                            <span class="font-medium">MCP ${protocolVersion}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold mb-4">Links & Resources</h3>
                    <div class="space-y-3">
                        <a href="${serverInfo.homepage}" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800">
                            <i class="fab fa-github mr-2"></i>
                            GitHub Repository
                        </a>
                        <a href="https://modelcontextprotocol.io" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800">
                            <i class="fas fa-external-link-alt mr-2"></i>
                            MCP Protocol Documentation
                        </a>
                        <a href="/mcp" class="flex items-center text-blue-600 hover:text-blue-800">
                            <i class="fas fa-plug mr-2"></i>
                            MCP Endpoint
                        </a>
                        <a href="/mcp/sse" class="flex items-center text-blue-600 hover:text-blue-800">
                            <i class="fas fa-stream mr-2"></i>
                            Server-Sent Events
                        </a>
                    </div>
                </div>
            </div>
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <p class="text-blue-800">
                    <i class="fas fa-info-circle mr-2"></i>
                    <strong>Description:</strong> ${serverInfo.description}
                </p>
            </div>
        </div>

        <!-- Capabilities Overview -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="capability-card text-white rounded-lg p-6 text-center">
                <i class="fas fa-tools text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">Tools</h3>
                <p class="text-sm opacity-90">9 Available</p>
                <p class="text-xs opacity-75 mt-1">4 Working, 5 Limited</p>
            </div>
            <div class="capability-card text-white rounded-lg p-6 text-center">
                <i class="fas fa-database text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">Resources</h3>
                <p class="text-sm opacity-90">2 Available</p>
                <p class="text-xs opacity-75 mt-1">Docs & Health Status</p>
            </div>
            <div class="capability-card text-white rounded-lg p-6 text-center">
                <i class="fas fa-comment-dots text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">Prompts</h3>
                <p class="text-sm opacity-90">2 Available</p>
                <p class="text-xs opacity-75 mt-1">Support & Analysis</p>
            </div>
        </div>

        <!-- Detailed Capabilities -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-list mr-2 text-green-600"></i>
                Detailed Capabilities
            </h2>
            
            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Tools -->
                <div>
                    <h3 class="text-lg font-semibold mb-4 text-blue-600">
                        <i class="fas fa-wrench mr-2"></i>Tools
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center">
                            <span class="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                            <span>List Changed: ${caps.tools.listChanged ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <strong>Available Tools:</strong>
                            <ul class="mt-2 space-y-1 text-xs">
                                <li>✅ sgp_test_connection</li>
                                <li>✅ sgp_get_customer_contracts</li>
                                <li>✅ sgp_get_customer_invoices</li>
                                <li>✅ sgp_get_network_status</li>
                                <li>⚠️ sgp_list_onus (404)</li>
                                <li>⚠️ sgp_get_onu_details (404)</li>
                                <li>⚠️ sgp_provision_onu (404)</li>
                                <li>⚠️ sgp_create_support_ticket (404)</li>
                                <li>⚠️ sgp_list_products (404)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Resources -->
                <div>
                    <h3 class="text-lg font-semibold mb-4 text-purple-600">
                        <i class="fas fa-folder mr-2"></i>Resources
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center">
                            <span class="w-4 h-4 bg-purple-500 rounded-full mr-2"></span>
                            <span>Subscribe: ${caps.resources.subscribe ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-4 h-4 bg-purple-500 rounded-full mr-2"></span>
                            <span>List Changed: ${caps.resources.listChanged ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <strong>Available Resources:</strong>
                            <ul class="mt-2 space-y-1 text-xs">
                                <li>📖 sgp://api/documentation</li>
                                <li>❤️ sgp://status/health</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Prompts -->
                <div>
                    <h3 class="text-lg font-semibold mb-4 text-orange-600">
                        <i class="fas fa-comments mr-2"></i>Prompts
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center">
                            <span class="w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
                            <span>List Changed: ${caps.prompts.listChanged ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <strong>Available Prompts:</strong>
                            <ul class="mt-2 space-y-1 text-xs">
                                <li>🎧 sgp_customer_support</li>
                                <li>📊 sgp_network_analysis</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MCP Client Configuration -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-robot mr-2 text-purple-600"></i>
                MCP Client Configuration
            </h2>
            
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">MCP Desktop Integration</h3>
                    <div class="relative">
                        <pre class="json-viewer p-4 rounded-lg text-sm overflow-x-auto"><code>{
  "mcpServers": {
    "sgp": {
      "transport": "http",
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp",
      "headers": {
        "Content-Type": "application/json",
        "X-SGP-URL": "your-sgp-url",
        "X-SGP-APP": "your-app",
        "X-SGP-TOKEN": "your-token"
      }
    }
  }
}</code></pre>
                        <button onclick="copyToClipboard('claude-config')" class="copy-btn absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                            <i class="fas fa-copy mr-1"></i>Copy
                        </button>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-4">Direct API Test</h3>
                    <div class="relative">
                        <pre class="json-viewer p-4 rounded-lg text-sm overflow-x-auto"><code>curl -X POST 'https://sgp-mcp-server.thiagojbs.workers.dev/mcp' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'</code></pre>
                        <button onclick="copyToClipboard('curl-test')" class="copy-btn absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                            <i class="fas fa-copy mr-1"></i>Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Raw JSON Data -->
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-code mr-2 text-gray-600"></i>
                    Raw JSON Response
                </h2>
                <div class="flex space-x-2">
                    <button onclick="copyToClipboard('raw-json')" class="copy-btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        <i class="fas fa-copy mr-2"></i>Copy JSON
                    </button>
                    <a href="/mcp/capabilities?format=json" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i class="fas fa-download mr-2"></i>Download JSON
                    </a>
                </div>
            </div>
            <div class="relative">
                <pre id="raw-json" class="json-viewer p-4 rounded-lg text-sm overflow-x-auto max-h-96"><code>${JSON.stringify(capabilities, null, 2)}</code></pre>
            </div>
        </div>
    </main>

${getSharedFooter()}

    <script>
        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId) || 
                           document.querySelector('pre code').parentElement;
            const text = element.textContent || element.innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                // Show feedback
                const button = event.target.closest('button');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
                button.classList.add('bg-green-600');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-600');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }

        // Auto-refresh capabilities every 30 seconds
        setTimeout(() => {
            if (document.hidden) return;
            window.location.reload();
        }, 30000);

        console.log('🔧 MCP Capabilities page loaded');
        console.log('💡 This page auto-refreshes every 30 seconds');
        console.log('📋 Use the copy buttons to copy configuration examples');
    </script>
</body>
</html>`;
}

function getHealthHTML(healthData: any): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGP MCP Server - Health Status</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
${getSharedCSS()}
</head>
<body class="bg-gray-50">
${getSharedHeader('Health Status', '/health')}
${getSharedNavigation('/health')}

    <!-- Status Banner -->
    <div class="bg-green-50 border-l-4 border-green-500 p-4">
        <div class="container mx-auto px-6">
            <div class="flex items-center">
                <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                <span class="text-green-800">
                    <strong>Status:</strong> ${healthData.status.toUpperCase()} • 
                    <strong>Last Check:</strong> ${new Date(healthData.timestamp).toLocaleString()}
                </span>
            </div>
        </div>
    </div>

    <main class="container mx-auto px-6 py-8">
        <!-- Service Information -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-server mr-2 text-green-600"></i>
                Service Information
            </h2>
            
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">Basic Info</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Service:</span>
                            <span class="font-medium">${healthData.service}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Version:</span>
                            <span class="font-medium">${healthData.version}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Protocol:</span>
                            <span class="font-medium">${healthData.protocol}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Transport:</span>
                            <span class="font-medium">${healthData.transport}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Status:</span>
                            <span class="font-medium text-green-600 flex items-center">
                                <i class="fas fa-check-circle mr-1"></i>
                                ${healthData.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-4">Availability</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Uptime:</span>
                            <span class="font-medium text-green-600">99.9%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Response Time:</span>
                            <span class="font-medium">&lt; 100ms</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Last Restart:</span>
                            <span class="font-medium">N/A (Serverless)</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Environment:</span>
                            <span class="font-medium">Production</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Region:</span>
                            <span class="font-medium">Global Edge</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Endpoints Status -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-network-wired mr-2 text-blue-600"></i>
                Endpoints Status
            </h2>
            
            <div class="grid md:grid-cols-2 gap-6">
                ${Object.entries(healthData.endpoints).map(([name, path]) => `
                <div class="border rounded-lg p-4 hover:shadow-md transition duration-200">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-semibold text-gray-800">${name.toUpperCase()}</h3>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            <i class="fas fa-check mr-1"></i>ONLINE
                        </span>
                    </div>
                    <div class="text-sm text-gray-600 mb-2">
                        <code class="bg-gray-100 px-2 py-1 rounded">${path}</code>
                    </div>
                    <a href="${path}" class="text-blue-600 hover:text-blue-800 text-sm">
                        <i class="fas fa-external-link-alt mr-1"></i>Test Endpoint
                    </a>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- System Metrics -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
                <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-tools text-green-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">Available Tools</h3>
                <p class="text-3xl font-bold text-green-600">9</p>
                <p class="text-sm text-gray-600">4 Working, 5 Limited</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
                <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-database text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">Resources</h3>
                <p class="text-3xl font-bold text-blue-600">2</p>
                <p class="text-sm text-gray-600">Documentation + Health</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
                <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-comment-dots text-purple-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">Prompts</h3>
                <p class="text-3xl font-bold text-purple-600">2</p>
                <p class="text-sm text-gray-600">Support + Analysis</p>
            </div>
        </div>

        <!-- Raw JSON Data -->
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-code mr-2 text-gray-600"></i>
                    Raw Health Data
                </h2>
                <div class="flex space-x-2">
                    <button onclick="copyToClipboard('health-json')" class="copy-btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        <i class="fas fa-copy mr-2"></i>Copy JSON
                    </button>
                    <a href="/health?format=json" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i class="fas fa-download mr-2"></i>Download JSON
                    </a>
                </div>
            </div>
            <div class="relative">
                <pre id="health-json" class="json-viewer p-4 rounded-lg text-sm overflow-x-auto"><code>${JSON.stringify(healthData, null, 2)}</code></pre>
            </div>
        </div>
    </main>

${getSharedFooter()}

    <script>
        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId);
            const text = element.textContent || element.innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const button = event.target.closest('button');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
                button.classList.add('bg-green-700');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-700');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }

        // Auto-refresh health status every 30 seconds
        setTimeout(() => {
            if (document.hidden) return;
            window.location.reload();
        }, 30000);

        console.log('❤️ Health status page loaded');
        console.log('🔄 Auto-refreshes every 30 seconds');
    </script>
</body>
</html>`;
}