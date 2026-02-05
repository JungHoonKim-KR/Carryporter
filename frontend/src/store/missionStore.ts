import { create } from 'zustand';
import type { Mission, MissionStatus, MissionType } from '../types/mission.types';
import type { CurrentLocker } from '../types/locker.types';

interface MissionState {
  // 미션 정보
  currentMission: Mission | null;

  // 현재 사물함 (API에서 조회, localStorage 사용 안 함)
  currentLocker: CurrentLocker | null;

  // SSE 연결 상태
  isConnected: boolean;
  connectionError: Error | null;

  // ✅ 재연결 관련 상태
  reconnectAttempts: number;          // 현재 재시도 횟수
  maxReconnectAttempts: number;       // 최대 재시도 (10회)
  lastConnectedAt: string | null;     // 마지막 연결 시간
  connectionQuality: 'good' | 'poor' | 'disconnected'; // 연결 품질

  // 로딩 상태
  isCreating: boolean;
  isVerifying: boolean;

  // 액션
  setCurrentMission: (mission: Mission) => void;
  updateMissionStatus: (update: { status: MissionStatus; robotCode?: string }) => void;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: Error | null) => void;
  clearMission: () => void;

  // ✅ 재연결 관련 액션
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  setConnectionQuality: (quality: 'good' | 'poor' | 'disconnected') => void;
  setCreating: (creating: boolean) => void;
  setVerifying: (verifying: boolean) => void;

  // 미션 타입 설정 (보관/반납)
  setMissionType: (missionType: MissionType) => void;

  // 현재 사물함 관리
  setCurrentLocker: (locker: CurrentLocker | null) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  currentMission: null,
  currentLocker: null,
  isConnected: false,
  connectionError: null,

  // ✅ 재연결 초기값
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  lastConnectedAt: null,
  connectionQuality: 'disconnected',

  isCreating: false,
  isVerifying: false,

  setCurrentMission: (mission) => set({ currentMission: mission }),

  updateMissionStatus: (status) =>
    set((state) => ({
      currentMission: state.currentMission
        ? {
          ...state.currentMission,
          status: status.status,
          robotCode: status.robotCode || state.currentMission.robotCode,
        }
        : null,
    })),

  setConnected: (connected) => set({ isConnected: connected }),
  setConnectionError: (error) => set({ connectionError: error }),

  clearMission: () =>
    set({
      currentMission: null,
      currentLocker: null, // 미션 종료 시 사물함도 초기화
      isConnected: false,
      connectionError: null,
    }),

  // ✅ 재연결 액션 구현
  incrementReconnectAttempts: () =>
    set((state) => {
      const newAttempts = state.reconnectAttempts + 1;
      return {
        reconnectAttempts: newAttempts,
        connectionQuality: newAttempts > 3 ? 'poor' : state.connectionQuality,
      };
    }),

  resetReconnectAttempts: () =>
    set({
      reconnectAttempts: 0,
      connectionQuality: 'good',
      lastConnectedAt: new Date().toISOString(),
    }),

  setConnectionQuality: (quality) => set({ connectionQuality: quality }),

  setCreating: (creating) => set({ isCreating: creating }),
  setVerifying: (verifying) => set({ isVerifying: verifying }),

  /**
   * 미션 타입 설정 (보관/반납)
   */
  setMissionType: (missionType) =>
    set((state) => ({
      currentMission: state.currentMission
        ? { ...state.currentMission, missionType }
        : null,
    })),

  /**
   * 현재 사물함 설정 (API에서 조회한 값)
   */
  setCurrentLocker: (locker) => set({ currentLocker: locker }),
}));

