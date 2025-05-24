import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FoodItem } from '@/stores/useRecommendStore';

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
  iconType
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    // Transfer the food data as JSON string
    e.dataTransfer.setData('application/json', JSON.stringify(food));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Get background color based on meal type
  const getBgColor = () => {
    if (!iconType) return '';
    
    switch (iconType) {
      case 'primary':
        return 'bg-blue-50';
      case 'secondary':
        return 'bg-amber-50';
      case 'accent':
        return 'bg-purple-50';
      default:
        return '';
    }
  };

  return (
    <Card 
      className={`cursor-grab active:cursor-grabbing ${getBgColor()} ${className}`}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3 flex justify-between items-center">
        <div>
          <div className="font-medium text-sm">{food.name}</div>
          <div className="text-xs text-neutral-600">
            {food.calories || food.kcal || 0} kcal | ${food.price?.toFixed(2)}
          </div>
        </div>
        
        {onRemove && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onRemove}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DraggableMeal;