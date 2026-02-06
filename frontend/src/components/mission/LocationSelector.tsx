import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Location } from '../../types/mission.types';

interface LocationSelectorProps {
  /**
   * 위치 목록 (정류장, 탑승구)
   */
  locations: {
    stations: Location[];
    gates: Location[];
  };
  /**
   * 현재 선택된 위치 ID
   */
  selectedLocationId: number | null;
  /**
   * 위치 선택 핸들러
   */
  onSelect: (locationId: number) => void;
  /**
   * 비활성화 여부
   */
  disabled?: boolean;
}

/**
 * LocationSelector 컴포넌트
 *
 * 정류장/탑승구 선택 UI를 제공하는 재사용 가능한 컴포넌트
 * shadcn/ui Tabs 컴포넌트를 활용하여 탭 전환 기능 제공
 */
export const LocationSelector = ({
  locations,
  selectedLocationId,
  onSelect,
  disabled = false,
}: LocationSelectorProps) => {
  return (
    <Tabs defaultValue="station" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="station" disabled={disabled}>정류장</TabsTrigger>
        <TabsTrigger value="gate" disabled={disabled}>탑승구</TabsTrigger>
      </TabsList>

      {/* 정류장 탭 */}
      <TabsContent value="station" className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {locations.stations.map((station) => (
            <button
              key={station.id}
              type="button"
              onClick={() => onSelect(station.id)}
              disabled={disabled}
              className={cn(
                'p-4 rounded-xl transition-all duration-200',
                selectedLocationId === station.id
                  ? 'bg-white ring-2 ring-slate-800 shadow-lg scale-[1.02]'
                  : 'bg-gray-50 text-gray-900 hover:bg-white hover:shadow-md',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="text-3xl mb-2">{station.icon}</div>
              <p className={cn('text-sm font-semibold', selectedLocationId === station.id ? 'text-slate-900' : 'text-gray-700')}>{station.name}</p>
            </button>
          ))}
        </div>
      </TabsContent>

      {/* 탑승구 탭 */}
      <TabsContent value="gate" className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {locations.gates.map((gate) => (
            <button
              key={gate.id}
              type="button"
              onClick={() => onSelect(gate.id)}
              disabled={disabled}
              className={cn(
                'p-4 rounded-xl transition-all duration-200',
                selectedLocationId === gate.id
                  ? 'bg-white ring-2 ring-slate-800 shadow-lg scale-[1.02]'
                  : 'bg-gray-50 text-gray-900 hover:bg-white hover:shadow-md',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="text-3xl mb-2">{gate.icon}</div>
              <p className={cn('text-sm font-semibold', selectedLocationId === gate.id ? 'text-slate-900' : 'text-gray-700')}>{gate.name}</p>
            </button>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
