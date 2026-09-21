import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { requestId } from './core/request.js';
import { optionalAuth } from './core/auth.js';
import { apiRouter, apiErrorHandler } from './routes/api.js';
import { privateApi } from './integrations/private-api/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();
if (env.trustProxy) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  noSniff: true,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
const corsOrigins = env.corsOrigin.split(',').map((v) => v.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin) || (env.nodeEnv !== 'production' && corsOrigins.includes('*'))) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id', 'X-Webhook-Signature', 'X-Payment-Signature', 'X-Event-Id'],
};
// Same-origin deployments do not need CORS headers. When no explicit trusted origins are
// configured, skip the CORS middleware entirely instead of accidentally allowing every origin.
if (corsOrigins.length > 0) app.use(cors(corsOptions));
app.use(rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false, skip: (req) => req.path === '/api/v1/health/live' }));
// Raw bodies are required for cryptographic payment-webhook verification and binary media proxying.
app.use('/api/v1/payments/webhook', express.raw({ type: '*/*', limit: '256kb' }));
app.use('/api/v1/media/upload', express.raw({ type: '*/*', limit: `${env.privateApiUploadMaxMb}mb` }));
app.use('/api/v1/uploads', express.raw({ type: '*/*', limit: `${env.privateApiUploadMaxMb}mb` }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));
app.use((req, res, next) => { if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store'); next(); });
app.use(requestId);
app.use(optionalAuth);

app.use('/api/v1', apiRouter);

const clientDist = path.resolve(root, env.clientDist);
app.use(express.static(clientDist, { index: 'index.html' }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});
app.use(apiErrorHandler);

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  ...(corsOrigins.length > 0 ? { cors: corsOptions } : {}),
});

io.use(async (socket, next) => {
  const authToken = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token.trim() : '';
  const cookieHeader = typeof socket.handshake.headers.cookie === 'string' ? socket.handshake.headers.cookie : '';
  const cookieToken = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith('everything_session='))?.slice('everything_session='.length) || '';
  let decodedCookieToken = '';
  try { decodedCookieToken = decodeURIComponent(cookieToken); } catch { decodedCookieToken = ''; }
  const token = authToken || decodedCookieToken;
  if (!token) return next(new Error('UNAUTHENTICATED'));
  try {
    const result = await (await import('./core/auth.js')).verifySocketToken(token);
    if (!result) return next(new Error('UNAUTHENTICATED'));
    socket.data.uid = result.uid;
    next();
  } catch {
    next(new Error('UNAUTHENTICATED'));
  }
});

const safeRoom = (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9:_-]{1,160}$/.test(value);

io.on('connection', (socket) => {
  const authToken = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token.trim() : '';
  const cookieHeader = typeof socket.handshake.headers.cookie === 'string' ? socket.handshake.headers.cookie : '';
  const cookieToken = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith('everything_session='))?.slice('everything_session='.length) || '';
  let decodedCookieToken = '';
  try { decodedCookieToken = decodeURIComponent(cookieToken); } catch { decodedCookieToken = ''; }
  const token = authToken || decodedCookieToken;
  const isAuthorizedConversationMember = async (conversationId: string) => {
    if (!safeRoom(conversationId) || !token) return false;
    try {
      const result = await privateApi.get<{ allowed?: boolean; member?: boolean }>(`/conversations/${encodeURIComponent(conversationId)}/access`, { headers: { 'X-User-Token': token } });
      return Boolean(result?.allowed ?? result?.member);
    } catch {
      return false;
    }
  };

  socket.on('conversation:join', async (payload: unknown) => {
    const id = (payload as any)?.conversationId;
    if (await isAuthorizedConversationMember(id)) socket.join(`conversation:${id}`);
  });
  socket.on('conversation:leave', (payload: unknown) => {
    const id = (payload as any)?.conversationId;
    if (safeRoom(id)) socket.leave(`conversation:${id}`);
  });
  const typing = async (payload: unknown, event: 'typing:start' | 'typing:stop') => {
    const id = (payload as any)?.conversationId;
    if (!(await isAuthorizedConversationMember(id))) return;
    socket.to(`conversation:${id}`).emit(event, { conversationId: id, userId: socket.data.uid });
  };
  socket.on('message:typing:start', (payload) => { void typing(payload, 'typing:start'); });
  socket.on('message:typing:stop', (payload) => { void typing(payload, 'typing:stop'); });

  // Generic room/channel joins are intentionally not supported until a resource-specific
  // authorization contract exists. This prevents a client from joining arbitrary rooms.
  socket.on('room:join', () => undefined);
  socket.on('channel:join', () => undefined);
  socket.on('room:leave', () => undefined);
  socket.on('channel:leave', () => undefined);
});

const shutdown = (signal: string) => {
  console.log(`Everything server received ${signal}; shutting down.`);
  io.close(() => httpServer.close(() => process.exit(0)));
};
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

httpServer.listen(env.port, '0.0.0.0', () => {
  console.log(`Everything server listening on http://0.0.0.0:${env.port}`);
  console.log(`Client build: ${clientDist}`);
});

export { app, httpServer, io };
