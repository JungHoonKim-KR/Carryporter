import { useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// 로봇 데이터 타입 정의
export interface RobotData {
  id: string;
  status: 'working' | 'available';
  battery: number;
  position: { x: number; y: number };
  message?: string; // 알림 메시지용
}

export function useRobotSSE() {
  const [robots, setRobots] = useState<RobotData[]>([
    // 초기 더미 데이터 (또는 API로 초기 리스트를 불러오세요)
    { id: 'R-001', status: 'available', battery: 80, position: { x: 0, y: -5 } },
    { id: 'R-002', status: 'working', battery: 65, position: { x: 5, y: 5 } },
  ]);
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  // 토큰 가져오기 (localStorage 등 저장소 위치에 맞게 수정)
  const token = localStorage.getItem('accessToken'); 

  useEffect(() => {
    if (!token) {
      console.error('🔒 토큰이 없습니다. 로그인해주세요.');
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      // await fetchEventSource('http://localhost:8080/api/sse/subscribe', { // 백엔드 주소
            await fetchEventSource('http://i14e101.p.ssafy.io/api/sse/subscribe', { // 백엔드 주소

        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/event-stream',
        },
        signal: controller.signal,

        // 1. 연결 성공 시
        async onopen(response) {
          if (response.ok) {
            console.log('✅ SSE Connected!');
            setIsConnected(true);
            return; // OK
          } else {
            console.error('❌ SSE Connection Failed', response.status);
            if (response.status === 401 || response.status === 403) {
                throw new Error("Unauthorized"); 
            }
          }
        },

        // 2. 메시지 수신 (이벤트 분기 처리)
        onmessage(msg) {
          // heartbeat나 ping은 무시
          if (msg.event === 'heartbeat') return;

          console.log(`📩 Event Received: [${msg.event}]`, msg.data);
          
          try {
            // 1. JSON 형식이 맞는지 확인하기 위해 파싱 시도
            const parsedData = JSON.parse(msg.data);
            
            // ✅ [핵심 수정] 파싱된 내용(parsedData.msg)만 저장하는게 아니라
            // 원본 데이터(msg.data)를 그대로 저장해야 RobotsPage에서 robotCode를 꺼낼 수 있습니다.
            setLastMessage(msg.data); 

            // 이벤트 종류에 따른 로봇 상태 업데이트 로직은 파싱된 객체 이용
            handleServerEvent(msg.event, parsedData);

          } catch (err) {
            // 2. JSON이 아니라면(단순 텍스트 메시지) 여기서 처리
            console.warn("⚠️ JSON 형식이 아닙니다. 텍스트로 처리합니다:", msg.data);
            
            // "Connected!" 같은 단순 텍스트는 그대로 저장해도 됨 (단, Page에서 파싱 에러 방어 필요)
            // 여기서는 로그만 찍고 lastMessage 업데이트는 안 하거나, 필요시 텍스트로 저장
            if (!msg.data.includes("Connected")) {
                 // 일반 텍스트 알림인 경우 (거의 없겠지만)
                 // setLastMessage(JSON.stringify({ msg: msg.data })); // 안전하게 JSON으로 감싸서 저장 추천
            }
          }
        },

        // 3. 에러 발생 시
        onerror(err) {
          console.error('❌ SSE Error:', err);
          setIsConnected(false);
          // 재연결 로직 (필요 시 throw하여 중단)
        },
        
        // 4. 닫힘 처리
        onclose() {
            console.log('🔒 SSE Closed');
            setIsConnected(false);
        }
      });
    };

    fetchData();

    return () => {
      controller.abort();
      setIsConnected(false);
    };
  }, [token]);


  // 🎮 서버 이벤트 처리 로직
  const handleServerEvent = (eventName: string, data: any) => {
    setRobots(prevRobots => {
        // 백엔드 데이터에 robotCode나 robotId가 있다고 가정
        const targetId = data.robotCode || data.robotId; 
        if (!targetId) return prevRobots;

        return prevRobots.map(robot => {
            if (robot.id !== targetId) return robot;

            // 이벤트별 로봇 상태 변경
            switch (eventName) {
                case 'RobotAssignedEvent': // 로봇 배정
                    return { ...robot, status: 'working', message: '배정 완료' };
                
                case 'MissionStartedEvent': // 미션 시작
                    return { ...robot, status: 'working', message: '미션 시작' };

                case 'ROBOT_RETURNED': // 로봇 복귀
                    return { ...robot, status: 'available', position: { x: 0, y: -5 }, message: '복귀 완료' };
                
                default:
                    return robot;
            }
        });
    });
  };

  return { robots, isConnected, lastMessage };
}