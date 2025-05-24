import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FoodItem } from '@/stores/useRecommendStore';
import DraggableMeal from './DraggableMeal';
import { UtensilsCrossed } from 'lucide-react';

interface MealSlotProps {
  title: string;
  foods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onRemoveFood: (foodId: string) => void;
  totalCalories: number;
  totalCost: number;
  iconType?: 'primary' | 'secondary' | 'accent';
}

const MealSlot: React.FC<MealSlotProps> = ({
  title,
  foods,
  onAddFood,
  onRemoveFood,
  totalCalories,
  totalCost,
  iconType = 'primary'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const foodData = e.dataTransfer.getData('application/json');
      if (foodData) {
        const food = JSON.parse(foodData) as FoodItem;
        onAddFood(food);
      }
    } catch (error) {
      console.error('Error parsing dropped food data:', error);
    }
  };

  // Set styles based on meal type
  const getBorderClass = () => {
    if (isDragOver) return 'border-dashed border-2 border-primary bg-primary-50';
    
    switch (iconType) {
      case 'primary':
        return 'border-2 border-blue-200';
      case 'secondary':
        return 'border-2 border-amber-200';
      case 'accent':
        return 'border-2 border-purple-200';
      default:
        return 'border-2 border-neutral-200';
    }
  };

  const getHeaderClass = () => {
    switch (iconType) {
      case 'primary':
        return 'bg-blue-50 border-b border-blue-200';
      case 'secondary':
        return 'bg-amber-50 border-b border-amber-200';
      case 'accent':
        return 'bg-purple-50 border-b border-purple-200';
      default:
        return 'bg-neutral-50 border-b border-neutral-200';
    }
  };

  return (
    <Card 
      className={`overflow-hidden ${getBorderClass()}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`p-3 flex justify-between items-center ${getHeaderClass()}`}>
        <h3 className="font-medium">{title}</h3>
        <div className="text-xs text-neutral-600">
          {totalCalories.toFixed(0)} kcal | ${totalCost.toFixed(2)}
        </div>
      </div>
      
      <CardContent className="p-3">
        {foods.length === 0 ? (
          <div className="min-h-[150px] flex flex-col items-center justify-center text-neutral-400 border border-dashed border-neutral-200 rounded-md p-4">
            <span className="text-sm">Drop foods here</span>
          </div>
        ) : (
          <div className="space-y-2 min-h-[150px]">
            {foods.map((food) => (
              <DraggableMeal 
                key={food.id} 
                food={food}
                onRemove={() => onRemoveFood(food.id)}
                iconType={iconType}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealSlot;