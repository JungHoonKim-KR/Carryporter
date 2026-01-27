import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  // 2초 후 자동으로 로그인 페이지로 이동 (선택사항)
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 flex flex-col items-center justify-between p-8">
      {/* 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-2">
            CARRY
          </h1>
          <h1 className="text-white text-5xl md:text-6xl font-bold">
            PORTER
          </h1>
        </div>

        {/* 로봇 일러스트 */}
        <div className="w-48 h-48 md:w-64 md:h-64 bg-white/20 rounded-full flex items-center justify-center">
          <svg
            className="w-32 h-32 md:w-40 md:h-40 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
        </div>
      </div>

      {/* 시작하기 버튼 */}
      <div className="w-full max-w-sm">
        <Button
          fullWidth
          size="lg"
          onClick={handleStart}
          className="shadow-xl"
        >
          시작하기
        </Button>
      </div>
    </div>
  );
};

export default SplashPage;
