import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AllergyBadge from '@/components/AllergyBadge';
import { FoodItem } from '@/stores/useRecommendStore';
import { UserInfo } from '@/types';
import { formatCurrency } from '@/lib/utils';

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
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-200 ${
        isSelected 
          ? 'border-2 border-primary shadow-md' 
          : 'border border-neutral-200 hover:shadow-md'
      }`}
    >
      {/* Allergy badge */}
      <AllergyBadge food={food} userInfo={userInfo} />
      
      {/* Food image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={food.image} 
          alt={food.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="bg-white/90 text-black text-xs">
              {food.category}
            </Badge>
            <Badge variant="outline" className="bg-white/90 text-black text-xs">
              {food.calories} kcal
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Food info */}
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-1">{food.name}</h3>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-neutral-600">
            {food.mainNutrient.name}: {food.mainNutrient.amount}{food.mainNutrient.unit}
          </p>
          <p className="text-sm font-semibold">{formatCurrency(food.price)}</p>
        </div>
        {food.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {food.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Actions */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-1/2"
          onClick={() => onViewDetails(food)}
        >
          Details
        </Button>
        <Button 
          variant={isSelected ? "destructive" : "default"}
          size="sm" 
          className="w-1/2"
          onClick={() => onSelect(food)}
        >
          {isSelected ? 'Remove' : 'Select'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FoodCard;