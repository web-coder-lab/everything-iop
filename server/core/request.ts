import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const candidate = String(req.header('X-Request-Id') || '');
  const id = /^[A-Za-z0-9._:-]{8,80}$/.test(candidate) ? candidate : randomUUID();
  res.setHeader('X-Request-Id', id);
  res.locals.requestId = id;
  next();
}

export function requestIdOf(res: Response) {
  return String(res.locals.requestId || randomUUID());
}
