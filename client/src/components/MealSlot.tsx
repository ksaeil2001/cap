import React, { useState } from 'react';
import { FoodItem } from '@/stores/useRecommendStore';
import DraggableMeal from './DraggableMeal';
import { PlusCircle } from 'lucide-react';

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

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const foodData = e.dataTransfer.getData('application/json');
      if (!foodData) return;
      
      const food = JSON.parse(foodData) as FoodItem;
      onAddFood(food);
    } catch (err) {
      console.error('Error parsing dropped food data:', err);
    }
  };

  return (
    <div className="rounded-lg bg-neutral-50 border border-dashed border-neutral-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">{title}</h3>
        <div className="text-sm text-neutral-600">
          <span className="mr-3">{totalCalories.toFixed(0)} kcal</span>
          <span>${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Droppable area */}
      <div 
        className={`min-h-[200px] rounded-md transition-colors duration-200 ${
          isDragOver 
            ? 'bg-primary/10 border-2 border-primary border-dashed' 
            : 'bg-white border border-neutral-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {foods.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-4">
            <PlusCircle className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-center text-sm">
              Drag and drop foods here to add to {title.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {foods.map((food) => (
              <DraggableMeal
                key={food.id}
                food={food}
                iconType={iconType}
                onRemove={() => onRemoveFood(food.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealSlot;