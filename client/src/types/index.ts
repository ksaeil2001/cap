// User Types
export interface UserInfo {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  bodyFatPercent?: number;
  goal: 'weight-loss' | 'muscle-gain';
  activityLevel?: 'low' | 'medium' | 'high';
  budget: number;
  mealCount: number;
  allergies: string[];
}

// Food Types
export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  mainNutrient: Nutrient;
  price: number;
  image: string;
}

// Meal Types
export type MealTime = 'breakfast' | 'lunch' | 'dinner';

export interface MealConfig {
  breakfast: Food[];
  lunch: Food[];
  dinner: Food[];
  [key: string]: Food[];
}

// Weekly Plan Types
export interface WeeklyPlanDay {
  day: string;
  meals: MealConfig;
  totalCalories: number;
  totalCost: number;
}

// API Response Types
export interface RecommendApiResponse {
  foods: Food[];
}
