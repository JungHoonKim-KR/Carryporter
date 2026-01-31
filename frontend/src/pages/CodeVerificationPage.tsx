import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

interface LocationState {
  email: string;
  code: number; // 실제 CODE (백엔드에서 전달받은 값)
}

/**
 * 랜덤 2자리 숫자 생성 (10-99)
 * correctCode와 중복되지 않도록
 */
const generateFakeCodes = (correctCode: number, count: number): number[] => {
  const fakeCodes: number[] = [];
  while (fakeCodes.length < count) {
    const randomCode = Math.floor(Math.random() * 90) + 10; // 10-99
    if (randomCode !== correctCode && !fakeCodes.includes(randomCode)) {
      fakeCodes.push(randomCode);
    }
  }
  return fakeCodes;
};

/**
 * 배열을 랜덤하게 섞기 (Fisher-Yates 알고리즘)
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const CodeVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginStore, isAuthenticated, clearAuth } = useAuthStore();

  const state = location.state as LocationState | null;
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // state에서 값 추출 (없으면 기본값)
  const email = state?.email ?? '';
  const correctCode = state?.code ?? 0;
  const hasValidState = !!(state && state.email && state.code !== undefined);

  // CODE 옵션 생성 (모든 훅은 조건부 반환 전에 호출되어야 함)
  const codeOptions = useMemo(() => {
    if (!hasValidState) return [];
    const fakeCodes = generateFakeCodes(correctCode, 2);
    return shuffleArray([correctCode, ...fakeCodes]);
  }, [correctCode, hasValidState]);

  // 로그인 페이지 진입 시 기존 인증 정보 클리어
  // (뒤로가기로 왔을 때 처음부터 다시 시작하도록)
  useEffect(() => {
    if (isAuthenticated) {
      // 이미 로그인된 상태에서 이 페이지에 왔다면 로그아웃 후 로그인 페이지로
      clearAuth();
      navigate('/login', { replace: true });
    }
  }, []); // 마운트 시 1회만 실행

  // state가 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!hasValidState) {
      navigate('/login', { replace: true });
    }
  }, [hasValidState, navigate]);

  // state가 없으면 렌더링하지 않음
  if (!hasValidState) {
    return null;
  }

  const handleCodeSelect = (code: number) => {
    setSelectedCode(code);
    setApiError(''); // 에러 초기화
  };

  const handleSubmit = async () => {
    if (selectedCode === null) {
      setApiError('CODE 번호를 선택해주세요');
      return;
    }

    // 잘못된 CODE 선택 시 에러 표시 (프론트에서 바로 체크)
    if (selectedCode !== correctCode) {
      setApiError('잘못된 CODE입니다. mattermost 메시지를 확인해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setApiError('');

      // 디버깅: 전송할 데이터 확인
      const requestData = {
        email,
        code: selectedCode,
      };
      console.log('=== CODE 인증 요청 데이터 ===');
      console.log('Email:', email);
      console.log('Selected Code:', selectedCode, '(type:', typeof selectedCode, ')');
      console.log('Correct Code:', correctCode, '(type:', typeof correctCode, ')');
      console.log('Request Data:', requestData);

      // CODE 인증 API 호출 (이메일 + 선택한 CODE)
      // refreshToken은 백엔드가 httpOnly 쿠키로 설정하므로 응답 body에서 처리 불필요
      const response = await login(requestData);

      // Zustand 스토어에 accessToken 저장
      loginStore(
        response.accessToken,
        {
          id: '', // 토큰에서 추출 또는 임시값
          email,
          role: 'USER',
        }
      );

      // 티켓 스캔 페이지로 이동
      navigate('/ticket/scan');
    } catch (error: any) {
      console.error('Login error:', error);
      setApiError(
        error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gray-50 pt-safe">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="CARRY PORTER Logo"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-gray-900 text-lg font-bold font-['Beckman',sans-serif]">CARRY PORTER</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto px-6 py-6">
        {/* 제목 */}
        <div className="mb-6 animate-fade-in-up">
          <h2 className="text-gray-900 text-2xl font-bold mb-1">
            같은 번호 선택 🔢
          </h2>
          <p className="text-gray-600 text-sm">
            Mattermost에서 받은 숫자와 같은 번호를 선택해주세요
          </p>
        </div>

        {/* CODE 선택 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            인증 코드
          </h3>

          {/* CODE 버튼들 */}
          <div className="space-y-3 mb-6">
            {codeOptions.map((code) => (
              <button
                key={code}
                onClick={() => handleCodeSelect(code)}
                className={`
                  w-full h-24 text-5xl font-extrabold rounded-xl border-2 transition-all
                  ${selectedCode === code
                    ? 'bg-toss-blue-500 border-toss-blue-500 text-white shadow-md'
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {code}
              </button>
            ))}
          </div>

          {/* API 에러 메시지 */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={isLoading || selectedCode === null}
            className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 disabled:opacity-40"
          >
            {isLoading ? '인증 중...' : '로그인'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CodeVerificationPage;
