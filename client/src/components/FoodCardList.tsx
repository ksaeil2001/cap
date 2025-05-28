import React from 'react';
import { FoodItem } from '@/stores/useRecommendStore';
import { UserInfo } from '@/types';
import FoodCard from './Food/FoodCard';

interface FoodCardListProps {
  foods: FoodItem[];
  userInfo: UserInfo;
  selectedFoods: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
  onViewDetails: (food: FoodItem) => void;
}

const FoodCardList: React.FC<FoodCardListProps> = ({
  foods,
  userInfo,
  selectedFoods,
  onSelectFood,
  onViewDetails
}) => {
  if (foods.length === 0) {
    return (
      <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
        <p className="text-neutral-500">No foods available for this meal type.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          isSelected={selectedFoods.some(f => f.id === food.id)}
          userInfo={userInfo}
          onSelect={() => onSelectFood(food)}
          onViewDetails={() => onViewDetails(food)}
        />
      ))}
    </div>
  );
};

export default FoodCardList;