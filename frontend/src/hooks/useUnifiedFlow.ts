import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissionStore } from '../store/missionStore';
import { lockMission, returnMission } from '../api/mission.api';
import type { UnifiedFlowStep, StoredLuggage } from '../types/mission.types';

/**
 * 통합 플로우 비즈니스 로직을 관리하는 커스텀 훅
 * 보관/반납 개념 제거, 단일 플로우로 통합
 */
export const useUnifiedFlow = () => {
  const navigate = useNavigate();
  const {
    currentMission,
    generateWeightInfo,
    addStoredLuggage,
    clearMission,
    setUnifiedFlowStep,
  } = useMissionStore();

  const [step, setStep] = useState<UnifiedFlowStep>('WEIGHT_CHECK');
  const [isLocking, setIsLocking] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [checklist, setChecklist] = useState({
    workCompleted: false, // 작업을 완료했나요?
    lockerChecked: false, // 사물함 상태를 확인했나요?
    confirmReturn: false, // 복귀를 시작하겠습니다
  });

  // 컴포넌트 마운트 시 무게 생성
  useEffect(() => {
    // 무게 정보가 없으면 생성
    if (!currentMission?.weightInfo) {
      if (import.meta.env.DEV) console.log('[UnifiedFlow] 무게 정보 생성 중...');
      generateWeightInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 무게 측정 완료 핸들러
  const handleWeightMeasurementComplete = () => {
    if (import.meta.env.DEV) console.log('[UnifiedFlow] 무게 측정 완료');
    setStep('WEIGHT_RESULT');
  };

  // 무게 다시 측정 함수
  const handleRemeasure = () => {
    // 무게 정보 초기화 및 재생성
    generateWeightInfo();
    // 측정 단계로 돌아가기
    setStep('WEIGHT_CHECK');
  };

  // 잠금 버튼 클릭 (WEIGHT_RESULT → LOCK_REQUESTED)
  const handleLock = async () => {
    setIsLocking(true);

    try {
      // 백엔드에 잠금 요청
      if (currentMission?.id) {
        await lockMission(Number(currentMission.id));
        if (import.meta.env.DEV) {
          console.log('[UnifiedFlow] 잠금 성공');
        }

        // SSE에서 LOCKED 이벤트 수신 시 자동으로 CHECKLIST_CONFIRM으로 전환됨
        // (useMissionSSE.ts에서 처리)
        setStep('LOCK_REQUESTED');
        setUnifiedFlowStep('LOCK_REQUESTED');
      }

      // 잠금 효과 딜레이 (UX)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('[UnifiedFlow] 잠금 실패:', error);
      // 에러 처리: 필요시 에러 상태 추가 가능
    } finally {
      setIsLocking(false);
    }
  };

  // 체크리스트 변경
  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 복귀 버튼 클릭 (CHECKLIST_CONFIRM → RETURN_REQUESTED)
  const handleReturn = async () => {
    if (!currentMission?.id) return;

    setIsReturning(true);

    try {
      // 로봇 복귀 요청
      await returnMission(Number(currentMission.id));
      if (import.meta.env.DEV) {
        console.log('[UnifiedFlow] 로봇 복귀 요청 성공');
      }

      // 보관 정보 생성 및 저장
      const luggageId = `luggage-${Date.now()}`;
      const storedLuggage: StoredLuggage = {
        id: luggageId,
        missionId: currentMission.id,
        lockerId: currentMission.lockerInfo?.lockerId || `A-${Math.floor(Math.random() * 200) + 1}`,
        lockerName: currentMission.lockerInfo?.lockerName || `Locker A-${Math.floor(Math.random() * 200) + 1}`,
        weight: currentMission.weightInfo?.luggageWeight || 14.3,
        storedAt: new Date().toISOString(),
        robotCode: currentMission.robotCode,
        destination: currentMission.destination,
      };

      addStoredLuggage(storedLuggage);

      // 복귀 단계로 전환
      setStep('RETURN_REQUESTED');
      setUnifiedFlowStep('RETURN_REQUESTED');

      // 1.5초 후 완료 단계로 자동 전환
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep('RETURN_COMPLETE');
      setUnifiedFlowStep('RETURN_COMPLETE');
    } catch (error) {
      console.error('[UnifiedFlow] 복귀 실패:', error);
    } finally {
      setIsReturning(false);
    }
  };

  // 홈으로 이동
  const handleGoHome = (onComplete: () => void) => {
    clearMission();
    setUnifiedFlowStep(null);
    onComplete();
    navigate('/home');
  };

  const allChecked = checklist.workCompleted && checklist.lockerChecked && checklist.confirmReturn;

  return {
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
  };
};
