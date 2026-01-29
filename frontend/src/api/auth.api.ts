import apiClient from './axios';
import type {
  SendCodeRequest,
  SendCodeResponse,
  LoginRequest,
  LoginResponse,
} from '../types/auth.types';

// 1단계: 인증번호 발송 (이메일 + 비밀번호)
export const sendCode = async (data: SendCodeRequest): Promise<SendCodeResponse> => {
  const response = await apiClient.post<SendCodeResponse>('/api/auth/request', data);
  return response.data;
};

// 2단계: CODE 인증 (이메일 + 선택한 CODE)
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/verify', data);
  return response.data;
};

// 토큰 재발급
export const reissue = async (): Promise<{ accessToken: string }> => {
  // localStorage에서 refreshToken 조회
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const response = await apiClient.post<{ accessToken: string; tokenType: string; expiresIn: number }>(
    '/api/auth/reissue',
    null,
    {
      headers: {
        'Authorization-Refresh': `Bearer ${refreshToken}`,
      },
    }
  );

  return {
    accessToken: response.data.accessToken,
  };
};
