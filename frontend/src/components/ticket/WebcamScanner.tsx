import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';

interface WebcamScannerProps {
  onCapture: (imageFile: File) => void; // 캡처된 이미지를 전달하는 콜백
  isScanning?: boolean; // 스캔 진행 중 여부
}

const WebcamScanner = ({ onCapture, isScanning = false }: WebcamScannerProps) => {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

  // 웹캠 설정 (모바일 후면 카메라 사용)
  const videoConstraints = {
    facingMode: 'environment', // 후면 카메라 선호 (없으면 전면 카메라 사용)
    width: 1920,
    height: 1080,
  };

  // 웹캠 에러 핸들러
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('웹캠 접근 에러:', error);
    setHasError(true);
  }, []);

  // 스캔하기 버튼 클릭 핸들러
  const handleScan = useCallback(() => {
    if (webcamRef.current) {
      // 스크린샷 캡처 (base64 형식)
      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        // base64를 File 객체로 변환
        const base64Data = imageSrc.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'image/jpeg' });
        const file = new File([blob], 'ticket.jpg', { type: 'image/jpeg' });

        // 부모 컴포넌트로 전달
        onCapture(file);
      }
    }
  }, [onCapture]);

  // 닫기 버튼 핸들러 (홈 화면으로 직접 이동)
  const handleClose = () => {
    navigate('/home');
  };

  // 에러 상태 UI
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-toss-gradient flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl animate-fade-in-scale">
          {/* 에러 아이콘 */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            카메라 접근 실패
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            카메라 권한을 허용해주세요.
            <br />
            설정에서 카메라 접근을 활성화할 수 있습니다.
          </p>

          <Button
            onClick={() => window.location.reload()}
            className="w-full h-14 text-lg font-semibold bg-[#0064FF] hover:bg-[#0052CC] rounded-xl"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 웹캠 스트림 (전체 화면) */}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.92}
        videoConstraints={videoConstraints}
        onUserMediaError={handleUserMediaError}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 디밍 오버레이 + 스캔 프레임 (하나의 컨테이너로 통합) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* 상단 디밍 영역 */}
        <div className="absolute top-0 left-0 right-0 bg-black/70" style={{ bottom: 'calc(50% + 100px)' }} />

        {/* 하단 디밍 영역 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70" style={{ top: 'calc(50% + 100px)' }} />

        {/* 중앙 영역: 좌측 디밍 + 스캔 영역 + 우측 디밍 */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center"
          style={{
            top: 'calc(50% - 100px)',
            bottom: 'calc(50% - 100px)',
            height: '200px'
          }}
        >
          {/* 좌측 디밍 */}
          <div className="absolute top-0 bottom-0 left-0 bg-black/70" style={{ right: 'calc(50% + 158px)' }} />

          {/* 우측 디밍 */}
          <div className="absolute top-0 bottom-0 right-0 bg-black/70" style={{ left: 'calc(50% + 158px)' }} />
        </div>

        {/* 스캔 프레임 */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: '316px',
            height: '200px',
          }}
        >
          {/* 테두리 */}
          <div className="absolute inset-0 border-2 border-[#0064FF] rounded-2xl" />

          {/* 모서리 장식 - 좌상단 */}
          <div className="absolute top-0 left-0 w-10 h-10">
            <div className="absolute top-0 left-0 w-10 h-1 bg-[#0064FF]" />
            <div className="absolute top-0 left-0 w-1 h-10 bg-[#0064FF]" />
          </div>

          {/* 모서리 장식 - 우상단 */}
          <div className="absolute top-0 right-0 w-10 h-10">
            <div className="absolute top-0 right-0 w-10 h-1 bg-[#0064FF]" />
            <div className="absolute top-0 right-0 w-1 h-10 bg-[#0064FF]" />
          </div>

          {/* 모서리 장식 - 좌하단 */}
          <div className="absolute bottom-0 left-0 w-10 h-10">
            <div className="absolute bottom-0 left-0 w-10 h-1 bg-[#0064FF]" />
            <div className="absolute bottom-0 left-0 w-1 h-10 bg-[#0064FF]" />
          </div>

          {/* 모서리 장식 - 우하단 */}
          <div className="absolute bottom-0 right-0 w-10 h-10">
            <div className="absolute bottom-0 right-0 w-10 h-1 bg-[#0064FF]" />
            <div className="absolute bottom-0 right-0 w-1 h-10 bg-[#0064FF]" />
          </div>

          {/* 스캔 라인 애니메이션 */}
          {isScanning && (
            <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#0064FF] to-transparent animate-scan-line" />
          )}
        </div>
      </div>

      {/* 상단 헤더 영역 */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
        <div className="flex items-center justify-end px-6 py-6">
          {/* 닫기 버튼 (X 아이콘만 유지) */}
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 안내 타이틀 */}
      <div className="absolute top-24 left-0 right-0 z-20 text-center px-6 animate-fade-in-up">
        <h1 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
          탑승권을 스캔해주세요!
        </h1>
        <p className="text-white/80 text-sm">
          프레임 안에 탑승권을 맞춰주세요
        </p>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe">
        <div className="px-6 pb-8 pt-6">
          {/* 보딩패스 가이드 텍스트 */}
          <p className="text-white/60 text-xs text-center mb-4">
            💡 보딩패스 전체가 프레임 안에 들어오도록 해주세요
          </p>

          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full h-14 text-lg font-semibold bg-[#0064FF] hover:bg-[#0052CC] disabled:bg-[#0064FF]/50 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-[0.98]"
          >
            {isScanning ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                스캔 중...
              </div>
            ) : (
              '스캔하기'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebcamScanner;
