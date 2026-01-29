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
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/home')}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-gray-900">
            티켓 상세
          </h1>
          <div className="w-6"></div> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>

      {/* 티켓 카드 (Detailed) */}
      <div className="max-w-md mx-auto px-4 py-8">
        <TicketCard ticket={currentTicket} variant="detailed" />

        {/* 등록 버튼 */}
        <div className="mt-6">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/home')}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
