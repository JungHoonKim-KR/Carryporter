import { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { lockMission, returnMission } from '../../api/mission.api';
import { Button } from '@/components/ui/button';
import type { StoredLuggage } from '../../types/mission.types';

interface ChecklistModalProps {
  onReturnSuccess: () => void;
}

/**
 * 체크리스트 모달
 * LOCKED 상태에서 표시
 * 체크리스트 확인 → 복귀 버튼
 */
export const ChecklistModal = ({ onReturnSuccess }: ChecklistModalProps) => {
  const { currentMission, addStoredLuggage } = useMissionStore();
  
  const [isReturning, setIsReturning] = useState(false);
  const [checklist, setChecklist] = useState({
    workCompleted: false,
    lockerChecked: false,
    confirmReturn: false,
  });

  const allChecked = checklist.workCompleted && checklist.lockerChecked && checklist.confirmReturn;

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReturn = async () => {
    if (!currentMission?.id) return;

    setIsReturning(true);
    try {
      // 1단계: 잠금 API 호출
      await lockMission(Number(currentMission.id));

      // 2단계: 복귀 API 호출
      await returnMission(Number(currentMission.id));

      // 3단계: 보관 정보 저장 (weight 제거됨)
      const storedLuggage: StoredLuggage = {
        id: `luggage-${Date.now()}`,
        missionId: currentMission.id,
        lockerId: currentMission.lockerInfo?.lockerId || `A-${Math.floor(Math.random() * 200) + 1}`,
        lockerName: currentMission.lockerInfo?.lockerName || `Locker A-${Math.floor(Math.random() * 200) + 1}`,
        storedAt: new Date().toISOString(),
        robotCode: currentMission.robotCode,
        destination: currentMission.destination,
      };
      addStoredLuggage(storedLuggage);

      // 4단계: 복귀 중 모달로 전환
      // SSE에서 RETURNED 이벤트가 오면 완료 모달로 전환됨
      onReturnSuccess();
    } catch (error) {
      console.error('[ChecklistModal] 잠금/복귀 실패:', error);
      setIsReturning(false);
    }
    // isReturning을 false로 바꾸지 않음 - 모달이 전환되므로
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl animate-fade-in">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          안전 확인사항
        </h3>

        <div className="space-y-3 mb-6">
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

        <Button
          onClick={handleReturn}
          disabled={!allChecked || isReturning}
          className="w-full h-12 font-semibold bg-toss-green hover:bg-toss-green/90 text-white disabled:bg-gray-300"
        >
          {isReturning ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              복귀 처리 중...
            </div>
          ) : (
            '복귀'
          )}
        </Button>
      </div>
    </div>
  );
};
