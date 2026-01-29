import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMissionStore } from '../../store/missionStore';
import type { StoredLuggage } from '../../types/mission.types';

/**
 * 반납 플로우 단계
 * SELECT_LUGGAGE: 반납할 짐 선택
 * REMOVE_ITEMS: 물건 빼기 안내
 * CONFIRM_CHECKLIST: 반납 전 확인사항
 * RETURN_COMPLETE: 반납 완료 정보 표시
 */
type ReturnStep = 'SELECT_LUGGAGE' | 'REMOVE_ITEMS' | 'CONFIRM_CHECKLIST' | 'RETURN_COMPLETE';

interface ReturnFlowModalProps {
    onComplete: () => void;
}

/**
 * 반납 플로우 모달 컴포넌트
 * 짐 선택 → 물건 빼기 안내 → 잠금 버튼 → 반납 확인사항 → 반납 버튼 → 반납 완료 → 홈으로
 */
export const ReturnFlowModal = ({ onComplete }: ReturnFlowModalProps) => {
    const navigate = useNavigate();
    const { storedLuggages, removeStoredLuggage, clearMission } = useMissionStore();
    const [step, setStep] = useState<ReturnStep>('SELECT_LUGGAGE');
    const [selectedLuggage, setSelectedLuggage] = useState<StoredLuggage | null>(null);
    const [isLocking, setIsLocking] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [checklist, setChecklist] = useState({
        itemsRemoved: false,
        nothingLeft: false,
        confirmReturn: false,
    });

    // 짐 선택
    const handleSelectLuggage = (luggage: StoredLuggage) => {
        setSelectedLuggage(luggage);
        setStep('REMOVE_ITEMS');
    };

    // 잠금 버튼 클릭 (물건 빼기 완료)
    const handleLock = async () => {
        setIsLocking(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLocking(false);
        setStep('CONFIRM_CHECKLIST');
    };

    // 체크리스트 변경
    const handleChecklistChange = (key: keyof typeof checklist) => {
        setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // 반납 버튼 클릭
    const handleReturn = async () => {
        if (!selectedLuggage) return;

        setIsReturning(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 보관된 짐 목록에서 제거
        removeStoredLuggage(selectedLuggage.id);

        setIsReturning(false);
        setStep('RETURN_COMPLETE');
    };

    // 홈으로 이동
    const handleGoHome = () => {
        clearMission();
        onComplete();
        navigate('/home');
    };

    const allChecked = checklist.itemsRemoved && checklist.nothingLeft && checklist.confirmReturn;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#00C853] to-[#69F0AE] flex flex-col">
            {/* 헤더 */}
            <header className="pt-safe px-6 py-6">
                <h1 className="text-white text-2xl font-bold">짐 반납</h1>
                <p className="text-white/80 text-sm mt-1">
                    {step === 'SELECT_LUGGAGE' && '반납할 짐을 선택해주세요'}
                    {step === 'REMOVE_ITEMS' && '물건을 모두 꺼내주세요'}
                    {step === 'CONFIRM_CHECKLIST' && '반납 전 확인사항을 체크해주세요'}
                    {step === 'RETURN_COMPLETE' && '반납이 완료되었습니다!'}
                </p>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="flex-1 px-6 pb-8 overflow-y-auto">
                {/* 짐 선택 */}
                {step === 'SELECT_LUGGAGE' && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="bg-white rounded-2xl p-6">
                            <h3 className="text-gray-900 font-bold mb-4">보관된 짐 목록</h3>
                            <div className="space-y-3">
                                {storedLuggages.map((luggage) => (
                                    <button
                                        key={luggage.id}
                                        onClick={() => handleSelectLuggage(luggage)}
                                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#0064FF] to-[#4DA3FF] rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{luggage.lockerName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {luggage.weight.toFixed(1)}kg • {new Date(luggage.storedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 보관
                                                </p>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 물건 빼기 안내 */}
                {step === 'REMOVE_ITEMS' && selectedLuggage && (
                    <div className="space-y-4 animate-fade-in-scale">
                        <div className="bg-white rounded-2xl p-6">
                            <div className="text-center py-8">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FF9800] to-[#FFCA28] rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4l3 3m0 0l3-3m-3 3V9" />
                                    </svg>
                                </div>
                                <h2 className="text-gray-900 text-xl font-bold mb-2">물건을 모두 꺼내주세요</h2>
                                <p className="text-gray-500 text-sm">
                                    카트에서 모든 짐을 꺼낸 후<br />
                                    아래 잠금 버튼을 눌러주세요
                                </p>
                            </div>

                            {/* 선택한 짐 정보 */}
                            <div className="bg-gray-50 rounded-xl p-4 mt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">보관 위치</span>
                                    <span className="font-semibold">{selectedLuggage.lockerName}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-500">짐 무게</span>
                                    <span className="font-semibold">{selectedLuggage.weight.toFixed(1)} kg</span>
                                </div>
                            </div>
                        </div>

                        {/* 잠금 버튼 */}
                        <Button
                            onClick={handleLock}
                            disabled={isLocking}
                            className="w-full h-14 text-lg font-semibold bg-white text-[#00C853] hover:bg-white/90"
                        >
                            {isLocking ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
                                    확인 중...
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

                {/* 반납 전 확인사항 */}
                {step === 'CONFIRM_CHECKLIST' && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="bg-white rounded-2xl p-6">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                반납 전 확인사항
                            </h3>

                            <div className="space-y-3">
                                {/* 체크리스트 아이템들 */}
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={checklist.itemsRemoved}
                                        onChange={() => handleChecklistChange('itemsRemoved')}
                                        className="w-5 h-5 rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]"
                                    />
                                    <span className="text-gray-700">카트에서 모든 물건을 꺼냈습니다</span>
                                </label>

                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={checklist.nothingLeft}
                                        onChange={() => handleChecklistChange('nothingLeft')}
                                        className="w-5 h-5 rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]"
                                    />
                                    <span className="text-gray-700">카트 안에 남은 물건이 없습니다</span>
                                </label>

                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={checklist.confirmReturn}
                                        onChange={() => handleChecklistChange('confirmReturn')}
                                        className="w-5 h-5 rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]"
                                    />
                                    <span className="text-gray-700">반납을 확인합니다</span>
                                </label>
                            </div>
                        </div>

                        {/* 반납 버튼 */}
                        <Button
                            onClick={handleReturn}
                            disabled={!allChecked || isReturning}
                            className="w-full h-14 text-lg font-semibold bg-white text-[#00C853] hover:bg-white/90 disabled:bg-white/50 disabled:text-gray-400"
                        >
                            {isReturning ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
                                    반납 처리 중...
                                </div>
                            ) : (
                                '반납'
                            )}
                        </Button>
                    </div>
                )}

                {/* 반납 완료 */}
                {step === 'RETURN_COMPLETE' && selectedLuggage && (
                    <div className="space-y-4">
                        {/* 완료 애니메이션 */}
                        <div className="text-center py-8 animate-fade-in-scale">
                            <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-12 h-12 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-white text-2xl font-bold mb-2">반납 완료!</h2>
                            <p className="text-white/80">이용해 주셔서 감사합니다</p>
                        </div>

                        {/* 반납 정보 카드 */}
                        <div className="bg-white rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                반납 정보
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">반납 위치</span>
                                    <span className="font-semibold text-gray-900">{selectedLuggage.lockerName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">보관 시간</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date(selectedLuggage.storedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">반납 시간</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 홈으로 버튼 */}
                        <Button
                            onClick={handleGoHome}
                            className="w-full h-14 text-lg font-semibold bg-white text-[#00C853] hover:bg-white/90 shadow-lg"
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
