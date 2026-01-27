import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400">
      {/* 헤더 */}
      {showHeader && (
        <header className="bg-blue-600 py-4 px-6 shadow-md">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                </svg>
                <h1 className="text-white text-2xl font-bold">CARRYPORTER</h1>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 컨텐츠 영역 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
