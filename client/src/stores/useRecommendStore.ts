import { create } from 'zustand';
import { FoodItem } from '@/api/mockRecommend';
import { MealTime } from './useMealConfigStore';

export interface RecommendResponse {
  meals: FoodItem[][];
  summary: {
    calories: { target: number; actual: number };
    protein: { target: number; actual: number };
    fat: { target: number; actual: number };
    carbs: { target: number; actual: number };
    budget: { target: number; actual: number };
    allergy: boolean;
  };
  fallback: boolean;
}

export interface RecommendStore {
  // State
  isLoading: boolean;
  recommendedFoods: FoodItem[];
  filteredFoods: FoodItem[];
  summary: RecommendResponse['summary'] | null;
  fallback: boolean;
  
  // Actions
  setRecommendedFoods: (foods: FoodItem[][]) => void;
  setSummary: (summary: RecommendResponse['summary']) => void;
  setFallback: (fallback: boolean) => void;
  filterByMealType: (mealType: MealTime) => void;
  filterByCalories: (min: number, max: number) => void;
  filterByPrice: (min: number, max: number) => void;
  clearFilters: () => void;
}

export const useRecommendStore = create<RecommendStore>((set, get) => ({
  isLoading: false,
  recommendedFoods: [],
  filteredFoods: [],
  summary: null,
  fallback: false,
  
  // Set recommended foods from API response
  setRecommendedFoods: (foodsByMeal: FoodItem[][]) => {
    // 방어적 프로그래밍: foodsByMeal이 undefined, null 또는 배열이 아닌 경우 대비
    if (!foodsByMeal || !Array.isArray(foodsByMeal)) {
      console.warn("Received invalid foodsByMeal data:", foodsByMeal);
      set({
        recommendedFoods: [],
        filteredFoods: []
      });
      return;
    }
    
    // Flatten all meal foods into a single array (방어적 처리)
    const allFoods = Array.isArray(foodsByMeal) ? foodsByMeal.flat() : [];
    
    set({
      recommendedFoods: allFoods,
      filteredFoods: allFoods
    });
  },
  
  // Set nutrition summary
  setSummary: (summary) => {
    set({ summary });
  },
  
  // Set fallback flag
  setFallback: (fallback) => {
    set({ fallback });
  },
  
  // Filter foods by meal type (breakfast, lunch, dinner)
  filterByMealType: (mealType: MealTime) => {
    const { recommendedFoods } = get();
    
    // Map meal types to appropriate categories
    const categoryMap: Record<MealTime, string[]> = {
      breakfast: ['breakfast', 'cereal', 'dairy', 'fruit'],
      lunch: ['sandwich', 'salad', 'soup', 'protein', 'vegetable'],
      dinner: ['main', 'protein', 'pasta', 'rice', 'vegetable', 'meat']
    };
    
    const targetCategories = categoryMap[mealType];
    
    const filtered = recommendedFoods.filter(food => {
      // If food has a category and it's in the target categories for this meal type
      if (food.category && targetCategories.includes(food.category.toLowerCase())) {
        return true;
      }
      
      // If food has tags that match the meal type
      if (food.tags && food.tags.some(tag => 
        tag.toLowerCase().includes(mealType) || 
        targetCategories.some(cat => tag.toLowerCase().includes(cat))
      )) {
        return true;
      }
      
      return false;
    });
    
    set({ filteredFoods: filtered });
  },
  
  // Filter foods by calorie range
  filterByCalories: (min: number, max: number) => {
    const { recommendedFoods } = get();
    
    const filtered = recommendedFoods.filter(food => 
      food.kcal >= min && food.kcal <= max
    );
    
    set({ filteredFoods: filtered });
  },
  
  // Filter foods by price range
  filterByPrice: (min: number, max: number) => {
    const { recommendedFoods } = get();
    
    const filtered = recommendedFoods.filter(food => 
      food.price >= min && food.price <= max
    );
    
    set({ filteredFoods: filtered });
  },
  
  // Clear all filters and show all foods
  clearFilters: () => {
    const { recommendedFoods } = get();
    set({ filteredFoods: recommendedFoods });
  }
}));