import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, User, Box, Lock, Send, CheckCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '@/api/axiosConfig'; // ✅ 만들어둔 api 인스턴스 가져오기 (경로는 프로젝트 구조에 맞게)
import { RobotAssignedEvent } from '@/types/robotEvents';

// --- [추가] 사물함 타입 정의 ---
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
  // 초기 단계 설정
  const [step, setStep] = useState<ProcessStep>(
    data.requestType === 'RECALL' ? 'LOCK_ROBOT' : 'LOCKER_SELECT'
  );

  const [selectedLocker, setSelectedLocker] = useState<string | null>(data.locker_code);
  const [isLocked, setIsLocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- [추가] 사물함 목록 관리 State ---
  const [lockers, setLockers] = useState<LockerResponse[]>([]);
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);

  // --- [추가] 사물함 목록 불러오기 (FIRST 단계일 때만) ---
  useEffect(() => {
    if (data.requestType === 'FIRST') {
      fetchLockers();
    }
  }, [data.requestType]);

  const fetchLockers = async () => {
    setIsLoadingLockers(true);
    try {
      // ✅ api.get을 사용하면 인터셉터가 자동으로 헤더에 토큰을 끼워줍니다.
      // baseURL이 localhost:8080으로 되어있으므로, 경로는 백엔드 Controller 주소 그대로 적습니다.
      const res = await api.get<LockerResponse[]>('api/admin/lockers'); 
      
      console.log("📦 사물함 목록 수신:", res.data);

      if (Array.isArray(res.data)) {
        setLockers(res.data);
      } else {
        console.error("데이터 형식이 배열이 아닙니다:", res.data);
        setLockers([]);
      }
    } catch (err) {
      console.error("사물함 목록 로딩 실패:", err);
      // 권한 없음(401) 등의 에러도 여기서 잡힘
      setLockers([]);
    } finally {
      setIsLoadingLockers(false);
    }
  };

  // 1. 사물함 배정 요청
  const handleAssignLocker = async (lockerCode: string) => {
    setIsProcessing(true);
    console.log(`📡 [API] 사물함 배정 요청: MissionID=${data.missionId}, Locker=${lockerCode}`);
    
    // TODO: 백엔드 API 연동
    // await axios.post('/api/mission/assign-locker', { missionId: data.missionId, lockerCode });
    
    setTimeout(() => {
      setSelectedLocker(lockerCode);
      setStep('LOCK_ROBOT');
      setIsProcessing(false);
    }, 1000);
  };

  // 2. 로봇 잠금 요청
  const handleLockRobot = async () => {
    setIsProcessing(true);
    try {
      console.log(`📡 [API] 잠금 요청: Mission=${data.missionId}`); // robotCode는 이제 불필요
      
      // ✅ 수정됨: robotId 제거하고 빈 객체 {} 전송
      await api.post(`api/admin/missions/${data.missionId}/lock`, {});

      console.log("✅ 잠금 성공");
      setIsLocked(true);
      setStep('READY_TO_START'); 

    } catch (err) {
      console.error("❌ 잠금 요청 실패:", err);
      // alert("잠금 실패. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

 // 3. 🚀 [API 연동] 미션 출발 요청
  // URL: POST /missions/{missionId}/dispatch
  // Body: {} (빈 객체 전송)
  const handleStartMission = async () => {
    setIsProcessing(true);
    try {
      console.log(`📡 [API] 출발 요청: Mission=${data.missionId}`);

      // ✅ 수정됨: robotId 제거하고 빈 객체 {} 전송
      await api.post(`api/admin/missions/${data.missionId}/dispatch`, {});

      console.log("✅ 출발 요청 성공");
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
      />

      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" // max-h 추가
      >
        {/* 헤더 */}
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
             {data.callLocationName} <span className="font-normal text-slate-500">에서 호출</span>
          </h2>
          <div className="flex items-center gap-4 text-sm text-slate-600">
             <div className="flex items-center gap-1"><User size={14}/> {data.userId}</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"/> {data.robotCode}</div>
          </div>
        </div>

        {/* 바디 (스크롤 가능) */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
            
          {/* --- [STEP 1] 사물함 배정 (FIRST Only) --- */}
          {step === 'LOCKER_SELECT' && (
            <div>
               <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                  <p className="text-blue-800 text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={16}/> 사물함 배정이 필요합니다.
                  </p>
                  <p className="text-blue-600 text-xs mt-1 ml-6">
                    빈 사물함(녹색)을 선택하면 로봇에 배정됩니다.
                  </p>
               </div>

               <div className="flex justify-between items-center mb-3">
                 <p className="text-sm font-bold text-slate-700">사물함 목록</p>
                 <button onClick={fetchLockers} className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600">
                   <RefreshCw size={12}/> 새로고침
                 </button>
               </div>

               {/* 로딩 중 표시 */}
               {isLoadingLockers ? (
                 <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                   사물함 정보를 불러오는 중...
                 </div>
               ) : (
                 /* 사물함 그리드 */
                 <div className="grid grid-cols-4 gap-2 mb-6">
                    {lockers.map((locker) => {
                      const isAvailable = locker.status === 'AVAILABLE';
                      return (
                        <button 
                          key={locker.lockerId}
                          onClick={() => isAvailable && handleAssignLocker(locker.lockerCode)}
                          disabled={!isAvailable || isProcessing}
                          className={`
                            py-3 border rounded-lg font-mono font-bold transition-all relative overflow-hidden
                            ${isAvailable 
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105 shadow-sm' 
                              : 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'}
                          `}
                        >
                          {locker.lockerCode}
                          {/* 상태 표시 뱃지 */}
                          {!isAvailable && (
                            <span className="absolute top-0 right-0 bg-slate-300 text-[8px] text-white px-1">사용중</span>
                          )}
                        </button>
                      );
                    })}
                 </div>
               )}
               
               <button onClick={onClose} className="text-xs text-slate-400 underline w-full text-center hover:text-red-500">
                  짐이 없습니까? (배정 취소/빈 박스 처리)
               </button>
            </div>
          )}

          {/* --- [STEP 2] 적재 확인 및 로봇 잠금 (공통) --- */}
          {step === 'LOCK_ROBOT' && (
            <div className="text-center py-4">
               {/* ... (이전 코드와 동일: Box 아이콘 및 안내 문구) ... */}
               <div className="mb-8">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                   <Box size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">
                    {data.requestType === 'RECALL' ? '물품 적재 확인' : '사물함 배정 완료'}
                 </h3>
                 <p className="text-slate-600 mt-2">
                   <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-lg">
                      {selectedLocker}
                   </span>
                   {data.requestType === 'RECALL' 
                     ? ' 번 사물함의 물건을 로봇에 적재하세요.'
                     : ' 번 사물함으로 이동 준비를 합니다.'}
                 </p>
               </div>

               <button 
                 onClick={handleLockRobot}
                 disabled={isProcessing}
                 className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
               >
                 {isProcessing ? '처리 중...' : <> <Lock size={18} /> 로봇 잠금 (DOOR LOCK) </>}
               </button>
            </div>
          )}

          {/* --- [STEP 3] 최종 출발 (공통) --- */}
          {step === 'READY_TO_START' && (
            <div className="text-center py-4">
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="mb-6 bg-green-50 p-6 rounded-2xl border border-green-100"
               >
                  <div className="flex flex-col items-center gap-2 text-green-700">
                    <CheckCircle size={40} className="mb-2" />
                    <span className="font-bold text-lg">잠금 완료</span>
                  </div>
               </motion.div>

               <button 
                 onClick={handleStartMission}
                 disabled={isProcessing}
                 className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
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