import { formatCityName, formatTime } from '../../utils/imageUtils';
import type { TicketInfo, TicketCardVariant } from '../../types/ticket.types';

interface TicketCardProps {
  ticket: TicketInfo;
  variant?: TicketCardVariant; // 'compact' (메인 화면) 또는 'detailed' (상세 화면)
  onClick?: () => void;
}

const TicketCard = ({ ticket, variant = 'compact', onClick }: TicketCardProps) => {
  const isCompact = variant === 'compact';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${onClick ? 'cursor-pointer' : ''} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
      onClick={onClick}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0064FF] via-[#3B8CFF] to-[#4DA3FF]" />

      {/* 장식용 원형 */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/10 rounded-full blur-xl" />

      {/* 카드 컨텐츠 */}
      <div className="relative p-6 text-white">
        {/* 상단: 항공사 로고 + 편명/게이트 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* 항공사 로고 (KOREAN) */}
            <div className="bg-white rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <div className="w-5 h-5 bg-[#0064FF] rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">K</span>
              </div>
              <span className="text-[#0064FF] font-bold text-sm tracking-tight">KOREAN</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div>
                <span className="text-xs opacity-70">Flight</span>
                <span className="ml-2 font-semibold text-white">{ticket.flight}</span>
              </div>
              <div>
                <span className="text-xs opacity-70">Gate</span>
                <span className="ml-2 font-semibold text-white">{ticket.gate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 중앙: 출발지 → 도착지 */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="text-4xl font-bold tracking-tight mb-1">
              {formatCityName(ticket.origin)}
            </div>
            <div className="text-sm text-white/70">출발</div>
          </div>

          {/* 비행기 아이콘과 점선 */}
          <div className="flex-1 px-4 flex items-center justify-center">
            <div className="flex items-center w-full">
              <div className="flex-1 border-t-2 border-dashed border-white/40" />
              <div className="mx-3 relative">
                {/* 비행기 아이콘 */}
                <svg className="w-6 h-6 text-white transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-white/40" />
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="text-4xl font-bold tracking-tight mb-1">
              {formatCityName(ticket.destination)}
            </div>
            <div className="text-sm text-white/70">도착</div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-white/20 my-4" />

        {/* 하단: 시간 정보 */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-white/60 mb-1">Boarding</div>
            <div className="text-lg font-semibold">{formatTime(ticket.boarding_time)}</div>
          </div>

          <div>
            <div className="text-xs text-white/60 mb-1">Departs</div>
            <div className="text-lg font-semibold">{formatTime(ticket.departure_time)}</div>
          </div>

          {!isCompact && (
            <div className="text-right">
              <div className="text-xs text-white/60 mb-1">Seat</div>
              <div className="text-lg font-semibold">{ticket.seat}</div>
            </div>
          )}
        </div>

        {/* compact일 때 탭 힌트 */}
        {isCompact && onClick && (
          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <span className="text-sm text-white/60 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              탭하여 자세히 보기
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
