import { create } from 'zustand';
import { FoodItem } from '@/api/mockRecommend';
import { useUserStore } from './useUserStore';
import { useRecommendStore } from './useRecommendStore';

export type MealTime = 'breakfast' | 'lunch' | 'dinner';

interface ValidationStatus {
  budgetExceeded: boolean;
  nutritionMismatch: boolean;
  hasAllergies: boolean;
  missingMeals: boolean;
}

interface MealConfig {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  [key: string]: FoodItem[];
}

interface NutritionSummary {
  calories: {
    target: number;
    actual: number;
  };
  protein: {
    target: number;
    actual: number;
  };
  fat: {
    target: number;
    actual: number;
  };
  carbs: {
    target: number;
    actual: number;
  };
  budget: {
    target: number;
    actual: number;
  };
  allergy: boolean;
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
  isReadyForSummary: () => boolean;
}

const initialNutritionSummary: NutritionSummary = {
  calories: { target: 2000, actual: 0 },
  protein: { target: 150, actual: 0 },
  fat: { target: 70, actual: 0 },
  carbs: { target: 250, actual: 0 },
  budget: { target: 30000, actual: 0 }, // 기본값: 10,000원 × 3끼 = 30,000원
  allergy: false
};

export const useMealConfigStore = create<MealConfigStore>((set, get) => ({
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
    hasAllergies: false,
    missingMeals: true
  },

  // Add a food item to a specific meal
  addFoodToMeal: (mealType: MealTime, food: FoodItem) => {
    set((state) => {
      // Check if food already exists in this meal
      const exists = state.meals[mealType].some(item => item.id === food.id);
      if (exists) return state; // Don't add duplicates
      
      // Create new meals object with the added food
      const updatedMeals = {
        ...state.meals,
        [mealType]: [...state.meals[mealType], food]
      };
      
      return { meals: updatedMeals };
    });
    
    // Update nutrition summary after adding food
    get().updateNutritionSummary();
  },
  
  // Remove a food item from a specific meal
  removeFoodFromMeal: (mealType: MealTime, foodId: string) => {
    set((state) => {
      const updatedMeals = {
        ...state.meals,
        [mealType]: state.meals[mealType].filter(food => food.id !== foodId)
      };
      
      return { meals: updatedMeals };
    });
    
    // Update nutrition summary after removing food
    get().updateNutritionSummary();
  },
  
  // Clear all meals
  clearMeals: () => {
    set({
      meals: {
        breakfast: [],
        lunch: [],
        dinner: []
      }
    });
    
    // Update nutrition summary after clearing meals
    get().updateNutritionSummary();
  },
  
  // Update nutrition summary based on current meals
  updateNutritionSummary: () => {
    const state = get();
    const userInfo = useUserStore.getState();
    const recommendStore = useRecommendStore.getState();
    
    // Get all food items across all meals
    const allFoods: FoodItem[] = [
      ...state.meals.breakfast,
      ...state.meals.lunch,
      ...state.meals.dinner
    ];
    
    // Calculate total nutrition values
    const totalCalories = allFoods.reduce((sum, food) => sum + (food.kcal || 0), 0);
    const totalProtein = allFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
    const totalFat = allFoods.reduce((sum, food) => sum + (food.fat || 0), 0);
    const totalCarbs = allFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
    const totalCost = allFoods.reduce((sum, food) => sum + (food.price || 0), 0);
    
    // Check for allergies
    const hasAllergies = userInfo.allergies.length > 0 && 
      allFoods.some(food => 
        userInfo.allergies.some(allergen => 
          food.tags?.some(tag => tag.toLowerCase().includes(allergen.toLowerCase()))
        )
      );
    
    // Get targets from recommendation store if available
    let calorieTarget = 2000;
    let proteinTarget = 150;
    let fatTarget = 70;
    let carbsTarget = 250;
    let budgetTarget = userInfo.budgetPerMeal * userInfo.mealCount; // Daily budget (per meal × meal count)
    
    if (recommendStore.summary) {
      calorieTarget = recommendStore.summary.calories.target;
      proteinTarget = recommendStore.summary.protein.target;
      fatTarget = recommendStore.summary.fat.target;
      carbsTarget = recommendStore.summary.carbs.target;
      // budgetTarget는 사용자 입력값 유지 (recommendStore에서 덮어쓰지 않음)
    }
    
    // Create updated nutrition summary
    const updatedSummary: NutritionSummary = {
      calories: {
        target: calorieTarget,
        actual: totalCalories
      },
      protein: {
        target: proteinTarget,
        actual: totalProtein
      },
      fat: {
        target: fatTarget,
        actual: totalFat
      },
      carbs: {
        target: carbsTarget,
        actual: totalCarbs
      },
      budget: {
        target: budgetTarget,
        actual: totalCost
      },
      allergy: hasAllergies
    };
    
    // Check validation status
    const validationStatus: ValidationStatus = {
      budgetExceeded: totalCost > budgetTarget,
      nutritionMismatch: Math.abs(totalCalories - calorieTarget) > calorieTarget * 0.2, // Allow 20% variance
      hasAllergies: hasAllergies,
      missingMeals: state.meals.breakfast.length === 0 || 
                   state.meals.lunch.length === 0 || 
                   state.meals.dinner.length === 0
    };
    
    set({ 
      nutritionSummary: updatedSummary, 
      budgetUsed: totalCost,
      validationStatus
    });
  },
  
  // Calculate total calories for a specific meal
  getMealTotalCalories: (mealType: MealTime) => {
    const state = get();
    return state.meals[mealType].reduce((sum, food) => sum + (food.kcal || 0), 0);
  },
  
  // Calculate total cost for a specific meal
  getMealTotalCost: (mealType: MealTime) => {
    const state = get();
    return state.meals[mealType].reduce((sum, food) => sum + (food.price || 0), 0);
  },
  
  // Check if configuration is valid for moving to summary
  isReadyForSummary: () => {
    const { validationStatus } = get();
    return !validationStatus.budgetExceeded && 
           !validationStatus.hasAllergies && 
           !validationStatus.missingMeals;
  }
}));