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

  // 티켓 정보 설정 + ticketId localStorage 저장
  setTicket: (ticket: TicketInfo) => {
    // ticketId를 localStorage에 영구 저장
    if (ticket.ticketId) {
      localStorage.setItem('ticketId', String(ticket.ticketId));
    }

    set({
      currentTicket: ticket,
      isScanning: false,
    });
  },

  // 티켓 정보 초기화 + ticketId localStorage 제거
  clearTicket: () => {
    // localStorage에서 ticketId 제거
    localStorage.removeItem('ticketId');

    set({
      currentTicket: null,
    });
  },

  // 스캔 상태 설정
  setScanning: (isScanning: boolean) => {
    set({ isScanning });
  },
}));
