import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/useUserStore";
import { useRecommendStore, FoodItem } from "@/stores/useRecommendStore";
import { Button } from "@/components/ui/button";
import { MealTime } from "@/types";
import { getRecommendedFoods } from "@/api/mealApi";
import { useToast } from "@/hooks/use-toast";

// Import our new components
import MealTypeTabs from "@/components/MealTypeTabs";
import FoodCardList from "@/components/FoodCardList";
import FoodDetailModal from "@/components/FoodDetailModal";

const RecommendPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore(state => state.userInfo);
  const { 
    selectedFoods, 
    addFood, 
    removeFood, 
    clearFoods, 
    setRecommendationData,
    fallback
  } = useRecommendStore();
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [activeMealType, setActiveMealType] = useState<MealTime>('breakfast');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Group foods by meal type
  const [mealTypeFoods, setMealTypeFoods] = useState<{
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
  }>({
    breakfast: [],
    lunch: [],
    dinner: []
  });

  // Fetch recommended foods on component mount
  useEffect(() => {
    const fetchRecommendedFoods = async () => {
      setLoading(true);
      try {
        // Check if user info is available
        if (!userInfo.height || !userInfo.weight || !userInfo.goal) {
          toast({
            title: "Missing information",
            description: "Please complete your profile first.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Fetch recommended foods
        const data = await getRecommendedFoods(userInfo);
        setFoods(data);
        
        // Generate meal type groupings
        // Ensure foods are properly distributed and have unique IDs
        const breakfastFoods = data
          .filter((_, i) => i % 3 === 0)
          .map((food, index) => ({
            ...food,
            id: `breakfast-${food.id}`
          }));
        
        const lunchFoods = data
          .filter((_, i) => i % 3 === 1)
          .map((food, index) => ({
            ...food,
            id: `lunch-${food.id}`
          }));
        
        const dinnerFoods = data
          .filter((_, i) => i % 3 === 2)
          .map((food, index) => ({
            ...food,
            id: `dinner-${food.id}`
          }));
        
        setMealTypeFoods({
          breakfast: breakfastFoods,
          lunch: lunchFoods,
          dinner: dinnerFoods
        });
        
        // Create summary data for the recommendation store
        // In a real app, this would come from the API
        const mockSummary = {
          calories: { target: 2000, actual: 1800 },
          protein: { target: 150, actual: 120 },
          fat: { target: 65, actual: 55 },
          carbs: { target: 250, actual: 220 },
          budget: { target: userInfo.budget, actual: data.reduce((sum, food) => sum + food.price, 0) },
          allergy: false
        };
        
        // Store in the global recommendation store
        setRecommendationData({
          meals: [breakfastFoods, lunchFoods, dinnerFoods],
          summary: mockSummary,
          fallback: false
        });
      } catch (error) {
        console.error("Error fetching recommended foods:", error);
        toast({
          title: "Error",
          description: "Failed to fetch food recommendations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedFoods();
    
    // Clear selected foods when component mounts
    clearFoods();
  }, [userInfo, navigate, toast, clearFoods, setRecommendationData]);

  // Handle meal type tab change
  const handleMealTypeChange = (mealType: MealTime) => {
    setActiveMealType(mealType);
  };

  // Handle food selection
  const handleSelectFood = (food: FoodItem) => {
    if (selectedFoods.some(f => f.id === food.id)) {
      removeFood(food.id);
    } else {
      addFood(food);
    }
  };

  // Open food detail modal
  const handleViewDetails = (food: FoodItem) => {
    setSelectedFood(food);
    setIsDetailModalOpen(true);
  };

  // Close food detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFood(null);
  };

  // Handle retry when in fallback mode
  const handleRetry = async () => {
    setLoading(true);
    try {
      const data = await getRecommendedFoods(userInfo);
      setFoods(data);
      toast({
        title: "Recommendations updated",
        description: "We've refreshed your food recommendations.",
      });
    } catch (error) {
      console.error("Error retrying recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to refresh recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Continue to meal configuration
  const handleContinue = () => {
    if (selectedFoods.length === 0) {
      toast({
        title: "No foods selected",
        description: "Please select at least one food item.",
        variant: "destructive",
      });
      return;
    }
    navigate("/meal-config");
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Your Recommended Foods</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Based on your profile, we've selected these foods that match your nutritional needs and budget. 
          Select items to add to your meal plan.
        </p>
      </div>

      {/* Meal Type Tabs */}
      <MealTypeTabs 
        activeMealType={activeMealType} 
        onTabChange={handleMealTypeChange} 
      />

      {/* Food Recommendations */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-neutral-600">Loading recommended foods...</p>
        </div>
      ) : (
        <>
          {/* Show alert if in fallback mode */}
          {fallback && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
              <h3 className="text-amber-800 font-medium">Using Fallback Recommendations</h3>
              <p className="text-amber-700 text-sm mt-1">
                We couldn't generate personalized recommendations based on your profile. 
                We're showing alternative options instead.
              </p>
              <Button 
                variant="outline" 
                className="mt-3 text-amber-700 border-amber-300"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </div>
          )}

          <FoodCardList
            foods={mealTypeFoods[activeMealType]}
            userInfo={userInfo}
            selectedFoods={selectedFoods}
            onSelectFood={handleSelectFood}
            onViewDetails={handleViewDetails}
          />

          {/* Selected Food Count and Continue Button */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-neutral-600">
              {selectedFoods.length > 0 ? (
                <span>You've selected {selectedFoods.length} foods for your meal plan.</span>
              ) : (
                <span>Select foods to add to your meal plan.</span>
              )}
            </div>
            <Button 
              onClick={handleContinue}
              className="bg-primary hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Continue to Meal Configuration
            </Button>
          </div>
        </>
      )}

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFood}
        isOpen={isDetailModalOpen}
        isSelected={selectedFood ? selectedFoods.some(f => f.id === selectedFood.id) : false}
        onClose={handleCloseDetailModal}
        onSelect={handleSelectFood}
      />
    </div>
  );
};

export default RecommendPage;
