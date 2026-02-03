import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { SSEConnectionManager } from '../lib/SSEConnectionManager';
import { useAuthStore } from '../store/authStore';
import { useMissionStore } from '../store/missionStore';
import type { SSEEventData } from '../types/mission.types';

/**
 * SSE Context 타입
 */
interface SSEContextType {
  isConnected: boolean;
  reconnectAttempts: number;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

/**
 * SSE Provider Props
 */
interface SSEProviderProps {
  children: React.ReactNode;
}

/**
 * SSE Provider 컴포넌트
 *
 * 앱 최상위에서 단 한 번만 렌더링되어 SSE 연결을 관리합니다.
 * SSEConnectionManager 싱글톤을 사용하여 앱 전체에서 하나의 연결만 유지합니다.
 *
 * 특징:
 * - 컴포넌트 재렌더링과 무관하게 연결 유지
 * - 로그인 시 자동 연결, 로그아웃 시 자동 종료
 * - Exponential Backoff 재연결 (1초 → 2초 → 4초 → ... → 60초)
 * - Heartbeat 모니터링 (60초 타임아웃)
 */
export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const {
    setConnected,
    setConnectionError,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    updateMissionStatus,
  } = useMissionStore();

  // SSE 연결 관리자 (싱글톤)
  const managerRef = useRef<SSEConnectionManager>(SSEConnectionManager.getInstance());

  /**
   * SSE 이벤트 콜백 함수들
   * useCallback으로 메모이제이션하여 불필요한 재생성 방지
   */
  const handleConnect = useCallback(() => {
    console.log('[SSE Context] 연결 성공');
    setConnected(true);
    setConnectionError(null);
    resetReconnectAttempts();
  }, [setConnected, setConnectionError, resetReconnectAttempts]);

  const handleHeartbeat = useCallback(() => {
    console.debug('[SSE Context] Heartbeat 수신');
  }, []);

  const handleRobotAssigned = useCallback(
    (data: SSEEventData) => {
      console.log('[SSE Context] 로봇 배정:', data);
      updateMissionStatus({
        status: 'ASSIGNED',
        robotCode: data.robotCode,
      });
    },
    [updateMissionStatus]
  );

  const handleMissionStarted = useCallback(
    (data: SSEEventData) => {
      console.log('[SSE Context] 미션 시작:', data);
      updateMissionStatus({
        status: 'MOVING',
      });
    },
    [updateMissionStatus]
  );

  const handleRobotArrival = useCallback(
    (data: SSEEventData) => {
      console.log('[SSE Context] 로봇 도착:', data);
      updateMissionStatus({
        status: 'ARRIVED',
      });
    },
    [updateMissionStatus]
  );

  const handleAuthSuccess = useCallback(
    (data: SSEEventData) => {
      console.log('[SSE Context] 사용자 인증 성공:', data);
      updateMissionStatus({
        status: 'UNLOCKED',
      });
    },
    [updateMissionStatus]
  );

  const handleUnlocked = useCallback(
    (data: SSEEventData) => {
      console.log('[SSE Context] 미션 잠금 해제:', data);
      updateMissionStatus({
        status: 'UNLOCKED',
      });
    },
    [updateMissionStatus]
  );

  const handleAborted = useCallback(
    (data: SSEEventData) => {
      console.log('[SSE Context] 미션 중단:', data);
      updateMissionStatus({
        status: 'ABORTED',
      });
    },
    [updateMissionStatus]
  );

  const handleLocked = useCallback(
    (data: SSEEventData) => {
      console.log('[SSE Context] 미션 잠금:', data);
      updateMissionStatus({
        status: 'LOCKED',
      });
    },
    [updateMissionStatus]
  );

  const handleError = useCallback(
    (error: Error) => {
      // 재연결이 필요한 경우
      if (error.message === 'RECONNECT_NEEDED' && isAuthenticated && accessToken) {
        console.log('[SSE Context] 재연결 시도...');
        managerRef.current.connect(accessToken);
        return;
      }

      console.error('[SSE Context] 에러:', error);
      setConnected(false);
      setConnectionError(error);
    },
    [isAuthenticated, accessToken, setConnected, setConnectionError]
  );

