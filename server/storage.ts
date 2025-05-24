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
      // Query the database for foods with their related nutrients
      const foodsWithNutrients = await db.query.foods.findMany({
        with: {
          mainNutrient: true
        }
      });

      // Map the database results to the Food type
      let dbFoods = foodsWithNutrients.map(dbFood => {
        // Get the nutrient amount from the food_nutrients table
        return {
          id: dbFood.id.toString(),
          name: dbFood.name,
          category: dbFood.category,
          calories: dbFood.calories,
          price: dbFood.price / 100, // Convert cents to dollars
          mainNutrient: {
            name: dbFood.mainNutrientId ? 'Protein' : 'Unknown', // Default fallback
            amount: 0, // Will be updated from food_nutrients table
            unit: 'g'
          },
          image: dbFood.image
        } as Food;
      });

      // Load the nutrient amounts from the food_nutrients table
      for (const food of dbFoods) {
        const [foodNutrient] = await db
          .select({
            amount: foodNutrients.amount
          })
          .from(foodNutrients)
          .where(
            and(
              eq(foodNutrients.foodId, parseInt(food.id)),
              eq(foodNutrients.nutrientId, parseInt(food.id.split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0) % 5 + 1)) // Get a nutrient ID based on the food ID
            )
          );

        if (foodNutrient) {
          food.mainNutrient.amount = foodNutrient.amount;
        }
      }

      // Filter foods based on user preferences and allergies
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
