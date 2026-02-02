import { motion, AnimatePresence } from 'framer-motion'
import { X, Wifi, Cpu, Calendar, Clock, MapPin, User, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// --- Types ---
interface MissionHistory {
  missionId: string;
  userId: string;
  adminId: string | null;
  locationId: string;
  weight: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  times: {
    assigned: string;
    start: string;
    arrival: string;
    complete: string;
  };
}

interface RobotDetailProps {
  robot: any;
  onClose: () => void;
}

// ✅ [Fix] 안전한 시간 변환 헬퍼 함수
const formatTime = (timeStr: string) => {
  // 데이터가 없거나 형식이 맞지 않으면 대시(-) 리턴
  if (!timeStr || !timeStr.includes('T')) return '--:--';
  try {
    return timeStr.split('T')[1].substring(0, 5);
  } catch (e) {
    return '--:--';
  }
};

// --- 🎨 Sub-Component: 배터리 위젯 ---
function BatteryWidget({ level }: { level: number }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="relative w-16 h-8 border-2 border-slate-300 rounded-md p-0.5">
        <div className="absolute -right-2 top-2 h-3 w-1.5 bg-slate-300 rounded-r-sm" />
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${level}%` }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-sm relative overflow-hidden",
            level > 20 ? "bg-cyan-500" : "bg-red-500"
          )}
        >
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30" />
        </motion.div>
      </div>
      <div>
        <div className="text-xs text-slate-500 font-bold">BATTERY LEVEL</div>
        <div className="text-xl font-black text-slate-800">{level}%</div>
      </div>
    </div>
  )
}

// --- 📜 Sub-Component: 미션 기록 아이템 ---
function MissionItem({ mission, index }: { mission: MissionHistory; index: number }) {
  // 날짜 표시 (완료 날짜 없으면 할당 날짜 사용)
  const displayDate = mission.times.complete 
    ? mission.times.complete.split('T')[0] 
    : mission.times.assigned.split('T')[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-6 pb-6 border-l-2 border-slate-200 last:border-l-0 last:pb-0 group"
    >
      {/* 타임라인 점 */}
      <div className={cn(
        "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm box-content transition-colors",
        mission.status === 'COMPLETED' ? "bg-green-500" : 
        mission.status === 'IN_PROGRESS' ? "bg-amber-500 animate-pulse" : "bg-red-500"
      )} />
      
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Mission #{mission.missionId}</span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold",
              mission.status === 'COMPLETED' ? "bg-green-100 text-green-700" : 
              mission.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            )}>
              {mission.status}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{displayDate}</span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1"><User size={12} className="text-slate-400"/> User: {mission.userId}</div>
            <div className="flex items-center gap-1"><MapPin size={12} className="text-slate-400"/> Loc: {mission.locationId}</div>
            <div className="flex items-center gap-1"><FileText size={12} className="text-slate-400"/> Weight: {mission.weight}kg</div>
            {/* ✅ [Fix] 수정된 시간 표시 부분 */}
            <div className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400"/> 
                Time: {formatTime(mission.times.assigned)} ~ {formatTime(mission.times.complete)}
            </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- 🚀 Main Component ---
export default function RobotDetailModal({ robot, onClose }: RobotDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  const history: MissionHistory[] = [
    {
      missionId: "M-9923", userId: "U-120", adminId: null, locationId: "LOC-A1", weight: 12.5, status: 'IN_PROGRESS',
      // 진행 중이라 complete 시간이 비어있음 -> formatTime 함수가 처리
      times: { assigned: "2024-01-31T10:00:00", start: "2024-01-31T10:05:00", arrival: "", complete: "" }
    },
    {
      missionId: "M-9811", userId: "U-055", adminId: "ADM-01", locationId: "LOC-B3", weight: 5.2, status: 'COMPLETED',
      times: { assigned: "2024-01-30T14:00:00", start: "2024-01-30T14:02:00", arrival: "2024-01-30T14:15:00", complete: "2024-01-30T14:20:00" }
    },
    {
      missionId: "M-9740", userId: "U-302", adminId: null, locationId: "LOC-C1", weight: 20.0, status: 'CANCELLED',
      times: { assigned: "2024-01-29T09:00:00", start: "", arrival: "", complete: "2024-01-29T09:10:00" }
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{robot.name}</h2>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">ID: {robot.id} • {robot.status}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Tab Menu */}
        <div className="flex border-b border-slate-100 px-6">
            {['info', 'history'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                        "px-4 py-3 text-sm font-bold border-b-2 transition-colors",
                        activeTab === tab 
                            ? "border-cyan-500 text-cyan-600" 
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                >
                    {tab === 'info' ? 'ROBOT INFO' : 'MISSION LOGS'}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <AnimatePresence mode="wait">
                {activeTab === 'info' ? (
                    <motion.div 
                        key="info"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                    >
                        {/* Status & Battery */}
                        <div className="grid grid-cols-2 gap-4">
                            <BatteryWidget level={robot.battery} />
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                <div className="text-xs text-slate-500 font-bold mb-1">NETWORK STATUS</div>
                                <div className="flex items-center gap-2 text-green-600 font-bold">
                                    <Wifi size={18} /> STRONG (5G)
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-1">LAT: 35ms / JITTER: 2ms</div>
                            </div>
                        </div>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-t border-slate-100">
                            <DetailRow label="Robot Code" value="RB-2024-X99" icon={<Cpu size={14}/>} />
                            <DetailRow label="MAC Address" value="00:1B:44:11:3A:B7" icon={<Wifi size={14}/>} />
                            <DetailRow label="Created At" value="2023-11-15 09:30:00" icon={<Calendar size={14}/>} />
                            <DetailRow label="Last Update" value="2024-01-31 14:45:12" icon={<Clock size={14}/>} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="history"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        className="pl-2 pt-2"
                    >
                        {history.map((mission, idx) => (
                            <MissionItem key={mission.missionId} mission={mission} index={idx} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// 헬퍼 컴포넌트: 정보 한 줄 표시
function DetailRow({ label, value, icon }: any) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                {icon} {label}
            </div>
            <div className="text-sm font-bold text-slate-700 font-mono">{value}</div>
        </div>
    )
}