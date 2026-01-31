import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const AuthLayout = ({ children, showHeader = true }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      {showHeader && (
        <header className="bg-gray-50">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              {/* 로고 이미지 */}
              <img
                src="/images/logo.png"
                alt="CARRY PORTER Logo"
                className="w-8 h-8 object-contain"
              />
              {/* CARRYPORTER 텍스트 */}
              <h1 className="text-gray-900 text-xl font-bold tracking-tight font-['Beckman',sans-serif]">
                CARRY PORTER
              </h1>
            </div>
          </div>
        </header>
      )}

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 px-6 py-8 flex items-start justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
