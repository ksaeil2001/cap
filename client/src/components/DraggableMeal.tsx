import React from 'react';
import { FoodItem } from '@/api/mockRecommend';
import { formatCurrency } from '@/lib/utils';
import { X, Coffee, Utensils, UtensilsCrossed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DraggableMealProps {
  food: FoodItem;
  onRemove?: () => void;
  className?: string;
  iconType?: 'primary' | 'secondary' | 'accent';
}

const DraggableMeal: React.FC<DraggableMealProps> = ({ 
  food, 
  onRemove,
  className = '',
  iconType = 'primary'
}) => {
  // Choose icon based on meal type
  const renderIcon = () => {
    switch(iconType) {
      case 'primary':
        return <Coffee className="h-4 w-4 text-blue-500" />;
      case 'secondary':
        return <Utensils className="h-4 w-4 text-orange-500" />;
      case 'accent':
        return <UtensilsCrossed className="h-4 w-4 text-purple-500" />;
      default:
        return <Coffee className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div 
      className={`
        p-3 rounded-lg bg-white border-2 
        ${iconType === 'primary' ? 'border-blue-100 bg-blue-50/30' : 
          iconType === 'secondary' ? 'border-orange-100 bg-orange-50/30' : 
          'border-purple-100 bg-purple-50/30'}
        shadow-sm hover:shadow-md transition-all duration-200 ${className}
      `}
    >
      {/* Header with icon and name */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {renderIcon()}
          <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{food.name}</h4>
        </div>
        
        {onRemove && (
          <button 
            onClick={onRemove}
            className="p-1 rounded-full hover:bg-red-100 transition-colors group"
            aria-label="Remove food"
          >
            <X className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
          </button>
        )}
      </div>

      {/* Nutrition info */}
      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">칼로리:</span>
          <span className="font-medium">{food.kcal} kcal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">가격:</span>
          <span className="font-medium text-green-600">{formatCurrency(food.price)}</span>
        </div>
        {food.protein && (
          <div className="flex justify-between">
            <span className="text-gray-600">단백질:</span>
            <span className="font-medium">{food.protein}g</span>
          </div>
        )}
        {food.carbs && (
          <div className="flex justify-between">
            <span className="text-gray-600">탄수화물:</span>
            <span className="font-medium">{food.carbs}g</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {food.tags && food.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {food.tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {tag}
            </Badge>
          ))}
          {food.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{food.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggableMeal;