import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Validation schema for user info
const userInfoSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(10).max(120),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(250),
  bodyFatPercent: z.number().min(5).max(50).optional(),
  goal: z.enum(["weight-loss", "muscle-gain"]),
  activityLevel: z.enum(["low", "medium", "high"]).optional(),
  budget: z.number().min(20),
  mealCount: z.number().min(2).max(3),
  allergies: z.array(z.string()).default([]),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for food recommendations
  app.post("/api/recommend", async (req, res) => {
    try {
      // Validate user info
      const userInfo = userInfoSchema.parse(req.body);
      
      // Get food recommendations based on user info
      const foods = await storage.getRecommendedFoods(userInfo);
      
      res.json({ foods });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user information", errors: error.errors });
      } else {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ message: "Failed to generate recommendations" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
