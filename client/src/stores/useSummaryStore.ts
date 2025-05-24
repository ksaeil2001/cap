import { create } from 'zustand';
import { FoodItem } from '@/stores/useRecommendStore';
import { useUserStore } from '@/stores/useUserStore';
import { useMealConfigStore } from '@/stores/useMealConfigStore';

// Type definition for a day in the weekly plan
export interface WeeklyPlanDay {
  day: string;
  meals: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    [key: string]: FoodItem[];
  };
  totalCalories: number;
  totalCost: number;
}

// Type definition for nutrition data
interface NutritionData {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  fiberTarget: number;
  averageCalories: number;
  calorieTarget: number;
}

// Type definition for budget data
interface BudgetData {
  weeklyBudget: number;
  actualSpend: number;
  savings: number;
  mealCosts: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  mealCostPercentages: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
}

// Summary store interface
interface SummaryStore {
  weeklyPlan: WeeklyPlanDay[];
  nutritionData: NutritionData;
  budgetData: BudgetData;
  generateWeeklyPlan: () => void;
  exportMealPlan: () => string;
}

// Initial nutrition data
const initialNutritionData: NutritionData = {
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
  proteinTarget: 0,
  carbsTarget: 0,
  fatsTarget: 0,
  fiberTarget: 0,
  averageCalories: 0,
  calorieTarget: 0,
};

// Initial budget data
const initialBudgetData: BudgetData = {
  weeklyBudget: 0,
  actualSpend: 0,
  savings: 0,
  mealCosts: {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  },
  mealCostPercentages: {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  },
};

