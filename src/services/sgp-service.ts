import { SGPClient } from '../client/sgp-client.js';
import { 
  ContractDetails, 
  InvoiceDetails, 
  SupportTicket, 
  ONUDetails, 
  OLTDetails, 
  ProductDetails,
  URACustomerLookup,
  URAConnectionStatus,
  URAAuth,
  ServiceOrder,
  ServiceOrderAttachment,
  PreRegistration,
  RadiusUser,
  RadiusSession,
  RadiusGroup,
  RadiusAttribute,
  RadiusNAS,
  RadiusAccounting,
  RadiusCheck,
  RadiusReply,
  RadiusStatistics,
  AcceptanceTerm,
  TermAcceptance,
  SystemUser,
  AuditLog,
  FTTHBox,
  FTTHSplitter,
  BoletoDetails,
  RemessaDetails,
  RetornoDetails,
  URAContract,
  URAInvoice,
  URATicket,
  URAAtendimento,
  URAMenu,
  URAFilaStatus,
  Fornecedor,
  Categoria,
  ProductDetailsExtended,
  MovimentacaoEstoque,
  Inventario,
  SerialTracking,
  DocumentTemplate,
  ContractDocument,
  ContractStatus,
  DigitalSignature,
  ContractAdendum,
  LegalNotification,
  DocumentApproval,
  ContractRenewal,
  SystemStatistics,
  FinancialReport,
  NetworkAnalytics,
  CustomerAnalytics,
  SupportAnalytics,
  RevenueForecast,
  OperationalKPIs,
  GeographicAnalytics,
  WebhookConfig,
  WebhookExecution,
  ExternalAPIConfig,
  PaymentGatewayConfig,
  SMSProviderConfig,
  EmailProviderConfig,
  BankIntegration,
  CorreiosIntegration,
  MonitoringConfig,
  APIRateLimit,
  DataSyncConfig,
  BackupConfig,
  BackupExecution,
  RestorePoint,
  RestoreOperation,
  BackupSchedule,
  BackupStorage,
  BackupPolicy,
  BackupMonitoring,
  DisasterRecovery,
  SystemSnapshot,
  BackupReport,
  SystemConfiguration,
  ConfigurationTemplate,
  UserPreferences,
  CustomField,
  WorkflowCustomization,
  BrandingConfiguration,
  MenuCustomization,
  ReportCustomization,
  NotificationTemplate,
  PortalCustomization,
  LocalizationConfig,
  AuditEvent,
  ComplianceRule,
  ComplianceViolation,
  DataRetentionPolicy,
  AccessControl,
  PrivacyRequest,
  SecurityIncident,
  AuditReport,
  SGPResponse,
  PaginatedResponse,
  AuthCredentials 
} from '../types/sgp.js';
import { logger } from '../utils/logger.js';

export class SGPService {
  private client: SGPClient;

  constructor(client: SGPClient) {
    this.client = client;
  }

  async getCustomerContracts(
    cpfcnpj: string, 
    senha: string
  ): Promise<SGPResponse<ContractDetails[]>> {
    logger.info('Getting customer contracts', { cpfcnpj: cpfcnpj.replace(/\d/g, '*') });
    
    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<ContractDetails[]>(
      '/central/contratos',
      {},
      { 
        authMethod: 'cpf_cnpj',
        credentials 
      }
    );
  }

