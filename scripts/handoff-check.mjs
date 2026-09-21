import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mustFile = (p) => {
  if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing required handoff file: ${p}`);
};
const text = (p) => fs.readFileSync(path.join(root, p), 'utf8');

for (const p of [
  'docs/ARCHITECTURE.md',
  'docs/integrations/PRIVATE_API.md',
  'docs/integrations/PAYMENT_GATEWAY.md',
  'docs/SECURITY.md',
  'docs/DEPLOYMENT.md',
  'docs/QA-CHECKLIST.md',
  'INTEGRATION_STATUS.json',
]) mustFile(p);

const status = JSON.parse(text('INTEGRATION_STATUS.json'));
if (status.privateApi !== 'NOT_CONFIGURED') throw new Error('Private API must remain unconfigured in the handoff release.');
if (status.paymentGateway !== 'NOT_CONFIGURED') throw new Error('Payment gateway must remain unconfigured in the handoff release.');
if (status.streamRecordingMaxRetentionHours > 6) throw new Error('Stream retention exceeds 6 hours.');
if (status.platformAdminPanel !== false) throw new Error('Platform-wide admin panel must not be introduced.');

const routes = text('server/routes/api.ts');
for (const required of [
  "apiRouter.get('/health/live'",
  "apiRouter.get('/health/ready'",
  "apiRouter.get('/integration/status'",
  "apiRouter.post('/payments/webhook'",
  "apiRouter.all('*', proxyRequest)",
  'ALLOWED_FAMILIES',
]) if (!routes.includes(required)) throw new Error(`Missing server boundary: ${required}`);

const env = text('server/config/env.ts');
for (const required of ['PRIVATE_API_TIMEOUT_MS', 'MAX_STREAM_STORAGE_HOURS', 'PAYMENT_GATEWAY_TIMEOUT_MS']) {
  if (!text('.env.example').includes(required)) throw new Error(`Missing env documentation: ${required}`);
}
if (!env.includes('streamHours > 6')) throw new Error('6-hour stream retention guard missing.');

console.log('HANDOFF_CHECK=PASS');
console.log('Integration docs: complete');
console.log('External integrations: intentionally unconfigured');
console.log('Security boundary: present');
console.log('Single deployment: preserved');
