import { useEffect } from "react";
import { useMissionStore } from "../store/missionStore";
import { subscribeMissionUpdates } from "../api/mission.api";

export const useMissionSSE = () => {
    // ✅ getState() 대신 selector를 써야 리액트가 변경을 감지합니다.
    const currentMission = useMissionStore((state) => state.currentMission);
    const {
        setConnected,
        setConnectionError,
        updateMissionStatus,
        setUnifiedFlowStep,
    } = useMissionStore();

    useEffect(() => {
        // 미션이 없으면 대기 (미션이 생기면 이 useEffect가 다시 실행됨)
        if (!currentMission || !currentMission.id) {
            console.log("[useMissionSSE] 구독 대기: 진행 중인 미션 없음");
            return;
        }

        console.log(`[useMissionSSE] 구독 시도: Mission ${currentMission.id}`);

        const unsubscribe = subscribeMissionUpdates({
            onConnect: () => {
                setConnected(true);
                setConnectionError(null);
            },
            onRobotAssigned: (data) => {
                updateMissionStatus({
                    status: "ASSIGNED",
                    robotCode: data.robotCode,
                });
            },
            onMissionStarted: (data) => {
                updateMissionStatus({
                    status: "MOVING",
                    robotCode: data.robotCode,
                });
            },
            onRobotArrival: (data) => {
                updateMissionStatus({
                    status: "ARRIVED",
                    robotCode: data.robotCode,
                });
            },
            onUnlocked: (_data) => {
                updateMissionStatus({
                    status: "UNLOCKED",
                });
            },
            onLocked: (_data) => {
                updateMissionStatus({
                    status: "LOCKED",
                });
            },
            onAborted: (data) => {
                alert(data.msg);
                updateMissionStatus({
                    status: "FINISHED",
                });
            },
            onError: (error) => {
                setConnected(false);
                setConnectionError(error);
            },
        });

        // Cleanup: 미션이 바뀌거나 언마운트 시 연결 종료
        return () => {
            console.log("[useMissionSSE] 연결 종료 및 정리");
            unsubscribe();
        };
    }, [currentMission?.id]); // ✨ 미션 ID가 생기는 순간 구독이 시작됩니다.

    const { isConnected, connectionError } = useMissionStore();
    return { isConnected, connectionError };
};
