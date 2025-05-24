import React from 'react';
import FoodCard from './FoodCard';
import { FoodItem } from '@/stores/useRecommendStore';
import { UserInfo } from '@/types';

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
      <div className="text-center py-10">
        <p className="text-neutral-600">No foods available for this meal type.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          isSelected={selectedFoods.some(f => f.id === food.id)}
          userInfo={userInfo}
          onSelect={onSelectFood}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default FoodCardList;