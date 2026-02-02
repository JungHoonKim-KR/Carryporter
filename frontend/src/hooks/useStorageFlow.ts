import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissionStore } from '../store/missionStore';
import { lockMission } from '../api/mission.api';
import type { StoredLuggage } from '../types/mission.types';

export type StorageStep = 'WEIGHT_CHECK' | 'WEIGHT_RESULT' | 'STORAGE_COMPLETE';

/**
 * 보관 플로우 비즈니스 로직을 관리하는 커스텀 훅
 * 주의: useWeightCountUp는 이 훅에서 호출하지 않고 WeightMeasurementStep에서 호출
 */
export const useStorageFlow = () => {
  const navigate = useNavigate();
  const { currentMission, generateWeightInfo, addStoredLuggage, clearMission } = useMissionStore();

  const [step, setStep] = useState<StorageStep>('WEIGHT_CHECK');
  const [isLocking, setIsLocking] = useState(false);

  // 컴포넌트 마운트 시 무게 생성
  useEffect(() => {
    // 무게 정보가 없으면 생성
    if (!currentMission?.weightInfo) {
      if (import.meta.env.DEV) console.log('[StorageFlow] 무게 정보 생성 중...');
      generateWeightInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 무게 측정 완료 핸들러 (WeightMeasurementStep에서 호출)
  const handleWeightMeasurementComplete = () => {
    if (import.meta.env.DEV) console.log('[StorageFlow] 무게 측정 완료');
    setStep('WEIGHT_RESULT');
  };

  // 무게 다시 측정 함수
  const handleRemeasure = () => {
    // 무게 정보 초기화 및 재생성
    generateWeightInfo();
    // 측정 단계로 돌아가기
    setStep('WEIGHT_CHECK');
  };

  // 잠금 버튼 클릭
  const handleLock = async () => {
    setIsLocking(true);

    try {
      // 🆕 백엔드에 잠금 요청
      if (currentMission?.id) {
        const result = await lockMission(Number(currentMission.id));
        if (import.meta.env.DEV) {
          console.log('[StorageFlow] 잠금 성공:', result);
        }
      }

      // 잠금 효과음 및 딜레이 (UX)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 보관 정보 생성 및 저장
      const luggageId = `luggage-${Date.now()}`;
      const storedLuggage: StoredLuggage = {
        id: luggageId,
        missionId: currentMission?.id || '',
        lockerId: currentMission?.lockerInfo?.lockerId || `A-${Math.floor(Math.random() * 200) + 1}`,
        lockerName: currentMission?.lockerInfo?.lockerName || `Locker A-${Math.floor(Math.random() * 200) + 1}`,
        weight: currentMission?.weightInfo?.luggageWeight || 14.3,
        storedAt: new Date().toISOString(),
        robotCode: currentMission?.robotCode,
        destination: currentMission?.destination,
      };

      addStoredLuggage(storedLuggage);
      setStep('STORAGE_COMPLETE');
    } catch (error) {
      console.error('[StorageFlow] 잠금 실패:', error);
      // 에러 처리: 필요시 에러 상태 추가 가능
    } finally {
      setIsLocking(false);
    }
  };

  // 홈으로 이동
  const handleGoHome = (onComplete: () => void) => {
    clearMission();
    onComplete();
    navigate('/home');
  };

  return {
    step,
    isLocking,
    currentMission,
    handleWeightMeasurementComplete,
    handleRemeasure,
    handleLock,
    handleGoHome,
  };
};
