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
 */
export const createMission = async (
  data: CreateMissionRequest
): Promise<CreateMissionResponse> => {
  // 기존 로직 유지
  const requestData = { "callLocationId": 1 }; 
  const response = await apiClient.post<CreateMissionResponse>(
    '/api/missions',
    requestData
  );
  return response.data;
};

/**
 * SSE 구독 - 실시간 이벤트 수신
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
  const token = useAuthStore.getState().accessToken;
  if (!token) throw new Error('AccessToken이 없습니다.');

  const sseUrl = import.meta.env.DEV
    ? '/api/sse/subscribe'
    : `${import.meta.env.VITE_API_URL}/api/sse/subscribe`;

  const eventSource = new EventSourcePolyfill(sseUrl, {
    headers: { 'Authorization': `Bearer ${token}` },
    heartbeatTimeout: 60000,
  });

  // 1. CONNECT 이벤트 (인자 없음)
  eventSource.addEventListener('CONNECT', () => {
    if (import.meta.env.DEV) console.log('[SSE] Connected');
    callbacks.onConnect?.();
  });

  // 2. 데이터가 필요한 이벤트 리스트 (인자 1개)
  const dataEvents = [
    { name: 'RobotAssignedEvent', cb: callbacks.onRobotAssigned },
    { name: 'MissionStartedEvent', cb: callbacks.onMissionStarted },
    { name: 'RobotArrivalEvent', cb: callbacks.onRobotArrival },
    { name: 'UserAuthSuccessEvent', cb: callbacks.onAuthSuccess },
    { name: 'MissionUnlockedEvent', cb: callbacks.onUnlocked },
    { name: 'MissionAbortedEvent', cb: callbacks.onAborted },
    { name: 'MissionLockedEvent', cb: callbacks.onLocked },
  ] as const;

  dataEvents.forEach(({ name, cb }) => {
    eventSource.addEventListener(name, (e: any) => {
      if (import.meta.env.DEV) console.log(`[SSE] ${name}:`, e.data);
      try {
        const parsedData: SSEEventData = JSON.parse(e.data);
        if (cb) cb(parsedData); // 인자 전달 보장
      } catch (err) {
        console.error(`[SSE] ${name} 파싱 실패:`, err);
      }
    });
  });

  eventSource.onerror = (error: any) => {
    if (import.meta.env.DEV) console.error('[SSE] Connection error:', error);
    callbacks.onError?.(new Error('SSE connection error'));
    if (error.status === 401) eventSource.close();
  };

  return () => {
    if (import.meta.env.DEV) console.log('[SSE] Disconnecting');
    eventSource.close();
  };
};

/**
 * 사용자 잠금 해제 (비밀번호 인증)
 */
export const verifyMission = async (
  missionId: string,
  password: number
): Promise<void> => {
  await apiClient.post(`/api/auth/unlock`, { missionId, password });
};

/**
 * 사물함 잠금
 */
export const lockMission = async (missionId: number): Promise<void> => {
  await apiClient.post(`/api/auth/lock`,{missionId});
};

/**
 * 로봇 복귀 요청
 */
export const returnMission = async (missionId: number): Promise<void> => {
  await apiClient.post(`/api/missions/${missionId}/return`);
};