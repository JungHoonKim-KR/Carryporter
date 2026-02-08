import type { TicketInfo } from '@/types/ticket.types';

const TICKET_KEY = 'ticket';
const LEGACY_TICKET_ID_KEY = 'ticketId'; // 구버전 호환용

/**
 * 타입 가드: TicketInfo 타입 검증
 */
function isTicketInfo(data: any): data is TicketInfo {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.flight === 'string' &&
    typeof data.gate === 'string' &&
    typeof data.seat === 'string' &&
    typeof data.boardingTime === 'string' &&
    typeof data.departureTime === 'string' &&
    typeof data.origin === 'string' &&
    typeof data.destination === 'string'
  );
}

export const ticketStorage = {
  /**
   * 전체 티켓 정보 저장 (localStorage)
   */
  saveTicket: (ticket: TicketInfo): void => {
    try {
      localStorage.setItem(TICKET_KEY, JSON.stringify(ticket));
      // 구버전 호환: ticketId가 있으면 별도 저장
      if (ticket.ticketId) {
        localStorage.setItem(LEGACY_TICKET_ID_KEY, String(ticket.ticketId));
      }
    } catch (error: any) {
      // localStorage 용량 초과 시 기존 데이터 삭제 후 재시도
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage 용량 초과, 기존 티켓 데이터 삭제 후 재시도');
        localStorage.removeItem(TICKET_KEY);
        localStorage.setItem(TICKET_KEY, JSON.stringify(ticket));
      } else {
        console.error('티켓 저장 실패:', error);
      }
    }
  },

  /**
   * 티켓 정보 조회 (localStorage)
   */
  getTicket: (): TicketInfo | null => {
    try {
      const item = localStorage.getItem(TICKET_KEY);
      if (!item) return null;

      const parsed = JSON.parse(item);

      // 타입 검증: 손상된 데이터 자동 정리
      if (!isTicketInfo(parsed)) {
        console.warn('손상된 티켓 데이터 감지, 자동 삭제');
        ticketStorage.clearTicket();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('티켓 조회 실패:', error);
      // JSON 파싱 에러 시 손상된 데이터 삭제
      ticketStorage.clearTicket();
      return null;
    }
  },

  /**
   * 티켓 정보 삭제
   */
  clearTicket: (): void => {
    localStorage.removeItem(TICKET_KEY);
    localStorage.removeItem(LEGACY_TICKET_ID_KEY); // 구버전 데이터도 삭제
  },

  // === 구버전 호환 메서드 (Deprecated) ===

  /**
   * @deprecated saveTicket() 사용 권장
   */
  saveTicketId: (ticketId: number): void => {
    localStorage.setItem(LEGACY_TICKET_ID_KEY, String(ticketId));
  },

  /**
   * @deprecated getTicket() 사용 권장
   */
  getTicketId: (): number | null => {
    const id = localStorage.getItem(LEGACY_TICKET_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  /**
   * @deprecated clearTicket() 사용 권장
   */
  clearTicketId: (): void => {
    localStorage.removeItem(LEGACY_TICKET_ID_KEY);
  },
};
