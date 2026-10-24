import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Determine if Upstash Redis credentials are available
const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redis: Redis | null = null;
if (hasUpstashConfig) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (err) {
    console.warn('⚠️ Failed to initialize Upstash Redis, falling back to memory store:', err);
  }
}

// In-Memory sliding window rate limiter fallback
class MemoryRateLimiter {
  private hits: Map<string, number[]> = new Map();

  async limit(key: string, maxRequests: number, windowMs: number): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = (this.hits.get(key) || []).filter((t) => t > windowStart);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const reset = oldest + windowMs;
      return { success: false, remaining: 0, reset };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    return {
      success: true,
      remaining: maxRequests - timestamps.length,
      reset: now + windowMs,
    };
  }
}

const memoryLimiter = new MemoryRateLimiter();

// Upstash limiters (if redis configured)
const upstashAuthLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

const upstashRegisterLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:register',
    })
  : null;

const upstashForgotLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:forgot',
    })
  : null;

const upstashContactLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:contact',
    })
  : null;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

// 1. Login / Admin Login: 5 attempts per 15 min per IP
export async function checkAuthRateLimit(ip: string): Promise<{ success: boolean; message?: string }> {
  if (upstashAuthLimiter) {
    const res = await upstashAuthLimiter.limit(ip);
    if (!res.success) {
      return { success: false, message: 'Too many login attempts. Please wait 15 minutes before trying again.' };
    }
    return { success: true };
  }

  const res = await memoryLimiter.limit(`auth:${ip}`, 5, 15 * 60 * 1000);
  if (!res.success) {
    return { success: false, message: 'Too many login attempts. Please wait 15 minutes before trying again.' };
  }
  return { success: true };
}

// 2. Register: 3 accounts per hour per IP
export async function checkRegisterRateLimit(ip: string): Promise<{ success: boolean; message?: string }> {
  if (upstashRegisterLimiter) {
    const res = await upstashRegisterLimiter.limit(ip);
    if (!res.success) {
      return { success: false, message: 'Too many accounts created from this IP. Please try again after an hour.' };
    }
    return { success: true };
  }

  const res = await memoryLimiter.limit(`reg:${ip}`, 3, 60 * 60 * 1000);
  if (!res.success) {
    return { success: false, message: 'Too many accounts created from this IP. Please try again after an hour.' };
  }
  return { success: true };
}

// 3. Forgot Password: 3 requests per hour per email/IP
export async function checkForgotPasswordRateLimit(identifier: string): Promise<{ success: boolean; message?: string }> {
  if (upstashForgotLimiter) {
    const res = await upstashForgotLimiter.limit(identifier);
    if (!res.success) {
      return { success: false, message: 'Too many password reset requests. Please check your inbox or wait 1 hour.' };
    }
    return { success: true };
  }

  const res = await memoryLimiter.limit(`forgot:${identifier}`, 3, 60 * 60 * 1000);
  if (!res.success) {
    return { success: false, message: 'Too many password reset requests. Please check your inbox or wait 1 hour.' };
  }
  return { success: true };
}

// 4. Contact Form: 5 submissions per hour per IP
export async function checkContactRateLimit(ip: string): Promise<{ success: boolean; message?: string }> {
  if (upstashContactLimiter) {
    const res = await upstashContactLimiter.limit(ip);
    if (!res.success) {
      return { success: false, message: 'Too many contact messages sent. Please wait before submitting another query.' };
    }
    return { success: true };
  }

  const res = await memoryLimiter.limit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!res.success) {
    return { success: false, message: 'Too many contact messages sent. Please wait before submitting another query.' };
  }
  return { success: true };
}
