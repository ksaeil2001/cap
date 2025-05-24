import { create } from 'zustand';
import { Food } from '@/types';

// Food item type with detailed nutritional information
export interface FoodItem extends Food {
  tags?: string[];
  protein?: number;
  fat?: number;
  carbs?: number;
  kcal?: number;
}

// Nutrition summary type definition
export interface NutritionSummary {
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

// RecommendStore state interface
interface RecommendStore {
  // State
  meals: FoodItem[][];
  summary: NutritionSummary | null;
  fallback: boolean;
  selectedFoods: FoodItem[];
  currentMealType: 'breakfast' | 'lunch' | 'dinner';
  
  // Actions
  setRecommendations: (meals: FoodItem[][], summary: NutritionSummary, fallback: boolean) => void;
  selectFood: (food: FoodItem) => void;
  removeFood: (foodId: string) => void;
  setMealType: (mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  reset: () => void;
  
  // Legacy actions (for backward compatibility)
  addFood: (food: FoodItem) => void;
  clearFoods: () => void;
  setRecommendationData: (data: { 
    meals: FoodItem[][];
    summary: NutritionSummary;
    fallback: boolean;
  }) => void;
}

// Initial state
const initialState = {
  meals: [],
  summary: null,
  fallback: false,
  selectedFoods: [],
  currentMealType: 'breakfast' as const,
};

// Create Zustand store
export const useRecommendStore = create<RecommendStore>((set) => ({
  ...initialState,

  // Set recommendations from API response
  setRecommendations: (meals, summary, fallback) =>
    set(() => ({
      meals,
      summary,
      fallback,
      selectedFoods: [], // Reset selections when new recommendations arrive
    })),

  // Select a food item
  selectFood: (food) =>
    set((state) => {
      // Prevent duplicate selections
      if (state.selectedFoods.some(f => f.id === food.id)) {
        return state;
      }
      return { selectedFoods: [...state.selectedFoods, food] };
    }),

  // Remove a food item
  removeFood: (foodId) =>
    set((state) => ({
      selectedFoods: state.selectedFoods.filter((food) => food.id !== foodId),
    })),

  // Change current meal type tab
  setMealType: (mealType) =>
    set(() => ({
      currentMealType: mealType,
    })),

  // Reset store to initial state
  reset: () => 
    set(() => ({ ...initialState })),

  // Legacy actions (for backward compatibility)
  addFood: (food) => set((state) => {
    if (state.selectedFoods.some(f => f.id === food.id)) {
      return state;
    }
    return { selectedFoods: [...state.selectedFoods, food] };
  }),
  
  clearFoods: () => set({ selectedFoods: [] }),
  
  setRecommendationData: (data) => set({
    meals: data.meals,
    summary: data.summary,
    fallback: data.fallback
  })
}));

export default useRecommendStore;