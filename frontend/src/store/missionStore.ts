import { create } from "zustand";
import type {
    Mission,
    MissionStatus,
    MissionType,
} from "../types/mission.types";
import type { CurrentLocker } from "../types/locker.types";
import { missionStorage } from "../services/storage/missionStorage";

interface MissionState {
    // 미션 정보
    currentMission: Mission | null;

    // 현재 사물함 (API에서 조회, localStorage 사용 안 함)
    currentLocker: CurrentLocker | null;

    // 액션
    setCurrentMission: (mission: Mission) => void;
    updateMissionStatus: (update: {
        status: MissionStatus;
        robotCode?: string;
    }) => void;
    clearMission: () => void;

    // 미션 타입 설정 (보관/반납)
    setMissionType: (missionType: MissionType) => void;

    // 현재 사물함 관리
    setCurrentLocker: (locker: CurrentLocker | null) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
    currentMission: null,
    currentLocker: null,

    setCurrentMission: (mission) => {
        missionStorage.saveMission(mission); // localStorage 저장
        set({ currentMission: mission });
    },

    updateMissionStatus: (status) =>
        set((state) => {
            if (!state.currentMission) return {};

            const updated = {
                ...state.currentMission,
                status: status.status,
                robotCode: status.robotCode || state.currentMission.robotCode,
                updatedAt: new Date().toISOString(), // 타임스탬프 갱신
            };

            missionStorage.saveMission(updated); // localStorage 저장
            return { currentMission: updated };
        }),

    clearMission: () => {
        missionStorage.clearMission(); // localStorage 삭제
        set({
            currentMission: null,
            currentLocker: null,
        });
    },

    /**
     * 미션 타입 설정 (보관/반납)
     */
    setMissionType: (missionType) =>
        set((state) => {
            if (!state.currentMission) return {};

            const updated = {
                ...state.currentMission,
                missionType,
                updatedAt: new Date().toISOString(), // 타임스탬프 갱신
            };

            missionStorage.saveMission(updated); // localStorage 저장
            return { currentMission: updated };
        }),

    /**
     * 현재 사물함 설정 (API에서 조회한 값)
     */
    setCurrentLocker: (locker) => set({ currentLocker: locker }),
}));
