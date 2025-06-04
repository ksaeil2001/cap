import { 
  users, type User, type InsertUser, 
  foods, nutrients, foodNutrients,
  type Food as DbFood, type Nutrient as DbNutrient
} from "@shared/schema";
import { UserInfo, Food, Nutrient } from "@/types";
import { db } from "./db";
import { eq, sql, and, inArray, like, desc, asc } from "drizzle-orm";

// Food images for seed data
const foodImages = [
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
  "https://images.unsplash.com/photo-1542814880-7e62cf14b7c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
];

// Define storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getRecommendedFoods(userInfo: UserInfo): Promise<Food[]>;
  seedDatabase(): Promise<void>;
}

// Initial seed data for database
const seedFoods = [
  {
    name: 'Salmon Fillet',
    category: 'Protein',
    calories: 206,
    price: 350, // Stored in cents
    mainNutrient: { name: 'Protein', amount: 22, unit: 'g' },
    image: foodImages[0]
  },
  {
    name: 'Brown Rice',
    category: 'Carb',
    calories: 215,
    price: 80,
    mainNutrient: { name: 'Carbs', amount: 45, unit: 'g' },
    image: foodImages[1]
  },
  {
    name: 'Broccoli',
    category: 'Vegetable',
    calories: 55,
    price: 120,
    mainNutrient: { name: 'Fiber', amount: 5.1, unit: 'g' },
    image: foodImages[2]
  },
  {
    name: 'Greek Yogurt',
    category: 'Protein',
    calories: 150,
    price: 150,
    mainNutrient: { name: 'Protein', amount: 15, unit: 'g' },
    image: foodImages[3]
  },
  {
    name: 'Blueberries',
    category: 'Fruit',
    calories: 80,
    price: 200,
    mainNutrient: { name: 'Fiber', amount: 4, unit: 'g' },
    image: foodImages[4]
  },
  {
    name: 'Grilled Chicken',
    category: 'Protein',
    calories: 165,
    price: 250,
    mainNutrient: { name: 'Protein', amount: 31, unit: 'g' },
    image: foodImages[5]
  },
  {
    name: 'Avocado',
    category: 'Fruit',
    calories: 240,
    price: 175,
    mainNutrient: { name: 'Fats', amount: 22, unit: 'g' },
    image: foodImages[0]
  },
  {
    name: 'Sweet Potato',
    category: 'Carb',
    calories: 180,
    price: 110,
    mainNutrient: { name: 'Carbs', amount: 41, unit: 'g' },
    image: foodImages[1]
  },
  {
    name: 'Quinoa',
    category: 'Carb',
    calories: 222,
    price: 220,
    mainNutrient: { name: 'Carbs', amount: 39, unit: 'g' },
    image: foodImages[2]
  },
  {
    name: 'Banana',
    category: 'Fruit',
    calories: 105,
    price: 50,
    mainNutrient: { name: 'Carbs', amount: 27, unit: 'g' },
    image: foodImages[3]
  },
  {
    name: 'Spinach',
    category: 'Vegetable',
    calories: 23,
    price: 130,
    mainNutrient: { name: 'Fiber', amount: 2.2, unit: 'g' },
    image: foodImages[4]
  },
  {
    name: 'Eggs',
    category: 'Protein',
    calories: 155,
    price: 40,
    mainNutrient: { name: 'Protein', amount: 13, unit: 'g' },
    image: foodImages[5]
  }
];

