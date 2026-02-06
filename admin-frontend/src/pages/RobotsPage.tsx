import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, LayoutGrid, Activity, Maximize2, Users, Radio, Wifi } from 'lucide-react'
import { useRobotFetch, RobotItem } from '@/hooks/useRobotFetch'
import { useSseStore } from '@/store/sseStore'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// --- 컴포넌트 임포트 ---
import RobotStage from '@/components/robot/RobotStage'
import RobotDetailModal from '@/components/robot/RobotDetailModal'
import RobotActivityTerminal from '@/components/robot/RobotActivityTerminal'
import MiniLockerWidget from '@/components/locker/MiniLockerWidget'
import LockerSelectionModal from '@/components/locker/LockerSelectionModal'
import MissionControlModal from '@/components/mission/MissionControlModal'
import MissionProcessModal from '@/components/mission/MissionProcessModal'
import MissionReturnModal from '@/components/mission/MissionReturnModal'
import RealtimeActivityFeed from '@/components/monitoring/RealtimeActivityFeed'
import { RobotAssignedEvent, RobotReturnedAdminEvent } from '@/types/robotEvents'
import { 
  getPathFromCurrentPosition, 
  getReturnPath, 
  getDestinationCoords,
  NavigationPath 
} from '@/utils/navigationPaths'

type WorkflowStep = 'IDLE' | 'SELECT_LOCKER' | 'CONFIRM_LOCKER' | 'MISSION_START';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '');

// 🗺️ 미션 정보 저장 인터페이스
interface MissionInfo {
  missionId: number;
  robotCode: string;
  robotMacAddress: string;
  destinationName: string;
  destinationX: number;
  destinationY: number;
}

// 🗺️ 로봇 네비게이션 상태
interface RobotNavigation {
  robotCode: string;
  currentPath: NavigationPath;
  currentWaypointIndex: number;
  isNavigating: boolean;
  targetX: number;
  targetY: number;
}

// SSE MOVE 이벤트를 로그로 변환
const convertMoveEventToLog = (moveData: any) => {
  const now = new Date()
  return {
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    robotId: moveData.robotCode || moveData.robotId || 'RB-XXX',
    action: `Moving to (${moveData.x}, ${moveData.y})${moveData.status ? ` - ${moveData.status}` : ''}`,
    type: 'move' as const
  }
}

