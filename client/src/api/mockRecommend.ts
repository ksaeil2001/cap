// client/src/api/mockRecommend.ts

import { UserInfo } from '../types';

// Food item type definition
interface FoodItem {
  foodId: number;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  price: number;
  tags: string[];
  image?: string;
}

// Nutrition summary type definition
interface NutritionSummary {
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

// Recommend response type definition
interface RecommendResponse {
  meals: FoodItem[][];
  summary: NutritionSummary;
  fallback: boolean;
}

// Mock food data samples
const mockFoods: FoodItem[] = [
  {
    foodId: 1,
    name: 'Grilled Chicken Salad',
    kcal: 350,
    protein: 30,
    fat: 15,
    carbs: 20,
    price: 7000,
    tags: ['healthy', 'high-protein'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 2,
    name: 'Oatmeal with Fruits',
    kcal: 250,
    protein: 10,
    fat: 5,
    carbs: 45,
    price: 5000,
    tags: ['healthy', 'fiber-rich'],
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 3,
    name: 'Beef Steak',
    kcal: 500,
    protein: 40,
    fat: 30,
    carbs: 10,
    price: 12000,
    tags: ['high-protein'],
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 4,
    name: 'Avocado Toast',
    kcal: 300,
    protein: 8,
    fat: 15,
    carbs: 35,
    price: 6000,
    tags: ['healthy', 'vegetarian'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 5,
    name: 'Protein Smoothie',
    kcal: 200,
    protein: 25,
    fat: 2,
    carbs: 20,
    price: 4000,
    tags: ['healthy', 'quick'],
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 6,
    name: 'Salmon Fillet',
    kcal: 280,
    protein: 35,
    fat: 12,
    carbs: 0,
    price: 9000,
    tags: ['high-protein', 'omega-3'],
    image: 'https://images.unsplash.com/photo-1542814880-7e62cf14b7c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 7,
    name: 'Quinoa Bowl',
    kcal: 320,
    protein: 12,
    fat: 8,
    carbs: 55,
    price: 6500,
    tags: ['vegetarian', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 8,
    name: 'Greek Yogurt with Honey',
    kcal: 180,
    protein: 18,
    fat: 5,
    carbs: 15,
    price: 3500,
    tags: ['breakfast', 'probiotic'],
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 9,
    name: 'Egg White Omelette',
    kcal: 220,
    protein: 22,
    fat: 10,
    carbs: 8,
    price: 6000,
    tags: ['breakfast', 'high-protein'],
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
  {
    foodId: 10,
    name: 'Brown Rice Bowl',
    kcal: 420,
    protein: 15,
    fat: 7,
    carbs: 80,
    price: 7500,
    tags: ['vegan', 'fiber-rich'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
  },
];

// Helper function to create food objects for the application format
const createFoodObject = (foodItem: FoodItem) => {
  return {
    id: foodItem.foodId.toString(),
    name: foodItem.name,
    category: foodItem.tags[0] || 'General',
    calories: foodItem.kcal,
    mainNutrient: {
      name: 'Protein',
      amount: foodItem.protein,
      unit: 'g'
    },
    price: foodItem.price / 100, // Convert cents to dollars for UI display
    image: foodItem.image || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300'
  };
};

// Calculate base metabolic rate
const calculateBMR = (userInfo: UserInfo): number => {
  // Mifflin-St Jeor Equation
  if (userInfo.gender === 'male') {
    return 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age + 5;
  } else {
    return 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age - 161;
  }
};

// Calculate total daily energy expenditure
const calculateTDEE = (bmr: number, activityLevel?: string): number => {
  switch (activityLevel) {
    case 'low':
      return bmr * 1.2;
    case 'medium':
      return bmr * 1.55;
    case 'high':
      return bmr * 1.9;
    default:
      return bmr * 1.2; // Default to sedentary
  }
};

// Mock recommendation API function
export const mockRecommend = async (userInfo: UserInfo): Promise<any> => {
  // Calculate calorie needs based on user info
  const bmr = calculateBMR(userInfo);
  const tdee = calculateTDEE(bmr, userInfo.activityLevel);
  
  // Adjust based on goal
  let targetCalories = tdee;
  if (userInfo.goal === 'weight-loss') {
    targetCalories = tdee * 0.8; // 20% deficit
  } else if (userInfo.goal === 'muscle-gain') {
    targetCalories = tdee * 1.1; // 10% surplus
  }
  
  // Get per-meal calories
  const caloriesPerMeal = targetCalories / userInfo.mealCount;
  
  // Filter foods based on allergies
  let filteredFoods = [...mockFoods];
  if (userInfo.allergies.length > 0) {
    filteredFoods = mockFoods.filter(food => 
      !userInfo.allergies.some(allergy => 
        food.name.toLowerCase().includes(allergy.toLowerCase()) ||
        food.tags.some(tag => tag.toLowerCase().includes(allergy.toLowerCase()))
      )
    );
  }
  
  // Sort foods based on goal
  if (userInfo.goal === 'weight-loss') {
    // For weight loss, prioritize high protein, low calorie
    filteredFoods.sort((a, b) => {
      const proteinCalorieRatioA = a.protein / a.kcal;
      const proteinCalorieRatioB = b.protein / b.kcal;
      return proteinCalorieRatioB - proteinCalorieRatioA;
    });
  } else if (userInfo.goal === 'muscle-gain') {
    // For muscle gain, prioritize high protein, adequate calories
    filteredFoods.sort((a, b) => b.protein - a.protein);
  }
  
  // Create recommendations
  let recommendations = [];
  for (let i = 0; i < 10; i++) {
    // Pick a random food from our filtered and sorted list
    const randomIndex = Math.floor(Math.random() * Math.min(5, filteredFoods.length));
    const foodItem = filteredFoods[randomIndex];
    
    // Convert to application format
    recommendations.push(createFoodObject(foodItem));
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return recommendations;
};

// Export the mock recommendation API
export default mockRecommend;