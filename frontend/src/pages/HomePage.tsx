import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import { logout as logoutApi } from '../api/auth.api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 나도 로컬 로그아웃은 진행
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">CARRY PORTER</h1>
            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              환영합니다! 🎉
            </h2>
            <p className="text-gray-600 mb-2">
              로그인에 성공했습니다.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              이메일: <span className="font-medium">{user?.email}</span>
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">다음 단계</h3>
                <ul className="text-sm text-blue-700 space-y-2 text-left">
                  <li>✅ 로그인 완료</li>
                  <li>⏳ 티켓 스캔 (추후 구현)</li>
                  <li>⏳ 로봇 호출 (추후 구현)</li>
                  <li>⏳ 실시간 상태 확인 (추후 구현)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
