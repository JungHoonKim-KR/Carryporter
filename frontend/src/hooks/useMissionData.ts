import { useEffect } from "react";
import { useMissionStore } from "@/store/missionStore";
import { missionStorage } from "@/services/storage/missionStorage";

/**
 * 미션 데이터 자동 복원 훅
 *
 * 컴포넌트 마운트 시 localStorage에서 미션 정보를 복원하여
 * missionStore에 설정합니다.
 *
 * ticketStore의 useTicketData와 동일한 패턴을 따릅니다.
 *
 * @example
 * // MissionTrackPage에서 사용
 * function MissionTrackPage() {
 *   const { currentMission } = useMissionData();
 *
 *   if (!currentMission) return <NoMissionMessage />;
 *
 *   return <MissionTracker mission={currentMission} />;
 * }
 */
export const useMissionData = () => {
    const { currentMission, setCurrentMission } = useMissionStore();

    useEffect(() => {
        // 이미 Store에 미션이 있으면 복원 불필요
        if (currentMission) {
            if (import.meta.env.DEV) {
                console.log("[useMissionData] Mission already exists in store");
            }
            return;
        }

        // localStorage에서 미션 복원
        const savedMission = missionStorage.getMission();

        if (savedMission) {
            if (import.meta.env.DEV) {
                console.log(
                    "[useMissionData] Restored mission:",
                    savedMission.id,
                    "status:",
                    savedMission.status
                );
            }
            setCurrentMission(savedMission);
        } else {
            if (import.meta.env.DEV) {
                console.log("[useMissionData] No mission to restore");
            }
        }
    }, [currentMission, setCurrentMission]);

    return {
        currentMission,
        isRestoring: false, // 동기 작업이므로 로딩 상태 불필요
    };
};
