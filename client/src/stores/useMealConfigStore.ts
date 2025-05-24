import { create } from 'zustand';
import { FoodItem, NutritionSummary } from '@/stores/useRecommendStore';
import { useUserStore } from '@/stores/useUserStore';
import { MealTime } from '@/types';

// Validation status for meal configuration
interface ValidationStatus {
  budgetExceeded: boolean;
  nutritionMismatch: boolean;
  hasAllergies: boolean;
}

// Meal configuration for all meal types
interface MealConfig {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  [key: string]: FoodItem[];
}

// Meal configuration store interface
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

// Create the meal configuration store
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
  
  // Add a food to a specific meal type
  addFoodToMeal: (mealType, food) => {
    set(state => {
      // Create a new meals object with the food added to the specified meal type
      const updatedMeals = {
        ...state.meals,
        [mealType]: [...state.meals[mealType], food]
      };
      
      // Return the updated state
      return {
        meals: updatedMeals
      };
    });
    
    // Update nutrition summary and validation status after adding food
    get().updateNutritionSummary();
  },
  
  // Remove a food from a specific meal type
  removeFoodFromMeal: (mealType, foodId) => {
    set(state => {
      // Create a new meals object with the food removed from the specified meal type
      const updatedMeals = {
        ...state.meals,
        [mealType]: state.meals[mealType].filter(food => food.id !== foodId)
      };
      
      // Return the updated state
      return {
        meals: updatedMeals
      };
    });
    
    // Update nutrition summary and validation status after removing food
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
    
    // Update nutrition summary and validation status after clearing meals
    get().updateNutritionSummary();
  },
  
  // Update nutrition summary based on current meals
  updateNutritionSummary: () => {
    const state = get();
    const userInfo = useUserStore.getState().userInfo;
    
    // Calculate total nutrition values from all meals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalCost = 0;
    let hasAllergies = false;
    
    // Process all meal types
    Object.values(state.meals).forEach(foods => {
      foods.forEach(food => {
        totalCalories += food.calories || food.kcal || 0;
        totalProtein += food.protein || 0;
        totalFat += food.fat || 0;
        totalCarbs += food.carbs || 0;
        totalCost += food.price || 0;
        
        // Check for allergies
        if (userInfo.allergies && userInfo.allergies.length > 0 && food.tags) {
          const allergensPresent = userInfo.allergies.some(allergy => 
            food.tags?.includes(allergy.toLowerCase())
          );
          if (allergensPresent) {
            hasAllergies = true;
          }
        }
      });
    });
    
    // Calculate target values based on user info
    // Note: These are simplified calculations; real-world applications would use more sophisticated formulas
    const calorieTarget = userInfo.goal === 'weight-loss' ? 2000 : 2500; // Simplified target
    const proteinTarget = userInfo.weight * 2; // 2g per kg of body weight
    const fatTarget = calorieTarget * 0.3 / 9; // 30% of calories from fat (9 cal/g)
    const carbsTarget = calorieTarget * 0.5 / 4; // 50% of calories from carbs (4 cal/g)
    const budgetTarget = userInfo.budget || 0;
    
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
    
    // Determine validation status
    const validationStatus: ValidationStatus = {
      budgetExceeded: totalCost > budgetTarget / 7, // Daily budget exceeded
      nutritionMismatch: (
        totalProtein < proteinTarget * 0.8 || 
        totalProtein > proteinTarget * 1.2 ||
        totalFat < fatTarget * 0.8 || 
        totalFat > fatTarget * 1.2 ||
        totalCarbs < carbsTarget * 0.8 || 
        totalCarbs > carbsTarget * 1.2
      ),
      hasAllergies
    };
    
    // Update state with new nutrition summary and validation status
    set({
      nutritionSummary: updatedSummary,
      budgetUsed: totalCost,
      validationStatus
    });
  },
  
  // Calculate total calories for a specific meal type
  getMealTotalCalories: (mealType) => {
    const state = get();
    return state.meals[mealType].reduce(
      (total, food) => total + (food.calories || food.kcal || 0), 
      0
    );
  },
  
  // Calculate total cost for a specific meal type
  getMealTotalCost: (mealType) => {
    const state = get();
    return state.meals[mealType].reduce(
      (total, food) => total + (food.price || 0), 
      0
    );
  }
}));

export default useMealConfigStore;