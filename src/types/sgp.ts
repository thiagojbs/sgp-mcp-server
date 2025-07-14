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

export interface URACustomerLookup {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  status: string;
  endereco: string;
  contratos_ativos: number;
  valor_em_aberto: number;
  ultimo_pagamento: {
    data: string;
    valor: number;
  };
}

export interface URAConnectionStatus {
  online: boolean;
  ip_address?: string;
  session_start?: string;
  download_speed: number;
  upload_speed: number;
  bytes_downloaded: number;
  bytes_uploaded: number;
}

export interface URAAuth {
  authenticated: boolean;
  customer_id: number;
  contracts: ContractDetails[];
  permissions: string[];
}

export interface ServiceOrder {
  id: number;
  cliente_id: number;
  contrato_id?: number;
  tipo_id: number;
  tecnico_id?: number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  data_abertura: string;
  data_agendamento?: string;
  data_execucao?: string;
  data_fechamento?: string;
  observacoes?: string;
  endereco: string;
  equipamentos: string[];
  anexos: ServiceOrderAttachment[];
}

export interface ServiceOrderAttachment {
  id: number;
  nome: string;
  tipo: string;
  url: string;
  data_upload: string;
}

export interface PreRegistration {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cep: string;
  plano_interesse: string;
  origem: string;
  status: string;
  data_cadastro: string;
  data_contato?: string;
  observacoes?: string;
}

export interface RadiusUser {
  id: number;
  username: string;
  password?: string;
  grupo_id: number;
  cliente_id?: number;
  status: string;
  data_criacao: string;
  ultimo_login?: string;
  ip_fixo?: string;
  perfil_velocidade: string;
}

export interface RadiusSession {
  id: number;
  username: string;
  nas_ip: string;
  ip_address: string;
  session_start: string;
  session_time: number;
  bytes_in: number;
  bytes_out: number;
  status: string;
}

export interface RadiusGroup {
  id: number;
  nome: string;
  descricao?: string;
  perfil_velocidade: string;
  download_speed: number;
  upload_speed: number;
  limite_tempo?: number;
  limite_dados?: number;
  prioridade: number;
  status: 'ativo' | 'inativo';
  data_criacao: string;
  total_usuarios: number;
}

export interface RadiusAttribute {
  id: number;
  nome: string;
  tipo: 'string' | 'integer' | 'ipaddr' | 'date' | 'octets';
  valor: string;
  grupo_id?: number;
  usuario_id?: number;
  operador: '=' | ':=' | '==' | '+=' | '!=' | '>' | '<' | '>=' | '<=';
  categoria: 'check' | 'reply';
  descricao?: string;
  ativo: boolean;
}

export interface RadiusNAS {
  id: number;
  nome: string;
  endereco_ip: string;
  shared_secret: string;
  tipo: string;
  portas: number;
  community?: string;
  descricao?: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  ultima_comunicacao?: string;
  sessoes_ativas: number;
  data_cadastro: string;
}

export interface RadiusAccounting {
  id: number;
  username: string;
  nas_ip: string;
  nas_port: number;
  session_id: string;
  session_start: string;
  session_end?: string;
  session_time: number;
  input_octets: number;
  output_octets: number;
  input_packets: number;
  output_packets: number;
  terminate_cause?: string;
  calling_station_id?: string;
  called_station_id?: string;
  framed_ip: string;
  service_type?: string;
}

export interface RadiusCheck {
  id: number;
  username: string;
  attribute: string;
  op: string;
  value: string;
  grupo_aplicado?: string;
  data_criacao: string;
  ativo: boolean;
}

export interface RadiusReply {
  id: number;
  username: string;
  attribute: string;
  op: string;
  value: string;
  grupo_aplicado?: string;
  data_criacao: string;
  ativo: boolean;
}

export interface RadiusStatistics {
  periodo: string;
  total_autenticacoes: number;
  autenticacoes_aceitas: number;
  autenticacoes_rejeitadas: number;
  total_accounting: number;
  usuarios_unicos: number;
  tempo_sessao_medio: number;
  trafego_total: {
    download: number;
    upload: number;
  };
  nas_mais_usado: {
    nome: string;
    ip: string;
    sessoes: number;
  };
}

export interface AcceptanceTerm {
  id: number;
  titulo: string;
  conteudo: string;
  versao: string;
  status: string;
  data_criacao: string;
  data_ativacao?: string;
  obrigatorio: boolean;
  tipo: string;
}

export interface TermAcceptance {
  id: number;
  termo_id: number;
  cliente_id: number;
  versao_aceita: string;
  data_aceite: string;
  ip_aceite: string;
  user_agent: string;
  hash_validacao: string;
}

export interface SystemUser {
  id: number;
  nome: string;
  email: string;
  username: string;
  status: string;
  perfil: string;
  ultimo_login?: string;
  data_criacao: string;
  permissoes: string[];
}

export interface AuditLog {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  acao: string;
  modulo: string;
  detalhes: string;
  ip: string;
  data_hora: string;
  resultado: string;
}

// ==================== FTTH INFRASTRUCTURE INTERFACES ====================

export interface FTTHBox {
  id: number;
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
  ocupacao: number;
  status: string;
  data_instalacao: string;
  observacoes?: string;
}

export interface FTTHSplitter {
  id: number;
  nome: string;
  tipo: string;
  razao_divisao: string; // 1:2, 1:4, 1:8, etc.
  caixa_id: number;
  olt_id: number;
  porta_olt: number;
  capacidade_entrada: number;
  capacidade_saida: number;
  portas_ocupadas: number;
  status: string;
  data_instalacao: string;
  observacoes?: string;
}

// ==================== BANKING AND PAYMENT INTERFACES ====================

export interface BoletoDetails {
  id: number;
  numero: string;
  linha_digitavel: string;
  codigo_barras: string;
  valor: number;
  data_vencimento: string;
  data_emissao: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  cliente_id: number;
  contrato_id?: number;
  fatura_id?: number;
  banco_id: number;
  agencia: string;
  conta: string;
  carteira: string;
  nosso_numero: string;
  cedente_nome: string;
  cedente_documento: string;
  sacado_nome: string;
  sacado_documento: string;
  sacado_endereco: string;
  instrucoes?: string;
  multa_percentual?: number;
  juros_diario?: number;
  desconto_percentual?: number;
  data_limite_desconto?: string;
  observacoes?: string;
  pdf_url?: string;
}

export interface RemessaDetails {
  id: number;
  numero_sequencial: number;
  banco_id: number;
  data_geracao: string;
  data_vencimento: string;
  tipo_arquivo: string;
  quantidade_titulos: number;
  valor_total: number;
  status: 'gerada' | 'enviada' | 'processada' | 'erro';
  arquivo_nome: string;
  arquivo_url: string;
  data_envio?: string;
  data_processamento?: string;
  observacoes?: string;
  boletos: BoletoDetails[];
}

export interface RetornoDetails {
  id: number;
  remessa_id?: number;
  banco_id: number;
  data_processamento: string;
  tipo_arquivo: string;
  arquivo_nome: string;
  total_registros: number;
  registros_processados: number;
  registros_erro: number;
  valor_total_pago: number;
  status: 'processando' | 'processado' | 'erro';
  detalhes: Array<{
    nosso_numero: string;
    data_pagamento: string;
    valor_pago: number;
    valor_tarifa: number;
    status: string;
    erro?: string;
  }>;
  observacoes?: string;
}

// ==================== URA SYSTEM INTERFACES ====================

