import api from '@/lib/api';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User, SendOtpRequest, VerifyOtpRequest, OtpResponse } from '@/types';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  // OTP Authentication
  sendOtp: async (data: SendOtpRequest): Promise<OtpResponse> => {
    const response = await api.post<ApiResponse<OtpResponse>>('/auth/send-otp', data);
    return response.data.data!;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data);
    return response.data.data!;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken });
    return response.data.data!;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/revoke-token', { refreshToken });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword });
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  updateProfile: async (data: { firstName: string; lastName: string; phoneNumber?: string }): Promise<void> => {
    await api.put('/auth/me', data);
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/auth/me');
  },
};
