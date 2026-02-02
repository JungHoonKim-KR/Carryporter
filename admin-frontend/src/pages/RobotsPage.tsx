import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Database, Bot, Zap, LayoutGrid } from 'lucide-react'
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
  const [, setShowLockerInfo] = useState(false)
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
    // 📌 [Layout Fix 1] 전체 화면 고정 (h-screen, overflow-hidden)
    <div className="h-screen w-full relative bg-slate-50 overflow-hidden flex flex-col">
       <ToastContainer style={{ zIndex: 99999 }} />

      {/* 헤더 (높이 고정) */}
      <header className="flex-none h-[72px] px-8 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-200/50 flex items-center justify-center">
            <Database className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">CarryPorter</h1>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500">v2.4</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Administrator Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-8 w-px bg-slate-100" />
          <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-300 ${isConnected ? 'bg-emerald-50/60 border-emerald-200 text-emerald-700 shadow-[0_2px_10px_rgba(16,185,129,0.1)]' : 'bg-rose-50/60 border-rose-200 text-rose-700 shadow-[0_2px_10px_rgba(244,63,94,0.1)]'}`}>
            <div className="relative flex h-2.5 w-2.5">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </div>
            <span className="text-[11px] font-bold tracking-wide">{isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}</span>
          </div>
        </div>
      </header>

      {/* 📌 [Layout Fix 2] 메인 컨텐츠 영역 (flex-1, min-h-0) */}
<div className="flex-1 min-h-0 p-4 grid grid-cols-12 gap-4">        
        {/* 왼쪽 패널 (지도 + 락커) */}
        <div className="col-span-8 flex flex-col gap-4 h-full">
          
          {/* 📌 [Map Fix] 지도 영역
            - flex-1: 남은 공간을 모두 차지함 (화면이 커지면 지도도 커짐)
            - min-h-0: 공간이 부족하면 지도가 줄어듦 (중요!)
          */}
          <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm group">
            {/* RobotStage 컨테이너에 h-full 적용 */}
            <div className="w-full h-full relative">
               <RobotStage robots={robots} />
            </div>
            
            <div className="absolute top-4 left-4 pointer-events-none">
              <div className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                ● ZONE_A-1 VIEW
              </div>
            </div>
          </div>

          {/* 📌 [Locker Fix] 락커 위젯
            - flex-none: 높이 고정 (줄어들지 않음)
            - h-auto: 내부 컨텐츠 크기만큼만 차지
          */}
          <div className="flex-none h-auto">
             <MiniLockerWidget onClick={() => setShowLockerInfo(true)} stats={stats.lockers} />
          </div>
        </div>

        {/* 오른쪽 패널 (위젯 + 리스트) */}
        <aside className="col-span-4 flex flex-col gap-4 h-full">
          {/* 상단 통계 카드들 (고정 높이) */}
          <section className="flex-none grid grid-cols-3 gap-2">
            <StatusCard label="TOTAL UNITS" value={stats.total} icon={<Bot size={18} />} iconColor="text-slate-400" />
            <StatusCard label="WORKING" value={stats.working} valueColor="text-amber-600" icon={<Zap size={18} />} iconColor="text-amber-500" />
            <StatusCard label="AVAILABLE" value={stats.available} valueColor="text-cyan-600" icon={<LayoutGrid size={18} />} iconColor="text-cyan-500" />
          </section>
          
          {/* 차트 (고정 높이) */}
          <div className="flex-none">
            <UserGrowthChart />
          </div>
          
          {/* 📌 [List Fix] 작업 리스트
            - flex-1: 남은 하단 공간을 모두 차지
            - overflow-y-auto: 리스트가 공간보다 길어지면 **이 영역 안에서만** 스크롤 발생
          */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg bg-white">
            <ActiveTaskList 
              robots={workingRobotsList} 
              count={stats.working}
              onRobotClick={(robot) => setSelectedTaskRobot(robot)} 
            />
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {step === 'SELECT_LOCKER' && <LockerSelectionModal onSelect={handleLockerSelect} onClose={resetWorkflow} />}
        {step === 'CONFIRM_LOCKER' && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />
                <h3 className="text-lg font-bold text-slate-900 mb-2 mt-2">사물함 배정 확인</h3>
                <p className="text-slate-600 mb-6 text-sm">
                  <span className="font-bold text-cyan-600 bg-cyan-50 px-1 rounded">{selectedLocker}번 사물함</span>을 <br/><span className="font-bold text-slate-900">{assignedRobot}</span>에 배정하시겠습니까?
                </p>
                <div className="flex gap-3">
                  <button onClick={confirmLockerAssignment} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg">확인</button>
                  <button onClick={() => setStep('SELECT_LOCKER')} className="flex-1 bg-slate-50 text-slate-500 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors">취소</button>
                </div>
             </motion.div>
          </div>
        )}
        {step === 'MISSION_START' && assignedRobot && <MissionControlModal robotCode={assignedRobot} lockerId={selectedLocker!} onStart={handleStartMission} onClose={resetWorkflow} />}
        {selectedTaskRobot && <RobotDetailModal robot={selectedTaskRobot} onClose={() => setSelectedTaskRobot(null)} />}
      </AnimatePresence>

      {assignedEvent && <MissionProcessModal data={assignedEvent} onClose={() => setAssignedEvent(null)} onMissionStart={handleMissionStartComplete} />}
      {returnData && <MissionReturnModal data={returnData} onClose={() => setReturnData(null)} onComplete={() => console.log("복귀 처리 완료")} />}
    </div>
  )
}