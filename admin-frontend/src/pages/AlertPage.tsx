import React, { useEffect, useRef, useState } from 'react';
import { useSseStore } from '@/store/sseStore';

// 1. 이벤트 설정 맵
const EVENT_THEMES: Record<string, { text: string; color: string; sound: string }> = {
  RobotAssignedEvent: { text: '🤖 로봇 배정됨', color: '#39FF14', sound: 'assign.mp3' },
  MissionStartedEvent: { text: '🚀 배송 출발!', color: '#39FF14', sound: 'start.mp3' },
  RobotArrivalEvent: { text: '📍 로봇 도착!', color: '#00E5FF', sound: 'arrival.mp3' },
  UserAuthSuccessEvent: { text: '✅ 인증 성공', color: '#39FF14', sound: 'success.mp3' },
  MissionLockRequestEvent: { text: '🔒 잠금 요청 중', color: '#00E5FF', sound: 'lock.mp3' },
  ReturnStartedEvent: { text: '🏠 복귀 시작', color: '#FFFF00', sound: 'return.mp3' },
  MissionFailedEvent: { text: '⚠️ 미션 실패!', color: '#FF3131', sound: 'error.mp3' },
  RobotReturnedEvent: { text: '💤 복귀 완료', color: '#FFFF00', sound: 'done.mp3' },

  
  // 하트비트 대응
  heartbeat: { text: 'ping!', color: '#39FF14', sound: 'ping.mp3' }
};

const AlertPage = () => {
  
  // 현재 출력 중인 알림 정보 상태
  const [currentAlert, setCurrentAlert] = useState<{ text: string; color: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // AlertPage.tsx 내부
const alertEvent = useSseStore((state) => state.alertEvent);
const setAlertEvent = useSseStore((state) => state.setAlertEvent);

useEffect(() => {
  // 1. alertEvent가 들어왔을 때만 실행
  if (!alertEvent) return;

  // 2. 테마 추출
  const theme = EVENT_THEMES[alertEvent] || { 
    text: alertEvent, // 매핑 안된 경우 이벤트 이름 그대로 출력
    color: '#FFFFFF'
  };

  triggerAlert(theme);

  // 3. 🔥 중요: 알림용 필드만 초기화 (lastMessage는 건드리지 않음!)
  // 0.1초 뒤에 초기화해서 다음 동일 이벤트도 감지할 수 있게 함
  const timer = setTimeout(() => setAlertEvent(null), 100);
  return () => clearTimeout(timer);

}, [alertEvent, setAlertEvent]);
  const triggerAlert = (theme: { text: string; color: string; sound: string }) => {
    setCurrentAlert(theme);
    
    // 3. 동적 사운드 및 색상 적용
    if (audioRef.current) {
      // 필요 시 파일 경로 동적 변경: audioRef.current.src = `/sounds/${theme.sound}`;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => console.log("상호작용 필요"));
    }

    // 다음 이벤트를 받기 위해 스토어 초기화
    setAlertEvent(null);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-[9999]">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* 대기 상태 표시 */}
      {!currentAlert && (
        <div className="text-white/10 text-xs animate-pulse">SYSTEM READY</div>
      )}

      {/* 4. 동적 스타일이 적용된 흐르는 문구 */}
      {currentAlert && (
        <div 
          className="absolute whitespace-nowrap font-[900] italic uppercase"
          onAnimationEnd={() => setCurrentAlert(null)}
          style={{
            color: currentAlert.color,
            fontSize: '18vh',
            // 글자 색상에 맞춘 네온 글로우 효과
            textShadow: `0 0 20px ${currentAlert.color}, 0 0 40px ${currentAlert.color}`,
            animation: 'marquee-flow 3.5s linear forwards'
          }}
        >
          {currentAlert.text}
        </div>
      )}

      <style>{`
        @keyframes marquee-flow {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default AlertPage;