import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Button from '../components/common/Button';
import { verifyPin } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

interface LocationState {
  verificationId: string;
  pins: string[];
  expiresAt: string;
}

const PinVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const state = location.state as LocationState;
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // state가 없으면 로그인 페이지로 리다이렉트
  if (!state || !state.verificationId || !state.pins) {
    navigate('/login');
    return null;
  }

  const { verificationId, pins } = state;

  const handlePinSelect = (pin: string) => {
    setSelectedPin(pin);
  };

  const handleSubmit = async () => {
    if (!selectedPin) {
      setApiError('PIN 번호를 선택해주세요');
      return;
    }

    try {
      setIsLoading(true);
      setApiError('');

      // PIN 인증 API 호출
      const response = await verifyPin({
        verificationId,
        pin: selectedPin,
      });

      // Zustand 스토어에 로그인 정보 저장
      login(response.accessToken, response.user);

      // 홈 화면으로 이동
      navigate('/');
    } catch (error: any) {
      console.error('PIN verification error:', error);
      setApiError(
        error.response?.data?.message || 'PIN 인증에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          간편 인증 선택
        </h2>

        <p className="text-sm text-gray-600 text-center mb-8">
          mm으로 전송 된 간편 4자리 선택해주세요
        </p>

        {/* PIN 버튼들 */}
        <div className="space-y-4 mb-6">
          {pins.map((pin) => (
            <button
              key={pin}
              onClick={() => handlePinSelect(pin)}
              className={`
                w-full h-20
                text-3xl font-bold
                rounded-lg
                transition-all duration-200
                ${
                  selectedPin === pin
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }
              `}
            >
              {pin}
            </button>
          ))}
        </div>

        {/* API 에러 메시지 */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        {/* 로그인 버튼 */}
        <Button
          onClick={handleSubmit}
          fullWidth
          size="lg"
          disabled={isLoading || !selectedPin}
        >
          {isLoading ? '인증 중...' : '로그인'}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default PinVerificationPage;
