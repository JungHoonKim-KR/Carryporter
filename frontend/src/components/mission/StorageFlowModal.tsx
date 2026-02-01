import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStorageFlow } from '../../hooks/useStorageFlow';
import { WeightMeasurementStep } from './storage/WeightMeasurementStep';
import { StorageCompleteStep } from './storage/StorageCompleteStep';

interface StorageFlowModalProps {
    onComplete: () => void;
}

/**
 * 보관 플로우 모달 컴포넌트
 * 무게 측정 → 잠금 버튼 → 보관 완료 정보 → 홈으로
 */
export const StorageFlowModal = ({ onComplete }: StorageFlowModalProps) => {
    const [logoError, setLogoError] = useState(false);
    const {
        step,
        isLocking,
        currentMission,
        handleWeightMeasurementComplete,
        handleRemeasure,
        handleLock,
        handleGoHome,
    } = useStorageFlow();

    const weight = currentMission?.weightInfo?.luggageWeight || 0;
    const isOverweight = weight > 15;

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
                                    className={cn("w-6 h-6", logoError && "hidden")}
                                    onError={() => setLogoError(true)}
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
                {/* 무게 측정 중 */}
                {step === 'WEIGHT_CHECK' && (
                    <WeightMeasurementStep
                        luggageWeight={weight}
                        onComplete={handleWeightMeasurementComplete}
                    />
                )}

                {/* 무게 측정 완료 - 잠금 버튼 표시 */}
                {step === 'WEIGHT_RESULT' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm animate-fade-in-up">
                        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                            <span className="text-2xl">⚖️</span>
                            짐 무게 측정 완료
                        </h3>

                        {/* 무게 표시 */}
                        <div className="text-center py-8 bg-gradient-to-br from-toss-blue-500/5 to-toss-blue-light/5 rounded-2xl mb-4">
                            <p className="text-gray-500 text-sm mb-2">측정된 무게</p>
                            <div className={`text-7xl font-bold mb-2 ${isOverweight ? 'text-red-500' : 'text-toss-blue-500'}`}>
                                {weight.toFixed(1)}
                                <span className="text-3xl ml-2">kg</span>
                            </div>

                            {/* 무게 경고 */}
                            {isOverweight && (
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
                    </div>
                )}

                {/* 보관 완료 */}
                {step === 'STORAGE_COMPLETE' && (
                    <StorageCompleteStep
                        luggageWeight={weight}
                        lockerName={currentMission?.lockerInfo?.lockerName || `Locker A-${Math.floor(Math.random() * 200) + 1}`}
                        onComplete={() => handleGoHome(onComplete)}
                    />
                )}
            </main>
        </div>
    );
};
