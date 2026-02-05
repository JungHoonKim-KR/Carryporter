import { useUnifiedFlow } from '../../hooks/useUnifiedFlow';
import { ProgressBar } from './ProgressBar';
import { WeightMeasurementStep } from './storage/WeightMeasurementStep';
import { Button } from '@/components/ui/button';

interface UnifiedFlowModalProps {
  onComplete: () => void;
}

/**
 * 통합 플로우 모달
 * 보관/반납 개념 제거, 단일 플로우로 통합
 * 모바일 반응형: 스크롤 없이 한 화면에 모든 내용 표시
 */
export const UnifiedFlowModal = ({ onComplete }: UnifiedFlowModalProps) => {
  const {
    step,
    isLocking,
    isReturning,
    checklist,
    allChecked,
    currentMission,
    handleWeightMeasurementComplete,
    handleRemeasure,
    handleLock,
    handleChecklistChange,
    handleReturn,
    handleGoHome,
  } = useUnifiedFlow();

  // 디버깅: 현재 step 상태 확인
  if (import.meta.env.DEV) {
    console.log('[UnifiedFlowModal] 현재 step:', step, '무게:', currentMission?.weightInfo?.luggageWeight);
  }

  // 단계별 인덱스 계산 (Progress bar용)
  const stepIndex = {
    WEIGHT_CHECK: 1,
    WEIGHT_RESULT: 2,
    LOCK_REQUESTED: 3,
    CHECKLIST_CONFIRM: 4,
    RETURN_REQUESTED: 4,
    RETURN_COMPLETE: 5,
  }[step] || 1;

  const weight = currentMission?.weightInfo?.luggageWeight || 0;
  const isOverweight = weight > 15;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white h-[100dvh]">
      {/* Header: Progress bar */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <ProgressBar currentStep={stepIndex} totalSteps={5} />
      </div>

      {/* Body: 스크롤 없음, absolute positioning */}
      <div className="flex-1 relative overflow-hidden">
        {/* WEIGHT_CHECK 단계 */}
        {step === 'WEIGHT_CHECK' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 animate-fade-in">
            <WeightMeasurementStep
              luggageWeight={weight}
              onComplete={handleWeightMeasurementComplete}
            />
          </div>
        )}

        {/* WEIGHT_RESULT 단계 */}
        {step === 'WEIGHT_RESULT' && (
          <div className="absolute inset-0 flex flex-col justify-center p-6 animate-fade-in">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-toss-green rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-gray-900 text-xl font-bold mb-2">무게 측정 완료</h2>
                  <p className="text-gray-500 text-sm">짐의 무게가 측정되었습니다</p>
                </div>

                {/* 무게 표시 */}
                <div className="bg-gray-50 rounded-xl p-6 text-center mb-4">
                  <p className="text-sm text-gray-500 mb-2">측정된 무게</p>
                  <div className="relative">
                    <p className="text-5xl font-bold text-toss-blue-500">
                      {weight.toFixed(1)}
                    </p>
                    <p className="text-xl text-gray-400 mt-1">kg</p>
                  </div>
                  {isOverweight && (
                    <p className="text-red-500 text-sm mt-3">⚠️ 무게가 15kg을 초과했습니다</p>
                  )}
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                  {isOverweight && (
                    <Button
                      onClick={handleRemeasure}
                      className="flex-1 h-14 text-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      다시 측정
                    </Button>
                  )}
                  <Button
                    onClick={handleLock}
                    disabled={isLocking || isOverweight}
                    className="flex-1 h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
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
            </div>
          </div>
        )}

        {/* CHECKLIST_CONFIRM 단계 */}
        {step === 'CHECKLIST_CONFIRM' && (
          <div className="absolute inset-0 flex flex-col p-6 animate-fade-in">
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  안전 확인사항
                </h3>

                <div className="space-y-3">
                  {/* 체크리스트 아이템들 */}
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.workCompleted}
                      onChange={() => handleChecklistChange('workCompleted')}
                      className="w-5 h-5 rounded border-gray-300 text-toss-green focus:ring-toss-green"
                    />
                    <span className="text-gray-700">작업을 완료했나요?</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.lockerChecked}
                      onChange={() => handleChecklistChange('lockerChecked')}
                      className="w-5 h-5 rounded border-gray-300 text-toss-green focus:ring-toss-green"
                    />
                    <span className="text-gray-700">사물함 상태를 확인했나요?</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={checklist.confirmReturn}
                      onChange={() => handleChecklistChange('confirmReturn')}
                      className="w-5 h-5 rounded border-gray-300 text-toss-green focus:ring-toss-green"
                    />
                    <span className="text-gray-700">복귀를 시작하겠습니다</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 복귀 버튼 */}
            <div className="flex-shrink-0 pt-4">
              <Button
                onClick={handleReturn}
                disabled={!allChecked || isReturning}
                className="w-full h-14 text-lg font-semibold bg-toss-green hover:bg-toss-green/90 text-white disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isReturning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    복귀 처리 중...
                  </div>
                ) : (
                  '복귀'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* RETURN_COMPLETE 단계 */}
        {step === 'RETURN_COMPLETE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="space-y-6 w-full max-w-md">
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-toss-green rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-gray-900 text-2xl font-bold mb-2">복귀 완료!</h2>
                <p className="text-gray-600 text-sm mb-6">
                  로봇이 스테이션으로 복귀했습니다
                </p>

                {/* 보관 정보 */}
                {currentMission?.lockerInfo && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs text-gray-500 mb-2">보관 위치</p>
                    <p className="text-lg font-bold text-gray-900">
                      {currentMission.lockerInfo.lockerName}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      무게: {weight.toFixed(1)}kg
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleGoHome(onComplete)}
                  className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white"
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
