import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useRecommendStore, FoodItem } from '@/stores/useRecommendStore';
import { getRecommendedFoods } from '@/api/mealApi';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import FoodCardList from '@/components/FoodCardList';
import FoodDetailModal from '@/components/FoodDetailModal';
import MealTypeTabs from '@/components/MealTypeTabs';
import { useToast } from '@/hooks/use-toast';

const RecommendPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore(state => state.userInfo);
  
  const { 
    meals, 
    summary, 
    fallback, 
    selectedFoods,
    currentMealType,
    setRecommendations,
    selectFood,
    removeFood,
    setMealType
  } = useRecommendStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verify user has completed profile
        if (!userInfo || !userInfo.gender || !userInfo.age || !userInfo.weight) {
          toast({
            title: "Profile incomplete",
            description: "Please complete your profile information first.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        // Get food recommendations
        const response = await getRecommendedFoods(userInfo);
        setRecommendations(
          response.meals,
          response.summary,
          response.fallback
        );
        
        // Show fallback warning if needed
        if (response.fallback) {
          toast({
            title: "Limited recommendations",
            description: "We've provided alternative options based on your preferences.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setError("Failed to load food recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [userInfo, navigate, toast, setRecommendations]);
  
  // Handle meal type tab change
  const handleMealTypeChange = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setMealType(mealType);
  };
  
  // Handle food selection
  const handleSelectFood = (food: FoodItem) => {
    const isAlreadySelected = selectedFoods.some(f => f.id === food.id);
    
    if (isAlreadySelected) {
      removeFood(food.id);
    } else {
      selectFood(food);
    }
    
    // Close the modal if open
    if (isDetailModalOpen) {
      setIsDetailModalOpen(false);
    }
  };
  
  // Handle viewing food details
  const handleViewDetails = (food: FoodItem) => {
    setSelectedFood(food);
    setIsDetailModalOpen(true);
  };
  
  // Handle continuing to meal configuration
  const handleContinue = () => {
    if (selectedFoods.length === 0) {
      toast({
        title: "No foods selected",
        description: "Please select at least one food item before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/meal-config");
  };
  
  // Get current meal foods
  const getCurrentMealFoods = (): FoodItem[] => {
    const mealIndex = currentMealType === 'breakfast' ? 0 : 
                     currentMealType === 'lunch' ? 1 : 2;
    
    return meals[mealIndex] || [];
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Generating Recommendations</h2>
        <p className="text-neutral-600 mb-8">
          We're finding the perfect meals based on your profile...
        </p>
        
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-[125px] w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-[125px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
        <p className="text-neutral-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Recommended Foods</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          These foods are personalized based on your {userInfo.goal} goal, dietary preferences, and budget of ${userInfo.budget.toFixed(2)} per week.
          Select items you like to include in your meal plan.
        </p>
      </div>
      
      {/* Fallback Warning */}
      {fallback && (
        <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alternative Recommendations</AlertTitle>
          <AlertDescription>
            Due to your dietary restrictions, we've included some alternative options.
            Please check ingredients carefully.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="browse" className="mb-6">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="browse" className="flex-1">Browse Foods</TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1">Nutrition Analysis</TabsTrigger>
        </TabsList>
        
        {/* Browse Foods Tab */}
        <TabsContent value="browse">
          {/* Meal Type Tabs */}
          <MealTypeTabs 
            activeMealType={currentMealType}
            onTabChange={handleMealTypeChange}
          />
          
          {/* Selected Foods Summary */}
          {selectedFoods.length > 0 && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="text-lg font-medium mb-2 text-primary-700">Selected Foods ({selectedFoods.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFoods.map(food => (
                  <Card key={food.id} className="bg-white flex-grow-0">
                    <CardContent className="p-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{food.name}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFood(food.id)}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Food Card List */}
          <div className="mb-6">
            <FoodCardList 
              foods={getCurrentMealFoods()}
              userInfo={userInfo}
              selectedFoods={selectedFoods}
              onSelectFood={handleSelectFood}
              onViewDetails={handleViewDetails}
            />
          </div>
        </TabsContent>
        
        {/* Nutrition Analysis Tab */}
        <TabsContent value="nutrition">
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Nutritional Information</h3>
                  <div className="space-y-6">
                    <NutritionProgressBar
                      label="Daily Calories"
                      current={summary.calories.actual}
                      target={summary.calories.target}
                      unit="kcal"
                    />
                    
                    <NutritionProgressBar
                      label="Protein"
                      current={summary.protein.actual}
                      target={summary.protein.target}
                      color="bg-blue-500"
                    />
                    
                    <NutritionProgressBar
                      label="Carbohydrates"
                      current={summary.carbs.actual}
                      target={summary.carbs.target}
                      color="bg-amber-500"
                    />
                    
                    <NutritionProgressBar
                      label="Fats"
                      current={summary.fat.actual}
                      target={summary.fat.target}
                      color="bg-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Budget Analysis</h3>
                  <NutritionProgressBar
                    label="Daily Budget"
                    current={summary.budget.actual}
                    target={summary.budget.target / 7} // Daily budget
                    unit="$"
                    color="bg-green-500"
                  />
                  
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Weekly Budget:</span>
                      <span className="font-medium">${summary.budget.target.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Daily Cost:</span>
                      <span className="font-medium">${summary.budget.actual.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Weekly Cost (Estimated):</span>
                      <span className="font-medium">${(summary.budget.actual * 7).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Remaining Budget:</span>
                      <span className="font-medium text-green-600">
                        ${(summary.budget.target - summary.budget.actual * 7).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Bottom Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
        >
          Back to Profile
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={selectedFoods.length === 0}
        >
          Continue to Meal Configuration
        </Button>
      </div>
      
      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFood}
        isOpen={isDetailModalOpen}
        isSelected={selectedFood ? selectedFoods.some(f => f.id === selectedFood.id) : false}
        onClose={() => setIsDetailModalOpen(false)}
        onSelect={handleSelectFood}
      />
    </div>
  );
};

export default RecommendPage;