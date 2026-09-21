import crypto from 'node:crypto';
import { Router, type Request, type Response, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { env, requiredIntegrationStatus } from '../config/env.js';
import { AppError, errorPayload } from '../core/errors.js';
import { privateApi } from '../integrations/private-api/client.js';
import { paymentGateway } from '../integrations/payments/gateway.js';

export const apiRouter = Router();

const coinWriteLimit = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many Coin operations. Please try again later.' } } });
const uploadLimit = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many uploads. Please try again later.' } } });
const authLimit = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Please try again later.' } } });
const otpLimit = rateLimit({ windowMs: 10 * 60_000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many verification attempts. Please try again later.' } } });

const publicHealth = (req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', service: 'everything-node', version: 'v1' }, meta: { requestId: String(res.locals.requestId || '') } });
};

apiRouter.get('/health/live', publicHealth);
apiRouter.get('/health/ready', (_req, res) => {
  const integrations = requiredIntegrationStatus();
  // The app itself is ready even before optional external integrations are configured.
  // The response explicitly exposes readiness of each integration without exposing secrets.
  res.json({
    success: true,
    data: { status: 'ready', integrations },
    meta: { requestId: String(res.locals.requestId || '') },
  });
});

apiRouter.get('/integration/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      privateApi: requiredIntegrationStatus().privateApi ? 'configured' : 'not_configured',
      firebase: requiredIntegrationStatus().firebase ? 'configured' : 'not_configured',
      paymentGateway: requiredIntegrationStatus().payments ? 'configured' : 'not_configured',
    },
    meta: { requestId: String(res.locals.requestId || '') },
  });
});

// Only application-owned resource families are proxyable. This prevents turning the Node
// server into an arbitrary URL/path proxy when the private API is connected later.
apiRouter.use('/auth/login', authLimit);
apiRouter.use('/auth/register', authLimit);
apiRouter.use('/auth/password-reset', authLimit);
apiRouter.use('/auth/signup/otp/request', otpLimit);
apiRouter.use('/auth/signup/otp/verify', otpLimit);

const ALLOWED_FAMILIES = new Set([
  'auth', 'users', 'profiles', 'feed', 'posts', 'reels', 'videos', 'stories', 'live',
  'conversations', 'communities', 'channels', 'events', 'products', 'seller', 'wallet', 'coins',
  'subscriptions', 'creator', 'business', 'ads', 'developer', 'bots', 'notifications',
  'search', 'safety', 'settings', 'media', 'uploads', 'html', 'details', 'activity', 'data',
]);

// Only these resource families are intentionally public for GET/HEAD. Every other family
// requires a validated server session even for reads. The private API remains authoritative.
const PUBLIC_READ_FAMILIES = new Set(['feed', 'posts', 'reels', 'videos', 'stories', 'live', 'communities', 'events', 'products', 'search']);
const SAFE_PATH = /^\/[A-Za-z0-9._~!$&'()*+,;=:@%\-/]*$/;

function isAllowedPath(path: string) {
  if (!SAFE_PATH.test(path) || path.includes('..') || path.includes('\\')) return false;
  const family = path.split('/')[1] || '';
  return ALLOWED_FAMILIES.has(family);
}

function cookieToken(req: Request) {
  const header = req.header('Cookie') || '';
  const value = header.split(';').map((part) => part.trim()).find((part) => part.startsWith('everything_session='));
  if (!value) return '';
  try { return decodeURIComponent(value.slice('everything_session='.length)); } catch { return ''; }
}

function userToken(req: Request) {
  const header = req.header('Authorization');
  return header?.startsWith('Bearer ') ? header.slice(7).trim() : cookieToken(req);
}

function setSessionCookie(res: Response, token: string) {
  const secure = env.nodeEnv === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `everything_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=2592000`);
}

function clearSessionCookie(res: Response) {
  const secure = env.nodeEnv === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `everything_session=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`);
}

