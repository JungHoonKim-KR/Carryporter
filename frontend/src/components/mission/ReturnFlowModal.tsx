import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useReturnFlow } from '../../hooks/useReturnFlow';
import { SelectLuggageStep } from './return/SelectLuggageStep';
import { RemoveItemsStep } from './return/RemoveItemsStep';
import { ConfirmChecklistStep } from './return/ConfirmChecklistStep';
import { ReturnCompleteStep } from './return/ReturnCompleteStep';

interface ReturnFlowModalProps {
    onComplete: () => void;
}

/**
 * 반납 플로우 모달 컴포넌트
 * 짐 선택 → 물건 빼기 안내 → 잠금 버튼 → 반납 확인사항 → 반납 버튼 → 반납 완료 → 홈으로
 */
export const ReturnFlowModal = ({ onComplete }: ReturnFlowModalProps) => {
    const [logoError, setLogoError] = useState(false);
    const {
        step,
        selectedLuggage,
        isLocking,
        isReturning,
        checklist,
        allChecked,
        storedLuggages,
        handleSelectLuggage,
        handleLock,
        handleChecklistChange,
        handleReturn,
        handleGoHome,
    } = useReturnFlow();

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
                                <p className="text-gray-500 text-xs">
                                    {step === 'SELECT_LUGGAGE' && '반납할 짐 선택'}
                                    {step === 'REMOVE_ITEMS' && '물건 꺼내기'}
                                    {step === 'CONFIRM_CHECKLIST' && '반납 전 확인'}
                                    {step === 'RETURN_COMPLETE' && '반납 완료!'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-md mx-auto px-6 py-6">
                {step === 'SELECT_LUGGAGE' && (
                    <SelectLuggageStep
                        storedLuggages={storedLuggages}
                        onSelectLuggage={handleSelectLuggage}
                    />
                )}

                {step === 'REMOVE_ITEMS' && selectedLuggage && (
                    <RemoveItemsStep
                        selectedLuggage={selectedLuggage}
                        isLocking={isLocking}
                        onConfirm={handleLock}
                    />
                )}

                {step === 'CONFIRM_CHECKLIST' && (
                    <ConfirmChecklistStep
                        checklist={checklist}
                        isReturning={isReturning}
                        allChecked={allChecked}
                        onChecklistChange={handleChecklistChange}
                        onConfirm={handleReturn}
                    />
                )}

                {step === 'RETURN_COMPLETE' && selectedLuggage && (
                    <ReturnCompleteStep
                        selectedLuggage={selectedLuggage}
                        onComplete={() => handleGoHome(onComplete)}
                    />
                )}
            </main>
        </div>
    );
};
