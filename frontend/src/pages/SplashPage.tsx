import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashPage = () => {
  const navigate = useNavigate();

  // 3초 후 자동으로 로그인 페이지로 이동
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
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Main Container - 모바일 최적화 */}
      <div className="relative w-full max-w-[390px] h-full bg-white overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">

        {/* Content Area */}
        <div className="relative w-full h-full bg-white overflow-hidden">
          {/* Background Gradient Eclipse - Figma 디자인 기반 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[250%] h-[100%] -translate-y-[38%]">
            <svg
              className="block w-full h-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 974 722"
            >
              <path
                d="M974 361C974 560.375 755.963 722 487 722C218.037 722 0 560.375 0 361C0 161.625 218.037 0 487 0C755.963 0 974 161.625 974 361Z"
                fill="#0064FF"
              />
            </svg>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 pt-16 pb-8">
            {/* Title - Figma 디자인 스타일 (Beckman 폰트 사용) */}
            <div className="flex-shrink-0 mt-8 animate-fade-in">
              <h1 className="font-['Beckman',sans-serif] text-[66px] leading-tight text-center text-white not-italic font-normal tracking-tight">
                <div className="mb-0">CARRY</div>
                <div>PORTER</div>
              </h1>
            </div>

            {/* Logo - 중앙 정렬 */}
            <div className="flex-1 flex items-center justify-center animate-fade-in-scale" style={{ animationDelay: '200ms' }}>
              <div className="w-[233px] h-[240px]">
                <img
                  alt="Carry Porter Logo"
                  className="w-full h-full object-contain drop-shadow-lg"
                  src="/images/logo.png"
                />
              </div>
            </div>

            {/* Button - 하단 고정, Figma 디자인 스타일 */}
            <div className="w-full flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <button
                onClick={handleStart}
                className="w-full bg-[#0064ff] text-white rounded-lg py-3 px-4 text-center font-['Noto_Sans_KR',sans-serif] font-normal text-lg leading-7 transition-all duration-200 hover:bg-[#0052cc] active:bg-[#0047b3] shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
