// hooks/useRobotFetch.ts
// 백엔드 API로 로봇 목록을 조회하는 커스턴 훅
// GET /robots          → 전체 목록 조회
// GET /robots/{id}     → 단건 조회 (필요시)

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
// 백엔드 RobotResponseDto와 동일한 타입
// robotStatus는 백엔드 enum 문자열 그대로 받음
// ─────────────────────────────────────────────
export interface RobotApiResponse {
  id: number;
  robotCode: string;
  macAddress: string;
  robotStatus: string; // 백엔드 RobotStatus enum 값 (예: "AVAILABLE", "WORKING" 등)
}

// ─────────────────────────────────────────────
// 프론트엔드에서 사용하는 통일 타입
// 기존 SSE robots 객체와 같은 구조로 맞춤
// ─────────────────────────────────────────────
export interface RobotItem {
  id: number;
  robotCode: string;
  macAddress: string;
  status: 'available' | 'working' | 'error' | 'offline';
  // SSE에서 추가로 올 수 있는 필드
  x?: number;
  y?: number;
  currentTask?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ─────────────────────────────────────────────
// 백엔드 RobotStatus (대문자) → 프론트 status (소문자) 매핑
// 백엔드에 새 status가 추가되면 여기에도 추가
// ─────────────────────────────────────────────
function mapStatus(backendStatus: string): RobotItem['status'] {
  switch (backendStatus?.toUpperCase()) {
    case 'AVAILABLE': return 'available';
    case 'WORKING':   return 'working';
    case 'ERROR':     return 'error';
    case 'OFFLINE':   return 'offline';
    default:          return 'offline';
  }
}

// ─────────────────────────────────────────────
// API 호출 함수들 (훅 밖으로 분리 → 다른 곳에서도 재사용 가능)
// ─────────────────────────────────────────────

// 전체 목록: GET /robots
export async function fetchAllRobots(): Promise<RobotApiResponse[]> {
  const res = await fetch(`${API_BASE}/robots`);
  if (!res.ok) throw new Error(`전체 로봇 조회 실패 (${res.status})`);
  return res.json();
}

// 단건 조회: GET /robots/{robotId}
export async function fetchRobotById(robotId: number): Promise<RobotApiResponse> {
  const res = await fetch(`${API_BASE}/robots/${robotId}`);
  if (!res.ok) throw new Error(`로봇 ${robotId} 조회 실패 (${res.status})`);
  return res.json();
}

// ─────────────────────────────────────────────
// 커스턴 훅: useRobotFetch
// 마운트 시 자동으로 전체 로봇 목록을 가져옴
// ─────────────────────────────────────────────
export function useRobotFetch() {
  const [robots, setRobots]     = useState<RobotItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiRobots = await fetchAllRobots();

      // 백엔드 응답 → 프론트엔드 통일 타입으로 변환
      const mapped: RobotItem[] = apiRobots.map((r) => ({
        id:          r.id,
        robotCode:   r.robotCode,
        macAddress:  r.macAddress,
        status:      mapStatus(r.robotStatus),
      }));

      setRobots(mapped);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      console.error('❌ useRobotFetch 에러:', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { robots, loading, error, refetch: load };
}