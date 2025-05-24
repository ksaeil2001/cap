import { Food, UserInfo } from "@/types";

// Mock food images
const foodImages = [
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1542814880-7e62cf14b7c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
];

import mockRecommend from './mockRecommend';

export async function getRecommendedFoods(userInfo: UserInfo): Promise<Food[]> {
  try {
    // Check for development environment
    if (import.meta.env.DEV) {
      console.log('Using mock API for development');
      return await mockRecommend(userInfo);
    }
    
    // Make API call to backend in production
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommended foods');
    }

    const data = await response.json();
    return data.foods;
  } catch (error) {
    console.error('Error fetching food recommendations:', error);
    
    // If API call fails, use fallback data
    return getFallbackFoods();
  }
}

// Fallback foods if API fails
function getFallbackFoods(): Food[] {
  return [
    {
      id: '1',
      name: 'Salmon Fillet',
      category: 'Protein',
      calories: 206,
      mainNutrient: {
        name: 'Protein',
        amount: 22,
        unit: 'g'
      },
      price: 3.50,
      image: foodImages[0]
    },
    {
      id: '2',
      name: 'Brown Rice',
      category: 'Carb',
      calories: 215,
      mainNutrient: {
        name: 'Carbs',
        amount: 45,
        unit: 'g'
      },
      price: 0.80,
      image: foodImages[1]
    },
    {
      id: '3',
      name: 'Broccoli',
      category: 'Vegetable',
      calories: 55,
      mainNutrient: {
        name: 'Fiber',
        amount: 5.1,
        unit: 'g'
      },
      price: 1.20,
      image: foodImages[2]
    },
    {
      id: '4',
      name: 'Greek Yogurt',
      category: 'Protein',
      calories: 150,
      mainNutrient: {
        name: 'Protein',
        amount: 15,
        unit: 'g'
      },
      price: 1.50,
      image: foodImages[3]
    },
    {
      id: '5',
      name: 'Blueberries',
      category: 'Fruit',
      calories: 80,
      mainNutrient: {
        name: 'Fiber',
        amount: 4,
        unit: 'g'
      },
      price: 2.00,
      image: foodImages[4]
    },
    {
      id: '6',
      name: 'Grilled Chicken',
      category: 'Protein',
      calories: 165,
      mainNutrient: {
        name: 'Protein',
        amount: 31,
        unit: 'g'
      },
      price: 2.50,
      image: foodImages[5]
    },
    {
      id: '7',
      name: 'Avocado',
      category: 'Fruit',
      calories: 240,
      mainNutrient: {
        name: 'Fats',
        amount: 22,
        unit: 'g'
      },
      price: 1.75,
      image: foodImages[0]
    },
    {
      id: '8',
      name: 'Sweet Potato',
      category: 'Carb',
      calories: 180,
      mainNutrient: {
        name: 'Carbs',
        amount: 41,
        unit: 'g'
      },
      price: 1.10,
      image: foodImages[1]
    },
    {
      id: '9',
      name: 'Quinoa',
      category: 'Carb',
      calories: 222,
      mainNutrient: {
        name: 'Carbs',
        amount: 39,
        unit: 'g'
      },
      price: 2.20,
      image: foodImages[2]
    },
    {
      id: '10',
      name: 'Banana',
      category: 'Fruit',
      calories: 105,
      mainNutrient: {
        name: 'Carbs',
        amount: 27,
        unit: 'g'
      },
      price: 0.50,
      image: foodImages[3]
    }
  ];
}
