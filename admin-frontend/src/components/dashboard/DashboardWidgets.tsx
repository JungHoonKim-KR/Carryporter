import { motion } from 'framer-motion'
import { Activity, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- 🧱 통계 카드 ---
export function StatusCard({ label, value, valueColor = "text-slate-900", icon, iconColor = "text-slate-400" }: any) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between h-24 relative overflow-hidden group hover:border-cyan-400/50 transition-colors">
      <div className={cn("absolute top-2 right-2 p-1 opacity-20 group-hover:scale-110 transition-transform duration-500", iconColor)}>
        {icon}
      </div>
      <div className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-tight z-10">{label}</div>
      <div className={cn("text-3xl font-black italic tracking-tighter z-10", valueColor)}>
        {value}
        <span className="text-xs font-medium not-italic text-slate-400 ml-1">ea</span>
      </div>
      <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-30", valueColor.replace('text-', 'bg-'))} />
    </div>
  )
}

// --- 📈 사용자 증가 차트 ---
export function UserGrowthChart() {
  const data = [420, 450, 480, 560, 590, 680, 720, 850, 920, 1050, 1120, 1280]
  const max = Math.max(...data)
  const min = Math.min(...data)
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((val - min) / (max - min)) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-4">
            <Users className="w-4 h-4 text-cyan-600" /> USER_TRAFFIC_ANALYSIS
        </div>
        <div className="h-32 w-full relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-inner">
            <div className="absolute inset-0" 
                style={{ backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <svg className="w-full h-full p-2 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                d={`M0,100 L0,${100 - ((data[0]-min)/(max-min))*100} ${data.map((val, i) => `L${(i/(data.length-1))*100},${100-((val-min)/(max-min))*100}`).join(' ')} L100,100 Z`}
                fill="url(#gradient)"
                initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 1.5 }}
                />
                <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                </linearGradient>
                </defs>
                <motion.polyline
                points={points} fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }}
                />
            </svg>
            <div className="absolute top-2 right-4 text-right">
                <div className="text-[10px] text-slate-500 font-bold font-mono">TOTAL USERS</div>
                <div className="text-2xl font-black tracking-tighter text-slate-900">1,284</div>
                <div className="text-[10px] text-green-600 font-bold font-mono flex items-center justify-end gap-1">
                <Activity size={10} /> +12.5%
                </div>
            </div>
        </div>
    </div>
  )
}