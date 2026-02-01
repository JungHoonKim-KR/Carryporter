import { Button } from '@/components/ui/button';

interface ConfirmChecklistStepProps {
  checklist: {
    itemsRemoved: boolean;
    nothingLeft: boolean;
    confirmReturn: boolean;
  };
  isReturning: boolean;
  allChecked: boolean;
  onChecklistChange: (key: 'itemsRemoved' | 'nothingLeft' | 'confirmReturn') => void;
  onConfirm: () => void;
}

/**
 * 반납 전 체크리스트 확인 단계
 */
export const ConfirmChecklistStep = ({
  checklist,
  isReturning,
  allChecked,
  onChecklistChange,
  onConfirm,
}: ConfirmChecklistStepProps) => {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
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
              onChange={() => onChecklistChange('itemsRemoved')}
              className="w-5 h-5 rounded border-gray-300 text-toss-green focus:ring-toss-green"
            />
            <span className="text-gray-700">카트에서 모든 물건을 꺼냈습니다</span>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={checklist.nothingLeft}
              onChange={() => onChecklistChange('nothingLeft')}
              className="w-5 h-5 rounded border-gray-300 text-toss-green focus:ring-toss-green"
            />
            <span className="text-gray-700">카트 안에 남은 물건이 없습니다</span>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={checklist.confirmReturn}
              onChange={() => onChecklistChange('confirmReturn')}
              className="w-5 h-5 rounded border-gray-300 text-toss-green focus:ring-toss-green"
            />
            <span className="text-gray-700">반납을 확인합니다</span>
          </label>
        </div>
      </div>

      {/* 반납 버튼 */}
      <Button
        onClick={onConfirm}
        disabled={!allChecked || isReturning}
        className="w-full h-14 text-lg font-semibold bg-toss-green hover:bg-toss-green/90 text-white disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isReturning ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-toss-green border-t-transparent rounded-full animate-spin" />
            반납 처리 중...
          </div>
        ) : (
          '반납'
        )}
      </Button>
    </div>
  );
};
