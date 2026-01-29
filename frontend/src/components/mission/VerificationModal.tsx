import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// import { verifyMission } from '../../api/mission.api;
import { verifyMission } from '../../api/mission.api.mock'; // 🔧 Mock API 사용 (백엔드 없이 테스트용)

interface VerificationModalProps {
  missionId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const VerificationModal = ({
  missionId,
  onSuccess,
  onClose,
}: VerificationModalProps) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleNumberClick = (num: string) => {
    if (password.length < 4) {
      setPassword((prev) => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPassword((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleVerify = async () => {
    if (password.length !== 4) {
      setError('4자리 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');

      await verifyMission(missionId, Number(password));

      // 인증 성공
      onSuccess();
      onClose();
    } catch (err) {
      console.error('인증 실패:', err);
      setError('비밀번호가 일치하지 않습니다.');
      setPassword('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            로봇 인증
          </DialogTitle>
          <p className="text-center text-gray-500 mt-2">
            카트 비밀번호 4자리를 입력하세요
          </p>
        </DialogHeader>

        {/* 비밀번호 표시 (4개 원) */}
        <div className="flex justify-center gap-3 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                password[idx]
                  ? 'bg-[#0064FF] text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              {password[idx] || '•'}
            </div>
          ))}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-2 animate-fade-in-scale">
            {error}
          </p>
        )}

        {/* 숫자 키패드 (3x4 그리드) */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num.toString())}
              className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-xl font-semibold transition-colors"
            >
              {num}
            </button>
          ))}

          {/* 백스페이스 */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            ←
          </button>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleNumberClick('0')}
            className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-xl font-semibold transition-colors"
          >
            0
          </button>

          {/* 빈 공간 */}
          <div className="h-16" />
        </div>

        {/* 인증 버튼 */}
        <Button
          disabled={password.length !== 4 || isVerifying}
          onClick={handleVerify}
          className="w-full h-14 mt-4 text-lg font-semibold bg-[#0064FF] hover:bg-[#0052CC] disabled:bg-gray-300"
        >
          {isVerifying ? '인증 중...' : '인증하기'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
