import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebcamScanner from '../components/ticket/WebcamScanner';
import ScanSuccessModal from '../components/ticket/ScanSuccessModal';
import { scanTicket } from '../api/ticket.api';
import { useTicketStore } from '../store/ticketStore';

const TicketScanPage = () => {
  const navigate = useNavigate();
  const { setTicket, setScanning, isScanning } = useTicketStore();
  const [showSuccess, setShowSuccess] = useState(false);

  // 이미지 캡처 핸들러
  const handleCapture = async (imageFile: File) => {
    try {
      // 스캔 시작
      setScanning(true);

      // 백엔드로 이미지 전송 및 OCR 수행
      const ticketData = await scanTicket(imageFile);

      // 스토어에 티켓 정보 저장
      setTicket(ticketData);

      // 성공 모달 표시
      setShowSuccess(true);
    } catch (error) {
      if (import.meta.env.DEV) console.error('티켓 스캔 실패:', error);
      setScanning(false);

      // 에러 알림 (향후 Toast 컴포넌트로 대체 가능)
      alert('티켓 스캔에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // "등록" 버튼 클릭 핸들러
  const handleConfirm = () => {
    setShowSuccess(false);
    navigate('/home');
  };

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
            <button
              onClick={() => navigate('/home')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto px-6 py-6">
        {/* 제목 */}
        <div className="mb-6 animate-fade-in-up">
          <h2 className="text-gray-900 text-2xl font-bold mb-1">
            티켓 스캔 📷
          </h2>
          <p className="text-gray-600 text-sm">
            항공권을 카메라에 비춰주세요
          </p>
        </div>

        {/* 웹캠 스캐너 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-fade-in-up">
          <WebcamScanner onCapture={handleCapture} isScanning={isScanning} />
        </div>
      </main>

      {/* 스캔 완료 모달 */}
      <ScanSuccessModal isOpen={showSuccess} onConfirm={handleConfirm} />
    </div>
  );
};

export default TicketScanPage;
