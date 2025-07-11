// Cloudflare Workers implementation for SGP MCP Server
// This allows hosting the HTTP API on Cloudflare's edge network

// Simple in-memory cache for Cloudflare Workers
class WorkerCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }
}

// Rate limiter for Cloudflare Workers
class WorkerRateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 60000; // 1 minute
  }

  checkLimit(key, maxRequests = 100) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const timestamps = this.requests.get(key).filter(ts => ts > windowStart);
    
    if (timestamps.length >= maxRequests) {
      return false;
    }
    
    timestamps.push(now);
    this.requests.set(key, timestamps);
    return true;
  }
}

// SGP API client for Cloudflare Workers
class SGPWorkerClient {
  constructor(config) {
    this.config = config;
    this.cache = new WorkerCache();
    this.rateLimiter = new WorkerRateLimiter();
  }

  async makeRequest(method, endpoint, data = null, options = {}) {
    const { useCache = false, cacheKey } = options;
    
    // Check cache first
    if (useCache && cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Rate limiting
    if (!this.rateLimiter.checkLimit('default', 300)) {
      throw new Error('Rate limit exceeded');
    }

    const url = `${this.config.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'SGP-MCP-Worker/1.0.0'
    };

    // Add authentication
    if (this.config.apiToken) {
      // Token auth uses query parameters
      const urlObj = new URL(url);
      urlObj.searchParams.append('token', this.config.apiToken);
      urlObj.searchParams.append('app', this.config.appName || 'sgp-mcp-worker');
      
      const response = await fetch(urlObj.toString(), {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
      });
      
      const result = await response.json();
      
      // Cache successful responses
      if (useCache && cacheKey && result.status === 'success') {
        this.cache.set(cacheKey, result);
      }
      
      return result;
    } else if (this.config.username && this.config.password) {
      // Basic auth
      const basicAuth = btoa(`${this.config.username}:${this.config.password}`);
      headers['Authorization'] = `Basic ${basicAuth}`;
      
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
      });
      
      const result = await response.json();
      
      if (useCache && cacheKey && result.status === 'success') {
        this.cache.set(cacheKey, result);
      }
      
      return result;
    } else {
      throw new Error('No authentication method configured');
    }
  }
}

// Main worker event handler
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize SGP client
    const config = {
      baseURL: SGP_BASE_URL || 'https://demo.sgp.net.br/api',
      username: SGP_USERNAME,
      password: SGP_PASSWORD,
      apiToken: SGP_API_TOKEN,
      appName: SGP_APP_NAME || 'sgp-mcp-worker',
      timeout: 30000
    };

    const sgpClient = new SGPWorkerClient(config);

    // Route handling
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        name: 'SGP MCP Server (Cloudflare Worker)',
        version: '1.0.0',
        description: 'MCP Server for SGP API integration on Cloudflare Workers',
        endpoints: {
          health: '/health',
          tools: '/mcp/tools/:toolName',
          docs: '/docs'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        worker: true,
        version: '1.0.0'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/docs') {
      return new Response(JSON.stringify({
        title: 'SGP MCP Server API Documentation (Cloudflare Worker)',
        version: '1.0.0',
        description: 'HTTP API for SGP MCP Server tools on Cloudflare Workers',
        base_url: url.origin,
        available_tools: [
          'get_customer_contracts', 'get_contract_details', 'get_customer_invoices',
          'get_invoice_details', 'generate_second_copy', 'create_support_ticket',
          'get_support_tickets', 'list_onus', 'get_onu_details', 'provision_onu',
          'deprovision_onu', 'restart_onu', 'get_onu_status', 'list_olts',
          'list_products', 'get_network_status', 'generate_invoice_batch',
          'process_return_file'
        ],
        usage: {
          example: `curl -X POST ${url.origin}/mcp/tools/get_customer_contracts -H "Content-Type: application/json" -d '{"cpfcnpj":"12345678900","senha":"password"}'`
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle tool execution
    const toolMatch = url.pathname.match(/^\\/mcp\\/tools\\/(.+)$/);
    if (toolMatch && request.method === 'POST') {
      const toolName = toolMatch[1];
      const args = await request.json();

      let result;
      switch (toolName) {
        case 'get_customer_contracts':
          result = await sgpClient.makeRequest('POST', '/central/contratos', {
            cpfcnpj: args.cpfcnpj,
            senha: args.senha
          });
          break;

        case 'get_contract_details':
          result = await sgpClient.makeRequest('POST', `/central/contratos/${args.contrato_id}`, {
            cpfcnpj: args.cpfcnpj,
            senha: args.senha
          });
          break;

        case 'get_customer_invoices':
          result = await sgpClient.makeRequest('POST', '/central/faturas', {
            cpfcnpj: args.cpfcnpj,
            senha: args.senha
          });
          break;

        case 'list_onus':
          const onuEndpoint = args.page || args.per_page 
            ? `/ftth/onus?page=${args.page || 1}&per_page=${args.per_page || 20}`
            : '/ftth/onus';
          result = await sgpClient.makeRequest('GET', onuEndpoint, null, {
            useCache: true,
            cacheKey: `onus_${args.page || 1}_${args.per_page || 20}`
          });
          break;

        case 'get_onu_details':
          result = await sgpClient.makeRequest('GET', `/ftth/onus/${args.onu_id}`, null, {
            useCache: true,
            cacheKey: `onu_${args.onu_id}`
          });
          break;

        case 'get_network_status':
          result = await sgpClient.makeRequest('GET', '/ftth/status', null, {
            useCache: true,
            cacheKey: 'network_status'
          });
          break;

        case 'create_support_ticket':
          result = await sgpClient.makeRequest('POST', '/central/chamados/abrir', {
            cpfcnpj: args.cpfcnpj,
            senha: args.senha,
            assunto: args.assunto,
            descricao: args.descricao,
            categoria_id: args.categoria_id,
            prioridade_id: args.prioridade_id
          });
          break;

        default:
          return new Response(JSON.stringify({
            error: 'Tool not found',
            available_tools: [
              'get_customer_contracts', 'get_contract_details', 'get_customer_invoices',
              'list_onus', 'get_onu_details', 'get_network_status', 'create_support_ticket'
            ]
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({
      error: 'Not found',
      message: `Route ${request.method} ${url.pathname} not found`,
      available_endpoints: ['/', '/health', '/mcp/tools/:toolName', '/docs']
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}