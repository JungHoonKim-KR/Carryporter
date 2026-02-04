// 구역 이름별 목표 좌표 (RobotStage에서 사용하는 10으로 나누기 전 기준값)
export const ZONE_COORDINATES: Record<string, { x: number; y: number }> = {
  'GATE A': { x: -80, y: 40 },  // 3D상 (-8, 4)
  'GATE B': { x: 80, y: 40 },   // 3D상 (8, 4)
  'MAIN STATION': { x: 0, y: -50 }, // 3D상 (0, -5)
  // 추가 구역...
};