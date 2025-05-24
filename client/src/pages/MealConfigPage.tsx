import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MealTime } from "@/types";
import { useUserStore } from "@/stores/useUserStore";
import { useRecommendStore, FoodItem } from "@/stores/useRecommendStore";
import { useMealConfigStore } from "@/stores/useMealConfigStore";
import { useToast } from "@/hooks/use-toast";
import MealSlot from "@/components/MealSlot";
import DraggableMeal from "@/components/DraggableMeal";
import NutritionProgressBar from "@/components/NutritionProgressBar";
import { AlertTriangle, UtensilsCrossed, Check } from 'lucide-react';

const mealTypes: { id: MealTime; label: string; iconType: 'primary' | 'secondary' | 'accent' }[] = [
  { id: "breakfast", label: "Breakfast", iconType: "primary" },
  { id: "lunch", label: "Lunch", iconType: "secondary" },
  { id: "dinner", label: "Dinner", iconType: "accent" },
];

const MealConfigPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore((state) => state.userInfo);
  const selectedFoods = useRecommendStore((state) => state.selectedFoods);
  const { 
    meals, 
    addFoodToMeal, 
    removeFoodFromMeal, 
    getMealTotalCalories,
    getMealTotalCost,
    nutritionSummary,
    validationStatus,
    updateNutritionSummary
  } = useMealConfigStore();

  const [activeTab, setActiveTab] = useState<string>("configure");

  // Check if we have foods to work with on component mount
  useEffect(() => {
    // Check if there are selected foods from the recommend page
    if (selectedFoods.length === 0) {
      toast({
        title: "No foods selected",
        description: "Please select foods from the recommendations page first.",
        variant: "destructive",
      });
      navigate("/recommend");
      return;
    }

    // Update nutrition summary on mount
    updateNutritionSummary();
  }, [selectedFoods, navigate, toast, updateNutritionSummary]);

  // Add a food to a meal
  const handleAddFood = (mealType: MealTime, food: FoodItem) => {
    // Check if food already exists in any meal
    const isAlreadyAdded = Object.values(meals).some(mealFoods => 
      mealFoods.some(f => f.id === food.id)
    );

    // Remove from previous meal if moving between meals
    if (isAlreadyAdded) {
      Object.entries(meals).forEach(([meal, foods]) => {
        const existingFoodIndex = foods.findIndex(f => f.id === food.id);
        if (existingFoodIndex !== -1) {
          removeFoodFromMeal(meal as MealTime, food.id);
        }
      });
    }

    // Add to the new meal
    addFoodToMeal(mealType, food);
  };

  // Remove a food from a meal
  const handleRemoveFood = (mealType: MealTime, foodId: string) => {
    removeFoodFromMeal(mealType, foodId);
  };

  // Continue to summary page
  const handleContinue = () => {
    // Check if at least one food is added to each meal type
    const hasBreakfast = meals.breakfast.length > 0;
    const hasLunch = meals.lunch.length > 0;
    const hasDinner = meals.dinner.length > 0;

    if (!hasBreakfast || !hasLunch || !hasDinner) {
      toast({
        title: "Incomplete meal plan",
        description: "Please add at least one food item to each meal type.",
        variant: "destructive",
      });
      return;
    }

    // Check for budget exceeded
    if (validationStatus.budgetExceeded) {
      toast({
        title: "Budget exceeded",
        description: "Your meal plan exceeds your specified budget. Please adjust your meals.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to summary
    navigate("/summary");
  };

  // Go back to recommendations
  const handleBack = () => {
    navigate("/recommend");
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Configure Your Meal Plan</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Drag and drop foods to create your personalized meal plan. Make sure to include items for each meal.
        </p>
      </div>

      <Tabs defaultValue="configure" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="configure" className="flex-1">Configure Meals</TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1">Nutrition Analysis</TabsTrigger>
        </TabsList>
        
        {/* Configure Meals Tab */}
        <TabsContent value="configure" className="space-y-6">
          {/* Validation Messages */}
          {validationStatus.budgetExceeded && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Budget Exceeded</AlertTitle>
              <AlertDescription>
                Your current meal selections exceed your budget of ${userInfo.budget.toFixed(2)}.
                Please adjust your meal choices to stay within budget.
              </AlertDescription>
            </Alert>
          )}
          
          {validationStatus.nutritionMismatch && (
            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
              <UtensilsCrossed className="h-4 w-4" />
              <AlertTitle>Nutrition Imbalance</AlertTitle>
              <AlertDescription>
                Your current meal selections don't match your nutritional needs.
                Consider reviewing the Nutrition Analysis tab for details.
              </AlertDescription>
            </Alert>
          )}
          
          {validationStatus.hasAllergies && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Allergy Warning</AlertTitle>
              <AlertDescription>
                Some of your selected foods contain allergens you've listed in your profile.
                Please check your selections carefully.
              </AlertDescription>
            </Alert>
          )}

          {/* Available Foods */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <h3 className="text-lg font-medium mb-3">Available Foods</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedFoods.map((food) => {
                // Check if food is already in a meal
                const isInMeal = Object.values(meals).some(mealFoods => 
                  mealFoods.some(f => f.id === food.id)
                );
                
                if (isInMeal) return null;
                
                return (
                  <DraggableMeal 
                    key={food.id} 
                    food={food}
                    className="bg-white"
                  />
                );
              })}

              {/* Show message if all foods are assigned */}
              {selectedFoods.length > 0 && selectedFoods.every(food => 
                Object.values(meals).some(mealFoods => 
                  mealFoods.some(f => f.id === food.id)
                )
              ) && (
                <div className="col-span-full p-4 text-center text-neutral-500 bg-white rounded-lg border border-neutral-200">
                  <Check className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p>All selected foods have been assigned to meals!</p>
                </div>
              )}
            </div>
          </div>

          {/* Meal Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mealTypes.map((mealType) => (
              <MealSlot
                key={mealType.id}
                title={mealType.label}
                foods={meals[mealType.id]}
                onAddFood={(food) => handleAddFood(mealType.id, food)}
                onRemoveFood={(foodId) => handleRemoveFood(mealType.id, foodId)}
                totalCalories={getMealTotalCalories(mealType.id)}
                totalCost={getMealTotalCost(mealType.id)}
                iconType={mealType.iconType}
              />
            ))}
          </div>

          {/* Summary and Navigation */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 mt-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-neutral-600">Daily Calories</div>
                <div className="font-bold text-lg">
                  {Math.round(nutritionSummary.calories.actual)} kcal
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-neutral-600">Daily Cost</div>
                <div className="font-bold text-lg">
                  ${nutritionSummary.budget.actual.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-neutral-600">Weekly Cost</div>
                <div className="font-bold text-lg">
                  ${(nutritionSummary.budget.actual * 7).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handleBack}
            >
              Back to Recommendations
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={validationStatus.budgetExceeded}
            >
              Continue to Summary
            </Button>
          </div>
        </TabsContent>
        
        {/* Nutrition Analysis Tab */}
        <TabsContent value="nutrition">
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
            <h3 className="text-xl font-medium mb-4">Nutrition Analysis</h3>
            
            <div className="space-y-6">
              <NutritionProgressBar
                label="Daily Calories"
                current={nutritionSummary.calories.actual}
                target={nutritionSummary.calories.target}
                unit="kcal"
              />
              
              <NutritionProgressBar
                label="Protein"
                current={nutritionSummary.protein.actual}
                target={nutritionSummary.protein.target}
                color="bg-blue-500"
              />
              
              <NutritionProgressBar
                label="Carbohydrates"
                current={nutritionSummary.carbs.actual}
                target={nutritionSummary.carbs.target}
                color="bg-amber-500"
              />
              
              <NutritionProgressBar
                label="Fats"
                current={nutritionSummary.fat.actual}
                target={nutritionSummary.fat.target}
                color="bg-purple-500"
              />
            </div>

            <div className="border-t border-neutral-200 mt-6 pt-6">
              <h4 className="font-medium mb-3">Budget Analysis</h4>
              <NutritionProgressBar
                label="Weekly Budget"
                current={nutritionSummary.budget.actual * 7} // Weekly cost
                target={nutritionSummary.budget.target}
                unit="$"
                color={validationStatus.budgetExceeded ? "bg-red-500" : "bg-green-500"}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("configure")}
            >
              Back to Meal Configuration
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={validationStatus.budgetExceeded}
            >
              Continue to Summary
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealConfigPage;