import { UserInfo } from "@/types";

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

// Sample food database for breakfast
const breakfastFoods: FoodItem[] = [
  {
    foodId: 1,
    id: "breakfast-1",
    name: "Oatmeal with Berries",
    kcal: 350,
    protein: 12,
    fat: 5,
    carbs: 60,
    price: 2.5,
    tags: ["vegetarian", "high-fiber"],
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "breakfast"
  },
  {
    foodId: 2,
    id: "breakfast-2",
    name: "Greek Yogurt Parfait",
    kcal: 320,
    protein: 20,
    fat: 8,
    carbs: 35,
    price: 3.2,
    tags: ["vegetarian", "high-protein"],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "breakfast"
  },
  {
    foodId: 3,
    id: "breakfast-3",
    name: "Avocado Toast",
    kcal: 380,
    protein: 10,
    fat: 22,
    carbs: 30,
    price: 4.5,
    tags: ["vegetarian", "high-fat"],
    image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "breakfast"
  },
  {
    foodId: 4,
    id: "breakfast-4",
    name: "Protein Smoothie",
    kcal: 280,
    protein: 25,
    fat: 5,
    carbs: 30,
    price: 3.8,
    tags: ["vegetarian", "high-protein"],
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "breakfast"
  },
  {
    foodId: 5,
    id: "breakfast-5",
    name: "Egg Breakfast Sandwich",
    kcal: 450,
    protein: 22,
    fat: 18,
    carbs: 42,
    price: 5.0,
    tags: ["high-protein", "contains-eggs"],
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "breakfast"
  }
];

// Sample food database for lunch
const lunchFoods: FoodItem[] = [
  {
    foodId: 6,
    id: "lunch-1",
    name: "Grilled Chicken Salad",
    kcal: 420,
    protein: 35,
    fat: 15,
    carbs: 25,
    price: 7.5,
    tags: ["high-protein", "low-carb"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "lunch"
  },
  {
    foodId: 7,
    id: "lunch-2",
    name: "Vegetable Quinoa Bowl",
    kcal: 380,
    protein: 12,
    fat: 10,
    carbs: 58,
    price: 6.8,
    tags: ["vegetarian", "high-fiber", "gluten-free"],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "lunch"
  },
  {
    foodId: 8,
    id: "lunch-3",
    name: "Turkey Wrap",
    kcal: 450,
    protein: 28,
    fat: 16,
    carbs: 48,
    price: 6.5,
    tags: ["high-protein"],
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "lunch"
  },
  {
    foodId: 9,
    id: "lunch-4",
    name: "Lentil Soup with Bread",
    kcal: 380,
    protein: 18,
    fat: 6,
    carbs: 65,
    price: 5.2,
    tags: ["vegetarian", "high-fiber"],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "lunch"
  },
  {
    foodId: 10,
    id: "lunch-5",
    name: "Tuna Sandwich",
    kcal: 420,
    protein: 25,
    fat: 14,
    carbs: 45,
    price: 6.0,
    tags: ["high-protein", "contains-fish"],
    image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "lunch"
  }
];

// Sample food database for dinner
const dinnerFoods: FoodItem[] = [
  {
    foodId: 11,
    id: "dinner-1",
    name: "Grilled Salmon with Vegetables",
    kcal: 520,
    protein: 40,
    fat: 25,
    carbs: 18,
    price: 9.5,
    tags: ["high-protein", "low-carb", "contains-fish"],
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "dinner"
  },
  {
    foodId: 12,
    id: "dinner-2",
    name: "Vegetable Stir Fry with Tofu",
    kcal: 380,
    protein: 18,
    fat: 12,
    carbs: 45,
    price: 7.2,
    tags: ["vegetarian", "vegan", "gluten-free"],
    image: "https://images.unsplash.com/photo-1512058556646-c4da40fba323?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "dinner"
  },
  {
    foodId: 13,
    id: "dinner-3",
    name: "Beef and Vegetable Stew",
    kcal: 480,
    protein: 32,
    fat: 20,
    carbs: 35,
    price: 8.5,
    tags: ["high-protein", "contains-beef"],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "dinner"
  },
  {
    foodId: 14,
    id: "dinner-4",
    name: "Pasta with Tomato Sauce",
    kcal: 450,
    protein: 15,
    fat: 8,
    carbs: 85,
    price: 6.0,
    tags: ["vegetarian", "high-carb"],
    image: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "dinner"
  },
  {
    foodId: 15,
    id: "dinner-5",
    name: "Chicken Curry with Rice",
    kcal: 580,
    protein: 30,
    fat: 18,
    carbs: 65,
    price: 8.0,
    tags: ["high-protein", "gluten-free"],
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    category: "dinner"
  }
];

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
  const { gender, weight, height, age } = userInfo;
  
  // Mifflin-St Jeor Equation
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
  const proteinTarget = userInfo.weight * 2; // 2g per kg of body weight
  const fatTarget = (targetCalories * 0.3) / 9; // 30% of calories from fat (9 cal/g)
  const carbsTarget = (targetCalories * 0.5) / 4; // 50% of calories from carbs (4 cal/g)
  
  // Filter out foods based on allergies
  let filteredBreakfastFoods = [...breakfastFoods];
  let filteredLunchFoods = [...lunchFoods];
  let filteredDinnerFoods = [...dinnerFoods];
  
  if (userInfo.allergies && userInfo.allergies.length > 0) {
    const allergyFilter = (food: FoodItem) => {
      return !userInfo.allergies.some(allergy => 
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
      target: userInfo.budget,
      actual: actualCost
    },
    allergy: hasAllergies
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