import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@/stores/useRecommendStore';
import { Check, Plus } from 'lucide-react';

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
  onSelect
}) => {
  if (!food) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{food.name}</DialogTitle>
          <DialogDescription>
            {food.category || 'Food Item'} • {food.calories || food.kcal || 0} kcal
          </DialogDescription>
        </DialogHeader>

        {/* Food Image */}
        {food.image && (
          <div className="w-full h-48 overflow-hidden rounded-md mb-4">
            <img 
              src={food.image} 
              alt={food.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Nutritional Information */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Nutritional Information</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded-md">
                <div className="text-xs text-neutral-600">Protein</div>
                <div className="text-sm font-medium">{food.protein || 0}g</div>
              </div>
              <div className="bg-amber-50 p-2 rounded-md">
                <div className="text-xs text-neutral-600">Carbs</div>
                <div className="text-sm font-medium">{food.carbs || 0}g</div>
              </div>
              <div className="bg-purple-50 p-2 rounded-md">
                <div className="text-xs text-neutral-600">Fat</div>
                <div className="text-sm font-medium">{food.fat || 0}g</div>
              </div>
              <div className="bg-green-50 p-2 rounded-md">
                <div className="text-xs text-neutral-600">Price</div>
                <div className="text-sm font-medium">${food.price?.toFixed(2) || 0}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {food.tags && food.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {food.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant={isSelected ? "destructive" : "default"}
            onClick={() => onSelect(food)}
          >
            {isSelected ? (
              "Remove from Selection"
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Selection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FoodDetailModal;