import type {
  CreateMissionRequest,
  CreateMissionResponse,
  MissionStatusEvent,
  MissionStatus,
} from '../types/mission.types';

// 개발 전용 Mock API (백엔드 없이 테스트용)

const MOCK_DELAY = 1000; // 1초 지연 (실제 API처럼)

// Mock 비밀번호 저장 키
const MOCK_PASSWORD_KEY = 'mock_user_password';

// Mock 비밀번호 저장 (로그인 시 호출)
export const setMockPassword = (password: number): void => {
  localStorage.setItem(MOCK_PASSWORD_KEY, password.toString());
  if (import.meta.env.DEV) console.log('[MOCK] 비밀번호 저장됨:', password);
};

// Mock 비밀번호 조회
export const getMockPassword = (): number | null => {
  const stored = localStorage.getItem(MOCK_PASSWORD_KEY);
  return stored ? parseInt(stored, 10) : null;
};

// 1. 미션 생성 Mock
export const createMission = async (
  data: CreateMissionRequest
): Promise<CreateMissionResponse> => {
  if (import.meta.env.DEV) console.log('[MOCK] createMission 호출:', data);

  // 1초 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  // 성공 응답 반환
  const mockResponse: CreateMissionResponse = {
    missionId: Math.floor(Math.random() * 10000),
  };

  if (import.meta.env.DEV) console.log('[MOCK] createMission 응답:', mockResponse);
  return mockResponse;
};

// 2. SSE Mock (타이머로 상태 변경 시뮬레이션)
export const subscribeMissionUpdates = (
  missionId: string,
  callbacks: {
    onConnect?: () => void;
    onStatus?: (status: MissionStatusEvent) => void;
    onError?: (error: Error) => void;
  }
): (() => void) => {
  if (import.meta.env.DEV) console.log('[MOCK] SSE 연결 시작:', missionId);

  // 연결 성공 콜백
  setTimeout(() => {
    callbacks.onConnect?.();
  }, 500);

  // 상태 변경 시뮬레이션 (천천히 진행 - 각 단계 확인 가능)
  const statusSequence: MissionStatus[] = [
    'REQUESTED',  // 0초 - 로봇 배정 중
    'ASSIGNED',   // 3초 - 로봇 배정 완료
    'MOVING',     // 8초 - 카트 이동 중
    'ARRIVED',    // 15초 - 도착 (인증 필요)
    'UNLOCKED',   // 20초 - 인증 완료, 짐 적재 대기
    'LOCKED',     // 25초 - 짐 적재 완료, 무게 측정
    'RETURNING',  // 35초 - 보관함으로 이동 중
    'RETURNED',   // 45초 - 보관 완료
    'FINISHED',   // 55초 - 미션 종료
  ];

  const delays = [0, 3000, 8000, 15000, 20000, 25000, 35000, 45000, 55000];

  const timeouts: ReturnType<typeof setTimeout>[] = [];

  statusSequence.forEach((status, index) => {
    const timeout = setTimeout(() => {
      if (import.meta.env.DEV) console.log(`[MOCK] 상태 변경: ${status}`);
      callbacks.onStatus?.({
        missionId,
        status,
        robotCode: status === 'ASSIGNED' ? 'ROBOT-001' : undefined,
        timestamp: new Date().toISOString(),
      });
    }, delays[index]);

    timeouts.push(timeout);
  });

  // Cleanup 함수 (SSE 연결 종료)
  return () => {
    if (import.meta.env.DEV) console.log('[MOCK] SSE 연결 종료');
    timeouts.forEach((timeout) => clearTimeout(timeout));
  };
};

// 3. 인증 Mock - 저장된 비밀번호와 비교
export const verifyMission = async (
  missionId: string,
  password: number
): Promise<void> => {
  if (import.meta.env.DEV) console.log('[MOCK] verifyMission 호출:', { missionId, password });

  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  // 비밀번호 길이 검증
  if (password.toString().length !== 4) {
    throw new Error('비밀번호는 4자리여야 합니다.');
  }

  // 저장된 비밀번호와 비교
  const storedPassword = getMockPassword();
  if (import.meta.env.DEV) console.log('[MOCK] 저장된 비밀번호:', storedPassword, '입력된 비밀번호:', password);

  if (storedPassword === null) {
    console.warn('[MOCK] 저장된 비밀번호 없음, 테스트 모드로 통과');
    return;
  }

  if (storedPassword !== password) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  if (import.meta.env.DEV) console.log('[MOCK] verifyMission 성공');
};

