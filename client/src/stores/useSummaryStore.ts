import { create } from 'zustand';
import { useMealConfigStore } from './useMealConfigStore';
import { useUserStore } from './useUserStore';
import { MealTime } from '@/types';
import { FoodItem } from './useRecommendStore';

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
  calorieTarget: 0
};

// Initial budget data
const initialBudgetData: BudgetData = {
  weeklyBudget: 0,
  actualSpend: 0,
  savings: 0,
  mealCosts: {
    breakfast: 0,
    lunch: 0,
    dinner: 0
  },
  mealCostPercentages: {
    breakfast: 0,
    lunch: 0,
    dinner: 0
  }
};

// Days of the week
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const useSummaryStore = create<SummaryStore>((set, get) => ({
  // Initial state
  weeklyPlan: [],
  nutritionData: initialNutritionData,
  budgetData: initialBudgetData,
  
  // Generate weekly meal plan based on current meal configuration
  generateWeeklyPlan: () => {
    const mealConfig = useMealConfigStore.getState().meals;
    const userInfo = useUserStore.getState().userInfo;
    
    // Create a plan for each day of the week
    const weeklyPlan: WeeklyPlanDay[] = daysOfWeek.map(day => {
      // Slightly vary the meals each day for variety
      // This is a simple approach - in a real app, you might have more complex logic
      const dailyMeals = {
        breakfast: [...mealConfig.breakfast].sort(() => Math.random() - 0.5),
        lunch: [...mealConfig.lunch].sort(() => Math.random() - 0.5),
        dinner: [...mealConfig.dinner].sort(() => Math.random() - 0.5)
      };
      
      // Calculate total calories and cost for the day
      const allDailyFoods = [
        ...dailyMeals.breakfast,
        ...dailyMeals.lunch,
        ...dailyMeals.dinner
      ];
      
      const totalCalories = allDailyFoods.reduce((sum, food) => sum + food.calories, 0);
      const totalCost = allDailyFoods.reduce((sum, food) => sum + food.price, 0);
      
      return {
        day,
        meals: dailyMeals,
        totalCalories,
        totalCost
      };
    });
    
    // Calculate nutrition data
    const allConfigFoods = [
      ...mealConfig.breakfast,
      ...mealConfig.lunch,
      ...mealConfig.dinner
    ];
    
    // Calculate average values across the configured meals
    const totalProtein = allConfigFoods.reduce((sum, food) => {
      if (food.mainNutrient.name.toLowerCase() === 'protein') {
        return sum + food.mainNutrient.amount;
      }
      return sum;
    }, 0);
    
    const totalCarbs = allConfigFoods.reduce((sum, food) => {
      if (food.mainNutrient.name.toLowerCase() === 'carbs') {
        return sum + food.mainNutrient.amount;
      }
      return sum;
    }, 0);
    
    const totalFats = allConfigFoods.reduce((sum, food) => {
      if (food.mainNutrient.name.toLowerCase() === 'fats') {
        return sum + food.mainNutrient.amount;
      }
      return sum;
    }, 0);
    
    const totalFiber = allConfigFoods.reduce((sum, food) => {
      if (food.mainNutrient.name.toLowerCase() === 'fiber') {
        return sum + food.mainNutrient.amount;
      }
      return sum;
    }, 0);
    
    const totalCalories = allConfigFoods.reduce((sum, food) => sum + food.calories, 0);
    
    // Calculate BMR and daily calorie target based on user info
    let bmr = 0;
    if (userInfo.gender === 'male') {
      bmr = 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age + 5;
    } else {
      bmr = 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age - 161;
    }
    
    // Apply activity multiplier
    let calorieTarget = bmr;
    if (userInfo.activityLevel === 'low') {
      calorieTarget *= 1.2;
    } else if (userInfo.activityLevel === 'medium') {
      calorieTarget *= 1.55;
    } else if (userInfo.activityLevel === 'high') {
      calorieTarget *= 1.9;
    } else {
      calorieTarget *= 1.2; // Default to sedentary
    }
    
    // Adjust based on goal
    if (userInfo.goal === 'weight-loss') {
      calorieTarget *= 0.8; // 20% deficit
    } else if (userInfo.goal === 'muscle-gain') {
      calorieTarget *= 1.1; // 10% surplus
    }
    
    // Set macronutrient targets
    const proteinTarget = userInfo.weight * (userInfo.goal === 'muscle-gain' ? 2 : 1.5); // g/kg of bodyweight
    const fatsTarget = (calorieTarget * 0.25) / 9; // 25% of calories from fat, 9 calories per gram
    const carbsTarget = (calorieTarget * 0.5) / 4; // 50% of calories from carbs, 4 calories per gram
    const fiberTarget = 25; // General recommendation for fiber
    
    // Calculate meal costs
    const breakfastCost = mealConfig.breakfast.reduce((sum, food) => sum + food.price, 0);
    const lunchCost = mealConfig.lunch.reduce((sum, food) => sum + food.price, 0);
    const dinnerCost = mealConfig.dinner.reduce((sum, food) => sum + food.price, 0);
    
    const totalCost = breakfastCost + lunchCost + dinnerCost;
    
    // Calculate percentages
    const breakfastPercentage = totalCost > 0 ? (breakfastCost / totalCost) * 100 : 0;
    const lunchPercentage = totalCost > 0 ? (lunchCost / totalCost) * 100 : 0;
    const dinnerPercentage = totalCost > 0 ? (dinnerCost / totalCost) * 100 : 0;
    
    // Weekly budget calculations
    const weeklyBudget = userInfo.budget;
    const weeklyCost = totalCost * 7; // Cost for 7 days
    const savings = weeklyBudget - weeklyCost;
    
    set({
      weeklyPlan,
      nutritionData: {
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        fiber: totalFiber,
        proteinTarget,
        carbsTarget,
        fatsTarget,
        fiberTarget,
        averageCalories: totalCalories,
        calorieTarget
      },
      budgetData: {
        weeklyBudget,
        actualSpend: weeklyCost,
        savings,
        mealCosts: {
          breakfast: breakfastCost,
          lunch: lunchCost,
          dinner: dinnerCost
        },
        mealCostPercentages: {
          breakfast: breakfastPercentage,
          lunch: lunchPercentage,
          dinner: dinnerPercentage
        }
      }
    });
  },
  
  // Export meal plan as formatted text
  exportMealPlan: () => {
    const { weeklyPlan, nutritionData, budgetData } = get();
    const userInfo = useUserStore.getState().userInfo;
    
    let exportText = `PERSONALIZED MEAL PLAN\n`;
    exportText += `===============================\n\n`;
    
    exportText += `USER PROFILE:\n`;
    exportText += `- Gender: ${userInfo.gender === 'male' ? 'Male' : 'Female'}\n`;
    exportText += `- Age: ${userInfo.age} years\n`;
    exportText += `- Height: ${userInfo.height} cm\n`;
    exportText += `- Weight: ${userInfo.weight} kg\n`;
    exportText += `- Goal: ${userInfo.goal === 'weight-loss' ? 'Weight Loss' : 'Muscle Gain'}\n`;
    exportText += `- Activity Level: ${userInfo.activityLevel || 'Not specified'}\n\n`;
    
    exportText += `NUTRITION SUMMARY:\n`;
    exportText += `- Daily Calorie Target: ${Math.round(nutritionData.calorieTarget)} kcal\n`;
    exportText += `- Daily Protein Target: ${Math.round(nutritionData.proteinTarget)} g\n`;
    exportText += `- Daily Carbs Target: ${Math.round(nutritionData.carbsTarget)} g\n`;
    exportText += `- Daily Fat Target: ${Math.round(nutritionData.fatsTarget)} g\n\n`;
    
    exportText += `BUDGET SUMMARY:\n`;
    exportText += `- Weekly Budget: $${budgetData.weeklyBudget.toFixed(2)}\n`;
    exportText += `- Estimated Weekly Cost: $${budgetData.actualSpend.toFixed(2)}\n`;
    exportText += `- Projected Savings: $${budgetData.savings.toFixed(2)}\n\n`;
    
    exportText += `WEEKLY MEAL PLAN:\n`;
    exportText += `===============================\n\n`;
    
    weeklyPlan.forEach(day => {
      exportText += `${day.day.toUpperCase()}:\n`;
      exportText += `- Total Calories: ${Math.round(day.totalCalories)} kcal\n`;
      exportText += `- Total Cost: $${day.totalCost.toFixed(2)}\n\n`;
      
      exportText += `  Breakfast:\n`;
      day.meals.breakfast.forEach(food => {
        exportText += `  - ${food.name} (${food.calories} kcal, $${food.price.toFixed(2)})\n`;
      });
      
      exportText += `\n  Lunch:\n`;
      day.meals.lunch.forEach(food => {
        exportText += `  - ${food.name} (${food.calories} kcal, $${food.price.toFixed(2)})\n`;
      });
      
      exportText += `\n  Dinner:\n`;
      day.meals.dinner.forEach(food => {
        exportText += `  - ${food.name} (${food.calories} kcal, $${food.price.toFixed(2)})\n`;
      });
      
      exportText += `\n`;
    });
    
    exportText += `===============================\n`;
    exportText += `Generated on: ${new Date().toLocaleDateString()}\n`;
    
    return exportText;
  }
}));

export default useSummaryStore;