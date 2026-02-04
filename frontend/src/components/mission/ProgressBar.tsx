import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Progress Bar 컴포넌트
 * 미션 플로우 진행 상황을 시각적으로 표시 (펄스 애니메이션 포함)
 */
export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress 텍스트 */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="font-medium">진행 중</span>
        <span className="font-semibold">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute top-0 left-0 h-full bg-toss-blue-500 transition-all duration-500 ease-out',
            'animate-pulse' // 펄스 애니메이션
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
