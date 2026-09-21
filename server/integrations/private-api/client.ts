import { env } from '../../config/env.js';
import { AppError } from '../../core/errors.js';

export type PrivateApiResponse<T = unknown> = T;

export class PrivateApiClient {
  private configured() {
    return Boolean(env.privateApiBaseUrl && env.privateApiKey);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.configured()) {
      throw new AppError(503, 'PRIVATE_API_NOT_CONFIGURED', 'Private content API is not configured yet.');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), env.privateApiTimeoutMs);
    try {
      const headers = new Headers(init.headers || {});
      headers.set('Accept', 'application/json');
      headers.set('Authorization', `Bearer ${env.privateApiKey}`);
      if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData) && !Buffer.isBuffer(init.body)) {
        headers.set('Content-Type', 'application/json');
      }
      let decodedPath = path;
      try { decodedPath = decodeURIComponent(path); } catch { throw new AppError(400, 'INVALID_PATH_ENCODING', 'Invalid path encoding.'); }
      if (!decodedPath.startsWith('/') || decodedPath.includes('..') || decodedPath.includes('\\') || /[\u0000-\u001f\u007f]/.test(decodedPath)) {
        throw new AppError(400, 'INVALID_PRIVATE_API_PATH', 'Invalid private API path.');
      }
      const response = await fetch(`${env.privateApiBaseUrl}${decodedPath}`, {
        ...init,
        headers,
        signal: controller.signal,
      });
      const type = response.headers.get('content-type') || '';
      const body = type.includes('json') ? await response.json() : await response.text();
      if (!response.ok) {
        const message = response.status >= 500
          ? 'Private API service error.'
          : (typeof body === 'object' && body && 'error' in body
            ? String((body as any).error?.message || (body as any).error)
            : `Private API returned HTTP ${response.status}.`);
        throw new AppError(response.status, 'PRIVATE_API_ERROR', message);
      }
      return body as T;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if ((error as any)?.name === 'AbortError') {
        throw new AppError(504, 'PRIVATE_API_TIMEOUT', 'Private API request timed out.');
      }
      throw new AppError(502, 'PRIVATE_API_UNAVAILABLE', 'Private API is unavailable.');
    } finally {
      clearTimeout(timer);
    }
  }

  get<T>(path: string, init?: RequestInit) { return this.request<T>(path, init); }
  post<T>(path: string, body: unknown, headers?: HeadersInit) {
    return this.request<T>(path, { method: 'POST', headers, body: Buffer.isBuffer(body) ? body : JSON.stringify(body) });
  }
  patch<T>(path: string, body: unknown, headers?: HeadersInit) {
    return this.request<T>(path, { method: 'PATCH', headers, body: JSON.stringify(body) });
  }
  put<T>(path: string, body: unknown, headers?: HeadersInit) {
    return this.request<T>(path, { method: 'PUT', headers, body: JSON.stringify(body) });
  }
  delete<T>(path: string, headers?: HeadersInit) { return this.request<T>(path, { method: 'DELETE', headers }); }

  async upload(path: string, body: Buffer, contentType: string, extraHeaders?: Record<string, string>) {
    if (!this.configured()) throw new AppError(503, 'PRIVATE_API_NOT_CONFIGURED', 'Private content API is not configured yet.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.max(env.privateApiTimeoutMs, 30_000));
    const headers = new Headers(extraHeaders);
    headers.set('Authorization', `Bearer ${env.privateApiKey}`);
    headers.set('Content-Type', contentType || 'application/octet-stream');
    let response: Response;
    try {
      let decodedPath = path;
      try { decodedPath = decodeURIComponent(path); } catch { throw new AppError(400, 'INVALID_PATH_ENCODING', 'Invalid path encoding.'); }
      if (!decodedPath.startsWith('/') || decodedPath.includes('..') || decodedPath.includes('\\') || /[\u0000-\u001f\u007f]/.test(decodedPath)) throw new AppError(400, 'INVALID_PRIVATE_API_PATH', 'Invalid private API path.');
      response = await fetch(`${env.privateApiBaseUrl}${decodedPath}`, { method: 'POST', headers, body, signal: controller.signal });
    } catch (error) {
      if ((error as any)?.name === 'AbortError') throw new AppError(504, 'PRIVATE_API_TIMEOUT', 'Private API media upload timed out.');
      throw new AppError(502, 'PRIVATE_API_UNAVAILABLE', 'Private API is unavailable.');
    } finally { clearTimeout(timer); }
    if (!response.ok) throw new AppError(response.status, 'PRIVATE_API_UPLOAD_ERROR', `Private API upload failed with HTTP ${response.status}.`);
    const type = response.headers.get('content-type') || '';
    return (type.includes('json') ? response.json() : response.text()) as Promise<unknown>;
  }
}

export const privateApi = new PrivateApiClient();
