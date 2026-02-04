import { useState, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { lockMission } from '../../api/mission.api';
import { Button } from '@/components/ui/button';

interface WeightModalProps {
  onLockSuccess: () => void;
}

/**
 * 무게 측정 모달
 * UNLOCKED 상태에서 표시
 * 무게 측정 → 결과 표시 → 잠금 버튼
 */
export const WeightModal = ({ onLockSuccess }: WeightModalProps) => {
  const { currentMission, generateWeightInfo } = useMissionStore();
  
  const [phase, setPhase] = useState<'measuring' | 'result'>('measuring');
  const [isLocking, setIsLocking] = useState(false);
  const [displayWeight, setDisplayWeight] = useState(0);
  
  const weight = currentMission?.weightInfo?.luggageWeight || 0;
  const isOverweight = weight > 15;

  // 마운트 시 무게 생성
  useEffect(() => {
    if (!currentMission?.weightInfo) {
      generateWeightInfo();
    }
  }, []);

  // 무게 애니메이션
  useEffect(() => {
    if (weight > 0 && phase === 'measuring') {
      let start = 0;
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayWeight(weight * eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayWeight(weight);
          setTimeout(() => setPhase('result'), 500);
        }
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [weight, phase]);

  // 잠금 처리
  const handleLock = async () => {
    if (!currentMission?.id) return;
    
    setIsLocking(true);
    try {
      await lockMission(Number(currentMission.id));
      // 1초 딜레이 후 성공 콜백
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLockSuccess();
    } catch (error) {
      console.error('[WeightModal] 잠금 실패:', error);
    } finally {
      setIsLocking(false);
    }
  };

  // 다시 측정
  const handleRemeasure = () => {
    generateWeightInfo();
    setPhase('measuring');
    setDisplayWeight(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl animate-fade-in">
        {phase === 'measuring' ? (
          // 측정 중
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-toss-blue-500 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h2 className="text-gray-900 text-xl font-bold mb-2">무게 측정 중...</h2>
            <p className="text-gray-500 text-sm mb-6">카트에 짐을 올려주세요</p>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-5xl font-bold text-toss-blue-500">
                {displayWeight.toFixed(1)}
              </p>
              <p className="text-xl text-gray-400 mt-1">kg</p>
            </div>
          </div>
        ) : (
          // 결과 표시
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-toss-green rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-gray-900 text-xl font-bold mb-2">무게 측정 완료</h2>
            <p className="text-gray-500 text-sm mb-4">짐의 무게가 측정되었습니다</p>

            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <p className="text-sm text-gray-500 mb-2">측정된 무게</p>
              <p className="text-5xl font-bold text-toss-blue-500">
                {weight.toFixed(1)}
              </p>
              <p className="text-xl text-gray-400 mt-1">kg</p>
              {isOverweight && (
                <p className="text-red-500 text-sm mt-3">⚠️ 무게가 15kg을 초과했습니다</p>
              )}
            </div>

            <div className="flex gap-3">
              {isOverweight && (
                <Button
                  onClick={handleRemeasure}
                  className="flex-1 h-12 font-semibold bg-gray-500 hover:bg-gray-600 text-white"
                >
                  다시 측정
                </Button>
              )}
              <Button
                onClick={handleLock}
                disabled={isLocking || isOverweight}
                className="flex-1 h-12 font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white disabled:bg-gray-300"
              >
                {isLocking ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    잠금 중...
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    잠금
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
