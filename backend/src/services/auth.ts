import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {
  canAccessBlock,
  findDevAccountById,
  hasPermission,
  Permission,
  SafeAccount,
  sanitizeAccount,
} from './devAccounts.js';

const TOKEN_TTL_MS = Number(process.env.AUTH_TOKEN_TTL_MS || 8 * 60 * 60 * 1000);
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'ecopulse-local-dev-session-secret-change-before-production';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface AuthenticatedRequest extends Request {
  user?: SafeAccount;
  tokenPayload?: TokenPayload;
}

const revokedTokens = new Set<string>();

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

export function createSessionToken(account: SafeAccount): { token: string; expiresAt: string; expiresInSeconds: number } {
  const now = Date.now();
  const payload: TokenPayload = {
    sub: account.id,
    email: account.email,
    role: account.role,
    iat: now,
    exp: now + TOKEN_TTL_MS,
    jti: crypto.randomUUID(),
  };
  const header = { alg: 'HS256', typ: 'JWT' };
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const token = `${unsigned}.${sign(unsigned)}`;

  return {
    token,
    expiresAt: new Date(payload.exp).toISOString(),
    expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000),
  };
}

export function verifySessionToken(token: string): { account: SafeAccount; payload: TokenPayload } | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = sign(unsigned);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload.sub || !payload.exp || payload.exp <= Date.now() || revokedTokens.has(payload.jti)) {
    return null;
  }

  const account = findDevAccountById(payload.sub);
  if (!account || account.status !== 'ACTIVE') {
    return null;
  }

  return { account: sanitizeAccount(account), payload };
}

export function revokeToken(token: string): boolean {
  const verified = verifySessionToken(token);
  if (!verified) {
    return false;
  }
  revokedTokens.add(verified.payload.jti);
  return true;
}

export function getBearerToken(req: Request): string | null {
  const authHeader = req.header('authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  const verified = verifySessionToken(token);
  if (!verified) {
    res.status(401).json({ success: false, error: 'Invalid or expired session.' });
    return;
  }

  req.user = verified.account;
  req.tokenPayload = verified.payload;
  next();
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!hasPermission(req.user, permission)) {
      res.status(403).json({ success: false, error: 'Insufficient permission.' });
      return;
    }

    next();
  };
}

export function requireBlockAccess(getBlockId: (req: AuthenticatedRequest) => string | undefined) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const blockId = getBlockId(req);
    if (!blockId || typeof blockId !== 'string') {
      res.status(400).json({ success: false, error: 'blockId is required.' });
      return;
    }

    if (!canAccessBlock(req.user, blockId)) {
      res.status(403).json({ success: false, error: 'Block is outside the authenticated user scope.' });
      return;
    }

    next();
  };
}

export const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function enforceLoginRateLimit(email: string): boolean {
  const key = email.toLowerCase();
  const now = Date.now();
  const windowMs = 60_000;
  const maxAttempts = 8;
  const current = loginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= maxAttempts;
}

export function resetLoginRateLimit(email: string): void {
  loginAttempts.delete(email.toLowerCase());
}

