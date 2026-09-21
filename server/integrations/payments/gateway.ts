import { env } from '../../config/env.js';
import { AppError } from '../../core/errors.js';

export class PaymentGateway {
  private configured() { return Boolean(env.paymentGatewayBaseUrl && env.paymentGatewaySecret); }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.configured()) throw new AppError(503, 'PAYMENT_GATEWAY_NOT_CONFIGURED', 'Payment gateway is not configured yet.');
    let decodedPath = path;
      try { decodedPath = decodeURIComponent(path); } catch { throw new AppError(400, 'INVALID_PATH_ENCODING', 'Invalid path encoding.'); }
      if (!decodedPath.startsWith('/') || decodedPath.includes('..') || decodedPath.includes('\\') || /[\u0000-\u001f\u007f]/.test(decodedPath)) {
      throw new AppError(400, 'INVALID_GATEWAY_PATH', 'Invalid payment gateway path.');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), env.paymentGatewayTimeoutMs);
    const headers = new Headers(init.headers || {});
    headers.set('Accept', 'application/json');
    headers.set('Authorization', `Bearer ${env.paymentGatewaySecret}`);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    try {
      const response = await fetch(`${env.paymentGatewayBaseUrl}${path}`, { ...init, headers, signal: controller.signal });
      const type = response.headers.get('content-type') || '';
      const body = type.includes('json') ? await response.json() : await response.text();
      if (!response.ok) throw new AppError(response.status, 'PAYMENT_GATEWAY_ERROR', 'Payment gateway request failed.');
      return body as T;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if ((error as any)?.name === 'AbortError') throw new AppError(504, 'PAYMENT_GATEWAY_TIMEOUT', 'Payment gateway request timed out.');
      throw new AppError(502, 'PAYMENT_GATEWAY_UNAVAILABLE', 'Payment gateway is unavailable.');
    } finally {
      clearTimeout(timer);
    }
  }

  async handleWebhook(rawBody: Buffer, headers: Headers | Record<string, string | string[] | undefined>) {
    // Gateway-specific mapping belongs here. Do not mark a payment successful from frontend input.
    // The implementation should verify the gateway event id, enforce idempotency, then persist
    // the financial result through Firebase/private financial services.
    const eventId = headers instanceof Headers ? headers.get('X-Event-Id') : String(headers['x-event-id'] || headers['X-Event-Id'] || '');
    if (!eventId) throw new AppError(400, 'WEBHOOK_EVENT_ID_REQUIRED', 'Payment webhook event ID is required.');
    if (!rawBody.length) throw new AppError(400, 'EMPTY_WEBHOOK', 'Payment webhook body is empty.');
    throw new AppError(501, 'PAYMENT_GATEWAY_MAPPING_NOT_IMPLEMENTED', `Payment webhook ${eventId} was authenticated but provider-specific financial mapping is not configured.`);
  }
}
export const paymentGateway = new PaymentGateway();
