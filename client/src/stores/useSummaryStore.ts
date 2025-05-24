import { create } from 'zustand';
import { Food, MealConfig, MealTime, WeeklyPlanDay } from '@/types';
import { UserInfo } from '@/types';
import { calculateCalories } from '@/lib/utils';

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

interface SummaryStore {
  weeklyPlan: WeeklyPlanDay[];
  nutritionData: NutritionData;
  budgetData: BudgetData;
  generateWeeklyPlan: (meals: MealConfig, userInfo: UserInfo) => void;
}

export const useSummaryStore = create<SummaryStore>((set) => ({
  weeklyPlan: [],
  nutritionData: {
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    proteinTarget: 120,
    carbsTarget: 225,
    fatsTarget: 70,
    fiberTarget: 30,
    averageCalories: 0,
    calorieTarget: 2000,
  },
  budgetData: {
    weeklyBudget: 100,
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
  },
  
  generateWeeklyPlan: (meals, userInfo) => {
    // Generate days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Function to shuffle an array (for variety in the meal plan)
    const shuffleMeals = (array: Food[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    // Create variation for the week
    const breakfastFoods = meals.breakfast.length > 0 ? shuffleMeals(meals.breakfast) : [];
    const lunchFoods = meals.lunch.length > 0 ? shuffleMeals(meals.lunch) : [];
    const dinnerFoods = meals.dinner.length > 0 ? shuffleMeals(meals.dinner) : [];
    
    // Generate daily meal plan
    const weeklyPlan: WeeklyPlanDay[] = days.map((day, index) => {
      const dayBreakfast = breakfastFoods.length > 0 ? breakfastFoods : [];
      const dayLunch = lunchFoods.length > 0 ? lunchFoods : [];
      const dayDinner = dinnerFoods.length > 0 ? dinnerFoods : [];
      
      const totalCalories = 
        dayBreakfast.reduce((sum, food) => sum + food.calories, 0) +
        dayLunch.reduce((sum, food) => sum + food.calories, 0) +
        dayDinner.reduce((sum, food) => sum + food.calories, 0);
      
      const totalCost = 
        dayBreakfast.reduce((sum, food) => sum + food.price, 0) +
        dayLunch.reduce((sum, food) => sum + food.price, 0) +
        dayDinner.reduce((sum, food) => sum + food.price, 0);
      
      return {
        day,
        meals: {
          breakfast: dayBreakfast,
          lunch: dayLunch,
          dinner: dayDinner,
        },
        totalCalories,
        totalCost,
      };
    });
    
    // Calculate nutrition data
    const protein = 
      meals.breakfast.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'protein') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0) +
      meals.lunch.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'protein') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0) +
      meals.dinner.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'protein') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0);
    
    const carbs = 
      meals.breakfast.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'carbs') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0) +
      meals.lunch.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'carbs') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0) +
      meals.dinner.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'carbs') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0);
    
    const fats = 45; // Default value since we don't have fat data
    const fiber = 21; // Default value since we don't have fiber data
    
    // Calculate calorie targets based on user info
    let calorieTarget = 2000;
    if (userInfo.gender && userInfo.weight && userInfo.height && userInfo.goal) {
      calorieTarget = calculateCalories(
        userInfo.gender,
        userInfo.weight,
        userInfo.height,
        userInfo.goal
      );
    }
    
    // Calculate average daily calories
    const totalWeeklyCalories = weeklyPlan.reduce((sum, day) => sum + day.totalCalories, 0);
    const averageCalories = Math.round(totalWeeklyCalories / 7);
    
    // Calculate budget data
    const weeklyBudget = userInfo.budget || 100;
    const totalWeeklyCost = weeklyPlan.reduce((sum, day) => sum + day.totalCost, 0);
    const savings = weeklyBudget - totalWeeklyCost;
    
    // Calculate meal costs
    const breakfastCost = meals.breakfast.reduce((sum, food) => sum + food.price, 0) * 7;
    const lunchCost = meals.lunch.reduce((sum, food) => sum + food.price, 0) * 7;
    const dinnerCost = meals.dinner.reduce((sum, food) => sum + food.price, 0) * 7;
    
    // Calculate meal cost percentages
    const totalCost = breakfastCost + lunchCost + dinnerCost;
    const breakfastPercentage = Math.round((breakfastCost / totalCost) * 100);
    const lunchPercentage = Math.round((lunchCost / totalCost) * 100);
    const dinnerPercentage = Math.round((dinnerCost / totalCost) * 100);
    
    set({
      weeklyPlan,
      nutritionData: {
        protein,
        carbs,
        fats,
        fiber,
        proteinTarget: 120,
        carbsTarget: 225,
        fatsTarget: 70,
        fiberTarget: 30,
        averageCalories,
        calorieTarget,
      },
      budgetData: {
        weeklyBudget,
        actualSpend: totalWeeklyCost,
        savings,
        mealCosts: {
          breakfast: breakfastCost,
          lunch: lunchCost,
          dinner: dinnerCost,
        },
        mealCostPercentages: {
          breakfast: breakfastPercentage,
          lunch: lunchPercentage,
          dinner: dinnerPercentage,
        },
      },
    });
  }
}));
