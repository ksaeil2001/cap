import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DraggableMeal from './DraggableMeal';
import { FoodItem } from '@/api/mockRecommend';
import { formatCurrency } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

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
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex space-x-2">
            <Badge variant="outline">
              {totalCalories.toFixed(0)} kcal
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              {formatCurrency(totalCost)}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 min-h-[100px]">
          {foods.length === 0 ? (
            <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-md border-gray-200 bg-gray-50">
              <p className="text-gray-400 text-sm">Drop food items here</p>
            </div>
          ) : (
            <div className="space-y-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default MealSlot;