export default function RobotsPage() {
  const { robots: apiRobots, refetch } = useRobotFetch();
  const sseRobots = useSseStore(state => state.robots);
  const isConnected = useSseStore(state => state.isConnected);
  const lastMessage = useSseStore(state => state.lastMessage);
  
  const [userCount, setUserCount] = useState<number>(0);
  const [lockers, setLockers] = useState<any[]>([]);
  const [realTimeLogs, setRealTimeLogs] = useState<any[]>([]);

  // 🗺️ 미션 정보 저장 (MissionAssigned 이벤트에서 저장)
  const [activeMissions, setActiveMissions] = useState<Map<number, MissionInfo>>(new Map());
  
  // 🗺️ 로봇별 네비게이션 상태
  const [robotNavigations, setRobotNavigations] = useState<Map<string, RobotNavigation>>(new Map());

  // 사용자 수 조회
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const baseUrl = API_BASE ? `/${API_BASE}` : '';
        const res = await fetch(`${baseUrl}/api/admin/users/count`.replace(/\/+/g, '/'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserCount(data.count);
        }
      } catch (e) { console.error(e); }
    };
    fetchUserCount();
  }, []);

  // 사물함 조회
  useEffect(() => {
    const fetchLockers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const baseUrl = API_BASE ? `/${API_BASE}` : '';
        const res = await fetch(`${baseUrl}/api/admin/lockers`.replace(/\/+/g, '/'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLockers(data.sort((a: any, b: any) => 
            a.lockerCode.localeCompare(b.lockerCode, undefined, { numeric: true })
          ));
        }
      } catch (e) { console.error(e); }
    };
    fetchLockers();
  }, []);

  // 데이터 병합
  const mergedRobots: RobotItem[] = useMemo(() => {
    const sseMap = new Map(sseRobots.map((r: any) => [r.robotCode, r]));
    return apiRobots.map((robot) => {
      const sseData = sseMap.get(robot.robotCode);
      if (!sseData) return robot;
      return {
        ...robot,
        status: sseData.status ?? robot.status,
        x: sseData.x ?? robot.x,
        y: sseData.y ?? robot.y,
        currentTask: sseData.currentTask ?? robot.currentTask,
      };
    });
  }, [apiRobots, sseRobots]);

  // State
  const [selectedTaskRobot, setSelectedTaskRobot] = useState<any>(null);
  const [step, setStep] = useState<WorkflowStep>('IDLE');
  const [assignedRobot, setAssignedRobot] = useState<string | null>(null);
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);
  const [assignedEvent, setAssignedEvent] = useState<RobotAssignedEvent | null>(null);
  const [returnData, setReturnData] = useState<RobotReturnedAdminEvent | null>(null);

  // 🔥 SSE 이동 데이터를 저장할 state
  const [sseMovements, setSseMovements] = useState<Array<{ robotCode: string; x: number; y: number }>>([]);

  // 🗺️ 네비게이션 업데이트 (주기적으로 waypoint 따라 이동)
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotNavigations(prev => {
        const updated = new Map(prev);
        let hasChanges = false;

        updated.forEach((nav, robotCode) => {
          if (!nav.isNavigating || !nav.currentPath) return;

          // 현재 waypoint 확인
          const currentWaypoint = nav.currentPath.waypoints[nav.currentWaypointIndex];
          if (!currentWaypoint) {
            // 경로 완료
            console.log(`✅ ${robotCode} 네비게이션 완료!`);
            nav.isNavigating = false;
            hasChanges = true;
            return;
          }

          console.log(`🚶 ${robotCode} waypoint ${nav.currentWaypointIndex}/${nav.currentPath.waypoints.length - 1} → (${currentWaypoint.x}, ${currentWaypoint.y})`);

          // 목표 위치 업데이트
          nav.targetX = currentWaypoint.x;
          nav.targetY = currentWaypoint.y;

          // SSE Movement 업데이트 (RobotStage로 전달)
          setSseMovements(prevMov => {
            const existing = prevMov.find(m => m.robotCode === robotCode);
            const newMovement = { robotCode, x: currentWaypoint.x, y: currentWaypoint.y };
            
            console.log(`📡 SSE Movement 업데이트:`, newMovement);
            
            if (existing) {
              return prevMov.map(m =>
                m.robotCode === robotCode ? newMovement : m
              );
            } else {
              return [...prevMov, newMovement];
            }
          });

          // 다음 waypoint로 이동
          nav.currentWaypointIndex++;
          hasChanges = true;
        });

        return hasChanges ? new Map(updated) : prev;
      });
    }, 3000); // 3초마다 다음 waypoint로 이동

    return () => clearInterval(interval);
  }, []);

  // 🔥 SSE 이벤트 리스너
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      const parsed = JSON.parse(lastMessage);
      handleParsedEvent(parsed);
    } catch (e) {
      try {
        const lines = lastMessage.split('\n');
        let eventName = '';
        let dataStr = '';

        lines.forEach(line => {
          if (line.startsWith('event:')) {
            eventName = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.replace('data:', '').trim();
          }
        });

        if (dataStr) {
          const parsed = JSON.parse(dataStr);
          parsed.eventName = parsed.eventName || eventName;
          handleParsedEvent(parsed);
        }
      } catch (innerErr) {
        // 무시
      }
    }
  }, [lastMessage]);

  // 🔥 파싱된 이벤트 처리 함수
  const handleParsedEvent = (parsed: any) => {
    console.log('📨 파싱된 이벤트:', parsed);

    // 🗺️ MissionAssignedEvent - 로봇과 목적지 기억
    if (parsed.eventName === 'RobotAssignedEvent' || (parsed.userId && parsed.requestType)) {
      console.log('🚀 RobotAssignedEvent 감지!');
      
      const missionInfo: MissionInfo = {
        missionId: parsed.missionId,
        robotCode: parsed.robotCode,
        robotMacAddress: parsed.robotMacAddress || '',
        destinationName: parsed.callLocationName || '',
        destinationX: parsed.destX || 0,
        destinationY: parsed.destY || 0,
      };

      setActiveMissions(prev => {
        const updated = new Map(prev);
        updated.set(missionInfo.missionId, missionInfo);
        return updated;
      });

      setAssignedEvent({
        userId: parsed.userId || parsed.data?.userId,
        missionId: parsed.missionId || parsed.data?.missionId,
        robotCode: parsed.robotCode || parsed.data?.robotCode,
        callLocationName: parsed.callLocationName || parsed.data?.callLocationName,
        locker_code: parsed.locker_code || parsed.data?.locker_code,
        requestType: parsed.requestType || parsed.data?.requestType || 'FIRST',
      });

      // 로그 추가
      const now = new Date();
      const newLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        robotId: parsed.robotCode || 'RB-XXX',
        action: `🎯 Mission Assigned - ${parsed.callLocationName || 'Unknown'}`,
        type: 'mission' as const,
      };
      setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
      
      toast.success(`🤖 로봇 ${parsed.robotCode}에게 미션이 배정되었습니다!`, { position: 'top-right' });
      return;
    }

    // 🗺️ MissionStartedEvent - 목적지로 이동 시작
    if (parsed.eventName === 'MissionStartedEvent' || parsed.event === 'MissionStartedEvent') {
      console.log('🚁 MissionStartedEvent 감지!', parsed);

      const missionId = parsed.missionId;
      const robotCode = parsed.robotCode;
      const missionInfo = activeMissions.get(missionId);

      if (!missionInfo) {
        console.warn('⚠️ 저장된 미션 정보가 없습니다:', missionId);
        return;
      }

      console.log('📋 미션 정보:', missionInfo);

      // 로봇의 현재 위치 찾기
      const robot = mergedRobots.find(r => r.robotCode === robotCode);
      const currentX = robot?.x ?? -80;
      const currentY = robot?.y ?? 0;

      console.log(`🤖 ${robotCode} 현재 위치: (${currentX}, ${currentY})`);
      console.log(`🎯 목적지: ${missionInfo.destinationName}`);

      // 경로 찾기
      const path = getPathFromCurrentPosition(
        currentX,
        currentY,
        missionInfo.destinationName
      );

      if (path) {
        console.log('🗺️ 경로 찾음:', path);
        console.log('📍 Waypoints:', path.waypoints);
        
        setRobotNavigations(prev => {
          const updated = new Map(prev);
          updated.set(robotCode, {
            robotCode,
            currentPath: path,
            currentWaypointIndex: 0,
            isNavigating: true,
            targetX: path.waypoints[0].x,
            targetY: path.waypoints[0].y,
          });
          console.log('✅ 네비게이션 상태 설정 완료:', robotCode);
          return updated;
        });

        // 로그 추가
        const now = new Date();
        const newLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
          robotId: robotCode,
          action: `🚀 Mission Started → ${missionInfo.destinationName}`,
          type: 'mission' as const,
        };
        setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
        
        toast.info(`🚀 ${robotCode}가 ${missionInfo.destinationName}로 출발합니다!`, { position: 'top-right' });
      } else {
        console.warn('⚠️ 경로를 찾을 수 없습니다');
        console.log(`시도한 경로: (${currentX}, ${currentY}) → ${missionInfo.destinationName}`);
        toast.error('경로를 찾을 수 없습니다', { position: 'top-right' });
      }
      return;
    }

    // 🗺️ ReturnStartedEvent - Main Station으로 복귀
    if (parsed.eventName === 'ReturnStartedEvent' || parsed.event === 'ReturnStartedEvent') {
      console.log('🏠 ReturnStartedEvent 감지!', parsed);

      const robotMacAddress = parsed.robotMacAddress;
      const homeX = parsed.homeX ?? -80;
      const homeY = parsed.homeY ?? 0;
      
      // MAC 주소로 로봇 찾기
      const robot = mergedRobots.find(r => r.macAddress === robotMacAddress);
      if (!robot) {
        console.warn('⚠️ 로봇을 찾을 수 없습니다:', robotMacAddress);
        return;
      }

      const robotCode = robot.robotCode;
      const currentX = robot.x ?? -80;
      const currentY = robot.y ?? 0;

      // 복귀 경로 찾기
      const returnPath = getReturnPath(currentX, currentY);

      if (returnPath) {
        console.log('🗺️ 복귀 경로 찾음:', returnPath);
        
        setRobotNavigations(prev => {
          const updated = new Map(prev);
          updated.set(robotCode, {
            robotCode,
            currentPath: returnPath,
            currentWaypointIndex: 0,
            isNavigating: true,
            targetX: returnPath.waypoints[0].x,
            targetY: returnPath.waypoints[0].y,
          });
          return updated;
        });

        // 로그 추가
        const now = new Date();
        const newLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
          robotId: robotCode,
          action: `🏠 Returning to Main Station`,
          type: 'return' as const,
        };
        setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
        
        toast.info(`🏠 ${robotCode}가 Main Station으로 복귀합니다!`, { position: 'top-right' });
      }
      return;
    }

    // 🔥 MOVE 이벤트 처리 (기존 코드 유지)
    if (parsed.eventName === 'MOVE' || parsed.event === 'MOVE') {
      const robotCode = parsed.robotCode || parsed.robotId;
      const x = parsed.x;
      const y = parsed.y;
      
      if (robotCode && x !== undefined && y !== undefined) {
        setSseMovements(prev => {
          const existing = prev.find(m => m.robotCode === robotCode);
          if (existing) {
            return prev.map(m => 
              m.robotCode === robotCode 
                ? { robotCode, x, y }
                : m
            );
          } else {
            return [...prev, { robotCode, x, y }];
          }
        });
      }

      const newLog = convertMoveEventToLog(parsed);
      setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
      return;
    }

    // RobotReturnedAdminEvent 처리
    if (parsed.eventName === 'RobotReturnedAdminEvent') {
      console.log('🔄 RobotReturnedAdminEvent 감지!');
      setReturnData({
        userId: parsed.userId,
        missionId: parsed.missionId,
        robotCode: parsed.robotCode,
        lockerId: parsed.lockerId,
        lockerCode: parsed.lockerCode,
        message: parsed.message || '로봇이 복귀했습니다.',
      });

      // 미션 완료 시 저장된 정보 제거
      setActiveMissions(prev => {
        const updated = new Map(prev);
        updated.delete(parsed.missionId);
        return updated;
      });

      // 네비게이션 상태 초기화
      setRobotNavigations(prev => {
        const updated = new Map(prev);
        updated.delete(parsed.robotCode);
        return updated;
      });

      const now = new Date();
      const newLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        robotId: parsed.robotCode || 'RB-XXX',
        action: `✅ Mission Completed - Returned`,
        type: 'complete' as const,
      };
      setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
      
      toast.success(`✅ 로봇 ${parsed.robotCode}가 미션을 완료했습니다!`, { position: 'top-right' });
    }
  };

  const handleLockerSelect = (lockerId: number) => {
    setSelectedLocker(lockerId);
    setStep('CONFIRM_LOCKER');
  };

  const confirmLockerAssignment = () => {
    setStep('MISSION_START');
  };

  const handleStartMission = () => {
    toast.success(`미션이 시작되었습니다! 로봇 ${assignedRobot}이(가) 이동합니다.`, { position: 'top-right' });
    resetWorkflow();
  };

  const handleMissionStartComplete = (missionId: number) => {
    console.log('✅ 미션 시작 완료:', missionId);
    setAssignedEvent(null);
    toast.success('미션이 시작되었습니다!', { position: 'top-right' });
  };

  const resetWorkflow = () => {
    setStep('IDLE');
    setAssignedRobot(null);
    setSelectedLocker(null);
  };

  const stats = useMemo(() => {
    const available = mergedRobots.filter((r) => r.status === 'available').length;
    const total = mergedRobots.length;
    return { available, total, busy: total - available };
  }, [mergedRobots]);

  const activeCount = mergedRobots.length;

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-100 via-white to-blue-50 p-2 overflow-hidden">
      <ToastContainer />

      {/* 상단 헤더 */}
      {/* 헤더 */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none h-12 px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20 border-b border-slate-200 shadow-sm"
      >
        {/* 좌측: 로고 및 타이틀 */}
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/30 blur-lg rounded-full animate-pulse" />
                <img src="./assets/images/robot-white.png" alt="Logo" className="h-7 w-auto object-contain relative z-10" />
            </div>
            <div className="flex flex-col justify-center">
                <h1 className="text-lg font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-tight">CARRYPORTER</h1>
                <p className="text-[8px] font-bold text-slate-500 tracking-widest">REALTIME MONITOR</p>
            </div>
        </div>
        
        {/* 우측: 상태 표시 및 액션 버튼 */}
        <div className="flex items-center gap-4">
            {/* 🧪 테스트 버튼 (여기에 추가됨) */}
            <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    const testRobot = mergedRobots[0];
                    if (testRobot) {
                        console.log('🧪 테스트: 로봇을 STOP-1로 이동 시작');
                        // getPathFromCurrentPosition 함수가 현재 컴포넌트 스코프에 있다고 가정
                        const path = getPathFromCurrentPosition(-80, 0, 'STOP-1'); 
                        if (path) {
                            setRobotNavigations(prev => {
                                const updated = new Map(prev);
                                updated.set(testRobot.robotCode, {
                                    robotCode: testRobot.robotCode,
                                    currentPath: path,
                                    currentWaypointIndex: 0,
                                    isNavigating: true,
                                    targetX: path.waypoints[0].x,
                                    targetY: path.waypoints[0].y,
                                });
                                return updated;
                            });
                            toast.info('🧪 테스트 네비게이션 시작!', { position: 'top-right' });
                        }
                    }
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-[10px] font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1"
            >
                🧪 TEST NAV
            </motion.button>

            {/* 기존: 스트리밍 상태 */}
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-300">
                <Radio className="w-3 h-3 text-cyan-600" />
                <span className="text-[10px] font-bold text-cyan-700 tracking-wider">STREAMING</span>
            </motion.div>

            {/* 기존: 연결 상태 */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-rose-100 border-rose-300 text-rose-700'}`}>
                <Wifi className="w-3 h-3" />
                <span className="text-[10px] font-black tracking-widest">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
        </div>
      </motion.header>

      {/* 메인 레이아웃 (왼쪽: RobotStage + 하단 통계 / 오른쪽: 터미널 로그 + 실시간 활동) */}
      <div className="flex-1 min-h-0 flex gap-2">
        
        {/* 🔥 왼쪽: RobotStage 영역 + 하단 통계 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          
          {/* RobotStage 영역 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xl group"
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-400 animate-pulse" />
            </div>
            
            <div className="w-full h-full relative">
               <RobotStage robots={mergedRobots} showDummyIfEmpty={true} 
               sseMovements={sseMovements}/>
            </div>

            <div className="absolute bottom-3 right-3 z-20">
               <button className="p-2 bg-white/95 backdrop-blur-md shadow-xl rounded-lg hover:scale-110 transition-transform border border-slate-300">
                 <Maximize2 className="w-4 h-4 text-slate-600" />
               </button>
            </div>
          </motion.div>

          {/* 하단: 사물함 + 통계 3개 */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-24 flex gap-2"
          >
            <div className="flex-1 min-w-0">
               <MiniLockerWidget onClick={() => {}} lockers={lockers} />
            </div>

            <div className="flex-none w-80 grid grid-cols-3 gap-2">
                <StatCard icon={<Users className="w-4 h-4 text-indigo-600" />} color="indigo" value={userCount} label="USERS" delay={0} />
                <StatCard icon={<Bot className="w-4 h-4 text-cyan-600" />} color="cyan" value={stats.total} label="ROBOTS" delay={0.1} />
                <StatCard icon={<LayoutGrid className="w-4 h-4 text-emerald-600" />} color="emerald" value={stats.available} label="READY" delay={0.2} />
            </div>
          </motion.div>
        </div>

        {/* 🔥 오른쪽: 터미널 로그 (작게) + 실시간 활동 (크게) */}
        <aside className="w-80 flex-none flex flex-col gap-2">
          
          {/* 🔥 터미널 로그 - 작게 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="h-64 flex-none relative"
          >
             {/* 🔥 상단 프로그레스 바 */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden z-30 rounded-t-xl">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ width: '60%' }}
              />
            </div>
             <RobotActivityTerminal realLogs={realTimeLogs} />
          </motion.div>

          {/* 🔥 실시간 활동 로그 - 크게 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 min-h-0 relative"
          >
             {/* 🔥 상단 프로그레스 바 */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-100 overflow-hidden z-30 rounded-t-xl">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ width: '60%' }}
              />
            </div>
             <RealtimeActivityFeed />
          </motion.div>

        </aside>
      </div>

      {/* 모달들 */}
      <AnimatePresence>
        {step === 'SELECT_LOCKER' && <LockerSelectionModal onSelect={handleLockerSelect} onClose={resetWorkflow} />}
        {step === 'CONFIRM_LOCKER' && (
           <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
             <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white border border-cyan-300 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h3 className="text-lg font-bold text-cyan-700 mb-4">사물함 배정 확인</h3>
                <p className="mb-6 text-sm text-slate-700">
                    <span className="font-bold text-cyan-600">{selectedLocker}번 사물함</span>을 
                    <span className="font-bold text-slate-900 mx-1">{assignedRobot}</span>에게 배정합니까?
                </p>
                <div className="flex gap-2">
                  <button onClick={confirmLockerAssignment} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 shadow-lg">확인</button>
                  <button onClick={() => setStep('SELECT_LOCKER')} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300">취소</button>
                </div>
             </motion.div>
           </div>
        )}
        {step === 'MISSION_START' && assignedRobot && (
          <MissionControlModal robotCode={assignedRobot} lockerId={selectedLocker!} onStart={handleStartMission} onClose={resetWorkflow} />
        )}
        {selectedTaskRobot && <RobotDetailModal robot={selectedTaskRobot} onClose={() => setSelectedTaskRobot(null)} />}
      </AnimatePresence>

      {assignedEvent && <MissionProcessModal data={assignedEvent} onClose={() => setAssignedEvent(null)} onMissionStart={handleMissionStartComplete} />}
      {returnData && <MissionReturnModal data={returnData} onClose={() => setReturnData(null)} onComplete={() => {}} />}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(226, 232, 240, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
      `}</style>
    </div>
  );
}

// StatCard 컴포넌트 - 밝은 테마
function StatCard({ icon, color, value, label, delay }: any) {
    const colors: any = {
        indigo: { 
          border: 'border-indigo-300', 
          text: 'text-indigo-700', 
          bg: 'bg-indigo-600',
          bgLight: 'bg-gradient-to-br from-indigo-50 to-purple-50'
        },
        cyan: { 
          border: 'border-cyan-300', 
          text: 'text-cyan-700', 
          bg: 'bg-cyan-600',
          bgLight: 'bg-gradient-to-br from-cyan-50 to-blue-50'
        },
        emerald: { 
          border: 'border-emerald-300', 
          text: 'text-emerald-700', 
          bg: 'bg-emerald-600',
          bgLight: 'bg-gradient-to-br from-emerald-50 to-green-50'
        }
    };
    
    return (
        <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className={`relative ${colors[color].bgLight} backdrop-blur-sm border ${colors[color].border} rounded-lg p-2 shadow-lg flex flex-col justify-between overflow-hidden`}
        >
            {/* 배경 애니메이션 */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            <div className="relative flex items-center justify-between">
                {icon}
                <motion.div 
                  animate={{ scale: [1, 1.3, 1] }} 
                  transition={{ duration: 2, repeat: Infinity, delay }} 
                  className={`w-1.5 h-1.5 rounded-full ${colors[color].bg} shadow-[0_0_10px_currentColor]`} 
                />
            </div>
            <div className="relative">
                <div className="text-xl font-black text-slate-800">{value}</div>
                <div className={`text-[9px] font-bold ${colors[color].text} tracking-widest`}>{label}</div>
            </div>
        </motion.div>
    )
}