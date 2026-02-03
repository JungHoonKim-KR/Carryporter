import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SSEProvider } from '../contexts/SSEContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // 로그인 안 했으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 인증된 라우트에서만 SSEProvider 활성화
  // 미션이 생성되면 자동으로 SSE 연결 시작
  return (
    <SSEProvider>
      <Outlet />
    </SSEProvider>
  );
};

export default ProtectedRoute;