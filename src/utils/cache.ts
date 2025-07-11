import NodeCache from 'node-cache';
import { logger } from './logger.js';

export class CacheManager {
  private cache: NodeCache;
  private ttlSeconds: number;

  constructor(ttlSeconds?: number, maxKeys?: number) {
    this.ttlSeconds = ttlSeconds || parseInt(process.env.CACHE_TTL_SECONDS || '300');
    const maxKeysLimit = maxKeys || parseInt(process.env.CACHE_MAX_KEYS || '1000');

    this.cache = new NodeCache({
      stdTTL: this.ttlSeconds,
      maxKeys: maxKeysLimit,
      useClones: false,
      deleteOnExpire: true
    });

    this.cache.on('set', (key, value) => {
      logger.debug(`Cache SET: ${key}`);
    });

    this.cache.on('del', (key, value) => {
      logger.debug(`Cache DELETE: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache EXPIRED: ${key}`);
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      logger.debug(`Cache HIT: ${key}`);
    } else {
      logger.debug(`Cache MISS: ${key}`);
    }
    return value;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || this.ttlSeconds);
    if (success) {
      logger.debug(`Cache SET SUCCESS: ${key}`, { ttl: ttl || this.ttlSeconds });
    } else {
      logger.warn(`Cache SET FAILED: ${key}`);
    }
    return success;
  }

  delete(key: string): number {
    const deleted = this.cache.del(key);
    logger.debug(`Cache DELETE: ${key}`, { deleted });
    return deleted;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.flushAll();
    logger.debug('Cache cleared');
  }

  getStats(): {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
  } {
    return this.cache.getStats();
  }

  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  keys(): string[] {
    return this.cache.keys();
  }

  mget<T>(keys: string[]): { [key: string]: T } {
    return this.cache.mget(keys) as { [key: string]: T };
  }

  mset<T>(keyValueSet: Array<{ key: string; val: T; ttl?: number }>): boolean {
    return this.cache.mset(keyValueSet);
  }

  generateKey(...parts: (string | number)[]): string {
    return parts.map(part => String(part)).join(':');
  }
}