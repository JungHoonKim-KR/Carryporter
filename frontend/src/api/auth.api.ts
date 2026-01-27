import apiClient from './axios';
import type {
  LoginRequest,
  LoginResponse,
  VerifyPinRequest,
  AuthResponse,
  AdminLoginRequest,
} from '../types/auth.types';

// 일반 사용자 로그인 (1단계: 이메일 + 비밀번호)
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
  return response.data;
};

// PIN 인증 (2단계: PIN 번호 선택)
export const verifyPin = async (data: VerifyPinRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/verify', data);
  return response.data;
};

// 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');
};

// 관리자 로그인
export const adminLogin = async (data: AdminLoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/admin/auth/login', data);
  return response.data;
};
