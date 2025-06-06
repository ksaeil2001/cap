import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fetch from "node-fetch";
import { spawn } from "child_process";

// 더 유연한 사용자 정보 검증 스키마
const userInfoSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().min(10).max(120),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(250),
  bodyFatPercent: z.number().min(5).max(50).optional(),
  goal: z.enum(["weight-loss", "muscle-gain"]).optional().default("weight-loss"),
  activityLevel: z.enum(["low", "medium", "high"]).optional().default("medium"),
  budget: z.number().min(20).optional().default(70000),
  mealCount: z.number().min(2).max(6).optional().default(3),
  allergies: z.array(z.string()).optional().default([]),
  isAgreementChecked: z.boolean().optional().default(true),
});

// Start the FastAPI server on port 8001 to avoid conflicts
function startFastAPIServer() {
  console.log("Starting FastAPI server on port 8001...");
  const pythonProcess = spawn("python", ["-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8001"]);
  
  pythonProcess.stdout.on("data", (data) => {
    console.log(`FastAPI server: ${data}`);
  });
  
  pythonProcess.stderr.on("data", (data) => {
    console.error(`FastAPI server error: ${data}`);
  });
  
  pythonProcess.on("close", (code) => {
    console.log(`FastAPI server process exited with code ${code}`);
  });
  
  return pythonProcess;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the FastAPI server when the Express server starts
  const fastApiProcess = startFastAPIServer();
  
  // API endpoint for food recommendations
  app.post("/api/recommend", async (req, res) => {
    try {
      console.log("Received recommendation request:", req.body);
      
      // Simplified validation - allow all reasonable inputs
      const userInfo = {
        gender: req.body.gender || "male",
        age: req.body.age || 25,
        height: req.body.height || 170,
        weight: req.body.weight || 70,
        goal: req.body.goal || "weight-loss",
        activityLevel: req.body.activityLevel || "medium",
        budget: req.body.budget || 70000,
        mealCount: req.body.mealCount || 3,
        allergies: req.body.allergies || [],
        bodyFatPercent: req.body.bodyFatPercent,
        isAgreementChecked: true
      };
      
      console.log("Generating recommendations for user:", {
        gender: userInfo.gender,
        age: userInfo.age,
        goal: userInfo.goal,
        activityLevel: userInfo.activityLevel || 'not specified',
        mealCount: userInfo.mealCount
      });
      
      try {
        // Try to use the FastAPI backend first
        console.log("Attempting to use FastAPI backend for recommendations...");
        const apiResponse = await fetch("http://localhost:8001/api/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userInfo),
        });
        
        if (apiResponse.ok) {
          const fastApiData = await apiResponse.json();
          console.log("Successfully retrieved recommendations from FastAPI");
          res.json(fastApiData);
          return;
        } else {
          console.warn("FastAPI returned an error, falling back to storage implementation");
        }
      } catch (fastApiError) {
        console.warn("Could not connect to FastAPI server, falling back to storage implementation", fastApiError);
      }
      
      // Fallback to the storage implementation if FastAPI fails
      const foods = await storage.getRecommendedFoods(userInfo);
      res.json({ foods, fallback: true });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user information", errors: error.errors });
      } else {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ message: "Failed to generate recommendations" });
      }
    }
  });
  
  // Add a route to check API status
  app.get("/api/status", async (_req, res) => {
    try {
      const response = await fetch("http://localhost:8001/");
      const data = await response.json();
      res.json({ 
        status: "ok", 
        apiStatus: data,
        message: "Both Express and FastAPI servers are running" 
      });
    } catch (error) {
      res.json({ 
        status: "partial", 
        expressStatus: "ok",
        fastApiStatus: "offline",
        message: "Express server is running, but FastAPI server is offline"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
