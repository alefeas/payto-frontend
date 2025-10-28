import apiClient from '@/lib/api-client';
import { User } from '@/types';

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  country?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  street?: string;
  street_number?: string;
  floor?: string;
  apartment?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  async register(data: RegisterData): Promise<{ success: boolean; data: { message: string; email: string } }> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  async updateProfile(data: Partial<RegisterData>): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>('/auth/profile', data);
    return response.data.data;
  },

  async verifyCode(email: string, code: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/verify-code', { email, code });
    return response.data;
  },

  async resendCode(email: string): Promise<void> {
    await apiClient.post('/auth/resend-code', { email });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  }
};
