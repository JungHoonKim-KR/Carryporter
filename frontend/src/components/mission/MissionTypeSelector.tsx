import type { MissionType } from '../../types/mission.types';

interface MissionTypeSelectorProps {
    onSelect: (type: MissionType) => void;
    hasStoredLuggage: boolean; // 보관된 짐이 있는지 여부
}

/**
 * 보관/반납 선택 UI 컴포넌트
 * 인증 성공 후 표시되며, 보관된 짐이 없으면 반납 버튼 비활성화
 */
export const MissionTypeSelector = ({
    onSelect,
    hasStoredLuggage,
}: MissionTypeSelectorProps) => {
    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0064FF] to-[#4DA3FF] flex flex-col items-center justify-center p-6">
            {/* 헤더 */}
            <div className="text-center mb-12 animate-fade-in-up">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-white text-2xl font-bold mb-2">인증 완료!</h2>
                <p className="text-white/80">무엇을 하시겠어요?</p>
            </div>

            {/* 선택 버튼들 */}
            <div className="w-full max-w-md space-y-4 animate-fade-in-scale" style={{ animationDelay: '100ms' }}>
                {/* 보관 버튼 */}
                <button
                    onClick={() => onSelect('STORAGE')}
                    className="w-full bg-white rounded-2xl p-6 text-left hover:shadow-xl transition-all active:scale-[0.98] group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0064FF] to-[#4DA3FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-gray-900 text-xl font-bold mb-1">보관</h3>
                            <p className="text-gray-500 text-sm">짐을 로봇에 보관합니다</p>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>

                {/* 반납 버튼 */}
                <button
                    onClick={() => hasStoredLuggage && onSelect('RETURN')}
                    disabled={!hasStoredLuggage}
                    className={`w-full rounded-2xl p-6 text-left transition-all group ${hasStoredLuggage
                            ? 'bg-white hover:shadow-xl active:scale-[0.98]'
                            : 'bg-white/50 cursor-not-allowed'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform ${hasStoredLuggage
                                    ? 'bg-gradient-to-br from-[#00C853] to-[#69F0AE] group-hover:scale-110'
                                    : 'bg-gray-300'
                                }`}
                        >
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4l3 3m0 0l3-3m-3 3V9" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-xl font-bold mb-1 ${hasStoredLuggage ? 'text-gray-900' : 'text-gray-400'}`}>
                                반납
                            </h3>
                            <p className={`text-sm ${hasStoredLuggage ? 'text-gray-500' : 'text-gray-400'}`}>
                                {hasStoredLuggage ? '보관된 짐을 반납합니다' : '보관된 짐이 없습니다'}
                            </p>
                        </div>
                        {hasStoredLuggage && (
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </div>
                </button>
            </div>

            {/* 안내 텍스트 */}
            {!hasStoredLuggage && (
                <p className="mt-6 text-white/60 text-sm text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    먼저 짐을 보관해야 반납할 수 있습니다
                </p>
            )}
        </div>
    );
};
