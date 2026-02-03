import React from 'react';

// /**
//  * SSE Provider 컴포넌트
//  *
//  * ProtectedRoute에서 사용되어 인증된 사용자에게 전역 SSE 연결을 제공합니다.
//  * useGlobalSSE 훅을 실행하여 SSE 구독을 시작하고, 페이지 이동과 무관하게 연결을 유지합니다.
//  */

// export const SSEProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
//   useGlobalSSE(); // SSE 연결 시작

//   return <>{children}</>;
// };


/**
 * @deprecated
 * 이 컴포넌트는 더 이상 사용되지 않습니다.
 * SSE 연결은 이제 App.tsx에서 전역으로 관리됩니다.
 *
 * 새로운 SSE Provider는 `@/contexts/SSEContext`에서 import하세요.
 *
 * @example
 * ```tsx
 * // ❌ 이전 방식 (더 이상 사용하지 마세요)
 * import { SSEProvider } from '@/components/common/SSEProvider';
 *
 * // ✅ 새로운 방식
 * import { SSEProvider } from '@/contexts/SSEContext';
 * ```
 */
export const SSEProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  console.warn(
    '[SSEProvider] 이 컴포넌트는 deprecated되었습니다. @/contexts/SSEContext의 SSEProvider를 사용하세요.'
  );
  return <>{children}</>;
};
