import { Box, LayoutGrid, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MiniLockerWidgetProps {
  stats: {
    total: number;
    used: number;
  };
  onClick: () => void;
}

export default function MiniLockerWidget({ stats, onClick }: MiniLockerWidgetProps) {
  // 시각화용 3x10 그리드 점 생성
  const gridDots = Array.from({ length: 30 })
  
  return (
    <div 
      className="h-52 bg-white rounded-xl border border-slate-200 p-6 relative group cursor-pointer overflow-hidden transition-all shadow-sm hover:shadow-md hover:border-cyan-400" 
      onClick={onClick}
    >
       {/* 배경 장식 (은은한 회색) */}
       <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
         <Box size={150} className="text-slate-900" />
       </div>
       
       <div className="flex justify-between items-center h-full relative z-10">
         {/* 왼쪽 정보 */}
         <div className="flex flex-col justify-between h-full py-1">
           <div>
             <div className="flex items-center gap-2 text-slate-600 font-bold mb-2">
               <LayoutGrid className="w-5 h-5 text-cyan-600" /> 
               <span className="text-sm tracking-widest text-slate-800">LOCKER_SYSTEM</span>
             </div>
             <p className="text-xs text-slate-500 font-semibold font-mono uppercase">Zone A-1 • Physical Storage</p>
           </div>
           
           <div className="space-y-1">
             <div className="text-5xl font-black tracking-tighter flex items-baseline gap-2 text-slate-900">
               {stats.used} <span className="text-xl font-medium text-slate-400">/ {stats.total}</span>
             </div>
             <div className="text-xs text-cyan-600 font-bold font-mono animate-pulse flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-sm"></span>
               LIVE MONITORING
             </div>
           </div>
         </div>

         {/* 중앙 시각화 (미니 그리드) */}
         <div className="flex-1 px-8 flex items-center justify-center h-full">
            <div className="grid grid-cols-10 gap-3">
              {gridDots.map((_, i) => (
                <div key={i} className={cn(
                  "w-5 h-5 rounded-[4px] transition-all duration-500 border",
                  i < (stats.used / stats.total * 30) 
                    ? "bg-amber-400 border-amber-500 shadow-sm scale-105" // 사용 중 (노랑/주황)
                    : "bg-slate-100 border-slate-200" // 빈 칸 (연한 회색)
                )} />
              ))}
            </div>
        </div>

         {/* 오른쪽 버튼 */}
         <div className="flex flex-col justify-center h-full pl-6 border-l border-slate-100">
           <button className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-all shadow-sm hover:scale-110">
              <Maximize2 size={24} />
           </button>
         </div>
       </div>
    </div>
  )
}