export class DatabaseStorage implements IStorage {
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getRecommendedFoods(userInfo: UserInfo): Promise<Food[]> {
    try {
      console.log(`Getting recommendations from 1,005 Korean foods database`);
      console.log(`User info: age ${userInfo.age}, goal ${userInfo.goal}, meals ${userInfo.mealCount}`);
      
      // 데이터베이스에서 직접 한국 음식 데이터 가져오기
      const koreanFoods = await db.select().from(foods).limit(50);
      console.log(`Found ${koreanFoods.length} Korean foods in database`);

      if (koreanFoods.length === 0) {
        console.warn('No Korean foods found in database');
        return [];
      }

      // 데이터베이스 음식을 Food 타입으로 변환
      let dbFoods = koreanFoods.map(dbFood => {
        return {
          id: dbFood.id,
          name: dbFood.name,
          category: dbFood.category,
          calories: dbFood.calories,
          price: dbFood.price, // 원 단위로 그대로 사용
          mainNutrient: {
            name: 'Protein',
            amount: dbFood.protein || 10,
            unit: 'g'
          },
          image: `https://source.unsplash.com/300x200/?korean,food,${encodeURIComponent(dbFood.name)}`
        } as Food;
      });

      // 사용자 목표에 따른 필터링
      let recommendedFoods = [...dbFoods];
      
      // Filter out foods that contain allergens
      if (userInfo.allergies.length > 0) {
        const allergyKeywords = userInfo.allergies.map(a => a.toLowerCase());
        recommendedFoods = recommendedFoods.filter(food => 
          !allergyKeywords.some(allergen => 
            food.name.toLowerCase().includes(allergen)
          )
        );
      }
      
      // Calculate daily calorie needs based on age, gender, weight, height, and activity level
      let basalMetabolicRate = 0;
      // BMR using Mifflin-St Jeor equation
      if (userInfo.gender === 'male') {
        basalMetabolicRate = 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age + 5;
      } else {
        basalMetabolicRate = 10 * userInfo.weight + 6.25 * userInfo.height - 5 * userInfo.age - 161;
      }
      
      // Apply activity multiplier
      let calorieNeeds = basalMetabolicRate;
      if (userInfo.activityLevel === 'low') {
        calorieNeeds *= 1.2;
      } else if (userInfo.activityLevel === 'medium') {
        calorieNeeds *= 1.55;
      } else if (userInfo.activityLevel === 'high') {
        calorieNeeds *= 1.9;
      } else {
        // Default to sedentary if not specified
        calorieNeeds *= 1.2;
      }
      
      // Adjust based on goal
      if (userInfo.goal === 'weight-loss') {
        calorieNeeds *= 0.8; // 20% deficit for weight loss
        
        // For weight loss, prioritize lower calorie, higher protein foods
        recommendedFoods.sort((a, b) => {
          // Prioritize protein foods first
          if (a.category === 'Protein' && b.category !== 'Protein') return -1;
          if (a.category !== 'Protein' && b.category === 'Protein') return 1;
          
          // Then sort by calories (lower first)
          return a.calories - b.calories;
        });
      } else if (userInfo.goal === 'muscle-gain') {
        calorieNeeds *= 1.1; // 10% surplus for muscle gain
        
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
      
      // Calculate per-meal calorie target
      const caloriesPerMeal = calorieNeeds / userInfo.mealCount;
      console.log(`Target calories per meal: ${caloriesPerMeal.toFixed(0)}`);
      
      // Consider budget constraints
      const dailyBudget = userInfo.budget / 7;
      const budgetPerMeal = dailyBudget / userInfo.mealCount;
      recommendedFoods = recommendedFoods.filter(food => food.price <= budgetPerMeal);
      
      // Return more recommendations based on meal count
      const recommendationCount = Math.min(userInfo.mealCount * 5, recommendedFoods.length);
      return recommendedFoods.slice(0, recommendationCount);
    } catch (error) {
      console.error("Error fetching recommended foods:", error);
      return [];
    }
  }

  async seedDatabase(): Promise<void> {
    try {
      // Check if we already have data
      const existingFoods = await db.select({ count: sql`count(*)` }).from(foods);
      const count = Number((existingFoods[0] as any).count);
      if (count > 0) {
        console.log("Database already seeded, skipping...");
        return;
      }

      console.log("Seeding database with initial data...");

      // Insert nutrients first
      const uniqueNutrients: string[] = [];
      seedFoods.forEach(food => {
        if (!uniqueNutrients.includes(food.mainNutrient.name)) {
          uniqueNutrients.push(food.mainNutrient.name);
        }
      });

      const insertedNutrients: Record<string, number> = {};
      
      for (const nutrientName of uniqueNutrients) {
        const [nutrient] = await db
          .insert(nutrients)
          .values({
            name: nutrientName,
            unit: seedFoods.find(f => f.mainNutrient.name === nutrientName)?.mainNutrient.unit || 'g'
          })
          .returning();
        
        insertedNutrients[nutrientName] = nutrient.id;
      }

      // Insert foods
      for (const foodData of seedFoods) {
        const mainNutrientId = insertedNutrients[foodData.mainNutrient.name];
        
        const [insertedFood] = await db
          .insert(foods)
          .values({
            name: foodData.name,
            category: foodData.category,
            calories: foodData.calories,
            price: foodData.price,
            image: foodData.image,
            mainNutrientId: mainNutrientId
          })
          .returning();

        // Insert the food-nutrient relation
        await db
          .insert(foodNutrients)
          .values({
            foodId: insertedFood.id,
            nutrientId: mainNutrientId,
            amount: foodData.mainNutrient.amount
          });
      }

      console.log("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding database:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
