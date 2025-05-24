import { create } from 'zustand';
import { Food, MealTime } from '@/types';
import { FoodItem, NutritionSummary } from './useRecommendStore';
import { useUserStore } from './useUserStore';

interface ValidationStatus {
  budgetExceeded: boolean;
  nutritionMismatch: boolean;
  hasAllergies: boolean;
}

interface MealConfig {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  [key: string]: FoodItem[];
}

interface MealConfigStore {
  meals: MealConfig;
  nutritionSummary: NutritionSummary;
  budgetUsed: number;
  validationStatus: ValidationStatus;
  
  // Actions
  addFoodToMeal: (mealType: MealTime, food: FoodItem) => void;
  removeFoodFromMeal: (mealType: MealTime, foodId: string) => void;
  clearMeals: () => void;
  updateNutritionSummary: () => void;
  
  // Helper methods
  getMealTotalCalories: (mealType: MealTime) => number;
  getMealTotalCost: (mealType: MealTime) => number;
}

// Initial nutrition summary
const initialNutritionSummary: NutritionSummary = {
  calories: { target: 0, actual: 0 },
  protein: { target: 0, actual: 0 },
  fat: { target: 0, actual: 0 },
  carbs: { target: 0, actual: 0 },
  budget: { target: 0, actual: 0 },
  allergy: false
};

export const useMealConfigStore = create<MealConfigStore>((set, get) => ({
  // Initial state
  meals: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  nutritionSummary: initialNutritionSummary,
  budgetUsed: 0,
  validationStatus: {
    budgetExceeded: false,
    nutritionMismatch: false,
    hasAllergies: false
  },
  
  // Actions
  addFoodToMeal: (mealType, food) => {
    set(state => {
      // Create a copy of current meals
      const updatedMeals = { ...state.meals };
      
      // Add food to the specified meal
      updatedMeals[mealType] = [...updatedMeals[mealType], food];
      
      return { meals: updatedMeals };
    });
    
    // Update nutrition summary after adding food
    get().updateNutritionSummary();
  },
  
  removeFoodFromMeal: (mealType, foodId) => {
    set(state => {
      // Create a copy of current meals
      const updatedMeals = { ...state.meals };
      
      // Remove food from the specified meal
      updatedMeals[mealType] = updatedMeals[mealType].filter(food => food.id !== foodId);
      
      return { meals: updatedMeals };
    });
    
    // Update nutrition summary after removing food
    get().updateNutritionSummary();
  },
  
  clearMeals: () => {
    set({
      meals: {
        breakfast: [],
        lunch: [],
        dinner: []
      },
      nutritionSummary: initialNutritionSummary,
      budgetUsed: 0,
      validationStatus: {
        budgetExceeded: false,
        nutritionMismatch: false,
        hasAllergies: false
      }
    });
  },
  
  updateNutritionSummary: () => {
    set(state => {
      const allFoods = [
        ...state.meals.breakfast,
        ...state.meals.lunch,
        ...state.meals.dinner
      ];
      
      // Calculate actual nutrition values
      const totalCalories = allFoods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = allFoods.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'protein') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0);
      
      const totalFat = allFoods.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'fats') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0);
      
      const totalCarbs = allFoods.reduce((sum, food) => {
        if (food.mainNutrient.name.toLowerCase() === 'carbs') {
          return sum + food.mainNutrient.amount;
        }
        return sum;
      }, 0);
      
      // Calculate budget used
      const totalCost = allFoods.reduce((sum, food) => sum + food.price, 0);
      
      // Get user info to calculate targets
      const userInfo = useUserStore.getState().userInfo;
      
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
      const fatTarget = (calorieTarget * 0.25) / 9; // 25% of calories from fat, 9 calories per gram
      const carbsTarget = (calorieTarget * 0.5) / 4; // 50% of calories from carbs, 4 calories per gram
      
      // Check for allergies
      const hasAllergies = userInfo.allergies.length > 0 && allFoods.some(food => 
        userInfo.allergies.some(allergy => 
          food.name.toLowerCase().includes(allergy.toLowerCase()) || 
          (food.tags && food.tags.some(tag => tag.toLowerCase().includes(allergy.toLowerCase())))
        )
      );
      
      // Create updated nutrition summary
      const updatedSummary: NutritionSummary = {
        calories: { target: calorieTarget, actual: totalCalories },
        protein: { target: proteinTarget, actual: totalProtein },
        fat: { target: fatTarget, actual: totalFat },
        carbs: { target: carbsTarget, actual: totalCarbs },
        budget: { target: userInfo.budget, actual: totalCost },
        allergy: hasAllergies
      };
      
      // Update validation status
      const validationStatus: ValidationStatus = {
        budgetExceeded: totalCost > userInfo.budget,
        nutritionMismatch: Math.abs(totalCalories - calorieTarget) > calorieTarget * 0.2, // Allow 20% deviation
        hasAllergies: hasAllergies
      };
      
      return { 
        nutritionSummary: updatedSummary, 
        budgetUsed: totalCost,
        validationStatus
      };
    });
  },
  
  // Helper methods
  getMealTotalCalories: (mealType) => {
    const { meals } = get();
    return meals[mealType].reduce((sum, food) => sum + food.calories, 0);
  },
  
  getMealTotalCost: (mealType) => {
    const { meals } = get();
    return meals[mealType].reduce((sum, food) => sum + food.price, 0);
  }
}));

export default useMealConfigStore;