function uploadSignatureMatches(contentType: string, body: Buffer) {
  if (contentType === 'image/png') return body.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (contentType === 'image/jpeg') return body.subarray(0, 3).equals(Buffer.from([0xff,0xd8,0xff]));
  if (contentType === 'image/webp') return body.subarray(0, 4).toString('ascii') === 'RIFF' && body.subarray(8, 12).toString('ascii') === 'WEBP';
  if (contentType === 'video/mp4') return body.subarray(4, 8).toString('ascii') === 'ftyp';
  if (contentType === 'audio/mpeg' || contentType === 'audio/mp3') return body.subarray(0, 3).toString('ascii') === 'ID3' || (body[0] === 0xff && (body[1] & 0xe0) === 0xe0);
  if (contentType === 'audio/wav') return body.subarray(0, 4).toString('ascii') === 'RIFF' && body.subarray(8, 12).toString('ascii') === 'WAVE';
  if (contentType === 'audio/ogg') return body.subarray(0, 4).toString('ascii') === 'OggS';
  if (contentType === 'audio/webm') return body.subarray(0, 4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
  return false;
}

function bodyForPrivateApi(req: Request) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (req.body === undefined || req.body === null || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) return undefined;
  return JSON.stringify(req.body);
}

async function proxyRequest(req: Request, res: Response, next: NextFunction) {
  if (!isAllowedPath(req.path)) return next(new AppError(404, 'ROUTE_NOT_FOUND', 'API route not found.'));
  const isPublicAuth = req.method === 'POST' && /^\/auth\/(login|register|signup\/otp\/(request|verify)|password-reset)$/.test(req.path);
  const family = req.path.split('/')[1] || '';
  const isPublicRead = ['GET', 'HEAD'].includes(req.method) && PUBLIC_READ_FAMILIES.has(family);
  // Authentication is mandatory for every protected read and every write. Public reads
  // are deliberately narrow and still inherit the private API's resource authorization.
  if (!isPublicAuth && !isPublicRead && !req.auth) {
    return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.'));
  }
  const token = userToken(req);
  const headers: Record<string, string> = {};
  if (token) headers['X-User-Token'] = token;
  const contentType = req.header('Content-Type');
  if (contentType) headers['Content-Type'] = contentType;
  const accept = req.header('Accept');
  if (accept) headers.Accept = accept;
  try {
    const path = `${req.path}${req.originalUrl.includes('?') ? `?${req.originalUrl.split('?')[1]}` : ''}`;
    const body = bodyForPrivateApi(req);
    let data: unknown;
    switch (req.method) {
      case 'GET':
      case 'HEAD':
        data = await privateApi.get(path, { method: req.method, headers });
        break;
      case 'POST':
        if (Buffer.isBuffer(body)) {
          data = await privateApi.upload(path, body, contentType || 'application/octet-stream', headers);
        } else {
          data = await privateApi.post(path, body === undefined ? {} : JSON.parse(String(body)), headers);
        }
        break;
      case 'PATCH':
        data = await privateApi.patch(path, body === undefined ? {} : JSON.parse(String(body)), headers);
        break;
      case 'PUT':
        data = await privateApi.put(path, body === undefined ? {} : JSON.parse(String(body)), headers);
        break;
      case 'DELETE':
        data = await privateApi.delete(path, headers);
        break;
      default:
        return next(new AppError(405, 'METHOD_NOT_ALLOWED', 'HTTP method is not supported for this route.'));
    }
    if ((req.path === '/auth/login' || req.path === '/auth/register') && data && typeof data === 'object' && typeof (data as any).token === 'string') {
      setSessionCookie(res, String((data as any).token));
      // Never return the bearer/session credential to browser JavaScript. The HttpOnly
      // cookie is the browser session boundary; Socket.IO also authenticates from it.
      const sanitized = { ...(data as Record<string, unknown>) };
      delete sanitized.token;
      data = sanitized;
    }
    if (req.path === '/auth/logout' || req.path === '/auth/logout-all') clearSessionCookie(res);
    res.json({ success: true, data, meta: { requestId: String(res.locals.requestId || '') } });
  } catch (error) {
    next(error);
  }
}

