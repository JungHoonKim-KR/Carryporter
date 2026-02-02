import { useEffect } from 'react';
import { useMissionStore } from '../store/missionStore';
import { subscribeMissionUpdates } from '../api/mission.api'; // ✅ 실제 API 사용

/**
 * 미션 SSE 자동 구독/해제 훅
 *
 * 현재 미션이 있으면 자동으로 SSE 연결을 수립하고,
 * 컴포넌트가 unmount되거나 currentMission이 변경되면 연결을 종료합니다.
 *
 * @returns SSE 연결 상태 및 에러 정보
 */
export const useMissionSSE = () => {
  const { setConnected, setConnectionError, updateMissionStatus } = useMissionStore();

  useEffect(() => {
    const { currentMission } = useMissionStore.getState();

    if (!currentMission) {
      if (import.meta.env.DEV) console.log('[useMissionSSE] No active mission');
      return;
    }

    if (import.meta.env.DEV) console.log('[useMissionSSE] Connecting to SSE');

    const unsubscribe = subscribeMissionUpdates({
      onConnect: () => {
        setConnected(true);
        setConnectionError(null);
      },

      // 로봇 배정 완료
      onRobotAssigned: (data) => {
        updateMissionStatus({
          missionId: currentMission.id,
          status: 'ASSIGNED',
          robotCode: data.robotCode,
          timestamp: data.timestamp,
          message: data.msg,
        });
      },

      // 로봇 출발
      onMissionStarted: (data) => {
        updateMissionStatus({
          missionId: currentMission.id,
          status: 'MOVING',
          robotCode: data.robotCode,
          timestamp: data.timestamp,
          message: data.msg,
        });
      },

      // 로봇 도착
      onRobotArrival: (data) => {
        updateMissionStatus({
          missionId: currentMission.id,
          status: 'ARRIVED',
          robotCode: data.robotCode,
          timestamp: data.timestamp,
          message: data.msg,
        });
      },

      // 인증 성공 (상태 변경 없이 알림만)
      onAuthSuccess: (data) => {
        if (import.meta.env.DEV) console.log('[SSE] 인증 성공:', data.msg);
        // 필요시 Toast 알림 추가
      },

      // 잠금 해제 (무게 측정 시작)
      onUnlocked: (data) => {
        updateMissionStatus({
          missionId: currentMission.id,
          status: 'UNLOCKED',
          timestamp: data.timestamp,
          message: data.msg,
        });
      },

      // 잠금 완료 (수령 완료)
      onLocked: (data) => {
        updateMissionStatus({
          missionId: currentMission.id,
          status: 'LOCKED',
          timestamp: data.timestamp,
          message: data.msg,
        });
      },

      // 미션 중단
      onAborted: (data) => {
        alert(data.msg); // 경고 팝업
        updateMissionStatus({
          missionId: currentMission.id,
          status: 'FINISHED',
          timestamp: data.timestamp,
          message: data.msg,
        });
        // 홈으로 이동은 컴포넌트에서 처리
      },

      onError: (error) => {
        setConnected(false);
        setConnectionError(error);
      },
    });

    // Cleanup: 컴포넌트 unmount 시 SSE 연결 종료
    return () => {
      if (import.meta.env.DEV) console.log('[useMissionSSE] Disconnecting');
      unsubscribe();
    };
  }, [setConnected, setConnectionError, updateMissionStatus]);

  const { isConnected, connectionError } = useMissionStore();
  return { isConnected, connectionError };
};
