import { create } from 'zustand';
import { Food, MealTime } from '@/types';

interface MealConfig {
  breakfast: Food[];
  lunch: Food[];
  dinner: Food[];
  [key: string]: Food[];
}

interface MealConfigStore {
  meals: MealConfig;
  addFoodToMeal: (mealType: MealTime, food: Food) => void;
  removeFoodFromMeal: (mealType: MealTime, foodId: string) => void;
  clearMeals: () => void;
  getMealTotalCalories: (mealType: MealTime) => number;
  getMealTotalCost: (mealType: MealTime) => number;
}

export const useMealConfigStore = create<MealConfigStore>((set, get) => ({
  meals: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  
  addFoodToMeal: (mealType, food) => set((state) => ({
    meals: {
      ...state.meals,
      [mealType]: [...state.meals[mealType], food]
    }
  })),
  
  removeFoodFromMeal: (mealType, foodId) => set((state) => ({
    meals: {
      ...state.meals,
      [mealType]: state.meals[mealType].filter(food => food.id !== foodId)
    }
  })),
  
  clearMeals: () => set({
    meals: {
      breakfast: [],
      lunch: [],
      dinner: []
    }
  }),
  
  getMealTotalCalories: (mealType) => {
    const state = get();
    return state.meals[mealType].reduce((total, food) => total + food.calories, 0);
  },
  
  getMealTotalCost: (mealType) => {
    const state = get();
    return state.meals[mealType].reduce((total, food) => total + food.price, 0);
  },
}));
