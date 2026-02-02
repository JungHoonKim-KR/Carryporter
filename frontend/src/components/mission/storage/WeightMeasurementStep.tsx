import { useEffect } from 'react';
import { useWeightCountUp } from '../../../hooks/useWeightCountUp';

interface WeightMeasurementStepProps {
  luggageWeight: number;
  onComplete: () => void;
}

/**
 * 무게 측정 단계
 * 중요: useWeightCountUp를 이 컴포넌트 내부에서 호출
 */
export const WeightMeasurementStep = ({
  luggageWeight,
  onComplete,
}: WeightMeasurementStepProps) => {
  // 무게 카운트업 애니메이션 (이 컴포넌트 내부에서 호출)
  const weightCountUp = useWeightCountUp({
    startValue: 0,
    endValue: luggageWeight,
    duration: 2000,
    onComplete,
  });

  // 무게 정보가 생성되면 애니메이션 시작
  useEffect(() => {
    if (luggageWeight > 0) {
      if (import.meta.env.DEV) console.log('[WeightMeasurement] 무게 정보 확인, 애니메이션 시작:', luggageWeight);
      const timer = setTimeout(() => {
        weightCountUp.startAnimation();
      }, 500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [luggageWeight]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-toss-blue-500 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h2 className="text-gray-900 text-xl font-bold mb-2">무게 측정 중...</h2>
          <p className="text-gray-500 text-sm">카트에 짐을 올려주세요</p>
        </div>

        {/* 무게 측정 애니메이션 */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">측정된 무게</p>
          <div className="relative">
            <p className="text-5xl font-bold text-toss-blue-500">
              {weightCountUp.currentValue.toFixed(1)}
            </p>
            <p className="text-xl text-gray-400 mt-1">kg</p>
          </div>

          {/* 로딩 인디케이터 */}
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-toss-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
};
