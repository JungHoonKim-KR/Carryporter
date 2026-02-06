import type { Mission } from '@/types/mission.types';

const MISSION_KEY = 'currentMission';

export const missionStorage = {
  /**
   * 미션 저장
   */
  saveMission: (mission: Mission): void => {
    localStorage.setItem(MISSION_KEY, JSON.stringify(mission));
  },

  /**
   * 미션 조회
   */
  getMission: (): Mission | null => {
    const data = localStorage.getItem(MISSION_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('미션 데이터 파싱 실패:', error);
      return null;
    }
  },

  /**
   * 미션 삭제
   */
  clearMission: (): void => {
    localStorage.removeItem(MISSION_KEY);
  },
};
