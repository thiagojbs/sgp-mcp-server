/**
 * Cloudflare Worker for SGP MCP Server
 * Provides public API access to SGP system via edge computing
 */

import { SGPService } from '../services/sgp-service.js';
import { SGPClient } from '../client/sgp-client.js';
import { SGPConfig, AuthCredentials } from '../types/sgp.js';
import { WorkerEnv, ExecutionContext, KVNamespace, RateLimitEntry } from './types.js';

// CORS headers for public API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Method',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting storage
const rateLimits = new Map<string, RateLimitEntry>();

class WorkerLogger {
  info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data);
  }
  
  error(message: string, data?: any) {
    console.error(`[ERROR] ${message}`, data);
  }
  
  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data);
  }
}

// Initialize worker logger
const logger = new WorkerLogger();

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Health check endpoint
      if (path === '/health' || path === '/') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'SGP MCP Server',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          environment: 'cloudflare-workers',
          endpoints: {
            api: '/api',
            tools: '/tools',
            docs: '/docs'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // API documentation endpoint
      if (path === '/docs') {
        return new Response(getAPIDocumentation(), {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }

      // List available tools
      if (path === '/tools' && request.method === 'GET') {
        return new Response(JSON.stringify({
          status: 'success',
          tools: getAvailableTools(),
          total: getAvailableTools().length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // SGP API endpoints
      if (path.startsWith('/api/')) {
        return await handleSGPRequest(request, env, path);
      }

      // Tool execution endpoints  
      if (path.startsWith('/tools/')) {
        return await handleToolRequest(request, env, path);
      }

      // 404 for unknown paths
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Endpoint not found',
        available_endpoints: ['/health', '/docs', '/tools', '/api/*', '/tools/*']
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      logger.error('Worker error', { error: error instanceof Error ? error.message : error });
      
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleSGPRequest(request: Request, env: WorkerEnv, path: string): Promise<Response> {
  try {
    // Extract authentication from headers or body
    const authHeader = request.headers.get('Authorization');
    const authMethod = request.headers.get('X-Auth-Method') || 'token';
    
    let credentials: AuthCredentials;
    
    // Parse authentication
    if (authMethod === 'basic' && authHeader?.startsWith('Basic ')) {
      const [username, password] = atob(authHeader.slice(6)).split(':');
      credentials = { method: 'basic', username, password };
    } else if (authMethod === 'token' && authHeader?.startsWith('Bearer ')) {
      credentials = { 
        method: 'token', 
        token: authHeader.slice(7),
        app: env.SGP_APP_NAME || 'sgp-worker'
      };
    } else if (authMethod === 'cpf_cnpj') {
      const body = await request.json() as any;
      credentials = {
        method: 'cpf_cnpj',
        cpfcnpj: body.cpfcnpj,
        senha: body.senha
      };
    } else {
      // Use environment variables as fallback
      credentials = {
        method: 'token',
        token: env.SGP_API_TOKEN || '',
        app: env.SGP_APP_NAME || 'sgp-worker'
      };
    }

    // Rate limiting
    const clientId = getClientId(request, credentials);
    const isAllowed = await checkRateLimit(clientId, credentials.method);
    
    if (!isAllowed) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Rate limit exceeded',
        retry_after: 60
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize SGP client
    const config: SGPConfig = {
      baseURL: env.SGP_BASE_URL || 'https://demo.sgp.net.br/api',
      username: credentials.method === 'basic' ? credentials.username : env.SGP_USERNAME,
      password: credentials.method === 'basic' ? credentials.password : env.SGP_PASSWORD,
      apiToken: credentials.method === 'token' ? credentials.token : env.SGP_API_TOKEN,
      appName: env.SGP_APP_NAME || 'sgp-worker',
      timeout: parseInt(env.SGP_TIMEOUT || '30000')
    };

    const sgpClient = new SGPClient(config);
    const sgpService = new SGPService(sgpClient);

    // Route to appropriate SGP method
    const result = await routeSGPRequest(sgpService, path, request, credentials);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logger.error('SGP request error', { error: error instanceof Error ? error.message : error });
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'SGP request failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleToolRequest(request: Request, env: WorkerEnv, path: string): Promise<Response> {
  try {
    const toolName = path.replace('/tools/', '');
    const body = request.method === 'POST' ? await request.json() : {};
    
    // Initialize SGP service with environment credentials
    const config: SGPConfig = {
      baseURL: env.SGP_BASE_URL || 'https://demo.sgp.net.br/api',
      username: env.SGP_USERNAME,
      password: env.SGP_PASSWORD,
      apiToken: env.SGP_API_TOKEN,
      appName: env.SGP_APP_NAME || 'sgp-worker',
      timeout: parseInt(env.SGP_TIMEOUT || '30000')
    };

    const sgpClient = new SGPClient(config);
    const sgpService = new SGPService(sgpClient);

    // Execute tool
    const result = await executeToolByName(sgpService, toolName, body);
    
    return new Response(JSON.stringify({
      status: 'success',
      tool: toolName,
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logger.error('Tool execution error', { error: error instanceof Error ? error.message : error });
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Tool execution failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function routeSGPRequest(sgpService: SGPService, path: string, request: Request, credentials: AuthCredentials): Promise<any> {
  const method = request.method;
  const body = method === 'POST' || method === 'PUT' ? await request.json() : {};
  
  // Map API paths to SGP service methods
  const pathMap: Record<string, string> = {
    '/api/contracts': 'getCustomerContracts',
    '/api/invoices': 'getCustomerInvoices', 
    '/api/onus': 'listONUs',
    '/api/olts': 'listOLTs',
    '/api/products': 'listProducts',
    '/api/tickets': 'getSupportTickets',
    '/api/network/status': 'getNetworkStatus'
  };

  const serviceMethod = pathMap[path];
  if (!serviceMethod) {
    throw new Error(`Unknown API path: ${path}`);
  }

  // Call SGP service method
  return await (sgpService as any)[serviceMethod](body);
}

async function executeToolByName(sgpService: SGPService, toolName: string, args: any): Promise<any> {
  // Map tool names to service methods
  const toolMap: Record<string, string> = {
    'get_customer_contracts': 'getCustomerContracts',
    'get_customer_invoices': 'getCustomerInvoices',
    'list_onus': 'listONUs',
    'get_onu_details': 'getONUDetails',
    'provision_onu': 'provisionONU',
    'list_products': 'listProducts',
    'create_support_ticket': 'createSupportTicket',
    'get_support_tickets': 'getSupportTickets'
  };

  const serviceMethod = toolMap[toolName];
  if (!serviceMethod) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  return await (sgpService as any)[serviceMethod](args);
}

function getClientId(request: Request, credentials: AuthCredentials): string {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const auth = credentials.method === 'cpf_cnpj' ? credentials.cpfcnpj : 
               credentials.method === 'token' ? credentials.token?.slice(-8) :
               credentials.username;
  return `${ip}:${auth}`;
}

async function checkRateLimit(clientId: string, method: string): Promise<boolean> {
  const limits = { basic: 100, token: 300, cpf_cnpj: 50 };
  const limit = limits[method as keyof typeof limits] || 100;
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  const current = rateLimits.get(clientId);
  
  if (!current || current.resetTime < now) {
    rateLimits.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

function getAvailableTools(): string[] {
  return [
    'get_customer_contracts',
    'get_customer_invoices',
    'list_onus',
    'get_onu_details', 
    'provision_onu',
    'list_products',
    'create_support_ticket',
    'get_support_tickets',
    'get_network_status'
  ];
}

function getAPIDocumentation(): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>SGP MCP Server API - Cloudflare Workers</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { font-weight: bold; color: #2196F3; }
        code { background: #e8e8e8; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>SGP MCP Server API</h1>
    <p>Public API for SGP (Sistema de Gestão para Provedores) integration via Cloudflare Workers</p>
    
    <h2>Available Endpoints</h2>
    
    <div class="endpoint">
        <span class="method">GET</span> <code>/health</code> - Health check
    </div>
    
    <div class="endpoint">
        <span class="method">GET</span> <code>/tools</code> - List available tools
    </div>
    
    <div class="endpoint">
        <span class="method">POST</span> <code>/tools/{tool_name}</code> - Execute specific tool
    </div>
    
    <div class="endpoint">
        <span class="method">GET/POST</span> <code>/api/{endpoint}</code> - Direct SGP API access
    </div>
    
    <h2>Authentication</h2>
    <p>Support for multiple authentication methods:</p>
    <ul>
        <li><strong>Token Auth:</strong> Authorization: Bearer {token}</li>
        <li><strong>Basic Auth:</strong> Authorization: Basic {credentials}</li>
        <li><strong>CPF/CNPJ Auth:</strong> Body parameters</li>
    </ul>
    
    <h2>Rate Limits</h2>
    <ul>
        <li>Basic Auth: 100 requests/minute</li>
        <li>Token Auth: 300 requests/minute</li>
        <li>CPF/CNPJ Auth: 50 requests/minute</li>
    </ul>
    
    <h2>Example Usage</h2>
    <pre>
// Get customer contracts
fetch('/tools/get_customer_contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        cpfcnpj: '12345678900',
        senha: 'password'
    })
});
    </pre>
    
    <p><strong>GitHub:</strong> <a href="https://github.com/thiagojbs/sgp-mcp-server">https://github.com/thiagojbs/sgp-mcp-server</a></p>
</body>
</html>
  `;
}