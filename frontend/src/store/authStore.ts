import { create } from 'zustand';
import type { User } from '../types/auth.types';

interface AuthState {
  // 상태
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // 세션 복원 완료 여부

  // 액션
  login: (accessToken: string, refreshToken: string, user: User) => void;
  clearAuth: () => void; // 토큰 만료 시 내부 사용
  setAccessToken: (token: string) => void;
  setAuthenticated: (value: boolean) => void;
  setInitialized: (value: boolean) => void;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태 (localStorage에서 refreshToken 복원)
  accessToken: null,
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  // 로그인 성공 시 호출
  login: (accessToken: string, refreshToken: string, user: User) => {
    // localStorage에 refreshToken 저장
    localStorage.setItem('refreshToken', refreshToken);

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  // 인증 정보 초기화 (토큰 만료 시 내부 사용)
  clearAuth: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('refreshToken');
  },

  // Access Token 갱신 시 호출
  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  // 인증 상태 설정
  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },

  // 초기화 상태 설정
  setInitialized: (value: boolean) => {
    set({ isInitialized: value });
  },

  // Refresh Token 조회
  getRefreshToken: () => {
    return get().refreshToken;
  },
}));
