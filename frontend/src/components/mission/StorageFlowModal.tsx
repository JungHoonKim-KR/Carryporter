import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMissionStore } from '../../store/missionStore';
import { useWeightCountUp } from '../../hooks/useWeightCountUp';
import type { StoredLuggage } from '../../types/mission.types';

/**
 * 보관 플로우 단계
 * WEIGHT_CHECK: 무게 측정 중
 * WEIGHT_RESULT: 무게 측정 완료, 잠금 버튼 표시
 * STORAGE_COMPLETE: 보관 완료 정보 표시
 */
type StorageStep = 'WEIGHT_CHECK' | 'WEIGHT_RESULT' | 'STORAGE_COMPLETE';

interface StorageFlowModalProps {
    onComplete: () => void;
}

/**
 * 보관 플로우 모달 컴포넌트
 * 무게 측정 → 잠금 버튼 → 보관 완료 정보 → 홈으로
 */
export const StorageFlowModal = ({ onComplete }: StorageFlowModalProps) => {
    const navigate = useNavigate();
    const { currentMission, generateWeightInfo, addStoredLuggage, clearMission } = useMissionStore();
    const [step, setStep] = useState<StorageStep>('WEIGHT_CHECK');
    const [isLocking, setIsLocking] = useState(false);

    // 무게 카운트업 애니메이션
    const weightCountUp = useWeightCountUp({
        startValue: 0, // 무게 측정 시작
        endValue: currentMission?.weightInfo?.luggageWeight || 0,
        duration: 2000,
        onComplete: () => {
            console.log('[StorageFlow] 무게 측정 완료');
            setStep('WEIGHT_RESULT');
        },
    });

    // 컴포넌트 마운트 시 무게 생성
    useEffect(() => {
        // 무게 정보가 없으면 생성
        if (!currentMission?.weightInfo) {
            console.log('[StorageFlow] 무게 정보 생성 중...');
            generateWeightInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 무게 정보가 생성되면 애니메이션 시작
    useEffect(() => {
        if (currentMission?.weightInfo && step === 'WEIGHT_CHECK') {
            console.log('[StorageFlow] 무게 정보 확인, 애니메이션 시작:', currentMission.weightInfo.luggageWeight);
            const timer = setTimeout(() => {
                weightCountUp.startAnimation();
            }, 500);

            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMission?.weightInfo]);

    // 무게 다시 측정 함수
    const handleRemeasure = () => {
        // 무게 정보 초기화 및 재생성
        generateWeightInfo();
        // 측정 단계로 돌아가기
        setStep('WEIGHT_CHECK');
        // 애니메이션 재시작
        setTimeout(() => weightCountUp.startAnimation(), 500);
    };

    // 잠금 버튼 클릭
    const handleLock = async () => {
        setIsLocking(true);

        // 잠금 효과음 및 딜레이
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 보관 정보 생성 및 저장
        const luggageId = `luggage-${Date.now()}`;
        const storedLuggage: StoredLuggage = {
            id: luggageId,
            missionId: currentMission?.id || '',
            lockerId: currentMission?.lockerInfo?.lockerId || `A-${Math.floor(Math.random() * 200) + 1}`,
            lockerName: currentMission?.lockerInfo?.lockerName || `Locker A-${Math.floor(Math.random() * 200) + 1}`,
            weight: currentMission?.weightInfo?.luggageWeight || 14.3,
            storedAt: new Date().toISOString(),
            robotCode: currentMission?.robotCode,
            destination: currentMission?.destination, // 목적지 이름 저장
        };

        addStoredLuggage(storedLuggage);
        setIsLocking(false);
        setStep('STORAGE_COMPLETE');
    };

    // 홈으로 이동
    const handleGoHome = () => {
        clearMission();
        onComplete();
        navigate('/home');
    };

    const weight = currentMission?.weightInfo?.luggageWeight || weightCountUp.currentValue;
    // 색상은 측정 중에도 15kg 초과 시 변경
    const isOverweight = weight > 15;
    // 현재 무게가 15kg을 넘으면 빨간색, 아니면 파란색
    const currentDisplayWeight = step === 'WEIGHT_CHECK' ? weightCountUp.currentValue : weight;
    const weightColor = currentDisplayWeight > 15 ? 'text-red-500' : 'text-toss-blue-500';

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
                                    className="w-6 h-6"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-gray-900 text-lg font-bold">CARRY PORTER</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-md mx-auto px-6 py-6">
                {/* 무게 측정 카드 */}
                {(step === 'WEIGHT_CHECK' || step === 'WEIGHT_RESULT') && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm anim ate-fade-in-up">
                        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                            <span className="text-2xl">⚖️</span>
                            짐 무게 측정
                        </h3>

                        {/* 무게 표시 */}
                        <div className="text-center py-8 bg-gradient-to-br from-toss-blue-500/5 to-toss-blue-light/5 rounded-2xl mb-4">
                            <p className="text-gray-500 text-sm mb-2">현재 무게</p>
                            <div className={`text-7xl font-bold mb-2 weight-counter ${weightColor}`}>
                                {step === 'WEIGHT_CHECK' ? weightCountUp.currentValue.toFixed(1) : weight.toFixed(1)}
                                <span className="text-3xl ml-2">kg</span>
                            </div>

                            {step === 'WEIGHT_CHECK' && (
                                <p className="text-gray-500 text-sm animate-pulse">
                                    무게를 측정하고 있습니다...
                                </p>
                            )}

                            {/* 무게 경고 */}
                            {step === 'WEIGHT_RESULT' && isOverweight && (
                                <div className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2 justify-center">
                                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-red-600 text-sm font-medium">
                                        짐을 덜어주세요.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 잠금 및 무게 다시측정 버튼 */}
                        {step === 'WEIGHT_RESULT' && (
                            <div className="space-y-3">
                                {/* 무게 초과 시 다시측정 버튼 */}
                                {isOverweight && (
                                    <Button
                                        onClick={handleRemeasure}
                                        className="w-full h-14 text-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        무게 다시측정
                                    </Button>
                                )}

                                {/* 잠금 버튼 */}
                                <Button
                                    onClick={handleLock}
                                    disabled={isLocking || isOverweight}
                                    className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 disabled:bg-gray-300 text-white"
                                >
                                    {isLocking ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            잠금 중...
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            잠금
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* 보관 완료 카드 */}
                {step === 'STORAGE_COMPLETE' && (
                    <div className="space-y-4">
                        {/* 완료 애니메이션 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm text-center animate-fade-in-up">
                            <div className="w-20 h-20 mx-auto mb-4 bg-toss-green rounded-2xl flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-gray-900 text-xl font-bold mb-2">보관 완료!</h2>
                            <p className="text-gray-500">짐이 안전하게 보관되었습니다</p>
                        </div>

                        {/* 보관 정보 카드 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-toss-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                보관 정보
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">보관 위치</span>
                                    <span className="font-semibold text-gray-900">
                                        {currentMission?.lockerInfo?.lockerName || `Locker A-${Math.floor(Math.random() * 200) + 1}`}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">짐 무게</span>
                                    <span className="font-semibold text-gray-900">
                                        {currentMission?.weightInfo?.luggageWeight?.toFixed(1) || '14.3'} kg
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">보관 시간</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {currentMission?.robotCode && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-500">담당 로봇</span>
                                        <span className="font-semibold text-gray-900">{currentMission.robotCode}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 홈으로 버튼 */}
                        <Button
                            onClick={handleGoHome}
                            className="w-full h-14 text-lg font-semibold bg-toss-green hover:bg-toss-green/90 text-white"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            홈으로 돌아가기
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};
