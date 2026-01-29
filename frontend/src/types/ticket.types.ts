// 티켓 정보 타입
export interface TicketInfo {
  flight: string; // 항공편명 (예: "KE932")
  gate: string; // 탑승구 (예: "E23")
  seat: string; // 좌석 번호 (예: "40B")
  boarding_time: string; // 탑승 시간 (예: "21:20")
  departure_time: string; // 출발 시간 (예: "22:00")
  origin: string; // 출발지 (예: "ROME")
  destination: string; // 도착지 (예: "INCHEON")
}

// 티켓 스캔 응답 타입
export interface TicketScanResponse {
  flight: string;
  gate: string;
  seat: string;
  boarding_time: string;
  departure_time: string;
  origin: string;
  destination: string;
}

// 티켓 카드 variant 타입
export type TicketCardVariant = 'compact' | 'detailed';
