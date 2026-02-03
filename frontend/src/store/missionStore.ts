import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mission, MissionStatusEvent, MissionType, StoredLuggage } from '../types/mission.types';

interface MissionState {
  // 미션 정보
  currentMission: Mission | null;

  // 보관된 짐 목록 (localStorage에 영구 저장)
  storedLuggages: StoredLuggage[];

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

  // 무게 애니메이션 상태
  isWeightAnimating: boolean;

  // 액션
  setCurrentMission: (mission: Mission) => void;
  updateMissionStatus: (status: MissionStatusEvent) => void;
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: Error | null) => void;
  clearMission: () => void;

  // ✅ 재연결 관련 액션
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  setConnectionQuality: (quality: 'good' | 'poor' | 'disconnected') => void;
  setCreating: (creating: boolean) => void;
  setVerifying: (verifying: boolean) => void;
  setWeightAnimating: (animating: boolean) => void;

  // 무게 정보 생성 (LOCKED 상태일 때 호출)
  generateWeightInfo: () => void;

  // 미션 타입 설정 (보관/반납)
  setMissionType: (missionType: MissionType) => void;

  // 보관된 짐 관리
  addStoredLuggage: (luggage: StoredLuggage) => void;
  removeStoredLuggage: (luggageId: string) => void;
  hasStoredLuggages: () => boolean;
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      currentMission: null,
      storedLuggages: [],
      isConnected: false,
      connectionError: null,

      // ✅ 재연결 초기값
      reconnectAttempts: 0,
      maxReconnectAttempts: 10,
      lastConnectedAt: null,
      connectionQuality: 'disconnected',

      isCreating: false,
      isVerifying: false,
      isWeightAnimating: false,

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
          isConnected: false,
          connectionError: null,
          isWeightAnimating: false,
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
      setWeightAnimating: (animating) => set({ isWeightAnimating: animating }),

      /**
       * 무게 정보 랜덤 생성
       * LOCKED 상태일 때 호출하여 프론트엔드에서 무게 데이터를 생성합니다.
       */
      generateWeightInfo: () =>
        set((state) => {
          const luggageWeight = Math.random() * 20 + 5; // 5-25kg 랜덤

          if (import.meta.env.DEV) console.log('[MissionStore] 무게 정보 생성:', {
            luggageWeight: luggageWeight.toFixed(1),
          });

          return {
            currentMission: state.currentMission
              ? {
                ...state.currentMission,
                weightInfo: {
                  initialWeight: 0, // 카트 무게 제거
                  finalWeight: parseFloat(luggageWeight.toFixed(1)),
                  luggageWeight: parseFloat(luggageWeight.toFixed(1)),
                },
              }
              : null,
          };
        }),

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
       * 보관된 짐 추가
       */
      addStoredLuggage: (luggage) =>
        set((state) => ({
          storedLuggages: [...state.storedLuggages, luggage],
        })),

      /**
       * 보관된 짐 제거 (반납 완료 시)
       */
      removeStoredLuggage: (luggageId) =>
        set((state) => ({
          storedLuggages: state.storedLuggages.filter((l) => l.id !== luggageId),
        })),

      /**
       * 보관된 짐이 있는지 확인
       */
      hasStoredLuggages: () => get().storedLuggages.length > 0,
    }),
    {
      name: 'mission-storage', // localStorage 키
      partialize: (state) => ({ storedLuggages: state.storedLuggages }), // storedLuggages만 저장
    }
  )
);

