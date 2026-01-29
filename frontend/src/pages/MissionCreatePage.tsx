import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { createMission } from '../api/mission.api
import { createMission } from '../api/mission.api.mock'; // 🔧 Mock API 사용 (백엔드 없이 테스트용)
import { useAuthStore } from '../store/authStore';
import { useMissionStore } from '../store/missionStore';
import { Button } from '@/components/ui/button';
import type { Location } from '../types/mission.types';

// 정류장 데이터 (공항 출국장 중앙 라인)
const stations: Location[] = [
  { id: 1, name: "Station 1", code: "STATION_1", icon: "🚉", description: "1번 정류장" },
  { id: 2, name: "Station 2", code: "STATION_2", icon: "🚉", description: "2번 정류장" },
  { id: 3, name: "Station 3", code: "STATION_3", icon: "🚉", description: "3번 정류장" },
  { id: 4, name: "Station 4", code: "STATION_4", icon: "🚉", description: "4번 정류장" },
  { id: 5, name: "Station 5", code: "STATION_5", icon: "🚉", description: "5번 정류장" },
  { id: 6, name: "Station 6", code: "STATION_6", icon: "🚉", description: "6번 정류장" },
];

// 중앙 사물함 (고정 도착지)
const CENTRAL_LOCKER_ID = 999;

const MissionCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCurrentMission, setCreating } = useMissionStore();

  const [stationId, setStationId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('사용자 정보가 없습니다.');
      return;
    }

    if (!stationId) {
      setError('정류장을 선택해주세요.');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const response = await createMission({
        userId: Number(user.id),
        startLocationId: stationId,
        endLocationId: CENTRAL_LOCKER_ID, // 자동으로 중앙 사물함
      });

      // 미션 생성 성공 → 스토어에 저장
      setCurrentMission({
        id: response.missionId.toString(),
        userId: Number(user.id),
        startLocationId: stationId,
        endLocationId: CENTRAL_LOCKER_ID,
        status: 'REQUESTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 미션 추적 페이지로 이동
      navigate('/mission/track');
    } catch (err) {
      console.error('미션 생성 실패:', err);
      setError('미션 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setCreating(false);
    }
  };

  const selectedStation = stations.find(s => s.id === stationId);

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-[#F5F7FA] via-[#E8EDF2] to-[#D4DCE5]">
      {/* iOS 스타일 헤더 */}
      <header className="pt-safe px-6 py-4">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-6 touch-feedback"
        >
          <div className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-xl shadow-sm flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>

        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">로봇 호출</h1>
          <p className="text-gray-500 text-sm">
            가까운 정류장을 선택하세요
          </p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 정류장 선택 섹션 */}
          <section className="animate-fade-in-up">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0064FF] to-[#4DA3FF] shadow-lg shadow-blue-500/25 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">정류장 선택</h2>
                <p className="text-xs text-gray-500">로봇이 픽업하러 갈 위치</p>
              </div>
            </div>

            {/* iOS 스타일 정류장 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              {stations.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => {
                    setStationId(station.id);
                    setError('');
                  }}
                  className={`group relative p-5 rounded-3xl transition-all duration-300 touch-feedback ${
                    stationId === station.id
                      ? 'bg-white shadow-xl shadow-blue-500/20 scale-[1.02]'
                      : 'bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.01]'
                  }`}
                >
                  {/* 선택 인디케이터 */}
                  {stationId === station.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-[#0064FF] to-[#4DA3FF] shadow-lg shadow-blue-500/40 flex items-center justify-center animate-fade-in-scale">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {station.icon}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${
                    stationId === station.id ? 'text-[#0064FF]' : 'text-gray-900'
                  }`}>
                    {station.name}
                  </h3>
                  <p className="text-gray-500 text-xs">{station.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-2xl p-4 animate-fade-in-scale">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* 선택 요약 (iOS 스타일 카드) */}
          {selectedStation && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg animate-fade-in-scale">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">선택한 정류장</p>
                  <p className="text-lg font-bold text-gray-900">{selectedStation.name}</p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">픽업 위치</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedStation.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">보관 위치</span>
                  <span className="text-sm font-semibold text-gray-900">중앙 사물함</span>
                </div>
              </div>
            </div>
          )}

          {/* iOS 스타일 호출 버튼 */}
          <Button
            type="submit"
            disabled={!stationId}
            className="w-full h-16 text-lg font-semibold rounded-3xl transition-all duration-300 shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#0064FF] to-[#4DA3FF] hover:shadow-xl hover:shadow-blue-500/30"
          >
            {!stationId ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                정류장을 선택해주세요
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
