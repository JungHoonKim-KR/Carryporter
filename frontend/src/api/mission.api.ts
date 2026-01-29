import apiClient from './axios';
import type {
  CreateMissionRequest,
  CreateMissionResponse,
  MissionStatusEvent,
  MissionStatus,
} from '../types/mission.types';

/**
 * 미션 생성 API
 *
 * @param data - 미션 생성 요청 데이터
 * @returns 생성된 미션 ID
 */
export const createMission = async (
  data: CreateMissionRequest
): Promise<CreateMissionResponse> => {
  const response = await apiClient.post<CreateMissionResponse>('/api/missions', data);
  return response.data;
};

/**
 * 미션 SSE 구독
 * EventSource를 사용하여 실시간으로 미션 상태를 구독합니다.
 *
 * @param missionId - 구독할 미션 ID
 * @param callbacks - SSE 이벤트 콜백 함수들
 * @returns cleanup 함수 (EventSource.close())
 */
export const subscribeMissionUpdates = (
  missionId: string,
  callbacks: {
    onConnect?: () => void;
    onStatus?: (status: MissionStatusEvent) => void;
    onError?: (error: Error) => void;
  }
): (() => void) => {
  const eventSource = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL}/api/missions/${missionId}/subscribe`,
    { withCredentials: true }
  );

  // CONNECT 이벤트: SSE 연결 성공 시
  eventSource.addEventListener('CONNECT', () => {
    console.log('[SSE] Connected to mission:', missionId);
    callbacks.onConnect?.();
  });

  // STATUS 이벤트: 미션 상태 변경 시
  eventSource.addEventListener('STATUS', (e) => {
    const status = e.data; // "REQUESTED", "ASSIGNED", "ARRIVED", etc.
    console.log('[SSE] Status update:', status);

    callbacks.onStatus?.({
      missionId,
      status: status as MissionStatus,
      timestamp: new Date().toISOString(),
    });
  });

  // 에러 처리
  eventSource.onerror = (error) => {
    console.error('[SSE] Connection error:', error);
    callbacks.onError?.(error as Error);
  };

  // Cleanup 함수 반환
  return () => {
    console.log('[SSE] Disconnecting from mission:', missionId);
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
