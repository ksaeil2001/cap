import { create } from 'zustand';
import { Food } from '@/types';

interface RecommendStore {
  selectedFoods: Food[];
  addFood: (food: Food) => void;
  removeFood: (foodId: string) => void;
  clearFoods: () => void;
}

export const useRecommendStore = create<RecommendStore>((set) => ({
  selectedFoods: [],
  
  addFood: (food) => set((state) => ({
    selectedFoods: [...state.selectedFoods, food]
  })),
  
  removeFood: (foodId) => set((state) => ({
    selectedFoods: state.selectedFoods.filter(food => food.id !== foodId)
  })),
  
  clearFoods: () => set({ selectedFoods: [] }),
}));
