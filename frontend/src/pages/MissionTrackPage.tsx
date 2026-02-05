import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMissionStore } from "../store/missionStore";
import { Button } from "@/components/ui/button";
import { VerificationModal } from "../components/mission/VerificationModal";
import { ChecklistModal } from "../components/mission/ChecklistModal";
import { ReturningModal } from "../components/mission/ReturningModal";
import { CompleteModal } from "../components/mission/CompleteModal";
import { TimelineStep } from "../components/mission/TimelineStep";
import { ProgressBar } from "../components/mission/ProgressBar";
import { AnimatePresence, motion } from "framer-motion";

/**
 * 미션 추적 페이지
 * 상태별 모달 표시 (배경은 항상 타임라인이 흐릿하게 보임):
 * - ARRIVED: 인증 모달
 * - UNLOCKED: 체크리스트 모달
 * - 복귀 완료: 완료 모달
 */
const MissionTrackPage = () => {
    const navigate = useNavigate();
    const {
        currentMission,
        clearMission,
        isConnected,
        connectionQuality,
        reconnectAttempts,
        updateMissionStatus,
    } = useMissionStore();

    // 플로우 단계 상태 (모달 전환용)
    const [flowStep, setFlowStep] = useState<
        "none" | "checklist" | "returning" | "complete"
    >("none");

    // 연결 상태 UI
    const connectionStatus = useMemo(() => {
        if (!isConnected && reconnectAttempts > 0) {
            return {
                label: `재연결 중... (${reconnectAttempts}/10)`,
                color: "bg-yellow-50 text-yellow-600",
                dotColor: "bg-yellow-500",
                animate: true,
            };
        }
        if (isConnected && connectionQuality === "poor") {
            return {
                label: "연결 불안정",
                color: "bg-orange-50 text-orange-600",
                dotColor: "bg-orange-500",
                animate: false,
            };
        }
        if (isConnected) {
            return {
                label: "실시간",
                color: "bg-toss-green/20 text-toss-green",
                dotColor: "bg-toss-green",
                animate: true,
            };
        }
        return {
            label: "연결 끊김",
            color: "bg-red-50 text-red-500",
            dotColor: "bg-red-500",
            animate: false,
        };
    }, [isConnected, connectionQuality, reconnectAttempts]);

    // 인증 성공 → 체크리스트 모달
    const handleVerificationSuccess = () => {
        updateMissionStatus({ status: "UNLOCKED" });
        setFlowStep("checklist");
    };

    // 복귀 API 호출 성공 → 복귀 중 모달
    const handleReturnSuccess = () => {
        updateMissionStatus({ status: "RETURNING" });
        setFlowStep("returning");
    };

    // SSE에서 RETURNED 이벤트 수신 시 완료 모달로 전환
    useEffect(() => {
        if (currentMission?.status === "RETURNED" && flowStep === "returning") {
            setFlowStep("complete");
        }
    }, [currentMission?.status, flowStep]);

    // 미션 완료
    const handleComplete = () => {
        clearMission();
        navigate("/home");
    };

    // 미션 정보가 없으면 홈으로
    if (!currentMission) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-6">미션 정보가 없습니다.</p>
                    <Button
                        onClick={() => navigate("/home")}
                        className="bg-toss-blue-500 text-white"
                    >
                        홈으로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    const status = currentMission.status;

    // 진행률 계산 (0-5단계)
    const progressStep = useMemo(() => {
        switch (status) {
            case "REQUESTED":
                return 1;
            case "ASSIGNED":
                return 2;
            case "MOVING":
                return 3;
            case "ARRIVED":
            case "UNLOCKED":
            case "LOCKED":
                return 4;
            case "RETURNING":
            case "RETURNED":
            case "FINISHED":
                return 5;
            default:
                return 0;
        }
    }, [status]);

    // 모달 표시 조건
    const showVerifyModal = status === "ARRIVED" && flowStep === "none";
    const showChecklistModal = flowStep === "checklist";
    const showReturningModal = flowStep === "returning";
    const showCompleteModal = flowStep === "complete";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-gray-50 pt-safe">
                <div className="max-w-md mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                                <img
                                    src="/images/logo.png"
                                    alt="CARRY PORTER Logo"
                                    className="w-6 h-6 object-contain brightness-0 invert"
                                />
                            </div>
                            <h1 className="text-gray-900 text-lg font-bold font-['Beckman',sans-serif]">
                                CARRY PORTER
                            </h1>
                        </div>
                        <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${connectionStatus.color}`}
                        >
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    connectionStatus.dotColor
                                } ${
                                    connectionStatus.animate
                                        ? "animate-pulse"
                                        : ""
                                }`}
                            />
                            {connectionStatus.label}
                        </div>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-md mx-auto px-6 py-6">
                {/* 상태 메시지 */}
                <div className="mb-6 animate-fade-in-up">
                    <h2 className="text-gray-900 text-2xl font-bold mb-1">
                        미션 진행중 🚀
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {status === "MOVING" && "로봇이 이동 중입니다"}
                        {status === "ARRIVED" && "로봇이 도착했습니다"}
                        {status === "UNLOCKED" && "짐 확인 중"}
                        {status === "LOCKED" && "수령 완료"}
                        {status === "RETURNING" && "로봇이 복귀 중입니다"}
                        {status === "RETURNED" && "보관 완료"}
                        {status === "FINISHED" && "미션 완료!"}
                        {![
                            "MOVING",
                            "ARRIVED",
                            "UNLOCKED",
                            "LOCKED",
                            "RETURNING",
                            "RETURNED",
                            "FINISHED",
                        ].includes(status) && "작업 중입니다"}
                    </p>
                </div>

                {/* 타임라인 카드 */}
                <motion.div
                    className="bg-white rounded-2xl p-5 shadow-sm mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-toss-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        진행 상황
                    </h3>

                    <div className="mb-6">
                        <ProgressBar
                            currentStep={progressStep}
                            totalSteps={5}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={status}
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TimelineStep
                                label="요청됨"
                                active={status === "REQUESTED"}
                                completed={status !== "REQUESTED"}
                            />
                            <TimelineStep
                                label="로봇 배정"
                                active={status === "ASSIGNED"}
                                completed={[
                                    "MOVING",
                                    "ARRIVED",
                                    "UNLOCKED",
                                    "LOCKED",
                                    "RETURNING",
                                    "RETURNED",
                                    "FINISHED",
                                ].includes(status)}
                            />
                            <TimelineStep
                                label="이동 중"
                                active={status === "MOVING"}
                                completed={[
                                    "ARRIVED",
                                    "UNLOCKED",
                                    "LOCKED",
                                    "RETURNING",
                                    "RETURNED",
                                    "FINISHED",
                                ].includes(status)}
                            />
                            <TimelineStep
                                label="도착"
                                active={status === "ARRIVED"}
                                completed={[
                                    "UNLOCKED",
                                    "LOCKED",
                                    "RETURNING",
                                    "RETURNED",
                                    "FINISHED",
                                ].includes(status)}
                            />
                            <TimelineStep
                                label="완료"
                                active={status === "FINISHED"}
                                completed={status === "FINISHED"}
                            />
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* 로봇 정보 카드 */}
                {currentMission?.robotCode && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 animate-fade-in-up">
                        <h3 className="text-gray-900 font-bold text-base mb-3 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-toss-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                />
                            </svg>
                            배정 로봇
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">
                                    로봇 코드
                                </p>
                                <p className="text-gray-900 text-xl font-bold">
                                    {currentMission.robotCode}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 완료 버튼 (FINISHED 상태) */}
                {status === "FINISHED" && (
                    <Button
                        onClick={handleComplete}
                        className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white"
                    >
                        완료
                    </Button>
                )}
            </main>

            {/* 모달들 - 배경이 흐릿하게 보임 */}
            {showVerifyModal && (
                <VerificationModal
                    missionId={Number(currentMission.id)}
                    onSuccess={handleVerificationSuccess}
                />
            )}
            {showChecklistModal && (
                <ChecklistModal onReturnSuccess={handleReturnSuccess} />
            )}
            {showReturningModal && <ReturningModal />}
            {showCompleteModal && <CompleteModal />}
        </div>
    );
};

export default MissionTrackPage;
