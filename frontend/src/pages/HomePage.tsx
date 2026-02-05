import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTicketStore } from '../store/ticketStore';
import { useMissionStore } from '../store/missionStore';
import { getLatestTicket } from '../api/ticket.api';
import { getUserStoringLocker } from '../api/locker.api';
import { Button } from '@/components/ui/button';
import TicketCard from '../components/ticket/TicketCard';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTicket, setTicket } = useTicketStore();
  const { currentLocker, setCurrentLocker, isConnected } = useMissionStore();
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [isLoadingLocker, setIsLoadingLocker] = useState(false);
  const [lockerError, setLockerError] = useState<string | null>(null);

  // 티켓 정보 자동 조회
  useEffect(() => {
    const loadTicket = async () => {
      if (currentTicket) return;

      const ticketId = localStorage.getItem('ticketId');
      if (!ticketId) return;

      try {
        setIsLoadingTicket(true);
        const ticketData = await getLatestTicket();
        setTicket(ticketData);
      } catch (error) {
        console.error('티켓 정보 조회 실패:', error);
        localStorage.removeItem('ticketId');
      } finally {
        setIsLoadingTicket(false);
      }
    };

    loadTicket();
  }, [currentTicket, setTicket]);

  // 사물함 정보 자동 조회 (페이지 마운트 시마다 실행)
  useEffect(() => {
    const loadLocker = async () => {
      try {
        setIsLoadingLocker(true);
        setLockerError(null);

        const locker = await getUserStoringLocker();
        setCurrentLocker(locker); // null일 수도 있음 (사물함 없음)
      } catch (error: any) {
        console.error('사물함 조회 실패:', error);

        // 401은 interceptor가 처리
        if (error.response?.status === 401) return;

        // 네트워크 에러 표시
        setLockerError('사물함 정보를 불러올 수 없습니다.');
        setCurrentLocker(null);
      } finally {
        setIsLoadingLocker(false);
      }
    };

    loadLocker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 컴포넌트 마운트 시에만 실행

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

            {/* ✅ 연결 상태 인디케이터 */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-toss-green animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500">
                {isConnected ? '실시간 연결' : '오프라인'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto px-6 py-4">
        {/* 환영 메시지 */}
        <div className="mb-4 animate-fade-in-up">
          <h2 className="text-gray-900 text-xl font-bold mb-1">
            안녕하세요 👋
          </h2>
          <p className="text-gray-600 text-sm">
            {user?.email}님
          </p>
        </div>

        {/* 로봇 호출 */}
        <button
          onClick={() => navigate('/mission/create')}
          className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3 mb-4 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="w-10 h-10 bg-toss-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-gray-900 font-semibold text-base">로봇 호출</h3>
            <p className="text-gray-500 text-sm">짐 운반 요청</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 로봇 현황 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            {/* 좌측: 아이콘 + 제목 */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-gray-900 font-bold text-sm">로봇 현황</h3>
            </div>

            {/* 우측: 로봇 수 */}
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-gray-900">12</span>
              <span className="text-sm text-gray-600">대 가용</span>
            </div>
          </div>
        </div>

        {/* 보관 중인 짐 */}
        {isLoadingLocker ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-toss-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600 text-sm">
                사물함 정보를 불러오는 중...
              </span>
            </div>
          </div>
        ) : lockerError ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{lockerError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-toss-blue-500 text-sm underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : currentLocker ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {/* 헤더: 상자 아이콘 + 제목 + 배지 */}
            <h3 className="text-gray-900 font-bold text-sm mb-3 flex items-center gap-2">
              {/* 상자 아이콘 */}
              <svg className="w-5 h-5 text-toss-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              보관 중인 짐
              <span className="ml-auto bg-toss-green text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                보관 중
              </span>
            </h3>

            {/* 사물함 카드: 좌측 아이콘 + 우측 정보 */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              {/* 좌측: 가방 아이콘 */}
              <div className="w-10 h-10 bg-toss-green rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>

              {/* 우측: 사물함 정보 */}
              <div className="flex-1">
                <p className="text-gray-900 font-semibold text-sm">
                  {currentLocker.lockerCode}
                </p>
                <p className="text-gray-600 text-xs">
                  {new Date(currentLocker.updatedAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* 티켓 정보 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            항공권
          </h3>

          {isLoadingTicket ? (
            <div className="text-center py-4">
              <div className="animate-spin w-12 h-12 border-4 border-toss-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">티켓 정보를 불러오는 중...</p>
            </div>
          ) : currentTicket ? (
            <div onClick={() => navigate('/ticket/detail')} className="cursor-pointer">
              <TicketCard ticket={currentTicket} variant="compact" />
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>

              <h4 className="text-gray-900 text-lg font-bold mb-2">
                티켓을 등록해주세요
              </h4>
              <p className="text-gray-600 text-sm mb-6">
                비행기 티켓을 스캔하여 등록하세요
              </p>

              <Button
                onClick={() => navigate('/ticket/scan')}
                className="w-full bg-toss-blue-500 hover:bg-toss-blue-600 text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                티켓 스캔하기
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
