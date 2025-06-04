import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MealTime } from '@/stores/useMealConfigStore';
import { Coffee, UtensilsCrossed, Utensils } from 'lucide-react';

interface MealTypeTabsProps {
  activeMealType: MealTime;
  onTabChange: (mealType: MealTime) => void;
}

const MealTypeTabs: React.FC<MealTypeTabsProps> = ({ 
  activeMealType, 
  onTabChange 
}) => {
  const mealTypes: { id: MealTime; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'breakfast', 
      label: '아침', 
      icon: <Coffee className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'lunch', 
      label: '점심', 
      icon: <UtensilsCrossed className="h-4 w-4 mr-2" /> 
    },
    { 
      id: 'dinner', 
      label: '저녁', 
      icon: <Utensils className="h-4 w-4 mr-2" /> 
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">끼니 유형 선택</h3>
      <Tabs 
        value={activeMealType} 
        onValueChange={(value) => onTabChange(value as MealTime)}
        className="w-full"
      >
        <TabsList className="w-full">
          {mealTypes.map((type) => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex-1 flex items-center justify-center"
            >
              {type.icon}
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MealTypeTabs;