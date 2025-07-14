import express from 'express';
import { SGPService } from '../services/sgp-service.js';
import { SGPClient } from '../client/sgp-client.js';
import { SGPConfig } from '../types/sgp.js';
import { logger } from '../utils/logger.js';

export class SGPHttpServer {
  private app: express.Application;
  private sgpService: SGPService;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');

    const config: SGPConfig = {
      baseURL: process.env.SGP_BASE_URL || 'https://demo.sgp.net.br/api',
      username: process.env.SGP_USERNAME,
      password: process.env.SGP_PASSWORD,
      apiToken: process.env.SGP_API_TOKEN,
      appName: process.env.SGP_APP_NAME || 'sgp-mcp-server',
      timeout: parseInt(process.env.SGP_TIMEOUT || '30000'),
    };

    const sgpClient = new SGPClient(config);
    this.sgpService = new SGPService(sgpClient);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`, { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/', (req, res) => {
      res.json({
        name: 'SGP MCP Server',
        version: '1.0.0',
        description: 'MCP Server for SGP (Sistema de Gestão para Provedores) API integration',
        endpoints: {
          health: '/health',
          mcp: '/mcp',
          docs: '/docs'
        }
      });
    });

    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      });
    });

    this.app.post('/mcp/tools/:toolName', async (req, res) => {
      try {
        const { toolName } = req.params;
        const args = req.body;

        logger.info(`Executing MCP tool via HTTP: ${toolName}`, { args });

        let result;
        switch (toolName) {
          case 'get_customer_contracts':
            result = await this.sgpService.getCustomerContracts(args.cpfcnpj, args.senha);
            break;
          case 'get_contract_details':
            result = await this.sgpService.getContractDetails(args.contrato_id, args.cpfcnpj, args.senha);
            break;
          case 'get_customer_invoices':
            result = await this.sgpService.getCustomerInvoices(args.cpfcnpj, args.senha);
            break;
          case 'get_invoice_details':
            result = await this.sgpService.getInvoiceDetails(args.fatura_id, args.cpfcnpj, args.senha);
            break;
          case 'generate_second_copy':
            result = await this.sgpService.generateSecondCopy(args.fatura_id, args.cpfcnpj, args.senha);
            break;
          case 'create_support_ticket':
            result = await this.sgpService.createSupportTicket(args);
            break;
          case 'get_support_tickets':
            result = await this.sgpService.getSupportTickets(args.cpfcnpj, args.senha);
            break;
          case 'list_onus':
            result = await this.sgpService.listONUs(args.page, args.per_page);
            break;
          case 'get_onu_details':
            result = await this.sgpService.getONUDetails(args.onu_id);
            break;
          case 'provision_onu':
            result = await this.sgpService.provisionONU(args.onu_id, args.provision_data || {});
            break;
          case 'deprovision_onu':
            result = await this.sgpService.deprovisionONU(args.onu_id);
            break;
          case 'restart_onu':
            result = await this.sgpService.restartONU(args.onu_id);
            break;
          case 'get_onu_status':
            result = await this.sgpService.getONUStatus(args.onu_id);
            break;
          case 'list_olts':
            result = await this.sgpService.listOLTs(args.page, args.per_page);
            break;
          case 'list_products':
            result = await this.sgpService.listProducts(args.page, args.per_page);
            break;
          case 'get_network_status':
            result = await this.sgpService.getNetworkStatus();
            break;
          case 'generate_invoice_batch':
            result = await this.sgpService.generateInvoiceBatch(args);
            break;
          case 'process_return_file':
            result = await this.sgpService.processReturnFile(args);
            break;
          default:
            return res.status(404).json({
              error: 'Tool not found',
              available_tools: [
                'get_customer_contracts', 'get_contract_details', 'get_customer_invoices',
                'get_invoice_details', 'generate_second_copy', 'create_support_ticket',
                'get_support_tickets', 'list_onus', 'get_onu_details', 'provision_onu',
                'deprovision_onu', 'restart_onu', 'get_onu_status', 'list_olts',
                'list_products', 'get_network_status', 'generate_invoice_batch',
                'process_return_file'
              ]
            });
        }

        res.json(result);
      } catch (error) {
        logger.error(`HTTP tool execution failed: ${req.params.toolName}`, { 
          error: error instanceof Error ? error.message : error 
        });
        
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.get('/docs', (req, res) => {
      res.json({
        title: 'SGP MCP Server API Documentation',
        version: '1.0.0',
        description: 'HTTP API for SGP MCP Server tools',
        base_url: `http://localhost:${this.port}`,
        endpoints: {
          tools: {
            url: '/mcp/tools/:toolName',
            method: 'POST',
            description: 'Execute MCP tools via HTTP',
            available_tools: [
              {
                name: 'get_customer_contracts',
                description: 'Get contracts for a customer using CPF/CNPJ and password',
                parameters: { cpfcnpj: 'string', senha: 'string' }
              },
              {
                name: 'get_contract_details',
                description: 'Get details of a specific contract',
                parameters: { contrato_id: 'string', cpfcnpj: 'string', senha: 'string' }
              },
              {
                name: 'get_customer_invoices',
                description: 'Get invoices for a customer',
                parameters: { cpfcnpj: 'string', senha: 'string' }
              },
              {
                name: 'get_invoice_details',
                description: 'Get details of a specific invoice',
                parameters: { fatura_id: 'string', cpfcnpj: 'string', senha: 'string' }
              },
              {
                name: 'generate_second_copy',
                description: 'Generate second copy of an invoice',
                parameters: { fatura_id: 'string', cpfcnpj: 'string', senha: 'string' }
              },
              {
                name: 'create_support_ticket',
                description: 'Create a new support ticket',
                parameters: { 
                  cpfcnpj: 'string', 
                  senha: 'string', 
                  assunto: 'string', 
                  descricao: 'string',
                  categoria_id: 'number (optional)',
                  prioridade_id: 'number (optional)'
                }
              },
              {
                name: 'get_support_tickets',
                description: 'Get support tickets for a customer',
                parameters: { cpfcnpj: 'string', senha: 'string' }
              },
              {
                name: 'list_onus',
                description: 'List ONUs with pagination',
                parameters: { page: 'number (optional)', per_page: 'number (optional)' }
              },
              {
                name: 'get_onu_details',
                description: 'Get details of a specific ONU',
                parameters: { onu_id: 'string' }
              },
              {
                name: 'provision_onu',
                description: 'Provision an ONU',
                parameters: { onu_id: 'string', provision_data: 'object (optional)' }
              },
              {
                name: 'deprovision_onu',
                description: 'Deprovision an ONU',
                parameters: { onu_id: 'string' }
              },
              {
                name: 'restart_onu',
                description: 'Restart an ONU',
                parameters: { onu_id: 'string' }
              },
              {
                name: 'get_onu_status',
                description: 'Get current status of an ONU',
                parameters: { onu_id: 'string' }
              },
              {
                name: 'list_olts',
                description: 'List OLTs with pagination',
                parameters: { page: 'number (optional)', per_page: 'number (optional)' }
              },
              {
                name: 'list_products',
                description: 'List products with pagination',
                parameters: { page: 'number (optional)', per_page: 'number (optional)' }
              },
              {
                name: 'get_network_status',
                description: 'Get overall network status and alerts',
                parameters: {}
              },
              {
                name: 'generate_invoice_batch',
                description: 'Generate a batch of invoices for remittance',
                parameters: { data_vencimento: 'string', banco_id: 'number', tipo_arquivo: 'string' }
              },
              {
                name: 'process_return_file',
                description: 'Process a return file from the bank',
                parameters: { arquivo: 'string (base64)', banco_id: 'number' }
              }
            ]
          }
        },
        examples: {
          get_customer_contracts: {
            url: '/mcp/tools/get_customer_contracts',
            method: 'POST',
            body: {
              cpfcnpj: '12345678900',
              senha: 'customer_password'
            }
          },
          list_onus: {
            url: '/mcp/tools/list_onus',
            method: 'POST',
            body: {
              page: 1,
              per_page: 20
            }
          }
        }
      });
    });

    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        available_endpoints: ['/', '/health', '/mcp/tools/:toolName', '/docs']
      });
    });

    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error in HTTP server', { 
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      const server = this.app.listen(this.port, () => {
        logger.info(`SGP HTTP Server started on port ${this.port}`, {
          environment: process.env.NODE_ENV || 'development',
          endpoints: {
            root: `http://localhost:${this.port}/`,
            health: `http://localhost:${this.port}/health`,
            docs: `http://localhost:${this.port}/docs`,
            tools: `http://localhost:${this.port}/mcp/tools/:toolName`
          }
        });
        resolve();
      });

      process.on('SIGINT', () => {
        logger.info('Received SIGINT, shutting down HTTP server gracefully...');
        server.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });
      });

      process.on('SIGTERM', () => {
        logger.info('Received SIGTERM, shutting down HTTP server gracefully...');
        server.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });
      });
    });
  }
}