interface TimelineStepProps {
  label: string;
  active: boolean;
  completed: boolean;
}

/**
 * 미션 타임라인 단계 표시 컴포넌트
 * 완료/진행중/대기 상태를 시각적으로 표현
 */
export const TimelineStep = ({ label, active, completed }: TimelineStepProps) => (
  <div className="flex items-center gap-4">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
        completed
          ? 'bg-toss-green text-white shadow-md'
          : active
            ? 'bg-toss-blue-500 text-white shadow-md'
            : 'bg-gray-200 text-gray-400'
      }`}
    >
      {completed ? '✓' : '○'}
    </div>
    <div className="flex-1">
      <span className={`font-medium ${active ? 'text-gray-900 text-base font-bold' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  </div>
);
