import { create } from 'zustand';
import { FoodItem } from '@/api/mockRecommend';
import { MealTime } from './useMealConfigStore';

// 끼니별 음식 선택을 위한 스토어
interface MealSelectionStore {
  // 끼니별 선택된 음식 상태
  selectedFoods: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
  };
  
  // 모든 선택된 음식 가져오기
  getAllSelectedFoods: () => FoodItem[];
  
  // 특정 끼니의 선택된 음식 가져오기
  getSelectedFoodsForMeal: (mealType: MealTime) => FoodItem[];
  
  // 음식 선택 여부 확인
  isFoodSelected: (mealType: MealTime, foodId: string) => boolean;
  
  // 끼니에 음식 추가
  addFoodToMeal: (mealType: MealTime, food: FoodItem) => void;
  
  // 끼니에서 음식 제거
  removeFoodFromMeal: (mealType: MealTime, foodId: string) => void;
  
  // 모든 선택 초기화
  clearAllSelections: () => void;
  
  // 특정 끼니의 모든 선택 초기화
  clearMealSelections: (mealType: MealTime) => void;
}

// 스토어 생성
export const useMealSelectionStore = create<MealSelectionStore>((set, get) => ({
  // 초기 상태
  selectedFoods: {
    breakfast: [],
    lunch: [],
    dinner: []
  },
  
  // 모든 선택된 음식 가져오기
  getAllSelectedFoods: () => {
    const { selectedFoods } = get();
    return [
      ...selectedFoods.breakfast,
      ...selectedFoods.lunch,
      ...selectedFoods.dinner
    ];
  },
  
  // 특정 끼니의 선택된 음식 가져오기
  getSelectedFoodsForMeal: (mealType) => {
    return get().selectedFoods[mealType] || [];
  },
  
  // 음식 선택 여부 확인
  isFoodSelected: (mealType, foodId) => {
    const mealFoods = get().selectedFoods[mealType] || [];
    return mealFoods.some(food => food.id === foodId);
  },
  
  // 끼니에 음식 추가
  addFoodToMeal: (mealType, food) => {
    set((state) => {
      // 이미 선택된 음식인지 확인
      const isAlreadySelected = state.selectedFoods[mealType].some(item => item.id === food.id);
      if (isAlreadySelected) return state; // 이미 있으면 변경하지 않음
      
      // 없으면 해당 끼니에 음식 추가
      return {
        selectedFoods: {
          ...state.selectedFoods,
          [mealType]: [...state.selectedFoods[mealType], food]
        }
      };
    });
  },
  
  // 끼니에서 음식 제거
  removeFoodFromMeal: (mealType, foodId) => {
    set((state) => ({
      selectedFoods: {
        ...state.selectedFoods,
        [mealType]: state.selectedFoods[mealType].filter(food => food.id !== foodId)
      }
    }));
  },
  
  // 모든 선택 초기화
  clearAllSelections: () => {
    set({
      selectedFoods: {
        breakfast: [],
        lunch: [],
        dinner: []
      }
    });
  },
  
  // 특정 끼니의 모든 선택 초기화
  clearMealSelections: (mealType) => {
    set((state) => ({
      selectedFoods: {
        ...state.selectedFoods,
        [mealType]: []
      }
    }));
  }
}));