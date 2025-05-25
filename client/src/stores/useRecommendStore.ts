import { create } from 'zustand';
import { FoodItem } from '@/api/mockRecommend';
import { MealTime } from './useMealConfigStore';
import { useUserStore } from './useUserStore';

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
  mealsFoods: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
  };
  allFoods: FoodItem[];
  filteredFoods: FoodItem[];
  currentMealType: MealTime;
  summary: RecommendResponse['summary'] | null;
  fallback: boolean;
  
  // Actions
  setRecommendedFoods: (foods: FoodItem[][]) => void;
  setSummary: (summary: RecommendResponse['summary']) => void;
  setFallback: (fallback: boolean) => void;
  setCurrentMealType: (mealType: MealTime) => void;
  filterByMealType: (mealType: MealTime) => void;
  filterByCalories: (min: number, max: number) => void;
  filterByPrice: (min: number, max: number) => void;
  clearFilters: () => void;
  getCurrentMealFoods: () => FoodItem[];
}

export const useRecommendStore = create<RecommendStore>((set, get) => ({
  isLoading: false,
  mealsFoods: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  allFoods: [],
  filteredFoods: [],
  currentMealType: 'breakfast',
  summary: null,
  fallback: false,
  
  // Set recommended foods from API response
  setRecommendedFoods: (foodsByMeal: FoodItem[][]) => {
    // 방어적 프로그래밍: foodsByMeal이 undefined, null 또는 배열이 아닌 경우 대비
    if (!foodsByMeal || !Array.isArray(foodsByMeal)) {
      console.warn("Received invalid foodsByMeal data:", foodsByMeal);
      set({
        mealsFoods: {
          breakfast: [],
          lunch: [],
          dinner: []
        },
        allFoods: [],
        filteredFoods: []
      });
      return;
    }
    
    // 끼니별로 음식 분리 (방어적 처리)
    let breakfastFoods: FoodItem[] = [];
    let lunchFoods: FoodItem[] = [];
    let dinnerFoods: FoodItem[] = [];
    
    if (mealCount === 2) {
      // 점심, 저녁만 사용하는 경우 (2끼)
      lunchFoods = Array.isArray(foodsByMeal[0]) ? foodsByMeal[0] : [];
      dinnerFoods = Array.isArray(foodsByMeal[1]) ? foodsByMeal[1] : [];
    } else {
      // 아침, 점심, 저녁 모두 사용하는 경우 (3끼)
      breakfastFoods = Array.isArray(foodsByMeal[0]) ? foodsByMeal[0] : [];
      lunchFoods = Array.isArray(foodsByMeal[1]) ? foodsByMeal[1] : [];
      dinnerFoods = Array.isArray(foodsByMeal[2]) ? foodsByMeal[2] : [];
    }
    
    // 모든 음식을 하나의 배열로 합치기
    const allFoods = [...breakfastFoods, ...lunchFoods, ...dinnerFoods];
    
    // 기본 표시 끼니 설정 (mealCount에 따라)
    const defaultMealFoods = mealCount === 2 ? lunchFoods : breakfastFoods;
    
    set({
      mealsFoods: {
        breakfast: breakfastFoods,
        lunch: lunchFoods,
        dinner: dinnerFoods
      },
      allFoods: allFoods,
      filteredFoods: defaultMealFoods,
      currentMealType: mealCount === 2 ? 'lunch' : 'breakfast' // 기본 선택 끼니도 동적으로 설정
    });
  },
  
  // 현재 선택된 끼니 타입 설정
  setCurrentMealType: (mealType: MealTime) => {
    set({ currentMealType: mealType });
    get().filterByMealType(mealType);
  },
  
  // 현재 끼니 타입에 해당하는 음식 가져오기
  getCurrentMealFoods: () => {
    const { mealsFoods, currentMealType } = get();
    return mealsFoods[currentMealType];
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
    const { mealsFoods } = get();
    // 해당 끼니에 맞는 음식 목록 설정
    const foodsForMealType = mealsFoods[mealType] || [];
    set({ filteredFoods: foodsForMealType, currentMealType: mealType });
  },
  
  // Filter foods by calorie range
  filterByCalories: (min: number, max: number) => {
    const { currentMealType, mealsFoods } = get();
    const currentFoods = mealsFoods[currentMealType] || [];
    
    const filtered = currentFoods.filter((food: FoodItem) => {
      const calories = food.calories || food.kcal || 0;
      return calories >= min && calories <= max;
    });
    
    set({ filteredFoods: filtered });
  },
  
  // Filter foods by price range
  filterByPrice: (min: number, max: number) => {
    const { currentMealType, mealsFoods } = get();
    const currentFoods = mealsFoods[currentMealType] || [];
    
    const filtered = currentFoods.filter((food: FoodItem) => {
      const price = food.price || 0;
      return price >= min && price <= max;
    });
    
    set({ filteredFoods: filtered });
  },
  
  // Clear all filters and show all foods for current meal type
  clearFilters: () => {
    const { currentMealType, mealsFoods } = get();
    set({ filteredFoods: mealsFoods[currentMealType] || [] });
  }
}));