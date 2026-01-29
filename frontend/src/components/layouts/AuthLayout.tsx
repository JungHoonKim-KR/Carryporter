import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const AuthLayout = ({ children, showHeader = true }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-blue-600 flex flex-col">
      {/* 헤더 */}
      {showHeader && (
        <header className="pt-6 pb-4 px-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2">
              {/* 로봇 아이콘 */}
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 012 2v1h3a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h3V4a2 2 0 012-2zm0 5a3 3 0 00-3 3v4a3 3 0 006 0v-4a3 3 0 00-3-3z"/>
              </svg>
              {/* CARRYPORTER 텍스트 */}
              <h1 className="text-white text-xl font-bold tracking-wider">
                CARRYPORTER
              </h1>
            </div>
          </div>
        </header>
      )}

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 px-4 py-6 flex items-start justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
