import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@/stores/useRecommendStore';
import { formatCurrency } from '@/lib/utils';

interface FoodDetailModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  isSelected: boolean;
  onClose: () => void;
  onSelect: (food: FoodItem) => void;
}

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  isOpen,
  isSelected,
  onClose,
  onSelect,
}) => {
  if (!food) return null;

  const handleSelect = () => {
    onSelect(food);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{food.name}</DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className="mr-2 mt-2">
              {food.category}
            </Badge>
            <Badge variant="outline" className="mr-2 mt-2">
              {food.calories} kcal
            </Badge>
            {food.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary" className="mr-2 mt-2">
                {tag}
              </Badge>
            ))}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-40 object-cover rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-base">Nutrition Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Calories:</div>
              <div className="font-medium">{food.calories} kcal</div>
              
              <div>{food.mainNutrient.name}:</div>
              <div className="font-medium">{food.mainNutrient.amount} {food.mainNutrient.unit}</div>
              
              <div>Price:</div>
              <div className="font-medium">{formatCurrency(food.price)}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant={isSelected ? "destructive" : "default"}
            onClick={handleSelect}
          >
            {isSelected ? 'Remove from Meal' : 'Add to Meal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FoodDetailModal;