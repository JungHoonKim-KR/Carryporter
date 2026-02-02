import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Database, Bot, Zap, LayoutGrid, Activity, Maximize2 } from 'lucide-react'
import { useRobotSSE } from '@/hooks/UserRobotSSE'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// --- 컴포넌트 임포트 ---
import RobotStage from '@/components/robot/RobotStage'
import RobotDetailModal from '@/components/robot/RobotDetailModal'
import ActiveTaskList from '@/components/dashboard/ActiveTaskList'
import { StatusCard, UserGrowthChart } from '@/components/dashboard/DashboardWidgets'
import MiniLockerWidget from '@/components/locker/MiniLockerWidget'
import LockerSelectionModal from '@/components/locker/LockerSelectionModal'
import MissionControlModal from '@/components/mission/MissionControlModal'
import MissionProcessModal from '@/components/mission/MissionProcessModal';
import MissionReturnModal from '@/components/mission/MissionReturnModal';
import { RobotAssignedEvent, RobotReturnedAdminEvent } from '@/types/robotEvents';

type WorkflowStep = 'IDLE' | 'SELECT_LOCKER' | 'CONFIRM_LOCKER' | 'MISSION_START';

export default function RobotsPage() {
  const { robots, isConnected, lastMessage } = useRobotSSE()
  const [showLockerInfo, setShowLockerInfo] = useState(false)
  const [selectedTaskRobot, setSelectedTaskRobot] = useState<any>(null)
  const [step, setStep] = useState<WorkflowStep>('IDLE');
  const [assignedRobot, setAssignedRobot] = useState<string | null>(null); 
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);
  const [assignedEvent, setAssignedEvent] = useState<RobotAssignedEvent | null>(null);
  const [returnData, setReturnData] = useState<RobotReturnedAdminEvent | null>(null);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const parsed = JSON.parse(lastMessage);
      console.log("📨 SSE 수신:", parsed);

      if (parsed.eventName === 'RobotAssignedEvent' || (parsed.userId && parsed.requestType)) {
        const eventData: RobotAssignedEvent = {
          userId: parsed.userId || parsed.data?.userId,
          missionId: parsed.missionId || parsed.data?.missionId,
          robotCode: parsed.robotCode || parsed.data?.robotCode,
          callLocationName: parsed.callLocationName || parsed.data?.callLocationName,
          locker_code: parsed.locker_code || parsed.data?.locker_code,
          requestType: parsed.requestType || parsed.data?.requestType || 'FIRST'
        };
        setAssignedEvent(eventData);
      }
      else if (parsed.eventName === 'RobotReturnedAdminEvent' || (parsed.lockerCode && parsed.robotCode && parsed.missionId)) {
        const returnData: RobotReturnedAdminEvent = {
          userId: parsed.userId || parsed.data?.userId,
          robotCode: parsed.robotCode || parsed.data?.robotCode,
          missionId: parsed.missionId || parsed.data?.missionId,
          lockerCode: parsed.lockerCode || parsed.data?.lockerCode,
          message: parsed.message || parsed.data?.message
        };
        toast.success(`🤖 ${returnData.robotCode} 복귀 완료!`);
        setReturnData(returnData);
      }
    } catch (e) { 
      console.error("JSON 파싱 에러:", e); 
    }
  }, [lastMessage]);

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

  const stats = useMemo(() => {
    const total = robots.length
    const working = robots.filter(r => r.status === 'working').length;
    const available = robots.filter(r => r.status === 'available').length;
    const lockers = { total: 32, used: 12 } 
    return { total, working, available, lockers }
  }, [robots])

  const workingRobotsList = robots.filter(r => r.status === 'working')

  const handleMissionStartComplete = (missionId: number) => {
    toast.success(`🚀 미션 #${missionId} 출발 요청이 완료되었습니다.`);
    setAssignedEvent(null); 
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden flex flex-col">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
      />

      {/* 🎨 개선된 헤더 */}
      <header className="flex-none h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl blur-md opacity-40"></div>
            <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg flex items-center justify-center">
              <Database className="text-white w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
                CarryPorter
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                v2.4
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              Administrator Dashboard
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="h-6 w-px bg-slate-200" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 ${
              isConnected 
                ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200/60 text-emerald-700 shadow-[0_2px_20px_rgba(16,185,129,0.15)]' 
                : 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200/60 text-rose-700 shadow-[0_2px_20px_rgba(244,63,94,0.15)]'
            }`}
          >
            <div className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></span>
            </div>
            <span className="text-[10px] font-bold tracking-wide">
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </motion.div>
        </div>
      </header>

      {/* 🎨 메인 컨텐츠 - 완전히 재설계된 그리드 레이아웃 */}
      <div className="flex-1 min-h-0 p-4 flex gap-4">
        
        {/* 왼쪽: 지도 + 락커 영역 */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          
          {/* 🗺️ 지도 영역 - flex-1로 남은 공간 모두 차지 */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-xl shadow-slate-200/50 group"
          >
            {/* 그라데이션 테두리 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none z-10"></div>
            
            {/* 지도 컨테이너 */}
            <div className="w-full h-full relative">
              <RobotStage robots={robots} />
            </div>
            
            {/* 지도 오버레이 정보 */}
            <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-20">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-700 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200/60">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                ZONE A-1
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-slate-200/60">
                <Activity className="w-3 h-3 text-cyan-600" />
                {stats.working} ACTIVE
              </div>
            </div>

            {/* 줌 컨트롤 (옵션) */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 pointer-events-auto z-20">
              <button className="p-2 bg-white/95 backdrop-blur-sm hover:bg-white rounded-lg shadow-lg border border-slate-200/60 transition-all hover:scale-105">
                <Maximize2 className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </motion.div>

          {/* 📦 락커 위젯 - 고정 높이 */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-none"
          >
            <MiniLockerWidget 
              onClick={() => setShowLockerInfo(true)} 
              stats={stats.lockers} 
            />
          </motion.div>
        </div>

        {/* 오른쪽: 통계 + 차트 + 리스트 */}
        <aside className="w-80 flex-none flex flex-col gap-4">
          
          {/* 📊 상단 통계 카드 */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-none grid grid-cols-1 gap-3"
          >
            <StatusCard 
              label="TOTAL UNITS" 
              value={stats.total} 
              icon={<Bot size={20} />} 
              iconColor="text-slate-500" 
            />
            <div className="grid grid-cols-2 gap-3">
              <StatusCard 
                label="WORKING" 
                value={stats.working} 
                valueColor="text-amber-600" 
                icon={<Zap size={18} />} 
                iconColor="text-amber-500" 
              />
              <StatusCard 
                label="AVAILABLE" 
                value={stats.available} 
                valueColor="text-emerald-600" 
                icon={<LayoutGrid size={18} />} 
                iconColor="text-emerald-500" 
              />
            </div>
          </motion.section>
          
          {/* 📈 사용자 증가 차트 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-none"
          >
            <UserGrowthChart />
          </motion.div>
          
          {/* 📋 작업 중인 로봇 리스트 - 남은 공간 모두 차지하며 스크롤 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-xl shadow-slate-200/50"
          >
            {/* 리스트 헤더 */}
            <div className="flex-none px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Active Tasks</h3>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-amber-700">{stats.working}</span>
                </div>
              </div>
            </div>
            
            {/* 스크롤 가능한 리스트 영역 */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
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
        {step === 'SELECT_LOCKER' && (
          <LockerSelectionModal 
            onSelect={handleLockerSelect} 
            onClose={resetWorkflow} 
          />
        )}
        
        {step === 'CONFIRM_LOCKER' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200/60 relative overflow-hidden"
            >
              {/* 상단 그라데이션 */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
              
              {/* 배경 패턴 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  사물함 배정 확인
                </h3>
                <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                  <span className="inline-flex items-center gap-1.5 font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                    {selectedLocker}번 사물함
                  </span>
                  <span className="mx-1">을</span>
                  <br/>
                  <span className="font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 inline-block mt-2">
                    {assignedRobot}
                  </span>
                  <span className="ml-1">에 배정하시겠습니까?</span>
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={confirmLockerAssignment}
                    className="flex-1 bg-gradient-to-r from-slate-900 to-slate-700 text-white py-3.5 rounded-xl font-bold hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    확인
                  </button>
                  <button 
                    onClick={() => setStep('SELECT_LOCKER')}
                    className="flex-1 bg-slate-50 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-200 hover:border-slate-300"
                  >
                    취소
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {step === 'MISSION_START' && assignedRobot && (
          <MissionControlModal 
            robotCode={assignedRobot} 
            lockerId={selectedLocker!} 
            onStart={handleStartMission} 
            onClose={resetWorkflow} 
          />
        )}
        
        {selectedTaskRobot && (
          <RobotDetailModal 
            robot={selectedTaskRobot} 
            onClose={() => setSelectedTaskRobot(null)} 
          />
        )}
      </AnimatePresence>

      {assignedEvent && (
        <MissionProcessModal 
          data={assignedEvent} 
          onClose={() => setAssignedEvent(null)} 
          onMissionStart={handleMissionStartComplete} 
        />
      )}
      
      {returnData && (
        <MissionReturnModal 
          data={returnData} 
          onClose={() => setReturnData(null)} 
          onComplete={() => console.log("복귀 처리 완료")} 
        />
      )}

    </div>
  )
}