export interface URAContract {
  id: number;
  cliente_id: number;
  numero: string;
  plano: string;
  status: string;
  valor_mensalidade: number;
  data_ativacao: string;
  data_vencimento: string;
  endereco_instalacao: string;
  tecnologia: string;
  velocidade_download: number;
  velocidade_upload: number;
}

export interface URAInvoice {
  id: number;
  contrato_id: number;
  numero: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: string;
  linha_digitavel?: string;
  pdf_url?: string;
}

export interface URATicket {
  id: number;
  cliente_id: number;
  contrato_id?: number;
  protocolo: string;
  assunto: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  status: string;
  data_abertura: string;
  data_fechamento?: string;
  responsavel?: string;
  solucao?: string;
}

export interface URAAtendimento {
  id: number;
  cliente_id: number;
  protocolo: string;
  tipo_atendimento: string;
  canal: 'telefone' | 'whatsapp' | 'email' | 'chat' | 'presencial';
  operador_id?: number;
  operador_nome?: string;
  data_inicio: string;
  data_fim?: string;
  duracao_segundos?: number;
  resumo: string;
  observacoes?: string;
  satisfacao?: number;
  tags?: string[];
}

export interface URAMenu {
  id: number;
  nome: string;
  tipo: 'principal' | 'submenu' | 'acao';
  opcoes: Array<{
    tecla: string;
    descricao: string;
    acao: string;
    submenu_id?: number;
    destino?: string;
  }>;
  audio_url?: string;
  texto_tts?: string;
  timeout_segundos: number;
  tentativas_maximas: number;
  ativo: boolean;
}

export interface URAFilaStatus {
  fila_nome: string;
  operadores_disponiveis: number;
  operadores_total: number;
  chamadas_aguardando: number;
  tempo_medio_espera: number;
  tempo_medio_atendimento: number;
  chamadas_atendidas_hoje: number;
  chamadas_abandonadas_hoje: number;
  nivel_servico: number;
  status: 'ativa' | 'pausada' | 'inativa';
}

// ==================== INVENTORY SYSTEM INTERFACES ====================

export interface Fornecedor {
  id: number;
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
  status: 'ativo' | 'inativo' | 'bloqueado';
  data_cadastro: string;
  observacoes?: string;
  produtos_fornecidos?: number;
  ultima_compra?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  categoria_pai_id?: number;
  categoria_pai_nome?: string;
  nivel: number;
  status: 'ativa' | 'inativa';
  total_produtos: number;
  data_criacao: string;
  observacoes?: string;
}

export interface ProductDetailsExtended extends ProductDetails {
  categoria_nome: string;
  fornecedor_nome?: string;
  movimentacoes_recentes?: Array<{
    id: number;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    data: string;
    motivo: string;
    responsavel: string;
  }>;
  localizacao?: string;
  unidade_medida: string;
  peso?: number;
  dimensoes?: {
    altura: number;
    largura: number;
    profundidade: number;
  };
  garantia_meses?: number;
  status: 'ativo' | 'inativo' | 'descontinuado';
}

export interface MovimentacaoEstoque {
  id: number;
  produto_id: number;
  produto_nome: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  valor_unitario?: number;
  valor_total?: number;
  motivo: string;
  fornecedor_id?: number;
  fornecedor_nome?: string;
  responsavel_id: number;
  responsavel_nome: string;
  data_movimentacao: string;
  documento_referencia?: string;
  observacoes?: string;
  lote?: string;
  data_validade?: string;
}

export interface Inventario {
  id: number;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  status: 'planejado' | 'em_andamento' | 'finalizado' | 'cancelado';
  responsavel_id: number;
  responsavel_nome: string;
  total_produtos: number;
  produtos_contados: number;
  divergencias_encontradas: number;
  valor_total_divergencia: number;
  observacoes?: string;
  produtos: Array<{
    produto_id: number;
    produto_nome: string;
    estoque_sistema: number;
    estoque_fisico?: number;
    divergencia?: number;
    valor_divergencia?: number;
    observacoes?: string;
    contado: boolean;
  }>;
}

export interface SerialTracking {
  produto_id: number;
  produto_nome: string;
  serial: string;
  status: 'estoque' | 'instalado' | 'defeito' | 'garantia' | 'baixado';
  cliente_id?: number;
  cliente_nome?: string;
  contrato_id?: number;
  data_entrada: string;
  data_saida?: string;
  data_instalacao?: string;
  tecnico_instalacao?: string;
  localizacao_atual?: string;
  historico: Array<{
    data: string;
    acao: string;
    responsavel: string;
    observacoes?: string;
    localizacao?: string;
  }>;
}

// ==================== DOCUMENT AND CONTRACT SYSTEM INTERFACES ====================

export interface DocumentTemplate {
  id: number;
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
  status: 'ativo' | 'inativo' | 'rascunho';
  versao: string;
  data_criacao: string;
  data_atualizacao?: string;
  criado_por: string;
  observacoes?: string;
}

export interface ContractDocument {
  id: number;
  contrato_id: number;
  template_id?: number;
  tipo: 'contrato_principal' | 'aditivo' | 'rescisao' | 'notificacao';
  titulo: string;
  conteudo: string;
  status: 'rascunho' | 'ativo' | 'assinado' | 'cancelado' | 'vencido';
  data_criacao: string;
  data_vencimento?: string;
  data_assinatura?: string;
  hash_documento: string;
  assinatura_cliente?: {
    data: string;
    ip: string;
    user_agent: string;
    hash_validacao: string;
  };
  assinatura_empresa?: {
    data: string;
    responsavel: string;
    hash_validacao: string;
  };
  anexos: Array<{
    id: number;
    nome: string;
    tipo: string;
    url: string;
    tamanho: number;
    data_upload: string;
  }>;
}

export interface ContractStatus {
  contrato_id: number;
  status_atual: string;
  historico: Array<{
    status_anterior: string;
    status_novo: string;
    data_mudanca: string;
    motivo?: string;
    responsavel: string;
    observacoes?: string;
  }>;
  proxima_acao?: {
    acao: string;
    data_limite: string;
    responsavel: string;
    descricao: string;
  };
  documentos_pendentes: number;
  documentos_assinados: number;
  valor_mensal_atual: number;
  data_proxima_cobranca: string;
}

export interface DigitalSignature {
  id: number;
  documento_id: number;
  signatario_id: number;
  signatario_nome: string;
  signatario_email: string;
  tipo_signatario: 'cliente' | 'empresa' | 'testemunha' | 'avalista';
  status: 'pendente' | 'enviado' | 'visualizado' | 'assinado' | 'recusado' | 'expirado';
  data_envio?: string;
  data_visualizacao?: string;
  data_assinatura?: string;
  data_expiracao: string;
  token_assinatura: string;
  certificado_digital?: {
    tipo: string;
    serial: string;
    emissor: string;
    validade: string;
  };
  ip_assinatura?: string;
  localizacao_assinatura?: string;
  observacoes?: string;
}

export interface ContractAdendum {
  id: number;
  contrato_id: number;
  tipo: 'mudanca_plano' | 'alteracao_valor' | 'mudanca_endereco' | 'adicao_servico' | 'outros';
  titulo: string;
  descricao: string;
  valor_anterior?: number;
  valor_novo?: number;
  plano_anterior?: string;
  plano_novo?: string;
  data_vigencia: string;
  status: 'rascunho' | 'ativo' | 'assinado' | 'cancelado';
  documento_id?: number;
  aprovado_por: string;
  data_aprovacao?: string;
  observacoes?: string;
}

export interface LegalNotification {
  id: number;
  cliente_id: number;
  contrato_id?: number;
  tipo: 'cobranca' | 'suspensao' | 'cancelamento' | 'mudanca_contrato' | 'geral';
  titulo: string;
  conteudo: string;
  prazo_resposta?: number;
  status: 'rascunho' | 'enviada' | 'entregue' | 'respondida' | 'vencida';
  data_criacao: string;
  data_envio?: string;
  data_entrega?: string;
  data_resposta?: string;
  data_vencimento?: string;
  canais_envio: Array<{
    canal: 'email' | 'sms' | 'whatsapp' | 'correio' | 'app';
    endereco: string;
    status: 'enviado' | 'entregue' | 'falhou';
    data_envio: string;
    data_entrega?: string;
  }>;
  resposta_cliente?: string;
  comprovante_entrega?: string;
}

export interface DocumentApproval {
  id: number;
  documento_id: number;
  documento_tipo: string;
  aprovador_id: number;
  aprovador_nome: string;
  nivel_aprovacao: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
  data_solicitacao: string;
  data_resposta?: string;
  motivo_rejeicao?: string;
  observacoes?: string;
  proximos_aprovadores?: Array<{
    id: number;
    nome: string;
    nivel: number;
  }>;
}

export interface ContractRenewal {
  id: number;
  contrato_id: number;
  tipo_renovacao: 'automatica' | 'manual' | 'negociada';
  data_vencimento_atual: string;
  data_nova_vigencia: string;
  novo_periodo_meses: number;
  valor_anterior: number;
  valor_novo: number;
  plano_anterior: string;
  plano_novo?: string;
  status: 'programada' | 'processando' | 'concluida' | 'cancelada' | 'falhada';
  condicoes_especiais?: string;
  documento_renovacao_id?: number;
  data_processamento?: string;
  processado_por?: string;
  observacoes?: string;
}

// ==================== ANALYTICS AND REPORTING SYSTEM INTERFACES ====================

export interface SystemStatistics {
  periodo: string;
  clientes_ativos: number;
  contratos_ativos: number;
  faturamento_mensal: number;
  tickets_abertos: number;
  onus_online: number;
  performance_sistema: {
    cpu_uso: number;
    memoria_uso: number;
    disco_uso: number;
    uptime: string;
  };
  api_calls_ultima_hora: number;
  crescimento: {
    clientes_mes: number;
    receita_mes: number;
    tickets_resolvidos: number;
  };
}

export interface FinancialReport {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  resumo_pagamentos: {
    boletos_gerados: number;
    boletos_pagos: number;
    boletos_vencidos: number;
    boletos_cancelados: number;
    valor_total_gerado: number;
    valor_total_pago: number;
    valor_total_vencido: number;
    taxa_pagamento: number;
    taxa_inadimplencia: number;
  };
  breakdown_bancos: Array<{
    banco_id: number;
    banco_nome: string;
    boletos_processados: number;
    valor_processado: number;
    taxa_sucesso: number;
  }>;
  transacoes_diarias: Array<{
    data: string;
    boletos_gerados: number;
    boletos_pagos: number;
    valor_pago: number;
  }>;
  metricas_performance: {
    tempo_medio_pagamento: number;
    ticket_medio: number;
    clientes_adimplentes: number;
    clientes_inadimplentes: number;
  };
}

export interface NetworkAnalytics {
  periodo: string;
  capacidade_total: {
    olts_total: number;
    olts_online: number;
    caixas_total: number;
    caixas_ocupadas: number;
    splitters_total: number;
    onus_total: number;
    onus_online: number;
    utilizacao_geral: number;
  };
  performance_olts: Array<{
    olt_id: number;
    nome: string;
    capacidade_total: number;
    onus_ativas: number;
    utilizacao: number;
    status: string;
    alertas: number;
  }>;
  alertas_rede: Array<{
    tipo: string;
    nivel: 'info' | 'warning' | 'critical';
    mensagem: string;
    equipamento: string;
    data_ocorrencia: string;
  }>;
  trafego_total: {
    download_gb: number;
    upload_gb: number;
    pico_download: number;
    pico_upload: number;
  };
}

export interface CustomerAnalytics {
  periodo: string;
  segmentacao_clientes: {
    residenciais: number;
    empresariais: number;
    total: number;
  };
  analise_uso: {
    consumo_medio_gb: number;
    usuarios_alto_consumo: number;
    usuarios_baixo_consumo: number;
    pico_utilizacao_hora: string;
  };
  churn_analysis: {
    cancelamentos_mes: number;
    taxa_churn: number;
    motivos_principais: Array<{
      motivo: string;
      quantidade: number;
      percentual: number;
    }>;
  };
  satisfacao_cliente: {
    nps_score: number;
    tickets_satisfacao: Array<{
      nivel: number;
      quantidade: number;
    }>;
  };
  planos_populares: Array<{
    plano: string;
    clientes: number;
    receita: number;
    crescimento: number;
  }>;
}

export interface SupportAnalytics {
  periodo: string;
  volume_tickets: {
    total_abertos: number;
    total_resolvidos: number;
    total_pendentes: number;
    tempo_medio_resolucao: number;
  };
  categorias_tickets: Array<{
    categoria: string;
    quantidade: number;
    percentual: number;
    tempo_medio_resolucao: number;
  }>;
  performance_atendentes: Array<{
    atendente_id: number;
    nome: string;
    tickets_resolvidos: number;
    tempo_medio_resolucao: number;
    satisfacao_media: number;
  }>;
  ura_metricas: {
    chamadas_total: number;
    tempo_medio_espera: number;
    taxa_abandono: number;
    nivel_servico: number;
    distribuicao_horaria: Array<{
      hora: number;
      chamadas: number;
      tempo_espera: number;
    }>;
  };
}

export interface RevenueForecast {
  periodo_analise: string;
  receita_atual: number;
  previsao_30_dias: number;
  previsao_90_dias: number;
  previsao_anual: number;
  fatores_impacto: Array<{
    fator: string;
    impacto_percentual: number;
    confianca: number;
  }>;
  cenarios: {
    otimista: number;
    realista: number;
    pessimista: number;
  };
  recomendacoes: Array<{
    acao: string;
    impacto_estimado: number;
    prioridade: 'alta' | 'media' | 'baixa';
  }>;
}

export interface OperationalKPIs {
  periodo: string;
  disponibilidade_rede: number;
  tempo_medio_instalacao: number;
  taxa_sucesso_instalacao: number;
  incidentes_rede: number;
  tempo_medio_reparo: number;
  utilizacao_banda: number;
  crescimento_base: number;
  eficiencia_cobranca: number;
  custos_operacionais: {
    total: number;
    por_cliente: number;
    breakdown: Array<{
      categoria: string;
      valor: number;
      percentual: number;
    }>;
  };
}

export interface GeographicAnalytics {
  cobertura_areas: Array<{
    regiao: string;
    cep_range: string;
    clientes_ativos: number;
    densidade_clientes: number;
    receita_media: number;
    tecnologia_predominante: string;
    oportunidades_expansao: number;
  }>;
  heatmap_instalacoes: Array<{
    latitude: number;
    longitude: number;
    clientes_count: number;
    densidade_score: number;
  }>;
  performance_por_cidade: Array<{
    cidade: string;
    estado: string;
    clientes: number;
    receita: number;
    crescimento: number;
    penetracao_mercado: number;
  }>;
}

// ==================== EXTERNAL INTEGRATIONS SYSTEM INTERFACES ====================

export interface WebhookConfig {
  id: number;
  nome: string;
  url_destino: string;
  eventos: string[];
  ativo: boolean;
  secret_key?: string;
  headers_customizados?: Record<string, string>;
  timeout_segundos: number;
  max_tentativas: number;
  data_criacao: string;
  ultima_execucao?: string;
  total_execucoes: number;
  total_sucessos: number;
  total_falhas: number;
}

export interface WebhookExecution {
  id: number;
  webhook_id: number;
  evento: string;
  payload: any;
  status: 'pendente' | 'sucesso' | 'falha' | 'timeout';
  tentativa: number;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  data_execucao: string;
  tempo_resposta_ms?: number;
}

export interface ExternalAPIConfig {
  id: number;
  nome: string;
  tipo: 'banco' | 'correios' | 'sms' | 'email' | 'whatsapp' | 'gateway_pagamento' | 'outros';
  base_url: string;
  authentication: {
    tipo: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'custom';
    credentials: Record<string, string>;
  };
  headers_padrao?: Record<string, string>;
  timeout_segundos: number;
  rate_limit: {
    requests_per_minute: number;
    burst_limit?: number;
  };
  status: 'ativo' | 'inativo' | 'manutencao';
  data_configuracao: string;
  ultima_verificacao?: string;
  saude_api: {
    disponivel: boolean;
    latencia_ms?: number;
    erro_ultimo?: string;
  };
}

export interface PaymentGatewayConfig {
  id: number;
  nome: string;
  provedor: 'pix' | 'cartao' | 'boleto' | 'ted' | 'outros';
  configuracao: {
    merchant_id?: string;
    api_key: string;
    environment: 'sandbox' | 'production';
    webhook_url?: string;
    taxa_percentual: number;
    taxa_fixa: number;
  };
  metodos_pagamento: Array<{
    tipo: string;
    ativo: boolean;
    configuracao_especifica?: Record<string, any>;
  }>;
  ativo: boolean;
  data_integracao: string;
  volume_mensal: number;
  limite_transacao: number;
}

export interface SMSProviderConfig {
  id: number;
  nome: string;
  provedor: string;
  api_config: {
    base_url: string;
    api_key: string;
    sender_id: string;
    encoding: 'utf8' | 'latin1';
  };
  custo_por_sms: number;
  limite_caracteres: number;
  suporte_unicode: boolean;
  status_delivery: boolean;
  ativo: boolean;
  prioridade: number;
  paises_suportados: string[];
  volume_mensal: number;
}

export interface EmailProviderConfig {
  id: number;
  nome: string;
  provedor: 'smtp' | 'sendgrid' | 'ses' | 'mailgun' | 'outros';
  configuracao: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    api_key?: string;
    from_email: string;
    from_name: string;
  };
  template_engine: boolean;
  tracking_enabled: boolean;
  bounce_handling: boolean;
  ativo: boolean;
  volume_mensal: number;
  limite_diario: number;
}

export interface BankIntegration {
  id: number;
  banco_codigo: string;
  banco_nome: string;
  tipo_integracao: 'boleto' | 'ted' | 'pix' | 'spc' | 'serasa';
  configuracao: {
    agencia: string;
    conta: string;
    carteira: string;
    convenio?: string;
    certificado_digital?: string;
    chave_privada?: string;
  };
  endpoints: {
    boleto_registro?: string;
    consulta_saldo?: string;
    transferencia?: string;
    webhook_url?: string;
  };
  status: 'ativo' | 'inativo' | 'teste';
  volume_diario: number;
  limite_valor: number;
  ultima_conciliacao?: string;
}

export interface CorreiosIntegration {
  configuracao: {
    usuario: string;
    senha: string;
    cartao_postagem: string;
    codigo_servico: string[];
  };
  servicos_disponiveis: Array<{
    codigo: string;
    nome: string;
    prazo_dias: number;
    valor_kg: number;
  }>;
  status: 'ativo' | 'inativo';
  volume_mensal: number;
}

export interface MonitoringConfig {
  id: number;
  nome: string;
  tipo: 'healthcheck' | 'performance' | 'availability' | 'custom';
  target: {
    tipo: 'api' | 'database' | 'service' | 'network';
    endpoint?: string;
    query?: string;
    comando?: string;
  };
  intervalo_segundos: number;
  timeout_segundos: number;
  alertas: {
    email: string[];
    sms: string[];
    webhook?: string;
  };
  thresholds: {
    warning: number;
    critical: number;
    recovery: number;
  };
  ativo: boolean;
  historico_status: Array<{
    timestamp: string;
    status: 'ok' | 'warning' | 'critical';
    valor_medido: number;
    message?: string;
  }>;
}

export interface APIRateLimit {
  endpoint: string;
  method: string;
  limite_por_minuto: number;
  limite_por_hora: number;
  limite_por_dia: number;
  janela_burst: number;
  politica_excesso: 'reject' | 'queue' | 'throttle';
  whitelist_ips?: string[];
  blacklist_ips?: string[];
}

export interface DataSyncConfig {
  id: number;
  nome: string;
  origem: {
    tipo: 'database' | 'api' | 'file' | 'ftp';
    configuracao: Record<string, any>;
  };
  destino: {
    tipo: 'database' | 'api' | 'file' | 'cloud';
    configuracao: Record<string, any>;
  };
  frequencia: 'tempo_real' | 'minutos' | 'horas' | 'diario' | 'semanal';
  intervalo: number;
  mapeamento_campos: Record<string, string>;
  transformacoes?: Array<{
    campo: string;
    funcao: string;
    parametros?: any;
  }>;
  ativo: boolean;
  ultima_sincronizacao?: string;
  total_registros_sincronizados: number;
  total_erros: number;
}

// ==================== BACKUP AND RECOVERY SYSTEM INTERFACES ====================

export interface BackupConfig {
  id: number;
  nome: string;
  tipo: 'full' | 'incremental' | 'diferencial';
  origem: {
    tipo: 'database' | 'files' | 'system' | 'configuration';
    configuracao: Record<string, any>;
  };
  destino: {
    tipo: 'local' | 's3' | 'ftp' | 'cloud';
    configuracao: Record<string, any>;
  };
  frequencia: 'diario' | 'semanal' | 'mensal' | 'manual';
  horario_execucao: string;
  compressao: boolean;
  criptografia: boolean;
  retencao_dias: number;
  notificacao_email: string[];
  ativo: boolean;
  proxima_execucao?: string;
  ultima_execucao?: string;
  status_ultimo_backup: 'sucesso' | 'erro' | 'em_progresso';
  tamanho_ultimo_backup?: number;
  created_at: string;
  updated_at: string;
}

export interface BackupExecution {
  id: number;
  backup_config_id: number;
  tipo_backup: 'full' | 'incremental' | 'diferencial';
  data_inicio: string;
  data_fim?: string;
  status: 'iniciado' | 'em_progresso' | 'concluido' | 'falhou' | 'cancelado';
  tamanho_backup: number;
  arquivos_processados: number;
  arquivos_com_erro: number;
  tempo_execucao_segundos: number;
  log_execucao: string;
  caminho_backup: string;
  hash_verificacao?: string;
  erro_detalhes?: string;
  created_at: string;
}

export interface RestorePoint {
  id: number;
  backup_execution_id: number;
  nome: string;
  descricao?: string;
  data_criacao: string;
  tamanho_total: number;
  status: 'disponivel' | 'corrompido' | 'expirado';
  caminho_arquivos: string;
  metadados: {
    versao_sistema: string;
    versao_banco: string;
    total_tabelas: number;
    total_registros: number;
    configuracoes_inclusas: string[];
  };
  verificacao_integridade: {
    ultimo_check: string;
    status: 'ok' | 'erro';
    detalhes?: string;
  };
  created_at: string;
}

export interface RestoreOperation {
  id: number;
  restore_point_id: number;
  tipo_restore: 'completo' | 'seletivo' | 'configuracao';
  data_inicio: string;
  data_fim?: string;
  status: 'iniciado' | 'em_progresso' | 'concluido' | 'falhou' | 'cancelado';
  componentes_selecionados: string[];
  progresso_percentual: number;
  tempo_estimado_segundos?: number;
  log_operacao: string;
  erro_detalhes?: string;
  usuario_solicitante: string;
  aprovacao_requerida: boolean;
  aprovado_por?: string;
  aprovado_em?: string;
  created_at: string;
}

export interface BackupSchedule {
  id: number;
  nome: string;
  backup_configs: number[];
  tipo_agendamento: 'simples' | 'avancado';
  configuracao_cron?: string;
  configuracao_simples?: {
    frequencia: 'diario' | 'semanal' | 'mensal';
    horario: string;
    dias_semana?: number[];
    dia_mes?: number;
  };
  dependencias?: number[];
  timeout_minutos: number;
  max_tentativas: number;
  notificacao_config: {
    sucesso: boolean;
    erro: boolean;
    inicio: boolean;
    emails: string[];
  };
  ativo: boolean;
  proximo_agendamento?: string;
  created_at: string;
  updated_at: string;
}

export interface BackupStorage {
  id: number;
  nome: string;
  tipo: 'local' | 's3' | 'azure' | 'gcs' | 'ftp';
  configuracao: Record<string, any>;
  capacidade_total_gb: number;
  espaco_usado_gb: number;
  espaco_disponivel_gb: number;
  status: 'ativo' | 'inativo' | 'erro' | 'manutencao';
  velocidade_upload_mbps: number;
  velocidade_download_mbps: number;
  redundancia: boolean;
  criptografia_suportada: boolean;
  custo_por_gb?: number;
  regiao?: string;
  teste_conectividade: {
    ultimo_teste: string;
    status: 'ok' | 'erro';
    latencia_ms: number;
    detalhes?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BackupPolicy {
  id: number;
  nome: string;
  descricao?: string;
  tipo_dados: 'criticos' | 'importantes' | 'comuns';
  frequencia_minima: 'diario' | 'semanal' | 'mensal';
  retencao_politica: {
    diario: number;
    semanal: number;
    mensal: number;
    anual: number;
  };
  replicacao_geografica: boolean;
  criptografia_obrigatoria: boolean;
  compressao_obrigatoria: boolean;
  verificacao_integridade_frequencia: 'diario' | 'semanal' | 'mensal';
  aprovacao_restore: boolean;
  aprovadores: string[];
  tags: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackupMonitoring {
  id: number;
  nome: string;
  tipo_monitoramento: 'execucao' | 'armazenamento' | 'integridade' | 'performance';
  metrica_monitorada: string;
  threshold_warning: number;
  threshold_critical: number;
  unidade_medida: string;
  frequencia_verificacao_minutos: number;
  alertas_configurados: {
    email: string[];
    sms: string[];
    webhook?: string;
  };
  historico_alertas: Array<{
    timestamp: string;
    nivel: 'warning' | 'critical';
    valor_medido: number;
    mensagem: string;
    resolvido: boolean;
  }>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DisasterRecovery {
  id: number;
  nome: string;
  tipo_desastre: 'hardware' | 'software' | 'natural' | 'humano' | 'cyber';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  plano_recuperacao: {
    rto_minutos: number; // Recovery Time Objective
    rpo_minutos: number; // Recovery Point Objective
    procedimentos: Array<{
      ordem: number;
      titulo: string;
      descricao: string;
      responsavel: string;
      tempo_estimado_minutos: number;
      dependencias?: number[];
    }>;
    recursos_necessarios: string[];
    contatos_emergencia: Array<{
      nome: string;
      cargo: string;
      telefone: string;
      email: string;
    }>;
  };
  testes_realizados: Array<{
    data: string;
    resultado: 'sucesso' | 'falha' | 'parcial';
    tempo_recuperacao_minutos: number;
    observacoes: string;
    responsavel: string;
  }>;
  status: 'ativo' | 'inativo' | 'revisao';
  revisao_proxima: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSnapshot {
  id: number;
  nome: string;
  tipo: 'sistema' | 'aplicacao' | 'configuracao' | 'dados';
  descricao?: string;
  componentes_incluidos: string[];
  tamanho_total_mb: number;
  criado_por: string;
  criado_em: string;
  valido_ate?: string;
  status: 'criando' | 'disponivel' | 'corrompido' | 'expirado';
  caminho_storage: string;
  hash_verificacao: string;
  metadados: {
    versao_sistema: string;
    configuracoes_ativas: Record<string, any>;
    estatisticas_uso: Record<string, number>;
  };
  utilizado_em_restore: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BackupReport {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  estatisticas_gerais: {
    total_backups_executados: number;
    total_backups_sucesso: number;
    total_backups_falha: number;
    taxa_sucesso_percentual: number;
    volume_total_backup_gb: number;
    tempo_medio_backup_minutos: number;
  };
  performance_por_config: Array<{
    config_id: number;
    nome_config: string;
    execucoes: number;
    sucessos: number;
    falhas: number;
    tempo_medio_minutos: number;
    ultimo_backup: string;
    proximo_backup: string;
  }>;
  utilizacao_storage: Array<{
    storage_id: number;
    nome_storage: string;
    capacidade_gb: number;
    usado_gb: number;
    disponivel_gb: number;
    percentual_uso: number;
  }>;
  alertas_periodo: Array<{
    data: string;
    tipo: 'falha_backup' | 'espaco_baixo' | 'performance' | 'integridade';
    severidade: 'warning' | 'critical';
    descricao: string;
    resolvido: boolean;
  }>;
  recomendacoes: string[];
  proximas_manutencoes: Array<{
    data: string;
    tipo: 'limpeza' | 'verificacao' | 'atualizacao';
    descricao: string;
  }>;
}

// ==================== CONFIGURATION AND PERSONALIZATION SYSTEM INTERFACES ====================

export interface SystemConfiguration {
  id: number;
  nome: string;
  categoria: 'geral' | 'financeiro' | 'tecnico' | 'comunicacao' | 'integracao' | 'seguranca';
  chave: string;
  valor: any;
  tipo_valor: 'string' | 'number' | 'boolean' | 'json' | 'array';
  descricao?: string;
  valor_padrao: any;
  validacao?: {
    tipo: 'regex' | 'range' | 'enum' | 'custom';
    regra: any;
    mensagem_erro?: string;
  };
  requer_reinicio: boolean;
  nivel_acesso: 'publico' | 'operador' | 'admin' | 'super';
  grupo?: string;
  ordem?: number;
  visivel: boolean;
  editavel: boolean;
  historico_alteracoes: Array<{
    data: string;
    usuario: string;
    valor_anterior: any;
    valor_novo: any;
    motivo?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationTemplate {
  id: number;
  nome: string;
  descricao?: string;
  categoria: 'padrao' | 'custom' | 'industria' | 'regional';
  configuracoes: Record<string, any>;
  tags: string[];
  aplicavel_para: {
    tipo_empresa: string[];
    porte: string[];
    servicos: string[];
  };
  versao: string;
  autor: string;
  aprovado: boolean;
  aprovado_por?: string;
  aprovado_em?: string;
  downloads: number;
  avaliacao_media: number;
  total_avaliacoes: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: number;
  usuario_id: number;
  categoria: 'interface' | 'notificacoes' | 'relatorios' | 'workflow' | 'atalhos';
  preferencias: {
    tema?: 'claro' | 'escuro' | 'auto';
    idioma?: 'pt-BR' | 'en-US' | 'es-ES';
    timezone?: string;
    formato_data?: string;
    formato_hora?: string;
    notificacoes_email?: boolean;
    notificacoes_sms?: boolean;
    notificacoes_push?: boolean;
    dashboard_widgets?: Array<{
      id: string;
      posicao: { x: number; y: number };
      tamanho: { width: number; height: number };
      configuracao?: Record<string, any>;
    }>;
    menus_favoritos?: string[];
    atalhos_teclado?: Record<string, string>;
    filtros_salvos?: Record<string, any>;
    colunas_visiveis?: Record<string, string[]>;
    ordenacao_padrao?: Record<string, { campo: string; direcao: 'asc' | 'desc' }>;
  };
  dispositivo_especifico: boolean;
  dispositivo_id?: string;
  sincronizar_dispositivos: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  id: number;
  nome: string;
  nome_exibicao: string;
  entidade: 'cliente' | 'contrato' | 'produto' | 'servico' | 'fatura' | 'chamado';
  tipo: 'texto' | 'numero' | 'data' | 'boolean' | 'select' | 'multiselect' | 'arquivo' | 'json';
  configuracao: {
    obrigatorio: boolean;
    valor_padrao?: any;
    placeholder?: string;
    mascara?: string;
    validacao?: {
      tipo: 'regex' | 'funcao' | 'range';
      valor: any;
      mensagem_erro?: string;
    };
    opcoes?: Array<{ valor: any; label: string }>;
    multiplos_arquivos?: boolean;
    extensoes_permitidas?: string[];
    tamanho_maximo_mb?: number;
  };
  grupo?: string;
  ordem: number;
  visivel: boolean;
  editavel: boolean;
  pesquisavel: boolean;
  exibir_em_listagem: boolean;
  exibir_em_relatorios: boolean;
  permissoes: {
    visualizar: string[];
    editar: string[];
  };
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowCustomization {
  id: number;
  nome: string;
  descricao?: string;
  processo: 'atendimento' | 'cobranca' | 'instalacao' | 'manutencao' | 'cancelamento';
  tipo: 'sequencial' | 'paralelo' | 'condicional';
  etapas: Array<{
    id: string;
    nome: string;
    tipo: 'manual' | 'automatico' | 'aprovacao' | 'notificacao' | 'integracao';
    responsavel?: string;
    prazo_horas?: number;
    configuracao: {
      condicoes?: Array<{
        campo: string;
        operador: string;
        valor: any;
        logica?: 'and' | 'or';
      }>;
      acoes: Array<{
        tipo: string;
        parametros: Record<string, any>;
      }>;
      proxima_etapa?: string;
      etapas_alternativas?: Array<{
        condicao: any;
        etapa_id: string;
      }>;
    };
    notificacoes?: {
      inicio?: boolean;
      conclusao?: boolean;
      atraso?: boolean;
      destinatarios: string[];
    };
  }>;
  gatilhos: Array<{
    evento: string;
    condicoes?: any[];
  }>;
  variaveis?: Record<string, any>;
  metricas_acompanhamento: string[];
  ativo: boolean;
  versao: number;
  created_at: string;
  updated_at: string;
}

export interface BrandingConfiguration {
  id: number;
  nome: string;
  tipo: 'principal' | 'white_label' | 'parceiro';
  configuracao: {
    logo_principal?: string;
    logo_secundario?: string;
    favicon?: string;
    cores: {
      primaria: string;
      secundaria: string;
      terciaria?: string;
      sucesso: string;
      aviso: string;
      erro: string;
      info: string;
      texto_primario: string;
      texto_secundario: string;
      background: string;
    };
    fontes: {
      familia_principal: string;
      familia_secundaria?: string;
      tamanho_base: number;
      escala_tamanhos: number[];
    };
    estilos_customizados?: string;
    templates_email: {
      cabecalho?: string;
      rodape?: string;
      assinatura?: string;
      css_customizado?: string;
    };
    textos_interface: Record<string, string>;
    urls_customizadas: {
      portal_cliente?: string;
      app_mobile?: string;
      documentacao?: string;
      suporte?: string;
    };
  };
  dominio_aplicavel?: string;
  ativo: boolean;
  prioridade: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCustomization {
  id: number;
  nome: string;
  tipo: 'principal' | 'lateral' | 'contextual' | 'atalhos';
  perfil_aplicavel?: string[];
  estrutura: Array<{
    id: string;
    tipo: 'item' | 'grupo' | 'divisor';
    label: string;
    icone?: string;
    rota?: string;
    acao?: string;
    badge?: {
      tipo: 'contador' | 'texto' | 'status';
      valor: any;
      cor?: string;
    };
    permissao?: string;
    filhos?: any[];
    ordem: number;
    visivel: boolean;
    destaque?: boolean;
  }>;
  condicoes_exibicao?: Array<{
    tipo: 'permissao' | 'configuracao' | 'horario' | 'custom';
    valor: any;
  }>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportCustomization {
  id: number;
  nome: string;
  descricao?: string;
  tipo_relatorio: 'operacional' | 'financeiro' | 'tecnico' | 'gerencial' | 'custom';
  formato_saida: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  template: {
    tipo: 'predefinido' | 'custom';
    arquivo_template?: string;
    html_template?: string;
    configuracao_pagina?: {
      orientacao: 'retrato' | 'paisagem';
      tamanho: 'A4' | 'A3' | 'Letter' | 'Legal';
      margens: { top: number; right: number; bottom: number; left: number };
    };
  };
  dados: {
    fonte: 'query' | 'api' | 'procedure';
    query?: string;
    endpoint?: string;
    procedure?: string;
    parametros: Array<{
      nome: string;
      tipo: string;
      obrigatorio: boolean;
      valor_padrao?: any;
      label: string;
      validacao?: any;
    }>;
    transformacoes?: Array<{
      campo: string;
      funcao: string;
      parametros?: any[];
    }>;
  };
  secoes: Array<{
    id: string;
    tipo: 'cabecalho' | 'corpo' | 'rodape' | 'sumario' | 'grafico';
    titulo?: string;
    conteudo: any;
    condicional?: any;
    repetir?: boolean;
    quebra_pagina?: boolean;
  }>;
  agendamento?: {
    ativo: boolean;
    frequencia: string;
    horarios: string[];
    destinatarios: string[];
    anexar_arquivo: boolean;
    incluir_no_corpo: boolean;
  };
  permissoes: {
    visualizar: string[];
    executar: string[];
    editar: string[];
  };
  tags: string[];
  versao: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: number;
  nome: string;
  tipo: 'email' | 'sms' | 'push' | 'whatsapp';
  categoria: 'transacional' | 'marketing' | 'alerta' | 'sistema';
  evento_gatilho: string;
  assunto?: string;
  conteudo: {
    formato: 'texto' | 'html' | 'markdown';
    template: string;
    variaveis_disponiveis: string[];
  };
  configuracao: {
    prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
    tentativas_envio: number;
    intervalo_tentativas_minutos: number;
    horario_permitido?: {
      inicio: string;
      fim: string;
      dias_semana: number[];
    };
    rate_limit?: {
      max_por_usuario_dia: number;
      max_por_usuario_hora: number;
    };
  };
  personalizacao?: {
    segmentacao?: Array<{
      campo: string;
      operador: string;
      valor: any;
    }>;
    ab_testing?: {
      ativo: boolean;
      variantes: Array<{
        nome: string;
        peso: number;
        modificacoes: any;
      }>;
    };
  };
  anexos?: Array<{
    tipo: 'estatico' | 'dinamico';
    arquivo?: string;
    geracao?: {
      tipo: string;
      parametros: any;
    };
  }>;
  rastreamento: {
    abertura: boolean;
    cliques: boolean;
    conversao: boolean;
  };
  ativo: boolean;
  valido_ate?: string;
  created_at: string;
  updated_at: string;
}

export interface PortalCustomization {
  id: number;
  nome: string;
  tipo: 'cliente' | 'parceiro' | 'fornecedor';
  dominio: string;
  configuracao: {
    layout: {
      tipo: 'padrao' | 'custom';
      template?: string;
      grid_system?: string;
      responsivo: boolean;
    };
    funcionalidades: {
      segunda_via: boolean;
      historico_consumo: boolean;
      abertura_chamados: boolean;
      chat_online: boolean;
      base_conhecimento: boolean;
      indicacao_amigos: boolean;
      programa_fidelidade: boolean;
      marketplace: boolean;
      autoatendimento: string[];
    };
    integracao_redes_sociais: {
      facebook?: { app_id: string; permissions: string[] };
      google?: { client_id: string; scopes: string[] };
      twitter?: { api_key: string };
      linkedin?: { client_id: string };
    };
    seo: {
      titulo_padrao: string;
      descricao_padrao: string;
      palavras_chave: string[];
      meta_tags_customizadas?: Record<string, string>;
      sitemap_automatico: boolean;
      robots_txt?: string;
    };
    analytics: {
      google_analytics?: string;
      google_tag_manager?: string;
      facebook_pixel?: string;
      hotjar?: string;
      custom_scripts?: string[];
    };
    pwa: {
      habilitado: boolean;
      nome_app: string;
      icone_app: string;
      cor_tema: string;
      orientacao: 'portrait' | 'landscape' | 'any';
      offline_mode: boolean;
    };
  };
  restricoes_acesso?: {
    ips_permitidos?: string[];
    geolocalizacao?: {
      paises_permitidos?: string[];
      paises_bloqueados?: string[];
    };
    horario_acesso?: {
      inicio: string;
      fim: string;
      timezone: string;
    };
  };
  ativo: boolean;
  manutencao: boolean;
  mensagem_manutencao?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalizationConfig {
  id: number;
  idioma: string;
  codigo_iso: string;
  nome_nativo: string;
  direcao_texto: 'ltr' | 'rtl';
  traducoes: Record<string, string>;
  formatos: {
    data: {
      curta: string;
      media: string;
      longa: string;
      completa: string;
    };
    hora: {
      curta: string;
      media: string;
      longa: string;
    };
    numero: {
      separador_decimal: string;
      separador_milhar: string;
      casas_decimais_padrao: number;
    };
    moeda: {
      simbolo: string;
      codigo: string;
      posicao: 'antes' | 'depois';
      casas_decimais: number;
    };
    telefone: {
      codigo_pais: string;
      formato: string;
      exemplo: string;
    };
    endereco: {
      formato: string[];
      campos_obrigatorios: string[];
    };
  };
  calendario: {
    primeiro_dia_semana: number;
    feriados_nacionais: Array<{
      data: string;
      nome: string;
      tipo: 'nacional' | 'regional' | 'municipal';
    }>;
  };
  pluralizacao_regras: Array<{
    condicao: string;
    sufixo: string;
  }>;
  completo: boolean;
  revisado: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== AUDIT AND COMPLIANCE SYSTEM INTERFACES ====================

export interface AuditEvent {
  id: number;
  usuario_id?: number;
  usuario_nome?: string;
  ip_address: string;
  user_agent?: string;
  evento: string;
  categoria: 'sistema' | 'seguranca' | 'dados' | 'configuracao' | 'operacional' | 'financeiro';
  entidade_tipo?: string;
  entidade_id?: number;
  entidade_nome?: string;
  acao: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'access' | 'export' | 'import';
  detalhes: {
    descricao: string;
    dados_antes?: any;
    dados_depois?: any;
    parametros?: Record<string, any>;
    resultado?: 'sucesso' | 'falha' | 'parcial';
    tempo_execucao_ms?: number;
    observacoes?: string;
  };
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  origem: 'web' | 'api' | 'mobile' | 'sistema' | 'integracao';
  sessao_id?: string;
  transacao_id?: string;
  geolocation?: {
    pais: string;
    estado: string;
    cidade: string;
    latitude?: number;
    longitude?: number;
  };
  dispositivo?: {
    tipo: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    fingerprint?: string;
  };
  tags?: string[];
  timestamp: string;
  created_at: string;
}

export interface ComplianceRule {
  id: number;
  nome: string;
  descricao?: string;
  categoria: 'lgpd' | 'sarbanes' | 'hipaa' | 'iso27001' | 'pci' | 'gdpr' | 'custom';
  tipo: 'preventiva' | 'detectiva' | 'corretiva';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  condicoes: Array<{
    campo: string;
    operador: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex' | 'in' | 'between';
    valor: any;
    logica?: 'and' | 'or';
  }>;
  acoes: Array<{
    tipo: 'alerta' | 'bloqueio' | 'aprovacao' | 'log' | 'notificacao' | 'quarentena';
    parametros: Record<string, any>;
    automatica: boolean;
  }>;
  frequencia_verificacao: 'tempo_real' | 'horario' | 'diario' | 'semanal' | 'mensal' | 'manual';
  cronograma?: string;
  responsavel?: string;
  departamento?: string;
  data_vigencia_inicio: string;
  data_vigencia_fim?: string;
  excecoes?: Array<{
    condicao: any;
    justificativa: string;
    aprovado_por: string;
    valido_ate: string;
  }>;
  metricas: {
    total_verificacoes: number;
    total_violacoes: number;
    ultima_verificacao?: string;
    taxa_conformidade: number;
  };
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceViolation {
  id: number;
  regra_id: number;
  regra_nome: string;
  evento_id?: number;
  usuario_id?: number;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'detectada' | 'investigando' | 'mitigada' | 'resolvida' | 'falso_positivo';
  descricao: string;
  detalhes: {
    dados_violacao: any;
    contexto: Record<string, any>;
    impacto_estimado: string;
    evidencias?: Array<{
      tipo: 'screenshot' | 'log' | 'arquivo' | 'url' | 'texto';
      conteudo: string;
      metadata?: Record<string, any>;
    }>;
  };
  investigacao?: {
    responsavel: string;
    data_inicio: string;
    data_conclusao?: string;
    metodologia: string;
    descobertas: string;
    conclusoes: string;
    recomendacoes: string[];
  };
  acoes_corretivas: Array<{
    tipo: string;
    descricao: string;
    responsavel: string;
    prazo: string;
    status: 'pendente' | 'andamento' | 'concluida' | 'cancelada';
    data_conclusao?: string;
    resultado?: string;
  }>;
  impacto_negocio?: {
    financeiro?: number;
    operacional?: string;
    reputacional?: string;
    legal?: string;
  };
  notificacoes_enviadas: Array<{
    destinatario: string;
    canal: 'email' | 'sms' | 'push' | 'sistema';
    data_envio: string;
    status: 'enviado' | 'falha' | 'pendente';
  }>;
  tags?: string[];
  data_detectada: string;
  created_at: string;
  updated_at: string;
}

export interface DataRetentionPolicy {
  id: number;
  nome: string;
  descricao?: string;
  entidade_tipo: string;
  criterios_aplicacao: Array<{
    campo: string;
    operador: string;
    valor: any;
  }>;
  periodo_retencao: {
    tipo: 'dias' | 'meses' | 'anos';
    quantidade: number;
    inicio_contagem: 'criacao' | 'atualizacao' | 'inativacao' | 'custom';
    campo_referencia?: string;
  };
  acao_pos_retencao: 'deletar' | 'arquivar' | 'anonimizar' | 'notificar';
  configuracao_acao: {
    local_arquivo?: string;
    campos_anonimizar?: string[];
    backup_antes_acao?: boolean;
    confirmacao_manual?: boolean;
  };
  excecoes_legais: Array<{
    tipo: 'processo_legal' | 'investigacao' | 'regulatorio' | 'contratual';
    descricao: string;
    suspender_ate?: string;
    motivo: string;
    aprovado_por: string;
  }>;
  notificacoes: {
    avisos_previos: number[];
    responsaveis: string[];
    template_notificacao?: number;
  };
  metricas: {
    total_registros_aplicaveis: number;
    total_processados: number;
    total_deletados: number;
    total_arquivados: number;
    ultima_execucao?: string;
    proxima_execucao?: string;
  };
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccessControl {
  id: number;
  usuario_id: number;
  recurso_tipo: string;
  recurso_id?: number;
  permissoes: string[];
  restricoes?: {
    ip_range?: string[];
    horario_inicio?: string;
    horario_fim?: string;
    dias_semana?: number[];
    localizacao?: string[];
    dispositivos?: string[];
  };
  contexto_adicional?: {
    departamento?: string;
    projeto?: string;
    cliente?: string;
    nivel_aprovacao?: number;
  };
  temporario?: {
    data_inicio: string;
    data_fim: string;
    motivo: string;
    aprovado_por: string;
  };
  delegacao?: {
    pode_delegar: boolean;
    usuarios_delegados?: number[];
    nivel_max_delegacao?: number;
  };
  auditoria: {
    criado_por: string;
    data_criacao: string;
    ultima_modificacao: string;
    modificado_por: string;
    motivo_alteracao?: string;
  };
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrivacyRequest {
  id: number;
  tipo: 'acesso' | 'portabilidade' | 'retificacao' | 'exclusao' | 'oposicao' | 'restricao';
  solicitante: {
    nome: string;
    email: string;
    documento: string;
    telefone?: string;
    endereco?: string;
    relacao: 'titular' | 'representante_legal' | 'herdeiro' | 'procurador';
  };
  dados_solicitados: {
    categorias: string[];
    periodo_inicio?: string;
    periodo_fim?: string;
    sistemas_especificos?: string[];
    detalhamento?: string;
  };
  justificativa?: string;
  documentos_anexos?: Array<{
    nome: string;
    tipo: string;
    tamanho: number;
    url: string;
    verificado: boolean;
  }>;
  status: 'recebida' | 'em_analise' | 'em_processamento' | 'concluida' | 'rejeitada' | 'parcialmente_atendida';
  motivo_rejeicao?: string;
  responsavel_analise?: string;
  data_limite_resposta: string;
  processamento: {
    etapas_concluidas: string[];
    etapa_atual?: string;
    progresso_percentual: number;
    tempo_estimado_conclusao?: string;
    observacoes?: string;
  };
  resultado?: {
    dados_encontrados: boolean;
    sistemas_verificados: string[];
    acoes_realizadas: string[];
    arquivos_gerados?: Array<{
      nome: string;
      tipo: string;
      tamanho: number;
      url: string;
      senha_protegido: boolean;
    }>;
    resumo_execucao: string;
  };
  comunicacoes: Array<{
    data: string;
    tipo: 'email' | 'telefone' | 'carta' | 'presencial';
    remetente: string;
    destinatario: string;
    assunto: string;
    conteudo: string;
    anexos?: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export interface SecurityIncident {
  id: number;
  titulo: string;
  descricao: string;
  tipo: 'acesso_nao_autorizado' | 'vazamento_dados' | 'malware' | 'phishing' | 'engenharia_social' | 'vulnerabilidade' | 'indisponibilidade' | 'outros';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'detectado' | 'investigando' | 'contido' | 'mitigado' | 'resolvido' | 'fechado';
  origem_deteccao: 'automatico' | 'manual' | 'terceiros' | 'usuario' | 'auditoria';
  data_ocorrencia: string;
  data_deteccao: string;
  data_notificacao?: string;
  sistemas_afetados: string[];
  dados_comprometidos?: {
    tipos_dados: string[];
    quantidade_registros: number;
    titular_dados: string[];
    sensibilidade: 'publica' | 'interna' | 'confidencial' | 'restrita';
  };
  investigacao: {
    responsavel: string;
    equipe: string[];
    metodologia: string;
    cronograma: Array<{
      etapa: string;
      prazo: string;
      responsavel: string;
      status: 'pendente' | 'andamento' | 'concluida';
    }>;
    evidencias: Array<{
      tipo: string;
      descricao: string;
      localizacao: string;
      coletado_por: string;
      data_coleta: string;
      hash?: string;
    }>;
    descobertas: string;
    causa_raiz?: string;
  };
  resposta_incidente: {
    acoes_imediatas: string[];
    acoes_corretivas: Array<{
      acao: string;
      responsavel: string;
      prazo: string;
      status: 'pendente' | 'andamento' | 'concluida';
      resultado?: string;
    }>;
    comunicacao_interna: boolean;
    comunicacao_externa: boolean;
    orgaos_notificados?: string[];
    clientes_notificados?: boolean;
  };
  licoes_aprendidas?: {
    pontos_melhoria: string[];
    recomendacoes: string[];
    treinamentos_necessarios: string[];
    atualizacoes_procedimentos: string[];
  };
  impacto_estimado?: {
    financeiro?: number;
    operacional?: string;
    reputacional?: string;
    legal?: string;
    clientes_afetados?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AuditReport {
  id: number;
  titulo: string;
  tipo: 'interno' | 'externo' | 'regulatorio' | 'compliance' | 'seguranca';
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  escopo: {
    sistemas: string[];
    processos: string[];
    departamentos: string[];
    usuarios?: string[];
    categorias_eventos?: string[];
  };
  metodologia: string;
  executado_por: string;
  aprovado_por?: string;
  status: 'em_preparacao' | 'em_execucao' | 'em_revisao' | 'concluido' | 'aprovado';
  resultados: {
    total_eventos_auditados: number;
    violacoes_encontradas: number;
    recomendacoes: Array<{
      categoria: string;
      prioridade: 'baixa' | 'media' | 'alta' | 'critica';
      descricao: string;
      acao_sugerida: string;
      responsavel_sugerido?: string;
      prazo_sugerido?: string;
    }>;
    conformidade_geral: number;
    areas_criticas: string[];
    melhorias_identificadas: string[];
  };
  anexos?: Array<{
    nome: string;
    tipo: string;
    tamanho: number;
    url: string;
    descricao?: string;
  }>;
  distribuicao: Array<{
    destinatario: string;
    nivel_acesso: 'completo' | 'sumario' | 'executivo';
    data_envio?: string;
    confirmacao_leitura?: string;
  }>;
  plano_acao?: {
    acoes: Array<{
      recomendacao_id: number;
      acao: string;
      responsavel: string;
      prazo: string;
      status: 'pendente' | 'andamento' | 'concluida' | 'cancelada';
      observacoes?: string;
    }>;
    data_revisao: string;
    progresso_geral: number;
  };
  created_at: string;
  updated_at: string;
}