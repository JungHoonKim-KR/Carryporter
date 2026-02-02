import apiClient from './axios';
import { EventSourcePolyfill } from 'event-source-polyfill';
import type {
  CreateMissionRequest,
  CreateMissionResponse,
  SSEEventData,
} from '../types/mission.types';
import { useAuthStore } from '../store/authStore';

/**
 * 미션 생성 API
 *
 * @param data - 미션 생성 요청 데이터
 * @returns 생성된 미션 ID
 */
export const createMission = async (
  data: CreateMissionRequest
): Promise<CreateMissionResponse> => {
  // 백엔드는 callLocationId만 필요 (userId는 JWT에서 자동 추출)
  const requestData = {
    callLocationId: data.callLocationId,
  };

  // 🔍 디버깅: 전송되는 데이터 확인
  if (import.meta.env.DEV) {
    console.log('[createMission] 전송 데이터:', JSON.stringify(requestData, null, 2));
  }

  const response = await apiClient.post<CreateMissionResponse>(
    '/api/missions',
    requestData
  );
  return response.data;
};

/**
 * SSE 구독 - 실시간 이벤트 수신
 * EventSourcePolyfill을 사용하여 Bearer Token 헤더와 함께 SSE를 구독합니다.
 *
 * @param callbacks - SSE 이벤트별 콜백 함수
 * @returns cleanup 함수 (EventSource.close())
 */
export const subscribeMissionUpdates = (
  callbacks: {
    onConnect?: () => void;
    onRobotAssigned?: (data: SSEEventData) => void;
    onMissionStarted?: (data: SSEEventData) => void;
    onRobotArrival?: (data: SSEEventData) => void;
    onAuthSuccess?: (data: SSEEventData) => void;
    onUnlocked?: (data: SSEEventData) => void;
    onAborted?: (data: SSEEventData) => void;
    onLocked?: (data: SSEEventData) => void;
    onError?: (error: Error) => void;
  }
): (() => void) => {
  // AccessToken 가져오기
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error('AccessToken이 없습니다. 로그인이 필요합니다.');
  }

  // EventSourcePolyfill 생성 (Bearer Token 포함)
  const eventSource = new EventSourcePolyfill(
    `${import.meta.env.VITE_API_BASE_URL}/api/sse/subscribe`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      heartbeatTimeout: 60000, // 1분
    }
  );

  // 1. Connect 이벤트
  eventSource.addEventListener('Connect', (e: any) => {
    if (import.meta.env.DEV) console.log('[SSE] Connected:', e.data);
    callbacks.onConnect?.();
  });

  // 2. RobotAssignedEvent
  eventSource.addEventListener('RobotAssignedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Robot Assigned:', data);
    callbacks.onRobotAssigned?.(data);
  });

  // 3. MissionStartedEvent
  eventSource.addEventListener('MissionStartedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Mission Started:', data);
    callbacks.onMissionStarted?.(data);
  });

  // 4. RobotArrivalEvent
  eventSource.addEventListener('RobotArrivalEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Robot Arrival:', data);
    callbacks.onRobotArrival?.(data);
  });

  // 5. UserAuthSuccessEvent
  eventSource.addEventListener('UserAuthSuccessEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Auth Success:', data);
    callbacks.onAuthSuccess?.(data);
  });

  // 6. MissionUnlockedEvent
  eventSource.addEventListener('MissionUnlockedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Unlocked:', data);
    callbacks.onUnlocked?.(data);
  });

  // 7. MissionAbortedEvent
  eventSource.addEventListener('MissionAbortedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Aborted:', data);
    callbacks.onAborted?.(data);
  });

  // 8. MissionLockedEvent
  eventSource.addEventListener('MissionLockedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Locked:', data);
    callbacks.onLocked?.(data);
  });

  // 에러 처리
  eventSource.onerror = (error) => {
    if (import.meta.env.DEV) console.error('[SSE] Connection error:', error);
    callbacks.onError?.(new Error('SSE connection error'));
    eventSource.close();
  };

  // Cleanup 함수
  return () => {
    if (import.meta.env.DEV) console.log('[SSE] Disconnecting');
    eventSource.close();
  };
};

/**
 * 사용자 잠금 해제 (비밀번호 인증)
 * ARRIVED 상태에서 호출하여 로봇의 잠금을 해제합니다.
 *
 * @param missionId - 인증할 미션 ID
 * @param password - 4자리 비밀번호
 */
export const verifyMission = async (
  missionId: string,
  password: number
): Promise<void> => {
  await apiClient.patch(`/api/missions/${missionId}/verify`, { password });
  // Response: 204 No Content
};