// Days of the week
const daysOfWeek = [
  'Monday',
  'Sunday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Create the summary store
export const useSummaryStore = create<SummaryStore>((set, get) => ({
  // Initial state
  weeklyPlan: [],
  nutritionData: initialNutritionData,
  budgetData: initialBudgetData,

  // Generate the weekly meal plan
  generateWeeklyPlan: () => {
    const userInfo = useUserStore.getState().userInfo;
    const { meals, nutritionSummary } = useMealConfigStore.getState();
    
    // Calculate daily meal costs
    const dailyBreakfastCost = meals.breakfast.reduce((sum, food) => sum + (food.price || 0), 0);
    const dailyLunchCost = meals.lunch.reduce((sum, food) => sum + (food.price || 0), 0);
    const dailyDinnerCost = meals.dinner.reduce((sum, food) => sum + (food.price || 0), 0);
    
    // Calculate daily calories
    const dailyCalories = 
      meals.breakfast.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0) +
      meals.lunch.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0) +
      meals.dinner.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0);
    
    // Calculate daily cost
    const dailyCost = dailyBreakfastCost + dailyLunchCost + dailyDinnerCost;
    
    // Generate weekly plan
    const weeklyPlan: WeeklyPlanDay[] = daysOfWeek.map(day => ({
      day,
      meals: {
        breakfast: [...meals.breakfast],
        lunch: [...meals.lunch],
        dinner: [...meals.dinner],
      },
      totalCalories: dailyCalories,
      totalCost: dailyCost,
    }));

    // Calculate total nutrition values
    const totalProtein = nutritionSummary?.protein.actual || 0;
    const totalCarbs = nutritionSummary?.carbs.actual || 0;
    const totalFat = nutritionSummary?.fat.actual || 0;
    const totalFiber = 0; // Placeholder since we don't have fiber data yet
    
    // Calculate target nutrition values based on user goals
    const proteinTarget = nutritionSummary?.protein.target || 0;
    const carbsTarget = nutritionSummary?.carbs.target || 0;
    const fatsTarget = nutritionSummary?.fat.target || 0;
    const fiberTarget = 25; // Default fiber target
    
    // Calculate average calories
    const averageCalories = nutritionSummary?.calories.actual || 0;
    const calorieTarget = nutritionSummary?.calories.target || 0;
    
    // Create nutrition data object
    const nutritionData: NutritionData = {
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFat,
      fiber: totalFiber,
      proteinTarget,
      carbsTarget,
      fatsTarget,
      fiberTarget,
      averageCalories,
      calorieTarget,
    };
    
    // Calculate budget metrics
    const weeklyBudget = userInfo.budget || 0;
    const actualSpend = dailyCost * 7;
    const savings = weeklyBudget - actualSpend;
    
    // Calculate meal cost percentages
    const totalDailyCost = dailyBreakfastCost + dailyLunchCost + dailyDinnerCost;
    const breakfastPercentage = totalDailyCost > 0 ? (dailyBreakfastCost / totalDailyCost) * 100 : 0;
    const lunchPercentage = totalDailyCost > 0 ? (dailyLunchCost / totalDailyCost) * 100 : 0;
    const dinnerPercentage = totalDailyCost > 0 ? (dailyDinnerCost / totalDailyCost) * 100 : 0;
    
    // Create budget data object
    const budgetData: BudgetData = {
      weeklyBudget,
      actualSpend,
      savings,
      mealCosts: {
        breakfast: dailyBreakfastCost,
        lunch: dailyLunchCost,
        dinner: dailyDinnerCost,
      },
      mealCostPercentages: {
        breakfast: breakfastPercentage,
        lunch: lunchPercentage,
        dinner: dinnerPercentage,
      },
    };
    
    // Update state
    set({
      weeklyPlan,
      nutritionData,
      budgetData,
    });
  },
  
  // Export the meal plan as text
  exportMealPlan: () => {
    const { weeklyPlan, nutritionData, budgetData } = get();
    const userInfo = useUserStore.getState().userInfo;
    
    // Create a string representation of the meal plan
    let exportText = `PERSONALIZED MEAL PLAN\n`;
    exportText += `====================\n\n`;
    
    // Add user info
    exportText += `USER PROFILE\n`;
    exportText += `-----------\n`;
    exportText += `Gender: ${userInfo.gender}\n`;
    exportText += `Age: ${userInfo.age}\n`;
    exportText += `Height: ${userInfo.height} cm\n`;
    exportText += `Weight: ${userInfo.weight} kg\n`;
    exportText += `Goal: ${userInfo.goal}\n`;
    exportText += `Activity Level: ${userInfo.activityLevel}\n`;
    exportText += `Weekly Budget: $${userInfo.budget.toFixed(2)}\n\n`;
    
    // Add nutrition summary
    exportText += `NUTRITION SUMMARY\n`;
    exportText += `----------------\n`;
    exportText += `Daily Calories: ${Math.round(nutritionData.averageCalories)} kcal\n`;
    exportText += `Protein: ${Math.round(nutritionData.protein)}g\n`;
    exportText += `Carbohydrates: ${Math.round(nutritionData.carbs)}g\n`;
    exportText += `Fats: ${Math.round(nutritionData.fats)}g\n\n`;
    
    // Add budget summary
    exportText += `BUDGET SUMMARY\n`;
    exportText += `--------------\n`;
    exportText += `Weekly Budget: $${budgetData.weeklyBudget.toFixed(2)}\n`;
    exportText += `Actual Spend: $${budgetData.actualSpend.toFixed(2)}\n`;
    exportText += `Savings: $${budgetData.savings.toFixed(2)}\n\n`;
    
    // Add weekly plan
    exportText += `WEEKLY MEAL PLAN\n`;
    exportText += `---------------\n\n`;
    
    weeklyPlan.forEach(day => {
      exportText += `${day.day.toUpperCase()}\n`;
      exportText += `${'-'.repeat(day.day.length)}\n`;
      
      // Breakfast
      exportText += `Breakfast:\n`;
      if (day.meals.breakfast.length > 0) {
        day.meals.breakfast.forEach(food => {
          exportText += `- ${food.name} (${food.calories || food.kcal || 0} kcal, $${food.price?.toFixed(2) || 0})\n`;
        });
      } else {
        exportText += `- No breakfast items\n`;
      }
      
      // Lunch
      exportText += `\nLunch:\n`;
      if (day.meals.lunch.length > 0) {
        day.meals.lunch.forEach(food => {
          exportText += `- ${food.name} (${food.calories || food.kcal || 0} kcal, $${food.price?.toFixed(2) || 0})\n`;
        });
      } else {
        exportText += `- No lunch items\n`;
      }
      
      // Dinner
      exportText += `\nDinner:\n`;
      if (day.meals.dinner.length > 0) {
        day.meals.dinner.forEach(food => {
          exportText += `- ${food.name} (${food.calories || food.kcal || 0} kcal, $${food.price?.toFixed(2) || 0})\n`;
        });
      } else {
        exportText += `- No dinner items\n`;
      }
      
      exportText += `\nDaily Totals: ${Math.round(day.totalCalories)} kcal, $${day.totalCost.toFixed(2)}\n\n`;
      exportText += `${'-'.repeat(40)}\n\n`;
    });
    
    return exportText;
  },
}));

export default useSummaryStore;