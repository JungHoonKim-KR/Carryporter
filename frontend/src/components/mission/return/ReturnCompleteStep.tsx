import { Button } from '@/components/ui/button';
import type { StoredLuggage } from '../../../types/mission.types';

interface ReturnCompleteStepProps {
  selectedLuggage: StoredLuggage;
  onComplete: () => void;
}

/**
 * 반납 완료 단계
 */
export const ReturnCompleteStep = ({
  selectedLuggage,
  onComplete,
}: ReturnCompleteStepProps) => {
  return (
    <div className="space-y-4">
      {/* 완료 애니메이션 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-4 bg-toss-green rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-gray-900 text-xl font-bold mb-2">반납 완료!</h2>
        <p className="text-gray-500">이용해 주셔서 감사합니다</p>
      </div>

      {/* 반납 정보 카드 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-fade-in-up">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-toss-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        onClick={onComplete}
        className="w-full h-14 text-lg font-semibold bg-toss-green hover:bg-toss-green/90 text-white"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        홈으로 돌아가기
      </Button>
    </div>
  );
};
