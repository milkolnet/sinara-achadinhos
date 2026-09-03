import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { AdminUser } from '../src/types';
import { hashPassword, verifyPassword } from './security';

const isProduction = process.env.NODE_ENV === 'production';

// Ephemeral dev fallback (generated freshly on boot if dev didn't supply env)
// NEVER uses hardcoded default passwords like "admin" or "achadinhos2026"
let devAutoSecret: string | null = null;
let devAutoPasswordHash: string | null = null;
let devAutoUsername = 'curadora';

export function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET;
  if (isProduction) {
    if (!envSecret || envSecret.length < 24 || envSecret.includes('change_in_production') || envSecret.includes('secret_production')) {
      throw new Error('[FATAL SECURITY] Em produção, a variável JWT_SECRET deve ser configurada com no mínimo 24 caracteres aleatórios e seguros!');
    }
    return envSecret;
  }

  if (envSecret && envSecret.length >= 8) {
    return envSecret;
  }

  if (!devAutoSecret) {
    devAutoSecret = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️ [DEV AUTH] Variável JWT_SECRET não configurada no .env. Gerado segredo de sessão efêmero.');
  }
  return devAutoSecret;
}

export function getAdminCredentialsHash(): { username: string; passwordHash: string } {
  const envUser = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const envPass = process.env.ADMIN_PASSWORD?.trim();

  if (isProduction) {
    if (!envPass || envPass.length < 8) {
      throw new Error('[FATAL SECURITY] Em produção, ADMIN_PASSWORD deve ser definida com no mínimo 8 caracteres no ambiente!');
    }
    if (envPass === 'admin' || envPass === 'admin123' || envPass === 'achadinhos2026' || envPass === 'password') {
      throw new Error('[FATAL SECURITY] Senha administrativa insegura detectada! Troque ADMIN_PASSWORD no ambiente.');
    }
    const username = envUser || 'admin';
    return {
      username,
      passwordHash: hashPassword(envPass),
    };
  }

  // Development mode:
  if (envPass && envPass.length > 0) {
    return {
      username: envUser || 'admin',
      passwordHash: hashPassword(envPass),
    };
  }

  // Fallback for local dev when .env was not populated yet
  if (!devAutoPasswordHash) {
    const generatedPass = crypto.randomBytes(6).toString('hex'); // 12-char random
    devAutoUsername = envUser || 'curadora';
    devAutoPasswordHash = hashPassword(generatedPass);
    console.warn(`\n======================================================`);
    console.warn(`🔑 [DEV CREDENCIAIS TEMPORÁRIAS GERADAS PARA DESENVOLVIMENTO]`);
    console.warn(`   Usuário: ${devAutoUsername}`);
    console.warn(`   Senha:   ${generatedPass}`);
    console.warn(`   Para definir sua própria senha permanente, configure:`);
    console.warn(`   ADMIN_USERNAME e ADMIN_PASSWORD no arquivo .env`);
    console.warn(`======================================================\n`);
  }

  return {
    username: devAutoUsername,
    passwordHash: devAutoPasswordHash,
  };
}

export interface TokenPayload {
  username: string;
  role: 'super_admin' | 'admin';
  exp: number; // Unix epoch seconds
}

export function generateToken(user: AdminUser): string {
  const secret = getJwtSecret();
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; // 7 days
  const payload: TokenPayload = {
    username: user.username,
    role: user.role,
    exp,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const secret = getJwtSecret();

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  if (signature.length !== expectedSig.length) return null;
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );

  if (!isMatch) return null;

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(username: string, password: string): AdminUser | null {
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return null;
  }

  const u = username.trim().toLowerCase();
  const p = password.trim();

  try {
    const configured = getAdminCredentialsHash();

    // Constant-time comparison on username
    const uInputBuf = Buffer.from(u);
    const uTargetBuf = Buffer.from(configured.username.toLowerCase());
    const isUserMatch =
      uInputBuf.length === uTargetBuf.length && crypto.timingSafeEqual(uInputBuf, uTargetBuf);

    if (!isUserMatch) {
      // Run dummy verify to avoid timing attack leakage
      verifyPassword(p, 'pbkdf2:0000000000000000:100000:sha512:00000000000000000000000000000000');
      return null;
    }

    // Secure PBKDF2 hash verification
    const isPassValid = verifyPassword(p, configured.passwordHash);
    if (!isPassValid) {
      return null;
    }

    return {
      username: configured.username,
      name: 'Sinara (Administradora)',
      role: 'super_admin',
    };
  } catch (err: any) {
    console.error('[AUTH ERROR]', err.message);
    return null;
  }
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Não autorizado',
      message: 'Token de autenticação ausente ou inválido. Faça login no painel administrativo.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      error: 'Sessão expirada',
      message: 'Sua sessão administrativa expirou. Por favor, faça login novamente.',
    });
    return;
  }

  (req as any).adminUser = payload;
  next();
}
