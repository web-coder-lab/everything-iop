// Core API Client with timeout, retries, auth tokens in-memory, and normalized errors
import { API_BASE_URL } from '../../config/constants';
import { generateRequestId } from '../utils';
import type { ApiResponse } from '../../types';

export class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;

  constructor(message: string, status: number, code: string = 'API_ERROR', requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public clearAccessToken() {
    this.accessToken = null;
  }

  private mapStatusToMessage(status: number, fallback: string): { code: string; message: string } {
    switch (status) {
      case 400:
        return { code: 'BAD_REQUEST', message: fallback || 'Validation error. Please verify your inputs.' };
      case 401:
        return { code: 'UNAUTHENTICATED', message: fallback || 'Session expired or unauthenticated.' };
      case 403:
        return { code: 'FORBIDDEN', message: fallback || 'You do not have permission to perform this action.' };
      case 404:
        return { code: 'NOT_FOUND', message: fallback || 'The requested resource was not found.' };
      case 409:
        return { code: 'CONFLICT', message: fallback || 'A conflict occurred with this request.' };
      case 410:
        return { code: 'EXPIRED', message: fallback || 'The requested resource has expired.' };
      case 413:
        return { code: 'PAYLOAD_TOO_LARGE', message: fallback || 'Payload too large. Please upload smaller files.' };
      case 422:
        return { code: 'UNPROCESSABLE_ENTITY', message: fallback || 'Semantic validation failed.' };
      case 429:
        return { code: 'RATE_LIMITED', message: fallback || 'Too many requests. Please slow down.' };
      case 500:
        return { code: 'INTERNAL_SERVER_ERROR', message: 'Internal community server error.' };
      case 503:
        return { code: 'SERVICE_UNAVAILABLE', message: 'Community service is currently waking or unavailable.' };
      default:
        return { code: 'UNKNOWN_ERROR', message: fallback || `HTTP error ${status}` };
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number; retries?: number } = {}
  ): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      throw new ApiError('API integration is disabled in local frontend mode.', 0, 'API_DISABLED');
    }
    const { timeout = 12000, retries = 1, ...fetchOptions } = options;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const requestId = generateRequestId();

    const headers = new Headers(fetchOptions.headers || {});
    headers.set('X-Request-Id', requestId);
    const bodyIsBinary = fetchOptions.body instanceof Blob || fetchOptions.body instanceof ArrayBuffer || fetchOptions.body instanceof Uint8Array;
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData) && !bodyIsBinary) {
      headers.set('Content-Type', 'application/json');
    }
    if (this.accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    let attempt = 0;
    const isIdempotent = fetchOptions.method === undefined || fetchOptions.method === 'GET' || fetchOptions.method === 'HEAD';

    while (attempt <= (isIdempotent ? retries : 0)) {
      attempt++;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
          credentials: 'include',
        });
        clearTimeout(id);

        let data: any = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }

        if (!response.ok) {
          const { code, message } = this.mapStatusToMessage(
            response.status,
            data?.error?.message || data?.message || data?.error || ''
          );
          throw new ApiError(message, response.status, code, requestId);
        }

        // Normalize standard API response shape
        if (data && typeof data === 'object' && ('success' in data || 'data' in data || 'status' in data)) {
          return {
            success: true,
            data: data.data !== undefined ? data.data : data,
            pagination: data.pagination,
            meta: { requestId: data.meta?.requestId || requestId },
          };
        }

        return {
          success: true,
          data: data as T,
          meta: { requestId },
        };
      } catch (err: any) {
        clearTimeout(id);
        const isAbort = err.name === 'AbortError';
        const isNetwork = err instanceof TypeError;

        if (attempt <= (isIdempotent ? retries : 0) && (isAbort || isNetwork)) {
          // Exponential backoff delay
          await new Promise((res) => setTimeout(res, 800 * attempt));
          continue;
        }

        if (err instanceof ApiError) {
          throw err;
        }

        const fallbackMsg = isAbort
          ? 'Network request timed out. Community server may be waking up.'
          : err.message || 'Unable to connect to community backend.';
        throw new ApiError(fallbackMsg, 0, isAbort ? 'TIMEOUT' : 'NETWORK_ERROR', requestId);
      }
    }

    throw new ApiError('Maximum request retries reached', 0, 'MAX_RETRIES_EXCEEDED', requestId);
  }

  // Health probe method specifically supporting the Render waking flow
  public async checkHealth(): Promise<{ status: string; mode?: string }> {
    const res = await this.request<{ status: string; mode?: string }>('/health/live', {
      timeout: 10000,
      retries: 2,
    });
    return (res.data as any) || { status: 'ok' };
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