// Payment webhook is deliberately isolated from the generic proxy.
// Configure PAYMENT_WEBHOOK_SECRET before enabling it. The gateway-specific event mapping
// can then be implemented inside PaymentGateway.handleWebhook without exposing secrets to the client.
apiRouter.post('/payments/webhook', async (req, res, next) => {
  try {
    if (!env.paymentWebhookSecret) throw new AppError(503, 'PAYMENT_GATEWAY_NOT_CONFIGURED', 'Payment gateway webhook is not configured yet.');
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
    const signature = req.header('X-Webhook-Signature') || req.header('X-Payment-Signature') || '';
    if (!signature) throw new AppError(401, 'INVALID_WEBHOOK_SIGNATURE', 'Webhook signature is required.');
    const expected = crypto.createHmac('sha256', env.paymentWebhookSecret).update(raw).digest('hex');
    const supplied = signature.replace(/^sha256=/i, '').trim();
    const valid = supplied.length === expected.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
    if (!valid) throw new AppError(401, 'INVALID_WEBHOOK_SIGNATURE', 'Webhook signature is invalid.');
    const result = await paymentGateway.handleWebhook(raw, req.headers);
    res.status(202).json({ success: true, data: result, meta: { requestId: String(res.locals.requestId || '') } });
  } catch (error) {
    next(error);
  }
});

// Binary media uploads use a dedicated route instead of the generic JSON proxy.
// The server enforces authentication, a MIME allowlist and the configured byte limit.
apiRouter.post('/media/upload', uploadLimit, async (req, res, next) => {
  try {
    if (!req.auth) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw new AppError(400, 'EMPTY_UPLOAD', 'Upload body is empty.');
    const contentType = String(req.header('Content-Type') || '').split(';', 1)[0].toLowerCase();
    const allowed = new Set(['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm']);
    if (!allowed.has(contentType)) throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'This media type is not allowed.');
    if (!uploadSignatureMatches(contentType, req.body)) throw new AppError(415, 'MEDIA_SIGNATURE_MISMATCH', 'The uploaded file does not match its declared media type.');
    const result = await privateApi.upload('/media/upload', req.body, contentType, { 'X-User-Token': userToken(req) });
    res.status(201).json({ success: true, data: result, meta: { requestId: String(res.locals.requestId || '') } });
  } catch (error) { next(error); }
});

// Financial-adjacent Coin messages are explicit routes so the Node gateway owns the
// request contract and never accepts an ownerId or balance from the client. The private
// API remains authoritative for balance, content ownership and the atomic transaction.
apiRouter.post('/coins/messages', coinWriteLimit, async (req, res, next) => {
  try {
    if (!req.auth) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
    const { surfaceType, surfaceId, amount, message, parentId } = req.body || {};
    if (!['post', 'reel', 'video', 'live'].includes(surfaceType) || typeof surfaceId !== 'string' || !/^[A-Za-z0-9:_-]{1,160}$/.test(surfaceId)) {
      throw new AppError(400, 'INVALID_COIN_SURFACE', 'A valid coin message surface is required.');
    }
    if (!Number.isInteger(amount) || amount <= 0 || amount > 1000000) throw new AppError(400, 'INVALID_COIN_AMOUNT', 'Coin amount is invalid.');
    if (typeof message !== 'string' || message.trim().length < 1 || message.length > 240) throw new AppError(400, 'INVALID_COIN_MESSAGE', 'Coin message must be 1-240 characters.');
    if (parentId !== undefined && (typeof parentId !== 'string' || !/^[A-Za-z0-9:_-]{1,160}$/.test(parentId))) throw new AppError(400, 'INVALID_PARENT_ID', 'Parent message ID is invalid.');
    const data = await privateApi.post('/coins/messages', { surfaceType, surfaceId, amount, message: message.trim(), parentId, pin: true }, { 'X-User-Token': userToken(req) });
    res.status(201).json({ success: true, data, meta: { requestId: String(res.locals.requestId || '') } });
  } catch (error) { next(error); }
});

apiRouter.patch('/coins/messages/:messageId/read', coinWriteLimit, async (req, res, next) => {
  try {
    if (!req.auth) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
    const id = req.params.messageId;
    if (!/^[A-Za-z0-9:_-]{1,160}$/.test(id)) throw new AppError(400, 'INVALID_MESSAGE_ID', 'Invalid coin message ID.');
    const data = await privateApi.patch(`/coins/messages/${encodeURIComponent(id)}/read`, { read: true }, { 'X-User-Token': userToken(req) });
    res.json({ success: true, data, meta: { requestId: String(res.locals.requestId || '') } });
  } catch (error) { next(error); }
});

// Generic application API gateway. The allowlist above is the contract boundary.
apiRouter.all('*', proxyRequest);

export function apiErrorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = String(res.locals.requestId || req.header('X-Request-Id') || crypto.randomUUID());
  const { status, body } = errorPayload(error, requestId);
  res.status(status).json(body);
}
