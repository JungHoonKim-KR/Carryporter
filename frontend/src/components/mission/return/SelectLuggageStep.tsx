import type { StoredLuggage } from '../../../types/mission.types';

interface SelectLuggageStepProps {
  storedLuggages: StoredLuggage[];
  onSelectLuggage: (luggage: StoredLuggage) => void;
}

/**
 * 반납할 짐 선택 단계
 */
export const SelectLuggageStep = ({
  storedLuggages,
  onSelectLuggage,
}: SelectLuggageStepProps) => {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-gray-900 font-bold mb-4">보관된 짐 목록</h3>
        <div className="space-y-3">
          {storedLuggages.map((luggage) => (
            <button
              key={luggage.id}
              onClick={() => onSelectLuggage(luggage)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{luggage.lockerName}</p>
                  <p className="text-sm text-gray-500">
                    {luggage.weight.toFixed(1)}kg • {new Date(luggage.storedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 보관
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
