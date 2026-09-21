// Authentication API layer
import { apiClient } from './client';
import type { User, Session, ApiResponse } from '../../types';

export interface RegisterPayload {
  fullName: string;
  username: string;
  emailOrPhone: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  twoFactorCode?: string;
  recoveryCode?: string;
}

export interface AuthResult {
  user: User;
  token?: string;
  requiresTwoFactor?: boolean;
}

export const AuthApi = {
  async requestSignupOtp(email: string): Promise<ApiResponse<{ sent: boolean; expiresIn?: number }>> {
    return apiClient.request('/auth/signup/otp/request', { method: 'POST', body: JSON.stringify({ email }) });
  },

  async verifySignupOtp(email: string, code: string): Promise<ApiResponse<{ verified: boolean }>> {
    return apiClient.request('/auth/signup/otp/verify', { method: 'POST', body: JSON.stringify({ email, code }) });
  },
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResult>> {
    try {
      const res = await apiClient.request<AuthResult>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res;
    } catch (err) {
      throw err;
    }
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResult>> {
    try {
      const res = await apiClient.request<AuthResult>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res;
    } catch (err) {
      throw err;
    }
  },

  async logout(): Promise<void> {
    await apiClient.request('/auth/logout', { method: 'POST' });
    apiClient.clearAccessToken();
  },

  async logoutAll(): Promise<void> {
    await apiClient.request('/auth/logout-all', { method: 'POST' });
    apiClient.clearAccessToken();
  },

  async getSessions(): Promise<ApiResponse<Session[]>> {
    try {
      return await apiClient.request<Session[]>('/auth/sessions');
    } catch (err) {
      throw err;
    }
  },

  async revokeSession(sessionId: string): Promise<ApiResponse<{ revoked: boolean }>> {
    try {
      return await apiClient.request<{ revoked: boolean }>(`/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      throw err;
    }
  },
};
