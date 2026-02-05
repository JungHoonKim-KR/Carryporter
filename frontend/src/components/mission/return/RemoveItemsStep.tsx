import { Button } from '@/components/ui/button';
import type { StoredLuggage } from '../../../types/mission.types';

interface RemoveItemsStepProps {
  selectedLuggage: StoredLuggage;
  isLocking: boolean;
  onConfirm: () => void;
}

/**
 * 물건 빼기 안내 단계
 */
export const RemoveItemsStep = ({
  selectedLuggage,
  isLocking,
  onConfirm,
}: RemoveItemsStepProps) => {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#FF9800] rounded-2xl flex items-center justify-center">
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
        </div>
      </div>

      {/* 잠금 버튼 */}
      <Button
        onClick={onConfirm}
        disabled={isLocking}
        className="w-full h-14 text-lg font-semibold bg-[#FF9800] hover:bg-[#FF9800]/90 text-white"
      >
        {isLocking ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-toss-green border-t-transparent rounded-full animate-spin" />
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
  );
};
