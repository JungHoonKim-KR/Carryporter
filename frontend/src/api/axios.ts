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

// Request Interceptor: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새 Access Token 발급
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('Refresh token not found');
        }

        const response = await apiClient.post<{ accessToken: string }>(
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

        // 원래 요청에 새 토큰 적용
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (reissueError) {
        // Refresh Token도 만료된 경우 로그아웃
        console.error('Token reissue failed:', reissueError);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
