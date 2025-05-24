import { users, type User, type InsertUser } from "@shared/schema";
import { UserInfo, Food } from "@/types";

// Mock food images
const foodImages = [
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1542814880-7e62cf14b7c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
];

// Sample food database
const foodDatabase: Food[] = [
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
  },
  {
    id: '11',
    name: 'Spinach',
    category: 'Vegetable',
    calories: 23,
    mainNutrient: {
      name: 'Fiber',
      amount: 2.2,
      unit: 'g'
    },
    price: 1.30,
    image: foodImages[4]
  },
  {
    id: '12',
    name: 'Eggs',
    category: 'Protein',
    calories: 155,
    mainNutrient: {
      name: 'Protein',
      amount: 13,
      unit: 'g'
    },
    price: 0.40,
    image: foodImages[5]
  }
];

// Define storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getRecommendedFoods(userInfo: UserInfo): Promise<Food[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foods: Food[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.foods = foodDatabase;
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRecommendedFoods(userInfo: UserInfo): Promise<Food[]> {
    // Filter foods based on user preferences and allergies
    let recommendedFoods = [...this.foods];
    
    // Filter out foods that contain allergens
    if (userInfo.allergies.length > 0) {
      // This is a simplified version. In a real app, foods would have allergen info
      const allergyKeywords = userInfo.allergies.map(a => a.toLowerCase());
      recommendedFoods = recommendedFoods.filter(food => 
        !allergyKeywords.some(allergen => 
          food.name.toLowerCase().includes(allergen)
        )
      );
    }
    
    // Adjust food selection based on goal
    if (userInfo.goal === 'weight-loss') {
      // For weight loss, prioritize lower calorie, higher protein foods
      recommendedFoods.sort((a, b) => {
        // Prioritize protein foods first
        if (a.category === 'Protein' && b.category !== 'Protein') return -1;
        if (a.category !== 'Protein' && b.category === 'Protein') return 1;
        
        // Then sort by calories (lower first)
        return a.calories - b.calories;
      });
    } else if (userInfo.goal === 'muscle-gain') {
      // For muscle gain, prioritize protein-rich foods
      recommendedFoods.sort((a, b) => {
        // Prioritize protein foods first
        if (a.category === 'Protein' && b.category !== 'Protein') return -1;
        if (a.category !== 'Protein' && b.category === 'Protein') return 1;
        
        // Then sort by protein content if available
        if (a.mainNutrient.name === 'Protein' && b.mainNutrient.name === 'Protein') {
          return b.mainNutrient.amount - a.mainNutrient.amount;
        }
        
        return 0;
      });
    }
    
    // Consider budget constraints
    const dailyBudget = userInfo.budget / 7;
    recommendedFoods = recommendedFoods.filter(food => food.price <= dailyBudget / 3);
    
    return recommendedFoods;
  }
}

export const storage = new MemStorage();
