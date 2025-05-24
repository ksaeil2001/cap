import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMealConfigStore } from "@/stores/useMealConfigStore";
import { useUserStore } from "@/stores/useUserStore";
import { useSummaryStore } from "@/stores/useSummaryStore";
import { Button } from "@/components/ui/button";
import NutritionProgressBar from "@/components/NutritionProgressBar";
import { formatCurrency, getPercentage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const SummaryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const meals = useMealConfigStore(state => state.meals);
  const userInfo = useUserStore(state => state.userInfo);
  const { generateWeeklyPlan, weeklyPlan, nutritionData, budgetData } = useSummaryStore();

  useEffect(() => {
    // Check if meals are configured
    const hasMeals = Object.values(meals).some(mealFoods => mealFoods.length > 0);
    
    if (!hasMeals) {
      toast({
        title: "No meals configured",
        description: "Please configure your meals first.",
        variant: "destructive",
      });
      navigate("/meal-config");
      return;
    }

    // Generate weekly plan
    generateWeeklyPlan(meals, userInfo);
  }, [meals, userInfo, generateWeeklyPlan, navigate, toast]);

  const handleExportPlan = () => {
    toast({
      title: "Plan Exported",
      description: "Your meal plan has been exported successfully.",
    });
  };

  const handleSharePlan = () => {
    toast({
      title: "Plan Shared",
      description: "Your meal plan has been shared successfully.",
    });
  };

  const handleEditPlan = () => {
    navigate("/meal-config");
  };

  const handleGenerateShoppingList = () => {
    toast({
      title: "Shopping List Generated",
      description: "Your shopping list has been generated successfully.",
    });
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Your Meal Plan Summary</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Here's a complete summary of your personalized meal plan, nutritional breakdown, and budget analysis.
        </p>
      </div>

      {/* Hero Image */}
      <img 
        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400" 
        alt="Colorful healthy meal with various foods" 
        className="w-full h-64 object-cover rounded-xl mb-8" 
      />
      
      {/* Weekly Meal Plan */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="font-heading font-semibold text-xl mb-4">Weekly Meal Plan</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-600">Day</th>
                <th className="py-3 px-4 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-600">Breakfast</th>
                <th className="py-3 px-4 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-600">Lunch</th>
                <th className="py-3 px-4 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-600">Dinner</th>
                <th className="py-3 px-4 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-600">Calories</th>
                <th className="py-3 px-4 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-600">Cost</th>
              </tr>
            </thead>
            <tbody>
              {weeklyPlan.map((day, index) => (
                <tr key={day.day} className={index % 2 === 1 ? "bg-neutral-50" : ""}>
                  <td className="py-3 px-4 border-b border-neutral-100 text-sm text-neutral-700 font-medium">
                    {day.day}
                  </td>
                  <td className="py-3 px-4 border-b border-neutral-100 text-sm text-neutral-600">
                    {day.meals.breakfast.map(f => f.name).join(", ")}
                  </td>
                  <td className="py-3 px-4 border-b border-neutral-100 text-sm text-neutral-600">
                    {day.meals.lunch.map(f => f.name).join(", ")}
                  </td>
                  <td className="py-3 px-4 border-b border-neutral-100 text-sm text-neutral-600">
                    {day.meals.dinner.map(f => f.name).join(", ")}
                  </td>
                  <td className="py-3 px-4 border-b border-neutral-100 text-sm text-neutral-700">
                    {day.totalCalories} kcal
                  </td>
                  <td className="py-3 px-4 border-b border-neutral-100 text-sm text-neutral-700">
                    {formatCurrency(day.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nutrition Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-heading font-semibold text-xl mb-4">Nutritional Breakdown</h3>
          
          <NutritionProgressBar
            label="Protein"
            current={nutritionData.protein}
            target={nutritionData.proteinTarget}
            unit="g"
            color="bg-secondary"
          />
          
          <NutritionProgressBar
            label="Carbohydrates"
            current={nutritionData.carbs}
            target={nutritionData.carbsTarget}
            unit="g"
            color="bg-accent"
          />
          
          <NutritionProgressBar
            label="Fats"
            current={nutritionData.fats}
            target={nutritionData.fatsTarget}
            unit="g"
            color="bg-primary"
          />
          
          <NutritionProgressBar
            label="Fiber"
            current={nutritionData.fiber}
            target={nutritionData.fiberTarget}
            unit="g"
            color="bg-neutral-700"
          />
          
          <div className="mt-8 pt-4 border-t border-neutral-100">
            <div className="flex items-center flex-wrap">
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                <span className="text-xs text-neutral-600">Protein</span>
              </div>
              
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
                <span className="text-xs text-neutral-600">Carbs</span>
              </div>
              
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span className="text-xs text-neutral-600">Fats</span>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-neutral-700 mr-2"></div>
                <span className="text-xs text-neutral-600">Fiber</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-heading font-semibold text-xl mb-4">Budget Analysis</h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-neutral-600 text-sm">Weekly Budget</p>
                <p className="text-2xl font-semibold">{formatCurrency(budgetData.weeklyBudget)}</p>
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Actual Spend</p>
                <p className="text-2xl font-semibold text-primary">{formatCurrency(budgetData.actualSpend)}</p>
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Savings</p>
                <p className="text-2xl font-semibold text-accent">{formatCurrency(budgetData.savings)}</p>
              </div>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-4 mb-2">
              <div 
                className="bg-primary h-4 rounded-full" 
                style={{ width: `${getPercentage(budgetData.actualSpend, budgetData.weeklyBudget)}%` }}
              ></div>
            </div>
            <p className="text-xs text-neutral-500">
              You're using {getPercentage(budgetData.actualSpend, budgetData.weeklyBudget)}% of your weekly budget
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3">Expense Breakdown</h4>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-neutral-50 p-3 rounded-md">
                <p className="text-xs text-neutral-500 mb-1">Breakfast</p>
                <p className="font-semibold">{formatCurrency(budgetData.mealCosts.breakfast)}</p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-md">
                <p className="text-xs text-neutral-500 mb-1">Lunch</p>
                <p className="font-semibold">{formatCurrency(budgetData.mealCosts.lunch)}</p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-md">
                <p className="text-xs text-neutral-500 mb-1">Dinner</p>
                <p className="font-semibold">{formatCurrency(budgetData.mealCosts.dinner)}</p>
              </div>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-2 mb-1">
              <div 
                className="bg-primary-200 h-2 rounded-l-full" 
                style={{ width: `${budgetData.mealCostPercentages.breakfast}%` }}
              ></div>
              <div 
                className="bg-primary-400 h-2" 
                style={{ 
                  width: `${budgetData.mealCostPercentages.lunch}%`, 
                  marginLeft: `${budgetData.mealCostPercentages.breakfast}%` 
                }}
              ></div>
              <div 
                className="bg-primary-600 h-2 rounded-r-full" 
                style={{ 
                  width: `${budgetData.mealCostPercentages.dinner}%`, 
                  marginLeft: `${budgetData.mealCostPercentages.breakfast + budgetData.mealCostPercentages.lunch}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-neutral-500">{budgetData.mealCostPercentages.breakfast}%</span>
              <span className="text-xs text-neutral-500">{budgetData.mealCostPercentages.lunch}%</span>
              <span className="text-xs text-neutral-500">{budgetData.mealCostPercentages.dinner}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Health Insights */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-heading font-semibold text-xl mb-4">Health Insights</h3>
          
          <div className="mb-4">
            <div className="flex items-start mb-3">
              <div className="bg-primary-100 p-2 rounded-md text-primary-600 mr-3">
                <i className="ri-heart-pulse-line"></i>
              </div>
              <div>
                <h4 className="font-medium text-neutral-800">Balanced Macronutrients</h4>
                <p className="text-sm text-neutral-600">Your meal plan provides a balanced ratio of proteins, carbs, and fats to support your {userInfo.goal === 'muscle-gain' ? 'muscle gain' : 'weight loss'} goal.</p>
              </div>
            </div>
            
            <div className="flex items-start mb-3">
              <div className="bg-accent-100 p-2 rounded-md text-accent-600 mr-3">
                <i className="ri-scales-3-line"></i>
              </div>
              <div>
                <h4 className="font-medium text-neutral-800">Caloric Target</h4>
                <p className="text-sm text-neutral-600">
                  {nutritionData.averageCalories < nutritionData.calorieTarget 
                    ? "Your daily intake is slightly below your target. Consider adding a small snack to reach optimal levels."
                    : "Your daily caloric intake is optimal for your goals. Great job balancing your meals!"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-secondary-100 p-2 rounded-md text-secondary-600 mr-3">
                <i className="ri-mental-health-line"></i>
              </div>
              <div>
                <h4 className="font-medium text-neutral-800">Nutrient Rich</h4>
                <p className="text-sm text-neutral-600">Your selections provide excellent sources of omega-3 fatty acids, fiber, and essential vitamins.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Items */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-heading font-semibold text-xl mb-4">Next Steps</h3>
          
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Button
                onClick={handleExportPlan}
                className="flex-1 bg-primary hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mr-3"
              >
                <i className="ri-download-line mr-2"></i> Export Plan
              </Button>
              <Button
                onClick={handleSharePlan}
                className="flex-1 bg-secondary hover:bg-secondary-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
              >
                <i className="ri-share-line mr-2"></i> Share Plan
              </Button>
            </div>
            
            <Button
              onClick={handleEditPlan}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary-50 font-medium py-3 px-4 rounded-md transition-colors duration-200 mb-4"
            >
              <i className="ri-edit-line mr-2"></i> Edit Meal Plan
            </Button>
            
            <Button
              onClick={handleGenerateShoppingList}
              variant="outline"
              className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              <i className="ri-shopping-cart-line mr-2"></i> Generate Shopping List
            </Button>
          </div>
          
          <div className="text-sm text-neutral-600">
            <p className="mb-2">Looking for more guidance?</p>
            <a href="#" className="text-primary hover:text-primary-700 font-medium">
              Connect with a nutrition expert <i className="ri-arrow-right-line"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
