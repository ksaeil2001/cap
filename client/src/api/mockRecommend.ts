import { UserInfo } from "@/types";
import { sampleFoodItems } from "@/data/foodItems";

// Define food item structure
export interface FoodItem {
  foodId: number;
  id: string;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  price: number;
  tags: string[];
  image?: string;
  category?: string;
  calories?: number; // For compatibility with existing types
  mainNutrient?: any; // For compatibility with existing types
}

// Define nutrition summary structure
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

// Define API response structure
export interface RecommendResponse {
  meals: FoodItem[][];
  summary: NutritionSummary;
  fallback: boolean;
}

// 추가한 한국어 음식 데이터만 사용
// 전체 음식 데이터베이스 - food_items.json 파일에서 가져옴
const foodDatabase: FoodItem[] = sampleFoodItems;

// 아침 식사용 음식 (300kcal 미만 또는 breakfast 태그가 있는 음식)
const breakfastFoods: FoodItem[] = foodDatabase.filter(food => 
  food.tags.includes("breakfast") || 
  (food.kcal < 300) || 
  (food.category && ['fruit', 'dairy'].includes(food.category))
);

// 점심 식사용 음식 (250-500kcal 또는 lunch 태그가 있는 음식)
const lunchFoods: FoodItem[] = foodDatabase.filter(food => 
  food.tags.includes("lunch") || 
  (food.kcal >= 250 && food.kcal <= 500) || 
  (food.category && ['burger', 'salad', 'soup'].includes(food.category))
);

// 저녁 식사용 음식 (400kcal 이상 또는 dinner 태그가 있는 음식)
const dinnerFoods: FoodItem[] = foodDatabase.filter(food => 
  food.tags.includes("dinner") || 
  (food.kcal >= 400) || 
  (food.category && ['meat', 'seafood', 'burger'].includes(food.category))
);

// Helper function to create compatible food objects
const createFoodObject = (foodItem: FoodItem) => {
  return {
    ...foodItem,
    calories: foodItem.kcal, // Add calories field for compatibility
    mainNutrient: {
      name: "Protein",
      amount: foodItem.protein,
      unit: "g"
    }
  };
};

// Calculate BMR (Basal Metabolic Rate) based on user info
const calculateBMR = (userInfo: Partial<UserInfo>): number => {
  const { gender, weight = 70, height = 170, age = 30 } = userInfo;
  
  // Mifflin-St Jeor Equation with default values if missing
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

// Mock recommendation API function
export const mockRecommend = async (userInfo: Partial<UserInfo>): Promise<RecommendResponse> => {
  console.log("Using mock API for development");
  
  // Calculate BMR and adjust based on activity level and goal
  let bmr = calculateBMR(userInfo);
  
  // Apply activity level multiplier
  let activityMultiplier = 1.2; // Default to sedentary
  if (userInfo.activityLevel === 'medium') {
    activityMultiplier = 1.55;
  } else if (userInfo.activityLevel === 'high') {
    activityMultiplier = 1.725;
  }
  
  // Calculate TDEE (Total Daily Energy Expenditure)
  let tdee = bmr * activityMultiplier;
  
  // Adjust based on goal
  let targetCalories = tdee;
  if (userInfo.goal === 'weight-loss') {
    targetCalories = tdee - 500; // 500 calorie deficit for weight loss
  } else if (userInfo.goal === 'muscle-gain') {
    targetCalories = tdee + 300; // 300 calorie surplus for muscle gain
  }
  
  // Calculate macronutrient targets
  const proteinTarget = (userInfo.weight || 70) * 2; // 2g per kg of body weight
  const fatTarget = (targetCalories * 0.3) / 9; // 30% of calories from fat (9 cal/g)
  const carbsTarget = (targetCalories * 0.5) / 4; // 50% of calories from carbs (4 cal/g)
  
  // Filter out foods based on allergies
  let filteredBreakfastFoods = [...breakfastFoods];
  let filteredLunchFoods = [...lunchFoods];
  let filteredDinnerFoods = [...dinnerFoods];
  
  if (userInfo.allergies && userInfo.allergies.length > 0) {
    const allergyFilter = (food: FoodItem) => {
      return !userInfo.allergies?.some(allergy => 
        food.tags.includes(allergy.toLowerCase())
      );
    };
    
    filteredBreakfastFoods = breakfastFoods.filter(allergyFilter);
    filteredLunchFoods = lunchFoods.filter(allergyFilter);
    filteredDinnerFoods = dinnerFoods.filter(allergyFilter);
  }
  
  // Check if we need to use fallback due to strict filtering
  const fallback = filteredBreakfastFoods.length === 0 || 
                   filteredLunchFoods.length === 0 || 
                   filteredDinnerFoods.length === 0;
  
  // If fallback needed, use original foods
  if (fallback) {
    filteredBreakfastFoods = breakfastFoods;
    filteredLunchFoods = lunchFoods;
    filteredDinnerFoods = dinnerFoods;
  }
  
  // Prepare response with all meals
  const meals: FoodItem[][] = [
    filteredBreakfastFoods.map(createFoodObject),
    filteredLunchFoods.map(createFoodObject),
    filteredDinnerFoods.map(createFoodObject)
  ];
  
  // Calculate actual nutrition totals for sample meal (assuming one of each)
  const sampleBreakfast = filteredBreakfastFoods[0];
  const sampleLunch = filteredLunchFoods[0];
  const sampleDinner = filteredDinnerFoods[0];
  
  const actualCalories = sampleBreakfast.kcal + sampleLunch.kcal + sampleDinner.kcal;
  const actualProtein = sampleBreakfast.protein + sampleLunch.protein + sampleDinner.protein;
  const actualFat = sampleBreakfast.fat + sampleLunch.fat + sampleDinner.fat;
  const actualCarbs = sampleBreakfast.carbs + sampleLunch.carbs + sampleDinner.carbs;
  const actualCost = sampleBreakfast.price + sampleLunch.price + sampleDinner.price;
  
  // Check for allergies in sample meal
  const hasAllergies = fallback && userInfo.allergies && userInfo.allergies.length > 0 && (
    userInfo.allergies.some(allergy => sampleBreakfast.tags.includes(allergy.toLowerCase())) ||
    userInfo.allergies.some(allergy => sampleLunch.tags.includes(allergy.toLowerCase())) ||
    userInfo.allergies.some(allergy => sampleDinner.tags.includes(allergy.toLowerCase()))
  );
  
  // Create nutrition summary
  const summary: NutritionSummary = {
    calories: {
      target: targetCalories,
      actual: actualCalories
    },
    protein: {
      target: proteinTarget,
      actual: actualProtein
    },
    fat: {
      target: fatTarget,
      actual: actualFat
    },
    carbs: {
      target: carbsTarget,
      actual: actualCarbs
    },
    budget: {
      target: Number(userInfo.budget || 100),
      actual: actualCost
    },
    allergy: hasAllergies || false
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    meals,
    summary,
    fallback
  };
};

export default mockRecommend;