import { create } from 'zustand';
import type { TicketInfo } from '../types/ticket.types';

interface TicketState {
  // 상태
  currentTicket: TicketInfo | null; // 현재 등록된 티켓 정보
  isScanning: boolean; // 스캔 진행 중 여부

  // 액션
  setTicket: (ticket: TicketInfo) => void; // 티켓 정보 설정
  clearTicket: () => void; // 티켓 정보 초기화
  setScanning: (isScanning: boolean) => void; // 스캔 상태 설정
}

export const useTicketStore = create<TicketState>((set) => ({
  // 초기 상태
  currentTicket: null,
  isScanning: false,

  // 티켓 정보 설정
  setTicket: (ticket: TicketInfo) => {
    set({
      currentTicket: ticket,
      isScanning: false,
    });
  },

  // 티켓 정보 초기화
  clearTicket: () => {
    set({
      currentTicket: null,
    });
  },

  // 스캔 상태 설정
  setScanning: (isScanning: boolean) => {
    set({ isScanning });
  },
}));
