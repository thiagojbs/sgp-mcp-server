# SGP MCP Server

A Model Context Protocol (MCP) server for integrating with SGP (Sistema de Gestão para Provedores) API. This server provides seamless access to SGP's comprehensive ISP management capabilities through both MCP and HTTP interfaces.

## Features

- 🔐 **Multiple Authentication Methods**: Supports Basic Auth, Token Auth, and CPF/CNPJ Auth
- 🚀 **Rate Limiting**: Automatic rate limiting with different limits per authentication method
- 💾 **Intelligent Caching**: Built-in cache system for improved performance
- 🔄 **Retry Logic**: Automatic retry with exponential backoff for failed requests
- 📊 **Comprehensive Logging**: Detailed logging with Winston
- 🌐 **HTTP API**: RESTful HTTP API for direct access
- 📱 **MCP Protocol**: Full MCP server implementation for AI integration

## Quick Start

### Installation

```bash
git clone https://github.com/thiagojbs/sgp-mcp-server.git
cd sgp-mcp-server
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your SGP credentials in `.env`:
```env
SGP_BASE_URL=https://demo.sgp.net.br/api
SGP_USERNAME=your_username
SGP_PASSWORD=your_password
SGP_API_TOKEN=your_api_token
SGP_APP_NAME=sgp-mcp-server
```

### Running the Server

#### As MCP Server (for AI integration)
```bash
npm run build
npm start
```

#### As HTTP Server (for direct API access)
```bash
npm run build
node dist/http/index.js
```

#### Development Mode
```bash
# MCP Server
npm run dev

# HTTP Server
npm run dev -- src/http/index.ts
```

## API Documentation

### Available Tools

The server provides the following tools for SGP integration:

#### Customer Management
- `sgp_get_customer_contracts` - Get customer contracts
- `sgp_get_contract_details` - Get specific contract details
- `sgp_get_customer_invoices` - Get customer invoices
- `sgp_get_invoice_details` - Get specific invoice details
- `sgp_generate_second_copy` - Generate invoice second copy
- `sgp_get_support_tickets` - Get customer support tickets
- `sgp_create_support_ticket` - Create new support ticket

#### Network Management
- `sgp_list_onus` - List ONUs with pagination
- `sgp_get_onu_details` - Get ONU details
- `sgp_provision_onu` - Provision an ONU
- `sgp_deprovision_onu` - Deprovision an ONU
- `sgp_restart_onu` - Restart an ONU
- `sgp_get_onu_status` - Get ONU status
- `sgp_list_olts` - List OLTs
- `sgp_get_network_status` - Get overall network status

#### Inventory & Financial
- `sgp_list_products` - List products
- `sgp_generate_invoice_batch` - Generate invoice batch
- `sgp_process_return_file` - Process bank return file

### HTTP API Usage

Base URL: `http://localhost:3000`

#### Get Customer Contracts
```bash
curl -X POST http://localhost:3000/mcp/tools/get_customer_contracts \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"cpfcnpj\": \"12345678900\",
    \"senha\": \"customer_password\"
  }'
```

#### List ONUs
```bash
curl -X POST http://localhost:3000/mcp/tools/list_onus \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"page\": 1,
    \"per_page\": 20
  }'
```

#### Create Support Ticket
```bash
curl -X POST http://localhost:3000/mcp/tools/create_support_ticket \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"cpfcnpj\": \"12345678900\",
    \"senha\": \"customer_password\",
    \"assunto\": \"Internet slow\",
    \"descricao\": \"Customer reports slow internet connection\"
  }'
```

### MCP Integration

For AI applications, configure your MCP client to connect to this server:

```json
{
  \"mcpServers\": {
    \"sgp\": {
      \"command\": \"node\",
      \"args\": [\"/path/to/sgp-mcp-server/dist/index.js\"],
      \"env\": {
        \"SGP_BASE_URL\": \"https://demo.sgp.net.br/api\",
        \"SGP_API_TOKEN\": \"your_token\"
      }
    }
  }
}
```

## Authentication Methods

### 1. Basic Authentication
Uses username and password for SGP admin access:
```env
SGP_USERNAME=admin_user
SGP_PASSWORD=admin_password
```

### 2. Token Authentication
Uses API token for enhanced security:
```env
SGP_API_TOKEN=your_api_token
SGP_APP_NAME=your_app_name
```

### 3. CPF/CNPJ Authentication
For customer portal access (passed in function calls):
```javascript
{
  \"cpfcnpj\": \"12345678900\",
  \"senha\": \"customer_password\"
}
```

## Rate Limits

- **Basic Auth**: 100 requests/minute
- **Token Auth**: 300 requests/minute  
- **CPF/CNPJ Auth**: 50 requests/minute

## Caching

The server implements intelligent caching:
- **Default TTL**: 5 minutes
- **Max Keys**: 1000
- **Cache Keys**: Automatically generated based on endpoint and parameters

## Error Handling

- Automatic retry with exponential backoff
- Comprehensive error logging
- Graceful degradation for rate limits
- Clear error messages in API responses

## Development

### Project Structure
```
src/
├── auth/           # Authentication management
├── client/         # SGP API client
├── http/           # HTTP server implementation
├── mcp/           # MCP server implementation
├── services/      # Business logic services
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run format
```

## Deployment

### VPS Deployment

1. **Prepare server:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Deploy application:**
```bash
# Clone repository
git clone https://github.com/thiagojbs/sgp-mcp-server.git
cd sgp-mcp-server

# Install dependencies
npm install

# Build application
npm run build

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start dist/http/index.js --name sgp-mcp-server
pm2 startup
pm2 save
```

3. **Configure reverse proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Cloudflare Workers Deployment

For Cloudflare Workers deployment, see the `cloudflare/` directory for Worker-specific implementation.

## Monitoring

- **Health Check**: `GET /health`
- **Metrics**: Built-in logging and metrics
- **PM2 Monitoring**: `pm2 monit`

## Security

- All credentials stored in environment variables
- HTTPS enforced in production
- Rate limiting to prevent abuse
- Input validation and sanitization
- No sensitive data in logs

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check `/docs` endpoint when server is running
- **Issues**: Report bugs on GitHub Issues
- **API Reference**: Visit `/docs` for complete API documentation

## Examples

See the `examples/` directory for:
- MCP client integration examples
- HTTP API usage examples
- Authentication method examples
- Error handling patterns

---

**Note**: This is an open-source project created to facilitate SGP API integration. It is not officially affiliated with SGP.