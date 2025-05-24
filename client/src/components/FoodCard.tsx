import { Button } from "@/components/ui/button";
import { Food } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface FoodCardProps {
  food: Food;
  isSelected?: boolean;
  onSelect: (food: Food) => void;
}

const FoodCard = ({ food, isSelected = false, onSelect }: FoodCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'protein':
        return 'bg-primary-100 text-primary-800';
      case 'carb':
        return 'bg-secondary-100 text-secondary-800';
      case 'vegetable':
        return 'bg-primary-100 text-primary-800';
      case 'fruit':
        return 'bg-accent-100 text-accent-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <img 
        src={food.image} 
        alt={food.name} 
        className="w-full h-48 object-cover" 
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading font-semibold text-lg">{food.name}</h3>
          <span className={`${getCategoryColor(food.category)} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
            {food.category}
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-neutral-600">Calories</span>
            <span className="font-medium">{food.calories} kcal</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-neutral-600">{food.mainNutrient.name}</span>
            <span className="font-medium">{food.mainNutrient.amount}{food.mainNutrient.unit}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Price per serving</span>
            <span className="font-medium text-accent-700">{formatCurrency(food.price)}</span>
          </div>
        </div>
        
        <Button
          onClick={() => onSelect(food)}
          variant={isSelected ? "default" : "outline"}
          className={`w-full ${isSelected ? 'bg-primary text-white hover:bg-primary-600' : 'border-primary text-primary hover:bg-primary-50'}`}
        >
          {isSelected ? 'Selected' : 'Add to Meal Plan'}
        </Button>
      </div>
    </div>
  );
};

export default FoodCard;
