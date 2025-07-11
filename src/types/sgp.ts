export interface SGPConfig {
  baseURL: string;
  username?: string;
  password?: string;
  apiToken?: string;
  appName?: string;
  timeout: number;
}

export interface SGPResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: {
    items: T[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export type AuthMethod = 'basic' | 'token' | 'cpf_cnpj';

export interface AuthCredentials {
  method: AuthMethod;
  username?: string;
  password?: string;
  token?: string;
  app?: string;
  cpfcnpj?: string;
  senha?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface CacheConfig {
  ttlSeconds: number;
  maxKeys: number;
}

export interface ContractDetails {
  id: number;
  cliente_id: number;
  status: string;
  plano: string;
  valor: number;
  data_instalacao: string;
  data_ativacao: string;
}

export interface InvoiceDetails {
  id: number;
  contrato_id: number;
  numero: string;
  valor: number;
  vencimento: string;
  status: string;
  linha_digitavel?: string;
}

export interface SupportTicket {
  id: number;
  cliente_id: number;
  contrato_id?: number;
  categoria_id: number;
  prioridade_id: number;
  assunto: string;
  descricao: string;
  status: string;
  data_abertura: string;
  data_fechamento?: string;
}

export interface ONUDetails {
  id: number;
  olt_id: number;
  serial: string;
  modelo: string;
  status: string;
  sinal: number;
  contrato_id?: number;
}

export interface OLTDetails {
  id: number;
  nome: string;
  ip: string;
  modelo: string;
  status: string;
  total_portas: number;
  portas_ocupadas: number;
}

export interface ProductDetails {
  id: number;
  nome: string;
  categoria_id: number;
  fornecedor_id?: number;
  codigo: string;
  estoque_atual: number;
  estoque_minimo: number;
  valor_compra: number;
  valor_venda: number;
}