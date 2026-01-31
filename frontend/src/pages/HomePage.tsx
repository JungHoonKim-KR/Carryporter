import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTicketStore } from '../store/ticketStore';
import { useMissionStore } from '../store/missionStore';
import { getLatestTicket } from '../api/ticket.api';
import { Button } from '@/components/ui/button';
import TicketCard from '../components/ticket/TicketCard';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTicket, setTicket } = useTicketStore();
  const { storedLuggages } = useMissionStore();
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);

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
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto px-6 py-6">
        {/* 환영 메시지 */}
        <div className="mb-6 animate-fade-in-up">
          <h2 className="text-gray-900 text-2xl font-bold mb-1">
            안녕하세요 👋
          </h2>
          <p className="text-gray-600 text-sm">
            {user?.email}님
          </p>
        </div>

        {/* 로봇 호출 */}
        <button
          onClick={() => navigate('/mission/create')}
          className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3 mb-6"
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

        {/* 내 짐 */}
        <button
          onClick={() => navigate('/ticket/detail')}
          className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 bg-toss-green rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-gray-900 font-semibold text-base">내 짐</h3>
            <p className="text-gray-500 text-sm">보관 현황</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 로봇 현황 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            로봇 현황
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-gray-900 mb-1">12대</div>
              <div className="text-gray-600 text-sm">가용 로봇</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {storedLuggages.length > 0 ? storedLuggages[0].destination || '-' : '-'}
              </div>
              <div className="text-gray-600 text-sm">최근 호출</div>
            </div>
          </div>
        </div>

        {/* 보관된 짐 목록 */}
        {storedLuggages.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-toss-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              내 보관함
              <span className="ml-auto bg-toss-green text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                {storedLuggages.length}
              </span>
            </h3>
            <div className="space-y-3">
              {storedLuggages.map((luggage) => (
                <div
                  key={luggage.id}
                  className="bg-gray-50 rounded-xl p-4 flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-toss-green rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold text-sm">{luggage.lockerName}</p>
                    <p className="text-gray-600 text-xs">
                      {luggage.weight.toFixed(1)}kg • {new Date(luggage.storedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 티켓 정보 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
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
