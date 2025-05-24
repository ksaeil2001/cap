import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/stores/useRecommendStore';
import { formatCurrency } from '@/lib/utils';
import { X } from 'lucide-react';

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
  // Map icon type to color classes
  const iconColors = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-amber-500 text-white'
  };

  // Make the component draggable
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(food));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      className={`relative shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {/* Color icon based on the type */}
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconColors[iconType]}`}>
          <span className="font-semibold text-sm">{food.calories}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate" title={food.name}>{food.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {food.category}
            </Badge>
            <span className="text-xs text-neutral-500">
              {formatCurrency(food.price)}
            </span>
          </div>
        </div>

        {onRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DraggableMeal;