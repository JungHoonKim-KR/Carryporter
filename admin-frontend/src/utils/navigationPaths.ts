// ==============================================================================
// 🗺️ 네비게이션 경로 시스템
// ==============================================================================

export interface PathPoint {
  x: number;
  y: number;
  delay?: number; // 해당 지점에서 대기 시간(초)
}

export interface NavigationPath {
  name: string;
  destination: string;
  waypoints: PathPoint[];
  totalDuration: number; // 예상 소요 시간(초)
}

// Main Station 좌표
export const MAIN_STATION = { x: -80, y: 0 };

// 각 목적지별 좌표 정의
export const DESTINATIONS = {
  'MAIN STATION': { x: -80, y: 0 },
  'STOP-1': { x: 0, y: 50 },
  'STOP-2': { x: 0, y: -50 },
  'GATE-1': { x: 80, y: -50 },
} as const;

// ==============================================================================
// 📍 목적지별 네비게이션 경로 (부드러운 곡선 이동)
// ==============================================================================

export const NAVIGATION_PATHS: Record<string, NavigationPath> = {
  // MAIN STATION → STOP-1
  'MAIN STATION-STOP-1': {
    name: 'MAIN STATION to STOP-1',
    destination: 'STOP-1',
    waypoints: [
      { x: -80, y: 0 },      // 시작: Main Station
      { x: -60, y: 10 },     // 출발 커브
      { x: -40, y: 20 },     // 중간 경로
      { x: -20, y: 30 },     // 접근
      { x: 0, y: 40 },       // 거의 도착
      { x: 0, y: 50 },       // 최종 목적지: STOP-1
    ],
    totalDuration: 30,
  },

  // MAIN STATION → STOP-2
  'MAIN STATION-STOP-2': {
    name: 'MAIN STATION to STOP-2',
    destination: 'STOP-2',
    waypoints: [
      { x: -80, y: 0 },      // 시작: Main Station
      { x: -60, y: -10 },    // 출발 커브
      { x: -40, y: -20 },    // 중간 경로
      { x: -20, y: -30 },    // 접근
      { x: 0, y: -40 },      // 거의 도착
      { x: 0, y: -50 },      // 최종 목적지: STOP-2
    ],
    totalDuration: 30,
  },

  // MAIN STATION → GATE-1
  'MAIN STATION-GATE-1': {
    name: 'MAIN STATION to GATE-1',
    destination: 'GATE-1',
    waypoints: [
      { x: -80, y: 0 },      // 시작: Main Station
      { x: -60, y: -5 },     // 출발
      { x: -40, y: -10 },    // 
      { x: -20, y: -15 },    // 
      { x: 0, y: -20 },      // 중간 지점
      { x: 20, y: -25 },     // 
      { x: 40, y: -30 },     // 
      { x: 60, y: -40 },     // 접근
      { x: 80, y: -50 },     // 최종 목적지: GATE-1
    ],
    totalDuration: 45,
  },

  // STOP-1 → MAIN STATION
  'STOP-1-MAIN STATION': {
    name: 'STOP-1 to MAIN STATION',
    destination: 'MAIN STATION',
    waypoints: [
      { x: 0, y: 50 },       // 시작: STOP-1
      { x: 0, y: 40 },       // 출발
      { x: -20, y: 30 },     // 
      { x: -40, y: 20 },     // 
      { x: -60, y: 10 },     // 접근
      { x: -80, y: 0 },      // 최종: Main Station
    ],
    totalDuration: 30,
  },

  // STOP-2 → MAIN STATION
  'STOP-2-MAIN STATION': {
    name: 'STOP-2 to MAIN STATION',
    destination: 'MAIN STATION',
    waypoints: [
      { x: 0, y: -50 },      // 시작: STOP-2
      { x: 0, y: -40 },      // 출발
      { x: -20, y: -30 },    // 
      { x: -40, y: -20 },    // 
      { x: -60, y: -10 },    // 접근
      { x: -80, y: 0 },      // 최종: Main Station
    ],
    totalDuration: 30,
  },

  // GATE-1 → MAIN STATION
  'GATE-1-MAIN STATION': {
    name: 'GATE-1 to MAIN STATION',
    destination: 'MAIN STATION',
    waypoints: [
      { x: 80, y: -50 },     // 시작: GATE-1
      { x: 60, y: -40 },     // 출발
      { x: 40, y: -30 },     // 
      { x: 20, y: -25 },     // 
      { x: 0, y: -20 },      // 중간
      { x: -20, y: -15 },    // 
      { x: -40, y: -10 },    // 
      { x: -60, y: -5 },     // 접근
      { x: -80, y: 0 },      // 최종: Main Station
    ],
    totalDuration: 45,
  },

  // STOP-1 ↔ STOP-2 경로
  'STOP-1-STOP-2': {
    name: 'STOP-1 to STOP-2',
    destination: 'STOP-2',
    waypoints: [
      { x: 0, y: 50 },
      { x: 0, y: 30 },
      { x: 0, y: 10 },
      { x: 0, y: -10 },
      { x: 0, y: -30 },
      { x: 0, y: -50 },
    ],
    totalDuration: 20,
  },

  'STOP-2-STOP-1': {
    name: 'STOP-2 to STOP-1',
    destination: 'STOP-1',
    waypoints: [
      { x: 0, y: -50 },
      { x: 0, y: -30 },
      { x: 0, y: -10 },
      { x: 0, y: 10 },
      { x: 0, y: 30 },
      { x: 0, y: 50 },
    ],
    totalDuration: 20,
  },

  // STOP-1 ↔ GATE-1 경로
  'STOP-1-GATE-1': {
    name: 'STOP-1 to GATE-1',
    destination: 'GATE-1',
    waypoints: [
      { x: 0, y: 50 },
      { x: 20, y: 30 },
      { x: 40, y: 10 },
      { x: 60, y: -10 },
      { x: 80, y: -30 },
      { x: 80, y: -50 },
    ],
    totalDuration: 35,
  },

  'GATE-1-STOP-1': {
    name: 'GATE-1 to STOP-1',
    destination: 'STOP-1',
    waypoints: [
      { x: 80, y: -50 },
      { x: 80, y: -30 },
      { x: 60, y: -10 },
      { x: 40, y: 10 },
      { x: 20, y: 30 },
      { x: 0, y: 50 },
    ],
    totalDuration: 35,
  },

  // STOP-2 ↔ GATE-1 경로
  'STOP-2-GATE-1': {
    name: 'STOP-2 to GATE-1',
    destination: 'GATE-1',
    waypoints: [
      { x: 0, y: -50 },
      { x: 20, y: -50 },
      { x: 40, y: -50 },
      { x: 60, y: -50 },
      { x: 80, y: -50 },
    ],
    totalDuration: 25,
  },

  'GATE-1-STOP-2': {
    name: 'GATE-1 to STOP-2',
    destination: 'STOP-2',
    waypoints: [
      { x: 80, y: -50 },
      { x: 60, y: -50 },
      { x: 40, y: -50 },
      { x: 20, y: -50 },
      { x: 0, y: -50 },
    ],
    totalDuration: 25,
  },
};

