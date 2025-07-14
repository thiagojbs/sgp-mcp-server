# Multi-Tenant SGP MCP Server

## Overview

O SGP MCP Server agora suporta **multi-tenancy**, permitindo que diferentes clientes usem o mesmo servidor com suas próprias credenciais SGP (URL, APP e Token). Cada cliente é isolado e tem acesso apenas aos seus próprios dados.

## Configuração Multi-Cliente

### Método 1: Headers HTTP (Recomendado)

Cada cliente pode passar suas credenciais específicas através de headers HTTP:

```bash
curl -X POST 'https://sgp-mcp-server.thiagojbs.workers.dev/mcp' \
  -H 'Content-Type: application/json' \
  -H 'X-SGP-URL: https://cliente1.sgp.com.br/api' \
  -H 'X-SGP-APP: cliente1_app' \
  -H 'X-SGP-TOKEN: cliente1_token_aqui' \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "sgp_get_customer_contracts",
      "arguments": {
        "cpfcnpj": "12345678900",
        "senha": "senha_cliente"
      }
    }
  }'
```

### Método 2: Configuração por Ambiente

Para clientes com acesso dedicado, configure variáveis de ambiente:

```bash
# Cliente padrão
SGP_BASE_URL=https://cliente1.sgp.com.br/api
SGP_APP_NAME=cliente1_app
SGP_API_TOKEN=cliente1_token
```

## Headers Multi-Tenant

| Header | Descrição | Exemplo |
|--------|-----------|---------|
| `X-SGP-URL` | URL base da API SGP do cliente | `https://cliente1.sgp.com.br/api` |
| `X-SGP-APP` | Nome da aplicação SGP | `cliente1_app` |
| `X-SGP-TOKEN` | Token de acesso do cliente | `abc123def456` |

## Integração com MCP Clients

### MCP Client Desktop - Multi-Cliente

```json
{
  "mcpServers": {
    "sgp-cliente1": {
      "transport": "http",
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp",
      "headers": {
        "Content-Type": "application/json",
        "X-SGP-URL": "https://cliente1.sgp.com.br/api",
        "X-SGP-APP": "cliente1_app",
        "X-SGP-TOKEN": "cliente1_token"
      }
    },
    "sgp-cliente2": {
      "transport": "http", 
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp",
      "headers": {
        "Content-Type": "application/json",
        "X-SGP-URL": "https://cliente2.sgp.com.br/api",
        "X-SGP-APP": "cliente2_app", 
        "X-SGP-TOKEN": "cliente2_token"
      }
    }
  }
}
```

### Python Client - Multi-Tenant

```python
import asyncio
import aiohttp
import json

class MultiTenantSGPClient:
    def __init__(self, base_url="https://sgp-mcp-server.thiagojbs.workers.dev"):
        self.base_url = base_url
        self.session = None
    
    async def call_tool_for_tenant(self, tenant_config, tool_name, arguments):
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        headers = {
            'Content-Type': 'application/json',
            'X-SGP-URL': tenant_config['url'],
            'X-SGP-APP': tenant_config['app'],
            'X-SGP-TOKEN': tenant_config['token']
        }
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": arguments}
        }
        
        async with self.session.post(f"{self.base_url}/mcp", 
                                   headers=headers, 
                                   json=payload) as response:
            return await response.json()

# Configuração de clientes
tenants = {
    'cliente1': {
        'url': 'https://cliente1.sgp.com.br/api',
        'app': 'cliente1_app',
        'token': 'cliente1_token'
    },
    'cliente2': {
        'url': 'https://cliente2.sgp.com.br/api', 
        'app': 'cliente2_app',
        'token': 'cliente2_token'
    }
}

# Uso
async def main():
    client = MultiTenantSGPClient()
    
    # Buscar contratos do cliente 1
    result1 = await client.call_tool_for_tenant(
        tenants['cliente1'],
        "sgp_get_customer_contracts",
        {"cpfcnpj": "12345678900", "senha": "senha"}
    )
    
    # Buscar ONUs do cliente 2
    result2 = await client.call_tool_for_tenant(
        tenants['cliente2'],
        "sgp_list_onus",
        {"page": 1, "per_page": 10}
    )
    
    print("Cliente 1:", result1)
    print("Cliente 2:", result2)

asyncio.run(main())
```

### JavaScript/Node.js - Multi-Tenant

