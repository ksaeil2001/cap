import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserInfo } from '@/types';
import { FoodItem } from '@/stores/useRecommendStore';

interface AllergyBadgeProps {
  food: FoodItem;
  userInfo: UserInfo;
}

const AllergyBadge: React.FC<AllergyBadgeProps> = ({ food, userInfo }) => {
  // Check if the food contains any allergens the user is allergic to
  const hasAllergen = userInfo.allergies.some(allergy => {
    const allergyLower = allergy.toLowerCase();
    return (
      food.name.toLowerCase().includes(allergyLower) ||
      (food.tags && food.tags.some(tag => tag.toLowerCase().includes(allergyLower)))
    );
  });

  if (!hasAllergen) return null;

  return (
    <Badge variant="destructive" className="absolute top-2 right-2 z-10">
      Allergy Alert
    </Badge>
  );
};

export default AllergyBadge;