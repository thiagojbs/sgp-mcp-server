# Cloudflare Workers Deployment

This directory contains the Cloudflare Workers implementation of the SGP MCP Server, allowing you to host the HTTP API on Cloudflare's global edge network.

## Features

- ⚡ **Global Edge Deployment**: Deploy to 200+ locations worldwide
- 🚀 **Fast Cold Starts**: Sub-millisecond response times
- 🛡️ **Built-in DDoS Protection**: Cloudflare's security by default
- 💰 **Cost Effective**: Generous free tier, pay-per-request pricing
- 🔄 **Auto Scaling**: Handles traffic spikes automatically

## Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

```bash
npm install -g wrangler
```

## Quick Start

### 1. Authentication

Login to Cloudflare:
```bash
wrangler login
```

### 2. Configure Secrets

Set your SGP API credentials as Cloudflare secrets:

```bash
# Set SGP API base URL
wrangler secret put SGP_BASE_URL
# Enter: https://demo.sgp.net.br/api

# Option 1: Token Authentication (recommended)
wrangler secret put SGP_API_TOKEN
# Enter your SGP API token

# Option 2: Basic Authentication
wrangler secret put SGP_USERNAME
# Enter your SGP username
wrangler secret put SGP_PASSWORD
# Enter your SGP password
```

### 3. Deploy

Deploy to Cloudflare Workers:

```bash
# Deploy to development
wrangler deploy --env development

# Deploy to production
wrangler deploy --env production
```

### 4. Test

Test your deployed worker:

```bash
# Get worker URL
wrangler tail

# Test health endpoint
curl https://sgp-mcp-server.your-subdomain.workers.dev/health

# Test API
curl -X POST https://sgp-mcp-server.your-subdomain.workers.dev/mcp/tools/list_onus \\
  -H "Content-Type: application/json" \\
  -d '{"page": 1, "per_page": 5}'
```

## Configuration

### Environment Variables

Edit `wrangler.toml` to configure:

```toml
[vars]
SGP_APP_NAME = "your-app-name"
```

### Custom Domain

To use a custom domain, add to `wrangler.toml`:

```toml
[[env.production.routes]]
pattern = "api.your-domain.com/*"
zone_name = "your-domain.com"
```

Then update DNS:
```
api.your-domain.com CNAME sgp-mcp-server.your-subdomain.workers.dev
```

## Available Endpoints

Once deployed, your worker will provide:

- `GET /` - API information
- `GET /health` - Health check
- `GET /docs` - API documentation
- `POST /mcp/tools/:toolName` - Execute MCP tools

### Supported Tools

- `get_customer_contracts`
- `get_contract_details`
- `get_customer_invoices`
- `get_invoice_details`
- `generate_second_copy`
- `create_support_ticket`
- `get_support_tickets`
- `list_onus`
- `get_onu_details`
- `provision_onu`
- `deprovision_onu`
- `restart_onu`
- `get_onu_status`
- `list_olts`
- `list_products`
- `get_network_status`
- `generate_invoice_batch`
- `process_return_file`

## Development

### Local Development

Run locally with Wrangler:

```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`

### Environment Management

```bash
# Development environment
wrangler dev --env development

# Production environment  
wrangler deploy --env production
```

### View Logs

```bash
# Tail logs in real-time
wrangler tail

# Tail production logs
wrangler tail --env production
```

## Performance Optimization

### Caching Strategy

The worker implements intelligent caching:
- Cache TTL: 5 minutes
- Cached endpoints: ONUs, OLTs, Network Status
- Cache invalidation on errors

### Rate Limiting

Built-in rate limiting:
- 300 requests per minute per IP
- Automatic backoff on limits
- Error responses for exceeded limits

## Monitoring

### Cloudflare Analytics

Monitor your worker in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. View metrics, logs, and performance

### Custom Metrics

Add custom metrics to your worker:

```javascript
// In worker.js
addEventListener('fetch', event => {
  // Track requests
  event.waitUntil(
    fetch('https://api.analytics.com/track', {
      method: 'POST',
      body: JSON.stringify({
        event: 'sgp_api_request',
        tool: toolName,
        timestamp: Date.now()
      })
    })
  );
});
```

## Security

### Best Practices

1. **Use Secrets**: Never hardcode credentials
2. **Validate Input**: Always validate request data
3. **Rate Limiting**: Implement proper rate limits
4. **CORS**: Configure CORS appropriately

### Secrets Management

```bash
# List secrets
wrangler secret list

# Delete a secret
wrangler secret delete SECRET_NAME

# Update a secret
wrangler secret put SECRET_NAME
```

## Troubleshooting

### Common Issues

**1. Authentication Errors**
```bash
# Check if secrets are set
wrangler secret list
```

**2. Deployment Failures**
```bash
# Check wrangler.toml syntax
wrangler validate

# Check account/zone settings
wrangler whoami
```

**3. Runtime Errors**
```bash
# View real-time logs
wrangler tail

# Check worker metrics
wrangler metrics
```

**4. Performance Issues**
```bash
# Analyze execution time
wrangler tail --format=pretty
```

### Debug Mode

Enable debug logging in your worker:

```javascript
// Add to worker.js
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[SGP-MCP]', ...args);
  }
}
```

## Scaling

### Traffic Patterns

Cloudflare Workers automatically scale, but consider:
- Peak usage times
- Geographic distribution
- Rate limiting needs

### Cost Optimization

Monitor usage and optimize:
- Cache frequently accessed data
- Minimize external API calls
- Use appropriate rate limits

## Migration

### From VPS to Workers

1. Test worker deployment
2. Update DNS records
3. Monitor traffic migration
4. Decommission VPS

### From Workers to VPS

1. Deploy VPS version
2. Configure load balancer
3. Gradually shift traffic
4. Monitor performance

## Support

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Community Discord](https://discord.gg/cloudflaredev)

## Limitations

- 10ms CPU time limit per request
- 128MB memory limit
- No persistent storage (use external services)
- Limited Node.js API compatibility

For more complex operations, consider the VPS deployment option.