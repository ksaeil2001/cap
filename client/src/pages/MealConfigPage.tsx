import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecommendStore } from "@/stores/useRecommendStore";
import { useMealConfigStore } from "@/stores/useMealConfigStore";
import { Button } from "@/components/ui/button";
import MealSlot from "@/components/ui/meal-slot";
import DraggableMeal from "@/components/DraggableMeal";
import { Food, MealTime } from "@/types";
import { calculateCalories, formatCurrency } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/hooks/use-toast";

const mealTypes: { id: MealTime; label: string; icon: string }[] = [
  { id: "breakfast", label: "Breakfast", icon: "ri-sun-line" },
  { id: "lunch", label: "Lunch", icon: "ri-sun-foggy-line" },
  { id: "dinner", label: "Dinner", icon: "ri-moon-line" },
];

const MealConfigPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore(state => state.userInfo);
  const selectedFoods = useRecommendStore(state => state.selectedFoods);
  const { 
    meals, 
    addFoodToMeal, 
    removeFoodFromMeal, 
    clearMeals,
    getMealTotalCalories,
    getMealTotalCost
  } = useMealConfigStore();
  
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [dailyCaloriesTarget, setDailyCaloriesTarget] = useState(2000);
  const [dailyBudgetTarget, setDailyBudgetTarget] = useState(14.28);

  const totalCalories = Object.values(meals).reduce(
    (sum, mealFoods) => sum + mealFoods.reduce((mealSum, food) => mealSum + food.calories, 0),
    0
  );
  
  const totalBudget = Object.values(meals).reduce(
    (sum, mealFoods) => sum + mealFoods.reduce((mealSum, food) => mealSum + food.price, 0),
    0
  );

  const totalProtein = Object.values(meals).reduce(
    (sum, mealFoods) => sum + mealFoods.reduce((mealSum, food) => {
      if (food.mainNutrient.name === 'Protein') {
        return mealSum + food.mainNutrient.amount;
      }
      return mealSum;
    }, 0),
    0
  );

  const totalCarbs = Object.values(meals).reduce(
    (sum, mealFoods) => sum + mealFoods.reduce((mealSum, food) => {
      if (food.mainNutrient.name === 'Carbs') {
        return mealSum + food.mainNutrient.amount;
      }
      return mealSum;
    }, 0),
    0
  );

  useEffect(() => {
    // Reset meals when component mounts
    clearMeals();
    
    // Check if user has selected foods
    if (selectedFoods.length === 0) {
      toast({
        title: "No foods selected",
        description: "Please select foods first.",
        variant: "destructive",
      });
      navigate("/recommend");
      return;
    }
    
    // Calculate daily calories target based on user info
    if (userInfo.gender && userInfo.weight && userInfo.height && userInfo.goal) {
      const caloriesTarget = calculateCalories(
        userInfo.gender,
        userInfo.weight,
        userInfo.height,
        userInfo.goal
      );
      setDailyCaloriesTarget(caloriesTarget);
    }

    // Calculate daily budget target
    if (userInfo.budget) {
      const dailyBudget = userInfo.budget / 7;
      setDailyBudgetTarget(dailyBudget);
    }
  }, [selectedFoods, navigate, toast, clearMeals, userInfo]);
  
  // Separate useEffect to update available foods when meals change
  useEffect(() => {
    setAvailableFoods(selectedFoods.filter(food => 
      !Object.values(meals).flat().some(mealFood => mealFood.id === food.id)
    ));
  }, [selectedFoods, meals]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, mealType: MealTime) => {
    e.preventDefault();
    setDraggedOver(mealType);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, mealType: MealTime) => {
    e.preventDefault();
    setDraggedOver(null);
    
    try {
      const foodData = JSON.parse(e.dataTransfer.getData('text/plain')) as Food;
      
      // Check if food is already in a meal
      const isAlreadyInMeal = Object.entries(meals).some(([type, foods]) => 
        type !== mealType && foods.some(f => f.id === foodData.id)
      );
      
      if (isAlreadyInMeal) {
        // Remove from previous meal
        Object.keys(meals).forEach(type => {
          if (type !== mealType && meals[type as MealTime].some(f => f.id === foodData.id)) {
            removeFoodFromMeal(type as MealTime, foodData.id);
          }
        });
      }
      
      // Add to new meal
      addFoodToMeal(mealType, foodData);
      
      // Update available foods
      setAvailableFoods(availableFoods.filter(food => food.id !== foodData.id));
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const handleRemoveFood = (mealType: MealTime, foodId: string) => {
    // Find the food object
    const food = meals[mealType].find(f => f.id === foodId);
    
    // Remove from meal
    removeFoodFromMeal(mealType, foodId);
    
    // Add back to available foods if it exists
    if (food) {
      setAvailableFoods([...availableFoods, food]);
    }
  };

  const handleContinue = () => {
    // Check if any meals have been configured
    const hasMeals = Object.values(meals).some(mealFoods => mealFoods.length > 0);
    
    if (!hasMeals) {
      toast({
        title: "No meals configured",
        description: "Please add at least one food to your meal plan.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/summary");
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Configure Your Meal Plan</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Drag and drop foods to create your personalized meal plan. We'll help you stay within your nutritional goals and budget.
        </p>
      </div>

      {/* Meal Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {mealTypes.map(mealType => (
          <div key={mealType.id} className="bg-white rounded-xl shadow-md p-5">
            <h3 className="font-heading font-semibold text-xl mb-4 flex items-center">
              <i className={`${mealType.icon} text-accent mr-2`}></i> {mealType.label}
            </h3>
            
            {meals[mealType.id].map(food => (
              <MealSlot key={food.id} isFilled={true}>
                <DraggableMeal 
                  food={food} 
                  onRemove={() => handleRemoveFood(mealType.id, food.id)}
                  iconType={mealType.id === "breakfast" ? "primary" : mealType.id === "lunch" ? "primary" : "secondary"}
                />
              </MealSlot>
            ))}
            
            <MealSlot
              className={draggedOver === mealType.id ? "bg-neutral-100" : ""}
              onDragOver={(e) => handleDragOver(e, mealType.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, mealType.id)}
            />
            
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-600">Total Calories</span>
                <span className="font-medium">{getMealTotalCalories(mealType.id)} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Cost</span>
                <span className="font-medium text-accent-700">{formatCurrency(getMealTotalCost(mealType.id))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nutrition Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="font-heading font-semibold text-xl mb-4">Daily Nutrition Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Calories</p>
            <div className="flex items-end">
              <span className="text-2xl font-semibold mr-2">{totalCalories}</span>
              <span className="text-neutral-500 text-sm">/ {dailyCaloriesTarget} kcal</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min((totalCalories / dailyCaloriesTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-neutral-500 mb-1">Protein</p>
            <div className="flex items-end">
              <span className="text-2xl font-semibold mr-2">{totalProtein}g</span>
              <span className="text-neutral-500 text-sm">/ 120g</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
              <div 
                className="bg-secondary h-2 rounded-full" 
                style={{ width: `${Math.min((totalProtein / 120) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-neutral-500 mb-1">Carbs</p>
            <div className="flex items-end">
              <span className="text-2xl font-semibold mr-2">{totalCarbs}g</span>
              <span className="text-neutral-500 text-sm">/ 225g</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${Math.min((totalCarbs / 225) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-neutral-500 mb-1">Budget</p>
            <div className="flex items-end">
              <span className="text-2xl font-semibold mr-2">{formatCurrency(totalBudget)}</span>
              <span className="text-neutral-500 text-sm">/ {formatCurrency(dailyBudgetTarget)} daily</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
              <div 
                className="bg-neutral-700 h-2 rounded-full" 
                style={{ width: `${Math.min((totalBudget / dailyBudgetTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Foods Panel */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="font-heading font-semibold text-xl mb-4">Available Foods</h3>
        <p className="text-sm text-neutral-500 mb-4">Drag these items to add them to your meal plan.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableFoods.map(food => (
            <div 
              key={food.id} 
              className="draggable-meal bg-neutral-50 p-3 rounded-lg border border-neutral-200 cursor-move"
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
                <div className="bg-primary-100 rounded-md p-2 mr-2 text-sm">
                  <i className={food.category.toLowerCase() === 'fruit' ? 'ri-apple-line text-primary-600' : 'ri-seedling-line text-primary-600'}></i>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{food.name}</h4>
                  <span className="text-xs text-neutral-500">{food.calories} kcal</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {availableFoods.length === 0 && (
          <div className="text-center py-4">
            <p className="text-neutral-600">All foods have been added to meals.</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <Button 
          onClick={handleContinue}
          className="bg-primary hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Continue to Summary
        </Button>
      </div>
    </div>
  );
};

export default MealConfigPage;
