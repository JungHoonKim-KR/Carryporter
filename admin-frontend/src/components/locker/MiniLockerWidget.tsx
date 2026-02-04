import { motion } from 'framer-motion'
import { Package } from 'lucide-react'

interface MiniLockerWidgetProps {
  onClick: () => void
  stats: {
    total: number
    used: number
  }
}

export default function MiniLockerWidget({ onClick, stats }: MiniLockerWidgetProps) {
  const available = stats.total - stats.used
  const usagePercent = Math.round((stats.used / stats.total) * 100)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="h-full w-full cursor-pointer relative group overflow-hidden rounded-xl border border-purple-500/30 bg-slate-900/40 backdrop-blur-sm shadow-[0_0_30px_rgba(168,85,247,0.1)]"
    >
      {/* 호버 시 빛나는 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative h-full flex items-center justify-between px-4 py-3">
        
        {/* 왼쪽: 아이콘 + 수치 */}
        <div className="flex items-center gap-4">
          {/* 아이콘 */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full"
            />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          {/* 수치 */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{available}</span>
              <span className="text-sm font-bold text-purple-300/60">/ {stats.total}</span>
            </div>
            <span className="text-[10px] font-bold text-purple-300/60 tracking-widest">AVAILABLE LOCKERS</span>
          </div>
        </div>

        {/* 오른쪽: 프로그레스 바 */}
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
          {/* 퍼센트 표시 */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
            />
            <span className="text-lg font-black text-purple-300">{usagePercent}%</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden border border-purple-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
            >
              {/* 빛나는 효과 */}
              <motion.div
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>

          {/* 상태 텍스트 */}
          <div className="flex gap-3 text-[9px] font-bold">
            <span className="text-emerald-400">{available} FREE</span>
            <span className="text-purple-400">{stats.used} USED</span>
          </div>
        </div>
      </div>

      {/* 테두리 빛나는 애니메이션 */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-xl border-2 border-purple-400/50 animate-pulse" />
      </div>
    </motion.div>
  )
}