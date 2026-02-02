import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

/**
 * 공통 페이지 헤더 컴포넌트
 * 로고, 타이틀, 뒤로가기/닫기 버튼을 포함
 */
export const PageHeader = ({
  title = 'CARRY PORTER',
  subtitle,
  showBackButton = false,
  showCloseButton = false,
  onBack,
  onClose,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/home');
    }
  };

  return (
    <header className="bg-gray-50 pt-safe">
      <div className="max-w-md mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 뒤로가기 버튼 */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="뒤로가기"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* 로고 + 타이틀 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-toss-blue-500 rounded-xl flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="CARRY PORTER Logo"
                className={cn("w-6 h-6", logoError && "hidden")}
                onError={() => setLogoError(true)}
              />
            </div>
            <div>
              <h1 className="text-gray-900 text-lg font-bold">{title}</h1>
              {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
            </div>
          </div>

          {/* 닫기 버튼 */}
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* 버튼이 없을 때 빈 공간 유지 */}
          {!showBackButton && !showCloseButton && <div className="w-10" />}
        </div>
      </div>
    </header>
  );
};
