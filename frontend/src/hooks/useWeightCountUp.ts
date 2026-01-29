import { useEffect, useState, useRef } from 'react';

interface UseWeightCountUpOptions {
  startValue: number; // 3.7 (초기 무게)
  endValue: number; // 18.0 (최종 무게)
  duration: number; // 2000ms (애니메이션 시간)
  onComplete?: () => void; // 애니메이션 완료 콜백
}

/**
 * 무게 카운트업 애니메이션 훅
 *
 * requestAnimationFrame을 사용하여 부드러운 숫자 카운트업 애니메이션을 제공합니다.
 * easeOutCubic 이징 함수를 사용하여 빠르게 시작하고 천천히 끝나는 효과를 구현합니다.
 *
 * @param options - 애니메이션 옵션
 * @returns 현재 값, 애니메이션 상태, 시작 함수
 */
export const useWeightCountUp = ({
  startValue,
  endValue,
  duration,
  onComplete,
}: UseWeightCountUpOptions) => {
  const [currentValue, setCurrentValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  /**
   * 애니메이션 시작
   * requestAnimationFrame을 사용하여 60fps로 숫자를 업데이트합니다.
   */
  const startAnimation = () => {
    setIsAnimating(true);
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      // 진행도 계산 (0 ~ 1)
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // easeOutCubic 이징 함수 (빠르게 시작 → 천천히 끝)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // 현재 값 계산
      const value = startValue + (endValue - startValue) * easeProgress;
      setCurrentValue(value);

      // 애니메이션 계속 진행
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // 애니메이션 완료
        setIsAnimating(false);
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  /**
   * 컴포넌트 unmount 시 애니메이션 정리
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    currentValue,
    isAnimating,
    startAnimation,
  };
};
