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
      console.error('티켓 스캔 실패:', error);
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
    <>
      {/* 웹캠 스캐너 */}
      <WebcamScanner onCapture={handleCapture} isScanning={isScanning} />

      {/* 스캔 완료 모달 */}
      <ScanSuccessModal isOpen={showSuccess} onConfirm={handleConfirm} />
    </>
  );
};

export default TicketScanPage;
