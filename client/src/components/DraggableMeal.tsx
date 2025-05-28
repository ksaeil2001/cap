import React from 'react';
import { FoodItem } from '@/api/mockRecommend';
import { formatCurrency } from '@/lib/utils';
import { X, Coffee, Utensils, UtensilsCrossed } from 'lucide-react';

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
        flex items-center justify-between p-2 rounded-md bg-white border 
        ${iconType === 'primary' ? 'border-blue-100' : 
          iconType === 'secondary' ? 'border-orange-100' : 
          'border-purple-100'}
        shadow-sm hover:shadow transition-all ${className}
      `}
    >
      <div className="flex items-center space-x-2">
        {renderIcon()}
        <div>
          <p className="text-sm font-medium line-clamp-1">{food.name}</p>
          <div className="flex space-x-3 text-xs text-gray-500">
            <span>{food.kcal} kcal</span>
            <span>{formatCurrency(food.price)}</span>
          </div>
        </div>
      </div>
      
      {onRemove && (
        <button 
          onClick={onRemove}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Remove food"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default DraggableMeal;