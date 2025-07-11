import { AuthMethod, AuthCredentials, SGPConfig } from '../types/sgp.js';
import { logger } from '../utils/logger.js';

export class SGPAuthManager {
  private config: SGPConfig;
  private preferredMethod: AuthMethod;

  constructor(config: SGPConfig) {
    this.config = config;
    this.preferredMethod = this.determinePreferredAuth();
  }

  private determinePreferredAuth(): AuthMethod {
    if (this.config.apiToken) {
      return 'token';
    } else if (this.config.username && this.config.password) {
      return 'basic';
    } else {
      return 'cpf_cnpj';
    }
  }

  getAuthHeaders(method?: AuthMethod, credentials?: Partial<AuthCredentials>): Record<string, string> {
    const authMethod = method || this.preferredMethod;
    
    switch (authMethod) {
      case 'basic':
        return this.getBasicAuthHeaders(credentials);
      case 'token':
        return this.getTokenAuthHeaders(credentials);
      case 'cpf_cnpj':
        return this.getCpfCnpjAuthHeaders();
      default:
        throw new Error(`Unsupported authentication method: ${authMethod}`);
    }
  }

  private getBasicAuthHeaders(credentials?: Partial<AuthCredentials>): Record<string, string> {
    const username = credentials?.username || this.config.username;
    const password = credentials?.password || this.config.password;

    if (!username || !password) {
      throw new Error('Username and password are required for basic authentication');
    }

    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    logger.debug('Using basic authentication');
    
    return {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json'
    };
  }

  private getTokenAuthHeaders(credentials?: Partial<AuthCredentials>): Record<string, string> {
    const token = credentials?.token || this.config.apiToken;
    const app = credentials?.app || this.config.appName || 'sgp-mcp-server';

    if (!token) {
      throw new Error('API token is required for token authentication');
    }

    logger.debug('Using token authentication');
    
    return {
      'Content-Type': 'application/json'
    };
  }

  private getCpfCnpjAuthHeaders(): Record<string, string> {
    logger.debug('Using CPF/CNPJ authentication');
    
    return {
      'Content-Type': 'application/json'
    };
  }

  getAuthParams(method?: AuthMethod, credentials?: Partial<AuthCredentials>): Record<string, string> {
    const authMethod = method || this.preferredMethod;
    
    if (authMethod === 'token') {
      const token = credentials?.token || this.config.apiToken;
      const app = credentials?.app || this.config.appName || 'sgp-mcp-server';
      
      if (!token) {
        throw new Error('API token is required for token authentication');
      }
      
      return {
        token,
        app
      };
    }
    
    return {};
  }

  getAuthBody(method?: AuthMethod, credentials?: Partial<AuthCredentials>): Record<string, any> | null {
    const authMethod = method || this.preferredMethod;
    
    if (authMethod === 'cpf_cnpj') {
      const cpfcnpj = credentials?.cpfcnpj;
      const senha = credentials?.senha;
      
      if (!cpfcnpj || !senha) {
        throw new Error('CPF/CNPJ and senha are required for CPF/CNPJ authentication');
      }
      
      return {
        cpfcnpj,
        senha
      };
    }
    
    return null;
  }

  getRateLimitKey(method?: AuthMethod): string {
    const authMethod = method || this.preferredMethod;
    return `rate_limit_${authMethod}`;
  }

  getMaxRequestsPerMinute(method?: AuthMethod): number {
    const authMethod = method || this.preferredMethod;
    
    switch (authMethod) {
      case 'basic':
        return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_BASIC || '100');
      case 'token':
        return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_TOKEN || '300');
      case 'cpf_cnpj':
        return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_CPF_CNPJ || '50');
      default:
        return 100;
    }
  }

  validateCredentials(method?: AuthMethod, credentials?: Partial<AuthCredentials>): boolean {
    const authMethod = method || this.preferredMethod;
    
    switch (authMethod) {
      case 'basic':
        const username = credentials?.username || this.config.username;
        const password = credentials?.password || this.config.password;
        return !!(username && password);
        
      case 'token':
        const token = credentials?.token || this.config.apiToken;
        return !!token;
        
      case 'cpf_cnpj':
        return !!(credentials?.cpfcnpj && credentials?.senha);
        
      default:
        return false;
    }
  }
}