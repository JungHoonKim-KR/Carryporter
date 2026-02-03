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
    onHeartbeat?: () => void; // ✅ Heartbeat 이벤트 (백엔드에서 15초마다 전송)
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

  // ✅ 개발 환경: Vite 프록시 사용 (CORS 우회)
  // ✅ 프로덕션 환경: 전체 URL 사용
  const sseUrl = import.meta.env.DEV
    ? '/api/sse/subscribe'
    : `${import.meta.env.VITE_API_BASE_URL}/api/sse/subscribe`;

  if (import.meta.env.DEV) {
    console.log('[SSE] 개발 모드 - 프록시 경로 사용:', sseUrl);
  }

  // EventSourcePolyfill 생성 (Bearer Token 포함)
  const eventSource = new EventSourcePolyfill(sseUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    heartbeatTimeout: 60000, // 1분
  });

  // 1. Connect 이벤트
  eventSource.addEventListener('Connect', (e: any) => {
    if (import.meta.env.DEV) console.log('[SSE] Connected:', e.data);
    callbacks.onConnect?.();
  });

  // 2. Heartbeat 이벤트 (백엔드에서 15초마다 전송)
  eventSource.addEventListener('heartbeat', (e: any) => {
    if (import.meta.env.DEV) console.debug('[SSE] Heartbeat:', e.data);
    callbacks.onHeartbeat?.();
  });

  // 3. RobotAssignedEvent
  eventSource.addEventListener('RobotAssignedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Robot Assigned:', data);
    callbacks.onRobotAssigned?.(data);
  });

  // 4. MissionStartedEvent
  eventSource.addEventListener('MissionStartedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Mission Started:', data);
    callbacks.onMissionStarted?.(data);
  });

  // 5. RobotArrivalEvent
  eventSource.addEventListener('RobotArrivalEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Robot Arrival:', data);
    callbacks.onRobotArrival?.(data);
  });

  // 6. UserAuthSuccessEvent
  eventSource.addEventListener('UserAuthSuccessEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Auth Success:', data);
    callbacks.onAuthSuccess?.(data);
  });

  // 7. MissionUnlockedEvent
  eventSource.addEventListener('MissionUnlockedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Unlocked:', data);
    callbacks.onUnlocked?.(data);
  });

  // 8. MissionAbortedEvent
  eventSource.addEventListener('MissionAbortedEvent', (e: any) => {
    const data: SSEEventData = JSON.parse(e.data);
    if (import.meta.env.DEV) console.log('[SSE] Aborted:', data);
    callbacks.onAborted?.(data);
  });

  // 9. MissionLockedEvent
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
 * @returns 성공 메시지
 */
export const verifyMission = async (
  missionId: number,
  password: number
): Promise<string> => {
  console.log('[verifyMission API] 호출됨', { missionId, password });
  const response = await apiClient.post<string>('/api/auth/unlock', {
    missionId,
    password
  });
  console.log('[verifyMission API] 성공', response.data);
  return response.data; // "비밀번호 인증 요청 성공"
};

/**
 * 미션 잠금 API
 * UNLOCKED 상태에서 사용자가 짐을 넣은 후 호출하여 로봇을 잠금합니다.
 *
 * @param missionId - 잠금할 미션 ID
 * @returns 성공 메시지
 */
export const lockMission = async (missionId: number): Promise<string> => {
  console.log('[lockMission API] 호출됨', { missionId });
  const response = await apiClient.post<string>('/api/auth/lock', {
    missionId
  });
  console.log('[lockMission API] 성공', response.data);
  return response.data; // "잠금 요청 성공"
};

/**
 * 로봇 복귀 API
 * 보관/반납 완료 후 로봇을 원래 위치로 복귀시킵니다.
 *
 * @param missionId - 미션 ID
 */
export const returnMission = async (missionId: number): Promise<void> => {
  await apiClient.post(`/api/missions/${missionId}/return`);
};
