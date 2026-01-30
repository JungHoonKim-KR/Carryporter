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
      // 이미 티켓이 메모리에 있으면 조회 생략
      if (currentTicket) return;

      // localStorage에 ticketId가 없으면 조회 생략
      const ticketId = localStorage.getItem('ticketId');
      if (!ticketId) return;

      try {
        setIsLoadingTicket(true);
        const ticketData = await getLatestTicket();
        setTicket(ticketData);
      } catch (error) {
        console.error('티켓 정보 조회 실패:', error);
        // 에러 발생 시 localStorage의 ticketId가 유효하지 않을 수 있으므로 제거
        localStorage.removeItem('ticketId');
      } finally {
        setIsLoadingTicket(false);
      }
    };

    loadTicket();
  }, [currentTicket, setTicket]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0064FF] to-[#4DA3FF]">
      {/* 헤더 */}
      <header className="pt-safe">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight">CarryPorter</h1>
                <p className="text-white/70 text-xs">스마트 짐 운반 서비스</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="px-6 pb-8">
        {/* 환영 메시지 */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-white text-2xl font-bold mb-1">
            안녕하세요! 👋
          </h2>
          <p className="text-white/80 text-sm">
            {user?.email}님, 무엇을 도와드릴까요?
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* 로봇 호출 카드 */}
          <button
            onClick={() => navigate('/mission/create')}
            className="card-toss p-6 text-left hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#0064FF] to-[#4DA3FF] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-gray-900 text-lg font-bold mb-1">로봇 호출</h3>
            <p className="text-gray-500 text-sm">짐 운반 로봇을 호출하세요</p>
          </button>

          {/* 내 짐 카드 */}
          <button
            onClick={() => navigate('/ticket/detail')}
            className="card-toss p-6 text-left hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#00C853] to-[#69F0AE] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-gray-900 text-lg font-bold mb-1">내 짐</h3>
            <p className="text-gray-500 text-sm">현재 운반 중인 짐 확인</p>
          </button>
        </div>

        {/* 로봇 현황 섹션 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            로봇 현황
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">12대</div>
              <div className="text-white/70 text-sm">가용 로봇</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-white mb-1">A-12</div>
              <div className="text-white/70 text-sm">최근 호출 구역</div>
            </div>
          </div>
        </div>

        {/* 보관된 짐 목록 섹션 */}
        {storedLuggages.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              내 보관함
              <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {storedLuggages.length}개
              </span>
            </h3>
            <div className="space-y-3">
              {storedLuggages.map((luggage) => (
                <div
                  key={luggage.id}
                  className="bg-white/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00C853] to-[#69F0AE] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{luggage.lockerName}</p>
                      <p className="text-white/70 text-sm">
                        {luggage.weight.toFixed(1)}kg • {new Date(luggage.storedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 보관
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/60 text-xs text-center mt-3">
              반납하려면 로봇을 호출하세요
            </p>
          </div>
        )}

        {/* 티켓 정보 또는 스캔 버튼 */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            내 티켓
          </h3>

          {isLoadingTicket ? (
            <div className="card-toss p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">티켓 정보를 불러오는 중...</p>
            </div>
          ) : currentTicket ? (
            <TicketCard
              ticket={currentTicket}
              variant="compact"
              onClick={() => navigate('/ticket/detail')}
            />
          ) : (
            <div className="card-toss p-8 text-center">
              {/* 티켓 아이콘 */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#0064FF]/10 to-[#4DA3FF]/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[#0064FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>

              <h3 className="text-gray-900 text-xl font-bold mb-2">
                티켓을 등록해주세요
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                비행기 티켓을 스캔하여
                <br />
                자동으로 등록할 수 있습니다.
              </p>

              <Button
                onClick={() => navigate('/ticket/scan')}
                className="w-full h-14 text-lg font-semibold bg-[#0064FF] hover:bg-[#0052CC] rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-[0.98]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                티켓 스캔하기
              </Button>
            </div>
          )}
        </div>

        {/* 다음 단계 안내 */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-white font-semibold mb-4">이용 안내</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${true ? 'bg-[#00C853]' : 'bg-white/30'}`}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90 text-sm">로그인 완료</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentTicket ? 'bg-[#00C853]' : 'bg-white/30'}`}>
                {currentTicket ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white/60 text-xs font-bold">2</span>
                )}
              </div>
              <span className="text-white/90 text-sm">티켓 스캔</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-white/60 text-xs font-bold">3</span>
              </div>
              <span className="text-white/70 text-sm">로봇 호출</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-white/60 text-xs font-bold">4</span>
              </div>
              <span className="text-white/70 text-sm">실시간 상태 확인</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
