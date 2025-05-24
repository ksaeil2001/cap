import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Define food table
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  calories: integer("calories").notNull(),
  price: integer("price").notNull(), // Stored in cents
  image: text("image").notNull(),
});

// Define user profile table
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gender: text("gender").notNull(),
  height: integer("height").notNull(),
  weight: integer("weight").notNull(),
  bodyFatPercent: integer("body_fat_percent"),
  goal: text("goal").notNull(),
  budget: integer("budget").notNull(), // Stored in cents
});

// Define user allergies table
export const userAllergies = pgTable("user_allergies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  allergyName: text("allergy_name").notNull(),
});

// Define meal plans table
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(), // ISO string
});

// Define meal items table
export const mealItems = pgTable("meal_items", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").notNull().references(() => mealPlans.id),
  foodId: integer("food_id").notNull().references(() => foods.id),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
