import { useNavigate } from 'react-router-dom';
import { useTicketStore } from '../store/ticketStore';
import TicketCard from '../components/ticket/TicketCard';
import { Button } from '@/components/ui/button';

const TicketDetailPage = () => {
  const navigate = useNavigate();
  const { currentTicket } = useTicketStore();

  // 티켓 정보가 없으면 홈으로 리다이렉트
  if (!currentTicket) {
    navigate('/home');
    return null;
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
            티켓 상세 ✈️
          </h2>
          <p className="text-gray-600 text-sm">
            등록된 항공권 정보를 확인하세요
          </p>
        </div>

        {/* 티켓 카드 */}
        <div className="animate-fade-in-up">
          <TicketCard ticket={currentTicket} variant="detailed" />
        </div>

        {/* 확인 버튼 */}
        <div className="mt-6 animate-fade-in-up">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white"
            onClick={() => navigate('/home')}
          >
            확인
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TicketDetailPage;
