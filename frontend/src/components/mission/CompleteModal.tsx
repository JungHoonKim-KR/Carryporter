import { useMissionStore } from '../../store/missionStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * 완료 모달
 * 복귀 완료 후 표시
 */
export const CompleteModal = () => {
  const navigate = useNavigate();
  const { currentMission, clearMission } = useMissionStore();

  const handleGoHome = () => {
    clearMission();
    navigate('/home');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl animate-fade-in text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-toss-green rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-gray-900 text-2xl font-bold mb-2">복귀 완료!</h2>
        <p className="text-gray-600 text-sm mb-6">
          로봇이 스테이션으로 복귀했습니다
        </p>

        {/* 보관 정보 */}
        {currentMission?.lockerInfo && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-2">보관 위치</p>
            <p className="text-lg font-bold text-gray-900">
              {currentMission.lockerInfo.lockerName}
            </p>
          </div>
        )}

        <Button
          onClick={handleGoHome}
          className="w-full h-12 font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white"
        >
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
};
