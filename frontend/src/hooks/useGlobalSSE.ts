import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useMissionStore } from "../store/missionStore";
import { subscribeMissionUpdates } from "../api/mission.api";
import type { SSEEventData } from "../types/mission.types";

/**
 * 전역 SSE 관리 훅
 *
 * ProtectedRoute에서 사용되어 인증 후 자동으로 SSE를 구독하고,
 * 페이지 이동과 무관하게 연결을 유지합니다.
 *
 * 주요 기능:
 * - Exponential Backoff 재연결 (1초 → 2초 → 4초 → ... → 60초)
 * - 최대 10회 재시도
 * - Heartbeat 모니터링 (백엔드에서 15초마다 heartbeat 이벤트 전송)
 * - Heartbeat 타임아웃 (60초 동안 이벤트 미수신 시 재연결)
 */
export const useGlobalSSE = () => {
    const { isAuthenticated, accessToken } = useAuthStore();
    const {
        setConnected,
        setConnectionError,
        incrementReconnectAttempts,
        resetReconnectAttempts,
        updateMissionStatus,
    } = useMissionStore();

    const reconnectTimerRef = useRef<number | null>(null);
    const heartbeatTimerRef = useRef<number | null>(null);
    const eventSourceRef = useRef<(() => void) | null>(null);

    // Exponential Backoff 계산 (1초 → 2초 → 4초 → ... → 60초)
    const calculateDelay = useCallback((attemptCount: number): number => {
        return Math.min(Math.pow(2, attemptCount) * 1000, 60000);
    }, []);

    // ✅ Heartbeat 타이머 리셋 (백엔드에서 15초마다 heartbeat 이벤트 전송)
    // 60초 동안 이벤트 미수신 시 재연결
    const HEARTBEAT_TIMEOUT = 60000; // 60초

    const resetHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) {
            clearTimeout(heartbeatTimerRef.current);
        }

        heartbeatTimerRef.current = setTimeout(() => {
            console.warn("[SSE] Heartbeat 타임아웃 - 60초 동안 이벤트 미수신");
            setConnected(false);
            // 재연결은 reconnect 함수를 통해 처리
            if (reconnectTimerRef.current)
                clearTimeout(reconnectTimerRef.current);
            reconnect();
        }, HEARTBEAT_TIMEOUT);
    }, [setConnected]);

    // 재연결 함수
    const reconnect = useCallback(() => {
        const currentAttempts = useMissionStore.getState().reconnectAttempts;
        const maxAttempts = useMissionStore.getState().maxReconnectAttempts;

        if (currentAttempts >= maxAttempts) {
            console.error("[SSE] 최대 재연결 횟수 초과");
            setConnectionError(new Error("최대 재연결 횟수 초과"));
            return;
        }

        const delay = calculateDelay(currentAttempts);
        console.log(
            `[SSE] ${delay}ms 후 재연결... (${currentAttempts + 1}/${maxAttempts})`,
        );

        reconnectTimerRef.current = setTimeout(() => {
            incrementReconnectAttempts();
            connect();
        }, delay);
    }, [calculateDelay, incrementReconnectAttempts, setConnectionError]);

    // SSE 연결
    const connect = useCallback(() => {
        if (!isAuthenticated || !accessToken) {
            console.warn("[SSE] 인증 정보 없음, 구독 중단");
            return;
        }

        // 기존 연결 종료
        if (eventSourceRef.current) {
            console.log("[SSE] 기존 연결 종료");
            eventSourceRef.current();
        }

        console.log("[SSE] 구독 시작");

        const unsubscribe = subscribeMissionUpdates({
            onConnect: () => {
                console.log("[SSE] 연결 성공");
                setConnected(true);
                setConnectionError(null);
                resetReconnectAttempts();
                resetHeartbeat(); // ✅ Heartbeat 타이머 시작
            },

            onRobotAssigned: (data: SSEEventData) => {
                console.log("[SSE] 로봇 배정:", data);
                updateMissionStatus({
                    status: "ASSIGNED",
                    robotCode: data.robotCode,
                });
                resetHeartbeat(); // ✅ 이벤트 수신 시 타이머 리셋
            },

            onMissionStarted: (data: SSEEventData) => {
                console.log("[SSE] 미션 시작:", data);
                updateMissionStatus({
                    status: "MOVING",
                });
                resetHeartbeat(); // ✅ 이벤트 수신 시 타이머 리셋
            },

            onRobotArrival: (data: SSEEventData) => {
                console.log("[SSE] 로봇 도착:", data);
                updateMissionStatus({
                    status: "ARRIVED",
                });
                resetHeartbeat(); // ✅ 이벤트 수신 시 타이머 리셋
            },

            onAuthSuccess: (data: SSEEventData) => {
                console.log("[SSE] 사용자 인증 성공:", data);
                updateMissionStatus({
                    status: "UNLOCKED",
                });
                resetHeartbeat(); // ✅ 이벤트 수신 시 타이머 리셋
            },

            onUnlocked: (data: SSEEventData) => {
                console.log("[SSE] 미션 잠금 해제:", data);
                updateMissionStatus({
                    status: "UNLOCKED",
                });
                resetHeartbeat(); // ✅ 이벤트 수신 시 타이머 리셋
            },

            onAborted: (data: SSEEventData) => {
                console.log("[SSE] 미션 중단:", data);
                updateMissionStatus({
                    status: "ABORTED",
                });
                resetHeartbeat(); // ✅ 이벤트 수신 시 타이머 리셋
            },

            onLocked: (data: SSEEventData) => {
                console.log("[SSE] 미션 잠금:", data);
                updateMissionStatus({
                    status: "LOCKED",
                });
                resetHeartbeat(); // ✅ 이벤트 수신 시 타이머 리셋
            },

            onError: (error: Error) => {
                console.error("[SSE] 연결 에러:", error);
                setConnected(false);
                setConnectionError(error);
                reconnect(); // 자동 재연결
            },
        });

        eventSourceRef.current = unsubscribe;
    }, [
        isAuthenticated,
        accessToken,
        setConnected,
        setConnectionError,
        resetReconnectAttempts,
        resetHeartbeat,
        updateMissionStatus,
        reconnect,
    ]);

    // 마운트 시 연결, 로그아웃 시 종료
    useEffect(() => {
        if (isAuthenticated) {
            console.log("[SSE] ProtectedRoute 진입, SSE 구독 시작");
            connect();
        } else {
            console.log("[SSE] 로그아웃, SSE 구독 종료");
        }

        return () => {
            console.log("[SSE] Cleanup: 연결 종료");
            if (eventSourceRef.current) eventSourceRef.current();
            if (reconnectTimerRef.current)
                clearTimeout(reconnectTimerRef.current);
            if (heartbeatTimerRef.current)
                clearTimeout(heartbeatTimerRef.current); // ✅ Heartbeat 타이머 종료
        };
    }, [isAuthenticated, connect]);

    return {
        isConnected: useMissionStore((state) => state.isConnected),
        reconnectAttempts: useMissionStore((state) => state.reconnectAttempts),
    };
};
