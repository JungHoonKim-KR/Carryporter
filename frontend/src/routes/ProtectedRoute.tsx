import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // 로그인 안 했으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 로그인 했으면 자식 컴포넌트 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
