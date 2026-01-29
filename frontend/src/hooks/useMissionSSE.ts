import { useEffect } from 'react';
import { useMissionStore } from '../store/missionStore';
// import { subscribeMissionUpdates } from '../api/mission.api
import { subscribeMissionUpdates } from '../api/mission.api.mock'; // 🔧 Mock API 사용 (백엔드 없이 테스트용)

/**
 * 미션 SSE 자동 구독/해제 훅
 *
 * 미션 ID가 제공되면 자동으로 SSE 연결을 수립하고,
 * 컴포넌트가 unmount되거나 missionId가 변경되면 연결을 종료합니다.
 *
 * @param missionId - 구독할 미션 ID (null이면 구독하지 않음)
 * @returns SSE 연결 상태 및 에러 정보
 */
export const useMissionSSE = (missionId: string | null) => {
  const { setConnected, setConnectionError, updateMissionStatus } = useMissionStore();

  useEffect(() => {
    if (!missionId) return;

    console.log('[useMissionSSE] Connecting to mission:', missionId);

    const unsubscribe = subscribeMissionUpdates(missionId, {
      onConnect: () => {
        setConnected(true);
        setConnectionError(null);
      },

      onStatus: (status) => {
        updateMissionStatus(status);
      },

      onError: (error) => {
        setConnected(false);
        setConnectionError(error);
      },
    });

    // Cleanup: 컴포넌트 unmount 시 SSE 연결 종료
    return () => {
      console.log('[useMissionSSE] Disconnecting');
      unsubscribe();
    };
  }, [missionId, setConnected, setConnectionError, updateMissionStatus]);

  const { isConnected, connectionError } = useMissionStore();
  return { isConnected, connectionError };
};
