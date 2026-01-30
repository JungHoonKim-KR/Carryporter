import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Axios 인스턴스 생성
const apiClient = axios.create({
  // 개발 환경: Vite 프록시 사용 (CORS 우회)
  // 프로덕션 환경: 환경 변수의 API 서버 URL 사용
  baseURL: import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reissue 요청 중복 방지를 위한 변수
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// 토큰 갱신 대기열에 요청 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Request Interceptor: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData를 전송할 때는 Content-Type을 제거하여 axios가 자동으로 설정하도록 함
    // (multipart/form-data; boundary=... 형식으로 자동 설정됨)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러 시 자동 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러가 아니거나 이미 재시도한 요청이면 패스
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // reissue 요청 자체가 401을 받은 경우 무한 루프 방지
    if (originalRequest.url?.includes('/api/auth/reissue')) {
      console.error('Reissue 요청 실패 - 로그아웃 처리');
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 이미 토큰 갱신 중인 경우, 갱신 완료까지 대기
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    // 토큰 갱신 시작
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Refresh Token으로 새 Access Token 발급
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

      const { accessToken } = response.data;

      // Store에 새 토큰 저장
      useAuthStore.getState().setAccessToken(accessToken);

      // 대기 중인 모든 요청에 새 토큰 전달
      onRefreshed(accessToken);

      // 원래 요청에 새 토큰 적용 후 재시도
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (reissueError) {
      // Refresh Token도 만료된 경우 로그아웃
      console.error('Token reissue failed:', reissueError);
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(reissueError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
