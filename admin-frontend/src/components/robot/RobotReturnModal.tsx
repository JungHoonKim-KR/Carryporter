import { motion } from 'framer-motion';
import { X, CheckCircle, ClipboardCheck, History } from 'lucide-react';

interface RobotReturnModalProps {
  robotId: string;
  onConfirm: () => void; // 점검 완료 버튼 클릭 시
}

export default function RobotReturnModal({ robotId, onConfirm }: RobotReturnModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* 배경 블러 */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      {/* 모달 본문 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white border border-slate-200 rounded-xl w-full max-w-md p-8 shadow-2xl overflow-hidden"
      >
        {/* 상단 그라데이션 (성공/완료 의미의 Green-Teal) */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-black italic flex items-center gap-2 text-slate-900">
              <CheckCircle className="text-emerald-500" size={28} /> MISSION CLEAR
            </h2>
            <p className="text-xs text-slate-500 font-bold font-mono mt-1 tracking-wide">
              RETURN SEQUENCE COMPLETE
            </p>
          </div>
        </div>

        {/* 안내 메시지 카드 */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-3 mb-2">
                <History className="text-emerald-600" size={20}/>
                <span className="font-bold text-emerald-800 text-sm">복귀 완료 알림</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
               <span className="font-black text-slate-900 bg-white px-1.5 py-0.5 rounded shadow-sm mx-1">{robotId}</span> 
               호기가 관리소에 도착했습니다.<br/>
               <span className="font-bold">최종 점검(파손/배터리 확인)</span>을 진행해주세요.
            </p>
        </div>

        {/* 액션 버튼 */}
        <button 
          onClick={onConfirm}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
        >
          <ClipboardCheck size={18} /> 점검 완료 및 대기 상태 전환
        </button>

      </motion.div>
    </div>
  );
}