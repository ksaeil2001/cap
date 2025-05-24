import { cn } from "@/lib/utils";

interface NutritionProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
  className?: string;
}

const NutritionProgressBar = ({
  label,
  current,
  target,
  unit = "",
  color = "bg-primary-500",
  className,
}: NutritionProgressBarProps) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-neutral-600">{label}</span>
        <span className="text-sm text-neutral-700 font-medium">
          {current}{unit} {percentage > 0 ? `(${percentage}%)` : ''}
        </span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default NutritionProgressBar;
