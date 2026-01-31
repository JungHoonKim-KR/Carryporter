import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissionStore } from '../store/missionStore';
import { useMissionSSE } from '../hooks/useMissionSSE';
import { Button } from '@/components/ui/button';
import { VerificationModal } from '../components/mission/VerificationModal';
import { MissionTypeSelector } from '../components/mission/MissionTypeSelector';
import { StorageFlowModal } from '../components/mission/StorageFlowModal';
import { ReturnFlowModal } from '../components/mission/ReturnFlowModal';
import type { MissionType } from '../types/mission.types';

// 타임라인 스텝 컴포넌트
const TimelineStep = ({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) => (
  <div className="flex items-center gap-4">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${completed
          ? 'bg-toss-green text-white shadow-md'
          : active
            ? 'bg-toss-blue-500 text-white shadow-md'
            : 'bg-gray-200 text-gray-400'
        }`}
    >
      {completed ? '✓' : '○'}
    </div>
    <div className="flex-1">
      <span className={`font-medium ${active ? 'text-gray-900 text-base font-bold' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  </div>
);

/**
 * 미션 추적 페이지
 * 로봇 도착 후 인증 → 보관/반납 선택 → 각 플로우 실행
 */
const MissionTrackPage = () => {
  const navigate = useNavigate();
  const {
    currentMission,
    missionStatus,
    clearMission,
    setMissionType,
    hasStoredLuggages,
  } = useMissionStore();

  const { isConnected, connectionError } = useMissionSSE(currentMission?.id || null);

  // UI 상태 관리
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showStorageFlow, setShowStorageFlow] = useState(false);
  const [showReturnFlow, setShowReturnFlow] = useState(false);

  // ARRIVED 상태 → 인증 모달 자동 표시
  useEffect(() => {
    if (missionStatus?.status === 'ARRIVED' && !currentMission?.missionType) {
      setShowVerifyModal(true);
    }
  }, [missionStatus?.status, currentMission?.missionType]);

  // 인증 성공 후 타입 선택 표시
  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    setShowTypeSelector(true);
  };

  // 미션 타입 선택
  const handleTypeSelect = (type: MissionType) => {
    setMissionType(type);
    setShowTypeSelector(false);

    if (type === 'STORAGE') {
      setShowStorageFlow(true);
    } else {
      setShowReturnFlow(true);
    }
  };

  // 플로우 완료
  const handleFlowComplete = () => {
    setShowStorageFlow(false);
    setShowReturnFlow(false);
  };

  // 미션 완료
  const handleComplete = () => {
    clearMission();
    navigate('/home');
  };

  // 미션 정보가 없으면 홈으로
  if (!currentMission) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">미션 정보가 없습니다.</p>
          <Button onClick={() => navigate('/home')} className="bg-toss-blue-500 text-white">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const status = missionStatus?.status || currentMission.status;

  // 보관/반납 플로우 모달이 표시 중이면 해당 UI만 렌더링
  if (showStorageFlow) {
    return <StorageFlowModal onComplete={handleFlowComplete} />;
  }

  if (showReturnFlow) {
    return <ReturnFlowModal onComplete={handleFlowComplete} />;
  }

  // 타입 선택 UI가 표시 중이면 해당 UI만 렌더링
  if (showTypeSelector) {
    return (
      <MissionTypeSelector
        onSelect={handleTypeSelect}
        hasStoredLuggage={hasStoredLuggages()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gray-50 pt-safe">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="CARRY PORTER Logo"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-gray-900 text-lg font-bold font-['Beckman',sans-serif]">CARRY PORTER</h1>
              </div>
            </div>

            {/* 실시간 연결 상태 */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isConnected
                  ? 'bg-toss-green/20 text-toss-green'
                  : 'bg-red-50 text-red-500'
                }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-toss-green' : 'bg-red-500'
                  } ${isConnected ? 'animate-pulse' : ''}`}
              />
              {isConnected ? '실시간' : '연결 끊김'}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto px-6 py-6">
        {/* 상태 메시지 */}
        <div className="mb-6 animate-fade-in-up">
          <h2 className="text-gray-900 text-2xl font-bold mb-1">
            미션 진행중 🚀
          </h2>
          <p className="text-gray-600 text-sm">
            {status === 'MOVING' && '로봇이 이동 중입니다'}
            {status === 'ARRIVED' && '로봇이 도착했습니다'}
            {status === 'LOCKED' && '짐을 보관 중입니다'}
            {status === 'RETURNING' && '로봇이 복귀 중입니다'}
            {status === 'RETURNED' && '보관 완료'}
            {status === 'FINISHED' && '미션 완료!'}
            {!['MOVING', 'ARRIVED', 'LOCKED', 'RETURNING', 'RETURNED', 'FINISHED'].includes(status) && '작업 중입니다'}
          </p>
          {connectionError && (
            <p className="text-red-500 text-xs mt-1">
              연결 오류: {connectionError.message}
            </p>
          )}
        </div>

        {/* 타임라인 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 animate-fade-in-up">
          <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            진행 상황
          </h3>
          <div className="space-y-4">
            <TimelineStep
              label="요청됨"
              active={status === 'REQUESTED'}
              completed={status !== 'REQUESTED'}
            />
            <TimelineStep
              label="로봇 배정"
              active={status === 'ASSIGNED'}
              completed={['MOVING', 'ARRIVED', 'UNLOCKED', 'LOCKED', 'RETURNING', 'RETURNED', 'FINISHED'].includes(status)}
            />
            <TimelineStep
              label="이동 중"
              active={status === 'MOVING'}
              completed={['ARRIVED', 'UNLOCKED', 'LOCKED', 'RETURNING', 'RETURNED', 'FINISHED'].includes(status)}
            />
            <TimelineStep
              label="도착"
              active={status === 'ARRIVED'}
              completed={['UNLOCKED', 'LOCKED', 'RETURNING', 'RETURNED', 'FINISHED'].includes(status)}
            />
            <TimelineStep
              label="인증"
              active={status === 'UNLOCKED'}
              completed={['LOCKED', 'RETURNING', 'RETURNED', 'FINISHED'].includes(status)}
            />
            <TimelineStep
              label="완료"
              active={status === 'FINISHED'}
              completed={status === 'FINISHED'}
            />
          </div>
        </div>

        {/* 로봇 정보 카드 */}
        {missionStatus?.robotCode && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <h3 className="text-gray-900 font-bold text-base mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              배정 로봇
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-xs">로봇 코드</p>
                <p className="text-gray-900 text-xl font-bold">
                  {missionStatus.robotCode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 완료 버튼 (FINISHED 상태) */}
        {status === 'FINISHED' && (
          <Button
            onClick={handleComplete}
            className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white"
          >
            완료
          </Button>
        )}
      </main>

      {/* 인증 모달 (ARRIVED 상태) */}
      {showVerifyModal && currentMission && (
        <VerificationModal
          missionId={currentMission.id}
          onSuccess={handleVerificationSuccess}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </div>
  );
};

export default MissionTrackPage;
