export interface Location {
  id: number;
  name: string; // "Gate A", "Locker Zone 1"
  code: string; // "GATE_A", "LOCKER_1"
  description?: string;
  icon?: string; // "🚪", "🔒"
}

// 미션 타입 (보관 또는 반납)
export type MissionType = 'STORAGE' | 'RETURN';

// 보관된 짐 정보
export interface StoredLuggage {
  id: string;
  missionId: string;
  lockerId: string;
  lockerName: string;
  weight: number; // kg
  storedAt: string; // ISO 날짜
  robotCode?: string;
}

// 미션 상태
export type MissionStatus =
  | 'REQUESTED'   // 요청됨
  | 'ASSIGNED'    // 로봇 배정
  | 'MOVING'      // 이동 중 (사용자에게)
  | 'ARRIVED'     // 도착
  | 'UNLOCKED'    // 잠금 해제
  | 'LOCKED'      // 잠금 (짐 넣기 완료)
  | 'RETURNING'   // 복귀 중 (로커로)
  | 'RETURNED'    // 복귀 완료
  | 'FINISHED';   // 완료

// 미션 생성 요청
export interface CreateMissionRequest {
  userId: number;
  startLocationId: number;
  endLocationId: number;
}

export interface CreateMissionResponse {
  missionId: number;
}

// 미션 엔티티
export interface Mission {
  id: string;
  userId: number;
  startLocationId: number;
  endLocationId: number;
  status: MissionStatus;
  missionType?: MissionType; // 보관 또는 반납
  robotCode?: string;
  lockerInfo?: {
    lockerId: string; // "A-127"
    lockerName: string; // "Locker A-127"
  };
  weightInfo?: {
    initialWeight: number; // 3.7 (카트 무게)
    finalWeight: number; // 18.0 (짐 포함)
    luggageWeight: number; // 14.3 (실제 짐 무게)
  };
  // 반납 시 참조하는 보관 정보
  storedLuggageId?: string;
  createdAt: string;
  updatedAt: string;
}

// SSE 이벤트
export interface MissionStatusEvent {
  missionId: string;
  status: MissionStatus;
  robotCode?: string;
  timestamp: string;
}

// 비밀번호 인증
export interface VerifyMissionRequest {
  password: number; // 4자리 (예: 1234)
}
