# Cloudflare Workers Deployment Guide

## Quick Deploy

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare
```bash
wrangler login
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Deploy to Cloudflare Workers
```bash
npm run deploy
```

## Your Public API URLs

After deployment, your SGP MCP Server will be available at:

- **Production URL**: `https://sgp-mcp-server.{your-subdomain}.workers.dev`
- **Health Check**: `https://sgp-mcp-server.{your-subdomain}.workers.dev/health`
- **API Documentation**: `https://sgp-mcp-server.{your-subdomain}.workers.dev/docs`
- **Available Tools**: `https://sgp-mcp-server.{your-subdomain}.workers.dev/tools`

## Configuration

### Environment Variables

Configure these secrets in Cloudflare Dashboard:

```bash
# Required for SGP API access
wrangler secret put SGP_USERNAME
wrangler secret put SGP_PASSWORD
wrangler secret put SGP_API_TOKEN
wrangler secret put SGP_APP_NAME
```

### KV Storage Setup

1. Create KV namespace for caching:
```bash
wrangler kv:namespace create "SGP_CACHE"
wrangler kv:namespace create "SGP_CACHE" --preview
```

2. Update `wrangler.toml` with the namespace IDs returned.

## API Usage Examples

### Health Check
```bash
curl https://sgp-mcp-server.{your-subdomain}.workers.dev/health
```

### List Available Tools
```bash
curl https://sgp-mcp-server.{your-subdomain}.workers.dev/tools
```

### Execute Tool (Customer Contracts)
```bash
curl -X POST https://sgp-mcp-server.{your-subdomain}.workers.dev/tools/get_customer_contracts \\
  -H "Content-Type: application/json" \\
  -d '{
    "cpfcnpj": "12345678900",
    "senha": "customer_password"
  }'
```

### Execute Tool (List ONUs) with Token Auth
```bash
curl -X POST https://sgp-mcp-server.{your-subdomain}.workers.dev/tools/list_onus \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "X-Auth-Method: token" \\
  -d '{
    "page": 1,
    "per_page": 20
  }'
```

### Direct API Access
```bash
curl -X GET https://sgp-mcp-server.{your-subdomain}.workers.dev/api/contracts \\
  -H "Authorization: Basic $(echo -n 'username:password' | base64)" \\
  -H "X-Auth-Method: basic"
```

## Authentication Methods

### 1. Token Authentication (Recommended)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     -H "X-Auth-Method: token"
```

### 2. Basic Authentication
```bash
curl -H "Authorization: Basic $(echo -n 'user:pass' | base64)" \\
     -H "X-Auth-Method: basic"
```

### 3. CPF/CNPJ Authentication
```bash
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "X-Auth-Method: cpf_cnpj" \\
  -d '{"cpfcnpj": "12345678900", "senha": "password"}'
```

## Rate Limits

- **Basic Auth**: 100 requests/minute
- **Token Auth**: 300 requests/minute
- **CPF/CNPJ Auth**: 50 requests/minute

## Available Tools

### Core Customer Management
- `get_customer_contracts` - Get customer contracts
- `get_customer_invoices` - Get customer invoices
- `create_support_ticket` - Create support ticket
- `get_support_tickets` - List support tickets

### Network Management
- `list_onus` - List ONU devices
- `get_onu_details` - Get ONU details
- `provision_onu` - Provision ONU device
- `get_network_status` - Network health status

### Inventory Management
- `list_products` - List products
- `get_product_details` - Product information

## Monitoring

### Check Deployment Status
```bash
wrangler whoami
wrangler deployments list
```

### View Logs
```bash
wrangler tail
```

### Analytics
View analytics in Cloudflare Dashboard → Workers & Pages → sgp-mcp-server

## Custom Domain (Optional)

1. Add your domain to Cloudflare
2. Configure Worker route:
```bash
wrangler route add "api.yourdomain.com/*" sgp-mcp-server
```

## Security Features

- ✅ **CORS Enabled**: Cross-origin requests allowed
- ✅ **Rate Limiting**: Per-client and per-method limits
- ✅ **Input Validation**: All parameters validated
- ✅ **Error Sanitization**: No sensitive data in responses
- ✅ **Environment Isolation**: Secrets stored securely

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check `wrangler.toml` configuration
2. **Authentication errors**: Verify secrets are set correctly
3. **Rate limits**: Check client IP and authentication method
4. **CORS errors**: Ensure proper headers are included

### Debug Commands
```bash
# Test locally
npm run dev:worker

# Check configuration
wrangler whoami
wrangler secret list

# View logs
wrangler tail --format pretty
```

## Support

- **GitHub**: https://github.com/thiagojbs/sgp-mcp-server
- **Documentation**: Visit deployed `/docs` endpoint
- **Issues**: Create issue on GitHub repository

---

**Note**: This deployment makes your SGP MCP Server publicly accessible. Ensure proper authentication and rate limiting are configured before sharing the URL.