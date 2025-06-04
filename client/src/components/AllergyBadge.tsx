import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@/stores/useRecommendStore';
import { UserInfo } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface AllergyBadgeProps {
  food: FoodItem;
  userInfo: UserInfo;
}

const AllergyBadge: React.FC<AllergyBadgeProps> = ({ food, userInfo }) => {
  // Find the allergens present in the food
  const allergensPresent = userInfo.allergies.filter(allergy => 
    food.tags?.some(tag => tag.toLowerCase() === allergy.toLowerCase())
  );

  if (allergensPresent.length === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className="absolute top-2 left-2 flex items-center gap-1"
    >
      <AlertTriangle className="h-3 w-3" />
      {allergensPresent.length === 1 
        ? `Contains ${allergensPresent[0]}` 
        : 'Allergens'}
    </Badge>
  );
};

export default AllergyBadge;