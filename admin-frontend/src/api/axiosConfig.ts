// src/api/axiosConfig.ts
import axios from 'axios';

// 1. Axios 인스턴스 생성
export const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // 백엔드 주소
    baseURL: import.meta.env.VITE_API_URL || 'http://i14e101.p.ssafy.io/', // 백엔드 주소

  timeout: 10000, // 10초 타임아웃
  withCredentials: true, // 🚨 중요: 쿠키(Refresh Token)를 주고받기 위한 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. (선택) 요청 인터셉터: Access Token이 있다면 헤더에 끼워넣기
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // 저장된 토큰 가져오기
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;