  async getContractDetails(
    contrato_id: string,
    cpfcnpj: string,
    senha: string
  ): Promise<SGPResponse<ContractDetails>> {
    logger.info('Getting contract details', { contrato_id });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<ContractDetails>(
      `/central/contratos/${contrato_id}`,
      {},
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async getCustomerInvoices(
    cpfcnpj: string,
    senha: string
  ): Promise<SGPResponse<InvoiceDetails[]>> {
    logger.info('Getting customer invoices', { cpfcnpj: cpfcnpj.replace(/\d/g, '*') });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<InvoiceDetails[]>(
      '/central/faturas',
      {},
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async getInvoiceDetails(
    fatura_id: string,
    cpfcnpj: string,
    senha: string
  ): Promise<SGPResponse<InvoiceDetails>> {
    logger.info('Getting invoice details', { fatura_id });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<InvoiceDetails>(
      `/central/faturas/${fatura_id}`,
      {},
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async generateSecondCopy(
    fatura_id: string,
    cpfcnpj: string,
    senha: string
  ): Promise<SGPResponse<{ linha_digitavel: string; pdf_url: string }>> {
    logger.info('Generating second copy', { fatura_id });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<{ linha_digitavel: string; pdf_url: string }>(
      `/central/faturas/${fatura_id}/segunda-via`,
      {},
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async createSupportTicket(
    ticketData: {
      cpfcnpj: string;
      senha: string;
      assunto: string;
      descricao: string;
      categoria_id?: number;
      prioridade_id?: number;
    }
  ): Promise<SGPResponse<SupportTicket>> {
    logger.info('Creating support ticket', { assunto: ticketData.assunto });

    const { cpfcnpj, senha, ...data } = ticketData;
    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<SupportTicket>(
      '/central/chamados/abrir',
      data,
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async getSupportTickets(
    cpfcnpj: string,
    senha: string
  ): Promise<SGPResponse<SupportTicket[]>> {
    logger.info('Getting support tickets', { cpfcnpj: cpfcnpj.replace(/\d/g, '*') });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<SupportTicket[]>(
      '/central/chamados',
      {},
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async listONUs(
    page?: number,
    per_page?: number
  ): Promise<PaginatedResponse<ONUDetails>> {
    logger.info('Listing ONUs', { page, per_page });

    return this.client.getPaginated<ONUDetails>(
      '/ftth/onus',
      { page, per_page },
      { 
        authMethod: 'token',
        useCache: true 
      }
    );
  }

  async getONUDetails(onu_id: string): Promise<SGPResponse<ONUDetails>> {
    logger.info('Getting ONU details', { onu_id });

    const cacheKey = `onu_details_${onu_id}`;
    
    return this.client.get<ONUDetails>(
      `/ftth/onus/${onu_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey
      }
    );
  }

  async provisionONU(
    onu_id: string,
    provisionData: any
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Provisioning ONU', { onu_id });

    return this.client.post<{ success: boolean; message: string }>(
      `/ftth/onus/${onu_id}/provisionar`,
      provisionData,
      { authMethod: 'token' }
    );
  }

  async deprovisionONU(onu_id: string): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deprovisioning ONU', { onu_id });

    return this.client.post<{ success: boolean; message: string }>(
      `/ftth/onus/${onu_id}/desprovisionar`,
      {},
      { authMethod: 'token' }
    );
  }

  async restartONU(onu_id: string): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Restarting ONU', { onu_id });

    return this.client.post<{ success: boolean; message: string }>(
      `/ftth/onus/${onu_id}/reiniciar`,
      {},
      { authMethod: 'token' }
    );
  }

  async getONUStatus(onu_id: string): Promise<SGPResponse<{ status: string; signal: number; uptime: string }>> {
    logger.info('Getting ONU status', { onu_id });

    return this.client.get<{ status: string; signal: number; uptime: string }>(
      `/ftth/onus/${onu_id}/status`,
      { authMethod: 'token' }
    );
  }

  async listOLTs(
    page?: number,
    per_page?: number
  ): Promise<PaginatedResponse<OLTDetails>> {
    logger.info('Listing OLTs', { page, per_page });

    return this.client.getPaginated<OLTDetails>(
      '/ftth/olts',
      { page, per_page },
      { 
        authMethod: 'token',
        useCache: true 
      }
    );
  }

  async listProducts(
    page?: number,
    per_page?: number
  ): Promise<PaginatedResponse<ProductDetails>> {
    logger.info('Listing products', { page, per_page });

    return this.client.getPaginated<ProductDetails>(
      '/estoque/produtos',
      { page, per_page },
      { 
        authMethod: 'token',
        useCache: true 
      }
    );
  }

  async getNetworkStatus(): Promise<SGPResponse<{
    olts_online: number;
    olts_total: number;
    onus_online: number;
    onus_total: number;
    alerts: Array<{ type: string; message: string; severity: string }>;
  }>> {
    logger.info('Getting network status');

    const cacheKey = 'network_status';
    
    return this.client.get<{
      olts_online: number;
      olts_total: number;
      onus_online: number;
      onus_total: number;
      alerts: Array<{ type: string; message: string; severity: string }>;
    }>(
      '/ftth/status',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey
      }
    );
  }

  async generateInvoiceBatch(
    batchData: {
      data_vencimento: string;
      banco_id: number;
      tipo_arquivo: string;
    }
  ): Promise<SGPResponse<{ remessa_id: number; arquivo_url: string }>> {
    logger.info('Generating invoice batch', batchData);

    return this.client.post<{ remessa_id: number; arquivo_url: string }>(
      '/remessa/gerar',
      batchData,
      { authMethod: 'token' }
    );
  }

  async processReturnFile(
    returnData: {
      arquivo: string;
      banco_id: number;
    }
  ): Promise<SGPResponse<{ processados: number; erros: number; detalhes: any[] }>> {
    logger.info('Processing return file');

    return this.client.post<{ processados: number; erros: number; detalhes: any[] }>(
      '/retorno/processar',
      returnData,
      { authMethod: 'token' }
    );
  }

  // ==================== URA FUNCTIONALITY ====================

  async uraCustomerLookup(
    searchTerm: string,
    searchType: 'cpf' | 'cnpj' | 'telefone' | 'nome' = 'cpf'
  ): Promise<SGPResponse<URACustomerLookup[]>> {
    logger.info('URA customer lookup', { searchType, searchTerm: searchTerm.replace(/\d/g, '*') });

    return this.client.post<URACustomerLookup[]>(
      '/ura/cliente',
      {
        busca: searchTerm,
        tipo: searchType
      },
      { authMethod: 'token' }
    );
  }

  async uraAuthenticate(
    cpfcnpj: string,
    senha: string
  ): Promise<SGPResponse<URAAuth>> {
    logger.info('URA authentication', { cpfcnpj: cpfcnpj.replace(/\d/g, '*') });

    return this.client.post<URAAuth>(
      '/ura/autenticar',
      {
        cpfcnpj,
        senha
      },
      { authMethod: 'token' }
    );
  }

  async uraGetConnectionStatus(
    contrato_id: string
  ): Promise<SGPResponse<URAConnectionStatus>> {
    logger.info('Getting URA connection status', { contrato_id });

    return this.client.get<URAConnectionStatus>(
      `/ura/conexao/${contrato_id}`,
      { authMethod: 'token' }
    );
  }

  async uraGetLastPayment(
    contrato_id: string
  ): Promise<SGPResponse<{ data: string; valor: number; forma_pagamento: string; status: string }>> {
    logger.info('Getting last payment for URA', { contrato_id });

    return this.client.get<{ data: string; valor: number; forma_pagamento: string; status: string }>(
      `/ura/ultimo-pagamento/${contrato_id}`,
      { authMethod: 'token' }
    );
  }

  // ==================== SERVICE ORDERS FUNCTIONALITY ====================

  async createServiceOrder(
    orderData: {
      cliente_id: number;
      contrato_id?: number;
      tipo_id: number;
      titulo: string;
      descricao: string;
      prioridade?: string;
      data_agendamento?: string;
      endereco?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<ServiceOrder>> {
    logger.info('Creating service order', { cliente_id: orderData.cliente_id, titulo: orderData.titulo });

    return this.client.post<ServiceOrder>(
      '/ordens',
      orderData,
      { authMethod: 'token' }
    );
  }

  async listServiceOrders(
    filters?: {
      status?: string;
      tecnico_id?: number;
      cliente_id?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<ServiceOrder>> {
    logger.info('Listing service orders', filters);

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = params.toString() ? `/ordens?${params.toString()}` : '/ordens';

    return this.client.getPaginated<ServiceOrder>(
      endpoint,
      undefined,
      { authMethod: 'token', useCache: true }
    );
  }

  async getServiceOrderDetails(
    ordem_id: string
  ): Promise<SGPResponse<ServiceOrder>> {
    logger.info('Getting service order details', { ordem_id });

    return this.client.get<ServiceOrder>(
      `/ordens/${ordem_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `service_order_${ordem_id}`
      }
    );
  }

  async updateServiceOrder(
    ordem_id: string,
    updateData: {
      status?: string;
      tecnico_id?: number;
      data_execucao?: string;
      observacoes?: string;
      equipamentos?: string[];
    }
  ): Promise<SGPResponse<ServiceOrder>> {
    logger.info('Updating service order', { ordem_id, status: updateData.status });

    return this.client.put<ServiceOrder>(
      `/ordens/${ordem_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async addServiceOrderAttachment(
    ordem_id: string,
    attachmentData: {
      nome: string;
      tipo: string;
      arquivo: string; // base64
    }
  ): Promise<SGPResponse<ServiceOrderAttachment>> {
    logger.info('Adding service order attachment', { ordem_id, nome: attachmentData.nome });

    return this.client.post<ServiceOrderAttachment>(
      `/ordens/${ordem_id}/anexos`,
      attachmentData,
      { authMethod: 'token' }
    );
  }

  async closeServiceOrder(
    ordem_id: string,
    closeData: {
      observacoes_finais: string;
      equipamentos_instalados?: string[];
      data_fechamento?: string;
    }
  ): Promise<SGPResponse<ServiceOrder>> {
    logger.info('Closing service order', { ordem_id });

    return this.client.post<ServiceOrder>(
      `/ordens/${ordem_id}/finalizar`,
      closeData,
      { authMethod: 'token' }
    );
  }

  // ==================== EXPANDED CUSTOMER MANAGEMENT ====================

  async updateCustomerData(
    cpfcnpj: string,
    senha: string,
    updateData: {
      telefone?: string;
      email?: string;
      endereco?: string;
      senha_nova?: string;
    }
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Updating customer data', { cpfcnpj: cpfcnpj.replace(/\d/g, '*') });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<{ success: boolean; message: string }>(
      '/central/perfil/atualizar',
      updateData,
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async getPaymentHistory(
    cpfcnpj: string,
    senha: string,
    filters?: {
      data_inicio?: string;
      data_fim?: string;
      status?: string;
    }
  ): Promise<SGPResponse<Array<{
    id: number;
    valor: number;
    data_pagamento: string;
    forma_pagamento: string;
    status: string;
    referencia: string;
  }>>> {
    logger.info('Getting payment history', { cpfcnpj: cpfcnpj.replace(/\d/g, '*') });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<Array<{
      id: number;
      valor: number;
      data_pagamento: string;
      forma_pagamento: string;
      status: string;
      referencia: string;
    }>>(
      '/central/pagamentos',
      filters || {},
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async getUsageData(
    cpfcnpj: string,
    senha: string,
    periodo?: string
  ): Promise<SGPResponse<{
    periodo: string;
    total_download: number;
    total_upload: number;
    limite_mensal?: number;
    dias_restantes: number;
    historico_diario: Array<{
      data: string;
      download: number;
      upload: number;
    }>;
  }>> {
    logger.info('Getting usage data', { cpfcnpj: cpfcnpj.replace(/\d/g, '*'), periodo });

    const credentials: AuthCredentials = {
      method: 'cpf_cnpj',
      cpfcnpj,
      senha
    };

    return this.client.post<{
      periodo: string;
      total_download: number;
      total_upload: number;
      limite_mensal?: number;
      dias_restantes: number;
      historico_diario: Array<{
        data: string;
        download: number;
        upload: number;
      }>;
    }>(
      '/central/consumo',
      { periodo: periodo || 'atual' },
      {
        authMethod: 'cpf_cnpj',
        credentials
      }
    );
  }

  async suspendContract(
    contrato_id: string,
    motivo: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Suspending contract', { contrato_id, motivo });

    return this.client.post<{ success: boolean; message: string }>(
      `/contratos/${contrato_id}/suspender`,
      { motivo },
      { authMethod: 'token' }
    );
  }

  async reactivateContract(
    contrato_id: string,
    observacoes?: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Reactivating contract', { contrato_id });

    return this.client.post<{ success: boolean; message: string }>(
      `/contratos/${contrato_id}/reativar`,
      { observacoes: observacoes || '' },
      { authMethod: 'token' }
    );
  }

  // ==================== PRE-REGISTRATION FUNCTIONALITY ====================

  async createPreRegistration(
    preRegData: {
      nome: string;
      cpf_cnpj: string;
      telefone: string;
      email: string;
      endereco: string;
      cep: string;
      plano_interesse?: string;
      origem?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<PreRegistration>> {
    logger.info('Creating pre-registration', { nome: preRegData.nome, cpf_cnpj: preRegData.cpf_cnpj.replace(/\d/g, '*') });

    return this.client.post<PreRegistration>(
      '/pre-cadastros',
      preRegData,
      { authMethod: 'token' }
    );
  }

  async checkCoverage(
    cep: string,
    endereco?: string
  ): Promise<SGPResponse<{
    disponivel: boolean;
    tecnologia: string[];
    planos_disponiveis: Array<{
      id: number;
      nome: string;
      velocidade: string;
      valor: number;
    }>;
    prazo_instalacao: string;
    observacoes?: string;
  }>> {
    logger.info('Checking coverage', { cep });

    return this.client.get<{
      disponivel: boolean;
      tecnologia: string[];
      planos_disponiveis: Array<{
        id: number;
        nome: string;
        velocidade: string;
        valor: number;
      }>;
      prazo_instalacao: string;
      observacoes?: string;
    }>(
      `/cobertura/${cep}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `coverage_${cep}`
      }
    );
  }

  async scheduleInstallation(
    pre_cadastro_id: string,
    data_agendamento: string,
    periodo: string,
    observacoes?: string
  ): Promise<SGPResponse<{ success: boolean; protocolo: string; message: string }>> {
    logger.info('Scheduling installation', { pre_cadastro_id, data_agendamento });

    return this.client.post<{ success: boolean; protocolo: string; message: string }>(
      `/pre-cadastros/${pre_cadastro_id}/agendar`,
      {
        data_agendamento,
        periodo,
        observacoes
      },
      { authMethod: 'token' }
    );
  }

  // ==================== RADIUS FUNCTIONALITY ====================

  async createRadiusUser(
    userData: {
      username: string;
      password: string;
      grupo_id: number;
      cliente_id?: number;
      ip_fixo?: string;
      perfil_velocidade: string;
    }
  ): Promise<SGPResponse<RadiusUser>> {
    logger.info('Creating Radius user', { username: userData.username });

    return this.client.post<RadiusUser>(
      '/radius/usuarios',
      userData,
      { authMethod: 'token' }
    );
  }

  async listRadiusUsers(
    filters?: {
      status?: string;
      grupo_id?: number;
      cliente_id?: number;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusUser>> {
    logger.info('Listing Radius users', filters);

    return this.client.getPaginated<RadiusUser>(
      '/radius/usuarios',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getActiveSessions(): Promise<SGPResponse<RadiusSession[]>> {
    logger.info('Getting active Radius sessions');

    return this.client.get<RadiusSession[]>(
      '/radius/sessoes',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'active_radius_sessions'
      }
    );
  }

  async disconnectRadiusUser(
    username: string,
    motivo?: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Disconnecting Radius user', { username });

    return this.client.post<{ success: boolean; message: string }>(
      `/radius/usuarios/${username}/desconectar`,
      { motivo: motivo || 'Desconexão administrativa' },
      { authMethod: 'token' }
    );
  }

  // ==================== EXPANDED INVENTORY FUNCTIONALITY ====================

  async addStockMovement(
    movementData: {
      produto_id: number;
      tipo: 'entrada' | 'saida';
      quantidade: number;
      motivo: string;
      fornecedor_id?: number;
      valor_unitario?: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<{ id: number; success: boolean; estoque_atual: number }>> {
    logger.info('Adding stock movement', { produto_id: movementData.produto_id, tipo: movementData.tipo, quantidade: movementData.quantidade });

    return this.client.post<{ id: number; success: boolean; estoque_atual: number }>(
      '/estoque/movimentacoes',
      movementData,
      { authMethod: 'token' }
    );
  }

  async trackSerialNumber(
    serial: string
  ): Promise<SGPResponse<{
    produto: string;
    status: string;
    cliente_id?: number;
    contrato_id?: number;
    data_saida?: string;
    historico: Array<{
      data: string;
      acao: string;
      responsavel: string;
      observacoes?: string;
    }>;
  }>> {
    logger.info('Tracking serial number', { serial });

    return this.client.get<{
      produto: string;
      status: string;
      cliente_id?: number;
      contrato_id?: number;
      data_saida?: string;
      historico: Array<{
        data: string;
        acao: string;
        responsavel: string;
        observacoes?: string;
      }>;
    }>(
      `/estoque/rastrear/${serial}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `serial_${serial}`
      }
    );
  }

  async getStockAlerts(): Promise<SGPResponse<Array<{
    produto_id: number;
    produto_nome: string;
    estoque_atual: number;
    estoque_minimo: number;
    status: string;
    dias_sem_movimento: number;
  }>>> {
    logger.info('Getting stock alerts');

    return this.client.get<Array<{
      produto_id: number;
      produto_nome: string;
      estoque_atual: number;
      estoque_minimo: number;
      status: string;
      dias_sem_movimento: number;
    }>>(
      '/estoque/alertas',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'stock_alerts'
      }
    );
  }

  // ==================== ACCEPTANCE TERMS FUNCTIONALITY ====================

  async createAcceptanceTerm(
    termData: {
      titulo: string;
      conteudo: string;
      tipo: string;
      obrigatorio: boolean;
      data_ativacao?: string;
    }
  ): Promise<SGPResponse<AcceptanceTerm>> {
    logger.info('Creating acceptance term', { titulo: termData.titulo, tipo: termData.tipo });

    return this.client.post<AcceptanceTerm>(
      '/termos',
      termData,
      { authMethod: 'token' }
    );
  }

  async listAcceptanceTerms(
    filters?: {
      status?: string;
      tipo?: string;
      obrigatorio?: boolean;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<AcceptanceTerm>> {
    logger.info('Listing acceptance terms', filters);

    return this.client.getPaginated<AcceptanceTerm>(
      '/termos',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getAcceptanceTermDetails(
    termo_id: string
  ): Promise<SGPResponse<AcceptanceTerm>> {
    logger.info('Getting acceptance term details', { termo_id });

    return this.client.get<AcceptanceTerm>(
      `/termos/${termo_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `term_${termo_id}`
      }
    );
  }

  async recordTermAcceptance(
    acceptanceData: {
      termo_id: number;
      cliente_id: number;
      ip_aceite: string;
      user_agent: string;
      versao_aceita: string;
    }
  ): Promise<SGPResponse<TermAcceptance>> {
    logger.info('Recording term acceptance', { termo_id: acceptanceData.termo_id, cliente_id: acceptanceData.cliente_id });

    return this.client.post<TermAcceptance>(
      `/termos/${acceptanceData.termo_id}/aceites`,
      acceptanceData,
      { authMethod: 'token' }
    );
  }

  async getCustomerAcceptances(
    cliente_id: number
  ): Promise<SGPResponse<TermAcceptance[]>> {
    logger.info('Getting customer acceptances', { cliente_id });

    return this.client.get<TermAcceptance[]>(
      `/clientes/${cliente_id}/aceites`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `customer_acceptances_${cliente_id}`
      }
    );
  }

  async validateTermAcceptance(
    termo_id: number,
    cliente_id: number
  ): Promise<SGPResponse<{
    aceito: boolean;
    data_aceite?: string;
    versao_aceita?: string;
    requer_novo_aceite: boolean;
    termo_atual: AcceptanceTerm;
  }>> {
    logger.info('Validating term acceptance', { termo_id, cliente_id });

    return this.client.get<{
      aceito: boolean;
      data_aceite?: string;
      versao_aceita?: string;
      requer_novo_aceite: boolean;
      termo_atual: AcceptanceTerm;
    }>(
      `/termos/${termo_id}/validar/${cliente_id}`,
      { authMethod: 'token' }
    );
  }

  // ==================== ADMINISTRATIVE FUNCTIONALITY ====================

  async createSystemUser(
    userData: {
      nome: string;
      email: string;
      username: string;
      password: string;
      perfil: string;
      permissoes: string[];
    }
  ): Promise<SGPResponse<SystemUser>> {
    logger.info('Creating system user', { username: userData.username, perfil: userData.perfil });

    return this.client.post<SystemUser>(
      '/admin/usuarios',
      userData,
      { authMethod: 'token' }
    );
  }

  async listSystemUsers(
    filters?: {
      status?: string;
      perfil?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<SystemUser>> {
    logger.info('Listing system users', filters);

    return this.client.getPaginated<SystemUser>(
      '/admin/usuarios',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async updateSystemUser(
    usuario_id: string,
    updateData: {
      nome?: string;
      email?: string;
      status?: string;
      perfil?: string;
      permissoes?: string[];
    }
  ): Promise<SGPResponse<SystemUser>> {
    logger.info('Updating system user', { usuario_id });

    return this.client.put<SystemUser>(
      `/admin/usuarios/${usuario_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async getAuditLogs(
    filters?: {
      usuario_id?: number;
      modulo?: string;
      acao?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<AuditLog>> {
    logger.info('Getting audit logs', filters);

    return this.client.getPaginated<AuditLog>(
      '/admin/logs',
      filters,
      { authMethod: 'token' }
    );
  }

  async getSystemSettings(): Promise<SGPResponse<Record<string, any>>> {
    logger.info('Getting system settings');

    return this.client.get<Record<string, any>>(
      '/admin/configuracoes',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'system_settings'
      }
    );
  }

  async updateSystemSetting(
    chave: string,
    valor: any
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Updating system setting', { chave });

    return this.client.put<{ success: boolean; message: string }>(
      `/admin/configuracoes/${chave}`,
      { valor },
      { authMethod: 'token' }
    );
  }

  async getSystemStats(): Promise<SGPResponse<{
    clientes_ativos: number;
    contratos_ativos: number;
    faturamento_mes: number;
    chamados_abertos: number;
    onus_online: number;
    performance: {
      cpu_usage: number;
      memory_usage: number;
      disk_usage: number;
      api_calls_last_hour: number;
    };
  }>> {
    logger.info('Getting system statistics');

    return this.client.get<{
      clientes_ativos: number;
      contratos_ativos: number;
      faturamento_mes: number;
      chamados_abertos: number;
      onus_online: number;
      performance: {
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
        api_calls_last_hour: number;
      };
    }>(
      '/admin/estatisticas',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'system_stats'
      }
    );
  }

  // ==================== ADDITIONAL SUPPORT FUNCTIONALITY ====================

  async updateSupportTicket(
    chamado_id: string,
    updateData: {
      status?: string;
      prioridade_id?: number;
      responsavel_id?: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<SupportTicket>> {
    logger.info('Updating support ticket', { chamado_id, status: updateData.status });

    return this.client.put<SupportTicket>(
      `/suporte/chamados/${chamado_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async addTicketInteraction(
    chamado_id: string,
    interactionData: {
      tipo: 'comentario' | 'email' | 'telefone' | 'whatsapp';
      conteudo: string;
      publico: boolean;
      responsavel_id?: number;
    }
  ): Promise<SGPResponse<{ id: number; success: boolean }>> {
    logger.info('Adding ticket interaction', { chamado_id, tipo: interactionData.tipo });

    return this.client.post<{ id: number; success: boolean }>(
      `/suporte/chamados/${chamado_id}/interacoes`,
      interactionData,
      { authMethod: 'token' }
    );
  }

  async closeSupportTicket(
    chamado_id: string,
    closeData: {
      solucao: string;
      satisfacao_cliente?: number;
      observacoes_internas?: string;
    }
  ): Promise<SGPResponse<SupportTicket>> {
    logger.info('Closing support ticket', { chamado_id });

    return this.client.post<SupportTicket>(
      `/suporte/chamados/${chamado_id}/fechar`,
      closeData,
      { authMethod: 'token' }
    );
  }

  // ==================== FTTH INFRASTRUCTURE COMPLETE ====================

  // CAIXAS FTTH
  async listFTTHBoxes(
    filters?: {
      olt_id?: number;
      tipo?: string;
      status?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<FTTHBox>> {
    logger.info('Listing FTTH boxes', filters);

    return this.client.getPaginated<FTTHBox>(
      '/ftth/caixas',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async createFTTHBox(
    boxData: {
      nome: string;
      tipo: string;
      endereco: string;
      coordenadas?: {
        latitude: number;
        longitude: number;
      };
      olt_id: number;
      splitter_id?: number;
      capacidade: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<FTTHBox>> {
    logger.info('Creating FTTH box', { nome: boxData.nome, tipo: boxData.tipo });

    return this.client.post<FTTHBox>(
      '/ftth/caixas',
      boxData,
      { authMethod: 'token' }
    );
  }

  async getFTTHBoxDetails(
    caixa_id: string
  ): Promise<SGPResponse<FTTHBox>> {
    logger.info('Getting FTTH box details', { caixa_id });

    return this.client.get<FTTHBox>(
      `/ftth/caixas/${caixa_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ftth_box_${caixa_id}`
      }
    );
  }

  async updateFTTHBox(
    caixa_id: string,
    updateData: {
      nome?: string;
      tipo?: string;
      endereco?: string;
      coordenadas?: {
        latitude: number;
        longitude: number;
      };
      capacidade?: number;
      status?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<FTTHBox>> {
    logger.info('Updating FTTH box', { caixa_id });

    return this.client.put<FTTHBox>(
      `/ftth/caixas/${caixa_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteFTTHBox(
    caixa_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting FTTH box', { caixa_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/ftth/caixas/${caixa_id}`,
      { authMethod: 'token' }
    );
  }

  // SPLITTERS FTTH
  async listFTTHSplitters(
    filters?: {
      caixa_id?: number;
      olt_id?: number;
      tipo?: string;
      status?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<FTTHSplitter>> {
    logger.info('Listing FTTH splitters', filters);

    return this.client.getPaginated<FTTHSplitter>(
      '/ftth/splitters',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async createFTTHSplitter(
    splitterData: {
      nome: string;
      tipo: string;
      razao_divisao: string;
      caixa_id: number;
      olt_id: number;
      porta_olt: number;
      capacidade_entrada: number;
      capacidade_saida: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<FTTHSplitter>> {
    logger.info('Creating FTTH splitter', { nome: splitterData.nome, razao_divisao: splitterData.razao_divisao });

    return this.client.post<FTTHSplitter>(
      '/ftth/splitters',
      splitterData,
      { authMethod: 'token' }
    );
  }

  async getFTTHSplitterDetails(
    splitter_id: string
  ): Promise<SGPResponse<FTTHSplitter>> {
    logger.info('Getting FTTH splitter details', { splitter_id });

    return this.client.get<FTTHSplitter>(
      `/ftth/splitters/${splitter_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ftth_splitter_${splitter_id}`
      }
    );
  }

  async updateFTTHSplitter(
    splitter_id: string,
    updateData: {
      nome?: string;
      tipo?: string;
      razao_divisao?: string;
      porta_olt?: number;
      capacidade_entrada?: number;
      capacidade_saida?: number;
      status?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<FTTHSplitter>> {
    logger.info('Updating FTTH splitter', { splitter_id });

    return this.client.put<FTTHSplitter>(
      `/ftth/splitters/${splitter_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteFTTHSplitter(
    splitter_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting FTTH splitter', { splitter_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/ftth/splitters/${splitter_id}`,
      { authMethod: 'token' }
    );
  }

  // OLT MANAGEMENT COMPLETE
  async createOLT(
    oltData: {
      nome: string;
      ip: string;
      modelo: string;
      total_portas: number;
      comunidade_snmp?: string;
      versao_snmp?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<OLTDetails>> {
    logger.info('Creating OLT', { nome: oltData.nome, ip: oltData.ip });

    return this.client.post<OLTDetails>(
      '/ftth/olts',
      oltData,
      { authMethod: 'token' }
    );
  }

  async getOLTDetails(
    olt_id: string
  ): Promise<SGPResponse<OLTDetails>> {
    logger.info('Getting OLT details', { olt_id });

    return this.client.get<OLTDetails>(
      `/ftth/olts/${olt_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `olt_details_${olt_id}`
      }
    );
  }

  async updateOLT(
    olt_id: string,
    updateData: {
      nome?: string;
      ip?: string;
      modelo?: string;
      total_portas?: number;
      status?: string;
      comunidade_snmp?: string;
      versao_snmp?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<OLTDetails>> {
    logger.info('Updating OLT', { olt_id });

    return this.client.put<OLTDetails>(
      `/ftth/olts/${olt_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteOLT(
    olt_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting OLT', { olt_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/ftth/olts/${olt_id}`,
      { authMethod: 'token' }
    );
  }

  // ONU MANAGEMENT COMPLETE
  async createONU(
    onuData: {
      serial: string;
      modelo: string;
      olt_id: number;
      porta_olt: number;
      vlan?: number;
      mac_address?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<ONUDetails>> {
    logger.info('Creating ONU', { serial: onuData.serial, modelo: onuData.modelo });

    return this.client.post<ONUDetails>(
      '/ftth/onus',
      onuData,
      { authMethod: 'token' }
    );
  }

  async updateONU(
    onu_id: string,
    updateData: {
      serial?: string;
      modelo?: string;
      olt_id?: number;
      porta_olt?: number;
      vlan?: number;
      mac_address?: string;
      status?: string;
      contrato_id?: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<ONUDetails>> {
    logger.info('Updating ONU', { onu_id });

    return this.client.put<ONUDetails>(
      `/ftth/onus/${onu_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteONU(
    onu_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting ONU', { onu_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/ftth/onus/${onu_id}`,
      { authMethod: 'token' }
    );
  }

  // FTTH TOPOLOGY AND MONITORING
  async getFTTHTopology(
    olt_id?: string
  ): Promise<SGPResponse<{
    olts: OLTDetails[];
    caixas: FTTHBox[];
    splitters: FTTHSplitter[];
    onus: ONUDetails[];
    conexoes: Array<{
      origem_tipo: string;
      origem_id: number;
      destino_tipo: string;
      destino_id: number;
      porta_origem?: number;
      porta_destino?: number;
    }>;
  }>> {
    logger.info('Getting FTTH topology', { olt_id });

    const endpoint = olt_id ? `/ftth/topologia/${olt_id}` : '/ftth/topologia';
    
    return this.client.get<{
      olts: OLTDetails[];
      caixas: FTTHBox[];
      splitters: FTTHSplitter[];
      onus: ONUDetails[];
      conexoes: Array<{
        origem_tipo: string;
        origem_id: number;
        destino_tipo: string;
        destino_id: number;
        porta_origem?: number;
        porta_destino?: number;
      }>;
    }>(
      endpoint,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ftth_topology_${olt_id || 'all'}`
      }
    );
  }

  async getFTTHAlarms(): Promise<SGPResponse<Array<{
    id: number;
    tipo: string;
    equipamento_tipo: string;
    equipamento_id: number;
    equipamento_nome: string;
    severidade: 'critica' | 'alta' | 'media' | 'baixa';
    descricao: string;
    data_ocorrencia: string;
    data_resolucao?: string;
    status: 'ativo' | 'resolvido' | 'ignorado';
    responsavel_id?: number;
  }>>> {
    logger.info('Getting FTTH alarms');

    return this.client.get<Array<{
      id: number;
      tipo: string;
      equipamento_tipo: string;
      equipamento_id: number;
      equipamento_nome: string;
      severidade: 'critica' | 'alta' | 'media' | 'baixa';
      descricao: string;
      data_ocorrencia: string;
      data_resolucao?: string;
      status: 'ativo' | 'resolvido' | 'ignorado';
      responsavel_id?: number;
    }>>(
      '/ftth/alarmes',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'ftth_alarms'
      }
    );
  }

  async getFTTHCapacityReport(): Promise<SGPResponse<{
    resumo: {
      total_olts: number;
      total_caixas: number;
      total_splitters: number;
      total_onus: number;
      capacidade_total: number;
      ocupacao_total: number;
      percentual_ocupacao: number;
    };
    por_olt: Array<{
      olt_id: number;
      olt_nome: string;
      capacidade: number;
      ocupacao: number;
      percentual: number;
      caixas: number;
      splitters: number;
      onus_ativas: number;
    }>;
  }>> {
    logger.info('Getting FTTH capacity report');

    return this.client.get<{
      resumo: {
        total_olts: number;
        total_caixas: number;
        total_splitters: number;
        total_onus: number;
        capacidade_total: number;
        ocupacao_total: number;
        percentual_ocupacao: number;
      };
      por_olt: Array<{
        olt_id: number;
        olt_nome: string;
        capacidade: number;
        ocupacao: number;
        percentual: number;
        caixas: number;
        splitters: number;
        onus_ativas: number;
      }>;
    }>(
      '/ftth/relatorio-capacidade',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'ftth_capacity_report'
      }
    );
  }

  // ==================== SISTEMA DE BOLETOS COMPLETO ====================

  async listBoletos(
    filters?: {
      status?: string;
      cliente_id?: number;
      banco_id?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<BoletoDetails>> {
    logger.info('Listing boletos', filters);

    return this.client.getPaginated<BoletoDetails>(
      '/boletos/listar',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async generateBoleto(
    boletoData: {
      cliente_id: number;
      contrato_id?: number;
      fatura_id?: number;
      valor: number;
      data_vencimento: string;
      banco_id: number;
      instrucoes?: string;
      multa_percentual?: number;
      juros_diario?: number;
      desconto_percentual?: number;
      data_limite_desconto?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<BoletoDetails>> {
    logger.info('Generating boleto', { cliente_id: boletoData.cliente_id, valor: boletoData.valor });

    return this.client.post<BoletoDetails>(
      '/boletos/gerar',
      boletoData,
      { authMethod: 'token' }
    );
  }

  async getBoletoDetails(
    boleto_id: string
  ): Promise<SGPResponse<BoletoDetails>> {
    logger.info('Getting boleto details', { boleto_id });

    return this.client.get<BoletoDetails>(
      `/boletos/detalhes/${boleto_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `boleto_${boleto_id}`
      }
    );
  }

  async cancelBoleto(
    boleto_id: string,
    motivo?: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Canceling boleto', { boleto_id, motivo });

    return this.client.post<{ success: boolean; message: string }>(
      `/boletos/cancelar/${boleto_id}`,
      { motivo: motivo || 'Cancelamento solicitado' },
      { authMethod: 'token' }
    );
  }

  async downloadBoletoPDF(
    boleto_id: string
  ): Promise<SGPResponse<{ pdf_url: string; pdf_base64?: string }>> {
    logger.info('Downloading boleto PDF', { boleto_id });

    return this.client.get<{ pdf_url: string; pdf_base64?: string }>(
      `/boletos/download/${boleto_id}`,
      { authMethod: 'token' }
    );
  }

  async registerBoletoPayment(
    boleto_id: string,
    paymentData: {
      data_pagamento: string;
      valor_pago: number;
      forma_pagamento: string;
      banco_pagador?: string;
      agencia_pagadora?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Registering boleto payment', { boleto_id, valor_pago: paymentData.valor_pago });

    return this.client.post<{ success: boolean; message: string }>(
      `/boletos/registrar-pagamento/${boleto_id}`,
      paymentData,
      { authMethod: 'token' }
    );
  }

  // ==================== GESTÃO DE REMESSAS EXPANDIDA ====================

  async listRemessas(
    filters?: {
      banco_id?: number;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RemessaDetails>> {
    logger.info('Listing remessas', filters);

    return this.client.getPaginated<RemessaDetails>(
      '/remessa/listar',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async downloadRemessa(
    remessa_id: string
  ): Promise<SGPResponse<{ arquivo_url: string; arquivo_base64?: string }>> {
    logger.info('Downloading remessa file', { remessa_id });

    return this.client.get<{ arquivo_url: string; arquivo_base64?: string }>(
      `/remessa/download/${remessa_id}`,
      { authMethod: 'token' }
    );
  }

  async getRemessaDetails(
    remessa_id: string
  ): Promise<SGPResponse<RemessaDetails>> {
    logger.info('Getting remessa details', { remessa_id });

    return this.client.get<RemessaDetails>(
      `/remessa/detalhes/${remessa_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `remessa_${remessa_id}`
      }
    );
  }

  // ==================== GESTÃO DE RETORNOS EXPANDIDA ====================

  async listRetornos(
    filters?: {
      banco_id?: number;
      remessa_id?: number;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RetornoDetails>> {
    logger.info('Listing retornos', filters);

    return this.client.getPaginated<RetornoDetails>(
      '/retorno/listar',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getRetornoDetails(
    retorno_id: string
  ): Promise<SGPResponse<RetornoDetails>> {
    logger.info('Getting retorno details', { retorno_id });

    return this.client.get<RetornoDetails>(
      `/retorno/detalhes/${retorno_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `retorno_${retorno_id}`
      }
    );
  }

  async processRetornoFile(
    retornoData: {
      arquivo: string; // base64 ou path
      banco_id: number;
      processar_automatico?: boolean;
      notificar_clientes?: boolean;
    }
  ): Promise<SGPResponse<RetornoDetails>> {
    logger.info('Processing advanced return file', { banco_id: retornoData.banco_id });

    return this.client.post<RetornoDetails>(
      '/retorno/processar-avancado',
      retornoData,
      { authMethod: 'token' }
    );
  }

  // ==================== RELATÓRIOS FINANCEIROS ====================

  async getFinancialReport(
    filters: {
      data_inicio: string;
      data_fim: string;
      banco_id?: number;
      tipo_relatorio?: 'boletos' | 'remessas' | 'retornos' | 'geral';
    }
  ): Promise<SGPResponse<{
    periodo: {
      inicio: string;
      fim: string;
    };
    resumo: {
      total_boletos_gerados: number;
      total_boletos_pagos: number;
      total_boletos_vencidos: number;
      total_boletos_cancelados: number;
      valor_total_gerado: number;
      valor_total_pago: number;
      valor_total_vencido: number;
      taxa_inadimplencia: number;
    };
    por_banco: Array<{
      banco_id: number;
      banco_nome: string;
      boletos_gerados: number;
      boletos_pagos: number;
      valor_gerado: number;
      valor_pago: number;
      taxa_pagamento: number;
    }>;
    detalhes_diarios: Array<{
      data: string;
      boletos_gerados: number;
      boletos_pagos: number;
      valor_gerado: number;
      valor_pago: number;
    }>;
  }>> {
    logger.info('Getting financial report', filters);

    return this.client.post<{
      periodo: {
        inicio: string;
        fim: string;
      };
      resumo: {
        total_boletos_gerados: number;
        total_boletos_pagos: number;
        total_boletos_vencidos: number;
        total_boletos_cancelados: number;
        valor_total_gerado: number;
        valor_total_pago: number;
        valor_total_vencido: number;
        taxa_inadimplencia: number;
      };
      por_banco: Array<{
        banco_id: number;
        banco_nome: string;
        boletos_gerados: number;
        boletos_pagos: number;
        valor_gerado: number;
        valor_pago: number;
        taxa_pagamento: number;
      }>;
      detalhes_diarios: Array<{
        data: string;
        boletos_gerados: number;
        boletos_pagos: number;
        valor_gerado: number;
        valor_pago: number;
      }>;
    }>(
      '/relatorios/financeiro',
      filters,
      { authMethod: 'token' }
    );
  }

  // ==================== SISTEMA URA COMPLETO ====================

  // URA CONTRACT MANAGEMENT
  async uraGetContract(
    contrato_id: string
  ): Promise<SGPResponse<URAContract>> {
    logger.info('Getting URA contract details', { contrato_id });

    return this.client.get<URAContract>(
      `/ura/contrato/${contrato_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_contract_${contrato_id}`
      }
    );
  }

  // URA INVOICE MANAGEMENT
  async uraListInvoices(
    contrato_id: string
  ): Promise<SGPResponse<URAInvoice[]>> {
    logger.info('Getting URA invoices list', { contrato_id });

    return this.client.get<URAInvoice[]>(
      `/ura/faturas/${contrato_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_invoices_${contrato_id}`
      }
    );
  }

  async uraGetInvoiceDetails(
    contrato_id: string,
    fatura_id: string
  ): Promise<SGPResponse<URAInvoice>> {
    logger.info('Getting URA invoice details', { contrato_id, fatura_id });

    return this.client.get<URAInvoice>(
      `/ura/faturas/${contrato_id}/${fatura_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_invoice_${contrato_id}_${fatura_id}`
      }
    );
  }

  // URA TICKET MANAGEMENT
  async uraCreateTicket(
    ticketData: {
      cliente_id: number;
      contrato_id?: number;
      assunto: string;
      descricao: string;
      categoria: string;
      prioridade?: string;
      canal?: string;
    }
  ): Promise<SGPResponse<URATicket>> {
    logger.info('Creating URA ticket', { cliente_id: ticketData.cliente_id, assunto: ticketData.assunto });

    return this.client.post<URATicket>(
      '/ura/chamados/abrir',
      ticketData,
      { authMethod: 'token' }
    );
  }

  async uraGetTicket(
    chamado_id: string
  ): Promise<SGPResponse<URATicket>> {
    logger.info('Getting URA ticket details', { chamado_id });

    return this.client.get<URATicket>(
      `/ura/chamados/${chamado_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_ticket_${chamado_id}`
      }
    );
  }

  async uraListCustomerTickets(
    cliente_id: string
  ): Promise<SGPResponse<URATicket[]>> {
    logger.info('Getting URA customer tickets', { cliente_id });

    return this.client.get<URATicket[]>(
      `/ura/chamados/cliente/${cliente_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_customer_tickets_${cliente_id}`
      }
    );
  }

  // URA ATENDIMENTO MANAGEMENT
  async uraCreateAtendimento(
    atendimentoData: {
      cliente_id: number;
      tipo_atendimento: string;
      canal: 'telefone' | 'whatsapp' | 'email' | 'chat' | 'presencial';
      operador_id?: number;
      resumo: string;
      observacoes?: string;
      tags?: string[];
    }
  ): Promise<SGPResponse<URAAtendimento>> {
    logger.info('Creating URA atendimento', { cliente_id: atendimentoData.cliente_id, canal: atendimentoData.canal });

    return this.client.post<URAAtendimento>(
      '/ura/atendimentos',
      atendimentoData,
      { authMethod: 'token' }
    );
  }

  async uraGetAtendimento(
    atendimento_id: string
  ): Promise<SGPResponse<URAAtendimento>> {
    logger.info('Getting URA atendimento details', { atendimento_id });

    return this.client.get<URAAtendimento>(
      `/ura/atendimentos/${atendimento_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_atendimento_${atendimento_id}`
      }
    );
  }

  async uraListCustomerAtendimentos(
    cliente_id: string
  ): Promise<SGPResponse<URAAtendimento[]>> {
    logger.info('Getting URA customer atendimentos', { cliente_id });

    return this.client.get<URAAtendimento[]>(
      `/ura/atendimentos/cliente/${cliente_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_customer_atendimentos_${cliente_id}`
      }
    );
  }

  async uraFinishAtendimento(
    atendimento_id: string,
    finishData: {
      resumo_final: string;
      solucao?: string;
      satisfacao?: number;
      observacoes?: string;
      tags?: string[];
    }
  ): Promise<SGPResponse<URAAtendimento>> {
    logger.info('Finishing URA atendimento', { atendimento_id });

    return this.client.post<URAAtendimento>(
      `/ura/atendimentos/${atendimento_id}/finalizar`,
      finishData,
      { authMethod: 'token' }
    );
  }

  // URA MENU MANAGEMENT
  async uraGetMenu(): Promise<SGPResponse<URAMenu[]>> {
    logger.info('Getting URA menu structure');

    return this.client.get<URAMenu[]>(
      '/ura/menu',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'ura_menu_structure'
      }
    );
  }

  async uraUpdateMenu(
    menu_id: string,
    menuData: {
      nome?: string;
      opcoes?: Array<{
        tecla: string;
        descricao: string;
        acao: string;
        submenu_id?: number;
        destino?: string;
      }>;
      audio_url?: string;
      texto_tts?: string;
      timeout_segundos?: number;
      tentativas_maximas?: number;
      ativo?: boolean;
    }
  ): Promise<SGPResponse<URAMenu>> {
    logger.info('Updating URA menu', { menu_id });

    return this.client.put<URAMenu>(
      `/ura/menu/${menu_id}`,
      menuData,
      { authMethod: 'token' }
    );
  }

  // URA QUEUE STATUS
  async uraGetQueuesStatus(): Promise<SGPResponse<URAFilaStatus[]>> {
    logger.info('Getting URA queues status');

    return this.client.get<URAFilaStatus[]>(
      '/ura/filas/status',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'ura_queues_status'
      }
    );
  }

  async uraGetQueueMetrics(
    fila_nome?: string,
    data_inicio?: string,
    data_fim?: string
  ): Promise<SGPResponse<{
    fila: string;
    periodo: {
      inicio: string;
      fim: string;
    };
    metricas: {
      chamadas_recebidas: number;
      chamadas_atendidas: number;
      chamadas_abandonadas: number;
      tempo_medio_espera: number;
      tempo_medio_atendimento: number;
      tempo_maximo_espera: number;
      nivel_servico: number;
      taxa_abandono: number;
    };
    por_hora: Array<{
      hora: string;
      chamadas_recebidas: number;
      chamadas_atendidas: number;
      tempo_medio_espera: number;
    }>;
    operadores: Array<{
      id: number;
      nome: string;
      chamadas_atendidas: number;
      tempo_total_atendimento: number;
      tempo_medio_atendimento: number;
      disponibilidade: number;
    }>;
  }>> {
    logger.info('Getting URA queue metrics', { fila_nome, data_inicio, data_fim });

    const params = new URLSearchParams();
    if (fila_nome) params.append('fila', fila_nome);
    if (data_inicio) params.append('data_inicio', data_inicio);
    if (data_fim) params.append('data_fim', data_fim);

    const endpoint = params.toString() 
      ? `/ura/metricas?${params.toString()}`
      : '/ura/metricas';

    return this.client.get<{
      fila: string;
      periodo: {
        inicio: string;
        fim: string;
      };
      metricas: {
        chamadas_recebidas: number;
        chamadas_atendidas: number;
        chamadas_abandonadas: number;
        tempo_medio_espera: number;
        tempo_medio_atendimento: number;
        tempo_maximo_espera: number;
        nivel_servico: number;
        taxa_abandono: number;
      };
      por_hora: Array<{
        hora: string;
        chamadas_recebidas: number;
        chamadas_atendidas: number;
        tempo_medio_espera: number;
      }>;
      operadores: Array<{
        id: number;
        nome: string;
        chamadas_atendidas: number;
        tempo_total_atendimento: number;
        tempo_medio_atendimento: number;
        disponibilidade: number;
      }>;
    }>(
      endpoint,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_metrics_${fila_nome || 'all'}_${data_inicio}_${data_fim}`
      }
    );
  }

  // ==================== SISTEMA DE ESTOQUE AVANÇADO ====================

  // GESTÃO DE FORNECEDORES
  async listFornecedores(
    filters?: {
      status?: string;
      cidade?: string;
      estado?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<Fornecedor>> {
    logger.info('Listing fornecedores', filters);

    return this.client.getPaginated<Fornecedor>(
      '/estoque/fornecedores',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async createFornecedor(
    fornecedorData: {
      nome: string;
      razao_social: string;
      cnpj: string;
      contato_nome?: string;
      contato_email?: string;
      contato_telefone?: string;
      endereco: string;
      cep: string;
      cidade: string;
      estado: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<Fornecedor>> {
    logger.info('Creating fornecedor', { nome: fornecedorData.nome, cnpj: fornecedorData.cnpj });

    return this.client.post<Fornecedor>(
      '/estoque/fornecedores',
      fornecedorData,
      { authMethod: 'token' }
    );
  }

  async getFornecedorDetails(
    fornecedor_id: string
  ): Promise<SGPResponse<Fornecedor>> {
    logger.info('Getting fornecedor details', { fornecedor_id });

    return this.client.get<Fornecedor>(
      `/estoque/fornecedores/${fornecedor_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `fornecedor_${fornecedor_id}`
      }
    );
  }

  async updateFornecedor(
    fornecedor_id: string,
    updateData: {
      nome?: string;
      razao_social?: string;
      contato_nome?: string;
      contato_email?: string;
      contato_telefone?: string;
      endereco?: string;
      cep?: string;
      cidade?: string;
      estado?: string;
      status?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<Fornecedor>> {
    logger.info('Updating fornecedor', { fornecedor_id });

    return this.client.put<Fornecedor>(
      `/estoque/fornecedores/${fornecedor_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteFornecedor(
    fornecedor_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting fornecedor', { fornecedor_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/estoque/fornecedores/${fornecedor_id}`,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE CATEGORIAS
  async listCategorias(
    filters?: {
      categoria_pai_id?: number;
      nivel?: number;
      status?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<Categoria>> {
    logger.info('Listing categorias', filters);

    return this.client.getPaginated<Categoria>(
      '/estoque/categorias',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async createCategoria(
    categoriaData: {
      nome: string;
      descricao?: string;
      categoria_pai_id?: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<Categoria>> {
    logger.info('Creating categoria', { nome: categoriaData.nome });

    return this.client.post<Categoria>(
      '/estoque/categorias',
      categoriaData,
      { authMethod: 'token' }
    );
  }

  async getCategoriaDetails(
    categoria_id: string
  ): Promise<SGPResponse<Categoria>> {
    logger.info('Getting categoria details', { categoria_id });

    return this.client.get<Categoria>(
      `/estoque/categorias/${categoria_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `categoria_${categoria_id}`
      }
    );
  }

  async updateCategoria(
    categoria_id: string,
    updateData: {
      nome?: string;
      descricao?: string;
      categoria_pai_id?: number;
      status?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<Categoria>> {
    logger.info('Updating categoria', { categoria_id });

    return this.client.put<Categoria>(
      `/estoque/categorias/${categoria_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteCategoria(
    categoria_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting categoria', { categoria_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/estoque/categorias/${categoria_id}`,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE PRODUTOS EXPANDIDA
  async createProduct(
    productData: {
      nome: string;
      categoria_id: number;
      fornecedor_id?: number;
      codigo: string;
      unidade_medida: string;
      estoque_minimo: number;
      valor_compra: number;
      valor_venda: number;
      localizacao?: string;
      peso?: number;
      dimensoes?: {
        altura: number;
        largura: number;
        profundidade: number;
      };
      garantia_meses?: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<ProductDetailsExtended>> {
    logger.info('Creating product', { nome: productData.nome, codigo: productData.codigo });

    return this.client.post<ProductDetailsExtended>(
      '/estoque/produtos',
      productData,
      { authMethod: 'token' }
    );
  }

  async getProductDetailsExtended(
    produto_id: string
  ): Promise<SGPResponse<ProductDetailsExtended>> {
    logger.info('Getting extended product details', { produto_id });

    return this.client.get<ProductDetailsExtended>(
      `/estoque/produtos/${produto_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `product_extended_${produto_id}`
      }
    );
  }

  async updateProduct(
    produto_id: string,
    updateData: {
      nome?: string;
      categoria_id?: number;
      fornecedor_id?: number;
      codigo?: string;
      unidade_medida?: string;
      estoque_minimo?: number;
      valor_compra?: number;
      valor_venda?: number;
      localizacao?: string;
      peso?: number;
      dimensoes?: {
        altura: number;
        largura: number;
        profundidade: number;
      };
      garantia_meses?: number;
      status?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<ProductDetailsExtended>> {
    logger.info('Updating product', { produto_id });

    return this.client.put<ProductDetailsExtended>(
      `/estoque/produtos/${produto_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteProduct(
    produto_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting product', { produto_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/estoque/produtos/${produto_id}`,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE MOVIMENTAÇÕES EXPANDIDA
  async listMovimentacoes(
    filters?: {
      produto_id?: number;
      tipo?: string;
      fornecedor_id?: number;
      responsavel_id?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<MovimentacaoEstoque>> {
    logger.info('Listing movimentações', filters);

    return this.client.getPaginated<MovimentacaoEstoque>(
      '/estoque/movimentacoes',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getMovimentacaoDetails(
    movimentacao_id: string
  ): Promise<SGPResponse<MovimentacaoEstoque>> {
    logger.info('Getting movimentação details', { movimentacao_id });

    return this.client.get<MovimentacaoEstoque>(
      `/estoque/movimentacoes/${movimentacao_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `movimentacao_${movimentacao_id}`
      }
    );
  }

  async cancelMovimentacao(
    movimentacao_id: string,
    motivo: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Canceling movimentação', { movimentacao_id, motivo });

    return this.client.post<{ success: boolean; message: string }>(
      `/estoque/movimentacoes/${movimentacao_id}/cancelar`,
      { motivo },
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE INVENTÁRIO
  async listInventarios(
    filters?: {
      status?: string;
      responsavel_id?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<Inventario>> {
    logger.info('Listing inventários', filters);

    return this.client.getPaginated<Inventario>(
      '/estoque/inventario',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async createInventario(
    inventarioData: {
      nome: string;
      descricao?: string;
      responsavel_id: number;
      produtos_ids?: number[];
      categorias_ids?: number[];
      observacoes?: string;
    }
  ): Promise<SGPResponse<Inventario>> {
    logger.info('Creating inventário', { nome: inventarioData.nome });

    return this.client.post<Inventario>(
      '/estoque/inventario/iniciar',
      inventarioData,
      { authMethod: 'token' }
    );
  }

  async getInventarioDetails(
    inventario_id: string
  ): Promise<SGPResponse<Inventario>> {
    logger.info('Getting inventário details', { inventario_id });

    return this.client.get<Inventario>(
      `/estoque/inventario/${inventario_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `inventario_${inventario_id}`
      }
    );
  }

  async updateInventarioProduct(
    inventario_id: string,
    produto_id: number,
    updateData: {
      estoque_fisico: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Updating inventário product', { inventario_id, produto_id });

    return this.client.put<{ success: boolean; message: string }>(
      `/estoque/inventario/${inventario_id}/produtos/${produto_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async finishInventario(
    inventario_id: string,
    finishData: {
      observacoes_finais?: string;
      ajustar_estoque?: boolean;
    }
  ): Promise<SGPResponse<Inventario>> {
    logger.info('Finishing inventário', { inventario_id });

    return this.client.post<Inventario>(
      `/estoque/inventario/${inventario_id}/finalizar`,
      finishData,
      { authMethod: 'token' }
    );
  }

  async cancelInventario(
    inventario_id: string,
    motivo: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Canceling inventário', { inventario_id, motivo });

    return this.client.post<{ success: boolean; message: string }>(
      `/estoque/inventario/${inventario_id}/cancelar`,
      { motivo },
      { authMethod: 'token' }
    );
  }

  // RASTREAMENTO DE SERIAL EXPANDIDO
  async listSerialNumbers(
    filters?: {
      produto_id?: number;
      status?: string;
      cliente_id?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<SerialTracking>> {
    logger.info('Listing serial numbers', filters);

    return this.client.getPaginated<SerialTracking>(
      '/estoque/seriais',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async updateSerialStatus(
    serial: string,
    updateData: {
      status: 'estoque' | 'instalado' | 'defeito' | 'garantia' | 'baixado';
      cliente_id?: number;
      contrato_id?: number;
      tecnico_instalacao?: string;
      localizacao_atual?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<SerialTracking>> {
    logger.info('Updating serial status', { serial, status: updateData.status });

    return this.client.put<SerialTracking>(
      `/estoque/seriais/${serial}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  // ==================== RADIUS ADVANCED SYSTEM ====================

  // GESTÃO DE USUÁRIOS RADIUS
  async createRadiusUser(
    userData: {
      username: string;
      password: string;
      grupo_id: number;
      cliente_id?: number;
      ip_fixo?: string;
      perfil_velocidade: string;
      ativo?: boolean;
    }
  ): Promise<SGPResponse<RadiusUser>> {
    logger.info('Creating RADIUS user', { username: userData.username });

    return this.client.post<RadiusUser>(
      '/radius/usuarios',
      userData,
      { authMethod: 'token' }
    );
  }

  async listRadiusUsers(
    filters?: {
      status?: string;
      grupo_id?: number;
      cliente_id?: number;
      ip_fixo?: string;
      perfil_velocidade?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusUser>> {
    logger.info('Listing RADIUS users', filters);

    return this.client.getPaginated<RadiusUser>(
      '/radius/usuarios',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getRadiusUserDetails(
    username: string
  ): Promise<SGPResponse<RadiusUser>> {
    logger.info('Getting RADIUS user details', { username });

    return this.client.get<RadiusUser>(
      `/radius/usuarios/${username}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `radius_user_${username}`
      }
    );
  }

  async updateRadiusUser(
    username: string,
    updateData: {
      password?: string;
      grupo_id?: number;
      ip_fixo?: string;
      perfil_velocidade?: string;
      status?: string;
    }
  ): Promise<SGPResponse<RadiusUser>> {
    logger.info('Updating RADIUS user', { username });

    return this.client.put<RadiusUser>(
      `/radius/usuarios/${username}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteRadiusUser(
    username: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting RADIUS user', { username });

    return this.client.delete<{ success: boolean; message: string }>(
      `/radius/usuarios/${username}`,
      { authMethod: 'token' }
    );
  }

  async disconnectRadiusUser(
    username: string,
    reason?: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Disconnecting RADIUS user', { username, reason });

    return this.client.post<{ success: boolean; message: string }>(
      `/radius/usuarios/${username}/desconectar`,
      { motivo: reason },
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE GRUPOS RADIUS
  async createRadiusGroup(
    groupData: {
      nome: string;
      descricao?: string;
      perfil_velocidade: string;
      download_speed: number;
      upload_speed: number;
      limite_tempo?: number;
      limite_dados?: number;
      prioridade: number;
    }
  ): Promise<SGPResponse<RadiusGroup>> {
    logger.info('Creating RADIUS group', { nome: groupData.nome });

    return this.client.post<RadiusGroup>(
      '/radius/grupos',
      groupData,
      { authMethod: 'token' }
    );
  }

  async listRadiusGroups(
    filters?: {
      status?: string;
      perfil_velocidade?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusGroup>> {
    logger.info('Listing RADIUS groups', filters);

    return this.client.getPaginated<RadiusGroup>(
      '/radius/grupos',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getRadiusGroupDetails(
    group_id: string
  ): Promise<SGPResponse<RadiusGroup>> {
    logger.info('Getting RADIUS group details', { group_id });

    return this.client.get<RadiusGroup>(
      `/radius/grupos/${group_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `radius_group_${group_id}`
      }
    );
  }

  async updateRadiusGroup(
    group_id: string,
    updateData: {
      nome?: string;
      descricao?: string;
      perfil_velocidade?: string;
      download_speed?: number;
      upload_speed?: number;
      limite_tempo?: number;
      limite_dados?: number;
      prioridade?: number;
      status?: 'ativo' | 'inativo';
    }
  ): Promise<SGPResponse<RadiusGroup>> {
    logger.info('Updating RADIUS group', { group_id });

    return this.client.put<RadiusGroup>(
      `/radius/grupos/${group_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteRadiusGroup(
    group_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting RADIUS group', { group_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/radius/grupos/${group_id}`,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE SESSÕES RADIUS
  async listRadiusSessions(
    filters?: {
      username?: string;
      nas_ip?: string;
      status?: string;
      cliente_id?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusSession>> {
    logger.info('Listing RADIUS sessions', filters);

    return this.client.getPaginated<RadiusSession>(
      '/radius/sessoes',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getRadiusSessionDetails(
    session_id: string
  ): Promise<SGPResponse<RadiusSession>> {
    logger.info('Getting RADIUS session details', { session_id });

    return this.client.get<RadiusSession>(
      `/radius/sessoes/${session_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `radius_session_${session_id}`
      }
    );
  }

  async disconnectRadiusSession(
    session_id: string,
    reason?: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Disconnecting RADIUS session', { session_id, reason });

    return this.client.post<{ success: boolean; message: string }>(
      `/radius/sessoes/${session_id}/desconectar`,
      { motivo: reason },
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE NAS RADIUS
  async createRadiusNAS(
    nasData: {
      nome: string;
      endereco_ip: string;
      shared_secret: string;
      tipo: string;
      portas: number;
      community?: string;
      descricao?: string;
    }
  ): Promise<SGPResponse<RadiusNAS>> {
    logger.info('Creating RADIUS NAS', { nome: nasData.nome, ip: nasData.endereco_ip });

    return this.client.post<RadiusNAS>(
      '/radius/nas',
      nasData,
      { authMethod: 'token' }
    );
  }

  async listRadiusNAS(
    filters?: {
      status?: string;
      tipo?: string;
      endereco_ip?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusNAS>> {
    logger.info('Listing RADIUS NAS', filters);

    return this.client.getPaginated<RadiusNAS>(
      '/radius/nas',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getRadiusNASDetails(
    nas_id: string
  ): Promise<SGPResponse<RadiusNAS>> {
    logger.info('Getting RADIUS NAS details', { nas_id });

    return this.client.get<RadiusNAS>(
      `/radius/nas/${nas_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `radius_nas_${nas_id}`
      }
    );
  }

  async updateRadiusNAS(
    nas_id: string,
    updateData: {
      nome?: string;
      endereco_ip?: string;
      shared_secret?: string;
      tipo?: string;
      portas?: number;
      community?: string;
      descricao?: string;
      status?: 'ativo' | 'inativo' | 'manutencao';
    }
  ): Promise<SGPResponse<RadiusNAS>> {
    logger.info('Updating RADIUS NAS', { nas_id });

    return this.client.put<RadiusNAS>(
      `/radius/nas/${nas_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteRadiusNAS(
    nas_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting RADIUS NAS', { nas_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/radius/nas/${nas_id}`,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE ATRIBUTOS RADIUS
  async createRadiusAttribute(
    attributeData: {
      nome: string;
      tipo: 'string' | 'integer' | 'ipaddr' | 'date' | 'octets';
      valor: string;
      grupo_id?: number;
      usuario_id?: number;
      operador: '=' | ':=' | '==' | '+=' | '!=' | '>' | '<' | '>=' | '<=';
      categoria: 'check' | 'reply';
      descricao?: string;
    }
  ): Promise<SGPResponse<RadiusAttribute>> {
    logger.info('Creating RADIUS attribute', { nome: attributeData.nome });

    return this.client.post<RadiusAttribute>(
      '/radius/atributos',
      attributeData,
      { authMethod: 'token' }
    );
  }

  async listRadiusAttributes(
    filters?: {
      categoria?: 'check' | 'reply';
      grupo_id?: number;
      usuario_id?: number;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusAttribute>> {
    logger.info('Listing RADIUS attributes', filters);

    return this.client.getPaginated<RadiusAttribute>(
      '/radius/atributos',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async updateRadiusAttribute(
    attribute_id: string,
    updateData: {
      nome?: string;
      tipo?: 'string' | 'integer' | 'ipaddr' | 'date' | 'octets';
      valor?: string;
      operador?: '=' | ':=' | '==' | '+=' | '!=' | '>' | '<' | '>=' | '<=';
      descricao?: string;
      ativo?: boolean;
    }
  ): Promise<SGPResponse<RadiusAttribute>> {
    logger.info('Updating RADIUS attribute', { attribute_id });

    return this.client.put<RadiusAttribute>(
      `/radius/atributos/${attribute_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  async deleteRadiusAttribute(
    attribute_id: string
  ): Promise<SGPResponse<{ success: boolean; message: string }>> {
    logger.info('Deleting RADIUS attribute', { attribute_id });

    return this.client.delete<{ success: boolean; message: string }>(
      `/radius/atributos/${attribute_id}`,
      { authMethod: 'token' }
    );
  }

  // ACCOUNTING E ESTATÍSTICAS RADIUS
  async getRadiusAccounting(
    filters?: {
      username?: string;
      nas_ip?: string;
      data_inicio?: string;
      data_fim?: string;
      session_id?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusAccounting>> {
    logger.info('Getting RADIUS accounting', filters);

    return this.client.getPaginated<RadiusAccounting>(
      '/radius/accounting',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getRadiusStatistics(
    periodo: 'hoje' | 'semana' | 'mes' | 'ano',
    filters?: {
      nas_ip?: string;
      grupo_id?: number;
      data_inicio?: string;
      data_fim?: string;
    }
  ): Promise<SGPResponse<RadiusStatistics>> {
    logger.info('Getting RADIUS statistics', { periodo, filters });

    return this.client.get<RadiusStatistics>(
      `/radius/estatisticas/${periodo}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `radius_stats_${periodo}_${JSON.stringify(filters)}`,
        queryParams: filters
      }
    );
  }

  // RADIUS CHECK E REPLY
  async createRadiusCheck(
    checkData: {
      username: string;
      attribute: string;
      op: string;
      value: string;
      grupo_aplicado?: string;
    }
  ): Promise<SGPResponse<RadiusCheck>> {
    logger.info('Creating RADIUS check', { username: checkData.username });

    return this.client.post<RadiusCheck>(
      '/radius/check',
      checkData,
      { authMethod: 'token' }
    );
  }

  async listRadiusChecks(
    filters?: {
      username?: string;
      attribute?: string;
      grupo_aplicado?: string;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusCheck>> {
    logger.info('Listing RADIUS checks', filters);

    return this.client.getPaginated<RadiusCheck>(
      '/radius/check',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async createRadiusReply(
    replyData: {
      username: string;
      attribute: string;
      op: string;
      value: string;
      grupo_aplicado?: string;
    }
  ): Promise<SGPResponse<RadiusReply>> {
    logger.info('Creating RADIUS reply', { username: replyData.username });

    return this.client.post<RadiusReply>(
      '/radius/reply',
      replyData,
      { authMethod: 'token' }
    );
  }

  async listRadiusReplies(
    filters?: {
      username?: string;
      attribute?: string;
      grupo_aplicado?: string;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<RadiusReply>> {
    logger.info('Listing RADIUS replies', filters);

    return this.client.getPaginated<RadiusReply>(
      '/radius/reply',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  // ==================== DOCUMENT AND CONTRACT SYSTEM ====================

  // GESTÃO DE TEMPLATES DE DOCUMENTOS
  async createDocumentTemplate(
    templateData: {
      nome: string;
      tipo: 'contrato' | 'termo' | 'aditivo' | 'rescisao' | 'notificacao';
      categoria: string;
      conteudo: string;
      variaveis: Array<{
        nome: string;
        tipo: 'texto' | 'numero' | 'data' | 'booleano';
        obrigatorio: boolean;
        descricao?: string;
      }>;
      versao: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<DocumentTemplate>> {
    logger.info('Creating document template', { nome: templateData.nome, tipo: templateData.tipo });

    return this.client.post<DocumentTemplate>(
      '/documentos/templates',
      templateData,
      { authMethod: 'token' }
    );
  }

  async listDocumentTemplates(
    filters?: {
      tipo?: string;
      categoria?: string;
      status?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<DocumentTemplate>> {
    logger.info('Listing document templates', filters);

    return this.client.getPaginated<DocumentTemplate>(
      '/documentos/templates',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getDocumentTemplateDetails(
    template_id: string
  ): Promise<SGPResponse<DocumentTemplate>> {
    logger.info('Getting document template details', { template_id });

    return this.client.get<DocumentTemplate>(
      `/documentos/templates/${template_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `doc_template_${template_id}`
      }
    );
  }

  async updateDocumentTemplate(
    template_id: string,
    updateData: {
      nome?: string;
      categoria?: string;
      conteudo?: string;
      variaveis?: Array<{
        nome: string;
        tipo: 'texto' | 'numero' | 'data' | 'booleano';
        obrigatorio: boolean;
        descricao?: string;
      }>;
      status?: 'ativo' | 'inativo' | 'rascunho';
      observacoes?: string;
    }
  ): Promise<SGPResponse<DocumentTemplate>> {
    logger.info('Updating document template', { template_id });

    return this.client.put<DocumentTemplate>(
      `/documentos/templates/${template_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE DOCUMENTOS DE CONTRATOS
  async createContractDocument(
    documentData: {
      contrato_id: number;
      template_id?: number;
      tipo: 'contrato_principal' | 'aditivo' | 'rescisao' | 'notificacao';
      titulo: string;
      conteudo: string;
      data_vencimento?: string;
      variaveis?: Record<string, any>;
    }
  ): Promise<SGPResponse<ContractDocument>> {
    logger.info('Creating contract document', { contrato_id: documentData.contrato_id, tipo: documentData.tipo });

    return this.client.post<ContractDocument>(
      '/contratos/documentos',
      documentData,
      { authMethod: 'token' }
    );
  }

  async listContractDocuments(
    filters?: {
      contrato_id?: number;
      tipo?: string;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<ContractDocument>> {
    logger.info('Listing contract documents', filters);

    return this.client.getPaginated<ContractDocument>(
      '/contratos/documentos',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async getContractDocumentDetails(
    document_id: string
  ): Promise<SGPResponse<ContractDocument>> {
    logger.info('Getting contract document details', { document_id });

    return this.client.get<ContractDocument>(
      `/contratos/documentos/${document_id}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `contract_doc_${document_id}`
      }
    );
  }

  async updateContractDocument(
    document_id: string,
    updateData: {
      titulo?: string;
      conteudo?: string;
      status?: 'rascunho' | 'ativo' | 'assinado' | 'cancelado' | 'vencido';
      data_vencimento?: string;
    }
  ): Promise<SGPResponse<ContractDocument>> {
    logger.info('Updating contract document', { document_id });

    return this.client.put<ContractDocument>(
      `/contratos/documentos/${document_id}`,
      updateData,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE STATUS DE CONTRATOS
  async getContractStatus(
    contrato_id: string
  ): Promise<SGPResponse<ContractStatus>> {
    logger.info('Getting contract status', { contrato_id });

    return this.client.get<ContractStatus>(
      `/contratos/${contrato_id}/status`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `contract_status_${contrato_id}`
      }
    );
  }

  async updateContractStatus(
    contrato_id: string,
    statusData: {
      novo_status: string;
      motivo?: string;
      observacoes?: string;
      data_vigencia?: string;
    }
  ): Promise<SGPResponse<ContractStatus>> {
    logger.info('Updating contract status', { contrato_id, novo_status: statusData.novo_status });

    return this.client.post<ContractStatus>(
      `/contratos/${contrato_id}/status`,
      statusData,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE ASSINATURAS DIGITAIS
  async createDigitalSignature(
    signatureData: {
      documento_id: number;
      signatario_id: number;
      signatario_nome: string;
      signatario_email: string;
      tipo_signatario: 'cliente' | 'empresa' | 'testemunha' | 'avalista';
      data_expiracao: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<DigitalSignature>> {
    logger.info('Creating digital signature', { documento_id: signatureData.documento_id, signatario: signatureData.signatario_email });

    return this.client.post<DigitalSignature>(
      '/documentos/assinaturas',
      signatureData,
      { authMethod: 'token' }
    );
  }

  async listDigitalSignatures(
    filters?: {
      documento_id?: number;
      signatario_id?: number;
      status?: string;
      tipo_signatario?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<DigitalSignature>> {
    logger.info('Listing digital signatures', filters);

    return this.client.getPaginated<DigitalSignature>(
      '/documentos/assinaturas',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async processDigitalSignature(
    signature_id: string,
    signatureData: {
      acao: 'assinar' | 'recusar';
      certificado_digital?: {
        tipo: string;
        serial: string;
        emissor: string;
        validade: string;
      };
      ip_assinatura?: string;
      localizacao_assinatura?: string;
      motivo_recusa?: string;
    }
  ): Promise<SGPResponse<DigitalSignature>> {
    logger.info('Processing digital signature', { signature_id, acao: signatureData.acao });

    return this.client.post<DigitalSignature>(
      `/documentos/assinaturas/${signature_id}/processar`,
      signatureData,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE ADITIVOS CONTRATUAIS
  async createContractAdendum(
    addendumData: {
      contrato_id: number;
      tipo: 'mudanca_plano' | 'alteracao_valor' | 'mudanca_endereco' | 'adicao_servico' | 'outros';
      titulo: string;
      descricao: string;
      valor_anterior?: number;
      valor_novo?: number;
      plano_anterior?: string;
      plano_novo?: string;
      data_vigencia: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<ContractAdendum>> {
    logger.info('Creating contract addendum', { contrato_id: addendumData.contrato_id, tipo: addendumData.tipo });

    return this.client.post<ContractAdendum>(
      '/contratos/aditivos',
      addendumData,
      { authMethod: 'token' }
    );
  }

  async listContractAddendums(
    filters?: {
      contrato_id?: number;
      tipo?: string;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<ContractAdendum>> {
    logger.info('Listing contract addendums', filters);

    return this.client.getPaginated<ContractAdendum>(
      '/contratos/aditivos',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async approveContractAdendum(
    addendum_id: string,
    approvalData: {
      aprovado: boolean;
      observacoes?: string;
      data_vigencia?: string;
    }
  ): Promise<SGPResponse<ContractAdendum>> {
    logger.info('Approving contract addendum', { addendum_id, aprovado: approvalData.aprovado });

    return this.client.post<ContractAdendum>(
      `/contratos/aditivos/${addendum_id}/aprovar`,
      approvalData,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE NOTIFICAÇÕES LEGAIS
  async createLegalNotification(
    notificationData: {
      cliente_id: number;
      contrato_id?: number;
      tipo: 'cobranca' | 'suspensao' | 'cancelamento' | 'mudanca_contrato' | 'geral';
      titulo: string;
      conteudo: string;
      prazo_resposta?: number;
      canais_envio: Array<{
        canal: 'email' | 'sms' | 'whatsapp' | 'correio' | 'app';
        endereco: string;
      }>;
    }
  ): Promise<SGPResponse<LegalNotification>> {
    logger.info('Creating legal notification', { cliente_id: notificationData.cliente_id, tipo: notificationData.tipo });

    return this.client.post<LegalNotification>(
      '/juridico/notificacoes',
      notificationData,
      { authMethod: 'token' }
    );
  }

  async listLegalNotifications(
    filters?: {
      cliente_id?: number;
      contrato_id?: number;
      tipo?: string;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<LegalNotification>> {
    logger.info('Listing legal notifications', filters);

    return this.client.getPaginated<LegalNotification>(
      '/juridico/notificacoes',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async updateNotificationStatus(
    notification_id: string,
    statusData: {
      status: 'enviada' | 'entregue' | 'respondida' | 'vencida';
      resposta_cliente?: string;
      comprovante_entrega?: string;
      canal_entrega?: string;
    }
  ): Promise<SGPResponse<LegalNotification>> {
    logger.info('Updating notification status', { notification_id, status: statusData.status });

    return this.client.put<LegalNotification>(
      `/juridico/notificacoes/${notification_id}/status`,
      statusData,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE APROVAÇÕES DE DOCUMENTOS
  async createDocumentApproval(
    approvalData: {
      documento_id: number;
      documento_tipo: string;
      aprovador_id: number;
      nivel_aprovacao: number;
      observacoes?: string;
    }
  ): Promise<SGPResponse<DocumentApproval>> {
    logger.info('Creating document approval', { documento_id: approvalData.documento_id, aprovador_id: approvalData.aprovador_id });

    return this.client.post<DocumentApproval>(
      '/documentos/aprovacoes',
      approvalData,
      { authMethod: 'token' }
    );
  }

  async listDocumentApprovals(
    filters?: {
      documento_id?: number;
      aprovador_id?: number;
      status?: string;
      nivel_aprovacao?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<DocumentApproval>> {
    logger.info('Listing document approvals', filters);

    return this.client.getPaginated<DocumentApproval>(
      '/documentos/aprovacoes',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async processDocumentApproval(
    approval_id: string,
    approvalData: {
      acao: 'aprovar' | 'rejeitar';
      motivo_rejeicao?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<DocumentApproval>> {
    logger.info('Processing document approval', { approval_id, acao: approvalData.acao });

    return this.client.post<DocumentApproval>(
      `/documentos/aprovacoes/${approval_id}/processar`,
      approvalData,
      { authMethod: 'token' }
    );
  }

  // GESTÃO DE RENOVAÇÕES DE CONTRATOS
  async createContractRenewal(
    renewalData: {
      contrato_id: number;
      tipo_renovacao: 'automatica' | 'manual' | 'negociada';
      data_nova_vigencia: string;
      novo_periodo_meses: number;
      valor_novo: number;
      plano_novo?: string;
      condicoes_especiais?: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<ContractRenewal>> {
    logger.info('Creating contract renewal', { contrato_id: renewalData.contrato_id, tipo: renewalData.tipo_renovacao });

    return this.client.post<ContractRenewal>(
      '/contratos/renovacoes',
      renewalData,
      { authMethod: 'token' }
    );
  }

  async listContractRenewals(
    filters?: {
      contrato_id?: number;
      tipo_renovacao?: string;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<ContractRenewal>> {
    logger.info('Listing contract renewals', filters);

    return this.client.getPaginated<ContractRenewal>(
      '/contratos/renovacoes',
      filters,
      { authMethod: 'token', useCache: true }
    );
  }

  async processContractRenewal(
    renewal_id: string,
    processData: {
      acao: 'processar' | 'cancelar';
      observacoes?: string;
    }
  ): Promise<SGPResponse<ContractRenewal>> {
    logger.info('Processing contract renewal', { renewal_id, acao: processData.acao });

    return this.client.post<ContractRenewal>(
      `/contratos/renovacoes/${renewal_id}/processar`,
      processData,
      { authMethod: 'token' }
    );
  }

  // FUNCIONALIDADES ESPECIAIS
  async generateContractPDF(
    contrato_id: string,
    options?: {
      include_addendums?: boolean;
      include_signatures?: boolean;
      template_id?: number;
    }
  ): Promise<SGPResponse<{ pdf_url: string; hash_documento: string }>> {
    logger.info('Generating contract PDF', { contrato_id, options });

    return this.client.post<{ pdf_url: string; hash_documento: string }>(
      `/contratos/${contrato_id}/gerar-pdf`,
      options || {},
      { authMethod: 'token' }
    );
  }

  async validateDocumentIntegrity(
    document_id: string
  ): Promise<SGPResponse<{ valido: boolean; hash_atual: string; hash_original: string; alteracoes?: string[] }>> {
    logger.info('Validating document integrity', { document_id });

    return this.client.get<{ valido: boolean; hash_atual: string; hash_original: string; alteracoes?: string[] }>(
      `/documentos/${document_id}/validar`,
      {
        authMethod: 'token',
        useCache: false
      }
    );
  }

  // ==================== ANALYTICS AND REPORTING SYSTEM ====================

  // SYSTEM PERFORMANCE ANALYTICS
  async getSystemStatistics(
    periodo?: 'hoje' | 'semana' | 'mes' | 'ano'
  ): Promise<SGPResponse<SystemStatistics>> {
    logger.info('Getting system statistics', { periodo });

    return this.client.get<SystemStatistics>(
      `/admin/estatisticas${periodo ? `/${periodo}` : ''}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `system_stats_${periodo || 'default'}`
      }
    );
  }

  async getSystemHealthMetrics(): Promise<SGPResponse<{
    uptime: string;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    active_connections: number;
    api_response_time: number;
  }>> {
    logger.info('Getting system health metrics');

    return this.client.get<{
      uptime: string;
      cpu_usage: number;
      memory_usage: number;
      disk_usage: number;
      active_connections: number;
      api_response_time: number;
    }>(
      '/admin/health',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'system_health'
      }
    );
  }

  // FINANCIAL ANALYTICS
  async getFinancialReport(
    reportData: {
      data_inicio: string;
      data_fim: string;
      banco_id?: number;
      tipo_relatorio?: 'completo' | 'resumo' | 'detalhado';
      incluir_previsoes?: boolean;
    }
  ): Promise<SGPResponse<FinancialReport>> {
    logger.info('Generating financial report', { periodo: `${reportData.data_inicio} - ${reportData.data_fim}` });

    return this.client.post<FinancialReport>(
      '/relatorios/financeiro',
      reportData,
      { authMethod: 'token' }
    );
  }

  async getRevenueForecast(
    forecastData: {
      periodo_analise: number; // months
      include_scenarios?: boolean;
      include_recommendations?: boolean;
      fatores_externos?: string[];
    }
  ): Promise<SGPResponse<RevenueForecast>> {
    logger.info('Generating revenue forecast', { periodo: forecastData.periodo_analise });

    return this.client.post<RevenueForecast>(
      '/relatorios/previsao-receita',
      forecastData,
      { authMethod: 'token' }
    );
  }

  async getCashFlowAnalysis(
    filters: {
      data_inicio: string;
      data_fim: string;
      granularidade?: 'diario' | 'semanal' | 'mensal';
    }
  ): Promise<SGPResponse<{
    entradas: Array<{ data: string; valor: number; fonte: string }>;
    saidas: Array<{ data: string; valor: number; categoria: string }>;
    saldo_final: number;
    projecao_30_dias: number;
  }>> {
    logger.info('Getting cash flow analysis', filters);

    return this.client.post<{
      entradas: Array<{ data: string; valor: number; fonte: string }>;
      saidas: Array<{ data: string; valor: number; categoria: string }>;
      saldo_final: number;
      projecao_30_dias: number;
    }>(
      '/relatorios/fluxo-caixa',
      filters,
      { authMethod: 'token' }
    );
  }

  // NETWORK ANALYTICS
  async getNetworkAnalytics(
    filters: {
      periodo?: 'hoje' | 'semana' | 'mes';
      incluir_alertas?: boolean;
      incluir_trafego?: boolean;
      olt_id?: number;
    }
  ): Promise<SGPResponse<NetworkAnalytics>> {
    logger.info('Getting network analytics', filters);

    return this.client.get<NetworkAnalytics>(
      '/relatorios/rede',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `network_analytics_${JSON.stringify(filters)}`,
        queryParams: filters
      }
    );
  }

  async getCapacityUtilizationReport(): Promise<SGPResponse<{
    utilizacao_geral: number;
    previsao_saturacao: string;
    olts_criticas: Array<{
      olt_id: number;
      nome: string;
      utilizacao: number;
      capacidade_restante: number;
    }>;
    recomendacoes_expansao: string[];
  }>> {
    logger.info('Getting capacity utilization report');

    return this.client.get<{
      utilizacao_geral: number;
      previsao_saturacao: string;
      olts_criticas: Array<{
        olt_id: number;
        nome: string;
        utilizacao: number;
        capacidade_restante: number;
      }>;
      recomendacoes_expansao: string[];
    }>(
      '/relatorios/capacidade',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'capacity_utilization'
      }
    );
  }

  async getNetworkPerformanceMetrics(
    periodo: 'hoje' | 'semana' | 'mes'
  ): Promise<SGPResponse<{
    disponibilidade: number;
    latencia_media: number;
    perda_pacotes: number;
    throughput_medio: number;
    incidentes: number;
    tempo_medio_resolucao: number;
  }>> {
    logger.info('Getting network performance metrics', { periodo });

    return this.client.get<{
      disponibilidade: number;
      latencia_media: number;
      perda_pacotes: number;
      throughput_medio: number;
      incidentes: number;
      tempo_medio_resolucao: number;
    }>(
      `/relatorios/performance-rede/${periodo}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `network_performance_${periodo}`
      }
    );
  }

  // CUSTOMER ANALYTICS
  async getCustomerAnalytics(
    filters: {
      periodo?: string;
      segmento?: 'residencial' | 'empresarial' | 'todos';
      incluir_churn?: boolean;
      incluir_satisfacao?: boolean;
    }
  ): Promise<SGPResponse<CustomerAnalytics>> {
    logger.info('Getting customer analytics', filters);

    return this.client.post<CustomerAnalytics>(
      '/relatorios/clientes',
      filters,
      { authMethod: 'token' }
    );
  }

  async getChurnAnalysis(
    periodo: string
  ): Promise<SGPResponse<{
    taxa_churn: number;
    clientes_perdidos: number;
    receita_perdida: number;
    motivos_principais: Array<{
      motivo: string;
      percentual: number;
      valor_medio: number;
    }>;
    perfil_churners: {
      tempo_medio_cliente: number;
      plano_mais_comum: string;
      regiao_maior_churn: string;
    };
    previsao_churn: Array<{
      cliente_id: number;
      probabilidade: number;
      fatores_risco: string[];
    }>;
  }>> {
    logger.info('Getting churn analysis', { periodo });

    return this.client.get<{
      taxa_churn: number;
      clientes_perdidos: number;
      receita_perdida: number;
      motivos_principais: Array<{
        motivo: string;
        percentual: number;
        valor_medio: number;
      }>;
      perfil_churners: {
        tempo_medio_cliente: number;
        plano_mais_comum: string;
        regiao_maior_churn: string;
      };
      previsao_churn: Array<{
        cliente_id: number;
        probabilidade: number;
        fatores_risco: string[];
      }>;
    }>(
      `/relatorios/churn/${periodo}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `churn_analysis_${periodo}`
      }
    );
  }

  async getUsagePatternAnalysis(
    filters: {
      periodo: string;
      agrupamento?: 'hora' | 'dia' | 'semana';
      incluir_anomalias?: boolean;
    }
  ): Promise<SGPResponse<{
    padroes_uso: Array<{
      periodo: string;
      consumo_medio: number;
      pico_utilizacao: number;
      usuarios_ativos: number;
    }>;
    anomalias: Array<{
      cliente_id: number;
      tipo_anomalia: string;
      consumo_habitual: number;
      consumo_atual: number;
      data_deteccao: string;
    }>;
    previsao_demanda: {
      proximo_mes: number;
      proximo_trimestre: number;
      fatores_influencia: string[];
    };
  }>> {
    logger.info('Getting usage pattern analysis', filters);

    return this.client.post<{
      padroes_uso: Array<{
        periodo: string;
        consumo_medio: number;
        pico_utilizacao: number;
        usuarios_ativos: number;
      }>;
      anomalias: Array<{
        cliente_id: number;
        tipo_anomalia: string;
        consumo_habitual: number;
        consumo_atual: number;
        data_deteccao: string;
      }>;
      previsao_demanda: {
        proximo_mes: number;
        proximo_trimestre: number;
        fatores_influencia: string[];
      };
    }>(
      '/relatorios/padroes-uso',
      filters,
      { authMethod: 'token' }
    );
  }

  // SUPPORT ANALYTICS
  async getSupportAnalytics(
    filters: {
      periodo: string;
      incluir_ura?: boolean;
      incluir_satisfacao?: boolean;
      atendente_id?: number;
    }
  ): Promise<SGPResponse<SupportAnalytics>> {
    logger.info('Getting support analytics', filters);

    return this.client.post<SupportAnalytics>(
      '/relatorios/suporte',
      filters,
      { authMethod: 'token' }
    );
  }

  async getURAMetrics(
    periodo: 'hoje' | 'semana' | 'mes'
  ): Promise<SGPResponse<{
    chamadas_total: number;
    tempo_medio_espera: number;
    taxa_abandono: number;
    nivel_servico: number;
    distribuicao_horaria: Array<{
      hora: number;
      chamadas: number;
      tempo_espera: number;
    }>;
    performance_filas: Array<{
      fila: string;
      chamadas: number;
      tempo_medio: number;
      taxa_abandono: number;
    }>;
  }>> {
    logger.info('Getting URA metrics', { periodo });

    return this.client.get<{
      chamadas_total: number;
      tempo_medio_espera: number;
      taxa_abandono: number;
      nivel_servico: number;
      distribuicao_horaria: Array<{
        hora: number;
        chamadas: number;
        tempo_espera: number;
      }>;
      performance_filas: Array<{
        fila: string;
        chamadas: number;
        tempo_medio: number;
        taxa_abandono: number;
      }>;
    }>(
      `/relatorios/ura/${periodo}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `ura_metrics_${periodo}`
      }
    );
  }

  // OPERATIONAL KPIs
  async getOperationalKPIs(
    periodo: string
  ): Promise<SGPResponse<OperationalKPIs>> {
    logger.info('Getting operational KPIs', { periodo });

    return this.client.get<OperationalKPIs>(
      `/relatorios/kpis/${periodo}`,
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: `operational_kpis_${periodo}`
      }
    );
  }

  async getEfficiencyMetrics(): Promise<SGPResponse<{
    produtividade_tecnicos: Array<{
      tecnico_id: number;
      nome: string;
      instalacoes_mes: number;
      tempo_medio_instalacao: number;
      taxa_sucesso: number;
      avaliacoes_cliente: number;
    }>;
    eficiencia_processos: {
      tempo_ativacao: number;
      tempo_suporte: number;
      tempo_cobranca: number;
      automacao_percentual: number;
    };
    custos_operacionais: {
      custo_por_cliente: number;
      custo_por_instalacao: number;
      custo_por_atendimento: number;
      tendencia_mes: number;
    };
  }>> {
    logger.info('Getting efficiency metrics');

    return this.client.get<{
      produtividade_tecnicos: Array<{
        tecnico_id: number;
        nome: string;
        instalacoes_mes: number;
        tempo_medio_instalacao: number;
        taxa_sucesso: number;
        avaliacoes_cliente: number;
      }>;
      eficiencia_processos: {
        tempo_ativacao: number;
        tempo_suporte: number;
        tempo_cobranca: number;
        automacao_percentual: number;
      };
      custos_operacionais: {
        custo_por_cliente: number;
        custo_por_instalacao: number;
        custo_por_atendimento: number;
        tendencia_mes: number;
      };
    }>(
      '/relatorios/eficiencia',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'efficiency_metrics'
      }
    );
  }

  // GEOGRAPHIC ANALYTICS
  async getGeographicAnalytics(): Promise<SGPResponse<GeographicAnalytics>> {
    logger.info('Getting geographic analytics');

    return this.client.get<GeographicAnalytics>(
      '/relatorios/geografico',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'geographic_analytics'
      }
    );
  }

  async getMarketPenetrationAnalysis(): Promise<SGPResponse<{
    penetracao_geral: number;
    oportunidades_expansao: Array<{
      regiao: string;
      potencial_clientes: number;
      competidores: number;
      score_atratividade: number;
      investimento_estimado: number;
    }>;
    densidade_coverage: Array<{
      cep: string;
      densidade_atual: number;
      densidade_potencial: number;
      gap_percentual: number;
    }>;
  }>> {
    logger.info('Getting market penetration analysis');

    return this.client.get<{
      penetracao_geral: number;
      oportunidades_expansao: Array<{
        regiao: string;
        potencial_clientes: number;
        competidores: number;
        score_atratividade: number;
        investimento_estimado: number;
      }>;
      densidade_coverage: Array<{
        cep: string;
        densidade_atual: number;
        densidade_potencial: number;
        gap_percentual: number;
      }>;
    }>(
      '/relatorios/penetracao-mercado',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'market_penetration'
      }
    );
  }

  // COMPARATIVE ANALYTICS
  async getCompetitiveAnalysis(): Promise<SGPResponse<{
    posicao_mercado: number;
    comparativo_precos: Array<{
      plano: string;
      nosso_preco: number;
      preco_medio_mercado: number;
      diferenca_percentual: number;
    }>;
    benchmarks_industria: {
      churn_rate_mercado: number;
      arpu_mercado: number;
      satisfacao_mercado: number;
      nossa_posicao: {
        churn_rate: number;
        arpu: number;
        satisfacao: number;
      };
    };
    oportunidades_melhoria: string[];
  }>> {
    logger.info('Getting competitive analysis');

    return this.client.get<{
      posicao_mercado: number;
      comparativo_precos: Array<{
        plano: string;
        nosso_preco: number;
        preco_medio_mercado: number;
        diferenca_percentual: number;
      }>;
      benchmarks_industria: {
        churn_rate_mercado: number;
        arpu_mercado: number;
        satisfacao_mercado: number;
        nossa_posicao: {
          churn_rate: number;
          arpu: number;
          satisfacao: number;
        };
      };
      oportunidades_melhoria: string[];
    }>(
      '/relatorios/analise-competitiva',
      {
        authMethod: 'token',
        useCache: true,
        cacheKey: 'competitive_analysis'
      }
    );
  }

  // CUSTOM REPORTS
  async generateCustomReport(
    reportConfig: {
      nome: string;
      tipo: 'financeiro' | 'operacional' | 'cliente' | 'rede' | 'personalizado';
      periodo: string;
      metricas: string[];
      filtros: Record<string, any>;
      formato: 'json' | 'pdf' | 'excel' | 'csv';
      agendamento?: {
        frequencia: 'diario' | 'semanal' | 'mensal';
        emails_destinatarios: string[];
      };
    }
  ): Promise<SGPResponse<{
    relatorio_id: string;
    url_download?: string;
    dados?: any;
    data_geracao: string;
    agendamento_criado?: boolean;
  }>> {
    logger.info('Generating custom report', { nome: reportConfig.nome, tipo: reportConfig.tipo });

    return this.client.post<{
      relatorio_id: string;
      url_download?: string;
      dados?: any;
      data_geracao: string;
      agendamento_criado?: boolean;
    }>(
      '/relatorios/customizado',
      reportConfig,
      { authMethod: 'token' }
    );
  }

  async createWebhook(
    webhookConfig: Omit<WebhookConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<WebhookConfig>> {
    logger.info('Creating webhook configuration', { evento: webhookConfig.evento, url: webhookConfig.url });

    return this.client.post<WebhookConfig>(
      '/integracao/webhooks',
      webhookConfig,
      { authMethod: 'token' }
    );
  }

  async listWebhooks(
    params: {
      page?: number;
      per_page?: number;
      evento?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<WebhookConfig>> {
    logger.info('Listing webhook configurations', params);

    return this.client.get<WebhookConfig[]>(
      '/integracao/webhooks',
      { params, authMethod: 'token' }
    );
  }

  async getWebhook(id: number): Promise<SGPResponse<WebhookConfig>> {
    logger.info('Getting webhook configuration', { id });

    return this.client.get<WebhookConfig>(
      `/integracao/webhooks/${id}`,
      { authMethod: 'token' }
    );
  }

  async updateWebhook(
    id: number,
    updates: Partial<Omit<WebhookConfig, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<WebhookConfig>> {
    logger.info('Updating webhook configuration', { id, updates });

    return this.client.put<WebhookConfig>(
      `/integracao/webhooks/${id}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async deleteWebhook(id: number): Promise<SGPResponse<{ success: boolean }>> {
    logger.info('Deleting webhook configuration', { id });

    return this.client.delete<{ success: boolean }>(
      `/integracao/webhooks/${id}`,
      { authMethod: 'token' }
    );
  }

  async testWebhook(id: number): Promise<SGPResponse<{
    success: boolean;
    response_code?: number;
    response_time?: number;
    error?: string;
  }>> {
    logger.info('Testing webhook configuration', { id });

    return this.client.post<{
      success: boolean;
      response_code?: number;
      response_time?: number;
      error?: string;
    }>(
      `/integracao/webhooks/${id}/test`,
      {},
      { authMethod: 'token' }
    );
  }

  async getWebhookExecutions(
    webhookId: number,
    params: {
      page?: number;
      per_page?: number;
      status?: 'success' | 'failed';
      data_inicio?: string;
      data_fim?: string;
    } = {}
  ): Promise<PaginatedResponse<WebhookExecution>> {
    logger.info('Getting webhook executions', { webhookId, params });

    return this.client.get<WebhookExecution[]>(
      `/integracao/webhooks/${webhookId}/execucoes`,
      { params, authMethod: 'token' }
    );
  }

  async createAPIConfig(
    apiConfig: Omit<ExternalAPIConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<ExternalAPIConfig>> {
    logger.info('Creating external API configuration', { nome: apiConfig.nome, tipo: apiConfig.tipo });

    return this.client.post<ExternalAPIConfig>(
      '/integracao/apis',
      apiConfig,
      { authMethod: 'token' }
    );
  }

  async listAPIConfigs(
    params: {
      page?: number;
      per_page?: number;
      tipo?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<ExternalAPIConfig>> {
    logger.info('Listing external API configurations', params);

    return this.client.get<ExternalAPIConfig[]>(
      '/integracao/apis',
      { params, authMethod: 'token' }
    );
  }

  async getAPIConfig(id: number): Promise<SGPResponse<ExternalAPIConfig>> {
    logger.info('Getting external API configuration', { id });

    return this.client.get<ExternalAPIConfig>(
      `/integracao/apis/${id}`,
      { authMethod: 'token' }
    );
  }

  async updateAPIConfig(
    id: number,
    updates: Partial<Omit<ExternalAPIConfig, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<ExternalAPIConfig>> {
    logger.info('Updating external API configuration', { id, updates });

    return this.client.put<ExternalAPIConfig>(
      `/integracao/apis/${id}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async deleteAPIConfig(id: number): Promise<SGPResponse<{ success: boolean }>> {
    logger.info('Deleting external API configuration', { id });

    return this.client.delete<{ success: boolean }>(
      `/integracao/apis/${id}`,
      { authMethod: 'token' }
    );
  }

  async testAPIConfig(id: number): Promise<SGPResponse<{
    success: boolean;
    response_code?: number;
    response_time?: number;
    error?: string;
  }>> {
    logger.info('Testing external API configuration', { id });

    return this.client.post<{
      success: boolean;
      response_code?: number;
      response_time?: number;
      error?: string;
    }>(
      `/integracao/apis/${id}/test`,
      {},
      { authMethod: 'token' }
    );
  }

  async createPaymentGateway(
    gatewayConfig: Omit<PaymentGatewayConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<PaymentGatewayConfig>> {
    logger.info('Creating payment gateway configuration', { nome: gatewayConfig.nome, provedor: gatewayConfig.provedor });

    return this.client.post<PaymentGatewayConfig>(
      '/integracao/gateways-pagamento',
      gatewayConfig,
      { authMethod: 'token' }
    );
  }

  async listPaymentGateways(
    params: {
      page?: number;
      per_page?: number;
      provedor?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<PaymentGatewayConfig>> {
    logger.info('Listing payment gateway configurations', params);

    return this.client.get<PaymentGatewayConfig[]>(
      '/integracao/gateways-pagamento',
      { params, authMethod: 'token' }
    );
  }

  async getPaymentGateway(id: number): Promise<SGPResponse<PaymentGatewayConfig>> {
    logger.info('Getting payment gateway configuration', { id });

    return this.client.get<PaymentGatewayConfig>(
      `/integracao/gateways-pagamento/${id}`,
      { authMethod: 'token' }
    );
  }

  async updatePaymentGateway(
    id: number,
    updates: Partial<Omit<PaymentGatewayConfig, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<PaymentGatewayConfig>> {
    logger.info('Updating payment gateway configuration', { id, updates });

    return this.client.put<PaymentGatewayConfig>(
      `/integracao/gateways-pagamento/${id}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async createSMSProvider(
    smsConfig: Omit<SMSProviderConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<SMSProviderConfig>> {
    logger.info('Creating SMS provider configuration', { nome: smsConfig.nome, provedor: smsConfig.provedor });

    return this.client.post<SMSProviderConfig>(
      '/integracao/provedores-sms',
      smsConfig,
      { authMethod: 'token' }
    );
  }

  async listSMSProviders(
    params: {
      page?: number;
      per_page?: number;
      provedor?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<SMSProviderConfig>> {
    logger.info('Listing SMS provider configurations', params);

    return this.client.get<SMSProviderConfig[]>(
      '/integracao/provedores-sms',
      { params, authMethod: 'token' }
    );
  }

  async createEmailProvider(
    emailConfig: Omit<EmailProviderConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<EmailProviderConfig>> {
    logger.info('Creating email provider configuration', { nome: emailConfig.nome, provedor: emailConfig.provedor });

    return this.client.post<EmailProviderConfig>(
      '/integracao/provedores-email',
      emailConfig,
      { authMethod: 'token' }
    );
  }

  async listEmailProviders(
    params: {
      page?: number;
      per_page?: number;
      provedor?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<EmailProviderConfig>> {
    logger.info('Listing email provider configurations', params);

    return this.client.get<EmailProviderConfig[]>(
      '/integracao/provedores-email',
      { params, authMethod: 'token' }
    );
  }

  async createBankIntegration(
    bankConfig: Omit<BankIntegration, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<BankIntegration>> {
    logger.info('Creating bank integration configuration', { nome: bankConfig.nome, banco: bankConfig.banco });

    return this.client.post<BankIntegration>(
      '/integracao/bancos',
      bankConfig,
      { authMethod: 'token' }
    );
  }

  async listBankIntegrations(
    params: {
      page?: number;
      per_page?: number;
      banco?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<BankIntegration>> {
    logger.info('Listing bank integration configurations', params);

    return this.client.get<BankIntegration[]>(
      '/integracao/bancos',
      { params, authMethod: 'token' }
    );
  }

  async createCorreiosIntegration(
    correiosConfig: Omit<CorreiosIntegration, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<CorreiosIntegration>> {
    logger.info('Creating Correios integration configuration', { nome: correiosConfig.nome });

    return this.client.post<CorreiosIntegration>(
      '/integracao/correios',
      correiosConfig,
      { authMethod: 'token' }
    );
  }

  async listCorreiosIntegrations(
    params: {
      page?: number;
      per_page?: number;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<CorreiosIntegration>> {
    logger.info('Listing Correios integration configurations', params);

    return this.client.get<CorreiosIntegration[]>(
      '/integracao/correios',
      { params, authMethod: 'token' }
    );
  }

  async createMonitoringConfig(
    monitoringConfig: Omit<MonitoringConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<MonitoringConfig>> {
    logger.info('Creating monitoring configuration', { nome: monitoringConfig.nome, tipo: monitoringConfig.tipo });

    return this.client.post<MonitoringConfig>(
      '/integracao/monitoramento',
      monitoringConfig,
      { authMethod: 'token' }
    );
  }

  async listMonitoringConfigs(
    params: {
      page?: number;
      per_page?: number;
      tipo?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<MonitoringConfig>> {
    logger.info('Listing monitoring configurations', params);

    return this.client.get<MonitoringConfig[]>(
      '/integracao/monitoramento',
      { params, authMethod: 'token' }
    );
  }

  async getDataSyncStatus(
    params: {
      sistema?: string;
      data_inicio?: string;
      data_fim?: string;
    } = {}
  ): Promise<SGPResponse<DataSyncConfig[]>> {
    logger.info('Getting data synchronization status', params);

    return this.client.get<DataSyncConfig[]>(
      '/integracao/sincronizacao',
      { params, authMethod: 'token' }
    );
  }

  async triggerDataSync(
    sistema: string,
    forceFull: boolean = false
  ): Promise<SGPResponse<{
    sync_id: string;
    status: string;
    started_at: string;
  }>> {
    logger.info('Triggering data synchronization', { sistema, forceFull });

    return this.client.post<{
      sync_id: string;
      status: string;
      started_at: string;
    }>(
      '/integracao/sincronizacao/trigger',
      { sistema, force_full: forceFull },
      { authMethod: 'token' }
    );
  }

  async createBackupConfig(
    backupConfig: Omit<BackupConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<BackupConfig>> {
    logger.info('Creating backup configuration', { nome: backupConfig.nome, tipo: backupConfig.tipo });

    return this.client.post<BackupConfig>(
      '/backup/configuracoes',
      backupConfig,
      { authMethod: 'token' }
    );
  }

  async listBackupConfigs(
    params: {
      page?: number;
      per_page?: number;
      tipo?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<BackupConfig>> {
    logger.info('Listing backup configurations', params);

    return this.client.get<BackupConfig[]>(
      '/backup/configuracoes',
      { params, authMethod: 'token' }
    );
  }

  async getBackupConfig(id: number): Promise<SGPResponse<BackupConfig>> {
    logger.info('Getting backup configuration', { id });

    return this.client.get<BackupConfig>(
      `/backup/configuracoes/${id}`,
      { authMethod: 'token' }
    );
  }

  async updateBackupConfig(
    id: number,
    updates: Partial<Omit<BackupConfig, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<BackupConfig>> {
    logger.info('Updating backup configuration', { id, updates });

    return this.client.put<BackupConfig>(
      `/backup/configuracoes/${id}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async deleteBackupConfig(id: number): Promise<SGPResponse<{ success: boolean }>> {
    logger.info('Deleting backup configuration', { id });

    return this.client.delete<{ success: boolean }>(
      `/backup/configuracoes/${id}`,
      { authMethod: 'token' }
    );
  }

  async executeBackup(
    configId: number,
    tipoBackup?: 'full' | 'incremental' | 'diferencial'
  ): Promise<SGPResponse<BackupExecution>> {
    logger.info('Executing backup', { configId, tipoBackup });

    return this.client.post<BackupExecution>(
      `/backup/configuracoes/${configId}/executar`,
      { tipo_backup: tipoBackup },
      { authMethod: 'token' }
    );
  }

  async getBackupExecutions(
    configId: number,
    params: {
      page?: number;
      per_page?: number;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
    } = {}
  ): Promise<PaginatedResponse<BackupExecution>> {
    logger.info('Getting backup executions', { configId, params });

    return this.client.get<BackupExecution[]>(
      `/backup/configuracoes/${configId}/execucoes`,
      { params, authMethod: 'token' }
    );
  }

  async getBackupExecution(executionId: number): Promise<SGPResponse<BackupExecution>> {
    logger.info('Getting backup execution details', { executionId });

    return this.client.get<BackupExecution>(
      `/backup/execucoes/${executionId}`,
      { authMethod: 'token' }
    );
  }

  async cancelBackupExecution(executionId: number): Promise<SGPResponse<{ success: boolean }>> {
    logger.info('Canceling backup execution', { executionId });

    return this.client.post<{ success: boolean }>(
      `/backup/execucoes/${executionId}/cancelar`,
      {},
      { authMethod: 'token' }
    );
  }

  async createRestorePoint(
    executionId: number,
    restorePointData: Omit<RestorePoint, 'id' | 'backup_execution_id' | 'created_at'>
  ): Promise<SGPResponse<RestorePoint>> {
    logger.info('Creating restore point', { executionId, nome: restorePointData.nome });

    return this.client.post<RestorePoint>(
      `/backup/execucoes/${executionId}/restore-points`,
      restorePointData,
      { authMethod: 'token' }
    );
  }

  async listRestorePoints(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
    } = {}
  ): Promise<PaginatedResponse<RestorePoint>> {
    logger.info('Listing restore points', params);

    return this.client.get<RestorePoint[]>(
      '/backup/restore-points',
      { params, authMethod: 'token' }
    );
  }

  async getRestorePoint(id: number): Promise<SGPResponse<RestorePoint>> {
    logger.info('Getting restore point', { id });

    return this.client.get<RestorePoint>(
      `/backup/restore-points/${id}`,
      { authMethod: 'token' }
    );
  }

  async executeRestore(
    restorePointId: number,
    restoreData: Omit<RestoreOperation, 'id' | 'restore_point_id' | 'created_at'>
  ): Promise<SGPResponse<RestoreOperation>> {
    logger.info('Executing restore operation', { restorePointId, tipo: restoreData.tipo_restore });

    return this.client.post<RestoreOperation>(
      `/backup/restore-points/${restorePointId}/executar`,
      restoreData,
      { authMethod: 'token' }
    );
  }

  async getRestoreOperations(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
      usuario?: string;
      data_inicio?: string;
      data_fim?: string;
    } = {}
  ): Promise<PaginatedResponse<RestoreOperation>> {
    logger.info('Getting restore operations', params);

    return this.client.get<RestoreOperation[]>(
      '/backup/restore-operations',
      { params, authMethod: 'token' }
    );
  }

  async getRestoreOperation(id: number): Promise<SGPResponse<RestoreOperation>> {
    logger.info('Getting restore operation', { id });

    return this.client.get<RestoreOperation>(
      `/backup/restore-operations/${id}`,
      { authMethod: 'token' }
    );
  }

  async approveRestoreOperation(
    operationId: number,
    approval: { aprovado: boolean; observacoes?: string }
  ): Promise<SGPResponse<RestoreOperation>> {
    logger.info('Approving restore operation', { operationId, aprovado: approval.aprovado });

    return this.client.post<RestoreOperation>(
      `/backup/restore-operations/${operationId}/aprovar`,
      approval,
      { authMethod: 'token' }
    );
  }

  async createBackupSchedule(
    scheduleData: Omit<BackupSchedule, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<BackupSchedule>> {
    logger.info('Creating backup schedule', { nome: scheduleData.nome });

    return this.client.post<BackupSchedule>(
      '/backup/agendamentos',
      scheduleData,
      { authMethod: 'token' }
    );
  }

  async listBackupSchedules(
    params: {
      page?: number;
      per_page?: number;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<BackupSchedule>> {
    logger.info('Listing backup schedules', params);

    return this.client.get<BackupSchedule[]>(
      '/backup/agendamentos',
      { params, authMethod: 'token' }
    );
  }

  async getBackupSchedule(id: number): Promise<SGPResponse<BackupSchedule>> {
    logger.info('Getting backup schedule', { id });

    return this.client.get<BackupSchedule>(
      `/backup/agendamentos/${id}`,
      { authMethod: 'token' }
    );
  }

  async updateBackupSchedule(
    id: number,
    updates: Partial<Omit<BackupSchedule, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<BackupSchedule>> {
    logger.info('Updating backup schedule', { id, updates });

    return this.client.put<BackupSchedule>(
      `/backup/agendamentos/${id}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async deleteBackupSchedule(id: number): Promise<SGPResponse<{ success: boolean }>> {
    logger.info('Deleting backup schedule', { id });

    return this.client.delete<{ success: boolean }>(
      `/backup/agendamentos/${id}`,
      { authMethod: 'token' }
    );
  }

  async createBackupStorage(
    storageData: Omit<BackupStorage, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<BackupStorage>> {
    logger.info('Creating backup storage', { nome: storageData.nome, tipo: storageData.tipo });

    return this.client.post<BackupStorage>(
      '/backup/storages',
      storageData,
      { authMethod: 'token' }
    );
  }

  async listBackupStorages(
    params: {
      page?: number;
      per_page?: number;
      tipo?: string;
      status?: string;
    } = {}
  ): Promise<PaginatedResponse<BackupStorage>> {
    logger.info('Listing backup storages', params);

    return this.client.get<BackupStorage[]>(
      '/backup/storages',
      { params, authMethod: 'token' }
    );
  }

  async getBackupStorage(id: number): Promise<SGPResponse<BackupStorage>> {
    logger.info('Getting backup storage', { id });

    return this.client.get<BackupStorage>(
      `/backup/storages/${id}`,
      { authMethod: 'token' }
    );
  }

  async testBackupStorage(id: number): Promise<SGPResponse<{
    success: boolean;
    latencia_ms: number;
    velocidade_upload_mbps: number;
    velocidade_download_mbps: number;
    espaco_disponivel_gb: number;
    erro?: string;
  }>> {
    logger.info('Testing backup storage connectivity', { id });

    return this.client.post<{
      success: boolean;
      latencia_ms: number;
      velocidade_upload_mbps: number;
      velocidade_download_mbps: number;
      espaco_disponivel_gb: number;
      erro?: string;
    }>(
      `/backup/storages/${id}/teste`,
      {},
      { authMethod: 'token' }
    );
  }

  async createBackupPolicy(
    policyData: Omit<BackupPolicy, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<BackupPolicy>> {
    logger.info('Creating backup policy', { nome: policyData.nome, tipo_dados: policyData.tipo_dados });

    return this.client.post<BackupPolicy>(
      '/backup/politicas',
      policyData,
      { authMethod: 'token' }
    );
  }

  async listBackupPolicies(
    params: {
      page?: number;
      per_page?: number;
      tipo_dados?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<BackupPolicy>> {
    logger.info('Listing backup policies', params);

    return this.client.get<BackupPolicy[]>(
      '/backup/politicas',
      { params, authMethod: 'token' }
    );
  }

  async createSystemSnapshot(
    snapshotData: Omit<SystemSnapshot, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<SystemSnapshot>> {
    logger.info('Creating system snapshot', { nome: snapshotData.nome, tipo: snapshotData.tipo });

    return this.client.post<SystemSnapshot>(
      '/backup/snapshots',
      snapshotData,
      { authMethod: 'token' }
    );
  }

  async listSystemSnapshots(
    params: {
      page?: number;
      per_page?: number;
      tipo?: string;
      status?: string;
      criado_por?: string;
    } = {}
  ): Promise<PaginatedResponse<SystemSnapshot>> {
    logger.info('Listing system snapshots', params);

    return this.client.get<SystemSnapshot[]>(
      '/backup/snapshots',
      { params, authMethod: 'token' }
    );
  }

  async getSystemSnapshot(id: number): Promise<SGPResponse<SystemSnapshot>> {
    logger.info('Getting system snapshot', { id });

    return this.client.get<SystemSnapshot>(
      `/backup/snapshots/${id}`,
      { authMethod: 'token' }
    );
  }

  async deleteSystemSnapshot(id: number): Promise<SGPResponse<{ success: boolean }>> {
    logger.info('Deleting system snapshot', { id });

    return this.client.delete<{ success: boolean }>(
      `/backup/snapshots/${id}`,
      { authMethod: 'token' }
    );
  }

  async createDisasterRecoveryPlan(
    planData: Omit<DisasterRecovery, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<DisasterRecovery>> {
    logger.info('Creating disaster recovery plan', { nome: planData.nome, tipo_desastre: planData.tipo_desastre });

    return this.client.post<DisasterRecovery>(
      '/backup/disaster-recovery',
      planData,
      { authMethod: 'token' }
    );
  }

  async listDisasterRecoveryPlans(
    params: {
      page?: number;
      per_page?: number;
      tipo_desastre?: string;
      severidade?: string;
      status?: string;
    } = {}
  ): Promise<PaginatedResponse<DisasterRecovery>> {
    logger.info('Listing disaster recovery plans', params);

    return this.client.get<DisasterRecovery[]>(
      '/backup/disaster-recovery',
      { params, authMethod: 'token' }
    );
  }

  async testDisasterRecoveryPlan(
    planId: number,
    testData: {
      tipo_teste: 'parcial' | 'completo' | 'simulacao';
      responsavel: string;
      observacoes?: string;
    }
  ): Promise<SGPResponse<{
    teste_id: number;
    status: 'iniciado' | 'em_progresso' | 'concluido';
    tempo_estimado_minutos: number;
    started_at: string;
  }>> {
    logger.info('Testing disaster recovery plan', { planId, tipo_teste: testData.tipo_teste });

    return this.client.post<{
      teste_id: number;
      status: 'iniciado' | 'em_progresso' | 'concluido';
      tempo_estimado_minutos: number;
      started_at: string;
    }>(
      `/backup/disaster-recovery/${planId}/teste`,
      testData,
      { authMethod: 'token' }
    );
  }

  async getBackupReport(
    params: {
      data_inicio: string;
      data_fim: string;
      incluir_detalhes?: boolean;
      formato?: 'json' | 'pdf' | 'excel';
    }
  ): Promise<SGPResponse<BackupReport>> {
    logger.info('Generating backup report', params);

    return this.client.get<BackupReport>(
      '/backup/relatorios',
      { params, authMethod: 'token' }
    );
  }

  async getBackupDashboard(): Promise<SGPResponse<{
    estatisticas_gerais: {
      total_configs: number;
      configs_ativas: number;
      ultimo_backup: string;
      proximo_backup: string;
      taxa_sucesso_7d: number;
      espaco_total_usado_gb: number;
    };
    execucoes_recentes: Array<{
      config_nome: string;
      status: string;
      data_execucao: string;
      duracao_minutos: number;
      tamanho_mb: number;
    }>;
    alertas_ativos: Array<{
      tipo: string;
      severidade: string;
      mensagem: string;
      data_criacao: string;
    }>;
    storage_utilization: Array<{
      nome: string;
      usado_gb: number;
      total_gb: number;
      percentual: number;
    }>;
  }>> {
    logger.info('Getting backup dashboard data');

    return this.client.get<{
      estatisticas_gerais: {
        total_configs: number;
        configs_ativas: number;
        ultimo_backup: string;
        proximo_backup: string;
        taxa_sucesso_7d: number;
        espaco_total_usado_gb: number;
      };
      execucoes_recentes: Array<{
        config_nome: string;
        status: string;
        data_execucao: string;
        duracao_minutos: number;
        tamanho_mb: number;
      }>;
      alertas_ativos: Array<{
        tipo: string;
        severidade: string;
        mensagem: string;
        data_criacao: string;
      }>;
      storage_utilization: Array<{
        nome: string;
        usado_gb: number;
        total_gb: number;
        percentual: number;
      }>;
    }>(
      '/backup/dashboard',
      { authMethod: 'token' }
    );
  }

  async getSystemConfiguration(
    params: {
      categoria?: string;
      nivel_acesso?: string;
      grupo?: string;
    } = {}
  ): Promise<SGPResponse<SystemConfiguration[]>> {
    logger.info('Getting system configuration', params);

    return this.client.get<SystemConfiguration[]>(
      '/configuracao/sistema',
      { params, authMethod: 'token' }
    );
  }

  async updateSystemConfiguration(
    chave: string,
    valor: any,
    motivo?: string
  ): Promise<SGPResponse<SystemConfiguration>> {
    logger.info('Updating system configuration', { chave, motivo });

    return this.client.put<SystemConfiguration>(
      `/configuracao/sistema/${chave}`,
      { valor, motivo },
      { authMethod: 'token' }
    );
  }

  async resetSystemConfiguration(chave: string): Promise<SGPResponse<SystemConfiguration>> {
    logger.info('Resetting system configuration to default', { chave });

    return this.client.post<SystemConfiguration>(
      `/configuracao/sistema/${chave}/reset`,
      {},
      { authMethod: 'token' }
    );
  }

  async exportSystemConfiguration(
    formato: 'json' | 'yaml' | 'env' = 'json'
  ): Promise<SGPResponse<{ content: string; filename: string }>> {
    logger.info('Exporting system configuration', { formato });

    return this.client.get<{ content: string; filename: string }>(
      `/configuracao/sistema/export`,
      { params: { formato }, authMethod: 'token' }
    );
  }

  async importSystemConfiguration(
    configData: Record<string, any>,
    merge: boolean = false
  ): Promise<SGPResponse<{
    imported: number;
    skipped: number;
    errors: string[];
  }>> {
    logger.info('Importing system configuration', { merge });

    return this.client.post<{
      imported: number;
      skipped: number;
      errors: string[];
    }>(
      '/configuracao/sistema/import',
      { config: configData, merge },
      { authMethod: 'token' }
    );
  }

  async createConfigurationTemplate(
    templateData: Omit<ConfigurationTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<ConfigurationTemplate>> {
    logger.info('Creating configuration template', { nome: templateData.nome });

    return this.client.post<ConfigurationTemplate>(
      '/configuracao/templates',
      templateData,
      { authMethod: 'token' }
    );
  }

  async listConfigurationTemplates(
    params: {
      page?: number;
      per_page?: number;
      categoria?: string;
      aprovado?: boolean;
    } = {}
  ): Promise<PaginatedResponse<ConfigurationTemplate>> {
    logger.info('Listing configuration templates', params);

    return this.client.get<ConfigurationTemplate[]>(
      '/configuracao/templates',
      { params, authMethod: 'token' }
    );
  }

  async applyConfigurationTemplate(
    templateId: number,
    override: boolean = false
  ): Promise<SGPResponse<{
    applied: number;
    skipped: number;
    errors: string[];
  }>> {
    logger.info('Applying configuration template', { templateId, override });

    return this.client.post<{
      applied: number;
      skipped: number;
      errors: string[];
    }>(
      `/configuracao/templates/${templateId}/aplicar`,
      { override },
      { authMethod: 'token' }
    );
  }

  async getUserPreferences(
    usuarioId: number,
    categoria?: string
  ): Promise<SGPResponse<UserPreferences[]>> {
    logger.info('Getting user preferences', { usuarioId, categoria });

    return this.client.get<UserPreferences[]>(
      `/configuracao/usuarios/${usuarioId}/preferencias`,
      { params: { categoria }, authMethod: 'token' }
    );
  }

  async updateUserPreferences(
    usuarioId: number,
    preferencias: Partial<UserPreferences>
  ): Promise<SGPResponse<UserPreferences>> {
    logger.info('Updating user preferences', { usuarioId });

    return this.client.put<UserPreferences>(
      `/configuracao/usuarios/${usuarioId}/preferencias`,
      preferencias,
      { authMethod: 'token' }
    );
  }

  async resetUserPreferences(
    usuarioId: number,
    categoria?: string
  ): Promise<SGPResponse<{ reset: boolean }>> {
    logger.info('Resetting user preferences', { usuarioId, categoria });

    return this.client.post<{ reset: boolean }>(
      `/configuracao/usuarios/${usuarioId}/preferencias/reset`,
      { categoria },
      { authMethod: 'token' }
    );
  }

  async createCustomField(
    fieldData: Omit<CustomField, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<CustomField>> {
    logger.info('Creating custom field', { nome: fieldData.nome, entidade: fieldData.entidade });

    return this.client.post<CustomField>(
      '/configuracao/campos-customizados',
      fieldData,
      { authMethod: 'token' }
    );
  }

  async listCustomFields(
    params: {
      entidade?: string;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<CustomField>> {
    logger.info('Listing custom fields', params);

    return this.client.get<CustomField[]>(
      '/configuracao/campos-customizados',
      { params, authMethod: 'token' }
    );
  }

  async updateCustomField(
    fieldId: number,
    updates: Partial<Omit<CustomField, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<CustomField>> {
    logger.info('Updating custom field', { fieldId });

    return this.client.put<CustomField>(
      `/configuracao/campos-customizados/${fieldId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async deleteCustomField(fieldId: number): Promise<SGPResponse<{ success: boolean }>> {
    logger.info('Deleting custom field', { fieldId });

    return this.client.delete<{ success: boolean }>(
      `/configuracao/campos-customizados/${fieldId}`,
      { authMethod: 'token' }
    );
  }

  async createWorkflowCustomization(
    workflowData: Omit<WorkflowCustomization, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<WorkflowCustomization>> {
    logger.info('Creating workflow customization', { nome: workflowData.nome, processo: workflowData.processo });

    return this.client.post<WorkflowCustomization>(
      '/configuracao/workflows',
      workflowData,
      { authMethod: 'token' }
    );
  }

  async listWorkflowCustomizations(
    params: {
      processo?: string;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<WorkflowCustomization>> {
    logger.info('Listing workflow customizations', params);

    return this.client.get<WorkflowCustomization[]>(
      '/configuracao/workflows',
      { params, authMethod: 'token' }
    );
  }

  async testWorkflow(
    workflowId: number,
    testData: Record<string, any>
  ): Promise<SGPResponse<{
    success: boolean;
    etapas_executadas: string[];
    tempo_execucao_ms: number;
    logs: string[];
  }>> {
    logger.info('Testing workflow', { workflowId });

    return this.client.post<{
      success: boolean;
      etapas_executadas: string[];
      tempo_execucao_ms: number;
      logs: string[];
    }>(
      `/configuracao/workflows/${workflowId}/testar`,
      testData,
      { authMethod: 'token' }
    );
  }

  async createBrandingConfiguration(
    brandingData: Omit<BrandingConfiguration, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<BrandingConfiguration>> {
    logger.info('Creating branding configuration', { nome: brandingData.nome, tipo: brandingData.tipo });

    return this.client.post<BrandingConfiguration>(
      '/configuracao/branding',
      brandingData,
      { authMethod: 'token' }
    );
  }

  async listBrandingConfigurations(
    params: {
      tipo?: string;
      ativo?: boolean;
      dominio?: string;
    } = {}
  ): Promise<PaginatedResponse<BrandingConfiguration>> {
    logger.info('Listing branding configurations', params);

    return this.client.get<BrandingConfiguration[]>(
      '/configuracao/branding',
      { params, authMethod: 'token' }
    );
  }

  async updateBrandingConfiguration(
    brandingId: number,
    updates: Partial<Omit<BrandingConfiguration, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<BrandingConfiguration>> {
    logger.info('Updating branding configuration', { brandingId });

    return this.client.put<BrandingConfiguration>(
      `/configuracao/branding/${brandingId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async previewBranding(
    brandingId: number,
    pagina: string = 'home'
  ): Promise<SGPResponse<{ preview_url: string; expira_em: string }>> {
    logger.info('Generating branding preview', { brandingId, pagina });

    return this.client.post<{ preview_url: string; expira_em: string }>(
      `/configuracao/branding/${brandingId}/preview`,
      { pagina },
      { authMethod: 'token' }
    );
  }

  async createMenuCustomization(
    menuData: Omit<MenuCustomization, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<MenuCustomization>> {
    logger.info('Creating menu customization', { nome: menuData.nome, tipo: menuData.tipo });

    return this.client.post<MenuCustomization>(
      '/configuracao/menus',
      menuData,
      { authMethod: 'token' }
    );
  }

  async listMenuCustomizations(
    params: {
      tipo?: string;
      perfil?: string;
      ativo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<MenuCustomization>> {
    logger.info('Listing menu customizations', params);

    return this.client.get<MenuCustomization[]>(
      '/configuracao/menus',
      { params, authMethod: 'token' }
    );
  }

  async createReportCustomization(
    reportData: Omit<ReportCustomization, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<ReportCustomization>> {
    logger.info('Creating report customization', { nome: reportData.nome, tipo: reportData.tipo_relatorio });

    return this.client.post<ReportCustomization>(
      '/configuracao/relatorios',
      reportData,
      { authMethod: 'token' }
    );
  }

  async listReportCustomizations(
    params: {
      tipo_relatorio?: string;
      publicado?: boolean;
      tags?: string[];
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<ReportCustomization>> {
    logger.info('Listing report customizations', params);

    return this.client.get<ReportCustomization[]>(
      '/configuracao/relatorios',
      { params, authMethod: 'token' }
    );
  }

  async previewReport(
    reportId: number,
    parametros: Record<string, any>
  ): Promise<SGPResponse<{ preview_url: string; expira_em: string }>> {
    logger.info('Generating report preview', { reportId });

    return this.client.post<{ preview_url: string; expira_em: string }>(
      `/configuracao/relatorios/${reportId}/preview`,
      parametros,
      { authMethod: 'token' }
    );
  }

  async createNotificationTemplate(
    templateData: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<NotificationTemplate>> {
    logger.info('Creating notification template', { nome: templateData.nome, tipo: templateData.tipo });

    return this.client.post<NotificationTemplate>(
      '/configuracao/notificacoes/templates',
      templateData,
      { authMethod: 'token' }
    );
  }

  async listNotificationTemplates(
    params: {
      tipo?: string;
      categoria?: string;
      evento?: string;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<NotificationTemplate>> {
    logger.info('Listing notification templates', params);

    return this.client.get<NotificationTemplate[]>(
      '/configuracao/notificacoes/templates',
      { params, authMethod: 'token' }
    );
  }

  async testNotificationTemplate(
    templateId: number,
    testData: {
      destinatario: string;
      variaveis: Record<string, any>;
    }
  ): Promise<SGPResponse<{
    enviado: boolean;
    preview: string;
    erro?: string;
  }>> {
    logger.info('Testing notification template', { templateId });

    return this.client.post<{
      enviado: boolean;
      preview: string;
      erro?: string;
    }>(
      `/configuracao/notificacoes/templates/${templateId}/testar`,
      testData,
      { authMethod: 'token' }
    );
  }

  async createPortalCustomization(
    portalData: Omit<PortalCustomization, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<PortalCustomization>> {
    logger.info('Creating portal customization', { nome: portalData.nome, tipo: portalData.tipo });

    return this.client.post<PortalCustomization>(
      '/configuracao/portais',
      portalData,
      { authMethod: 'token' }
    );
  }

  async listPortalCustomizations(
    params: {
      tipo?: string;
      ativo?: boolean;
      dominio?: string;
    } = {}
  ): Promise<PaginatedResponse<PortalCustomization>> {
    logger.info('Listing portal customizations', params);

    return this.client.get<PortalCustomization[]>(
      '/configuracao/portais',
      { params, authMethod: 'token' }
    );
  }

  async updatePortalCustomization(
    portalId: number,
    updates: Partial<Omit<PortalCustomization, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<PortalCustomization>> {
    logger.info('Updating portal customization', { portalId });

    return this.client.put<PortalCustomization>(
      `/configuracao/portais/${portalId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async createLocalizationConfig(
    localizationData: Omit<LocalizationConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<LocalizationConfig>> {
    logger.info('Creating localization configuration', { idioma: localizationData.idioma });

    return this.client.post<LocalizationConfig>(
      '/configuracao/localizacao',
      localizationData,
      { authMethod: 'token' }
    );
  }

  async listLocalizationConfigs(
    params: {
      ativo?: boolean;
      completo?: boolean;
    } = {}
  ): Promise<PaginatedResponse<LocalizationConfig>> {
    logger.info('Listing localization configurations', params);

    return this.client.get<LocalizationConfig[]>(
      '/configuracao/localizacao',
      { params, authMethod: 'token' }
    );
  }

  async updateLocalizationConfig(
    idioma: string,
    updates: Partial<Omit<LocalizationConfig, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<LocalizationConfig>> {
    logger.info('Updating localization configuration', { idioma });

    return this.client.put<LocalizationConfig>(
      `/configuracao/localizacao/${idioma}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async getConfigurationDashboard(): Promise<SGPResponse<{
    estatisticas: {
      total_configuracoes: number;
      configuracoes_customizadas: number;
      templates_disponiveis: number;
      usuarios_com_preferencias: number;
    };
    alteracoes_recentes: Array<{
      tipo: string;
      descricao: string;
      usuario: string;
      data: string;
    }>;
    recursos_mais_customizados: Array<{
      recurso: string;
      total_customizacoes: number;
      percentual_usuarios: number;
    }>;
    health_check: {
      configuracoes_invalidas: number;
      avisos: string[];
      recomendacoes: string[];
    };
  }>> {
    logger.info('Getting configuration dashboard');

    return this.client.get<{
      estatisticas: {
        total_configuracoes: number;
        configuracoes_customizadas: number;
        templates_disponiveis: number;
        usuarios_com_preferencias: number;
      };
      alteracoes_recentes: Array<{
        tipo: string;
        descricao: string;
        usuario: string;
        data: string;
      }>;
      recursos_mais_customizados: Array<{
        recurso: string;
        total_customizacoes: number;
        percentual_usuarios: number;
      }>;
      health_check: {
        configuracoes_invalidas: number;
        avisos: string[];
        recomendacoes: string[];
      };
    }>(
      '/configuracao/dashboard',
      { authMethod: 'token' }
    );
  }

  async getAuditEvents(
    params: {
      usuario_id?: number;
      categoria?: string;
      acao?: string;
      nivel_risco?: string;
      data_inicio?: string;
      data_fim?: string;
      ip_address?: string;
      origem?: string;
      tags?: string[];
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<AuditEvent>> {
    logger.info('Getting audit events', params);

    return this.client.get<AuditEvent[]>(
      '/auditoria/eventos',
      { params, authMethod: 'token' }
    );
  }

  async getAuditEvent(eventId: number): Promise<SGPResponse<AuditEvent>> {
    logger.info('Getting audit event details', { eventId });

    return this.client.get<AuditEvent>(
      `/auditoria/eventos/${eventId}`,
      { authMethod: 'token' }
    );
  }

  async createAuditEvent(
    eventData: Omit<AuditEvent, 'id' | 'created_at'>
  ): Promise<SGPResponse<AuditEvent>> {
    logger.info('Creating audit event', { 
      evento: eventData.evento, 
      categoria: eventData.categoria,
      acao: eventData.acao 
    });

    return this.client.post<AuditEvent>(
      '/auditoria/eventos',
      eventData,
      { authMethod: 'token' }
    );
  }

  async exportAuditEvents(
    params: {
      formato: 'json' | 'csv' | 'excel' | 'pdf';
      data_inicio?: string;
      data_fim?: string;
      filtros?: Record<string, any>;
    }
  ): Promise<SGPResponse<{ 
    file_url: string; 
    filename: string; 
    expires_at: string; 
  }>> {
    logger.info('Exporting audit events', params);

    return this.client.post<{ 
      file_url: string; 
      filename: string; 
      expires_at: string; 
    }>(
      '/auditoria/eventos/export',
      params,
      { authMethod: 'token' }
    );
  }

  async createComplianceRule(
    ruleData: Omit<ComplianceRule, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<ComplianceRule>> {
    logger.info('Creating compliance rule', { 
      nome: ruleData.nome, 
      categoria: ruleData.categoria,
      tipo: ruleData.tipo 
    });

    return this.client.post<ComplianceRule>(
      '/auditoria/compliance/regras',
      ruleData,
      { authMethod: 'token' }
    );
  }

  async listComplianceRules(
    params: {
      categoria?: string;
      tipo?: string;
      ativo?: boolean;
      responsavel?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<ComplianceRule>> {
    logger.info('Listing compliance rules', params);

    return this.client.get<ComplianceRule[]>(
      '/auditoria/compliance/regras',
      { params, authMethod: 'token' }
    );
  }

  async getComplianceRule(ruleId: number): Promise<SGPResponse<ComplianceRule>> {
    logger.info('Getting compliance rule', { ruleId });

    return this.client.get<ComplianceRule>(
      `/auditoria/compliance/regras/${ruleId}`,
      { authMethod: 'token' }
    );
  }

  async updateComplianceRule(
    ruleId: number,
    updates: Partial<Omit<ComplianceRule, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<ComplianceRule>> {
    logger.info('Updating compliance rule', { ruleId });

    return this.client.put<ComplianceRule>(
      `/auditoria/compliance/regras/${ruleId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async executeComplianceRule(
    ruleId: number,
    testMode: boolean = false
  ): Promise<SGPResponse<{
    executed: boolean;
    violations_found: number;
    test_mode: boolean;
    execution_time_ms: number;
    summary: string;
  }>> {
    logger.info('Executing compliance rule', { ruleId, testMode });

    return this.client.post<{
      executed: boolean;
      violations_found: number;
      test_mode: boolean;
      execution_time_ms: number;
      summary: string;
    }>(
      `/auditoria/compliance/regras/${ruleId}/executar`,
      { test_mode: testMode },
      { authMethod: 'token' }
    );
  }

  async getComplianceViolations(
    params: {
      regra_id?: number;
      severidade?: string;
      status?: string;
      usuario_id?: number;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<ComplianceViolation>> {
    logger.info('Getting compliance violations', params);

    return this.client.get<ComplianceViolation[]>(
      '/auditoria/compliance/violacoes',
      { params, authMethod: 'token' }
    );
  }

  async getComplianceViolation(violationId: number): Promise<SGPResponse<ComplianceViolation>> {
    logger.info('Getting compliance violation', { violationId });

    return this.client.get<ComplianceViolation>(
      `/auditoria/compliance/violacoes/${violationId}`,
      { authMethod: 'token' }
    );
  }

  async updateComplianceViolation(
    violationId: number,
    updates: Partial<Pick<ComplianceViolation, 'status' | 'investigacao' | 'acoes_corretivas'>>
  ): Promise<SGPResponse<ComplianceViolation>> {
    logger.info('Updating compliance violation', { violationId, status: updates.status });

    return this.client.put<ComplianceViolation>(
      `/auditoria/compliance/violacoes/${violationId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async createDataRetentionPolicy(
    policyData: Omit<DataRetentionPolicy, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<DataRetentionPolicy>> {
    logger.info('Creating data retention policy', { 
      nome: policyData.nome, 
      entidade_tipo: policyData.entidade_tipo 
    });

    return this.client.post<DataRetentionPolicy>(
      '/auditoria/retencao/politicas',
      policyData,
      { authMethod: 'token' }
    );
  }

  async listDataRetentionPolicies(
    params: {
      entidade_tipo?: string;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<DataRetentionPolicy>> {
    logger.info('Listing data retention policies', params);

    return this.client.get<DataRetentionPolicy[]>(
      '/auditoria/retencao/politicas',
      { params, authMethod: 'token' }
    );
  }

  async executeDataRetentionPolicy(
    policyId: number,
    dryRun: boolean = false
  ): Promise<SGPResponse<{
    executed: boolean;
    dry_run: boolean;
    records_affected: number;
    actions_taken: string[];
    summary: string;
  }>> {
    logger.info('Executing data retention policy', { policyId, dryRun });

    return this.client.post<{
      executed: boolean;
      dry_run: boolean;
      records_affected: number;
      actions_taken: string[];
      summary: string;
    }>(
      `/auditoria/retencao/politicas/${policyId}/executar`,
      { dry_run: dryRun },
      { authMethod: 'token' }
    );
  }

  async createAccessControl(
    accessData: Omit<AccessControl, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<AccessControl>> {
    logger.info('Creating access control', { 
      usuario_id: accessData.usuario_id, 
      recurso_tipo: accessData.recurso_tipo 
    });

    return this.client.post<AccessControl>(
      '/auditoria/acesso/controles',
      accessData,
      { authMethod: 'token' }
    );
  }

  async listAccessControls(
    params: {
      usuario_id?: number;
      recurso_tipo?: string;
      ativo?: boolean;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<AccessControl>> {
    logger.info('Listing access controls', params);

    return this.client.get<AccessControl[]>(
      '/auditoria/acesso/controles',
      { params, authMethod: 'token' }
    );
  }

  async updateAccessControl(
    accessId: number,
    updates: Partial<Omit<AccessControl, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<AccessControl>> {
    logger.info('Updating access control', { accessId });

    return this.client.put<AccessControl>(
      `/auditoria/acesso/controles/${accessId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async revokeAccessControl(
    accessId: number,
    motivo: string
  ): Promise<SGPResponse<{ revoked: boolean }>> {
    logger.info('Revoking access control', { accessId, motivo });

    return this.client.post<{ revoked: boolean }>(
      `/auditoria/acesso/controles/${accessId}/revogar`,
      { motivo },
      { authMethod: 'token' }
    );
  }

  async createPrivacyRequest(
    requestData: Omit<PrivacyRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<PrivacyRequest>> {
    logger.info('Creating privacy request', { 
      tipo: requestData.tipo, 
      solicitante: requestData.solicitante.nome 
    });

    return this.client.post<PrivacyRequest>(
      '/auditoria/privacidade/solicitacoes',
      requestData,
      { authMethod: 'token' }
    );
  }

  async listPrivacyRequests(
    params: {
      tipo?: string;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<PrivacyRequest>> {
    logger.info('Listing privacy requests', params);

    return this.client.get<PrivacyRequest[]>(
      '/auditoria/privacidade/solicitacoes',
      { params, authMethod: 'token' }
    );
  }

  async getPrivacyRequest(requestId: number): Promise<SGPResponse<PrivacyRequest>> {
    logger.info('Getting privacy request', { requestId });

    return this.client.get<PrivacyRequest>(
      `/auditoria/privacidade/solicitacoes/${requestId}`,
      { authMethod: 'token' }
    );
  }

  async updatePrivacyRequest(
    requestId: number,
    updates: Partial<Pick<PrivacyRequest, 'status' | 'processamento' | 'resultado'>>
  ): Promise<SGPResponse<PrivacyRequest>> {
    logger.info('Updating privacy request', { requestId, status: updates.status });

    return this.client.put<PrivacyRequest>(
      `/auditoria/privacidade/solicitacoes/${requestId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async processPrivacyRequest(
    requestId: number,
    action: 'approve' | 'reject' | 'process',
    observacoes?: string
  ): Promise<SGPResponse<{
    processed: boolean;
    status: string;
    message: string;
  }>> {
    logger.info('Processing privacy request', { requestId, action });

    return this.client.post<{
      processed: boolean;
      status: string;
      message: string;
    }>(
      `/auditoria/privacidade/solicitacoes/${requestId}/processar`,
      { action, observacoes },
      { authMethod: 'token' }
    );
  }

  async createSecurityIncident(
    incidentData: Omit<SecurityIncident, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<SecurityIncident>> {
    logger.info('Creating security incident', { 
      titulo: incidentData.titulo, 
      tipo: incidentData.tipo,
      severidade: incidentData.severidade 
    });

    return this.client.post<SecurityIncident>(
      '/auditoria/seguranca/incidentes',
      incidentData,
      { authMethod: 'token' }
    );
  }

  async listSecurityIncidents(
    params: {
      tipo?: string;
      severidade?: string;
      status?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<SecurityIncident>> {
    logger.info('Listing security incidents', params);

    return this.client.get<SecurityIncident[]>(
      '/auditoria/seguranca/incidentes',
      { params, authMethod: 'token' }
    );
  }

  async getSecurityIncident(incidentId: number): Promise<SGPResponse<SecurityIncident>> {
    logger.info('Getting security incident', { incidentId });

    return this.client.get<SecurityIncident>(
      `/auditoria/seguranca/incidentes/${incidentId}`,
      { authMethod: 'token' }
    );
  }

  async updateSecurityIncident(
    incidentId: number,
    updates: Partial<Omit<SecurityIncident, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SGPResponse<SecurityIncident>> {
    logger.info('Updating security incident', { incidentId, status: updates.status });

    return this.client.put<SecurityIncident>(
      `/auditoria/seguranca/incidentes/${incidentId}`,
      updates,
      { authMethod: 'token' }
    );
  }

  async createAuditReport(
    reportData: Omit<AuditReport, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SGPResponse<AuditReport>> {
    logger.info('Creating audit report', { 
      titulo: reportData.titulo, 
      tipo: reportData.tipo 
    });

    return this.client.post<AuditReport>(
      '/auditoria/relatorios',
      reportData,
      { authMethod: 'token' }
    );
  }

  async listAuditReports(
    params: {
      tipo?: string;
      status?: string;
      executado_por?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<PaginatedResponse<AuditReport>> {
    logger.info('Listing audit reports', params);

    return this.client.get<AuditReport[]>(
      '/auditoria/relatorios',
      { params, authMethod: 'token' }
    );
  }

  async getAuditReport(reportId: number): Promise<SGPResponse<AuditReport>> {
    logger.info('Getting audit report', { reportId });

    return this.client.get<AuditReport>(
      `/auditoria/relatorios/${reportId}`,
      { authMethod: 'token' }
    );
  }

  async generateAuditReport(
    reportId: number,
    formato: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<SGPResponse<{
    file_url: string;
    filename: string;
    expires_at: string;
  }>> {
    logger.info('Generating audit report', { reportId, formato });

    return this.client.post<{
      file_url: string;
      filename: string;
      expires_at: string;
    }>(
      `/auditoria/relatorios/${reportId}/gerar`,
      { formato },
      { authMethod: 'token' }
    );
  }

  async getAuditDashboard(): Promise<SGPResponse<{
    estatisticas: {
      total_eventos_30d: number;
      eventos_alto_risco: number;
      violacoes_compliance: number;
      incidentes_seguranca: number;
      solicitacoes_privacidade: number;
    };
    eventos_recentes: Array<{
      id: number;
      evento: string;
      usuario: string;
      data: string;
      nivel_risco: string;
      categoria: string;
    }>;
    violacoes_por_categoria: Array<{
      categoria: string;
      total: number;
      percentual: number;
    }>;
    compliance_score: {
      geral: number;
      por_categoria: Array<{
        categoria: string;
        score: number;
        trend: 'up' | 'down' | 'stable';
      }>;
    };
    alertas_ativos: Array<{
      tipo: string;
      mensagem: string;
      severidade: string;
      data_criacao: string;
    }>;
    proximas_acoes: Array<{
      tipo: string;
      descricao: string;
      responsavel: string;
      prazo: string;
      prioridade: string;
    }>;
  }>> {
    logger.info('Getting audit dashboard');

    return this.client.get<{
      estatisticas: {
        total_eventos_30d: number;
        eventos_alto_risco: number;
        violacoes_compliance: number;
        incidentes_seguranca: number;
        solicitacoes_privacidade: number;
      };
      eventos_recentes: Array<{
        id: number;
        evento: string;
        usuario: string;
        data: string;
        nivel_risco: string;
        categoria: string;
      }>;
      violacoes_por_categoria: Array<{
        categoria: string;
        total: number;
        percentual: number;
      }>;
      compliance_score: {
        geral: number;
        por_categoria: Array<{
          categoria: string;
          score: number;
          trend: 'up' | 'down' | 'stable';
        }>;
      };
      alertas_ativos: Array<{
        tipo: string;
        mensagem: string;
        severidade: string;
        data_criacao: string;
      }>;
      proximas_acoes: Array<{
        tipo: string;
        descricao: string;
        responsavel: string;
        prazo: string;
        prioridade: string;
      }>;
    }>(
      '/auditoria/dashboard',
      { authMethod: 'token' }
    );
  }
}