import { SGPClient } from '../client/sgp-client.js';
import { 
  ContractDetails, 
  InvoiceDetails, 
  SupportTicket, 
  ONUDetails, 
  OLTDetails, 
  ProductDetails,
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
}