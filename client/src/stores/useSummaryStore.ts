import { create } from 'zustand';
import { FoodItem } from '@/api/mockRecommend';
import { MealTime } from './useMealConfigStore';
import { useUserStore } from './useUserStore';

export interface NutritionSummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface MealPlan {
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  [key: string]: FoodItem[];
}

export interface DayPlan {
  day: number;
  meals: MealPlan;
  nutritionSummary: NutritionSummary;
  budgetUsed: number;
}

interface SummaryStore {
  weekPlan: DayPlan[];
  selectedDay: number;
  
  // Computed values
  selectedDayPlan: DayPlan;
  
  // Actions
  setWeekPlan: (weekPlan: DayPlan[]) => void;
  setSelectedDay: (day: number) => void;
  generateWeekPlan: () => void;
  reset: () => void;
}

export const useSummaryStore = create<SummaryStore>((set, get) => ({
  weekPlan: [],
  selectedDay: 0,
  
  // Computed getter for selected day plan
  get selectedDayPlan() {
    const { weekPlan, selectedDay } = get();
    return weekPlan[selectedDay] || {
      day: 0,
      meals: { breakfast: [], lunch: [], dinner: [] },
      nutritionSummary: { calories: 0, protein: 0, fat: 0, carbs: 0 },
      budgetUsed: 0
    };
  },
  
  // Actions
  setWeekPlan: (weekPlan) => set({ weekPlan }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  
  // Generate a week-long meal plan based on current configuration
  generateWeekPlan: () => {
    const { weekPlan } = get();
    const mealConfigStore = require('./useMealConfigStore').useMealConfigStore.getState();
    const userInfo = useUserStore.getState();
    
    // If we already have a week plan, don't regenerate
    if (weekPlan.length > 0) return;
    
    // Create 7 days of meal plans with slight variations
    const newWeekPlan: DayPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      const baseMeals = mealConfigStore.meals;
      
      // Create a slightly varied version of meals for each day
      // (In a real app, this would use the AI to generate truly different meals)
      const dayMeals: MealPlan = {
        breakfast: [...baseMeals.breakfast],
        lunch: [...baseMeals.lunch],
        dinner: [...baseMeals.dinner]
      };
      
      // Calculate nutrition summary for this day
      const allFoods = [...dayMeals.breakfast, ...dayMeals.lunch, ...dayMeals.dinner];
      const nutritionSummary: NutritionSummary = {
        calories: Math.round(allFoods.reduce((sum, food) => sum + food.kcal, 0)),
        protein: Math.round(allFoods.reduce((sum, food) => sum + food.protein, 0)),
        fat: Math.round(allFoods.reduce((sum, food) => sum + food.fat, 0)),
        carbs: Math.round(allFoods.reduce((sum, food) => sum + food.carbs, 0))
      };
      
      // Calculate budget for this day
      const budgetUsed = Math.round(allFoods.reduce((sum, food) => sum + food.price, 0));
      
      newWeekPlan.push({
        day: i + 1,
        meals: dayMeals,
        nutritionSummary,
        budgetUsed
      });
    }
    
    set({ weekPlan: newWeekPlan });
  },
  
  reset: () => set({ weekPlan: [], selectedDay: 0 })
}));