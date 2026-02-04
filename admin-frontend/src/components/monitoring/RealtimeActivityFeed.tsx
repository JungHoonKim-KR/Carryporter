import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Zap, CheckCircle, AlertCircle, Info, TrendingUp, Wifi, Radio, Heart } from 'lucide-react'
import { useSseStore } from '@/store/sseStore'

interface ActivityLog {
  id: string
  timestamp: Date
  type: 'robot_assigned' | 'robot_returned' | 'status_update' | 'system' | 'mission_start' | 'heartbeat' | 'connect'
  robotCode?: string
  message: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}
export default function RealtimeActivityFeed() {
  const lastMessage = useSseStore(state => state.lastMessage)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
// ... (기존 import 및 ActivityLog 인터페이스 생략)

useEffect(() => {
  if (!lastMessage) return;

  const timestamp = new Date();
  let newActivity: ActivityLog | null = null;

  // 1. SSE 원본 문자열에서 event와 data 분리
  let eventName = '';
  let rawData = '';

  if (typeof lastMessage === 'string') {
    const lines = lastMessage.split('\n');
    lines.forEach(line => {
      if (line.startsWith('event:')) eventName = line.replace('event:', '').trim();
      else if (line.startsWith('data:')) rawData = line.replace('data:', '').trim();
    });
    // 만약 event: 형식이 없는 순수 문자열이라면 전체를 rawData로 간주
    if (!rawData && !eventName) rawData = lastMessage;
  }

  // 2. 데이터 처리 시나리오
  try {
    // --- 시나리오 A: CONNECT 이벤트 (텍스트 데이터) ---
    if (eventName === 'CONNECT' || rawData.includes('Connected!')) {
      newActivity = {
        id: `${Date.now()}-conn`,
        timestamp,
        type: 'connect',
        message: `🌐 시스템 연결 성공: 관리자 권한 활성화`,
        icon: <Wifi className="w-4 h-4" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      };
    } 
    // --- 시나리오 B: Heartbeat (로그에 남기지 않거나 아주 작게 처리) ---
    else if (eventName === 'heartbeat' || rawData === 'ping') {
      // 핑 데이터는 너무 자주 오므로 로그에 남기지 않으려면 여기서 return 처리
      // 만약 남기고 싶다면 아래 주석 해제
      /*
      newActivity = {
        id: `${Date.now()}-hb`,
        timestamp,
        type: 'heartbeat',
        message: '💓 시스템 신호 정상 (Ping)',
        icon: <Heart className="w-4 h-4" />,
        color: 'text-rose-400',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-100'
      };
      */
      return; 
    } 
    // --- 시나리오 C: 일반 JSON 이벤트 (로봇 할당, 반납 등) ---
    else {
      const parsed = JSON.parse(rawData);
      const type = parsed.eventName || (parsed.requestType ? 'RobotAssignedEvent' : '');

      if (type === 'RobotAssignedEvent' || parsed.requestType) {
        newActivity = {
          id: `${Date.now()}-assign`,
          timestamp,
          type: 'robot_assigned',
          robotCode: parsed.robotCode,
          message: `🚀 [호출] ${parsed.robotCode}번 로봇이 '${parsed.callLocationName}'으로 출발`,
          icon: <Zap className="w-4 h-4" />,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      } else if (type === 'RobotReturnedAdminEvent' || parsed.lockerCode) {
        newActivity = {
          id: `${Date.now()}-return`,
          timestamp,
          type: 'robot_returned',
          robotCode: parsed.robotCode,
          message: `✅ [복귀] ${parsed.robotCode} 로봇 업무를 마치고 복귀했습니다.`,
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          borderColor: 'border-cyan-200'
        };
      }
    }
  } catch (e) {
    // JSON 파싱 실패 시 (순수 텍스트인 경우)
    if (rawData && !rawData.includes('ping')) {
      newActivity = {
        id: `${Date.now()}-text`,
        timestamp,
        type: 'system',
        message: rawData,
        icon: <Info className="w-4 h-4" />,
        color: 'text-slate-500',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200'
      };
    }
  }

  if (newActivity) {
    setActivities(prev => [newActivity!, ...prev].slice(0, 30));
  }
}, [lastMessage]);

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 10) return '방금 전'
    if (diff < 60) return `${diff}초 전`
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xl">
      {/* 헤더 */}
      <div className="flex-none px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bell className="w-4 h-4 text-cyan-600" />
            </motion.div>
            <h3 className="text-sm font-bold text-slate-800">실시간 활동</h3>
          </div>
          
          <motion.div
            key={activities.length}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs font-bold text-slate-600">{activities.length}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
          </motion.div>
        </div>
      </div>

      {/* 활동 목록 */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-50"
      >
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Bell className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
            <p className="text-xs text-slate-500">활동 대기 중...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.05
                }}
                className="group relative"
              >
                {/* 활동 카드 */}
                <div className={`
                  relative p-3 rounded-lg border ${activity.borderColor} ${activity.bgColor}
                  backdrop-blur-sm transition-all duration-300
                  hover:shadow-md cursor-pointer
                `}>
                  {/* 호버 효과 */}
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${activity.bgColor}, transparent 70%)`
                    }}
                  />

                  <div className="relative flex gap-3">
                    {/* 아이콘 */}
                    <motion.div
                      animate={{ 
                        rotate: activity.type === 'heartbeat' ? [0, 5, 0, -5, 0] : 0,
                        scale: activity.type === 'heartbeat' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ 
                        duration: activity.type === 'heartbeat' ? 1 : 2,
                        repeat: Infinity,
                        delay: index * 0.1
                      }}
                      className={`
                        flex-none w-8 h-8 rounded-lg ${activity.bgColor} ${activity.borderColor}
                        border flex items-center justify-center ${activity.color} shadow-sm
                      `}
                    >
                      {activity.icon}
                    </motion.div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 leading-relaxed break-words">
                        {activity.message}
                      </p>
                      
                      {/* 로봇 코드 배지 */}
                      {activity.robotCode && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`
                            inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold
                            ${activity.bgColor} ${activity.borderColor} border ${activity.color}
                          `}
                        >
                          {activity.robotCode}
                        </motion.span>
                      )}

                      {/* 시간 */}
                      <p className="text-[10px] text-slate-500 mt-1">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>

                    {/* 펄스 인디케이터 */}
                    {index < 3 && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${activity.color.replace('text-', 'bg-')} shadow-lg`}
                      />
                    )}
                  </div>
                </div>

                {/* 연결선 */}
                {index < activities.length - 1 && (
                  <div className="absolute left-7 top-full h-2 w-px bg-gradient-to-b from-slate-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 하단 상태바 */}
      <div className="flex-none px-3 py-2 bg-gradient-to-r from-slate-50 to-cyan-50 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[9px] font-medium text-slate-600">LIVE FEED</span>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold text-emerald-600">ACTIVE</span>
        </motion.div>
      </div>
    </div>
  )
}