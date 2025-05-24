import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/useUserStore";
import { useRecommendStore } from "@/stores/useRecommendStore";
import { Button } from "@/components/ui/button";
import FoodCard from "@/components/FoodCard";
import { Food } from "@/types";
import { getRecommendedFoods } from "@/api/mealApi";
import { useToast } from "@/hooks/use-toast";

const foodCategories = [
  { id: "all", label: "All Foods" },
  { id: "protein", label: "Proteins" },
  { id: "carb", label: "Carbs" },
  { id: "vegetable", label: "Vegetables" },
  { id: "fruit", label: "Fruits" },
];

const RecommendPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore(state => state.userInfo);
  const { selectedFoods, addFood, removeFood, clearFoods } = useRecommendStore();
  
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState<Food[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);

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
        setFilteredFoods(data);
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
  }, [userInfo, navigate, toast, clearFoods]);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredFoods(foods);
    } else {
      setFilteredFoods(foods.filter(food => 
        food.category.toLowerCase() === activeCategory.toLowerCase()
      ));
    }
  }, [activeCategory, foods]);

  const handleSelectFood = (food: Food) => {
    if (selectedFoods.some(f => f.id === food.id)) {
      removeFood(food.id);
    } else {
      addFood(food);
    }
  };

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
          Based on your profile, we've selected these foods that match your nutritional needs and budget. Select items to add to your meal plan.
        </p>
      </div>

      {/* Food Category Tabs */}
      <div className="mb-8">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {foodCategories.map(category => (
              <button
                key={category.id}
                className={`py-4 px-1 font-medium ${
                  activeCategory === category.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Food Recommendations */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-neutral-600">Loading recommended foods...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map(food => (
              <FoodCard 
                key={food.id}
                food={food}
                isSelected={selectedFoods.some(f => f.id === food.id)}
                onSelect={handleSelectFood}
              />
            ))}
          </div>

          {filteredFoods.length === 0 && (
            <div className="text-center py-10">
              <p className="text-neutral-600">No foods found in this category.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button 
              onClick={handleContinue}
              className="bg-primary hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Continue to Meal Configuration
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendPage;