```javascript
class MultiTenantSGPClient {
  constructor(baseUrl = 'https://sgp-mcp-server.thiagojbs.workers.dev') {
    this.baseUrl = baseUrl;
  }

  async callToolForTenant(tenantConfig, toolName, arguments) {
    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SGP-URL': tenantConfig.url,
        'X-SGP-APP': tenantConfig.app,
        'X-SGP-TOKEN': tenantConfig.token
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments }
      })
    });
    return await response.json();
  }
}

// Configuração de clientes
const tenants = {
  cliente1: {
    url: 'https://cliente1.sgp.com.br/api',
    app: 'cliente1_app',
    token: 'cliente1_token'
  },
  cliente2: {
    url: 'https://cliente2.sgp.com.br/api',
    app: 'cliente2_app', 
    token: 'cliente2_token'
  }
};

// Uso
const client = new MultiTenantSGPClient();

// Buscar dados de diferentes clientes
Promise.all([
  client.callToolForTenant(tenants.cliente1, 'sgp_test_connection', {}),
  client.callToolForTenant(tenants.cliente2, 'sgp_test_connection', {})
]).then(results => {
  console.log('Cliente 1 Status:', results[0]);
  console.log('Cliente 2 Status:', results[1]);
});
```

## Isolamento de Dados

### Cache por Tenant

O servidor mantém cache separado para cada combinação de:
- URL base SGP
- Nome da aplicação 
- Token de acesso

```typescript
// Chave única por tenant
const tenantKey = `${baseURL}:${appName}:${apiToken}`;
```

### Segurança

- **Isolamento Completo**: Cada cliente acessa apenas seus próprios dados
- **Cache Isolado**: Dados não são compartilhados entre clientes
- **Headers Seguros**: Credenciais passadas via headers HTTPS
- **Validação**: Todas as credenciais são validadas antes do uso

## Configuração de Produção

### Cloudflare Workers

```bash
# Deploy com suporte multi-tenant
wrangler deploy

# Configurar CORS para headers multi-tenant
wrangler kv:namespace create "SGP_TENANT_CACHE"
```

### Variáveis de Ambiente

```bash
# Cliente padrão (fallback)
SGP_BASE_URL=https://demo.sgp.net.br/api
SGP_APP_NAME=sgp-remote-mcp
SGP_API_TOKEN=default_token

# Timeout global
SGP_TIMEOUT=30000
```

## Monitoramento Multi-Tenant

### Logs por Cliente

```javascript
// Logs incluem identificador do tenant
console.log(`[${tenantKey}] SGP Request: POST ${url}`);
console.log(`[${tenantKey}] SGP Response: ${response.status}`);
```

### Métricas

- Requests por tenant
- Latência por cliente
- Cache hit rate por tenant
- Erros por configuração

## Limitações e Considerações

### Rate Limits

Cada tenant tem seus próprios rate limits baseados em suas credenciais SGP:
- Tenant com token: 300 req/min
- Tenant com CPF/CNPJ: 50 req/min

### Cache Management

- Cache é mantido em memória durante execução
- Cleanup automático de tenants inativos
- Limite de 100 tenants em cache simultâneo

### Segurança

- Headers HTTPS obrigatório em produção
- Validação de credenciais por tenant
- Logs não devem expor tokens
- Timeout por operação

## Exemplo Completo

### Teste Multi-Tenant

```bash
#!/bin/bash

# Função para testar um cliente
test_tenant() {
  local name=$1
  local url=$2
  local app=$3
  local token=$4
  
  echo "Testando $name..."
  
  curl -s -X POST 'https://sgp-mcp-server.thiagojbs.workers.dev/mcp' \
    -H 'Content-Type: application/json' \
    -H "X-SGP-URL: $url" \
    -H "X-SGP-APP: $app" \
    -H "X-SGP-TOKEN: $token" \
    -d '{
      "jsonrpc": "2.0",
      "id": 1,
      "method": "tools/call",
      "params": {
        "name": "sgp_test_connection",
        "arguments": {}
      }
    }' | jq '.result'
}

# Testar múltiplos clientes
test_tenant "Cliente 1" "https://cliente1.sgp.com.br/api" "app1" "token1"
test_tenant "Cliente 2" "https://cliente2.sgp.com.br/api" "app2" "token2"
test_tenant "Cliente 3" "https://cliente3.sgp.com.br/api" "app3" "token3"
```

## Migração

### De Single-Tenant para Multi-Tenant

1. **Backward Compatibility**: Clientes existentes continuam funcionando
2. **Gradual Migration**: Adicione headers conforme necessário
3. **Fallback**: Usa configuração padrão se headers não fornecidos

### Configuração Existente

```json
// Antes (single-tenant)
{
  "mcpServers": {
    "sgp": {
      "transport": "http",
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp"
    }
  }
}

// Depois (multi-tenant)
{
  "mcpServers": {
    "sgp": {
      "transport": "http",
      "url": "https://sgp-mcp-server.thiagojbs.workers.dev/mcp",
      "headers": {
        "X-SGP-URL": "https://meu-cliente.sgp.com.br/api",
        "X-SGP-APP": "meu_app",
        "X-SGP-TOKEN": "meu_token"
      }
    }
  }
}
```

O servidor SGP MCP agora suporta completamente múltiplos clientes, mantendo isolamento total de dados e configurações personalizadas por tenant.