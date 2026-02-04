import { useNavigate } from 'react-router-dom';
import { useMissionStore } from '../store/missionStore';
import { Button } from '@/components/ui/button';

/**
 * 내 짐 목록 페이지
 * storedLuggages 목록 표시 (읽기 전용)
 */
const LuggageListPage = () => {
  const navigate = useNavigate();
  const { storedLuggages } = useMissionStore();

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
            내 짐 목록 📦
          </h2>
          <p className="text-gray-600 text-sm">
            보관 중인 짐을 확인하세요
          </p>
        </div>

        {/* 짐 목록 */}
        {storedLuggages.length === 0 ? (
          // 빈 상태
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-gray-900 text-lg font-bold mb-2">
              보관 중인 짐이 없습니다
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              로봇을 호출하여 짐을 보관하세요
            </p>
            <Button
              onClick={() => navigate('/mission/create')}
              className="bg-toss-blue-500 hover:bg-toss-blue-600 text-white"
            >
              로봇 호출하기
            </Button>
          </div>
        ) : (
          // 짐 목록 카드
          <div className="space-y-4">
            {storedLuggages.map((luggage, index) => (
              <div
                key={luggage.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* 아이콘 */}
                  <div className="w-12 h-12 bg-toss-green rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold text-base mb-1">
                      {luggage.lockerName}
                    </p>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        {luggage.weight.toFixed(1)}kg
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(luggage.storedAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {luggage.destination && (
                      <p className="text-gray-500 text-xs mt-1">
                        📍 {luggage.destination}
                      </p>
                    )}
                  </div>

                  {/* 상태 배지 */}
                  <div className="px-3 py-1 bg-toss-green/10 text-toss-green text-xs font-semibold rounded-full flex-shrink-0">
                    보관 중
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 홈으로 버튼 */}
        {storedLuggages.length > 0 && (
          <div className="mt-6 animate-fade-in-up">
            <Button
              onClick={() => navigate('/home')}
              className="w-full h-14 text-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white"
            >
              홈으로 돌아가기
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LuggageListPage;
