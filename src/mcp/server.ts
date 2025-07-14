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
      // URA Tools
      {
        name: 'sgp_ura_customer_lookup',
        description: 'URA customer lookup by CPF/CNPJ, phone or name',
        inputSchema: {
          type: 'object',
          properties: {
            search_term: {
              type: 'string',
              description: 'Search term (CPF, CNPJ, phone, or name)',
            },
            search_type: {
              type: 'string',
              enum: ['cpf', 'cnpj', 'telefone', 'nome'],
              description: 'Type of search (default: cpf)',
            },
          },
          required: ['search_term'],
        },
      },
      {
        name: 'sgp_ura_authenticate',
        description: 'URA customer authentication',
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
        name: 'sgp_ura_connection_status',
        description: 'Check customer connection status for URA',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
          },
          required: ['contrato_id'],
        },
      },
      {
        name: 'sgp_ura_last_payment',
        description: 'Get last payment information for URA',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
          },
          required: ['contrato_id'],
        },
      },
      // Service Orders Tools
      {
        name: 'sgp_create_service_order',
        description: 'Create a new service order',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'number',
              description: 'Customer ID',
            },
            contrato_id: {
              type: 'number',
              description: 'Contract ID (optional)',
            },
            tipo_id: {
              type: 'number',
              description: 'Service order type ID',
            },
            titulo: {
              type: 'string',
              description: 'Service order title',
            },
            descricao: {
              type: 'string',
              description: 'Service order description',
            },
            prioridade: {
              type: 'string',
              description: 'Priority level (optional)',
            },
            data_agendamento: {
              type: 'string',
              description: 'Scheduled date (YYYY-MM-DD HH:MM) (optional)',
            },
            endereco: {
              type: 'string',
              description: 'Service address (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['cliente_id', 'tipo_id', 'titulo', 'descricao'],
        },
      },
      {
        name: 'sgp_list_service_orders',
        description: 'List service orders with filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by status (optional)',
            },
            tecnico_id: {
              type: 'number',
              description: 'Filter by technician ID (optional)',
            },
            cliente_id: {
              type: 'number',
              description: 'Filter by customer ID (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (YYYY-MM-DD) (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (YYYY-MM-DD) (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_service_order_details',
        description: 'Get service order details',
        inputSchema: {
          type: 'object',
          properties: {
            ordem_id: {
              type: 'string',
              description: 'Service order ID',
            },
          },
          required: ['ordem_id'],
        },
      },
      {
        name: 'sgp_update_service_order',
        description: 'Update service order status and details',
        inputSchema: {
          type: 'object',
          properties: {
            ordem_id: {
              type: 'string',
              description: 'Service order ID',
            },
            status: {
              type: 'string',
              description: 'New status (optional)',
            },
            tecnico_id: {
              type: 'number',
              description: 'Assign technician (optional)',
            },
            data_execucao: {
              type: 'string',
              description: 'Execution date (YYYY-MM-DD HH:MM) (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Update notes (optional)',
            },
            equipamentos: {
              type: 'array',
              items: { type: 'string' },
              description: 'Equipment list (optional)',
            },
          },
          required: ['ordem_id'],
        },
      },
      {
        name: 'sgp_close_service_order',
        description: 'Close a service order',
        inputSchema: {
          type: 'object',
          properties: {
            ordem_id: {
              type: 'string',
              description: 'Service order ID',
            },
            observacoes_finais: {
              type: 'string',
              description: 'Final notes/solution',
            },
            equipamentos_instalados: {
              type: 'array',
              items: { type: 'string' },
              description: 'Installed equipment list (optional)',
            },
            data_fechamento: {
              type: 'string',
              description: 'Close date (YYYY-MM-DD HH:MM) (optional)',
            },
          },
          required: ['ordem_id', 'observacoes_finais'],
        },
      },
      // Expanded Customer Management
      {
        name: 'sgp_update_customer_data',
        description: 'Update customer profile data',
        inputSchema: {
          type: 'object',
          properties: {
            cpfcnpj: {
              type: 'string',
              description: 'Customer CPF or CNPJ',
            },
            senha: {
              type: 'string',
              description: 'Current password',
            },
            telefone: {
              type: 'string',
              description: 'New phone number (optional)',
            },
            email: {
              type: 'string',
              description: 'New email address (optional)',
            },
            endereco: {
              type: 'string',
              description: 'New address (optional)',
            },
            senha_nova: {
              type: 'string',
              description: 'New password (optional)',
            },
          },
          required: ['cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_get_payment_history',
        description: 'Get customer payment history',
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
            data_inicio: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD) (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date (YYYY-MM-DD) (optional)',
            },
            status: {
              type: 'string',
              description: 'Payment status filter (optional)',
            },
          },
          required: ['cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_get_usage_data',
        description: 'Get customer internet usage data',
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
            periodo: {
              type: 'string',
              description: 'Period (atual, anterior, custom) (optional)',
            },
          },
          required: ['cpfcnpj', 'senha'],
        },
      },
      {
        name: 'sgp_suspend_contract',
        description: 'Suspend a customer contract',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
            motivo: {
              type: 'string',
              description: 'Suspension reason',
            },
          },
          required: ['contrato_id', 'motivo'],
        },
      },
      {
        name: 'sgp_reactivate_contract',
        description: 'Reactivate a suspended contract',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
            observacoes: {
              type: 'string',
              description: 'Reactivation notes (optional)',
            },
          },
          required: ['contrato_id'],
        },
      },
      // Pre-registration Tools
      {
        name: 'sgp_create_pre_registration',
        description: 'Create a pre-registration/lead',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Customer name',
            },
            cpf_cnpj: {
              type: 'string',
              description: 'CPF or CNPJ',
            },
            telefone: {
              type: 'string',
              description: 'Phone number',
            },
            email: {
              type: 'string',
              description: 'Email address',
            },
            endereco: {
              type: 'string',
              description: 'Full address',
            },
            cep: {
              type: 'string',
              description: 'ZIP code',
            },
            plano_interesse: {
              type: 'string',
              description: 'Plan of interest (optional)',
            },
            origem: {
              type: 'string',
              description: 'Lead source (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome', 'cpf_cnpj', 'telefone', 'email', 'endereco', 'cep'],
        },
      },
      {
        name: 'sgp_check_coverage',
        description: 'Check service coverage by ZIP code',
        inputSchema: {
          type: 'object',
          properties: {
            cep: {
              type: 'string',
              description: 'ZIP code to check',
            },
            endereco: {
              type: 'string',
              description: 'Full address (optional)',
            },
          },
          required: ['cep'],
        },
      },
      {
        name: 'sgp_schedule_installation',
        description: 'Schedule installation for pre-registration',
        inputSchema: {
          type: 'object',
          properties: {
            pre_cadastro_id: {
              type: 'string',
              description: 'Pre-registration ID',
            },
            data_agendamento: {
              type: 'string',
              description: 'Installation date (YYYY-MM-DD)',
            },
            periodo: {
              type: 'string',
              description: 'Time period (manhã, tarde, noite)',
            },
            observacoes: {
              type: 'string',
              description: 'Scheduling notes (optional)',
            },
          },
          required: ['pre_cadastro_id', 'data_agendamento', 'periodo'],
        },
      },
      // Radius Tools
      {
        name: 'sgp_create_radius_user',
        description: 'Create a new Radius user',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Radius username',
            },
            password: {
              type: 'string',
              description: 'Radius password',
            },
            grupo_id: {
              type: 'number',
              description: 'Radius group ID',
            },
            cliente_id: {
              type: 'number',
              description: 'Customer ID (optional)',
            },
            ip_fixo: {
              type: 'string',
              description: 'Fixed IP address (optional)',
            },
            perfil_velocidade: {
              type: 'string',
              description: 'Speed profile name',
            },
          },
          required: ['username', 'password', 'grupo_id', 'perfil_velocidade'],
        },
      },
      {
        name: 'sgp_list_radius_users',
        description: 'List Radius users with filters',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by status (optional)',
            },
            grupo_id: {
              type: 'number',
              description: 'Filter by group ID (optional)',
            },
            cliente_id: {
              type: 'number',
              description: 'Filter by customer ID (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_active_sessions',
        description: 'Get active Radius sessions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_disconnect_radius_user',
        description: 'Disconnect a Radius user session',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username to disconnect',
            },
            motivo: {
              type: 'string',
              description: 'Disconnection reason (optional)',
            },
          },
          required: ['username'],
        },
      },
      // Enhanced Inventory Tools
      {
        name: 'sgp_add_stock_movement',
        description: 'Add stock movement (entrada/saida)',
        inputSchema: {
          type: 'object',
          properties: {
            produto_id: {
              type: 'number',
              description: 'Product ID',
            },
            tipo: {
              type: 'string',
              enum: ['entrada', 'saida'],
              description: 'Movement type',
            },
            quantidade: {
              type: 'number',
              description: 'Quantity',
            },
            motivo: {
              type: 'string',
              description: 'Movement reason',
            },
            fornecedor_id: {
              type: 'number',
              description: 'Supplier ID (optional)',
            },
            valor_unitario: {
              type: 'number',
              description: 'Unit value (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['produto_id', 'tipo', 'quantidade', 'motivo'],
        },
      },
      {
        name: 'sgp_track_serial_number',
        description: 'Track equipment by serial number',
        inputSchema: {
          type: 'object',
          properties: {
            serial: {
              type: 'string',
              description: 'Serial number to track',
            },
          },
          required: ['serial'],
        },
      },
      {
        name: 'sgp_get_stock_alerts',
        description: 'Get stock level alerts',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Enhanced Support Tools
      {
        name: 'sgp_update_support_ticket',
        description: 'Update support ticket status and details',
        inputSchema: {
          type: 'object',
          properties: {
            chamado_id: {
              type: 'string',
              description: 'Ticket ID',
            },
            status: {
              type: 'string',
              description: 'New status (optional)',
            },
            prioridade_id: {
              type: 'number',
              description: 'Priority ID (optional)',
            },
            responsavel_id: {
              type: 'number',
              description: 'Assignee ID (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Update notes (optional)',
            },
          },
          required: ['chamado_id'],
        },
      },
      {
        name: 'sgp_close_support_ticket',
        description: 'Close a support ticket',
        inputSchema: {
          type: 'object',
          properties: {
            chamado_id: {
              type: 'string',
              description: 'Ticket ID',
            },
            solucao: {
              type: 'string',
              description: 'Solution description',
            },
            satisfacao_cliente: {
              type: 'number',
              description: 'Customer satisfaction (1-5) (optional)',
            },
            observacoes_internas: {
              type: 'string',
              description: 'Internal notes (optional)',
            },
          },
          required: ['chamado_id', 'solucao'],
        },
      },
      // Acceptance Terms Tools
      {
        name: 'sgp_create_acceptance_term',
        description: 'Create a new acceptance term',
        inputSchema: {
          type: 'object',
          properties: {
            titulo: {
              type: 'string',
              description: 'Term title',
            },
            conteudo: {
              type: 'string',
              description: 'Term content',
            },
            tipo: {
              type: 'string',
              description: 'Term type',
            },
            obrigatorio: {
              type: 'boolean',
              description: 'Is mandatory',
            },
            data_ativacao: {
              type: 'string',
              description: 'Activation date (YYYY-MM-DD) (optional)',
            },
          },
          required: ['titulo', 'conteudo', 'tipo', 'obrigatorio'],
        },
      },
      {
        name: 'sgp_validate_term_acceptance',
        description: 'Validate if customer accepted terms',
        inputSchema: {
          type: 'object',
          properties: {
            termo_id: {
              type: 'number',
              description: 'Term ID',
            },
            cliente_id: {
              type: 'number',
              description: 'Customer ID',
            },
          },
          required: ['termo_id', 'cliente_id'],
        },
      },
      // Administrative Tools
      {
        name: 'sgp_get_system_stats',
        description: 'Get system statistics and performance',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_get_audit_logs',
        description: 'Get system audit logs',
        inputSchema: {
          type: 'object',
          properties: {
            usuario_id: {
              type: 'number',
              description: 'Filter by user ID (optional)',
            },
            modulo: {
              type: 'string',
              description: 'Filter by module (optional)',
            },
            acao: {
              type: 'string',
              description: 'Filter by action (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD) (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date (YYYY-MM-DD) (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },

      // ==================== FTTH INFRASTRUCTURE COMPLETE ====================
      
      // CAIXAS FTTH
      {
        name: 'sgp_list_ftth_boxes',
        description: 'List FTTH boxes with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            olt_id: {
              type: 'number',
              description: 'Filter by OLT ID (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Filter by box type (optional)',
            },
            status: {
              type: 'string',
              description: 'Filter by status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_create_ftth_box',
        description: 'Create a new FTTH box',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Box name',
            },
            tipo: {
              type: 'string',
              description: 'Box type (subterranea, aerea, poste, etc.)',
            },
            endereco: {
              type: 'string',
              description: 'Box address',
            },
            coordenadas: {
              type: 'object',
              description: 'GPS coordinates (optional)',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            olt_id: {
              type: 'number',
              description: 'Associated OLT ID',
            },
            splitter_id: {
              type: 'number',
              description: 'Associated splitter ID (optional)',
            },
            capacidade: {
              type: 'number',
              description: 'Box capacity (number of ports)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome', 'tipo', 'endereco', 'olt_id', 'capacidade'],
        },
      },
      {
        name: 'sgp_get_ftth_box_details',
        description: 'Get details of a specific FTTH box',
        inputSchema: {
          type: 'object',
          properties: {
            caixa_id: {
              type: 'string',
              description: 'FTTH box ID',
            },
          },
          required: ['caixa_id'],
        },
      },
      {
        name: 'sgp_update_ftth_box',
        description: 'Update FTTH box information',
        inputSchema: {
          type: 'object',
          properties: {
            caixa_id: {
              type: 'string',
              description: 'FTTH box ID',
            },
            nome: {
              type: 'string',
              description: 'Box name (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Box type (optional)',
            },
            endereco: {
              type: 'string',
              description: 'Box address (optional)',
            },
            coordenadas: {
              type: 'object',
              description: 'GPS coordinates (optional)',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            capacidade: {
              type: 'number',
              description: 'Box capacity (optional)',
            },
            status: {
              type: 'string',
              description: 'Box status (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['caixa_id'],
        },
      },
      {
        name: 'sgp_delete_ftth_box',
        description: 'Delete an FTTH box',
        inputSchema: {
          type: 'object',
          properties: {
            caixa_id: {
              type: 'string',
              description: 'FTTH box ID',
            },
          },
          required: ['caixa_id'],
        },
      },

      // SPLITTERS FTTH
      {
        name: 'sgp_list_ftth_splitters',
        description: 'List FTTH splitters with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            caixa_id: {
              type: 'number',
              description: 'Filter by box ID (optional)',
            },
            olt_id: {
              type: 'number',
              description: 'Filter by OLT ID (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Filter by splitter type (optional)',
            },
            status: {
              type: 'string',
              description: 'Filter by status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_create_ftth_splitter',
        description: 'Create a new FTTH splitter',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Splitter name',
            },
            tipo: {
              type: 'string',
              description: 'Splitter type (PLC, FBT, etc.)',
            },
            razao_divisao: {
              type: 'string',
              description: 'Split ratio (1:2, 1:4, 1:8, etc.)',
            },
            caixa_id: {
              type: 'number',
              description: 'Associated box ID',
            },
            olt_id: {
              type: 'number',
              description: 'Associated OLT ID',
            },
            porta_olt: {
              type: 'number',
              description: 'OLT port number',
            },
            capacidade_entrada: {
              type: 'number',
              description: 'Input capacity',
            },
            capacidade_saida: {
              type: 'number',
              description: 'Output capacity',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome', 'tipo', 'razao_divisao', 'caixa_id', 'olt_id', 'porta_olt', 'capacidade_entrada', 'capacidade_saida'],
        },
      },
      {
        name: 'sgp_get_ftth_splitter_details',
        description: 'Get details of a specific FTTH splitter',
        inputSchema: {
          type: 'object',
          properties: {
            splitter_id: {
              type: 'string',
              description: 'FTTH splitter ID',
            },
          },
          required: ['splitter_id'],
        },
      },
      {
        name: 'sgp_update_ftth_splitter',
        description: 'Update FTTH splitter information',
        inputSchema: {
          type: 'object',
          properties: {
            splitter_id: {
              type: 'string',
              description: 'FTTH splitter ID',
            },
            nome: {
              type: 'string',
              description: 'Splitter name (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Splitter type (optional)',
            },
            razao_divisao: {
              type: 'string',
              description: 'Split ratio (optional)',
            },
            porta_olt: {
              type: 'number',
              description: 'OLT port number (optional)',
            },
            capacidade_entrada: {
              type: 'number',
              description: 'Input capacity (optional)',
            },
            capacidade_saida: {
              type: 'number',
              description: 'Output capacity (optional)',
            },
            status: {
              type: 'string',
              description: 'Splitter status (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['splitter_id'],
        },
      },
      {
        name: 'sgp_delete_ftth_splitter',
        description: 'Delete an FTTH splitter',
        inputSchema: {
          type: 'object',
          properties: {
            splitter_id: {
              type: 'string',
              description: 'FTTH splitter ID',
            },
          },
          required: ['splitter_id'],
        },
      },

      // OLT MANAGEMENT COMPLETE
      {
        name: 'sgp_create_olt',
        description: 'Create a new OLT',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'OLT name',
            },
            ip: {
              type: 'string',
              description: 'OLT IP address',
            },
            modelo: {
              type: 'string',
              description: 'OLT model',
            },
            total_portas: {
              type: 'number',
              description: 'Total number of ports',
            },
            comunidade_snmp: {
              type: 'string',
              description: 'SNMP community string (optional)',
            },
            versao_snmp: {
              type: 'string',
              description: 'SNMP version (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome', 'ip', 'modelo', 'total_portas'],
        },
      },
      {
        name: 'sgp_get_olt_details',
        description: 'Get details of a specific OLT',
        inputSchema: {
          type: 'object',
          properties: {
            olt_id: {
              type: 'string',
              description: 'OLT ID',
            },
          },
          required: ['olt_id'],
        },
      },
      {
        name: 'sgp_update_olt',
        description: 'Update OLT information',
        inputSchema: {
          type: 'object',
          properties: {
            olt_id: {
              type: 'string',
              description: 'OLT ID',
            },
            nome: {
              type: 'string',
              description: 'OLT name (optional)',
            },
            ip: {
              type: 'string',
              description: 'OLT IP address (optional)',
            },
            modelo: {
              type: 'string',
              description: 'OLT model (optional)',
            },
            total_portas: {
              type: 'number',
              description: 'Total number of ports (optional)',
            },
            status: {
              type: 'string',
              description: 'OLT status (optional)',
            },
            comunidade_snmp: {
              type: 'string',
              description: 'SNMP community string (optional)',
            },
            versao_snmp: {
              type: 'string',
              description: 'SNMP version (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['olt_id'],
        },
      },
      {
        name: 'sgp_delete_olt',
        description: 'Delete an OLT',
        inputSchema: {
          type: 'object',
          properties: {
            olt_id: {
              type: 'string',
              description: 'OLT ID',
            },
          },
          required: ['olt_id'],
        },
      },

      // ONU MANAGEMENT COMPLETE
      {
        name: 'sgp_create_onu',
        description: 'Create a new ONU',
        inputSchema: {
          type: 'object',
          properties: {
            serial: {
              type: 'string',
              description: 'ONU serial number',
            },
            modelo: {
              type: 'string',
              description: 'ONU model',
            },
            olt_id: {
              type: 'number',
              description: 'Associated OLT ID',
            },
            porta_olt: {
              type: 'number',
              description: 'OLT port number',
            },
            vlan: {
              type: 'number',
              description: 'VLAN ID (optional)',
            },
            mac_address: {
              type: 'string',
              description: 'MAC address (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['serial', 'modelo', 'olt_id', 'porta_olt'],
        },
      },
      {
        name: 'sgp_update_onu',
        description: 'Update ONU information',
        inputSchema: {
          type: 'object',
          properties: {
            onu_id: {
              type: 'string',
              description: 'ONU ID',
            },
            serial: {
              type: 'string',
              description: 'ONU serial number (optional)',
            },
            modelo: {
              type: 'string',
              description: 'ONU model (optional)',
            },
            olt_id: {
              type: 'number',
              description: 'Associated OLT ID (optional)',
            },
            porta_olt: {
              type: 'number',
              description: 'OLT port number (optional)',
            },
            vlan: {
              type: 'number',
              description: 'VLAN ID (optional)',
            },
            mac_address: {
              type: 'string',
              description: 'MAC address (optional)',
            },
            status: {
              type: 'string',
              description: 'ONU status (optional)',
            },
            contrato_id: {
              type: 'number',
              description: 'Associated contract ID (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['onu_id'],
        },
      },
      {
        name: 'sgp_delete_onu',
        description: 'Delete an ONU',
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

      // FTTH TOPOLOGY AND MONITORING
      {
        name: 'sgp_get_ftth_topology',
        description: 'Get FTTH network topology with all connections',
        inputSchema: {
          type: 'object',
          properties: {
            olt_id: {
              type: 'string',
              description: 'Filter by specific OLT ID (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_ftth_alarms',
        description: 'Get active FTTH network alarms',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_get_ftth_capacity_report',
        description: 'Get FTTH network capacity utilization report',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // ==================== SISTEMA DE BOLETOS COMPLETO ====================
      
      {
        name: 'sgp_list_boletos',
        description: 'List boletos with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by status (pendente, pago, vencido, cancelado) (optional)',
            },
            cliente_id: {
              type: 'number',
              description: 'Filter by customer ID (optional)',
            },
            banco_id: {
              type: 'number',
              description: 'Filter by bank ID (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (YYYY-MM-DD) (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (YYYY-MM-DD) (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_generate_boleto',
        description: 'Generate a new boleto',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'number',
              description: 'Customer ID',
            },
            contrato_id: {
              type: 'number',
              description: 'Contract ID (optional)',
            },
            fatura_id: {
              type: 'number',
              description: 'Invoice ID (optional)',
            },
            valor: {
              type: 'number',
              description: 'Boleto value',
            },
            data_vencimento: {
              type: 'string',
              description: 'Due date (YYYY-MM-DD)',
            },
            banco_id: {
              type: 'number',
              description: 'Bank ID',
            },
            instrucoes: {
              type: 'string',
              description: 'Payment instructions (optional)',
            },
            multa_percentual: {
              type: 'number',
              description: 'Late fee percentage (optional)',
            },
            juros_diario: {
              type: 'number',
              description: 'Daily interest rate (optional)',
            },
            desconto_percentual: {
              type: 'number',
              description: 'Discount percentage (optional)',
            },
            data_limite_desconto: {
              type: 'string',
              description: 'Discount deadline (YYYY-MM-DD) (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['cliente_id', 'valor', 'data_vencimento', 'banco_id'],
        },
      },
      {
        name: 'sgp_get_boleto_details',
        description: 'Get details of a specific boleto',
        inputSchema: {
          type: 'object',
          properties: {
            boleto_id: {
              type: 'string',
              description: 'Boleto ID',
            },
          },
          required: ['boleto_id'],
        },
      },
      {
        name: 'sgp_cancel_boleto',
        description: 'Cancel a boleto',
        inputSchema: {
          type: 'object',
          properties: {
            boleto_id: {
              type: 'string',
              description: 'Boleto ID',
            },
            motivo: {
              type: 'string',
              description: 'Cancellation reason (optional)',
            },
          },
          required: ['boleto_id'],
        },
      },
      {
        name: 'sgp_download_boleto_pdf',
        description: 'Download boleto PDF',
        inputSchema: {
          type: 'object',
          properties: {
            boleto_id: {
              type: 'string',
              description: 'Boleto ID',
            },
          },
          required: ['boleto_id'],
        },
      },
      {
        name: 'sgp_register_boleto_payment',
        description: 'Register manual boleto payment',
        inputSchema: {
          type: 'object',
          properties: {
            boleto_id: {
              type: 'string',
              description: 'Boleto ID',
            },
            data_pagamento: {
              type: 'string',
              description: 'Payment date (YYYY-MM-DD)',
            },
            valor_pago: {
              type: 'number',
              description: 'Amount paid',
            },
            forma_pagamento: {
              type: 'string',
              description: 'Payment method',
            },
            banco_pagador: {
              type: 'string',
              description: 'Paying bank (optional)',
            },
            agencia_pagadora: {
              type: 'string',
              description: 'Paying branch (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Payment notes (optional)',
            },
          },
          required: ['boleto_id', 'data_pagamento', 'valor_pago', 'forma_pagamento'],
        },
      },

      // GESTÃO DE REMESSAS EXPANDIDA
      {
        name: 'sgp_list_remessas',
        description: 'List remessas (bank files) with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            banco_id: {
              type: 'number',
              description: 'Filter by bank ID (optional)',
            },
            status: {
              type: 'string',
              description: 'Filter by status (gerada, enviada, processada, erro) (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (YYYY-MM-DD) (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (YYYY-MM-DD) (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_download_remessa',
        description: 'Download remessa file',
        inputSchema: {
          type: 'object',
          properties: {
            remessa_id: {
              type: 'string',
              description: 'Remessa ID',
            },
          },
          required: ['remessa_id'],
        },
      },
      {
        name: 'sgp_get_remessa_details',
        description: 'Get details of a specific remessa',
        inputSchema: {
          type: 'object',
          properties: {
            remessa_id: {
              type: 'string',
              description: 'Remessa ID',
            },
          },
          required: ['remessa_id'],
        },
      },

      // GESTÃO DE RETORNOS EXPANDIDA
      {
        name: 'sgp_list_retornos',
        description: 'List return files with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            banco_id: {
              type: 'number',
              description: 'Filter by bank ID (optional)',
            },
            remessa_id: {
              type: 'number',
              description: 'Filter by remessa ID (optional)',
            },
            status: {
              type: 'string',
              description: 'Filter by status (processando, processado, erro) (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (YYYY-MM-DD) (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (YYYY-MM-DD) (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_retorno_details',
        description: 'Get details of a specific return file',
        inputSchema: {
          type: 'object',
          properties: {
            retorno_id: {
              type: 'string',
              description: 'Return file ID',
            },
          },
          required: ['retorno_id'],
        },
      },
      {
        name: 'sgp_process_retorno_file_advanced',
        description: 'Process return file with advanced options',
        inputSchema: {
          type: 'object',
          properties: {
            arquivo: {
              type: 'string',
              description: 'File content (base64) or file path',
            },
            banco_id: {
              type: 'number',
              description: 'Bank ID',
            },
            processar_automatico: {
              type: 'boolean',
              description: 'Auto-process payments (optional)',
            },
            notificar_clientes: {
              type: 'boolean',
              description: 'Notify customers of payments (optional)',
            },
          },
          required: ['arquivo', 'banco_id'],
        },
      },

      // RELATÓRIOS FINANCEIROS
      {
        name: 'sgp_get_financial_report',
        description: 'Generate comprehensive financial report',
        inputSchema: {
          type: 'object',
          properties: {
            data_inicio: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD)',
            },
            data_fim: {
              type: 'string',
              description: 'End date (YYYY-MM-DD)',
            },
            banco_id: {
              type: 'number',
              description: 'Filter by bank ID (optional)',
            },
            tipo_relatorio: {
              type: 'string',
              description: 'Report type: boletos, remessas, retornos, geral (optional)',
              enum: ['boletos', 'remessas', 'retornos', 'geral'],
            },
          },
          required: ['data_inicio', 'data_fim'],
        },
      },

      // ==================== SISTEMA URA COMPLETO ====================
      
      {
        name: 'sgp_ura_get_contract',
        description: 'Get URA contract details for call center agents',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
          },
          required: ['contrato_id'],
        },
      },
      {
        name: 'sgp_ura_list_invoices',
        description: 'Get URA contract invoices for call center',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
          },
          required: ['contrato_id'],
        },
      },
      {
        name: 'sgp_ura_get_invoice_details',
        description: 'Get URA invoice details for call center',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
            fatura_id: {
              type: 'string',
              description: 'Invoice ID',
            },
          },
          required: ['contrato_id', 'fatura_id'],
        },
      },
      {
        name: 'sgp_ura_create_ticket',
        description: 'Create URA support ticket during call',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'number',
              description: 'Customer ID',
            },
            contrato_id: {
              type: 'number',
              description: 'Contract ID (optional)',
            },
            assunto: {
              type: 'string',
              description: 'Ticket subject',
            },
            descricao: {
              type: 'string',
              description: 'Ticket description',
            },
            categoria: {
              type: 'string',
              description: 'Ticket category',
            },
            prioridade: {
              type: 'string',
              description: 'Ticket priority (opcional)',
            },
            canal: {
              type: 'string',
              description: 'Communication channel (opcional)',
            },
          },
          required: ['cliente_id', 'assunto', 'descricao', 'categoria'],
        },
      },
      {
        name: 'sgp_ura_get_ticket',
        description: 'Get URA ticket details for call center',
        inputSchema: {
          type: 'object',
          properties: {
            chamado_id: {
              type: 'string',
              description: 'Ticket ID',
            },
          },
          required: ['chamado_id'],
        },
      },
      {
        name: 'sgp_ura_list_customer_tickets',
        description: 'List URA customer tickets for call center',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'string',
              description: 'Customer ID',
            },
          },
          required: ['cliente_id'],
        },
      },
      {
        name: 'sgp_ura_create_atendimento',
        description: 'Create URA service record during interaction',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'number',
              description: 'Customer ID',
            },
            tipo_atendimento: {
              type: 'string',
              description: 'Service type',
            },
            canal: {
              type: 'string',
              description: 'Communication channel',
              enum: ['telefone', 'whatsapp', 'email', 'chat', 'presencial'],
            },
            operador_id: {
              type: 'number',
              description: 'Operator ID (optional)',
            },
            resumo: {
              type: 'string',
              description: 'Service summary',
            },
            observacoes: {
              type: 'string',
              description: 'Additional observations (optional)',
            },
            tags: {
              type: 'array',
              description: 'Service tags (optional)',
              items: { type: 'string' },
            },
          },
          required: ['cliente_id', 'tipo_atendimento', 'canal', 'resumo'],
        },
      },
      {
        name: 'sgp_ura_get_atendimento',
        description: 'Get URA service record details',
        inputSchema: {
          type: 'object',
          properties: {
            atendimento_id: {
              type: 'string',
              description: 'Service record ID',
            },
          },
          required: ['atendimento_id'],
        },
      },
      {
        name: 'sgp_ura_list_customer_atendimentos',
        description: 'List customer service records for URA',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'string',
              description: 'Customer ID',
            },
          },
          required: ['cliente_id'],
        },
      },
      {
        name: 'sgp_ura_finish_atendimento',
        description: 'Finish URA service record',
        inputSchema: {
          type: 'object',
          properties: {
            atendimento_id: {
              type: 'string',
              description: 'Service record ID',
            },
            resumo_final: {
              type: 'string',
              description: 'Final service summary',
            },
            solucao: {
              type: 'string',
              description: 'Solution provided (optional)',
            },
            satisfacao: {
              type: 'number',
              description: 'Customer satisfaction score 1-10 (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Final observations (optional)',
            },
            tags: {
              type: 'array',
              description: 'Final tags (optional)',
              items: { type: 'string' },
            },
          },
          required: ['atendimento_id', 'resumo_final'],
        },
      },
      {
        name: 'sgp_ura_get_menu',
        description: 'Get URA menu structure for call routing',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_ura_update_menu',
        description: 'Update URA menu configuration',
        inputSchema: {
          type: 'object',
          properties: {
            menu_id: {
              type: 'string',
              description: 'Menu ID',
            },
            nome: {
              type: 'string',
              description: 'Menu name (optional)',
            },
            opcoes: {
              type: 'array',
              description: 'Menu options (optional)',
              items: {
                type: 'object',
                properties: {
                  tecla: { type: 'string' },
                  descricao: { type: 'string' },
                  acao: { type: 'string' },
                  submenu_id: { type: 'number' },
                  destino: { type: 'string' },
                },
              },
            },
            audio_url: {
              type: 'string',
              description: 'Audio file URL (optional)',
            },
            texto_tts: {
              type: 'string',
              description: 'Text-to-speech text (optional)',
            },
            timeout_segundos: {
              type: 'number',
              description: 'Timeout in seconds (optional)',
            },
            tentativas_maximas: {
              type: 'number',
              description: 'Maximum attempts (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Menu active status (optional)',
            },
          },
          required: ['menu_id'],
        },
      },
      {
        name: 'sgp_ura_get_queues_status',
        description: 'Get URA call queues real-time status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_ura_get_queue_metrics',
        description: 'Get URA queue performance metrics and reports',
        inputSchema: {
          type: 'object',
          properties: {
            fila_nome: {
              type: 'string',
              description: 'Queue name filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD) (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date (YYYY-MM-DD) (optional)',
            },
          },
        },
      },

      // ==================== SISTEMA DE ESTOQUE AVANÇADO ====================
      
      // GESTÃO DE FORNECEDORES
      {
        name: 'sgp_list_fornecedores',
        description: 'List suppliers with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by status (ativo, inativo, bloqueado) (optional)',
            },
            cidade: {
              type: 'string',
              description: 'Filter by city (optional)',
            },
            estado: {
              type: 'string',
              description: 'Filter by state (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_create_fornecedor',
        description: 'Create a new supplier',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Supplier name',
            },
            razao_social: {
              type: 'string',
              description: 'Corporate name',
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ number',
            },
            contato_nome: {
              type: 'string',
              description: 'Contact person name (optional)',
            },
            contato_email: {
              type: 'string',
              description: 'Contact email (optional)',
            },
            contato_telefone: {
              type: 'string',
              description: 'Contact phone (optional)',
            },
            endereco: {
              type: 'string',
              description: 'Address',
            },
            cep: {
              type: 'string',
              description: 'ZIP code',
            },
            cidade: {
              type: 'string',
              description: 'City',
            },
            estado: {
              type: 'string',
              description: 'State',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome', 'razao_social', 'cnpj', 'endereco', 'cep', 'cidade', 'estado'],
        },
      },
      {
        name: 'sgp_get_fornecedor_details',
        description: 'Get supplier details',
        inputSchema: {
          type: 'object',
          properties: {
            fornecedor_id: {
              type: 'string',
              description: 'Supplier ID',
            },
          },
          required: ['fornecedor_id'],
        },
      },
      {
        name: 'sgp_update_fornecedor',
        description: 'Update supplier information',
        inputSchema: {
          type: 'object',
          properties: {
            fornecedor_id: {
              type: 'string',
              description: 'Supplier ID',
            },
            nome: {
              type: 'string',
              description: 'Supplier name (optional)',
            },
            razao_social: {
              type: 'string',
              description: 'Corporate name (optional)',
            },
            contato_nome: {
              type: 'string',
              description: 'Contact person name (optional)',
            },
            contato_email: {
              type: 'string',
              description: 'Contact email (optional)',
            },
            contato_telefone: {
              type: 'string',
              description: 'Contact phone (optional)',
            },
            endereco: {
              type: 'string',
              description: 'Address (optional)',
            },
            cep: {
              type: 'string',
              description: 'ZIP code (optional)',
            },
            cidade: {
              type: 'string',
              description: 'City (optional)',
            },
            estado: {
              type: 'string',
              description: 'State (optional)',
            },
            status: {
              type: 'string',
              description: 'Status (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['fornecedor_id'],
        },
      },
      {
        name: 'sgp_delete_fornecedor',
        description: 'Delete a supplier',
        inputSchema: {
          type: 'object',
          properties: {
            fornecedor_id: {
              type: 'string',
              description: 'Supplier ID',
            },
          },
          required: ['fornecedor_id'],
        },
      },

      // GESTÃO DE CATEGORIAS
      {
        name: 'sgp_list_categorias',
        description: 'List product categories with hierarchy',
        inputSchema: {
          type: 'object',
          properties: {
            categoria_pai_id: {
              type: 'number',
              description: 'Filter by parent category ID (optional)',
            },
            nivel: {
              type: 'number',
              description: 'Filter by hierarchy level (optional)',
            },
            status: {
              type: 'string',
              description: 'Filter by status (ativa, inativa) (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_create_categoria',
        description: 'Create a new product category',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Category name',
            },
            descricao: {
              type: 'string',
              description: 'Category description (optional)',
            },
            categoria_pai_id: {
              type: 'number',
              description: 'Parent category ID (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome'],
        },
      },
      {
        name: 'sgp_get_categoria_details',
        description: 'Get category details',
        inputSchema: {
          type: 'object',
          properties: {
            categoria_id: {
              type: 'string',
              description: 'Category ID',
            },
          },
          required: ['categoria_id'],
        },
      },
      {
        name: 'sgp_update_categoria',
        description: 'Update category information',
        inputSchema: {
          type: 'object',
          properties: {
            categoria_id: {
              type: 'string',
              description: 'Category ID',
            },
            nome: {
              type: 'string',
              description: 'Category name (optional)',
            },
            descricao: {
              type: 'string',
              description: 'Category description (optional)',
            },
            categoria_pai_id: {
              type: 'number',
              description: 'Parent category ID (optional)',
            },
            status: {
              type: 'string',
              description: 'Category status (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['categoria_id'],
        },
      },
      {
        name: 'sgp_delete_categoria',
        description: 'Delete a category',
        inputSchema: {
          type: 'object',
          properties: {
            categoria_id: {
              type: 'string',
              description: 'Category ID',
            },
          },
          required: ['categoria_id'],
        },
      },

      // GESTÃO DE PRODUTOS EXPANDIDA
      {
        name: 'sgp_create_product',
        description: 'Create a new product with detailed information',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Product name',
            },
            categoria_id: {
              type: 'number',
              description: 'Category ID',
            },
            fornecedor_id: {
              type: 'number',
              description: 'Supplier ID (optional)',
            },
            codigo: {
              type: 'string',
              description: 'Product code',
            },
            unidade_medida: {
              type: 'string',
              description: 'Unit of measurement',
            },
            estoque_minimo: {
              type: 'number',
              description: 'Minimum stock level',
            },
            valor_compra: {
              type: 'number',
              description: 'Purchase price',
            },
            valor_venda: {
              type: 'number',
              description: 'Sale price',
            },
            localizacao: {
              type: 'string',
              description: 'Storage location (optional)',
            },
            peso: {
              type: 'number',
              description: 'Product weight in kg (optional)',
            },
            dimensoes: {
              type: 'object',
              description: 'Product dimensions in cm (optional)',
              properties: {
                altura: { type: 'number' },
                largura: { type: 'number' },
                profundidade: { type: 'number' },
              },
            },
            garantia_meses: {
              type: 'number',
              description: 'Warranty period in months (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome', 'categoria_id', 'codigo', 'unidade_medida', 'estoque_minimo', 'valor_compra', 'valor_venda'],
        },
      },
      {
        name: 'sgp_get_product_details_extended',
        description: 'Get extended product details with movements and tracking',
        inputSchema: {
          type: 'object',
          properties: {
            produto_id: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['produto_id'],
        },
      },
      {
        name: 'sgp_update_product',
        description: 'Update product information',
        inputSchema: {
          type: 'object',
          properties: {
            produto_id: {
              type: 'string',
              description: 'Product ID',
            },
            nome: {
              type: 'string',
              description: 'Product name (optional)',
            },
            categoria_id: {
              type: 'number',
              description: 'Category ID (optional)',
            },
            fornecedor_id: {
              type: 'number',
              description: 'Supplier ID (optional)',
            },
            codigo: {
              type: 'string',
              description: 'Product code (optional)',
            },
            unidade_medida: {
              type: 'string',
              description: 'Unit of measurement (optional)',
            },
            estoque_minimo: {
              type: 'number',
              description: 'Minimum stock level (optional)',
            },
            valor_compra: {
              type: 'number',
              description: 'Purchase price (optional)',
            },
            valor_venda: {
              type: 'number',
              description: 'Sale price (optional)',
            },
            localizacao: {
              type: 'string',
              description: 'Storage location (optional)',
            },
            peso: {
              type: 'number',
              description: 'Product weight in kg (optional)',
            },
            dimensoes: {
              type: 'object',
              description: 'Product dimensions in cm (optional)',
              properties: {
                altura: { type: 'number' },
                largura: { type: 'number' },
                profundidade: { type: 'number' },
              },
            },
            garantia_meses: {
              type: 'number',
              description: 'Warranty period in months (optional)',
            },
            status: {
              type: 'string',
              description: 'Product status (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['produto_id'],
        },
      },
      {
        name: 'sgp_delete_product',
        description: 'Delete a product',
        inputSchema: {
          type: 'object',
          properties: {
            produto_id: {
              type: 'string',
              description: 'Product ID',
            },
          },
          required: ['produto_id'],
        },
      },

      // ==================== RADIUS ADVANCED SYSTEM TOOLS ====================

      // RADIUS USER MANAGEMENT
      {
        name: 'sgp_create_radius_user',
        description: 'Create a new RADIUS user for network authentication',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'RADIUS username',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
            grupo_id: {
              type: 'number',
              description: 'RADIUS group ID',
            },
            cliente_id: {
              type: 'number',
              description: 'Customer ID (optional)',
            },
            ip_fixo: {
              type: 'string',
              description: 'Fixed IP address (optional)',
            },
            perfil_velocidade: {
              type: 'string',
              description: 'Speed profile name',
            },
            ativo: {
              type: 'boolean',
              description: 'User active status (optional)',
            },
          },
          required: ['username', 'password', 'grupo_id', 'perfil_velocidade'],
        },
      },
      {
        name: 'sgp_list_radius_users',
        description: 'List RADIUS users with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'User status filter (optional)',
            },
            grupo_id: {
              type: 'number',
              description: 'Group ID filter (optional)',
            },
            cliente_id: {
              type: 'number',
              description: 'Customer ID filter (optional)',
            },
            perfil_velocidade: {
              type: 'string',
              description: 'Speed profile filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_radius_user',
        description: 'Get RADIUS user details by username',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'RADIUS username',
            },
          },
          required: ['username'],
        },
      },
      {
        name: 'sgp_update_radius_user',
        description: 'Update RADIUS user configuration',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'RADIUS username',
            },
            password: {
              type: 'string',
              description: 'New password (optional)',
            },
            grupo_id: {
              type: 'number',
              description: 'New group ID (optional)',
            },
            ip_fixo: {
              type: 'string',
              description: 'Fixed IP address (optional)',
            },
            perfil_velocidade: {
              type: 'string',
              description: 'Speed profile (optional)',
            },
            status: {
              type: 'string',
              description: 'User status (optional)',
            },
          },
          required: ['username'],
        },
      },
      {
        name: 'sgp_delete_radius_user',
        description: 'Delete RADIUS user account',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'RADIUS username',
            },
          },
          required: ['username'],
        },
      },
      {
        name: 'sgp_disconnect_radius_user',
        description: 'Disconnect RADIUS user session',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'RADIUS username',
            },
            reason: {
              type: 'string',
              description: 'Disconnection reason (optional)',
            },
          },
          required: ['username'],
        },
      },

      // RADIUS GROUP MANAGEMENT
      {
        name: 'sgp_create_radius_group',
        description: 'Create a new RADIUS group with speed profiles',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Group name',
            },
            descricao: {
              type: 'string',
              description: 'Group description (optional)',
            },
            perfil_velocidade: {
              type: 'string',
              description: 'Speed profile name',
            },
            download_speed: {
              type: 'number',
              description: 'Download speed in Mbps',
            },
            upload_speed: {
              type: 'number',
              description: 'Upload speed in Mbps',
            },
            limite_tempo: {
              type: 'number',
              description: 'Time limit in seconds (optional)',
            },
            limite_dados: {
              type: 'number',
              description: 'Data limit in bytes (optional)',
            },
            prioridade: {
              type: 'number',
              description: 'Group priority level',
            },
          },
          required: ['nome', 'perfil_velocidade', 'download_speed', 'upload_speed', 'prioridade'],
        },
      },
      {
        name: 'sgp_list_radius_groups',
        description: 'List RADIUS groups with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Group status filter (optional)',
            },
            perfil_velocidade: {
              type: 'string',
              description: 'Speed profile filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_radius_group',
        description: 'Get RADIUS group details',
        inputSchema: {
          type: 'object',
          properties: {
            group_id: {
              type: 'string',
              description: 'Group ID',
            },
          },
          required: ['group_id'],
        },
      },
      {
        name: 'sgp_update_radius_group',
        description: 'Update RADIUS group configuration',
        inputSchema: {
          type: 'object',
          properties: {
            group_id: {
              type: 'string',
              description: 'Group ID',
            },
            nome: {
              type: 'string',
              description: 'Group name (optional)',
            },
            descricao: {
              type: 'string',
              description: 'Group description (optional)',
            },
            perfil_velocidade: {
              type: 'string',
              description: 'Speed profile (optional)',
            },
            download_speed: {
              type: 'number',
              description: 'Download speed in Mbps (optional)',
            },
            upload_speed: {
              type: 'number',
              description: 'Upload speed in Mbps (optional)',
            },
            limite_tempo: {
              type: 'number',
              description: 'Time limit in seconds (optional)',
            },
            limite_dados: {
              type: 'number',
              description: 'Data limit in bytes (optional)',
            },
            prioridade: {
              type: 'number',
              description: 'Group priority (optional)',
            },
            status: {
              type: 'string',
              description: 'Group status (optional)',
              enum: ['ativo', 'inativo'],
            },
          },
          required: ['group_id'],
        },
      },
      {
        name: 'sgp_delete_radius_group',
        description: 'Delete RADIUS group',
        inputSchema: {
          type: 'object',
          properties: {
            group_id: {
              type: 'string',
              description: 'Group ID',
            },
          },
          required: ['group_id'],
        },
      },

      // RADIUS SESSION MANAGEMENT
      {
        name: 'sgp_list_radius_sessions',
        description: 'List active RADIUS sessions with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username filter (optional)',
            },
            nas_ip: {
              type: 'string',
              description: 'NAS IP filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Session status filter (optional)',
            },
            cliente_id: {
              type: 'number',
              description: 'Customer ID filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_radius_session',
        description: 'Get RADIUS session details',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Session ID',
            },
          },
          required: ['session_id'],
        },
      },
      {
        name: 'sgp_disconnect_radius_session',
        description: 'Disconnect specific RADIUS session',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Session ID',
            },
            reason: {
              type: 'string',
              description: 'Disconnection reason (optional)',
            },
          },
          required: ['session_id'],
        },
      },

      // RADIUS NAS MANAGEMENT
      {
        name: 'sgp_create_radius_nas',
        description: 'Create a new RADIUS NAS (Network Access Server)',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'NAS name',
            },
            endereco_ip: {
              type: 'string',
              description: 'NAS IP address',
            },
            shared_secret: {
              type: 'string',
              description: 'RADIUS shared secret',
            },
            tipo: {
              type: 'string',
              description: 'NAS type',
            },
            portas: {
              type: 'number',
              description: 'Number of ports',
            },
            community: {
              type: 'string',
              description: 'SNMP community (optional)',
            },
            descricao: {
              type: 'string',
              description: 'NAS description (optional)',
            },
          },
          required: ['nome', 'endereco_ip', 'shared_secret', 'tipo', 'portas'],
        },
      },
      {
        name: 'sgp_list_radius_nas',
        description: 'List RADIUS NAS devices with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'NAS status filter (optional)',
            },
            tipo: {
              type: 'string',
              description: 'NAS type filter (optional)',
            },
            endereco_ip: {
              type: 'string',
              description: 'IP address filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_radius_nas',
        description: 'Get RADIUS NAS details',
        inputSchema: {
          type: 'object',
          properties: {
            nas_id: {
              type: 'string',
              description: 'NAS ID',
            },
          },
          required: ['nas_id'],
        },
      },
      {
        name: 'sgp_update_radius_nas',
        description: 'Update RADIUS NAS configuration',
        inputSchema: {
          type: 'object',
          properties: {
            nas_id: {
              type: 'string',
              description: 'NAS ID',
            },
            nome: {
              type: 'string',
              description: 'NAS name (optional)',
            },
            endereco_ip: {
              type: 'string',
              description: 'IP address (optional)',
            },
            shared_secret: {
              type: 'string',
              description: 'RADIUS shared secret (optional)',
            },
            tipo: {
              type: 'string',
              description: 'NAS type (optional)',
            },
            portas: {
              type: 'number',
              description: 'Number of ports (optional)',
            },
            community: {
              type: 'string',
              description: 'SNMP community (optional)',
            },
            descricao: {
              type: 'string',
              description: 'Description (optional)',
            },
            status: {
              type: 'string',
              description: 'NAS status (optional)',
              enum: ['ativo', 'inativo', 'manutencao'],
            },
          },
          required: ['nas_id'],
        },
      },
      {
        name: 'sgp_delete_radius_nas',
        description: 'Delete RADIUS NAS device',
        inputSchema: {
          type: 'object',
          properties: {
            nas_id: {
              type: 'string',
              description: 'NAS ID',
            },
          },
          required: ['nas_id'],
        },
      },

      // RADIUS ATTRIBUTES
      {
        name: 'sgp_create_radius_attribute',
        description: 'Create a RADIUS attribute for user or group',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Attribute name',
            },
            tipo: {
              type: 'string',
              description: 'Attribute data type',
              enum: ['string', 'integer', 'ipaddr', 'date', 'octets'],
            },
            valor: {
              type: 'string',
              description: 'Attribute value',
            },
            grupo_id: {
              type: 'number',
              description: 'Group ID (optional)',
            },
            usuario_id: {
              type: 'number',
              description: 'User ID (optional)',
            },
            operador: {
              type: 'string',
              description: 'RADIUS operator',
              enum: ['=', ':=', '==', '+=', '!=', '>', '<', '>=', '<='],
            },
            categoria: {
              type: 'string',
              description: 'Attribute category',
              enum: ['check', 'reply'],
            },
            descricao: {
              type: 'string',
              description: 'Attribute description (optional)',
            },
          },
          required: ['nome', 'tipo', 'valor', 'operador', 'categoria'],
        },
      },
      {
        name: 'sgp_list_radius_attributes',
        description: 'List RADIUS attributes with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            categoria: {
              type: 'string',
              description: 'Attribute category filter (optional)',
              enum: ['check', 'reply'],
            },
            grupo_id: {
              type: 'number',
              description: 'Group ID filter (optional)',
            },
            usuario_id: {
              type: 'number',
              description: 'User ID filter (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Active status filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_update_radius_attribute',
        description: 'Update RADIUS attribute configuration',
        inputSchema: {
          type: 'object',
          properties: {
            attribute_id: {
              type: 'string',
              description: 'Attribute ID',
            },
            nome: {
              type: 'string',
              description: 'Attribute name (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Data type (optional)',
              enum: ['string', 'integer', 'ipaddr', 'date', 'octets'],
            },
            valor: {
              type: 'string',
              description: 'Attribute value (optional)',
            },
            operador: {
              type: 'string',
              description: 'RADIUS operator (optional)',
              enum: ['=', ':=', '==', '+=', '!=', '>', '<', '>=', '<='],
            },
            descricao: {
              type: 'string',
              description: 'Description (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Active status (optional)',
            },
          },
          required: ['attribute_id'],
        },
      },
      {
        name: 'sgp_delete_radius_attribute',
        description: 'Delete RADIUS attribute',
        inputSchema: {
          type: 'object',
          properties: {
            attribute_id: {
              type: 'string',
              description: 'Attribute ID',
            },
          },
          required: ['attribute_id'],
        },
      },

      // RADIUS ACCOUNTING & STATISTICS
      {
        name: 'sgp_get_radius_accounting',
        description: 'Get RADIUS accounting records with detailed session information',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username filter (optional)',
            },
            nas_ip: {
              type: 'string',
              description: 'NAS IP filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            session_id: {
              type: 'string',
              description: 'Session ID filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_radius_statistics',
        description: 'Get RADIUS usage statistics and analytics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Statistics period',
              enum: ['hoje', 'semana', 'mes', 'ano'],
            },
            nas_ip: {
              type: 'string',
              description: 'NAS IP filter (optional)',
            },
            grupo_id: {
              type: 'number',
              description: 'Group ID filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Custom start date (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'Custom end date (optional)',
            },
          },
          required: ['periodo'],
        },
      },

      // RADIUS CHECK & REPLY
      {
        name: 'sgp_create_radius_check',
        description: 'Create RADIUS check attribute for user authentication',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username',
            },
            attribute: {
              type: 'string',
              description: 'Check attribute name',
            },
            op: {
              type: 'string',
              description: 'RADIUS operator',
            },
            value: {
              type: 'string',
              description: 'Attribute value',
            },
            grupo_aplicado: {
              type: 'string',
              description: 'Applied group name (optional)',
            },
          },
          required: ['username', 'attribute', 'op', 'value'],
        },
      },
      {
        name: 'sgp_list_radius_checks',
        description: 'List RADIUS check attributes',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username filter (optional)',
            },
            attribute: {
              type: 'string',
              description: 'Attribute filter (optional)',
            },
            grupo_aplicado: {
              type: 'string',
              description: 'Group filter (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Active status filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_create_radius_reply',
        description: 'Create RADIUS reply attribute for user authorization',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username',
            },
            attribute: {
              type: 'string',
              description: 'Reply attribute name',
            },
            op: {
              type: 'string',
              description: 'RADIUS operator',
            },
            value: {
              type: 'string',
              description: 'Attribute value',
            },
            grupo_aplicado: {
              type: 'string',
              description: 'Applied group name (optional)',
            },
          },
          required: ['username', 'attribute', 'op', 'value'],
        },
      },
      {
        name: 'sgp_list_radius_replies',
        description: 'List RADIUS reply attributes',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username filter (optional)',
            },
            attribute: {
              type: 'string',
              description: 'Attribute filter (optional)',
            },
            grupo_aplicado: {
              type: 'string',
              description: 'Group filter (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Active status filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },

      // ==================== DOCUMENT AND CONTRACT SYSTEM TOOLS ====================

      // DOCUMENT TEMPLATE MANAGEMENT
      {
        name: 'sgp_create_document_template',
        description: 'Create a new document template for contracts, terms, and notifications',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Template name',
            },
            tipo: {
              type: 'string',
              description: 'Document type',
              enum: ['contrato', 'termo', 'aditivo', 'rescisao', 'notificacao'],
            },
            categoria: {
              type: 'string',
              description: 'Template category',
            },
            conteudo: {
              type: 'string',
              description: 'Template content with variables',
            },
            variaveis: {
              type: 'array',
              description: 'Template variables',
              items: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  tipo: { type: 'string', enum: ['texto', 'numero', 'data', 'booleano'] },
                  obrigatorio: { type: 'boolean' },
                  descricao: { type: 'string' },
                },
                required: ['nome', 'tipo', 'obrigatorio'],
              },
            },
            versao: {
              type: 'string',
              description: 'Template version',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['nome', 'tipo', 'categoria', 'conteudo', 'variaveis', 'versao'],
        },
      },
      {
        name: 'sgp_list_document_templates',
        description: 'List document templates with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            tipo: {
              type: 'string',
              description: 'Document type filter (optional)',
            },
            categoria: {
              type: 'string',
              description: 'Category filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Status filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_document_template',
        description: 'Get document template details',
        inputSchema: {
          type: 'object',
          properties: {
            template_id: {
              type: 'string',
              description: 'Template ID',
            },
          },
          required: ['template_id'],
        },
      },
      {
        name: 'sgp_update_document_template',
        description: 'Update document template configuration',
        inputSchema: {
          type: 'object',
          properties: {
            template_id: {
              type: 'string',
              description: 'Template ID',
            },
            nome: {
              type: 'string',
              description: 'Template name (optional)',
            },
            categoria: {
              type: 'string',
              description: 'Category (optional)',
            },
            conteudo: {
              type: 'string',
              description: 'Template content (optional)',
            },
            variaveis: {
              type: 'array',
              description: 'Template variables (optional)',
              items: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  tipo: { type: 'string', enum: ['texto', 'numero', 'data', 'booleano'] },
                  obrigatorio: { type: 'boolean' },
                  descricao: { type: 'string' },
                },
              },
            },
            status: {
              type: 'string',
              description: 'Template status (optional)',
              enum: ['ativo', 'inativo', 'rascunho'],
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['template_id'],
        },
      },

      // CONTRACT DOCUMENT MANAGEMENT
      {
        name: 'sgp_create_contract_document',
        description: 'Create a new contract document from template or custom content',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'number',
              description: 'Contract ID',
            },
            template_id: {
              type: 'number',
              description: 'Template ID (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Document type',
              enum: ['contrato_principal', 'aditivo', 'rescisao', 'notificacao'],
            },
            titulo: {
              type: 'string',
              description: 'Document title',
            },
            conteudo: {
              type: 'string',
              description: 'Document content',
            },
            data_vencimento: {
              type: 'string',
              description: 'Expiration date (optional)',
            },
            variaveis: {
              type: 'object',
              description: 'Template variables data (optional)',
            },
          },
          required: ['contrato_id', 'tipo', 'titulo', 'conteudo'],
        },
      },
      {
        name: 'sgp_list_contract_documents',
        description: 'List contract documents with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'number',
              description: 'Contract ID filter (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Document type filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Status filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_contract_document',
        description: 'Get contract document details',
        inputSchema: {
          type: 'object',
          properties: {
            document_id: {
              type: 'string',
              description: 'Document ID',
            },
          },
          required: ['document_id'],
        },
      },
      {
        name: 'sgp_update_contract_document',
        description: 'Update contract document configuration',
        inputSchema: {
          type: 'object',
          properties: {
            document_id: {
              type: 'string',
              description: 'Document ID',
            },
            titulo: {
              type: 'string',
              description: 'Document title (optional)',
            },
            conteudo: {
              type: 'string',
              description: 'Document content (optional)',
            },
            status: {
              type: 'string',
              description: 'Document status (optional)',
              enum: ['rascunho', 'ativo', 'assinado', 'cancelado', 'vencido'],
            },
            data_vencimento: {
              type: 'string',
              description: 'Expiration date (optional)',
            },
          },
          required: ['document_id'],
        },
      },

      // CONTRACT STATUS MANAGEMENT
      {
        name: 'sgp_get_contract_status',
        description: 'Get comprehensive contract status with history and pending actions',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
          },
          required: ['contrato_id'],
        },
      },
      {
        name: 'sgp_update_contract_status',
        description: 'Update contract status with reason and effective date',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
            novo_status: {
              type: 'string',
              description: 'New contract status',
            },
            motivo: {
              type: 'string',
              description: 'Reason for status change (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional observations (optional)',
            },
            data_vigencia: {
              type: 'string',
              description: 'Effective date (optional)',
            },
          },
          required: ['contrato_id', 'novo_status'],
        },
      },

      // DIGITAL SIGNATURE MANAGEMENT
      {
        name: 'sgp_create_digital_signature',
        description: 'Create digital signature request for document',
        inputSchema: {
          type: 'object',
          properties: {
            documento_id: {
              type: 'number',
              description: 'Document ID',
            },
            signatario_id: {
              type: 'number',
              description: 'Signatory ID',
            },
            signatario_nome: {
              type: 'string',
              description: 'Signatory name',
            },
            signatario_email: {
              type: 'string',
              description: 'Signatory email',
            },
            tipo_signatario: {
              type: 'string',
              description: 'Signatory type',
              enum: ['cliente', 'empresa', 'testemunha', 'avalista'],
            },
            data_expiracao: {
              type: 'string',
              description: 'Signature expiration date',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['documento_id', 'signatario_id', 'signatario_nome', 'signatario_email', 'tipo_signatario', 'data_expiracao'],
        },
      },
      {
        name: 'sgp_list_digital_signatures',
        description: 'List digital signatures with status tracking',
        inputSchema: {
          type: 'object',
          properties: {
            documento_id: {
              type: 'number',
              description: 'Document ID filter (optional)',
            },
            signatario_id: {
              type: 'number',
              description: 'Signatory ID filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Signature status filter (optional)',
            },
            tipo_signatario: {
              type: 'string',
              description: 'Signatory type filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_process_digital_signature',
        description: 'Process digital signature (sign or refuse)',
        inputSchema: {
          type: 'object',
          properties: {
            signature_id: {
              type: 'string',
              description: 'Signature ID',
            },
            acao: {
              type: 'string',
              description: 'Action to perform',
              enum: ['assinar', 'recusar'],
            },
            certificado_digital: {
              type: 'object',
              description: 'Digital certificate data (optional)',
              properties: {
                tipo: { type: 'string' },
                serial: { type: 'string' },
                emissor: { type: 'string' },
                validade: { type: 'string' },
              },
            },
            ip_assinatura: {
              type: 'string',
              description: 'Signature IP address (optional)',
            },
            localizacao_assinatura: {
              type: 'string',
              description: 'Signature location (optional)',
            },
            motivo_recusa: {
              type: 'string',
              description: 'Refusal reason (required if refusing)',
            },
          },
          required: ['signature_id', 'acao'],
        },
      },

      // CONTRACT ADDENDUM MANAGEMENT
      {
        name: 'sgp_create_contract_addendum',
        description: 'Create contract addendum for plan changes, value adjustments, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'number',
              description: 'Contract ID',
            },
            tipo: {
              type: 'string',
              description: 'Addendum type',
              enum: ['mudanca_plano', 'alteracao_valor', 'mudanca_endereco', 'adicao_servico', 'outros'],
            },
            titulo: {
              type: 'string',
              description: 'Addendum title',
            },
            descricao: {
              type: 'string',
              description: 'Addendum description',
            },
            valor_anterior: {
              type: 'number',
              description: 'Previous value (optional)',
            },
            valor_novo: {
              type: 'number',
              description: 'New value (optional)',
            },
            plano_anterior: {
              type: 'string',
              description: 'Previous plan (optional)',
            },
            plano_novo: {
              type: 'string',
              description: 'New plan (optional)',
            },
            data_vigencia: {
              type: 'string',
              description: 'Effective date',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['contrato_id', 'tipo', 'titulo', 'descricao', 'data_vigencia'],
        },
      },
      {
        name: 'sgp_list_contract_addendums',
        description: 'List contract addendums with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'number',
              description: 'Contract ID filter (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Addendum type filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Status filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_approve_contract_addendum',
        description: 'Approve or reject contract addendum',
        inputSchema: {
          type: 'object',
          properties: {
            addendum_id: {
              type: 'string',
              description: 'Addendum ID',
            },
            aprovado: {
              type: 'boolean',
              description: 'Approval decision',
            },
            observacoes: {
              type: 'string',
              description: 'Approval notes (optional)',
            },
            data_vigencia: {
              type: 'string',
              description: 'Effective date (optional)',
            },
          },
          required: ['addendum_id', 'aprovado'],
        },
      },

      // LEGAL NOTIFICATION MANAGEMENT
      {
        name: 'sgp_create_legal_notification',
        description: 'Create legal notification for customer communication',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'number',
              description: 'Customer ID',
            },
            contrato_id: {
              type: 'number',
              description: 'Contract ID (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Notification type',
              enum: ['cobranca', 'suspensao', 'cancelamento', 'mudanca_contrato', 'geral'],
            },
            titulo: {
              type: 'string',
              description: 'Notification title',
            },
            conteudo: {
              type: 'string',
              description: 'Notification content',
            },
            prazo_resposta: {
              type: 'number',
              description: 'Response deadline in days (optional)',
            },
            canais_envio: {
              type: 'array',
              description: 'Delivery channels',
              items: {
                type: 'object',
                properties: {
                  canal: { type: 'string', enum: ['email', 'sms', 'whatsapp', 'correio', 'app'] },
                  endereco: { type: 'string' },
                },
                required: ['canal', 'endereco'],
              },
            },
          },
          required: ['cliente_id', 'tipo', 'titulo', 'conteudo', 'canais_envio'],
        },
      },
      {
        name: 'sgp_list_legal_notifications',
        description: 'List legal notifications with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            cliente_id: {
              type: 'number',
              description: 'Customer ID filter (optional)',
            },
            contrato_id: {
              type: 'number',
              description: 'Contract ID filter (optional)',
            },
            tipo: {
              type: 'string',
              description: 'Notification type filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Status filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_update_notification_status',
        description: 'Update legal notification delivery status',
        inputSchema: {
          type: 'object',
          properties: {
            notification_id: {
              type: 'string',
              description: 'Notification ID',
            },
            status: {
              type: 'string',
              description: 'New status',
              enum: ['enviada', 'entregue', 'respondida', 'vencida'],
            },
            resposta_cliente: {
              type: 'string',
              description: 'Customer response (optional)',
            },
            comprovante_entrega: {
              type: 'string',
              description: 'Delivery proof (optional)',
            },
            canal_entrega: {
              type: 'string',
              description: 'Delivery channel (optional)',
            },
          },
          required: ['notification_id', 'status'],
        },
      },

      // DOCUMENT APPROVAL MANAGEMENT
      {
        name: 'sgp_create_document_approval',
        description: 'Create document approval workflow',
        inputSchema: {
          type: 'object',
          properties: {
            documento_id: {
              type: 'number',
              description: 'Document ID',
            },
            documento_tipo: {
              type: 'string',
              description: 'Document type',
            },
            aprovador_id: {
              type: 'number',
              description: 'Approver ID',
            },
            nivel_aprovacao: {
              type: 'number',
              description: 'Approval level',
            },
            observacoes: {
              type: 'string',
              description: 'Approval notes (optional)',
            },
          },
          required: ['documento_id', 'documento_tipo', 'aprovador_id', 'nivel_aprovacao'],
        },
      },
      {
        name: 'sgp_list_document_approvals',
        description: 'List document approvals with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            documento_id: {
              type: 'number',
              description: 'Document ID filter (optional)',
            },
            aprovador_id: {
              type: 'number',
              description: 'Approver ID filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Status filter (optional)',
            },
            nivel_aprovacao: {
              type: 'number',
              description: 'Approval level filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_process_document_approval',
        description: 'Process document approval (approve or reject)',
        inputSchema: {
          type: 'object',
          properties: {
            approval_id: {
              type: 'string',
              description: 'Approval ID',
            },
            acao: {
              type: 'string',
              description: 'Action to perform',
              enum: ['aprovar', 'rejeitar'],
            },
            motivo_rejeicao: {
              type: 'string',
              description: 'Rejection reason (required if rejecting)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['approval_id', 'acao'],
        },
      },

      // CONTRACT RENEWAL MANAGEMENT
      {
        name: 'sgp_create_contract_renewal',
        description: 'Create contract renewal with new terms',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'number',
              description: 'Contract ID',
            },
            tipo_renovacao: {
              type: 'string',
              description: 'Renewal type',
              enum: ['automatica', 'manual', 'negociada'],
            },
            data_nova_vigencia: {
              type: 'string',
              description: 'New validity start date',
            },
            novo_periodo_meses: {
              type: 'number',
              description: 'New period in months',
            },
            valor_novo: {
              type: 'number',
              description: 'New contract value',
            },
            plano_novo: {
              type: 'string',
              description: 'New plan (optional)',
            },
            condicoes_especiais: {
              type: 'string',
              description: 'Special conditions (optional)',
            },
            observacoes: {
              type: 'string',
              description: 'Additional notes (optional)',
            },
          },
          required: ['contrato_id', 'tipo_renovacao', 'data_nova_vigencia', 'novo_periodo_meses', 'valor_novo'],
        },
      },
      {
        name: 'sgp_list_contract_renewals',
        description: 'List contract renewals with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'number',
              description: 'Contract ID filter (optional)',
            },
            tipo_renovacao: {
              type: 'string',
              description: 'Renewal type filter (optional)',
            },
            status: {
              type: 'string',
              description: 'Status filter (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_process_contract_renewal',
        description: 'Process contract renewal (execute or cancel)',
        inputSchema: {
          type: 'object',
          properties: {
            renewal_id: {
              type: 'string',
              description: 'Renewal ID',
            },
            acao: {
              type: 'string',
              description: 'Action to perform',
              enum: ['processar', 'cancelar'],
            },
            observacoes: {
              type: 'string',
              description: 'Processing notes (optional)',
            },
          },
          required: ['renewal_id', 'acao'],
        },
      },

      // SPECIAL FUNCTIONS
      {
        name: 'sgp_generate_contract_pdf',
        description: 'Generate PDF version of contract with all documents',
        inputSchema: {
          type: 'object',
          properties: {
            contrato_id: {
              type: 'string',
              description: 'Contract ID',
            },
            include_addendums: {
              type: 'boolean',
              description: 'Include addendums in PDF (optional)',
            },
            include_signatures: {
              type: 'boolean',
              description: 'Include signature pages (optional)',
            },
            template_id: {
              type: 'number',
              description: 'Specific template ID (optional)',
            },
          },
          required: ['contrato_id'],
        },
      },
      {
        name: 'sgp_validate_document_integrity',
        description: 'Validate document integrity and detect tampering',
        inputSchema: {
          type: 'object',
          properties: {
            document_id: {
              type: 'string',
              description: 'Document ID',
            },
          },
          required: ['document_id'],
        },
      },

      // ==================== ANALYTICS AND REPORTING SYSTEM TOOLS ====================

      // SYSTEM PERFORMANCE ANALYTICS
      {
        name: 'sgp_get_system_statistics',
        description: 'Get comprehensive system performance statistics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Statistics period (optional)',
              enum: ['hoje', 'semana', 'mes', 'ano'],
            },
          },
        },
      },
      {
        name: 'sgp_get_system_health',
        description: 'Get real-time system health metrics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // FINANCIAL ANALYTICS
      {
        name: 'sgp_get_financial_report',
        description: 'Generate comprehensive financial reports with payment analytics',
        inputSchema: {
          type: 'object',
          properties: {
            data_inicio: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD)',
            },
            data_fim: {
              type: 'string',
              description: 'End date (YYYY-MM-DD)',
            },
            banco_id: {
              type: 'number',
              description: 'Bank ID filter (optional)',
            },
            tipo_relatorio: {
              type: 'string',
              description: 'Report type (optional)',
              enum: ['completo', 'resumo', 'detalhado'],
            },
            incluir_previsoes: {
              type: 'boolean',
              description: 'Include forecasts (optional)',
            },
          },
          required: ['data_inicio', 'data_fim'],
        },
      },
      {
        name: 'sgp_get_revenue_forecast',
        description: 'Generate revenue forecasting with scenarios and recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            periodo_analise: {
              type: 'number',
              description: 'Analysis period in months',
            },
            include_scenarios: {
              type: 'boolean',
              description: 'Include optimistic/realistic/pessimistic scenarios (optional)',
            },
            include_recommendations: {
              type: 'boolean',
              description: 'Include strategic recommendations (optional)',
            },
            fatores_externos: {
              type: 'array',
              description: 'External factors to consider (optional)',
              items: { type: 'string' },
            },
          },
          required: ['periodo_analise'],
        },
      },
      {
        name: 'sgp_get_cash_flow_analysis',
        description: 'Analyze cash flow patterns with projections',
        inputSchema: {
          type: 'object',
          properties: {
            data_inicio: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD)',
            },
            data_fim: {
              type: 'string',
              description: 'End date (YYYY-MM-DD)',
            },
            granularidade: {
              type: 'string',
              description: 'Data granularity (optional)',
              enum: ['diario', 'semanal', 'mensal'],
            },
          },
          required: ['data_inicio', 'data_fim'],
        },
      },

      // NETWORK ANALYTICS
      {
        name: 'sgp_get_network_analytics',
        description: 'Get comprehensive network performance and capacity analytics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Analysis period (optional)',
              enum: ['hoje', 'semana', 'mes'],
            },
            incluir_alertas: {
              type: 'boolean',
              description: 'Include network alerts (optional)',
            },
            incluir_trafego: {
              type: 'boolean',
              description: 'Include traffic analysis (optional)',
            },
            olt_id: {
              type: 'number',
              description: 'Specific OLT ID filter (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_capacity_utilization',
        description: 'Get network capacity utilization report with expansion recommendations',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_get_network_performance',
        description: 'Get detailed network performance metrics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Performance period',
              enum: ['hoje', 'semana', 'mes'],
            },
          },
          required: ['periodo'],
        },
      },

      // CUSTOMER ANALYTICS
      {
        name: 'sgp_get_customer_analytics',
        description: 'Get comprehensive customer behavior and segmentation analytics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Analysis period (optional)',
            },
            segmento: {
              type: 'string',
              description: 'Customer segment filter (optional)',
              enum: ['residencial', 'empresarial', 'todos'],
            },
            incluir_churn: {
              type: 'boolean',
              description: 'Include churn analysis (optional)',
            },
            incluir_satisfacao: {
              type: 'boolean',
              description: 'Include satisfaction metrics (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_churn_analysis',
        description: 'Get detailed churn analysis with predictions and risk factors',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Analysis period',
            },
          },
          required: ['periodo'],
        },
      },
      {
        name: 'sgp_get_usage_patterns',
        description: 'Analyze customer usage patterns and detect anomalies',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Analysis period',
            },
            agrupamento: {
              type: 'string',
              description: 'Data grouping (optional)',
              enum: ['hora', 'dia', 'semana'],
            },
            incluir_anomalias: {
              type: 'boolean',
              description: 'Include anomaly detection (optional)',
            },
          },
          required: ['periodo'],
        },
      },

      // SUPPORT ANALYTICS
      {
        name: 'sgp_get_support_analytics',
        description: 'Get comprehensive support and call center analytics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Analysis period',
            },
            incluir_ura: {
              type: 'boolean',
              description: 'Include URA metrics (optional)',
            },
            incluir_satisfacao: {
              type: 'boolean',
              description: 'Include satisfaction metrics (optional)',
            },
            atendente_id: {
              type: 'number',
              description: 'Specific agent ID filter (optional)',
            },
          },
          required: ['periodo'],
        },
      },
      {
        name: 'sgp_get_ura_metrics',
        description: 'Get detailed URA performance and queue metrics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'Metrics period',
              enum: ['hoje', 'semana', 'mes'],
            },
          },
          required: ['periodo'],
        },
      },

      // OPERATIONAL KPIs
      {
        name: 'sgp_get_operational_kpis',
        description: 'Get comprehensive operational KPIs and efficiency metrics',
        inputSchema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              description: 'KPI period',
            },
          },
          required: ['periodo'],
        },
      },
      {
        name: 'sgp_get_efficiency_metrics',
        description: 'Get detailed efficiency metrics for technicians and processes',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // GEOGRAPHIC ANALYTICS
      {
        name: 'sgp_get_geographic_analytics',
        description: 'Get geographic distribution and market penetration analytics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sgp_get_market_penetration',
        description: 'Analyze market penetration and expansion opportunities',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // COMPETITIVE ANALYTICS
      {
        name: 'sgp_get_competitive_analysis',
        description: 'Get competitive analysis with market benchmarks',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // CUSTOM REPORTS
      {
        name: 'sgp_generate_custom_report',
        description: 'Generate custom reports with flexible configuration and scheduling',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Report name',
            },
            tipo: {
              type: 'string',
              description: 'Report type',
              enum: ['financeiro', 'operacional', 'cliente', 'rede', 'personalizado'],
            },
            periodo: {
              type: 'string',
              description: 'Report period',
            },
            metricas: {
              type: 'array',
              description: 'Metrics to include',
              items: { type: 'string' },
            },
            filtros: {
              type: 'object',
              description: 'Additional filters',
            },
            formato: {
              type: 'string',
              description: 'Output format',
              enum: ['json', 'pdf', 'excel', 'csv'],
            },
            agendamento: {
              type: 'object',
              description: 'Schedule configuration (optional)',
              properties: {
                frequencia: {
                  type: 'string',
                  enum: ['diario', 'semanal', 'mensal'],
                },
                emails_destinatarios: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
          required: ['nome', 'tipo', 'periodo', 'metricas', 'formato'],
        },
      },

      // ================== EXTERNAL INTEGRATIONS SYSTEM TOOLS ==================

      // WEBHOOK MANAGEMENT
      {
        name: 'sgp_create_webhook',
        description: 'Create a new webhook configuration for external integrations',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Webhook name',
            },
            url: {
              type: 'string',
              description: 'Webhook URL endpoint',
            },
            evento: {
              type: 'string',
              description: 'Event that triggers the webhook',
              enum: ['cliente.criado', 'contrato.ativado', 'fatura.gerada', 'pagamento.recebido', 'ticket.criado'],
            },
            headers: {
              type: 'object',
              description: 'Custom headers for webhook requests (optional)',
              additionalProperties: { type: 'string' },
            },
            secret: {
              type: 'string',
              description: 'Secret for webhook signature validation (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Whether webhook is active (optional, default: true)',
            },
          },
          required: ['nome', 'url', 'evento'],
        },
      },
      {
        name: 'sgp_list_webhooks',
        description: 'List webhook configurations with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            evento: {
              type: 'string',
              description: 'Filter by event type (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_webhook',
        description: 'Get webhook configuration details',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_id: {
              type: 'number',
              description: 'Webhook ID',
            },
          },
          required: ['webhook_id'],
        },
      },
      {
        name: 'sgp_update_webhook',
        description: 'Update webhook configuration',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_id: {
              type: 'number',
              description: 'Webhook ID',
            },
            nome: {
              type: 'string',
              description: 'Webhook name (optional)',
            },
            url: {
              type: 'string',
              description: 'Webhook URL (optional)',
            },
            evento: {
              type: 'string',
              description: 'Event type (optional)',
            },
            headers: {
              type: 'object',
              description: 'Custom headers (optional)',
              additionalProperties: { type: 'string' },
            },
            secret: {
              type: 'string',
              description: 'Webhook secret (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Active status (optional)',
            },
          },
          required: ['webhook_id'],
        },
      },
      {
        name: 'sgp_delete_webhook',
        description: 'Delete webhook configuration',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_id: {
              type: 'number',
              description: 'Webhook ID',
            },
          },
          required: ['webhook_id'],
        },
      },
      {
        name: 'sgp_test_webhook',
        description: 'Test webhook connectivity and response',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_id: {
              type: 'number',
              description: 'Webhook ID',
            },
          },
          required: ['webhook_id'],
        },
      },
      {
        name: 'sgp_get_webhook_executions',
        description: 'Get webhook execution history with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_id: {
              type: 'number',
              description: 'Webhook ID',
            },
            status: {
              type: 'string',
              description: 'Execution status filter (optional)',
              enum: ['success', 'failed'],
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
          required: ['webhook_id'],
        },
      },

      // EXTERNAL API CONFIGURATION
      {
        name: 'sgp_create_api_config',
        description: 'Create external API integration configuration',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'API configuration name',
            },
            tipo: {
              type: 'string',
              description: 'API type',
              enum: ['rest', 'soap', 'graphql'],
            },
            base_url: {
              type: 'string',
              description: 'Base URL for the API',
            },
            auth_type: {
              type: 'string',
              description: 'Authentication type',
              enum: ['none', 'basic', 'bearer', 'api_key'],
            },
            auth_config: {
              type: 'object',
              description: 'Authentication configuration',
              additionalProperties: true,
            },
            headers: {
              type: 'object',
              description: 'Default headers (optional)',
              additionalProperties: { type: 'string' },
            },
            timeout: {
              type: 'number',
              description: 'Request timeout in seconds (optional)',
            },
            retry_attempts: {
              type: 'number',
              description: 'Number of retry attempts (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Whether configuration is active (optional)',
            },
          },
          required: ['nome', 'tipo', 'base_url', 'auth_type', 'auth_config'],
        },
      },
      {
        name: 'sgp_list_api_configs',
        description: 'List external API configurations',
        inputSchema: {
          type: 'object',
          properties: {
            tipo: {
              type: 'string',
              description: 'Filter by API type (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_api_config',
        description: 'Get external API configuration details',
        inputSchema: {
          type: 'object',
          properties: {
            api_id: {
              type: 'number',
              description: 'API configuration ID',
            },
          },
          required: ['api_id'],
        },
      },
      {
        name: 'sgp_update_api_config',
        description: 'Update external API configuration',
        inputSchema: {
          type: 'object',
          properties: {
            api_id: {
              type: 'number',
              description: 'API configuration ID',
            },
            nome: {
              type: 'string',
              description: 'Configuration name (optional)',
            },
            base_url: {
              type: 'string',
              description: 'Base URL (optional)',
            },
            auth_config: {
              type: 'object',
              description: 'Authentication configuration (optional)',
              additionalProperties: true,
            },
            headers: {
              type: 'object',
              description: 'Default headers (optional)',
              additionalProperties: { type: 'string' },
            },
            timeout: {
              type: 'number',
              description: 'Request timeout (optional)',
            },
            retry_attempts: {
              type: 'number',
              description: 'Retry attempts (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Active status (optional)',
            },
          },
          required: ['api_id'],
        },
      },
      {
        name: 'sgp_delete_api_config',
        description: 'Delete external API configuration',
        inputSchema: {
          type: 'object',
          properties: {
            api_id: {
              type: 'number',
              description: 'API configuration ID',
            },
          },
          required: ['api_id'],
        },
      },
      {
        name: 'sgp_test_api_config',
        description: 'Test external API configuration connectivity',
        inputSchema: {
          type: 'object',
          properties: {
            api_id: {
              type: 'number',
              description: 'API configuration ID',
            },
          },
          required: ['api_id'],
        },
      },

      // PAYMENT GATEWAY CONFIGURATION
      {
        name: 'sgp_create_payment_gateway',
        description: 'Create payment gateway integration configuration',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Gateway configuration name',
            },
            provedor: {
              type: 'string',
              description: 'Payment provider',
              enum: ['pagseguro', 'mercadopago', 'cielo', 'rede', 'stone', 'getnet'],
            },
            ambiente: {
              type: 'string',
              description: 'Environment type',
              enum: ['sandbox', 'producao'],
            },
            credenciais: {
              type: 'object',
              description: 'Provider credentials',
              additionalProperties: true,
            },
            taxa_percentual: {
              type: 'number',
              description: 'Percentage fee (optional)',
            },
            taxa_fixa: {
              type: 'number',
              description: 'Fixed fee in cents (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Whether gateway is active (optional)',
            },
          },
          required: ['nome', 'provedor', 'ambiente', 'credenciais'],
        },
      },
      {
        name: 'sgp_list_payment_gateways',
        description: 'List payment gateway configurations',
        inputSchema: {
          type: 'object',
          properties: {
            provedor: {
              type: 'string',
              description: 'Filter by provider (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_get_payment_gateway',
        description: 'Get payment gateway configuration details',
        inputSchema: {
          type: 'object',
          properties: {
            gateway_id: {
              type: 'number',
              description: 'Gateway configuration ID',
            },
          },
          required: ['gateway_id'],
        },
      },
      {
        name: 'sgp_update_payment_gateway',
        description: 'Update payment gateway configuration',
        inputSchema: {
          type: 'object',
          properties: {
            gateway_id: {
              type: 'number',
              description: 'Gateway configuration ID',
            },
            nome: {
              type: 'string',
              description: 'Configuration name (optional)',
            },
            credenciais: {
              type: 'object',
              description: 'Provider credentials (optional)',
              additionalProperties: true,
            },
            taxa_percentual: {
              type: 'number',
              description: 'Percentage fee (optional)',
            },
            taxa_fixa: {
              type: 'number',
              description: 'Fixed fee (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Active status (optional)',
            },
          },
          required: ['gateway_id'],
        },
      },

      // SMS AND EMAIL PROVIDERS
      {
        name: 'sgp_create_sms_provider',
        description: 'Create SMS provider integration configuration',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Provider configuration name',
            },
            provedor: {
              type: 'string',
              description: 'SMS provider',
              enum: ['zenvia', 'twilio', 'totalvoice', 'human'],
            },
            credenciais: {
              type: 'object',
              description: 'Provider credentials',
              additionalProperties: true,
            },
            custo_por_sms: {
              type: 'number',
              description: 'Cost per SMS in cents (optional)',
            },
            remetente: {
              type: 'string',
              description: 'Default sender ID (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Whether provider is active (optional)',
            },
          },
          required: ['nome', 'provedor', 'credenciais'],
        },
      },
      {
        name: 'sgp_list_sms_providers',
        description: 'List SMS provider configurations',
        inputSchema: {
          type: 'object',
          properties: {
            provedor: {
              type: 'string',
              description: 'Filter by provider (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_create_email_provider',
        description: 'Create email provider integration configuration',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Provider configuration name',
            },
            provedor: {
              type: 'string',
              description: 'Email provider',
              enum: ['sendgrid', 'mailgun', 'ses', 'mailchimp', 'smtp'],
            },
            credenciais: {
              type: 'object',
              description: 'Provider credentials',
              additionalProperties: true,
            },
            remetente_padrao: {
              type: 'string',
              description: 'Default sender email (optional)',
            },
            nome_remetente: {
              type: 'string',
              description: 'Default sender name (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Whether provider is active (optional)',
            },
          },
          required: ['nome', 'provedor', 'credenciais'],
        },
      },
      {
        name: 'sgp_list_email_providers',
        description: 'List email provider configurations',
        inputSchema: {
          type: 'object',
          properties: {
            provedor: {
              type: 'string',
              description: 'Filter by provider (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },

      // BANK INTEGRATIONS
      {
        name: 'sgp_create_bank_integration',
        description: 'Create bank integration configuration for automatic file processing',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Integration configuration name',
            },
            banco: {
              type: 'string',
              description: 'Bank name',
              enum: ['itau', 'bradesco', 'bb', 'santander', 'caixa', 'sicoob', 'sicredi'],
            },
            tipo_integracao: {
              type: 'string',
              description: 'Integration type',
              enum: ['cnab240', 'cnab400', 'api'],
            },
            configuracao: {
              type: 'object',
              description: 'Bank-specific configuration',
              additionalProperties: true,
            },
            auto_processar: {
              type: 'boolean',
              description: 'Auto-process return files (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Whether integration is active (optional)',
            },
          },
          required: ['nome', 'banco', 'tipo_integracao', 'configuracao'],
        },
      },
      {
        name: 'sgp_list_bank_integrations',
        description: 'List bank integration configurations',
        inputSchema: {
          type: 'object',
          properties: {
            banco: {
              type: 'string',
              description: 'Filter by bank (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },

      // CORREIOS INTEGRATION
      {
        name: 'sgp_create_correios_integration',
        description: 'Create Correios integration for shipping and tracking',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Integration configuration name',
            },
            usuario: {
              type: 'string',
              description: 'Correios user ID',
            },
            senha: {
              type: 'string',
              description: 'Correios password',
            },
            cartao_postagem: {
              type: 'string',
              description: 'Posting card number (optional)',
            },
            codigo_administrativo: {
              type: 'string',
              description: 'Administrative code (optional)',
            },
            servicos_habilitados: {
              type: 'array',
              description: 'Enabled services (optional)',
              items: { type: 'string' },
            },
            ativo: {
              type: 'boolean',
              description: 'Whether integration is active (optional)',
            },
          },
          required: ['nome', 'usuario', 'senha'],
        },
      },
      {
        name: 'sgp_list_correios_integrations',
        description: 'List Correios integration configurations',
        inputSchema: {
          type: 'object',
          properties: {
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },

      // MONITORING CONFIGURATION
      {
        name: 'sgp_create_monitoring_config',
        description: 'Create monitoring configuration for external systems',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Monitoring configuration name',
            },
            tipo: {
              type: 'string',
              description: 'Monitoring type',
              enum: ['sistema', 'rede', 'aplicacao', 'banco_dados'],
            },
            parametros: {
              type: 'object',
              description: 'Monitoring parameters',
              additionalProperties: true,
            },
            intervalo_verificacao: {
              type: 'number',
              description: 'Check interval in minutes',
            },
            thresholds: {
              type: 'object',
              description: 'Alert thresholds',
              additionalProperties: true,
            },
            ativo: {
              type: 'boolean',
              description: 'Whether monitoring is active (optional)',
            },
          },
          required: ['nome', 'tipo', 'parametros', 'intervalo_verificacao', 'thresholds'],
        },
      },
      {
        name: 'sgp_list_monitoring_configs',
        description: 'List monitoring configurations',
        inputSchema: {
          type: 'object',
          properties: {
            tipo: {
              type: 'string',
              description: 'Filter by monitoring type (optional)',
            },
            ativo: {
              type: 'boolean',
              description: 'Filter by active status (optional)',
            },
            page: {
              type: 'number',
              description: 'Page number (optional)',
            },
            per_page: {
              type: 'number',
              description: 'Items per page (optional)',
            },
          },
        },
      },

      // DATA SYNCHRONIZATION
      {
        name: 'sgp_get_data_sync_status',
        description: 'Get data synchronization status for external systems',
        inputSchema: {
          type: 'object',
          properties: {
            sistema: {
              type: 'string',
              description: 'Filter by system (optional)',
            },
            data_inicio: {
              type: 'string',
              description: 'Start date filter (optional)',
            },
            data_fim: {
              type: 'string',
              description: 'End date filter (optional)',
            },
          },
        },
      },
      {
        name: 'sgp_trigger_data_sync',
        description: 'Trigger manual data synchronization with external systems',
        inputSchema: {
          type: 'object',
          properties: {
            sistema: {
              type: 'string',
              description: 'System to synchronize with',
              enum: ['contabilidade', 'crm', 'erp', 'nfse', 'radius'],
            },
            force_full: {
              type: 'boolean',
              description: 'Force full synchronization (optional, default: false)',
            },
          },
          required: ['sistema'],
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

      // URA Tools
      case 'sgp_ura_customer_lookup':
        return this.formatResponse(
          await this.sgpService.uraCustomerLookup(args.search_term, args.search_type)
        );

      case 'sgp_ura_authenticate':
        return this.formatResponse(
          await this.sgpService.uraAuthenticate(args.cpfcnpj, args.senha)
        );

      case 'sgp_ura_connection_status':
        return this.formatResponse(
          await this.sgpService.uraGetConnectionStatus(args.contrato_id)
        );

      case 'sgp_ura_last_payment':
        return this.formatResponse(
          await this.sgpService.uraGetLastPayment(args.contrato_id)
        );

      // Service Orders
      case 'sgp_create_service_order':
        return this.formatResponse(
          await this.sgpService.createServiceOrder(args)
        );

      case 'sgp_list_service_orders':
        return this.formatResponse(
          await this.sgpService.listServiceOrders(args)
        );

      case 'sgp_get_service_order_details':
        return this.formatResponse(
          await this.sgpService.getServiceOrderDetails(args.ordem_id)
        );

      case 'sgp_update_service_order':
        return this.formatResponse(
          await this.sgpService.updateServiceOrder(args.ordem_id, args)
        );

      case 'sgp_close_service_order':
        return this.formatResponse(
          await this.sgpService.closeServiceOrder(args.ordem_id, args)
        );

      // Expanded Customer Management
      case 'sgp_update_customer_data':
        return this.formatResponse(
          await this.sgpService.updateCustomerData(args.cpfcnpj, args.senha, args)
        );

      case 'sgp_get_payment_history':
        return this.formatResponse(
          await this.sgpService.getPaymentHistory(args.cpfcnpj, args.senha, args)
        );

      case 'sgp_get_usage_data':
        return this.formatResponse(
          await this.sgpService.getUsageData(args.cpfcnpj, args.senha, args.periodo)
        );

      case 'sgp_suspend_contract':
        return this.formatResponse(
          await this.sgpService.suspendContract(args.contrato_id, args.motivo)
        );

      case 'sgp_reactivate_contract':
        return this.formatResponse(
          await this.sgpService.reactivateContract(args.contrato_id, args.observacoes)
        );

      // Pre-registration
      case 'sgp_create_pre_registration':
        return this.formatResponse(
          await this.sgpService.createPreRegistration(args)
        );

      case 'sgp_check_coverage':
        return this.formatResponse(
          await this.sgpService.checkCoverage(args.cep, args.endereco)
        );

      case 'sgp_schedule_installation':
        return this.formatResponse(
          await this.sgpService.scheduleInstallation(args.pre_cadastro_id, args.data_agendamento, args.periodo, args.observacoes)
        );

      // Radius
      case 'sgp_create_radius_user':
        return this.formatResponse(
          await this.sgpService.createRadiusUser(args)
        );

      case 'sgp_list_radius_users':
        return this.formatResponse(
          await this.sgpService.listRadiusUsers(args)
        );

      case 'sgp_get_active_sessions':
        return this.formatResponse(
          await this.sgpService.getActiveSessions()
        );

      case 'sgp_disconnect_radius_user':
        return this.formatResponse(
          await this.sgpService.disconnectRadiusUser(args.username, args.motivo)
        );

      // Enhanced Inventory
      case 'sgp_add_stock_movement':
        return this.formatResponse(
          await this.sgpService.addStockMovement(args)
        );

      case 'sgp_track_serial_number':
        return this.formatResponse(
          await this.sgpService.trackSerialNumber(args.serial)
        );

      case 'sgp_get_stock_alerts':
        return this.formatResponse(
          await this.sgpService.getStockAlerts()
        );

      // Enhanced Support
      case 'sgp_update_support_ticket':
        return this.formatResponse(
          await this.sgpService.updateSupportTicket(args.chamado_id, args)
        );

      case 'sgp_close_support_ticket':
        return this.formatResponse(
          await this.sgpService.closeSupportTicket(args.chamado_id, args)
        );

      // Acceptance Terms
      case 'sgp_create_acceptance_term':
        return this.formatResponse(
          await this.sgpService.createAcceptanceTerm(args)
        );

      case 'sgp_validate_term_acceptance':
        return this.formatResponse(
          await this.sgpService.validateTermAcceptance(args.termo_id, args.cliente_id)
        );

      // Administrative
      case 'sgp_get_system_stats':
        return this.formatResponse(
          await this.sgpService.getSystemStats()
        );

      case 'sgp_get_audit_logs':
        return this.formatResponse(
          await this.sgpService.getAuditLogs(args)
        );

      // ==================== FTTH INFRASTRUCTURE COMPLETE ====================
      
      // CAIXAS FTTH
      case 'sgp_list_ftth_boxes':
        return this.formatResponse(
          await this.sgpService.listFTTHBoxes(args)
        );

      case 'sgp_create_ftth_box':
        return this.formatResponse(
          await this.sgpService.createFTTHBox(args)
        );

      case 'sgp_get_ftth_box_details':
        return this.formatResponse(
          await this.sgpService.getFTTHBoxDetails(args.caixa_id)
        );

      case 'sgp_update_ftth_box':
        return this.formatResponse(
          await this.sgpService.updateFTTHBox(args.caixa_id, args)
        );

      case 'sgp_delete_ftth_box':
        return this.formatResponse(
          await this.sgpService.deleteFTTHBox(args.caixa_id)
        );

      // SPLITTERS FTTH
      case 'sgp_list_ftth_splitters':
        return this.formatResponse(
          await this.sgpService.listFTTHSplitters(args)
        );

      case 'sgp_create_ftth_splitter':
        return this.formatResponse(
          await this.sgpService.createFTTHSplitter(args)
        );

      case 'sgp_get_ftth_splitter_details':
        return this.formatResponse(
          await this.sgpService.getFTTHSplitterDetails(args.splitter_id)
        );

      case 'sgp_update_ftth_splitter':
        return this.formatResponse(
          await this.sgpService.updateFTTHSplitter(args.splitter_id, args)
        );

      case 'sgp_delete_ftth_splitter':
        return this.formatResponse(
          await this.sgpService.deleteFTTHSplitter(args.splitter_id)
        );

      // OLT MANAGEMENT COMPLETE
      case 'sgp_create_olt':
        return this.formatResponse(
          await this.sgpService.createOLT(args)
        );

      case 'sgp_get_olt_details':
        return this.formatResponse(
          await this.sgpService.getOLTDetails(args.olt_id)
        );

      case 'sgp_update_olt':
        return this.formatResponse(
          await this.sgpService.updateOLT(args.olt_id, args)
        );

      case 'sgp_delete_olt':
        return this.formatResponse(
          await this.sgpService.deleteOLT(args.olt_id)
        );

      // ONU MANAGEMENT COMPLETE
      case 'sgp_create_onu':
        return this.formatResponse(
          await this.sgpService.createONU(args)
        );

      case 'sgp_update_onu':
        return this.formatResponse(
          await this.sgpService.updateONU(args.onu_id, args)
        );

      case 'sgp_delete_onu':
        return this.formatResponse(
          await this.sgpService.deleteONU(args.onu_id)
        );

      // FTTH TOPOLOGY AND MONITORING
      case 'sgp_get_ftth_topology':
        return this.formatResponse(
          await this.sgpService.getFTTHTopology(args.olt_id)
        );

      case 'sgp_get_ftth_alarms':
        return this.formatResponse(
          await this.sgpService.getFTTHAlarms()
        );

      case 'sgp_get_ftth_capacity_report':
        return this.formatResponse(
          await this.sgpService.getFTTHCapacityReport()
        );

      // ==================== SISTEMA DE BOLETOS COMPLETO ====================
      
      case 'sgp_list_boletos':
        return this.formatResponse(
          await this.sgpService.listBoletos(args)
        );

      case 'sgp_generate_boleto':
        return this.formatResponse(
          await this.sgpService.generateBoleto(args)
        );

      case 'sgp_get_boleto_details':
        return this.formatResponse(
          await this.sgpService.getBoletoDetails(args.boleto_id)
        );

      case 'sgp_cancel_boleto':
        return this.formatResponse(
          await this.sgpService.cancelBoleto(args.boleto_id, args.motivo)
        );

      case 'sgp_download_boleto_pdf':
        return this.formatResponse(
          await this.sgpService.downloadBoletoPDF(args.boleto_id)
        );

      case 'sgp_register_boleto_payment':
        return this.formatResponse(
          await this.sgpService.registerBoletoPayment(args.boleto_id, args)
        );

      // GESTÃO DE REMESSAS EXPANDIDA
      case 'sgp_list_remessas':
        return this.formatResponse(
          await this.sgpService.listRemessas(args)
        );

      case 'sgp_download_remessa':
        return this.formatResponse(
          await this.sgpService.downloadRemessa(args.remessa_id)
        );

      case 'sgp_get_remessa_details':
        return this.formatResponse(
          await this.sgpService.getRemessaDetails(args.remessa_id)
        );

      // GESTÃO DE RETORNOS EXPANDIDA
      case 'sgp_list_retornos':
        return this.formatResponse(
          await this.sgpService.listRetornos(args)
        );

      case 'sgp_get_retorno_details':
        return this.formatResponse(
          await this.sgpService.getRetornoDetails(args.retorno_id)
        );

      case 'sgp_process_retorno_file_advanced':
        return this.formatResponse(
          await this.sgpService.processRetornoFile(args)
        );

      // RELATÓRIOS FINANCEIROS
      case 'sgp_get_financial_report':
        return this.formatResponse(
          await this.sgpService.getFinancialReport(args)
        );

      // ==================== SISTEMA URA COMPLETO ====================
      
      case 'sgp_ura_get_contract':
        return this.formatResponse(
          await this.sgpService.uraGetContract(args.contrato_id)
        );

      case 'sgp_ura_list_invoices':
        return this.formatResponse(
          await this.sgpService.uraListInvoices(args.contrato_id)
        );

      case 'sgp_ura_get_invoice_details':
        return this.formatResponse(
          await this.sgpService.uraGetInvoiceDetails(args.contrato_id, args.fatura_id)
        );

      case 'sgp_ura_create_ticket':
        return this.formatResponse(
          await this.sgpService.uraCreateTicket(args)
        );

      case 'sgp_ura_get_ticket':
        return this.formatResponse(
          await this.sgpService.uraGetTicket(args.chamado_id)
        );

      case 'sgp_ura_list_customer_tickets':
        return this.formatResponse(
          await this.sgpService.uraListCustomerTickets(args.cliente_id)
        );

      case 'sgp_ura_create_atendimento':
        return this.formatResponse(
          await this.sgpService.uraCreateAtendimento(args)
        );

      case 'sgp_ura_get_atendimento':
        return this.formatResponse(
          await this.sgpService.uraGetAtendimento(args.atendimento_id)
        );

      case 'sgp_ura_list_customer_atendimentos':
        return this.formatResponse(
          await this.sgpService.uraListCustomerAtendimentos(args.cliente_id)
        );

      case 'sgp_ura_finish_atendimento':
        return this.formatResponse(
          await this.sgpService.uraFinishAtendimento(args.atendimento_id, args)
        );

      case 'sgp_ura_get_menu':
        return this.formatResponse(
          await this.sgpService.uraGetMenu()
        );

      case 'sgp_ura_update_menu':
        return this.formatResponse(
          await this.sgpService.uraUpdateMenu(args.menu_id, args)
        );

      case 'sgp_ura_get_queues_status':
        return this.formatResponse(
          await this.sgpService.uraGetQueuesStatus()
        );

      case 'sgp_ura_get_queue_metrics':
        return this.formatResponse(
          await this.sgpService.uraGetQueueMetrics(args.fila_nome, args.data_inicio, args.data_fim)
        );

      // ==================== SISTEMA DE ESTOQUE AVANÇADO ====================
      
      // GESTÃO DE FORNECEDORES
      case 'sgp_list_fornecedores':
        return this.formatResponse(
          await this.sgpService.listFornecedores(args)
        );

      case 'sgp_create_fornecedor':
        return this.formatResponse(
          await this.sgpService.createFornecedor(args)
        );

      case 'sgp_get_fornecedor_details':
        return this.formatResponse(
          await this.sgpService.getFornecedorDetails(args.fornecedor_id)
        );

      case 'sgp_update_fornecedor':
        return this.formatResponse(
          await this.sgpService.updateFornecedor(args.fornecedor_id, args)
        );

      case 'sgp_delete_fornecedor':
        return this.formatResponse(
          await this.sgpService.deleteFornecedor(args.fornecedor_id)
        );

      // GESTÃO DE CATEGORIAS
      case 'sgp_list_categorias':
        return this.formatResponse(
          await this.sgpService.listCategorias(args)
        );

      case 'sgp_create_categoria':
        return this.formatResponse(
          await this.sgpService.createCategoria(args)
        );

      case 'sgp_get_categoria_details':
        return this.formatResponse(
          await this.sgpService.getCategoriaDetails(args.categoria_id)
        );

      case 'sgp_update_categoria':
        return this.formatResponse(
          await this.sgpService.updateCategoria(args.categoria_id, args)
        );

      case 'sgp_delete_categoria':
        return this.formatResponse(
          await this.sgpService.deleteCategoria(args.categoria_id)
        );

      // GESTÃO DE PRODUTOS EXPANDIDA
      case 'sgp_create_product':
        return this.formatResponse(
          await this.sgpService.createProduct(args)
        );

      case 'sgp_get_product_details_extended':
        return this.formatResponse(
          await this.sgpService.getProductDetailsExtended(args.produto_id)
        );

      case 'sgp_update_product':
        return this.formatResponse(
          await this.sgpService.updateProduct(args.produto_id, args)
        );

      case 'sgp_delete_product':
        return this.formatResponse(
          await this.sgpService.deleteProduct(args.produto_id)
        );

      // ==================== RADIUS ADVANCED SYSTEM HANDLERS ====================

      // RADIUS USER MANAGEMENT
      case 'sgp_create_radius_user':
        return this.formatResponse(
          await this.sgpService.createRadiusUser(args)
        );

      case 'sgp_list_radius_users':
        return this.formatResponse(
          await this.sgpService.listRadiusUsers(args)
        );

      case 'sgp_get_radius_user':
        return this.formatResponse(
          await this.sgpService.getRadiusUserDetails(args.username)
        );

      case 'sgp_update_radius_user':
        return this.formatResponse(
          await this.sgpService.updateRadiusUser(args.username, args)
        );

      case 'sgp_delete_radius_user':
        return this.formatResponse(
          await this.sgpService.deleteRadiusUser(args.username)
        );

      case 'sgp_disconnect_radius_user':
        return this.formatResponse(
          await this.sgpService.disconnectRadiusUser(args.username, args.reason)
        );

      // RADIUS GROUP MANAGEMENT
      case 'sgp_create_radius_group':
        return this.formatResponse(
          await this.sgpService.createRadiusGroup(args)
        );

      case 'sgp_list_radius_groups':
        return this.formatResponse(
          await this.sgpService.listRadiusGroups(args)
        );

      case 'sgp_get_radius_group':
        return this.formatResponse(
          await this.sgpService.getRadiusGroupDetails(args.group_id)
        );

      case 'sgp_update_radius_group':
        return this.formatResponse(
          await this.sgpService.updateRadiusGroup(args.group_id, args)
        );

      case 'sgp_delete_radius_group':
        return this.formatResponse(
          await this.sgpService.deleteRadiusGroup(args.group_id)
        );

      // RADIUS SESSION MANAGEMENT
      case 'sgp_list_radius_sessions':
        return this.formatResponse(
          await this.sgpService.listRadiusSessions(args)
        );

      case 'sgp_get_radius_session':
        return this.formatResponse(
          await this.sgpService.getRadiusSessionDetails(args.session_id)
        );

      case 'sgp_disconnect_radius_session':
        return this.formatResponse(
          await this.sgpService.disconnectRadiusSession(args.session_id, args.reason)
        );

      // RADIUS NAS MANAGEMENT
      case 'sgp_create_radius_nas':
        return this.formatResponse(
          await this.sgpService.createRadiusNAS(args)
        );

      case 'sgp_list_radius_nas':
        return this.formatResponse(
          await this.sgpService.listRadiusNAS(args)
        );

      case 'sgp_get_radius_nas':
        return this.formatResponse(
          await this.sgpService.getRadiusNASDetails(args.nas_id)
        );

      case 'sgp_update_radius_nas':
        return this.formatResponse(
          await this.sgpService.updateRadiusNAS(args.nas_id, args)
        );

      case 'sgp_delete_radius_nas':
        return this.formatResponse(
          await this.sgpService.deleteRadiusNAS(args.nas_id)
        );

      // RADIUS ATTRIBUTES
      case 'sgp_create_radius_attribute':
        return this.formatResponse(
          await this.sgpService.createRadiusAttribute(args)
        );

      case 'sgp_list_radius_attributes':
        return this.formatResponse(
          await this.sgpService.listRadiusAttributes(args)
        );

      case 'sgp_update_radius_attribute':
        return this.formatResponse(
          await this.sgpService.updateRadiusAttribute(args.attribute_id, args)
        );

      case 'sgp_delete_radius_attribute':
        return this.formatResponse(
          await this.sgpService.deleteRadiusAttribute(args.attribute_id)
        );

      // RADIUS ACCOUNTING & STATISTICS
      case 'sgp_get_radius_accounting':
        return this.formatResponse(
          await this.sgpService.getRadiusAccounting(args)
        );

      case 'sgp_get_radius_statistics':
        return this.formatResponse(
          await this.sgpService.getRadiusStatistics(args.periodo, args)
        );

      // RADIUS CHECK & REPLY
      case 'sgp_create_radius_check':
        return this.formatResponse(
          await this.sgpService.createRadiusCheck(args)
        );

      case 'sgp_list_radius_checks':
        return this.formatResponse(
          await this.sgpService.listRadiusChecks(args)
        );

      case 'sgp_create_radius_reply':
        return this.formatResponse(
          await this.sgpService.createRadiusReply(args)
        );

      case 'sgp_list_radius_replies':
        return this.formatResponse(
          await this.sgpService.listRadiusReplies(args)
        );

      // ==================== DOCUMENT AND CONTRACT SYSTEM HANDLERS ====================

      // DOCUMENT TEMPLATE MANAGEMENT
      case 'sgp_create_document_template':
        return this.formatResponse(
          await this.sgpService.createDocumentTemplate(args)
        );

      case 'sgp_list_document_templates':
        return this.formatResponse(
          await this.sgpService.listDocumentTemplates(args)
        );

      case 'sgp_get_document_template':
        return this.formatResponse(
          await this.sgpService.getDocumentTemplateDetails(args.template_id)
        );

      case 'sgp_update_document_template':
        return this.formatResponse(
          await this.sgpService.updateDocumentTemplate(args.template_id, args)
        );

      // CONTRACT DOCUMENT MANAGEMENT
      case 'sgp_create_contract_document':
        return this.formatResponse(
          await this.sgpService.createContractDocument(args)
        );

      case 'sgp_list_contract_documents':
        return this.formatResponse(
          await this.sgpService.listContractDocuments(args)
        );

      case 'sgp_get_contract_document':
        return this.formatResponse(
          await this.sgpService.getContractDocumentDetails(args.document_id)
        );

      case 'sgp_update_contract_document':
        return this.formatResponse(
          await this.sgpService.updateContractDocument(args.document_id, args)
        );

      // CONTRACT STATUS MANAGEMENT
      case 'sgp_get_contract_status':
        return this.formatResponse(
          await this.sgpService.getContractStatus(args.contrato_id)
        );

      case 'sgp_update_contract_status':
        return this.formatResponse(
          await this.sgpService.updateContractStatus(args.contrato_id, args)
        );

      // DIGITAL SIGNATURE MANAGEMENT
      case 'sgp_create_digital_signature':
        return this.formatResponse(
          await this.sgpService.createDigitalSignature(args)
        );

      case 'sgp_list_digital_signatures':
        return this.formatResponse(
          await this.sgpService.listDigitalSignatures(args)
        );

      case 'sgp_process_digital_signature':
        return this.formatResponse(
          await this.sgpService.processDigitalSignature(args.signature_id, args)
        );

      // CONTRACT ADDENDUM MANAGEMENT
      case 'sgp_create_contract_addendum':
        return this.formatResponse(
          await this.sgpService.createContractAdendum(args)
        );

      case 'sgp_list_contract_addendums':
        return this.formatResponse(
          await this.sgpService.listContractAddendums(args)
        );

      case 'sgp_approve_contract_addendum':
        return this.formatResponse(
          await this.sgpService.approveContractAdendum(args.addendum_id, args)
        );

      // LEGAL NOTIFICATION MANAGEMENT
      case 'sgp_create_legal_notification':
        return this.formatResponse(
          await this.sgpService.createLegalNotification(args)
        );

      case 'sgp_list_legal_notifications':
        return this.formatResponse(
          await this.sgpService.listLegalNotifications(args)
        );

      case 'sgp_update_notification_status':
        return this.formatResponse(
          await this.sgpService.updateNotificationStatus(args.notification_id, args)
        );

      // DOCUMENT APPROVAL MANAGEMENT
      case 'sgp_create_document_approval':
        return this.formatResponse(
          await this.sgpService.createDocumentApproval(args)
        );

      case 'sgp_list_document_approvals':
        return this.formatResponse(
          await this.sgpService.listDocumentApprovals(args)
        );

      case 'sgp_process_document_approval':
        return this.formatResponse(
          await this.sgpService.processDocumentApproval(args.approval_id, args)
        );

      // CONTRACT RENEWAL MANAGEMENT
      case 'sgp_create_contract_renewal':
        return this.formatResponse(
          await this.sgpService.createContractRenewal(args)
        );

      case 'sgp_list_contract_renewals':
        return this.formatResponse(
          await this.sgpService.listContractRenewals(args)
        );

      case 'sgp_process_contract_renewal':
        return this.formatResponse(
          await this.sgpService.processContractRenewal(args.renewal_id, args)
        );

      // SPECIAL FUNCTIONS
      case 'sgp_generate_contract_pdf':
        return this.formatResponse(
          await this.sgpService.generateContractPDF(args.contrato_id, args)
        );

      case 'sgp_validate_document_integrity':
        return this.formatResponse(
          await this.sgpService.validateDocumentIntegrity(args.document_id)
        );

      // ==================== ANALYTICS AND REPORTING SYSTEM HANDLERS ====================

      // SYSTEM PERFORMANCE ANALYTICS
      case 'sgp_get_system_statistics':
        return this.formatResponse(
          await this.sgpService.getSystemStatistics(args.periodo)
        );

      case 'sgp_get_system_health':
        return this.formatResponse(
          await this.sgpService.getSystemHealthMetrics()
        );

      // FINANCIAL ANALYTICS
      case 'sgp_get_financial_report':
        return this.formatResponse(
          await this.sgpService.getFinancialReport(args)
        );

      case 'sgp_get_revenue_forecast':
        return this.formatResponse(
          await this.sgpService.getRevenueForecast(args)
        );

      case 'sgp_get_cash_flow_analysis':
        return this.formatResponse(
          await this.sgpService.getCashFlowAnalysis(args)
        );

      // NETWORK ANALYTICS
      case 'sgp_get_network_analytics':
        return this.formatResponse(
          await this.sgpService.getNetworkAnalytics(args)
        );

      case 'sgp_get_capacity_utilization':
        return this.formatResponse(
          await this.sgpService.getCapacityUtilizationReport()
        );

      case 'sgp_get_network_performance':
        return this.formatResponse(
          await this.sgpService.getNetworkPerformanceMetrics(args.periodo)
        );

      // CUSTOMER ANALYTICS
      case 'sgp_get_customer_analytics':
        return this.formatResponse(
          await this.sgpService.getCustomerAnalytics(args)
        );

      case 'sgp_get_churn_analysis':
        return this.formatResponse(
          await this.sgpService.getChurnAnalysis(args.periodo)
        );

      case 'sgp_get_usage_patterns':
        return this.formatResponse(
          await this.sgpService.getUsagePatternAnalysis(args)
        );

      // SUPPORT ANALYTICS
      case 'sgp_get_support_analytics':
        return this.formatResponse(
          await this.sgpService.getSupportAnalytics(args)
        );

      case 'sgp_get_ura_metrics':
        return this.formatResponse(
          await this.sgpService.getURAMetrics(args.periodo)
        );

      // OPERATIONAL KPIs
      case 'sgp_get_operational_kpis':
        return this.formatResponse(
          await this.sgpService.getOperationalKPIs(args.periodo)
        );

      case 'sgp_get_efficiency_metrics':
        return this.formatResponse(
          await this.sgpService.getEfficiencyMetrics()
        );

      // GEOGRAPHIC ANALYTICS
      case 'sgp_get_geographic_analytics':
        return this.formatResponse(
          await this.sgpService.getGeographicAnalytics()
        );

      case 'sgp_get_market_penetration':
        return this.formatResponse(
          await this.sgpService.getMarketPenetrationAnalysis()
        );

      // COMPETITIVE ANALYTICS
      case 'sgp_get_competitive_analysis':
        return this.formatResponse(
          await this.sgpService.getCompetitiveAnalysis()
        );

      // CUSTOM REPORTS
      case 'sgp_generate_custom_report':
        return this.formatResponse(
          await this.sgpService.generateCustomReport(args)
        );

      // ==================== EXTERNAL INTEGRATIONS SYSTEM HANDLERS ====================

      // WEBHOOK MANAGEMENT
      case 'sgp_create_webhook':
        return this.formatResponse(
          await this.sgpService.createWebhook(args)
        );

      case 'sgp_list_webhooks':
        return this.formatResponse(
          await this.sgpService.listWebhooks(args)
        );

      case 'sgp_get_webhook':
        return this.formatResponse(
          await this.sgpService.getWebhook(args.webhook_id)
        );

      case 'sgp_update_webhook':
        return this.formatResponse(
          await this.sgpService.updateWebhook(args.webhook_id, args)
        );

      case 'sgp_delete_webhook':
        return this.formatResponse(
          await this.sgpService.deleteWebhook(args.webhook_id)
        );

      case 'sgp_test_webhook':
        return this.formatResponse(
          await this.sgpService.testWebhook(args.webhook_id)
        );

      case 'sgp_get_webhook_executions':
        return this.formatResponse(
          await this.sgpService.getWebhookExecutions(args.webhook_id, args)
        );

      // EXTERNAL API CONFIGURATION
      case 'sgp_create_api_config':
        return this.formatResponse(
          await this.sgpService.createAPIConfig(args)
        );

      case 'sgp_list_api_configs':
        return this.formatResponse(
          await this.sgpService.listAPIConfigs(args)
        );

      case 'sgp_get_api_config':
        return this.formatResponse(
          await this.sgpService.getAPIConfig(args.api_id)
        );

      case 'sgp_update_api_config':
        return this.formatResponse(
          await this.sgpService.updateAPIConfig(args.api_id, args)
        );

      case 'sgp_delete_api_config':
        return this.formatResponse(
          await this.sgpService.deleteAPIConfig(args.api_id)
        );

      case 'sgp_test_api_config':
        return this.formatResponse(
          await this.sgpService.testAPIConfig(args.api_id)
        );

      // PAYMENT GATEWAY CONFIGURATION
      case 'sgp_create_payment_gateway':
        return this.formatResponse(
          await this.sgpService.createPaymentGateway(args)
        );

      case 'sgp_list_payment_gateways':
        return this.formatResponse(
          await this.sgpService.listPaymentGateways(args)
        );

      case 'sgp_get_payment_gateway':
        return this.formatResponse(
          await this.sgpService.getPaymentGateway(args.gateway_id)
        );

      case 'sgp_update_payment_gateway':
        return this.formatResponse(
          await this.sgpService.updatePaymentGateway(args.gateway_id, args)
        );

      // SMS AND EMAIL PROVIDERS
      case 'sgp_create_sms_provider':
        return this.formatResponse(
          await this.sgpService.createSMSProvider(args)
        );

      case 'sgp_list_sms_providers':
        return this.formatResponse(
          await this.sgpService.listSMSProviders(args)
        );

      case 'sgp_create_email_provider':
        return this.formatResponse(
          await this.sgpService.createEmailProvider(args)
        );

      case 'sgp_list_email_providers':
        return this.formatResponse(
          await this.sgpService.listEmailProviders(args)
        );

      // BANK INTEGRATIONS
      case 'sgp_create_bank_integration':
        return this.formatResponse(
          await this.sgpService.createBankIntegration(args)
        );

      case 'sgp_list_bank_integrations':
        return this.formatResponse(
          await this.sgpService.listBankIntegrations(args)
        );

      // CORREIOS INTEGRATION
      case 'sgp_create_correios_integration':
        return this.formatResponse(
          await this.sgpService.createCorreiosIntegration(args)
        );

      case 'sgp_list_correios_integrations':
        return this.formatResponse(
          await this.sgpService.listCorreiosIntegrations(args)
        );

      // MONITORING CONFIGURATION
      case 'sgp_create_monitoring_config':
        return this.formatResponse(
          await this.sgpService.createMonitoringConfig(args)
        );

      case 'sgp_list_monitoring_configs':
        return this.formatResponse(
          await this.sgpService.listMonitoringConfigs(args)
        );

      // DATA SYNCHRONIZATION
      case 'sgp_get_data_sync_status':
        return this.formatResponse(
          await this.sgpService.getDataSyncStatus(args)
        );

      case 'sgp_trigger_data_sync':
        return this.formatResponse(
          await this.sgpService.triggerDataSync(args.sistema, args.force_full)
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