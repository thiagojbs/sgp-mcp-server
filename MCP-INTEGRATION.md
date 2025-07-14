# Remote MCP Server Integration Guide

## Overview

This SGP MCP Server implements the **Model Context Protocol (MCP)** via HTTP/SSE, making it compatible with automated systems and applications that support remote MCP servers.

**Live Remote MCP Server:** https://sgp-mcp-server.thiagojbs.workers.dev

## Quick Integration

### MCP Desktop Integration

Add to your MCP Desktop configuration:

```json
{
  "mcpServers": {
    "sgp": {
      "transport": "http",
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### Custom MCP Application Integration

```javascript
// Example MCP client integration
const mcpClient = {
  async callTool(name, arguments) {
    const response = await fetch('https://sgp-mcp-server.thiagojbs.workers.dev/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name, arguments }
      })
    });
    return await response.json();
  }
};

// Example usage
const contracts = await mcpClient.callTool('sgp_get_customer_contracts', {
  cpfcnpj: '12345678900',
  senha: 'password'
});
```

## Available MCP Methods

### Core Protocol Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `initialize` | Initialize MCP session | `{ protocolVersion, capabilities, clientInfo }` |
| `tools/list` | List all available tools | None |
| `tools/call` | Execute a specific tool | `{ name, arguments }` |
| `resources/list` | List available resources | None |
| `resources/read` | Read resource content | `{ uri }` |
| `prompts/list` | List prompt templates | None |
| `prompts/get` | Get prompt content | `{ name, arguments }` |

### SGP Tools Available via MCP

#### Customer Management
- `sgp_get_customer_contracts` - Get customer contracts
- `sgp_get_customer_invoices` - Get customer invoices  
- `sgp_create_support_ticket` - Create support tickets

#### Network Management
- `sgp_list_onus` - List ONU devices
- `sgp_get_onu_details` - Get ONU details
- `sgp_provision_onu` - Provision ONU devices
- `sgp_get_network_status` - Network health status

#### Product Catalog
- `sgp_list_products` - List available products

## Real-time Events (SSE)

Connect to the Server-Sent Events endpoint for real-time updates:

```javascript
const eventSource = new EventSource('https://sgp-mcp-server.thiagojbs.workers.dev/mcp/sse');

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('MCP Event:', data);
};
```

## Testing with MCP Inspector

1. **Local Development:**
   ```bash
   npm run dev:worker
   # Server available at http://localhost:8787
   ```

2. **Use MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:8787/mcp
   ```

3. **Test Production:**
   ```bash
   npx @modelcontextprotocol/inspector https://sgp-mcp-server.thiagojbs.workers.dev/mcp
   ```

## Example MCP Requests

### Initialize Session
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "clientInfo": {
      "name": "MyMCPClient",
      "version": "1.0.0"
    }
  }
}
```

### List Available Tools
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

### Execute Tool
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "sgp_get_customer_contracts",
    "arguments": {
      "cpfcnpj": "12345678900",
      "senha": "customer_password"
    }
  }
}
```

### Get Resources
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/list"
}
```

### Read Resource
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "resources/read",
  "params": {
    "uri": "sgp://api/documentation"
  }
}
```

## MCP Client Prompts

The server includes pre-built prompts for common automation scenarios:

### Customer Support Prompt
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "prompts/get",
  "params": {
    "name": "sgp_customer_support",
    "arguments": {
      "customer_id": "12345678900",
      "issue_type": "internet_connectivity"
    }
  }
}
```

### Network Analysis Prompt
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "prompts/get",
  "params": {
    "name": "sgp_network_analysis",
    "arguments": {
      "region": "south"
    }
  }
}
```

## Authentication

The Remote MCP Server uses the same authentication methods as the SGP API:

### Environment-based (Recommended)
Configure credentials in Cloudflare Workers environment variables:
- `SGP_API_TOKEN` - API token for server-wide access
- `SGP_USERNAME` / `SGP_PASSWORD` - Basic auth credentials

### Request-based
Pass authentication in tool arguments:
```json
{
  "name": "sgp_get_customer_contracts",
  "arguments": {
    "cpfcnpj": "customer_cpf",
    "senha": "customer_password"
  }
}
```

## Error Handling

MCP errors follow JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found: invalid_method"
  }
}
```

Common error codes:
- `-32600` - Invalid Request
- `-32601` - Method not found
- `-32602` - Invalid params
- `-32603` - Internal error

## Performance & Limits

- **Response Time:** < 100ms average (Cloudflare Edge)
- **Rate Limits:** Same as SGP API (100/300/50 req/min by auth method)
- **Global Availability:** 200+ edge locations worldwide
- **Uptime:** 99.9%+ (Cloudflare SLA)

## Integration Examples

### Python MCP Client
```python
import asyncio
import aiohttp
import json

class SGPMCPClient:
    def __init__(self, base_url="https://sgp-mcp-server.thiagojbs.workers.dev"):
        self.base_url = base_url
        self.session = None
    
    async def call_tool(self, name, arguments):
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments}
        }
        
        async with self.session.post(f"{self.base_url}/mcp", json=payload) as response:
            return await response.json()

# Usage
async def main():
    client = SGPMCPClient()
    result = await client.call_tool("sgp_get_customer_contracts", {
        "cpfcnpj": "12345678900",
        "senha": "password"
    })
    print(result)

asyncio.run(main())
```

### Node.js Integration
```javascript
const fetch = require('node-fetch');

class SGPMCPClient {
  constructor(baseUrl = 'https://sgp-mcp-server.thiagojbs.workers.dev') {
    this.baseUrl = baseUrl;
  }

  async callTool(name, arguments) {
    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name, arguments }
      })
    });
    return await response.json();
  }
}

// Usage
const client = new SGPMCPClient();
client.callTool('sgp_list_onus', { page: 1, per_page: 20 })
  .then(result => console.log(result));
```

## Support & Resources

- **MCP Protocol:** https://modelcontextprotocol.io
- **GitHub Repository:** https://github.com/thiagojbs/sgp-mcp-server
- **Live Documentation:** https://sgp-mcp-server.thiagojbs.workers.dev/docs
- **API Health:** https://sgp-mcp-server.thiagojbs.workers.dev/health

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test with MCP Inspector
4. Submit pull request

The Remote MCP Server enables seamless integration of SGP functionality into any automated system or application that supports the Model Context Protocol.