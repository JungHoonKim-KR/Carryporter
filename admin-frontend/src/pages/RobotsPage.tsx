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

type WorkflowStep = 'IDLE' | 'SELECT_LOCKER' | 'CONFIRM_LOCKER' | 'MISSION_START';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '');

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

  // SSE 이벤트 리스너
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      // 🔥 1차 시도: JSON 파싱 (이미 JSON 객체인 경우)
      const parsed = JSON.parse(lastMessage);
      handleParsedEvent(parsed);
    } catch (e) {
      // 🔥 2차 시도: SSE 형식 파싱 (event:\ndata:\n 형식)
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

        // data 부분을 JSON 파싱
        if (dataStr) {
          const parsed = JSON.parse(dataStr);
          // eventName을 parsed 객체에 추가
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

    // MOVE 이벤트 처리 → 터미널 로그 추가
    if (parsed.eventName === 'MOVE' || parsed.event === 'MOVE') {
      const newLog = convertMoveEventToLog(parsed);
      setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
      return;
    }

    // RobotAssignedEvent 처리
    if (parsed.eventName === 'RobotAssignedEvent' || (parsed.userId && parsed.requestType)) {
      console.log('🚀 RobotAssignedEvent 감지! 모달 오픈');
      
      setAssignedEvent({
        userId: parsed.userId || parsed.data?.userId,
        missionId: parsed.missionId || parsed.data?.missionId,
        robotCode: parsed.robotCode || parsed.data?.robotCode,
        callLocationName: parsed.callLocationName || parsed.data?.callLocationName,
        locker_code: parsed.locker_code || parsed.data?.locker_code,
        requestType: parsed.requestType || parsed.data?.requestType || 'FIRST',
      });

      // 로그에도 추가
      const now = new Date();
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        robotId: parsed.robotCode || parsed.data?.robotCode || 'SYSTEM',
        action: `Mission assigned to ${parsed.userId || 'user'}`,
        type: 'info' as const
      };
      setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
    }
    // RobotReturnedAdminEvent 처리
    else if (parsed.eventName === 'RobotReturnedAdminEvent' || (parsed.lockerCode && parsed.robotCode && parsed.missionId)) {
      const data = {
        userId: parsed.userId || parsed.data?.userId,
        robotCode: parsed.robotCode || parsed.data?.robotCode,
        missionId: parsed.missionId || parsed.data?.missionId,
        lockerId: parsed.lockerId || parsed.data?.lockerId,
        lockerCode: parsed.lockerCode || parsed.data?.lockerCode,
        message: parsed.message || parsed.data?.message,
      };
      toast.success(`🤖 ${data.robotCode} 복귀 완료!`);
      setReturnData(data);

      // 로그에도 추가
      const now = new Date();
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        robotId: data.robotCode,
        action: `Returned to base - Mission ${data.missionId} complete`,
        type: 'success' as const
      };
      setRealTimeLogs(prev => [newLog, ...prev].slice(0, 50));
    }
  };

  // 핸들러 함수들
  const handleLockerSelect = (lockerId: number) => { setSelectedLocker(lockerId); setStep('CONFIRM_LOCKER'); };
  const confirmLockerAssignment = () => { toast.success(`📦 사물함 ${selectedLocker}번 배정 확정!`); setStep('MISSION_START'); };
  const handleStartMission = () => { toast.success(`🚀 ${assignedRobot}호기가 출발합니다!`); resetWorkflow(); };
  const resetWorkflow = () => { setStep('IDLE'); setAssignedRobot(null); setSelectedLocker(null); };
  const handleMissionStartComplete = (missionId: number) => { toast.success(`🚀 미션 #${missionId} 출발 요청 완료`); setAssignedEvent(null); };

  // 통계
  const stats = useMemo(() => {
    const total = mergedRobots.length;
    const working = mergedRobots.filter(r => r.status === 'working').length;
    const available = mergedRobots.filter(r => r.status === 'available').length;
    return { total, working, available };
  }, [mergedRobots]);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-slate-100">
      {/* 밝은 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-100 pointer-events-none">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="light" style={{ zIndex: 99999 }} />

      {/* 헤더 */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none h-12 px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20 border-b border-slate-200 shadow-sm"
      >
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
        
        <div className="flex items-center gap-4">
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-300">
                <Radio className="w-3 h-3 text-cyan-600" />
                <span className="text-[10px] font-bold text-cyan-700 tracking-wider">STREAMING</span>
            </motion.div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-rose-100 border-rose-300 text-rose-700'}`}>
                <Wifi className="w-3 h-3" />
                <span className="text-[10px] font-black tracking-widest">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
        </div>
      </motion.header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-h-0 p-2 flex gap-2 z-10">

        {/* 왼쪽: 지도 + 사물함/통계 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          
          {/* 지도 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xl group"
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-400 animate-pulse" />
            </div>
            
            <div className="w-full h-full relative">
               <RobotStage robots={mergedRobots} showDummyIfEmpty={true} />
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