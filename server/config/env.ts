import 'dotenv/config';

const bool = (value: string | undefined, fallback = false) =>
  value === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());

const port = Number(process.env.PORT || 3001);
const timeout = Number(process.env.PRIVATE_API_TIMEOUT_MS || 15000);
const streamHours = Number(process.env.MAX_STREAM_STORAGE_HOURS || 6);
const paymentTimeout = Number(process.env.PAYMENT_GATEWAY_TIMEOUT_MS || 15000);
const privateUploadMb = Number(process.env.PRIVATE_API_UPLOAD_MAX_MB || 100);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');
if (!Number.isFinite(timeout) || timeout < 1000 || timeout > 120000) throw new Error('PRIVATE_API_TIMEOUT_MS must be between 1000 and 120000.');
if (!Number.isFinite(streamHours) || streamHours < 1 || streamHours > 6) throw new Error('MAX_STREAM_STORAGE_HOURS must be between 1 and 6.');
if (!Number.isFinite(paymentTimeout) || paymentTimeout < 1000 || paymentTimeout > 120000) throw new Error('PAYMENT_GATEWAY_TIMEOUT_MS must be between 1000 and 120000.');
if (!Number.isFinite(privateUploadMb) || privateUploadMb < 1 || privateUploadMb > 500) throw new Error('PRIVATE_API_UPLOAD_MAX_MB must be between 1 and 500.');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  clientDist: process.env.CLIENT_DIST || 'dist',
  privateApiBaseUrl: (process.env.PRIVATE_API_BASE_URL || '').replace(/\/$/, ''),
  privateApiKey: process.env.PRIVATE_API_KEY || '',
  privateApiTimeoutMs: timeout,
  privateApiUploadMaxMb: privateUploadMb,
  paymentGatewayTimeoutMs: paymentTimeout,
  maxStreamStorageHours: streamHours,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  paymentGatewayBaseUrl: (process.env.PAYMENT_GATEWAY_BASE_URL || '').replace(/\/$/, ''),
  paymentGatewaySecret: process.env.PAYMENT_GATEWAY_SECRET || '',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  corsOrigin: process.env.CORS_ORIGIN || '',
  trustProxy: bool(process.env.TRUST_PROXY, false),
};

if (process.env.NODE_ENV === 'production' && process.env.CORS_ORIGIN === '*') {
  throw new Error('CORS_ORIGIN=* is not allowed in production. Use explicit trusted origins or leave it empty for same-origin deployment.');
}

export function requiredIntegrationStatus() {
  return {
    privateApi: Boolean(env.privateApiBaseUrl && env.privateApiKey),
    firebase: Boolean(env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey),
    payments: Boolean(env.paymentGatewayBaseUrl && env.paymentGatewaySecret),
  };
}
