import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { createMission } from '../api/mission.api
import { createMission } from '../api/mission.api.mock'; // 🔧 Mock API 사용 (백엔드 없이 테스트용)
import { useAuthStore } from '../store/authStore';
import { useMissionStore } from '../store/missionStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Location } from '../types/mission.types';

// 정류장 데이터 (공항 출국장)
const stations: Location[] = [
  { id: 1, name: "1번 정류장", code: "STATION_1", type: "station", icon: "🚉" },
  { id: 2, name: "2번 정류장", code: "STATION_2", type: "station", icon: "🚉" },
  { id: 3, name: "3번 정류장", code: "STATION_3", type: "station", icon: "🚉" },
  { id: 4, name: "4번 정류장", code: "STATION_4", type: "station", icon: "🚉" },
  { id: 5, name: "5번 정류장", code: "STATION_5", type: "station", icon: "🚉" },
  { id: 6, name: "6번 정류장", code: "STATION_6", type: "station", icon: "🚉" },
];

// 탑승구 데이터 (공항 탑승 게이트)
const boardingGates: Location[] = [
  { id: 7, name: "탑승구 1", code: "GATE_1", type: "gate", icon: "🚪" },
  { id: 8, name: "탑승구 2", code: "GATE_2", type: "gate", icon: "🚪" },
  { id: 9, name: "탑승구 3", code: "GATE_3", type: "gate", icon: "🚪" },
  { id: 10, name: "탑승구 4", code: "GATE_4", type: "gate", icon: "🚪" },
  { id: 11, name: "탑승구 5", code: "GATE_5", type: "gate", icon: "🚪" },
  { id: 12, name: "탑승구 6", code: "GATE_6", type: "gate", icon: "🚪" },
];

// 중앙 사물함 (고정 도착지)
const CENTRAL_LOCKER_ID = 999;

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

      const response = await createMission({
        userId: Number(user.id),
        startLocationId: locationId,
        endLocationId: CENTRAL_LOCKER_ID, // 자동으로 중앙 사물함
      });

      // 미션 생성 성공 → 스토어에 저장
      setCurrentMission({
        id: response.missionId.toString(),
        userId: Number(user.id),
        startLocationId: locationId,
        endLocationId: CENTRAL_LOCKER_ID,
        status: 'REQUESTED',
        destination: selectedLocation?.name, // 목적지 이름 저장
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

  // 선택된 위치 찾기
  const selectedLocation = [...stations, ...boardingGates].find(l => l.id === locationId);

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
          <div className="bg-white rounded-2xl p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <h3 className="text-gray-900 font-bold text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-toss-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              픽업 위치
            </h3>

            <Tabs defaultValue="station" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="station">정류장</TabsTrigger>
                <TabsTrigger value="gate">탑승구</TabsTrigger>
              </TabsList>

              {/* 정류장 탭 */}
              <TabsContent value="station" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {stations.map((station) => (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => {
                        setLocationId(station.id);
                        setError('');
                      }}
                      className={`p-4 rounded-xl transition-all ${locationId === station.id
                          ? 'bg-toss-blue-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      <div className="text-3xl mb-2">{station.icon}</div>
                      <p className="text-sm font-semibold">{station.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* 탑승구 탭 */}
              <TabsContent value="gate" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {boardingGates.map((gate) => (
                    <button
                      key={gate.id}
                      type="button"
                      onClick={() => {
                        setLocationId(gate.id);
                        setError('');
                      }}
                      className={`p-4 rounded-xl transition-all ${locationId === gate.id
                          ? 'bg-toss-blue-500 text-white shadow-md'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      <div className="text-3xl mb-2">{gate.icon}</div>
                      <p className="text-sm font-semibold">{gate.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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
