import { create } from 'zustand';
import { Food, Nutrient } from '@/types';

// Extended types for the recommendation flow
export interface FoodItem extends Food {
  tags?: string[];
}

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

interface RecommendStore {
  meals: FoodItem[][];
  summary: NutritionSummary | null;
  fallback: boolean;
  selectedFoods: FoodItem[];
  addFood: (food: FoodItem) => void;
  removeFood: (foodId: string) => void;
  clearFoods: () => void;
  setRecommendationData: (data: { 
    meals: FoodItem[][];
    summary: NutritionSummary;
    fallback: boolean;
  }) => void;
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

export const useRecommendStore = create<RecommendStore>((set) => ({
  // Initial state
  meals: [],
  summary: null,
  fallback: false,
  selectedFoods: [],

  // Actions
  addFood: (food) => set((state) => {
    // Check if food is already selected
    if (state.selectedFoods.some(f => f.id === food.id)) {
      return state;
    }
    return { selectedFoods: [...state.selectedFoods, food] };
  }),
  
  removeFood: (foodId) => set((state) => ({
    selectedFoods: state.selectedFoods.filter(food => food.id !== foodId)
  })),
  
  clearFoods: () => set({ selectedFoods: [] }),
  
  setRecommendationData: (data) => set({
    meals: data.meals,
    summary: data.summary,
    fallback: data.fallback
  })
}));

export default useRecommendStore;