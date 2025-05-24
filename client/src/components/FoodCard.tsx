import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@/stores/useRecommendStore';
import { UserInfo } from '@/types';
import { Check, Info, Plus } from 'lucide-react';
import AllergyBadge from './AllergyBadge';

interface FoodCardProps {
  food: FoodItem;
  isSelected: boolean;
  userInfo: UserInfo;
  onSelect: (food: FoodItem) => void;
  onViewDetails: (food: FoodItem) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  isSelected,
  userInfo,
  onSelect,
  onViewDetails
}) => {
  // Determine if food contains any allergens
  const hasAllergens = userInfo.allergies && userInfo.allergies.length > 0 && food.tags &&
    userInfo.allergies.some(allergy => 
      food.tags?.includes(allergy.toLowerCase())
    );

  // Get food tags for display (limited to first 2)
  const displayTags = food.tags?.slice(0, 2) || [];

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Food Image */}
      {food.image && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={food.image} 
            alt={food.name} 
            className="w-full h-full object-cover"
          />
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}
          
          {/* Allergy Badge */}
          {hasAllergens && (
            <AllergyBadge food={food} userInfo={userInfo} />
          )}
        </div>
      )}
      
      {/* Food Information */}
      <CardContent className="p-4">
        <h3 className="font-medium text-base mb-1 line-clamp-2">{food.name}</h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">{food.calories || food.kcal || 0} kcal</span>
          <span className="text-sm font-medium">${food.price?.toFixed(2)}</span>
        </div>
        
        {/* Nutrition Pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {food.protein && (
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
              Protein: {food.protein}g
            </Badge>
          )}
          
          {food.carbs && (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
              Carbs: {food.carbs}g
            </Badge>
          )}
          
          {food.fat && (
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs">
              Fat: {food.fat}g
            </Badge>
          )}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {displayTags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      {/* Card Actions */}
      <CardFooter className="p-2 pt-0 flex justify-between gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs w-1/2"
          onClick={() => onViewDetails(food)}
        >
          <Info className="h-3 w-3 mr-1" />
          Details
        </Button>
        
        <Button 
          variant={isSelected ? "destructive" : "default"}
          size="sm"
          className="text-xs w-1/2"
          onClick={() => onSelect(food)}
        >
          {isSelected ? 'Remove' : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Select
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FoodCard;