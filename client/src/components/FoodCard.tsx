import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@/api/mockRecommend';
import { UserInfo } from '@/types';
import { Check, Info, Plus, AlertTriangle, Utensils, DollarSign } from 'lucide-react';
import AllergyBadge from './AllergyBadge';
import { cn } from '@/lib/utils';

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

  // Get food tags for display (limited to first 3)
  const displayTags = food.tags?.slice(0, 3) || [];
  
  // Generate placeholder image if no image exists
  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(food.name)}&background=random&size=200&font-size=0.35&bold=true`;
  
  // Determine category label for display
  const categoryLabel = food.category ? food.category.charAt(0).toUpperCase() + food.category.slice(1) : '기타';
  
  // Get nutritional values
  const calories = food.calories || food.kcal || 0;
  const protein = food.protein || 0;
  const carbs = food.carbs || 0; 
  const fat = food.fat || 0;
  const price = food.price || 0;

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg", 
      isSelected ? "ring-2 ring-primary shadow-md" : "hover:translate-y-[-2px]"
    )}>
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-primary text-white rounded-full p-1.5 shadow-md">
          <Check className="h-4 w-4" />
        </div>
      )}
      
      {/* Allergy Indicator */}
      {hasAllergens && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="destructive" className="flex items-center gap-1 shadow-md">
            <AlertTriangle className="h-3 w-3" />
            <span>알레르기 포함</span>
          </Badge>
        </div>
      )}
      
      {/* Food Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={food.image || placeholderImage} 
          alt={food.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-black/70 text-white shadow-md">
            {categoryLabel}
          </Badge>
        </div>
      </div>
      
      {/* Food Title and Price */}
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 flex-1">{food.name}</h3>
          <Badge className="ml-2 bg-green-600 text-white flex items-center whitespace-nowrap">
            <DollarSign className="h-3 w-3 mr-1" />
            ₩{price.toLocaleString()}
          </Badge>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {displayTags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      {/* Nutrition Information */}
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="text-center p-1 bg-gray-50 rounded-md">
            <div className="text-sm font-semibold text-red-500">{calories}</div>
            <div className="text-xs text-gray-600">kcal</div>
          </div>
          <div className="text-center p-1 bg-blue-50 rounded-md">
            <div className="text-sm font-semibold text-blue-700">{protein}g</div>
            <div className="text-xs text-gray-600">단백질</div>
          </div>
          <div className="text-center p-1 bg-amber-50 rounded-md">
            <div className="text-sm font-semibold text-amber-700">{carbs}g</div>
            <div className="text-xs text-gray-600">탄수화물</div>
          </div>
          <div className="text-center p-1 bg-purple-50 rounded-md">
            <div className="text-sm font-semibold text-purple-700">{fat}g</div>
            <div className="text-xs text-gray-600">지방</div>
          </div>
        </div>
      </CardContent>
      
      {/* Card Actions */}
      <CardFooter className="p-3 pt-0 flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex-1"
          onClick={() => onViewDetails(food)}
        >
          <Info className="h-3 w-3 mr-1" />
          상세 정보
        </Button>
        
        <Button 
          variant={isSelected ? "destructive" : "default"}
          size="sm"
          className="text-xs flex-1"
          onClick={() => onSelect(food)}
        >
          {isSelected ? (
            <>
              <span className="mr-1">제거</span>
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              <span>선택</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FoodCard;