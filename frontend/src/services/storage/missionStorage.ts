import type { Mission } from "@/types/mission.types";

const MISSION_KEY = "currentMission";

/**
 * 타입 가드: localStorage 데이터가 유효한 Mission인지 검증
 */
function isMission(obj: unknown): obj is Mission {
    if (!obj || typeof obj !== "object") return false;
    const m = obj as Record<string, unknown>;

    return (
        typeof m.id === "string" &&
        typeof m.userId === "number" &&
        typeof m.startLocation === "number" &&
        typeof m.endLocation === "number" &&
        typeof m.status === "string" &&
        typeof m.createdAt === "string" &&
        typeof m.updatedAt === "string"
    );
}

/**
 * 미션 정보 localStorage 관리 서비스
 *
 * ticketStorage 패턴을 따라 구현
 * 백엔드 조회 API가 없으므로 전체 Mission 객체를 저장
 */
export const missionStorage = {
    /**
     * 미션 저장 (전체 객체)
     */
    saveMission: (mission: Mission): void => {
        try {
            localStorage.setItem(MISSION_KEY, JSON.stringify(mission));
            if (import.meta.env.DEV) {
                console.log("[MissionStorage] Saved:", mission.id);
            }
        } catch (error) {
            console.error("[MissionStorage] Save failed:", error);
            // localStorage quota 초과 시 기존 데이터 삭제 후 재시도
            if (
                error instanceof DOMException &&
                error.name === "QuotaExceededError"
            ) {
                console.warn(
                    "[MissionStorage] Quota exceeded, clearing and retrying"
                );
                localStorage.removeItem(MISSION_KEY);
                try {
                    localStorage.setItem(MISSION_KEY, JSON.stringify(mission));
                } catch (retryError) {
                    console.error(
                        "[MissionStorage] Retry failed:",
                        retryError
                    );
                }
            }
        }
    },

    /**
     * 미션 조회 (타입 검증 포함)
     *
     * IMPORTANT: STORING 상태는 유지!
     * - 백엔드가 STORING 상태 미션을 재사용하므로
     * - 재호출 시 같은 missionId를 받기 위해 STORING 상태 유지 필수
     */
    getMission: (): Mission | null => {
        try {
            const item = localStorage.getItem(MISSION_KEY);
            if (!item) return null;

            const parsed = JSON.parse(item);

            // 타입 검증
            if (!isMission(parsed)) {
                console.error(
                    "[MissionStorage] Invalid mission data:",
                    parsed
                );
                missionStorage.clearMission(); // 잘못된 데이터 삭제
                return null;
            }

            // ✅ FINISHED와 FAILED만 삭제, STORING은 유지!
            if (parsed.status === "FINISHED" || parsed.status === "FAILED") {
                if (import.meta.env.DEV) {
                    console.log(
                        "[MissionStorage] Mission completed, clearing:",
                        parsed.status
                    );
                }
                missionStorage.clearMission();
                return null;
            }

            // STORING 상태는 반환 (재호출 시 같은 missionId 받기 위함)
            if (import.meta.env.DEV) {
                console.log(
                    "[MissionStorage] Restored mission:",
                    parsed.id,
                    "status:",
                    parsed.status
                );
            }
            return parsed;
        } catch (error) {
            console.error("[MissionStorage] Parse failed:", error);
            missionStorage.clearMission();
            return null;
        }
    },

    /**
     * 미션 삭제
     */
    clearMission: (): void => {
        localStorage.removeItem(MISSION_KEY);
        if (import.meta.env.DEV) {
            console.log("[MissionStorage] Cleared");
        }
    },
};
