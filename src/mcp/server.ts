import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ImageContent,
} from '@modelcontextprotocol/sdk/types.js';
import { SGPService } from '../services/sgp-service.js';
import { SGPClient } from '../client/sgp-client.js';
import { SGPConfig } from '../types/sgp.js';
import { logger } from '../utils/logger.js';

export class SGPMCPServer {
  private server: Server;
  private sgpService: SGPService;

  constructor() {
    this.server = new Server(
      {
        name: 'sgp-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

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

    this.setupHandlers();
    
    logger.info('SGP MCP Server initialized', { 
      baseURL: config.baseURL,
      hasToken: !!config.apiToken,
      hasBasicAuth: !!(config.username && config.password)
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        logger.info(`Executing tool: ${name}`, { args });
        const result = await this.executeTool(name, args || {});
        return result;
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, { error: error instanceof Error ? error.message : error });
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            } as TextContent,
          ],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'sgp_get_customer_contracts',
        description: 'Get contracts for a customer using CPF/CNPJ and password',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Customer password',
            },
          },
          required: ['cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_get_contract_details',
        description: 'Get details of a specific contract',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Customer password',
            },
          },
          required: ['contrato_id', 'cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_get_customer_invoices',
        description: 'Get invoices for a customer',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Customer password',
            },
          },
          required: ['cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_get_invoice_details',
        description: 'Get details of a specific invoice',
        inputSchema: {
          type: 'object',
          properties: {
            fatura_id: {
              type: 'string',
              description: 'Invoice ID',
            },
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Customer password',
            },
          },
          required: ['fatura_id', 'cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_generate_second_copy',
        description: 'Generate second copy of an invoice',
        inputSchema: {
          type: 'object',
          properties: {
            fatura_id: {
              type: 'string',
              description: 'Invoice ID',
            },
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Customer password',
            },
          },
          required: ['fatura_id', 'cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_create_support_ticket',
        description: 'Create a new support ticket',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Customer password',
            },
            assunto: {
              type: 'string',
              description: 'Ticket subject',
            },
            descricao: {
              type: 'string',
              description: 'Ticket description',
            },
            categoria_id: {
              type: 'number',
              description: 'Category ID (optional)',
            },
            prioridade_id: {
              type: 'number',
              description: 'Priority ID (optional)',
            },
          },
          required: ['cpfcnpj', 'senha', 'assunto', 'descricao'],
        },
      },
      {
        name: 'sgp_get_support_tickets',
        description: 'Get support tickets for a customer',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Customer password',
            },
          },
          required: ['cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_list_onus',
        description: 'List ONUs with pagination',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number (default: 1)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (default: 20, max: 100)',
            },
          },
        },
      },
      {
        name: 'sgp_get_onu_details',
        description: 'Get details of a specific ONU',
        inputSchema: {
          type: 'object',
          properties: {
            onu_id: {
              type: 'string',
              description: 'ONU ID',
            },
          },
          required: ['onu_id'],
        },
      },
      {
        name: 'sgp_provision_onu',
        description: 'Provision an ONU',
        inputSchema: {
          type: 'object',
          properties: {
            onu_id: {
              type: 'string',
              description: 'ONU ID',
            },
            provision_data: {
              type: 'object',
              description: 'Provision configuration data',
              properties: {
                vlan: { type: 'number' },
                bandwidth_up: { type: 'number' },
                bandwidth_down: { type: 'number' },
              },
            },
          },
          required: ['onu_id'],
        },
      },
      {
        name: 'sgp_deprovision_onu',
        description: 'Deprovision an ONU',
        inputSchema: {
          type: 'object',
          properties: {
            onu_id: {
              type: 'string',
              description: 'ONU ID',
            },
          },
          required: ['onu_id'],
        },
      },
      {
        name: 'sgp_restart_onu',
        description: 'Restart an ONU',
        inputSchema: {
          type: 'object',
          properties: {
            onu_id: {
              type: 'string',
              description: 'ONU ID',
            },
          },
          required: ['onu_id'],
        },
      },
      {
        name: 'sgp_get_onu_status',
        description: 'Get current status of an ONU',
        inputSchema: {
          type: 'object',
          properties: {
            onu_id: {
              type: 'string',
              description: 'ONU ID',
            },
          },
          required: ['onu_id'],
        },
      },
      {
        name: 'sgp_list_olts',
        description: 'List OLTs with pagination',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number (default: 1)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (default: 20, max: 100)',
            },
          },
        },
      },
      {
        name: 'sgp_list_products',
        description: 'List products with pagination',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number (default: 1)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (default: 20, max: 100)',
            },
          },
        },
      },
      {
        name: 'sgp_get_network_status',
        description: 'Get overall network status and alerts',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_generate_invoice_batch',
        description: 'Generate a batch of invoices for remittance',
        inputSchema: {
          type: 'object',
          properties: {
            data_vencimento: {
              type: 'string',
              description: 'Due date (YYYY-MM-DD)',
            },
            banco_id: {
              type: 'number',
              description: 'Bank ID',
            },
            tipo_arquivo: {
              type: 'string',
              description: 'File type (e.g., CNAB240, CNAB400)',
            },
          },
          required: ['data_vencimento', 'banco_id', 'tipo_arquivo'],
        },
      },
      {
        name: 'sgp_process_return_file',
        description: 'Process a return file from the bank',
        inputSchema: {
          type: 'object',
          properties: {
            arquivo: {
              type: 'string',
              description: 'Base64 encoded file content',
            },
            banco_id: {
              type: 'number',
              description: 'Bank ID',
            },
          },
          required: ['arquivo', 'banco_id'],
        },
      },
    ];
  }

  private async executeTool(name: string, args: any): Promise<CallToolResult> {
    switch (name) {
      case 'sgp_get_customer_contracts':
        return this.formatResponse(
          await this.sgpService.getCustomerContracts(args.cpfcnpj, args.senha)
        );

      case 'sgp_get_contract_details':
        return this.formatResponse(
          await this.sgpService.getContractDetails(args.contrato_id, args.cpfcnpj, args.senha)
        );

      case 'sgp_get_customer_invoices':
        return this.formatResponse(
          await this.sgpService.getCustomerInvoices(args.cpfcnpj, args.senha)
        );

      case 'sgp_get_invoice_details':
        return this.formatResponse(
          await this.sgpService.getInvoiceDetails(args.fatura_id, args.cpfcnpj, args.senha)
        );

      case 'sgp_generate_second_copy':
        return this.formatResponse(
          await this.sgpService.generateSecondCopy(args.fatura_id, args.cpfcnpj, args.senha)
        );

      case 'sgp_create_support_ticket':
        return this.formatResponse(
          await this.sgpService.createSupportTicket(args)
        );

      case 'sgp_get_support_tickets':
        return this.formatResponse(
          await this.sgpService.getSupportTickets(args.cpfcnpj, args.senha)
        );

      case 'sgp_list_onus':
        return this.formatResponse(
          await this.sgpService.listONUs(args.page, args.per_page)
        );

      case 'sgp_get_onu_details':
        return this.formatResponse(
          await this.sgpService.getONUDetails(args.onu_id)
        );

      case 'sgp_provision_onu':
        return this.formatResponse(
          await this.sgpService.provisionONU(args.onu_id, args.provision_data || {})
        );

      case 'sgp_deprovision_onu':
        return this.formatResponse(
          await this.sgpService.deprovisionONU(args.onu_id)
        );

      case 'sgp_restart_onu':
        return this.formatResponse(
          await this.sgpService.restartONU(args.onu_id)
        );

      case 'sgp_get_onu_status':
        return this.formatResponse(
          await this.sgpService.getONUStatus(args.onu_id)
        );

      case 'sgp_list_olts':
        return this.formatResponse(
          await this.sgpService.listOLTs(args.page, args.per_page)
        );

      case 'sgp_list_products':
        return this.formatResponse(
          await this.sgpService.listProducts(args.page, args.per_page)
        );

      case 'sgp_get_network_status':
        return this.formatResponse(
          await this.sgpService.getNetworkStatus()
        );

      case 'sgp_generate_invoice_batch':
        return this.formatResponse(
          await this.sgpService.generateInvoiceBatch(args)
        );

      case 'sgp_process_return_file':
        return this.formatResponse(
          await this.sgpService.processReturnFile(args)
        );

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private formatResponse(response: any): CallToolResult {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        } as TextContent,
      ],
    };
  }

  async run(): Promise<void> {
    const transport = process.stdin;
    await this.server.connect(transport);
    logger.info('SGP MCP Server is running...');
  }

  async stop(): Promise<void> {
    await this.server.close();
    logger.info('SGP MCP Server stopped');
  }
}