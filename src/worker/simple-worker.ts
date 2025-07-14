/**
 * Simplified Cloudflare Worker for SGP MCP Server
 * Lightweight version for public API access
 */

// CORS headers for public API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Method',
  'Access-Control-Max-Age': '86400',
};

// Rate limiting storage (in-memory for simplicity)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export default {
  async fetch(request: Request, env: any): Promise<Response> {
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
          total: getAvailableTools().length,
          description: 'SGP MCP Server API Tools',
          authentication: {
            methods: ['basic', 'token', 'cpf_cnpj'],
            rate_limits: {
              basic: '100 req/min',
              token: '300 req/min', 
              cpf_cnpj: '50 req/min'
            }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // SGP API proxy endpoints
      if (path.startsWith('/api/')) {
        return await handleSGPProxyRequest(request, env, path);
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
      console.error('Worker error:', error);
      
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

async function handleSGPProxyRequest(request: Request, env: any, path: string): Promise<Response> {
  try {
    // Extract authentication
    const authHeader = request.headers.get('Authorization');
    const authMethod = request.headers.get('X-Auth-Method') || 'token';
    
    // Rate limiting
    const clientId = getClientId(request, authMethod);
    const isAllowed = await checkRateLimit(clientId, authMethod);
    
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

    // Build SGP API URL
    const sgpBaseURL = env.SGP_BASE_URL || 'https://demo.sgp.net.br/api';
    const sgpPath = path.replace('/api/', '');
    const sgpURL = `${sgpBaseURL}/${sgpPath}`;

    // Prepare headers for SGP request
    const sgpHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'SGP-MCP-Worker/2.0.0'
    };

    // Add authentication header
    if (authMethod === 'basic' && authHeader?.startsWith('Basic ')) {
      sgpHeaders['Authorization'] = authHeader;
    } else if (authMethod === 'token' && authHeader?.startsWith('Bearer ')) {
      sgpHeaders['Authorization'] = authHeader;
    } else if (env.SGP_API_TOKEN) {
      sgpHeaders['Authorization'] = `Bearer ${env.SGP_API_TOKEN}`;
    }

    // Forward request to SGP API
    const sgpRequest = new Request(sgpURL, {
      method: request.method,
      headers: sgpHeaders,
      body: request.method === 'GET' ? null : await request.text()
    });

    const sgpResponse = await fetch(sgpRequest);
    const sgpData = await sgpResponse.text();

    return new Response(sgpData, {
      status: sgpResponse.status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-SGP-Status': sgpResponse.status.toString()
      }
    });

  } catch (error) {
    console.error('SGP proxy error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'SGP API request failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleToolRequest(request: Request, env: any, path: string): Promise<Response> {
  try {
    const toolName = path.replace('/tools/', '');
    
    // Check if tool exists
    const availableTools = getAvailableTools();
    if (!availableTools.includes(toolName)) {
      return new Response(JSON.stringify({
        status: 'error',
        message: `Tool '${toolName}' not found`,
        available_tools: availableTools
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting
    const clientId = getClientId(request, 'tool');
    const isAllowed = await checkRateLimit(clientId, 'token');
    
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

    // Map tool to SGP endpoint
    const toolEndpointMap: Record<string, string> = {
      'get_customer_contracts': 'contratos',
      'get_customer_invoices': 'faturas',
      'list_onus': 'onus',
      'get_onu_details': 'onus/detalhes',
      'provision_onu': 'onus/provisionar',
      'list_products': 'produtos',
      'create_support_ticket': 'tickets',
      'get_support_tickets': 'tickets',
      'get_network_status': 'rede/status'
    };

    const sgpEndpoint = toolEndpointMap[toolName];
    if (!sgpEndpoint) {
      return new Response(JSON.stringify({
        status: 'error',
        message: `Tool '${toolName}' not implemented`,
        note: 'This is a simplified proxy. Use the full MCP server for complete functionality.'
      }), {
        status: 501,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Proxy to SGP API
    const sgpBaseURL = env.SGP_BASE_URL || 'https://demo.sgp.net.br/api';
    const sgpURL = `${sgpBaseURL}/${sgpEndpoint}`;
    
    const sgpHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'SGP-MCP-Worker/2.0.0'
    };

    if (env.SGP_API_TOKEN) {
      sgpHeaders['Authorization'] = `Bearer ${env.SGP_API_TOKEN}`;
    }

    const sgpResponse = await fetch(sgpURL, {
      method: request.method === 'GET' ? 'GET' : 'POST',
      headers: sgpHeaders,
      body: request.method === 'GET' ? null : await request.text()
    });

    const sgpData = await sgpResponse.text();

    return new Response(JSON.stringify({
      status: 'success',
      tool: toolName,
      data: JSON.parse(sgpData)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Tool execution error:', error);
    
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

function getClientId(request: Request, method: string): string {
  const ip = request.headers.get('CF-Connecting-IP') || 
            request.headers.get('X-Forwarded-For') || 
            'unknown';
  return `${ip}:${method}`;
}

async function checkRateLimit(clientId: string, method: string): Promise<boolean> {
  const limits = { basic: 100, token: 300, cpf_cnpj: 50, tool: 100 };
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
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .method { font-weight: bold; color: #007bff; background: #e3f2fd; padding: 4px 8px; border-radius: 3px; }
        code { background: #e8e8e8; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .badge { background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 SGP MCP Server API</h1>
        <p><span class="badge">v2.0.0</span> Public API for SGP (Sistema de Gestão para Provedores) integration via Cloudflare Workers</p>
        
        <div class="warning">
            <strong>⚡ Live Public API:</strong> This is a live, public API endpoint. Use responsibly and respect rate limits.
        </div>
        
        <h2>📋 Available Endpoints</h2>
        
        <div class="endpoint">
            <span class="method">GET</span> <code>/health</code> - Health check and system status
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span> <code>/tools</code> - List all available tools and capabilities
        </div>
        
        <div class="endpoint">
            <span class="method">POST</span> <code>/tools/{tool_name}</code> - Execute specific SGP tool
        </div>
        
        <div class="endpoint">
            <span class="method">GET/POST</span> <code>/api/{endpoint}</code> - Direct SGP API proxy access
        </div>
        
        <h2>🔐 Authentication Methods</h2>
        <p>Choose the authentication method that fits your use case:</p>
        
        <h3>1. Token Authentication (Recommended)</h3>
        <pre>Authorization: Bearer YOUR_API_TOKEN
X-Auth-Method: token</pre>
        
        <h3>2. Basic Authentication</h3>
        <pre>Authorization: Basic base64(username:password)
X-Auth-Method: basic</pre>
        
        <h3>3. CPF/CNPJ Customer Authentication</h3>
        <pre>X-Auth-Method: cpf_cnpj
Body: {"cpfcnpj": "12345678900", "senha": "password"}</pre>
        
        <h2>⚡ Rate Limits</h2>
        <ul>
            <li><strong>Basic Auth:</strong> 100 requests/minute</li>
            <li><strong>Token Auth:</strong> 300 requests/minute</li>
            <li><strong>CPF/CNPJ Auth:</strong> 50 requests/minute</li>
        </ul>
        
        <h2>🛠️ Available Tools</h2>
        <ul>
            <li><code>get_customer_contracts</code> - Retrieve customer contracts</li>
            <li><code>get_customer_invoices</code> - Get customer invoices</li>
            <li><code>list_onus</code> - List ONU devices</li>
            <li><code>get_onu_details</code> - Get ONU device details</li>
            <li><code>provision_onu</code> - Provision ONU device</li>
            <li><code>list_products</code> - Product catalog</li>
            <li><code>create_support_ticket</code> - Create support ticket</li>
            <li><code>get_support_tickets</code> - List support tickets</li>
            <li><code>get_network_status</code> - Network status</li>
        </ul>
        
        <h2>📖 Usage Examples</h2>
        
        <h3>Get Customer Contracts</h3>
        <pre>
curl -X POST \\
  '${new URL(window.location).origin}/tools/get_customer_contracts' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Auth-Method: cpf_cnpj' \\
  -d '{
    "cpfcnpj": "12345678900",
    "senha": "customer_password"
  }'</pre>
        
        <h3>List ONUs with Token Auth</h3>
        <pre>
curl -X POST \\
  '${new URL(window.location).origin}/tools/list_onus' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_TOKEN' \\
  -H 'X-Auth-Method: token' \\
  -d '{
    "page": 1,
    "per_page": 20
  }'</pre>
        
        <h3>Check System Health</h3>
        <pre>
curl '${new URL(window.location).origin}/health'</pre>
        
        <h2>🌐 Integration Options</h2>
        <p>This API can be integrated with:</p>
        <ul>
            <li><strong>AI Applications:</strong> Claude, ChatGPT, and other LLMs via MCP protocol</li>
            <li><strong>Web Applications:</strong> Direct HTTP API calls</li>
            <li><strong>Mobile Apps:</strong> RESTful API integration</li>
            <li><strong>Automation Tools:</strong> Zapier, IFTTT, custom scripts</li>
        </ul>
        
        <h2>📚 Resources</h2>
        <ul>
            <li><strong>GitHub Repository:</strong> <a href="https://github.com/thiagojbs/sgp-mcp-server">https://github.com/thiagojbs/sgp-mcp-server</a></li>
            <li><strong>Full Documentation:</strong> See repository README</li>
            <li><strong>MCP Protocol:</strong> <a href="https://modelcontextprotocol.io">https://modelcontextprotocol.io</a></li>
            <li><strong>Support:</strong> Create issues on GitHub</li>
        </ul>
        
        <hr>
        <p><small>Powered by Cloudflare Workers • Built for the SGP community • Open Source</small></p>
    </div>
</body>
</html>
  `;
}