import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { SGPConfig, SGPResponse, PaginatedResponse, AuthCredentials } from '../types/sgp.js';
import { SGPAuthManager } from '../auth/auth.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { CacheManager } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

export class SGPClient {
  private httpClient: AxiosInstance;
  private authManager: SGPAuthManager;
  private rateLimiter: RateLimiter;
  private cache: CacheManager;
  private config: SGPConfig;

  constructor(config: SGPConfig) {
    this.config = config;
    this.authManager = new SGPAuthManager(config);
    this.rateLimiter = new RateLimiter();
    this.cache = new CacheManager();

    this.httpClient = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'User-Agent': 'SGP-MCP-Server/1.0.0',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.httpClient.interceptors.request.use(
      (config) => {
        logger.debug(`Making request to ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        logger.debug(`Response received: ${response.status} ${response.statusText}`);
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 429) {
          logger.warn('Rate limit exceeded, implementing backoff');
          await this.backoff(1000);
          return this.httpClient.request(error.config!);
        }
        
        logger.error(`Request failed: ${error.message}`, { 
          status: error.response?.status,
          data: error.response?.data 
        });
        return Promise.reject(error);
      }
    );
  }

  private async backoff(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    options: {
      authMethod?: 'basic' | 'token' | 'cpf_cnpj';
      credentials?: Partial<AuthCredentials>;
      useCache?: boolean;
      cacheKey?: string;
    } = {}
  ): Promise<SGPResponse<T>> {
    const { authMethod, credentials, useCache = false, cacheKey } = options;

    if (useCache && cacheKey) {
      const cached = this.cache.get<SGPResponse<T>>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return cached;
      }
    }

    const rateLimitKey = this.authManager.getRateLimitKey(authMethod);
    const maxRequests = this.authManager.getMaxRequestsPerMinute(authMethod);
    
    if (!this.rateLimiter.checkLimit(rateLimitKey, maxRequests)) {
      throw new Error(`Rate limit exceeded for ${authMethod || 'default'} authentication`);
    }

    try {
      const headers = this.authManager.getAuthHeaders(authMethod, credentials);
      const params = this.authManager.getAuthParams(authMethod, credentials);
      const authBody = this.authManager.getAuthBody(authMethod, credentials);

      let requestData = data;
      if (authBody && (method === 'POST' || method === 'PUT')) {
        requestData = { ...authBody, ...data };
      }

      const response: AxiosResponse<SGPResponse<T>> = await this.httpClient.request({
        method,
        url: endpoint,
        data: requestData,
        headers,
        params
      });

      const result = response.data;

      if (useCache && cacheKey && result.status === 'success') {
        this.cache.set(cacheKey, result);
        logger.debug(`Cached response for key: ${cacheKey}`);
      }

      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const sgpError: SGPResponse<T> = {
          status: 'error',
          message: error.response?.data?.message || error.message,
          data: null
        };
        return sgpError;
      }
      throw error;
    }
  }

  async get<T>(
    endpoint: string, 
    options?: {
      authMethod?: 'basic' | 'token' | 'cpf_cnpj';
      credentials?: Partial<AuthCredentials>;
      useCache?: boolean;
      cacheKey?: string;
    }
  ): Promise<SGPResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, options);
  }

  async post<T>(
    endpoint: string, 
    data?: any,
    options?: {
      authMethod?: 'basic' | 'token' | 'cpf_cnpj';
      credentials?: Partial<AuthCredentials>;
    }
  ): Promise<SGPResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, options);
  }

  async put<T>(
    endpoint: string, 
    data?: any,
    options?: {
      authMethod?: 'basic' | 'token' | 'cpf_cnpj';
      credentials?: Partial<AuthCredentials>;
    }
  ): Promise<SGPResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, options);
  }

  async delete<T>(
    endpoint: string,
    options?: {
      authMethod?: 'basic' | 'token' | 'cpf_cnpj';
      credentials?: Partial<AuthCredentials>;
    }
  ): Promise<SGPResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, options);
  }

  async getPaginated<T>(
    endpoint: string,
    params?: { page?: number; per_page?: number },
    options?: {
      authMethod?: 'basic' | 'token' | 'cpf_cnpj';
      credentials?: Partial<AuthCredentials>;
      useCache?: boolean;
    }
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const fullEndpoint = queryParams.toString() 
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint;

    const cacheKey = options?.useCache 
      ? `paginated_${endpoint}_${queryParams.toString()}`
      : undefined;

    return this.makeRequest<any>(
      'GET', 
      fullEndpoint, 
      undefined, 
      { ...options, cacheKey }
    ) as Promise<PaginatedResponse<T>>;
  }
}