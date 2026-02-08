import { useTicketStore } from '@/store/ticketStore';

/**
 * 티켓 데이터 훅
 *
 * localStorage에서 티켓 정보를 즉시 복원합니다.
 * ticketStore 초기화 시 자동으로 localStorage에서 로드되므로
 * API 호출이 필요 없습니다.
 *
 * @returns {currentTicket, isLoading} 티켓 정보와 로딩 상태
 */
export const useTicketData = () => {
  const { currentTicket } = useTicketStore();

  // localStorage에서 즉시 로드되므로 isLoading은 항상 false
  return { currentTicket, isLoading: false };
};
