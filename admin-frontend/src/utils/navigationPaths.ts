// ==============================================================================
// 🗺️ 사각형 네비게이션 경로 시스템 (반시계 방향 & 직각 이동)
// ==============================================================================

export interface PathPoint {
  x: number;
  y: number;
  delay?: number;
}

export interface NavigationPath {
  name: string;
  destination: string;
  waypoints: PathPoint[];
  totalDuration: number;
}

// ==============================================================================
// 📍 사각형 배치 좌표 (Main Station = 오른쪽 위)
// 3D 좌표계: x는 좌우, y(z)는 상하 (-가 위쪽, +가 아래쪽)
// ==============================================================================
export const DESTINATIONS = {
  'MAIN STATION': { x: 80, y: -50 },   // 오른쪽 위 (우상)
  'STOP2': { x: -80, y: -50 },         // 왼쪽 위 (좌상)
  'STOP1': { x: -80, y: 50 },          // 왼쪽 아래 (좌하)
  'GATE': { x: 80, y: 50 },            // 오른쪽 아래 (우하)
} as const;

// 🔄 반시계 방향(CCW) 순서 정의 (무조건 이 순서로만 순환)
const CCW_ORDER: (keyof typeof DESTINATIONS)[] = [
  'MAIN STATION',
  'STOP2',
  'STOP1',
  'GATE'
];

/**
 * 두 좌표 사이를 직선으로 잇는 점들을 생성 (보간)
 */
const interpolatePoints = (start: PathPoint, end: PathPoint, steps: number): PathPoint[] => {
  const points: PathPoint[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t
    });
  }
  return points;
};

/**
 * 반시계 방향으로 모서리를 타고 이동하는 경로 생성 (대각선 이동 절대 없음)
 */
const createRectangularPath = (
  fromName: keyof typeof DESTINATIONS,
  toName: keyof typeof DESTINATIONS,
  stepsPerEdge: number = 60 // 부드러운 이동을 위한 스텝 수
): PathPoint[] => {
  let waypoints: PathPoint[] = [];
  const startPos = DESTINATIONS[fromName];
  waypoints.push(startPos); // 시작점

  // 현재 출발지의 인덱스 찾기
  let currentIndex = CCW_ORDER.indexOf(fromName);
  
  // 목표 지점에 도달할 때까지 반시계 방향으로 다음 정거장을 하나씩 거쳐감
  // 예: Main -> Stop1로 가려면: Main -> Stop2 -> Stop1 순서로 점을 찍음
  while (CCW_ORDER[currentIndex] !== toName) {
    const fromStop = CCW_ORDER[currentIndex];
    
    // 다음 인덱스 (순환)
    currentIndex = (currentIndex + 1) % CCW_ORDER.length;
    const toStop = CCW_ORDER[currentIndex];

    // 현재 정거장에서 다음 정거장까지 직선 경로 생성
    const smoothSegment = interpolatePoints(
      DESTINATIONS[fromStop],
      DESTINATIONS[toStop],
      stepsPerEdge
    );
    
    waypoints = [...waypoints, ...smoothSegment];
  }

  return waypoints;
};

// ==============================================================================
// 📍 경로 자동 생성 및 헬퍼 함수
// ==============================================================================

export const NAVIGATION_PATHS: Record<string, NavigationPath> = {};

const destinationKeys = Object.keys(DESTINATIONS) as Array<keyof typeof DESTINATIONS>;

// 모든 가능한 출발-도착 조합에 대해 경로 미리 계산
destinationKeys.forEach(from => {
  destinationKeys.forEach(to => {
    if (from !== to) {
      const key = `${from}-${to}`;
      const waypoints = createRectangularPath(from, to);
      
      NAVIGATION_PATHS[key] = {
        name: `${from} to ${to}`,
        destination: to,
        waypoints: waypoints,
        totalDuration: (waypoints.length / 60) * 3, 
      };
    }
  });
});

/**
 * 현재 위치(좌표)에서 가장 가까운 정거장 이름 찾기
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
 * 두 지점 이름으로 경로 데이터 가져오기
 */
export const getNavigationPath = (
  fromDestination: string,
  toDestination: string
): NavigationPath | null => {
  const key = `${fromDestination.toUpperCase()}-${toDestination.toUpperCase()}`;
  return NAVIGATION_PATHS[key] || null;
};