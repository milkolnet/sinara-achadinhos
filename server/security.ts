import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// ==========================================
// PASSWORD HASHING (PBKDF2-SHA512 with SALT)
// ==========================================
const PBKDF2_ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('A senha informada é inválida.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return `pbkdf2:${salt}:${PBKDF2_ITERATIONS}:${DIGEST}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2') {
    return false;
  }

  const [, salt, iterStr, digest, originalKeyHex] = parts;
  const iterations = parseInt(iterStr, 10);
  if (isNaN(iterations) || iterations < 10000) {
    return false;
  }

  try {
    const originalKey = Buffer.from(originalKeyHex, 'hex');
    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, originalKey.length, digest);
    if (derivedKey.length !== originalKey.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, originalKey);
  } catch {
    return false;
  }
}

// ==========================================
// IP HASHING (LGPD / Privacy Protection)
// ==========================================
export function hashClientIp(ip: string): string {
  const salt = process.env.JWT_SECRET || 'sinara_privacy_ip_salt';
  return crypto.createHmac('sha256', salt).update(ip || 'unknown').digest('hex').slice(0, 16);
}

// ==========================================
// IN-MEMORY RATE LIMITER
// ==========================================
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.baseUrl || ''}${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', options.max - 1);
      next();
      return;
    }

    if (record.count >= options.max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.status(429).json({
        error: 'Muitas requisições',
        message: options.message,
        retryAfterSeconds: retryAfterSec,
      });
      return;
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - record.count));
    next();
  };
}

// Rate limiters for critical endpoints
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts per IP in 15 mins
  message: 'Muitas tentativas de login incorretas. Por segurança, tente novamente em alguns minutos.',
});

export const linkAnalyzerRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 analyses per min
  message: 'Limite de análise de links atingido para este minuto. Aguarde instantes.',
});

export const clickTrackingRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // max 120 clicks per min
  message: 'Limite de registro de cliques atingido.',
});

// ==========================================
// SECURITY HEADERS MIDDLEWARE
// ==========================================
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Allow framing only from same origin
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // XSS protection legacy header
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Disable dangerous browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

// ==========================================
// CORS MIDDLEWARE
// ==========================================
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  const reqOrigin = req.headers.origin;

  if (allowedOrigin === '*') {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin || '*');
  } else {
    const allowedList = allowedOrigin.split(',').map((o) => o.trim());
    if (reqOrigin && allowedList.includes(reqOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
