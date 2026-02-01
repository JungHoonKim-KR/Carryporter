interface WeightDisplayCardProps {
  weight: number;
  label: string;
  icon?: React.ReactNode;
}

/**
 * 무게 정보 표시 카드 (재사용 가능)
 */
export const WeightDisplayCard = ({
  weight,
  label,
  icon,
}: WeightDisplayCardProps) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between">
        {icon && <div className="mr-3">{icon}</div>}
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {weight.toFixed(1)} kg
          </p>
        </div>
      </div>
    </div>
  );
};
