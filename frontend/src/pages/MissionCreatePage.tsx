import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMission } from '../api/mission.api'; // ✅ 실제 API 사용
import { useAuthStore } from '../store/authStore';
import { useMissionStore } from '../store/missionStore';
import { Button } from '@/components/ui/button';
// import { PageHeader } from '@/components/common/PageHeader'; // TODO: Phase 2.2에서 적용
import { LocationSelector } from '@/components/mission/LocationSelector';
import { STATIONS, BOARDING_GATES, ALL_LOCATIONS } from '../constants/locations';

// 중앙 사물함 (고정 도착지)
// const CENTRAL_LOCKER_ID = 999; // 미사용

const MissionCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCurrentMission, setCreating } = useMissionStore();

  const [locationId, setLocationId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('사용자 정보가 없습니다.');
      return;
    }

    if (!locationId) {
      setError('정류장 또는 탑승구를 선택해주세요.');
      return;
    }

    try {
      setCreating(true);
      setError('');

      // 백엔드는 callLocationId만 필요 (userId는 JWT에서 자동 추출)
      const response = await createMission({
        callLocationId: locationId,
      });

      // 🔍 디버깅: 백엔드 응답 확인
      if (import.meta.env.DEV) {
        console.log('[MissionCreate] 백엔드 응답:', response);
        console.log('[MissionCreate] missionId:', response.missionId);
      }

      // 응답 검증
      if (!response || !response.missionId) {
        throw new Error('백엔드 응답에 missionId가 없습니다. 응답: ' + JSON.stringify(response));
      }

      // 미션 생성 성공 → 스토어에 저장
      setCurrentMission({
        id: response.missionId.toString(),
        userId: 0, // JWT에서 추출되므로 임시값
        startLocation: locationId, // 호출 위치 = 시작 위치
        endLocation: 0, // 목적지는 SSE로 받음 (임시값)
        status: 'REQUESTED',
        destination: selectedLocation?.name, // 목적지 이름 저장
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 미션 추적 페이지로 이동
      navigate('/mission/track');
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('미션 생성 실패:', err);
        console.error('에러 응답:', err.response?.data);
        console.error('에러 상태:', err.response?.status);
      }
      setError('미션 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setCreating(false);
    }
  };

  // 선택된 위치 찾기
  const selectedLocation = ALL_LOCATIONS.find(l => l.id === locationId);

  // LocationSelector에 전달할 데이터
  const handleLocationSelect = (id: number) => {
    setLocationId(id);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gray-50 pt-safe">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="CARRY PORTER Logo"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-gray-900 text-lg font-bold font-['Beckman',sans-serif]">CARRY PORTER</h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto px-6 py-6">
        {/* 제목 */}
        <div className="mb-6 animate-fade-in-up">
          <h2 className="text-gray-900 text-2xl font-bold mb-1">
            로봇 호출 🤖
          </h2>
          <p className="text-gray-600 text-sm">
            가까운 정류장이나 탑승구를 선택하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 정류장/탑승구 선택 카드 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm animate-fade-in-up">
            <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              픽업 위치
            </h3>

            <LocationSelector
              locations={{
                stations: STATIONS,
                gates: BOARDING_GATES,
              }}
              selectedLocationId={locationId}
              onSelect={handleLocationSelect}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in-up">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* 선택 요약 */}
          {selectedLocation && (
            <div className="bg-white rounded-2xl p-5 shadow-sm animate-fade-in-up">
              <h3 className="text-gray-900 font-bold text-base mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                선택 요약
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <span className="text-sm text-gray-600">픽업 위치</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedLocation.name}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <span className="text-sm text-gray-600">보관 위치</span>
                  <span className="text-sm font-semibold text-gray-900">중앙 사물함</span>
                </div>
              </div>
            </div>
          )}

          {/* 호출 버튼 */}
          <Button
            type="submit"
            disabled={!locationId}
            className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white disabled:opacity-40"
          >
            {!locationId ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                위치를 선택해주세요
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                로봇 호출하기
              </span>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default MissionCreatePage;
