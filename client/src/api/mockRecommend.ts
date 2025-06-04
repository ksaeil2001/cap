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

// 실제 데이터베이스의 authentic 한국 음식 데이터
const koreanFoodDatabase: FoodItem[] = [
  {
    foodId: 1,
    id: "fd-110",
    name: "소불고기",
    kcal: 750,
    protein: 25,
    fat: 20,
    carbs: 90,
    price: 5700,
    tags: ["dinner", "한식", "고단백"],
    category: "곡류 및 밥"
  },
  {
    foodId: 2,
    id: "fd-111",
    name: "돈까스도련님",
    kcal: 700,
    protein: 22,
    fat: 19,
    carbs: 88,
    price: 4900,
    tags: ["lunch", "dinner", "한식"],
    category: "곡류 및 밥"
  },
  {
    foodId: 3,
    id: "fd-121",
    name: "김치볶음밥",
    kcal: 650,
    protein: 18,
    fat: 15,
    carbs: 85,
    price: 4100,
    tags: ["lunch", "dinner", "한식", "김치"],
    category: "곡류 및 밥"
  },
  {
    foodId: 4,
    id: "fd-122",
    name: "스팸 철판볶음밥",
    kcal: 700,
    protein: 22,
    fat: 20,
    carbs: 88,
    price: 4900,
    tags: ["lunch", "dinner", "한식"],
    category: "곡류 및 밥"
  },
  {
    foodId: 5,
    id: "fd-279",
    name: "CU 두부샐러드 도시락",
    kcal: 220,
    protein: 17,
    fat: 8,
    carbs: 16,
    price: 4300,
    tags: ["breakfast", "lunch", "한식", "건강식"],
    category: "채소류"
  },
  {
    foodId: 6,
    id: "fd-280",
    name: "GS25 오곡잡곡밥 김치볶음 도시락",
    kcal: 470,
    protein: 11,
    fat: 7,
    carbs: 88,
    price: 4300,
    tags: ["lunch", "한식", "잡곡"],
    category: "곡류 및 밥"
  },
  {
    foodId: 7,
    id: "fd-281",
    name: "세븐일레븐 불고기치즈 롤",
    kcal: 335,
    protein: 12,
    fat: 10,
    carbs: 45,
    price: 3200,
    tags: ["breakfast", "lunch", "한식"],
    category: "육류 가공품"
  },
  {
    foodId: 8,
    id: "fd-282",
    name: "이마트24 갈릭버터 닭가슴살볼",
    kcal: 230,
    protein: 22,
    fat: 10,
    carbs: 9,
    price: 2800,
    tags: ["breakfast", "한식", "고단백", "저탄수"],
    category: "육류 가공품"
  },
  {
    foodId: 9,
    id: "fd-283",
    name: "한솥 데리야끼연어 스테이크",
    kcal: 510,
    protein: 21,
    fat: 13,
    carbs: 67,
    price: 5700,
    tags: ["dinner", "한식", "연어"],
    category: "어류 및 수산가공품"
  },
  {
    foodId: 10,
    id: "fd-284",
    name: "GS25 콩불 도시락",
    kcal: 520,
    protein: 18,
    fat: 10,
    carbs: 85,
    price: 4100,
    tags: ["lunch", "dinner", "한식"],
    category: "두류"
  }
];

// 아침 식사용 음식 (300kcal 미만 또는 breakfast 태그가 있는 음식)
const breakfastFoods: FoodItem[] = koreanFoodDatabase.filter(food => 
  food.tags.includes("breakfast") || 
  (food.kcal < 300) || 
  (food.category && ['삼각김밥', '샐러드'].includes(food.category))
);

// 점심 식사용 음식 (250-500kcal 또는 lunch 태그가 있는 음식)
const lunchFoods: FoodItem[] = koreanFoodDatabase.filter(food => 
  food.tags.includes("lunch") || 
  (food.kcal >= 250 && food.kcal <= 500) || 
  (food.category && ['도시락', '볶음밥', '덮밥'].includes(food.category))
);

// 저녁 식사용 음식 (400kcal 이상 또는 dinner 태그가 있는 음식)
const dinnerFoods: FoodItem[] = koreanFoodDatabase.filter(food => 
  food.tags.includes("dinner") || 
  (food.kcal >= 400) || 
  (food.category && ['도시락', '덮밥', '볶음밥'].includes(food.category))
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