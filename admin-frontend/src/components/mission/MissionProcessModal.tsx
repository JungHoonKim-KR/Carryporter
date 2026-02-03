import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Box, Lock, Send, CheckCircle, AlertCircle, RefreshCw, ChevronRight
} from 'lucide-react';
import { api } from '@/api/axiosConfig';
import { RobotAssignedEvent } from '@/types/robotEvents';

interface LockerResponse {
  lockerId: number;
  lockerCode: string;
  status: 'AVAILABLE' | 'OCCUPIED';
}

interface MissionProcessModalProps {
  data: RobotAssignedEvent;
  onClose: () => void;
  onMissionStart: (missionId: number) => void;
}

type ProcessStep = 'LOCKER_SELECT' | 'LOCK_ROBOT' | 'READY_TO_START';

export default function MissionProcessModal({ data, onClose, onMissionStart }: MissionProcessModalProps) {
  const [step, setStep] = useState<ProcessStep>(
    data.requestType === 'RECALL' ? 'LOCK_ROBOT' : 'LOCKER_SELECT'
  );

  // 실제 배정된 사물함 코드
  const [selectedLockerCode, setSelectedLockerCode] = useState<string | null>(data.locker_code);
  // 선택 단계에서 일시적으로 클릭한 사물함 정보
  const [tempSelectedLocker, setTempSelectedLocker] = useState<LockerResponse | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockers, setLockers] = useState<LockerResponse[]>([]);
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);

  useEffect(() => {
    if (data.requestType === 'FIRST') {
      fetchLockers();
    }
  }, [data.requestType]);

  const fetchLockers = async () => {
    setIsLoadingLockers(true);
    try {
      const res = await api.get<LockerResponse[]>('/api/admin/lockers'); 
      if (Array.isArray(res.data)) {
        setLockers(res.data);
      }
    } catch (err) {
      console.error("사물함 목록 로딩 실패:", err);
      setLockers([]);
    } finally {
      setIsLoadingLockers(false);
    }
  };

  // handleAssignLocker 함수 내 성공 로직 부분 수정
const handleAssignLocker = async () => {
  if (!tempSelectedLocker) return;
  setIsProcessing(true);
  try {
    await api.post(`/api/admin/missions/${data.missionId}/lockers/${tempSelectedLocker.lockerId}`);

    // ✅ 성공 시 알림을 띄우거나 바로 다음 단계로 전환
    console.log("✅ 배정 성공");
    setSelectedLockerCode(tempSelectedLocker.lockerCode);
    setStep('LOCK_ROBOT'); 
  } catch (err) {
      console.error("❌ 사물함 배정 실패:", err);
      alert("사물함 배정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. 로봇 잠금 요청
  const handleLockRobot = async () => {
    setIsProcessing(true);
    try {
      await api.post(`/api/admin/missions/${data.missionId}/lock`, {});
      setStep('READY_TO_START'); 
    } catch (err) {
      console.error("❌ 잠금 요청 실패:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. 미션 출발 요청
  const handleStartMission = async () => {
    setIsProcessing(true);
    try {
      await api.post(`/api/admin/missions/${data.missionId}/dispatch`, {});
      onMissionStart(data.missionId);
    } catch (err) {
      console.error("❌ 출발 요청 실패:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* 헤더 부분 */}
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex-none">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              data.requestType === 'FIRST' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {data.requestType === 'FIRST' ? '📦 신규 보관 요청' : '🔄 물품 찾기(Recall)'}
            </span>
            <span className="text-slate-400 font-mono text-xs">Mission #{data.missionId}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
             {data.callLocationName} <span className="font-normal text-slate-500">호출 처리</span>
          </h2>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {/* --- [STEP 1] 사물함 선택 --- */}
          {step === 'LOCKER_SELECT' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <p className="text-blue-800 text-sm font-bold flex items-center gap-2">
                  <AlertCircle size={16}/> 사물함 선택
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  배정할 빈 사물함을 선택한 후 하단의 '배정 확정' 버튼을 눌러주세요.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {isLoadingLockers ? (
                  <div className="col-span-4 py-10 text-center text-slate-400 text-sm">로딩 중...</div>
                ) : (
                  lockers.map((locker) => {
                    const isAvailable = locker.status === 'AVAILABLE';
                    const isSelected = tempSelectedLocker?.lockerId === locker.lockerId;
                    return (
                      <button 
                        key={locker.lockerId}
                        onClick={() => isAvailable && setTempSelectedLocker(locker)}
                        disabled={!isAvailable || isProcessing}
                        className={`
                          py-3 border rounded-lg font-mono font-bold transition-all
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-500 text-white shadow-md scale-105' 
                            : isAvailable 
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' 
                              : 'border-slate-100 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'}
                        `}
                      >
                        {locker.lockerCode}
                      </button>
                    );
                  })
                )}
              </div>

              {/* 배정 확정 버튼 (선택 시에만 노출) */}
              <AnimatePresence>
                {tempSelectedLocker && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
                    <button 
                      onClick={handleAssignLocker}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg"
                    >
                      {isProcessing ? '배정 중...' : <>{tempSelectedLocker.lockerCode}번 사물함 배정 확정 <ChevronRight size={18}/></>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* --- [STEP 2] 로봇 잠금 --- */}
          {step === 'LOCK_ROBOT' && (
            <div className="text-center py-4">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <Box size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-800">
                  {data.requestType === 'RECALL' ? '물품 적재 확인' : '사물함 배정 완료'}
               </h3>
               <p className="text-slate-600 mt-2 mb-8">
                 <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-lg">
                    {selectedLockerCode}
                 </span>
                 {data.requestType === 'RECALL' 
                   ? ' 번 사물함의 물건을 적재했습니다.'
                   : ' 번 사물함으로 이동을 시작합니다.'}
               </p>

               <button 
                 onClick={handleLockRobot}
                 disabled={isProcessing}
                 className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
               >
                 {isProcessing ? '처리 중...' : <> <Lock size={18} /> 로봇 잠금 (DOOR LOCK) </>}
               </button>
            </div>
          )}

          {/* --- [STEP 3] 최종 출발 --- */}
          {step === 'READY_TO_START' && (
            <div className="text-center py-4">
               <div className="mb-6 bg-green-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex flex-col items-center gap-2 text-green-700">
                    <CheckCircle size={40} className="mb-2" />
                    <span className="font-bold text-lg">준비 완료</span>
                  </div>
               </div>

               <button 
                 onClick={handleStartMission}
                 disabled={isProcessing}
                 className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-200"
               >
                 {isProcessing ? '전송 중...' : <> <Send size={18} /> 미션 출발 (START) </>}
               </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}