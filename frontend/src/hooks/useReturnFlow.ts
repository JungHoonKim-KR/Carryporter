import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissionStore } from '../store/missionStore';
import { returnMission } from '../api/mission.api';
import type { StoredLuggage } from '../types/mission.types';

export type ReturnStep = 'SELECT_LUGGAGE' | 'REMOVE_ITEMS' | 'CONFIRM_CHECKLIST' | 'RETURN_COMPLETE';

/**
 * 반납 플로우 비즈니스 로직을 관리하는 커스텀 훅
 */
export const useReturnFlow = () => {
  const navigate = useNavigate();
  const { currentMission, storedLuggages, removeStoredLuggage, clearMission } = useMissionStore();
  
  const [step, setStep] = useState<ReturnStep>('SELECT_LUGGAGE');
  const [selectedLuggage, setSelectedLuggage] = useState<StoredLuggage | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [checklist, setChecklist] = useState({
    itemsRemoved: false,
    nothingLeft: false,
    confirmReturn: false,
  });

  // 짐 선택
  const handleSelectLuggage = (luggage: StoredLuggage) => {
    setSelectedLuggage(luggage);
    setStep('REMOVE_ITEMS');
  };

  // 잠금 버튼 클릭 (물건 빼기 완료)
  const handleLock = async () => {
    setIsLocking(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLocking(false);
    setStep('CONFIRM_CHECKLIST');
  };

  // 체크리스트 변경
  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 반납 버튼 클릭
  const handleReturn = async () => {
    if (!selectedLuggage) return;

    setIsReturning(true);

    try {
      // 🆕 반납 완료 → 로봇 복귀 요청
      if (currentMission?.id) {
        await returnMission(Number(currentMission.id));
        if (import.meta.env.DEV) {
          console.log('[ReturnFlow] 로봇 복귀 요청 성공');
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 보관된 짐 목록에서 제거
      removeStoredLuggage(selectedLuggage.id);

      setStep('RETURN_COMPLETE');
    } catch (error) {
      console.error('[ReturnFlow] 반납 실패:', error);
    } finally {
      setIsReturning(false);
    }
  };

  // 홈으로 이동
  const handleGoHome = (onComplete: () => void) => {
    clearMission();
    onComplete();
    navigate('/home');
  };

  const allChecked = checklist.itemsRemoved && checklist.nothingLeft && checklist.confirmReturn;

  return {
    step,
    selectedLuggage,
    isLocking,
    isReturning,
    checklist,
    allChecked,
    storedLuggages,
    handleSelectLuggage,
    handleLock,
    handleChecklistChange,
    handleReturn,
    handleGoHome,
  };
};
