/**
 * Cloudflare Workers specific types
 */

// Cloudflare Workers KV types
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }>;
}

// Cloudflare Workers execution context
export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

// Worker environment interface
export interface WorkerEnv {
  SGP_CACHE?: KVNamespace;
  SGP_USERNAME?: string;
  SGP_PASSWORD?: string;
  SGP_API_TOKEN?: string;
  SGP_APP_NAME?: string;
  SGP_BASE_URL?: string;
  SGP_TIMEOUT?: string;
}

// HTTP method type
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

// Request with additional Cloudflare properties
export interface CloudflareRequest extends Request {
  cf?: {
    country?: string;
    colo?: string;
    [key: string]: any;
  };
}

// Response with CORS helpers
export interface CloudflareResponse extends Response {
  headers: Headers;
}

// Rate limit entry
export interface RateLimitEntry {
  count: number;
  resetTime: number;
}