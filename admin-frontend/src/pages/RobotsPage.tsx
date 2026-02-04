import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Zap, LayoutGrid, Activity, Maximize2, Users, Radio, Wifi } from 'lucide-react'
import { useRobotSSE } from '@/hooks/UserRobotSSE'
import { useRobotFetch, RobotItem } from '@/hooks/useRobotFetch'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// --- 컴포넌트 임포트 ---
import RobotStage from '@/components/robot/RobotStage'
import RobotDetailModal from '@/components/robot/RobotDetailModal'
import ActiveTaskList from '@/components/dashboard/ActiveTaskList'
import { StatusCard } from '@/components/dashboard/DashboardWidgets'
import MiniLockerWidget from '@/components/locker/MiniLockerWidget'
import LockerSelectionModal from '@/components/locker/LockerSelectionModal'
import MissionControlModal from '@/components/mission/MissionControlModal'
import MissionProcessModal from '@/components/mission/MissionProcessModal'
import MissionReturnModal from '@/components/mission/MissionReturnModal'
import { RobotAssignedEvent, RobotReturnedAdminEvent } from '@/types/robotEvents'

type WorkflowStep = 'IDLE' | 'SELECT_LOCKER' | 'CONFIRM_LOCKER' | 'MISSION_START';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '');

export default function RobotsPage() {
  // ── 1. 백엔드 API → 초기 로봇 목록 ──────────
  const { robots: apiRobots, loading: apiLoading, error: apiError, refetch } = useRobotFetch();

  // ── 2. SSE → 실시간 이벤트 ────────────────────────────────
  const { robots: sseRobots, isConnected, lastMessage } = useRobotSSE();

  // ── 3. 사용자 수 조회 ─────────────
  const [userCount, setUserCount] = useState<number>(0);

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
      } catch (e) {
        console.error("사용자 수 조회 실패:", e);
      }
    };
    fetchUserCount();
  }, []);

  // ── 4. 병합 ──
  const mergedRobots: RobotItem[] = useMemo(() => {
    const sseMap = new Map(sseRobots.map((r: any) => [r.robotCode, r]));
    return apiRobots.map((robot) => {
      const sseData = sseMap.get(robot.robotCode);
      if (!sseData) return robot;
      return {
        ...robot,
        status:      sseData.status      ?? robot.status,
        x:           sseData.x           ?? robot.x,
        y:           sseData.y           ?? robot.y,
        currentTask: sseData.currentTask ?? robot.currentTask,
      };
    });
  }, [apiRobots, sseRobots]);

  // ── State ────────────────────────────────────────────
  const [showLockerInfo, setShowLockerInfo]       = useState(false);
  const [selectedTaskRobot, setSelectedTaskRobot] = useState<any>(null);
  const [step, setStep]                           = useState<WorkflowStep>('IDLE');
  const [assignedRobot, setAssignedRobot]         = useState<string | null>(null);
  const [selectedLocker, setSelectedLocker]       = useState<number | null>(null);
  const [assignedEvent, setAssignedEvent]         = useState<RobotAssignedEvent | null>(null);
  const [returnData, setReturnData]               = useState<RobotReturnedAdminEvent | null>(null);

  // ── SSE 이벤트 파싱 ────────────────────────
  useEffect(() => {
    if (!lastMessage) return;
    try {
      const parsed = JSON.parse(lastMessage);
      console.log("📨 SSE 수신:", parsed);

      if (parsed.callLocationName) {
        console.log(`🚚 로봇 ${parsed.robotCode} -> ${parsed.callLocationName} 이동`);
      }

      if (parsed.eventName === 'RobotAssignedEvent' || (parsed.userId && parsed.requestType)) {
        setAssignedEvent({
          userId:           parsed.userId           || parsed.data?.userId,
          missionId:        parsed.missionId        || parsed.data?.missionId,
          robotCode:        parsed.robotCode        || parsed.data?.robotCode,
          callLocationName: parsed.callLocationName || parsed.data?.callLocationName,
          locker_code:      parsed.locker_code      || parsed.data?.locker_code,
          requestType:      parsed.requestType      || parsed.data?.requestType || 'FIRST',
        });
      }
      else if (parsed.eventName === 'RobotReturnedAdminEvent' || (parsed.lockerCode && parsed.robotCode && parsed.missionId)) {
        const data = {
          userId:     parsed.userId     || parsed.data?.userId,
          robotCode:  parsed.robotCode  || parsed.data?.robotCode,
          missionId:  parsed.missionId  || parsed.data?.missionId,
          lockerId:   parsed.lockerId   || parsed.data?.lockerId,
          lockerCode: parsed.lockerCode || parsed.data?.lockerCode,
          message:    parsed.message    || parsed.data?.message,
        };
        toast.success(`🤖 ${data.robotCode} 복귀 완료!`);
        setReturnData(data);
      }
    } catch (e) {
      console.error("JSON 파싱 에러:", e);
    }
  }, [lastMessage]);

  // ── 워크플로 핸들러 ───────────────────────────────────────
  const handleLockerSelect = (lockerId: number) => {
    setSelectedLocker(lockerId);
    setStep('CONFIRM_LOCKER');
  };

  const confirmLockerAssignment = () => {
    toast.success(`📦 사물함 ${selectedLocker}번 배정 확정!`);
    setStep('MISSION_START');
  };

  const handleStartMission = () => {
    toast.success(`🚀 ${assignedRobot}호기가 출발합니다!`);
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setStep('IDLE');
    setAssignedRobot(null);
    setSelectedLocker(null);
  };

  const handleMissionStartComplete = (missionId: number) => {
    toast.success(`🚀 미션 #${missionId} 출발 요청 완료`);
    setAssignedEvent(null);
  };

  // ── 통계 ──────────────────────────────────────────
  const stats = useMemo(() => {
    const total     = mergedRobots.length;
    const working   = mergedRobots.filter(r => r.status === 'working').length;
    const available = mergedRobots.filter(r => r.status === 'available').length;
    const lockers   = { total: 32, used: 12 };
    return { total, working, available, lockers };
  }, [mergedRobots]);

  const workingRobotsList = useMemo(() => mergedRobots.filter(r => r.status === 'working'), [mergedRobots]);

  // ── 렌더링 ──────────────────────────────────────────────────
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-slate-950">
      {/* 🌟 배경 애니메이션 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
      
      <ToastContainer
        position="top-right" 
        autoClose={3000} 
        theme="dark"
        style={{ zIndex: 99999 }}
      />

      {/* 🎨 초슬림 헤더 - 경계 없이 */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none h-12 px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-xl z-20 relative"
      >
        {/* 헤더 하단 빛나는 라인 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
            <img src="./assets/images/robot-white.png" alt="Logo" className="h-7 w-auto object-contain relative z-10" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight" 
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
              CARRYPORTER
            </h1>
            <p className="text-[8px] font-bold text-cyan-500/60 tracking-widest">REALTIME MONITOR</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 🔥 실시간 데이터 펄스 인디케이터 */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30"
          >
            <Radio className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider">STREAMING</span>
          </motion.div>

          {/* 🌟 SSE 상태 - 강력한 빛나는 효과 */}
          <motion.div
            animate={isConnected ? {
              boxShadow: [
                '0 0 10px rgba(16,185,129,0.3)',
                '0 0 20px rgba(16,185,129,0.6)',
                '0 0 10px rgba(16,185,129,0.3)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
              isConnected
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-rose-500/20 border-rose-400/50 text-rose-300'
            }`}
          >
            <div className="relative flex h-2 w-2">
              {isConnected && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-50" />
                </>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,1)]' : 'bg-rose-400'
              }`} />
            </div>
            <Wifi className="w-3 h-3" />
            <span className="text-[10px] font-black tracking-widest">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </motion.div>
        </div>
      </motion.header>

      {/* 🎨 메인 컨텐츠 - 간격 축소하고 꽉 채움 */}
      <div className="flex-1 min-h-0 p-2 flex gap-2 z-10">

        {/* 🗺️ 왼쪽: 지도 + 사물함 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* 지도 영역 - 빛나는 테두리 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-900/40 backdrop-blur-sm shadow-[0_0_30px_rgba(6,182,212,0.15)] group"
          >
            {/* 테두리 빛나는 애니메이션 */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/50 animate-pulse" />
            </div>

            <div className="w-full h-full relative">
               <RobotStage robots={mergedRobots} showDummyIfEmpty={true} />
            </div>

            {/* 지도 오버레이 - 실시간 스캐닝 효과 */}
            <div className="absolute top-3 left-3 flex gap-2 pointer-events-none z-20">
              <motion.div
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center gap-2 text-[10px] font-bold text-cyan-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 shadow-lg"
              >
                <div className="relative">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <div className="absolute inset-0 bg-cyan-400/50 blur-md rounded-full" />
                </div>
                <span className="tracking-wider">SCANNING AREA</span>
              </motion.div>

              {/* 로봇 카운트 실시간 표시 */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30"
              >
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>{stats.working} ACTIVE</span>
              </motion.div>
            </div>
            
            <div className="absolute bottom-3 right-3 z-20">
               <button className="p-2 bg-slate-900/80 backdrop-blur-md shadow-xl rounded-lg hover:scale-110 transition-transform border border-cyan-500/30 hover:border-cyan-400/60">
                 <Maximize2 className="w-4 h-4 text-cyan-400" />
               </button>
            </div>
          </motion.div>

          {/* 사물함 위젯 - 크기 축소 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-none h-24"
          >
             <MiniLockerWidget onClick={() => setShowLockerInfo(true)} stats={stats.lockers} />
          </motion.div>
        </div>

        {/* 📊 오른쪽: 통계 + 리스트 */}
        <aside className="w-80 flex-none flex flex-col gap-2">

          {/* 🔥 3개 카드 - 네온 스타일 */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-3 gap-2"
          >
            {/* 사용자 카드 */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                  />
                </div>
                <div className="text-2xl font-black text-white mb-1">{userCount}</div>
                <div className="text-[9px] font-bold text-indigo-300/60 tracking-widest">USERS</div>
              </div>
            </motion.div>

            {/* 로봇 카드 */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                </div>
                <div className="text-2xl font-black text-white mb-1">{stats.total}</div>
                <div className="text-[9px] font-bold text-cyan-300/60 tracking-widest">ROBOTS</div>
              </div>
            </motion.div>

            {/* 가용 로봇 카드 */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  />
                </div>
                <div className="text-2xl font-black text-white mb-1">{stats.available}</div>
                <div className="text-[9px] font-bold text-emerald-300/60 tracking-widest">READY</div>
              </div>
            </motion.div>
          </motion.section>

          {/* 작업 목록 - 네온 스타일 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden border border-amber-500/30 bg-slate-900/40 backdrop-blur-sm shadow-[0_0_30px_rgba(245,158,11,0.1)]"
          >
            {/* 헤더 */}
            <div className="flex-none px-4 py-2.5 bg-slate-900/60 border-b border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity className="w-4 h-4 text-amber-400" />
                  </motion.div>
                  <h3 className="text-sm font-black text-amber-300 tracking-wider">ACTIVE MISSIONS</h3>
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-400/30"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)] animate-pulse" />
                  <span className="text-xs font-black text-amber-300">{stats.working}</span>
                </motion.div>
              </div>
            </div>

            {/* 리스트 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <ActiveTaskList
                robots={workingRobotsList}
                count={stats.working}
                onRobotClick={(robot) => setSelectedTaskRobot(robot)}
              />
            </div>
          </motion.div>
        </aside>
      </div>

      {/* 🎭 모달들 */}
      <AnimatePresence>
        {step === 'SELECT_LOCKER' && <LockerSelectionModal onSelect={handleLockerSelect} onClose={resetWorkflow} />}
        {step === 'CONFIRM_LOCKER' && (
           <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
             <motion.div 
               initial={{scale:0.9, opacity:0, y: 20}} 
               animate={{scale:1, opacity:1, y: 0}}
               exit={{scale:0.9, opacity:0, y: 20}}
               className="bg-slate-900 border border-cyan-500/30 p-6 rounded-2xl shadow-2xl shadow-cyan-500/20 max-w-sm w-full"
             >
                <h3 className="text-lg font-bold text-cyan-300 mb-4">사물함 배정 확인</h3>
                <p className="mb-6 text-sm text-slate-300">
                   <span className="font-bold text-cyan-400">{selectedLocker}번 사물함</span>을 
                   <span className="font-bold text-white mx-1">{assignedRobot}</span>에게 배정합니까?
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={confirmLockerAssignment} 
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50"
                  >
                    확인
                  </button>
                  <button 
                    onClick={() => setStep('SELECT_LOCKER')} 
                    className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    취소
                  </button>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}