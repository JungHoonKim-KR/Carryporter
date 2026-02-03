import { EventSourcePolyfill } from 'event-source-polyfill';
import type { SSEEventData } from '../types/mission.types';

/**
 * SSE 연결 관리자 (Singleton)
 *
 * 앱 전체에서 단 한 번만 생성되어 SSE 연결을 관리합니다.
 * 컴포넌트 재렌더링과 무관하게 연결을 유지하며,
 * 명시적으로 disconnect()를 호출하기 전까지 연결이 유지됩니다.
 */
export class SSEConnectionManager {
  private static instance: SSEConnectionManager | null = null;
  private eventSource: EventSourcePolyfill | null = null;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 10;
  private readonly heartbeatTimeout: number = 60000; // 60초
  private isConnecting: boolean = false;

  // 콜백 함수들을 저장 (최신 함수를 항상 유지)
  private callbacks: {
    onConnect?: () => void;
    onHeartbeat?: () => void;
    onRobotAssigned?: (data: SSEEventData) => void;
    onMissionStarted?: (data: SSEEventData) => void;
    onRobotArrival?: (data: SSEEventData) => void;
    onAuthSuccess?: (data: SSEEventData) => void;
    onUnlocked?: (data: SSEEventData) => void;
    onAborted?: (data: SSEEventData) => void;
    onLocked?: (data: SSEEventData) => void;
    onError?: (error: Error) => void;
    onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;
  } = {};

  private constructor() {}

  /**
   * 싱글톤 인스턴스 가져오기
   */
  static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  /**
   * 콜백 함수 업데이트
   * 컴포넌트가 재렌더링되어도 최신 콜백을 유지하기 위해 사용
   */
  updateCallbacks(callbacks: {
    onConnect?: () => void;
    onHeartbeat?: () => void;
    onRobotAssigned?: (data: SSEEventData) => void;
    onMissionStarted?: (data: SSEEventData) => void;
    onRobotArrival?: (data: SSEEventData) => void;
    onAuthSuccess?: (data: SSEEventData) => void;
    onUnlocked?: (data: SSEEventData) => void;
    onAborted?: (data: SSEEventData) => void;
    onLocked?: (data: SSEEventData) => void;
    onError?: (error: Error) => void;
    onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;
  }) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * SSE 연결 시작
   */
  connect(token: string) {
    // 이미 연결 중이거나 연결되어 있으면 무시
    if (this.isConnecting || this.eventSource) {
      console.log('[SSE Manager] 이미 연결되어 있거나 연결 중입니다.');
      return;
    }

    if (!token) {
      console.error('[SSE Manager] AccessToken이 없습니다.');
      this.callbacks.onError?.(new Error('AccessToken이 없습니다.'));
      return;
    }

    this.isConnecting = true;
    console.log('[SSE Manager] 연결 시작...');

    const sseUrl = import.meta.env.DEV
      ? '/api/sse/subscribe'
      : `${import.meta.env.VITE_API_BASE_URL}/api/sse/subscribe`;

    try {
      this.eventSource = new EventSourcePolyfill(sseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        heartbeatTimeout: 60000,
      });

      this.setupEventListeners();
      this.isConnecting = false;
    } catch (error) {
      console.error('[SSE Manager] 연결 생성 실패:', error);
      this.isConnecting = false;
      this.handleError(new Error('SSE 연결 생성 실패'));
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners() {
    if (!this.eventSource) return;

    // Connect 이벤트
    this.eventSource.addEventListener('Connect', () => {
      console.log('[SSE Manager] 연결 성공');
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
      this.resetHeartbeat();
    });

    // Heartbeat 이벤트
    this.eventSource.addEventListener('heartbeat', () => {
      console.debug('[SSE Manager] Heartbeat 수신');
      this.callbacks.onHeartbeat?.();
      this.resetHeartbeat();
    });

    // RobotAssignedEvent
    this.eventSource.addEventListener('RobotAssignedEvent', (e: any) => {
      const data: SSEEventData = JSON.parse(e.data);
      console.log('[SSE Manager] Robot Assigned:', data);
      this.callbacks.onRobotAssigned?.(data);
      this.resetHeartbeat();
    });

    // MissionStartedEvent
    this.eventSource.addEventListener('MissionStartedEvent', (e: any) => {
      const data: SSEEventData = JSON.parse(e.data);
      console.log('[SSE Manager] Mission Started:', data);
      this.callbacks.onMissionStarted?.(data);
      this.resetHeartbeat();
    });

    // RobotArrivalEvent
    this.eventSource.addEventListener('RobotArrivalEvent', (e: any) => {
      const data: SSEEventData = JSON.parse(e.data);
      console.log('[SSE Manager] Robot Arrival:', data);
      this.callbacks.onRobotArrival?.(data);
      this.resetHeartbeat();
    });

    // UserAuthSuccessEvent
    this.eventSource.addEventListener('UserAuthSuccessEvent', (e: any) => {
      const data: SSEEventData = JSON.parse(e.data);
      console.log('[SSE Manager] Auth Success:', data);
      this.callbacks.onAuthSuccess?.(data);
      this.resetHeartbeat();
    });

    // MissionUnlockedEvent
    this.eventSource.addEventListener('MissionUnlockedEvent', (e: any) => {
      const data: SSEEventData = JSON.parse(e.data);
      console.log('[SSE Manager] Unlocked:', data);
      this.callbacks.onUnlocked?.(data);
      this.resetHeartbeat();
    });

    // MissionAbortedEvent
    this.eventSource.addEventListener('MissionAbortedEvent', (e: any) => {
      const data: SSEEventData = JSON.parse(e.data);
      console.log('[SSE Manager] Aborted:', data);
      this.callbacks.onAborted?.(data);
      this.resetHeartbeat();
    });

    // MissionLockedEvent
    this.eventSource.addEventListener('MissionLockedEvent', (e: any) => {
      const data: SSEEventData = JSON.parse(e.data);
      console.log('[SSE Manager] Locked:', data);
      this.callbacks.onLocked?.(data);
      this.resetHeartbeat();
    });

    // 에러 처리
    this.eventSource.onerror = (error) => {
      console.error('[SSE Manager] 연결 에러:', error);
      this.handleError(new Error('SSE connection error'));
    };
  }

  /**
   * Heartbeat 타이머 리셋
   */
  private resetHeartbeat() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
    }

