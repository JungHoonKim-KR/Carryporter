import { Box, LayoutGrid, Maximize2, Package } from 'lucide-react'
import { motion } from 'framer-motion'
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
  const usagePercentage = Math.round((stats.used / stats.total) * 100)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 p-6 group cursor-pointer overflow-hidden transition-all shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-cyan-300"
      onClick={onClick}
    >
      {/* 배경 그라데이션 효과 */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      
      {/* 배경 장식 아이콘 */}
      <div className="absolute -top-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 rotate-12 group-hover:rotate-0">
        <Package size={180} className="text-slate-900" />
      </div>

      <div className="relative z-10 flex items-center gap-6 h-full">
        {/* 왼쪽: 정보 섹션 */}
        <div className="flex-none w-48 flex flex-col justify-between h-full">
          {/* 헤더 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wider text-slate-800 uppercase">Locker System</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold font-mono uppercase tracking-wide">
              Zone A-1 • Physical Storage
            </p>
          </div>
          
          {/* 통계 숫자 */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <motion.span 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-5xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
              >
                {stats.used}
              </motion.span>
              <span className="text-xl font-semibold text-slate-400">/ {stats.total}</span>
            </div>
            
            {/* 사용률 바 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                <span>USAGE</span>
                <span className="text-cyan-600">{usagePercentage}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                  className={cn(
                    "h-full rounded-full relative overflow-hidden",
                    usagePercentage > 80 ? "bg-gradient-to-r from-red-500 to-orange-500" :
                    usagePercentage > 50 ? "bg-gradient-to-r from-amber-500 to-yellow-500" :
                    "bg-gradient-to-r from-emerald-500 to-cyan-500"
                  )}
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-1/3 h-full bg-white/30"
                  />
                </motion.div>
              </div>
            </div>

            {/* 상태 인디케이터 */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </div>
              <span className="text-[10px] text-cyan-600 font-bold font-mono tracking-wide">
                LIVE MONITORING
              </span>
            </div>
          </div>
        </div>

        {/* 중앙: 미니 그리드 시각화 */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="relative">
            {/* 그리드 타이틀 */}
            <div className="absolute -top-6 left-0 right-0 flex justify-center">
              <div className="text-[9px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-200">
                STORAGE MAP
              </div>
            </div>

            {/* 그리드 */}
            <div className="grid grid-cols-10 gap-2">
              {gridDots.map((_, i) => {
                const isUsed = i < (stats.used / stats.total * 30);
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.5 + (i * 0.02),
                      type: "spring",
                      stiffness: 200
                    }}
                    className={cn(
                      "w-4 h-4 rounded-md transition-all duration-300 relative group/dot",
                      isUsed 
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-500 shadow-lg shadow-amber-500/30 hover:scale-125" 
                        : "bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:scale-110"
                    )}
                  >
                    {/* 사용 중 애니메이션 */}
                    {isUsed && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                        className="absolute inset-0 rounded-md bg-amber-400"
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* 범례 */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-500" />
                <span className="text-[8px] font-semibold text-slate-500">OCCUPIED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm bg-slate-100 border border-slate-200" />
                <span className="text-[8px] font-semibold text-slate-500">AVAILABLE</span>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 확대 버튼 */}
        <div className="flex-none flex items-center pl-4 border-l border-slate-200/60">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:from-cyan-500 hover:to-blue-600 hover:border-cyan-500 transition-all shadow-lg group/btn overflow-hidden"
          >
            {/* 버튼 배경 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-blue-600/0 group-hover/btn:from-cyan-400/20 group-hover/btn:to-blue-600/20 transition-all duration-300" />
            
            <Maximize2 className="relative z-10 transition-transform group-hover/btn:rotate-90 duration-300" size={22} />
            
            {/* 툴팁 */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              View Details
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* 호버 시 빛 효과 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
      </div>
    </motion.div>
  )
}