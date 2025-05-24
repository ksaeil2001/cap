import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getPercentage } from '@/lib/utils';

interface NutritionProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
  className?: string;
}

const NutritionProgressBar: React.FC<NutritionProgressBarProps> = ({
  label,
  current,
  target,
  unit = 'g',
  color = 'bg-primary',
  className = '',
}) => {
  // Calculate percentage of target reached
  const percentage = getPercentage(current, target);
  
  // Status indicator: under, optimal, or over
  let status = 'text-neutral-600';
  let statusText = 'Optimal';
  
  if (percentage < 80) {
    status = 'text-amber-600';
    statusText = 'Under';
  } else if (percentage > 120) {
    status = 'text-red-600';
    statusText = 'Over';
  } else {
    status = 'text-green-600';
    statusText = 'Optimal';
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-neutral-700">{label}</div>
        <div className={`text-xs font-medium ${status}`}>
          {statusText}
        </div>
      </div>
      
      <Progress 
        value={Math.min(percentage, 100)} 
        className={`h-2 ${color}`} 
      />
      
      <div className="flex justify-between items-center text-xs text-neutral-500">
        <div>
          {Math.round(current)}{unit} / {Math.round(target)}{unit}
        </div>
        <div>
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
};

export default NutritionProgressBar;