    this.heartbeatTimer = setTimeout(() => {
      console.warn('[SSE Manager] Heartbeat 타임아웃 - 60초 동안 이벤트 미수신');
      this.handleError(new Error('Heartbeat timeout'));
    }, this.heartbeatTimeout);
  }

  /**
   * 에러 처리 및 재연결
   */
  private handleError(error: Error) {
    this.callbacks.onError?.(error);
    this.closeConnection();

    // 재연결 시도
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(Math.pow(2, this.reconnectAttempts - 1) * 1000, 60000);

      console.log(
        `[SSE Manager] ${delay}ms 후 재연결... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      this.callbacks.onReconnectAttempt?.(this.reconnectAttempts, this.maxReconnectAttempts);

      this.reconnectTimer = setTimeout(() => {
        // 재연결 시 토큰을 다시 가져와야 하므로 외부에서 connect를 다시 호출하도록 콜백 사용
        this.callbacks.onError?.(new Error('RECONNECT_NEEDED'));
      }, delay);
    } else {
      console.error('[SSE Manager] 최대 재연결 횟수 초과');
      this.callbacks.onError?.(new Error('최대 재연결 횟수 초과'));
    }
  }

  /**
   * 연결 종료 (타이머 정리 포함)
   */
  private closeConnection() {
    if (this.eventSource) {
      console.log('[SSE Manager] 연결 종료');
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.isConnecting = false;
  }

  /**
   * 명시적으로 연결 종료 (로그아웃 시 사용)
   */
  disconnect() {
    // 연결된 적이 없으면 로그 출력하지 않음
    if (!this.eventSource && !this.reconnectTimer && !this.heartbeatTimer) {
      return;
    }

    console.log('[SSE Manager] 명시적 연결 종료');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.closeConnection();
    this.reconnectAttempts = 0;
    this.callbacks = {};
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSourcePolyfill.OPEN;
  }

  /**
   * 재연결 횟수 리셋
   */
  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }

  /**
   * 현재 재연결 횟수 가져오기
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}