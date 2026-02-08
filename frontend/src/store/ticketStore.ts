import { create } from 'zustand';
import type { TicketInfo } from '../types/ticket.types';
import { ticketStorage } from '@/services/storage/ticketStorage';

interface TicketState {
  // 상태
  currentTicket: TicketInfo | null; // 현재 등록된 티켓 정보

  // 액션
  setTicket: (ticket: TicketInfo) => void; // 티켓 정보 설정
  clearTicket: () => void; // 티켓 정보 초기화
}

export const useTicketStore = create<TicketState>((set) => ({
  // 초기 상태: localStorage에서 티켓 복원 시도
  currentTicket: ticketStorage.getTicket(),

  // 티켓 정보 설정 + localStorage 저장
  setTicket: (ticket: TicketInfo) => {
    // 전체 티켓 객체를 localStorage에 영구 저장
    ticketStorage.saveTicket(ticket);

    set({ currentTicket: ticket });
  },

  // 티켓 정보 초기화 + localStorage 제거
  clearTicket: () => {
    // localStorage에서 티켓 정보 제거
    ticketStorage.clearTicket();

    set({ currentTicket: null });
  },
}));
