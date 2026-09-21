import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errors.js';
import { privateApi } from '../integrations/private-api/client.js';

export type AuthContext = { uid: string; token: Record<string, unknown> };

declare global {
  namespace Express {
    interface Request { auth?: AuthContext }
  }
}

export async function verifyWithPrivateApi(token: string) {
  // Authentication belongs to the user's private API/data system.
  // Firebase is deliberately not used for normal Everything identity auth.
  return privateApi.get<{ user?: { id?: string; uid?: string }; id?: string; uid?: string }>('/auth/me', { headers: { 'X-User-Token': token } });
}


export function readSessionCookie(req: Request): string {
  const header = req.header('Cookie') || '';
  const value = header.split(';').map((part) => part.trim()).find((part) => part.startsWith('everything_session='));
  if (!value) return '';
  try { return decodeURIComponent(value.slice('everything_session='.length)); } catch { return ''; }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : readSessionCookie(req);
  if (!token) return next();
  try {
    const result = await verifyWithPrivateApi(token);
    const uid = result?.user?.id || result?.user?.uid || result?.id || result?.uid;
    if (uid) req.auth = { uid, token: result as Record<string, unknown> };
  } catch {
    // An invalid/unavailable identity provider never becomes authenticated.
  }
  next();
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (req.auth) return next();
  next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.'));
}

export async function verifySocketToken(token: string) {
  const result = await verifyWithPrivateApi(token);
  const uid = result?.user?.id || result?.user?.uid || result?.id || result?.uid;
  return uid ? { uid } : null;
}