  const handleReconnectAttempt = useCallback(
    (attempt: number, maxAttempts: number) => {
      console.log(`[SSE Context] 재연결 시도 ${attempt}/${maxAttempts}`);
      incrementReconnectAttempts();
    },
    [incrementReconnectAttempts]
  );

  /**
   * 컴포넌트 재렌더링 시 콜백 함수 업데이트
   * 연결은 유지하면서 최신 콜백만 교체
   */
  useEffect(() => {
    managerRef.current.updateCallbacks({
      onConnect: handleConnect,
      onHeartbeat: handleHeartbeat,
      onRobotAssigned: handleRobotAssigned,
      onMissionStarted: handleMissionStarted,
      onRobotArrival: handleRobotArrival,
      onAuthSuccess: handleAuthSuccess,
      onUnlocked: handleUnlocked,
      onAborted: handleAborted,
      onLocked: handleLocked,
      onError: handleError,
      onReconnectAttempt: handleReconnectAttempt,
    });
  }, [
    handleConnect,
    handleHeartbeat,
    handleRobotAssigned,
    handleMissionStarted,
    handleRobotArrival,
    handleAuthSuccess,
    handleUnlocked,
    handleAborted,
    handleLocked,
    handleError,
    handleReconnectAttempt,
  ]);

  /**
   * 인증 상태와 미션 활성화 여부에 따라 연결/종료
   * ✅ 미션이 생성된 후에만 SSE 연결 시작 (/mission/track 진입 시)
   * ✅ 미션이 완료/취소되면 SSE 연결 종료
   * ✅ currentMission의 상태 변경(status 등)으로 인한 재연결 방지
   */
  const hasMission = useMissionStore((state) => state.currentMission !== null);
  const wasConnectedRef = useRef(false); // 연결 이력 추적

  useEffect(() => {
    // ✅ 조건: 인증 완료 + 토큰 있음 + 활성 미션 있음
    if (isAuthenticated && accessToken && hasMission) {
      console.log('[SSE Context] 미션 생성됨, SSE 연결 시작');
      managerRef.current.connect(accessToken);
      wasConnectedRef.current = true;
    } else if (wasConnectedRef.current) {
      // 이전에 연결된 적이 있는 경우만 로그 출력
      if (!isAuthenticated) {
        console.log('[SSE Context] 로그아웃, SSE 연결 종료');
      } else if (!hasMission) {
        console.log('[SSE Context] 미션 종료, SSE 연결 종료');
      }
      managerRef.current.disconnect();
      setConnected(false);
      wasConnectedRef.current = false;
    }

    // Cleanup: 컴포넌트 언마운트 시에만 실행
    return () => {
      // 이 cleanup은 SSEProvider가 언마운트될 때만 실행됩니다.
      // 연결된 적이 있을 때만 로그 출력
      if (wasConnectedRef.current) {
        console.log('[SSE Context] Provider 언마운트, 연결 종료');
      }
      managerRef.current.disconnect();
    };
  }, [isAuthenticated, accessToken, hasMission, setConnected]); // ✅ hasMission만 추적

  // Context 값 (Zustand store에서 직접 구독)
  const contextValue: SSEContextType = {
    isConnected: useMissionStore((state) => state.isConnected),
    reconnectAttempts: useMissionStore((state) => state.reconnectAttempts),
  };

  return <SSEContext.Provider value={contextValue}>{children}</SSEContext.Provider>;
};

/**
 * SSE Context Hook
 *
 * 컴포넌트에서 SSE 연결 상태를 확인할 때 사용합니다.
 * 실제 연결 관리는 SSEProvider에서만 이루어집니다.
 */
export const useSSE = (): SSEContextType => {
  const context = useContext(SSEContext);
  if (context === undefined) {
    throw new Error('useSSE must be used within SSEProvider');
  }
  return context;
};