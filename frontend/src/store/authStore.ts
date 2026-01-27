import { create } from 'zustand';
import type { User } from '../types/auth.types';

interface AuthState {
  // 상태
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // 액션
  login: (token: string, user: User) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  accessToken: null,
  user: null,
  isAuthenticated: false,

  // 로그인 성공 시 호출
  login: (token: string, user: User) => {
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    });
    // Refresh Token은 localStorage에 저장 (옵션)
    // localStorage.setItem('refreshToken', refreshToken);
  },

  // 로그아웃 시 호출
  logout: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  },

  // Access Token 갱신 시 호출
  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },
}));
