import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AlertCustom from '@/components/ui/alert-custom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useMealConfigStore } from '@/stores/useMealConfigStore';
import { useRecommendStore } from '@/stores/useRecommendStore';
import { useUserStore } from '@/stores/useUserStore';
import MealSlot from '@/components/MealSlot';
import { FoodItem } from '@/api/mockRecommend';
import { formatCurrency } from '@/lib/utils';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import { MealTime } from '@/stores/useMealConfigStore';

const mealTypes: { id: MealTime; label: string; iconType: 'primary' | 'secondary' | 'accent' }[] = [
  { id: 'breakfast', label: 'Breakfast', iconType: 'primary' },
  { id: 'lunch', label: 'Lunch', iconType: 'secondary' },
  { id: 'dinner', label: 'Dinner', iconType: 'accent' }
];

const MealConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MealTime>('breakfast');
  
  // Get data from stores
  const {
    meals,
    nutritionSummary,
    validationStatus,
    addFoodToMeal,
    removeFoodFromMeal,
    getMealTotalCalories,
    getMealTotalCost,
    updateNutritionSummary,
    isReadyForSummary
  } = useMealConfigStore();
  
  const { recommendedFoods, filteredFoods, filterByMealType, clearFilters } = useRecommendStore();
  const userInfo = useUserStore();
  
  // Initialize nutrition summary when component mounts
  useEffect(() => {
    updateNutritionSummary();
    // Load recommendations for the first tab
    clearFilters();
    filterByMealType(activeTab);
  }, []);
  
  // Handle tab change
  const handleTabChange = (mealType: MealTime) => {
    setActiveTab(mealType);
    clearFilters();
    filterByMealType(mealType);
  };
  
  // Handle add food
  const handleAddFood = (mealType: MealTime, food: FoodItem) => {
    addFoodToMeal(mealType, food);
  };
  
  // Handle remove food
  const handleRemoveFood = (mealType: MealTime, foodId: string) => {
    removeFoodFromMeal(mealType, foodId);
  };
  
  // Navigate to previous page
  const goBack = () => {
    navigate('/recommend');
  };
  
  // Navigate to summary page if validation passes
  const goToSummary = () => {
    if (isReadyForSummary()) {
      navigate('/summary');
    }
  };
  
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Configure Your Meals</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recommendations
            </Button>
            <Button 
              onClick={goToSummary}
              disabled={!isReadyForSummary()}
            >
              View Summary
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Validation Alerts */}
        <div className="space-y-3">
          {validationStatus.budgetExceeded && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Budget Exceeded</AlertTitle>
              <AlertDescription>
                Your meal selections exceed your daily budget of {formatCurrency(nutritionSummary.budget.target)}.
                Current total: {formatCurrency(nutritionSummary.budget.actual)}
              </AlertDescription>
            </Alert>
          )}
          
          {validationStatus.hasAllergies && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Allergies Detected</AlertTitle>
              <AlertDescription>
                Your meal plan contains foods that conflict with your allergy preferences.
                Please review and adjust your selections.
              </AlertDescription>
            </Alert>
          )}
          
          {validationStatus.missingMeals && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Incomplete Meal Plan</AlertTitle>
              <AlertDescription>
                Please add at least one food item to each meal (breakfast, lunch, and dinner).
              </AlertDescription>
            </Alert>
          )}
          
          {isReadyForSummary() && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Meal Plan Ready</AlertTitle>
              <AlertDescription>
                Your meal plan is complete and meets all requirements. You can proceed to the summary.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Selected Meals */}
          <div className="col-span-1 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Meal Plan</CardTitle>
                <CardDescription>
                  Configure your daily meals by adding or removing food items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Nutrition Summary */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Summary</CardTitle>
                <CardDescription>
                  Track your nutritional goals and budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NutritionProgressBar
                  label="Calories"
                  current={nutritionSummary.calories.actual}
                  target={nutritionSummary.calories.target}
                  unit="kcal"
                  color="blue"
                />
                
                <NutritionProgressBar
                  label="Protein"
                  current={nutritionSummary.protein.actual}
                  target={nutritionSummary.protein.target}
                  unit="g"
                  color="purple"
                />
                
                <NutritionProgressBar
                  label="Carbs"
                  current={nutritionSummary.carbs.actual}
                  target={nutritionSummary.carbs.target}
                  unit="g"
                  color="orange"
                />
                
                <NutritionProgressBar
                  label="Fat"
                  current={nutritionSummary.fat.actual}
                  target={nutritionSummary.fat.target}
                  unit="g"
                  color="yellow"
                />
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Daily Budget</h3>
                    <div className={`flex items-center ${nutritionSummary.budget.actual > nutritionSummary.budget.target ? 'text-red-500' : 'text-green-500'}`}>
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>
                        {formatCurrency(nutritionSummary.budget.actual)} / {formatCurrency(nutritionSummary.budget.target)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recommendations for Current Meal */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>Add Food to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</CardTitle>
                <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as MealTime)}>
                  <TabsList className="grid grid-cols-3">
                    {mealTypes.map((mealType) => (
                      <TabsTrigger key={mealType.id} value={mealType.id}>
                        {mealType.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {filteredFoods.length > 0 ? (
                    filteredFoods.map((food: FoodItem) => (
                      <div
                        key={food.id}
                        className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleAddFood(activeTab, food)}
                      >
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <div className="text-sm text-gray-500 flex gap-3">
                            <span>{food.kcal} kcal</span>
                            <span>{formatCurrency(food.price)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Add</Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No recommendations available. Please go back to the recommendation page to get suggestions.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/recommend')}>
                  Back to Recommendations
                </Button>
                <Button 
                  onClick={() => navigate('/summary')}
                  disabled={!isReadyForSummary()}
                >
                  View Summary
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealConfigPage;