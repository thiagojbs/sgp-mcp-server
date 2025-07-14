import { logger } from './logger.js';

interface RateLimitEntry {
  timestamps: number[];
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultWindowMs: number;

  constructor(defaultWindowMs: number = 60000) {
    this.defaultWindowMs = defaultWindowMs;
  }

  checkLimit(
    key: string, 
    maxRequests: number = 100, 
    windowMs: number = this.defaultWindowMs
  ): boolean {
    const now = Date.now();
    
    if (!this.limits.has(key)) {
      this.limits.set(key, {
        timestamps: [],
        windowMs,
        maxRequests
      });
    }

    const entry = this.limits.get(key)!;
    
    const windowStart = now - windowMs;
    entry.timestamps = entry.timestamps.filter(timestamp => timestamp > windowStart);

    if (entry.timestamps.length >= maxRequests) {
      logger.warn(`Rate limit exceeded for key: ${key}`, {
        current: entry.timestamps.length,
        max: maxRequests,
        windowMs
      });
      return false;
    }

    entry.timestamps.push(now);
    entry.windowMs = windowMs;
    entry.maxRequests = maxRequests;

    logger.debug(`Rate limit check passed for key: ${key}`, {
      current: entry.timestamps.length,
      max: maxRequests
    });

    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const now = Date.now();
    const windowStart = now - entry.windowMs;
    const validTimestamps = entry.timestamps.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, entry.maxRequests - validTimestamps.length);
  }

  getNextResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || entry.timestamps.length === 0) return Date.now();

    return entry.timestamps[0] + entry.windowMs;
  }

  clearLimit(key: string): void {
    this.limits.delete(key);
    logger.debug(`Cleared rate limit for key: ${key}`);
  }

  clearAllLimits(): void {
    this.limits.clear();
    logger.debug('Cleared all rate limits');
  }
}