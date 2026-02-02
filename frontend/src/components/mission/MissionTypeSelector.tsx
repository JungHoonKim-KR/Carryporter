import { useState } from 'react';
import { cn } from '@/lib/utils';
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
    const [logoError, setLogoError] = useState(false);
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
                            <h1 className="text-gray-900 text-lg font-bold">CARRY PORTER</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-md mx-auto px-6 py-6">
                {/* 인증 완료 카드 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center animate-fade-in-up">
                    <div className="w-16 h-16 mx-auto mb-4 bg-toss-blue-500 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-gray-900 text-xl font-bold mb-2">인증 완료!</h2>
                    <p className="text-gray-500">무엇을 하시겠어요?</p>
                </div>

                {/* 선택 버튼들 */}
                <div className="space-y-4 animate-fade-in-up">
                    {/* 보관 버튼 */}
                    <button
                        onClick={() => onSelect('STORAGE')}
                        className="w-full bg-white rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-toss-blue-500 rounded-2xl flex items-center justify-center">
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
                        className={cn(
                            'w-full rounded-2xl p-6 text-left transition-all group',
                            hasStoredLuggage
                                ? 'bg-white shadow-sm hover:shadow-md active:scale-[0.98]'
                                : 'bg-white/50 shadow-sm cursor-not-allowed'
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={cn(
                                    'w-16 h-16 rounded-2xl flex items-center justify-center',
                                    hasStoredLuggage ? 'bg-toss-red' : 'bg-gray-300'
                                )}
                            >
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4l3 3m0 0l3-3m-3 3V9" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className={cn(
                                    'text-xl font-bold mb-1',
                                    hasStoredLuggage ? 'text-gray-900' : 'text-gray-400'
                                )}>
                                    반납
                                </h3>
                                <p className={cn(
                                    'text-sm',
                                    hasStoredLuggage ? 'text-gray-500' : 'text-gray-400'
                                )}>
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
                    <p className="mt-4 text-gray-500 text-sm text-center animate-fade-in-up">
                        먼저 짐을 보관해야 반납할 수 있습니다
                    </p>
                )}
            </main>
        </div>
    );
};