// ==============================================================================
// 🧭 헬퍼 함수
// ==============================================================================

/**
 * 목적지 이름으로 좌표 가져오기
 */
export const getDestinationCoords = (destinationName: string): { x: number; y: number } | null => {
  const normalized = destinationName.toUpperCase().trim();
  
  if (normalized in DESTINATIONS) {
    return DESTINATIONS[normalized as keyof typeof DESTINATIONS];
  }
  
  // 유사한 이름 매칭
  if (normalized.includes('STOP') && normalized.includes('1')) {
    return DESTINATIONS['STOP-1'];
  }
  if (normalized.includes('STOP') && normalized.includes('2')) {
    return DESTINATIONS['STOP-2'];
  }
  if (normalized.includes('GATE')) {
    return DESTINATIONS['GATE-1'];
  }
  if (normalized.includes('MAIN')) {
    return DESTINATIONS['MAIN STATION'];
  }
  
  return null;
};

/**
 * 현재 위치에서 가장 가까운 목적지 찾기
 */
export const findNearestDestination = (x: number, y: number): string => {
  let nearest = 'MAIN STATION';
  let minDistance = Infinity;
  
  Object.entries(DESTINATIONS).forEach(([name, coords]) => {
    const distance = Math.sqrt(Math.pow(coords.x - x, 2) + Math.pow(coords.y - y, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearest = name;
    }
  });
  
  return nearest;
};

/**
 * 두 지점 사이의 경로 가져오기
 */
export const getNavigationPath = (
  fromDestination: string,
  toDestination: string
): NavigationPath | null => {
  const key = `${fromDestination}-${toDestination}`;
  return NAVIGATION_PATHS[key] || null;
};

/**
 * 현재 좌표에서 목적지까지의 경로 가져오기
 */
export const getPathFromCurrentPosition = (
  currentX: number,
  currentY: number,
  destinationName: string
): NavigationPath | null => {
  // 현재 위치에서 가장 가까운 목적지 찾기
  const nearestFrom = findNearestDestination(currentX, currentY);
  
  // 경로 찾기
  return getNavigationPath(nearestFrom, destinationName.toUpperCase());
};

/**
 * Main Station으로 복귀하는 경로 가져오기
 */
export const getReturnPath = (currentX: number, currentY: number): NavigationPath | null => {
  const nearestFrom = findNearestDestination(currentX, currentY);
  
  // 이미 Main Station에 있으면 null 반환
  if (nearestFrom === 'MAIN STATION') {
    return null;
  }
  
  return getNavigationPath(nearestFrom, 'MAIN STATION');
};

/**
 * 직선 경로 생성 (사전 정의된 경로가 없을 때)
 */
export const createDirectPath = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  steps: number = 5
): PathPoint[] => {
  const waypoints: PathPoint[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    waypoints.push({
      x: fromX + (toX - fromX) * t,
      y: fromY + (toY - fromY) * t,
    });
  }
  
  return waypoints;
};
