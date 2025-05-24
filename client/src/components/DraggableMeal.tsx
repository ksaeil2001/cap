import { Food } from "@/types";
import { cn } from "@/lib/utils";

interface DraggableMealProps {
  food: Food;
  onRemove?: () => void;
  className?: string;
  iconType?: 'primary' | 'secondary' | 'accent';
}

const DraggableMeal = ({ 
  food, 
  onRemove, 
  className,
  iconType = 'primary'
}: DraggableMealProps) => {
  const getIconBgClass = () => {
    switch (iconType) {
      case 'primary':
        return 'bg-primary-100 text-primary-600';
      case 'secondary':
        return 'bg-secondary-100 text-secondary-600';
      case 'accent':
        return 'bg-accent-100 text-accent-600';
      default:
        return 'bg-primary-100 text-primary-600';
    }
  };

  const getIconByCategory = () => {
    switch (food.category.toLowerCase()) {
      case 'protein':
        return 'ri-seedling-line';
      case 'carb':
        return 'ri-seedling-line';
      case 'vegetable':
        return 'ri-plant-line';
      case 'fruit':
        return 'ri-apple-line';
      default:
        return 'ri-restaurant-line';
    }
  };

  return (
    <div 
      className={cn("draggable-meal flex items-center justify-between", className)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(food));
        e.currentTarget.classList.add('opacity-50');
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('opacity-50');
      }}
    >
      <div className="flex items-center">
        <div className={`${getIconBgClass()} rounded-md p-2 mr-3`}>
          <i className={getIconByCategory()}></i>
        </div>
        <div>
          <h4 className="font-medium">{food.name}</h4>
          <span className="text-xs text-neutral-500">
            {food.calories} kcal | {food.mainNutrient.amount}{food.mainNutrient.unit} {food.mainNutrient.name}
          </span>
        </div>
      </div>
      {onRemove && (
        <div 
          className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
          onClick={onRemove}
        >
          <i className="ri-close-line"></i>
        </div>
      )}
    </div>
  );
};

export default DraggableMeal;
