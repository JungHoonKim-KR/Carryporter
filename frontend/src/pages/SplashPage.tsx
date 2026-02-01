import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashPage = () => {
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(true);
  const [showText, setShowText] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const fullText = "CARRY PORTER";

  useEffect(() => {
    // 1초 후 로고 사라지고 텍스트 애니메이션 시작
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      setShowText(true);
    }, 1200);

    return () => clearTimeout(logoTimer);
  }, []);

  // 한글자씩 표시
  useEffect(() => {
    if (showText && visibleChars < fullText.length) {
      const charTimer = setTimeout(() => {
        setVisibleChars(prev => prev + 1);
      }, 100); // 각 글자 100ms 간격
      return () => clearTimeout(charTimer);
    }
  }, [showText, visibleChars, fullText.length]);

  // 전체 텍스트 완료 후 3.5초 뒤 자동 이동
  useEffect(() => {
    if (visibleChars >= fullText.length) {
      const navigationTimer = setTimeout(() => {
        navigate('/login');
      }, 2000); // 텍스트 완료 후 2초 대기
      return () => clearTimeout(navigationTimer);
    }
  }, [visibleChars, fullText.length, navigate]);

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto px-6">
        {/* Logo Animation */}
        {showLogo && (
          <div className="absolute inset-0 flex items-center justify-center animate-logo-fade-in">
            <div className="w-32 h-32">
              <img
                alt="CARRY PORTER Logo"
                className="w-full h-full object-contain"
                src="/images/logo.png"
              />
            </div>
          </div>
        )}

        {/* Text Animation - 한글자씩 */}
        {showText && (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="text-center mb-8">
              {/* CARRY */}
              <div className="font-['Beckman',sans-serif] text-4xl md:text-6xl font-bold text-gray-900 mb-2">
                {fullText.slice(0, 5).split('').map((char, i) => (
                  <span
                    key={i}
                    className={`inline-block transition-opacity duration-300 ${
                      i < visibleChars ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>

              {/* PORTER */}
              <div className="font-['Beckman',sans-serif] text-4xl md:text-6xl font-bold text-gray-900">
                {fullText.slice(6).split('').map((char, i) => (
                  <span
                    key={i + 6}
                    className={`inline-block transition-opacity duration-300 ${
                      i + 6 < visibleChars ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            </div>

            {/* 설명 텍스트 - 전체 완료 후 표시 */}
            <p
              className={`text-gray-600 text-lg mb-12 transition-opacity duration-500 ${
                visibleChars >= fullText.length ? 'opacity-100' : 'opacity-0'
              }`}
            >
              가장 낮은 눈높이에서, 가장 높은 서비스를
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashPage;
