import { useSSE } from '../contexts/SSEContext';

/**
 * @deprecated
 * 이 훅은 더 이상 사용되지 않습니다.
 * 대신 `useSSE`를 사용하세요.
 *
 * SSE 연결은 이제 App.tsx의 SSEProvider에서 전역으로 관리됩니다.
 * - 싱글톤 패턴으로 앱 전체에서 단 한 번만 연결 생성
 * - 컴포넌트 재렌더링과 무관하게 연결 유지
 * - 로그인/로그아웃 시 자동으로 연결/종료
 *
 * 주요 기능:
 * - Exponential Backoff 재연결 (1초 → 2초 → 4초 → ... → 60초)
 * - 최대 10회 재시도
 * - Heartbeat 모니터링 (백엔드에서 15초마다 heartbeat 이벤트 전송)
 * - Heartbeat 타임아웃 (60초 동안 이벤트 미수신 시 재연결)
 *
 * @example
 * ```tsx
 * // ❌ 이전 방식 (더 이상 사용하지 마세요)
 * import { useGlobalSSE } from '@/hooks/useGlobalSSE';
 * const { isConnected } = useGlobalSSE();
 *
 * // ✅ 새로운 방식
 * import { useSSE } from '@/contexts/SSEContext';
 * const { isConnected } = useSSE();
 * ```
 */
export const useGlobalSSE = () => {
  console.warn(
    '[useGlobalSSE] 이 훅은 deprecated되었습니다. useSSE를 사용하세요.'
  );
  return useSSE();
};