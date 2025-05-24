import React from 'react';
import { MealTime } from '@/types';

interface MealTypeTabsProps {
  activeMealType: MealTime;
  onTabChange: (mealType: MealTime) => void;
}

const MealTypeTabs: React.FC<MealTypeTabsProps> = ({ activeMealType, onTabChange }) => {
  const mealTypes: { id: MealTime; label: string }[] = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {mealTypes.map((mealType) => (
            <button
              key={mealType.id}
              className={`py-4 px-1 font-medium transition-colors duration-200 ${
                activeMealType === mealType.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
              onClick={() => onTabChange(mealType.id)}
              aria-current={activeMealType === mealType.id ? 'page' : undefined}
            >
              {mealType.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MealTypeTabs;