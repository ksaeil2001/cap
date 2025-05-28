from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import os
import numpy as np
from datetime import datetime

# Import local modules
from .models import UserInfo, FoodItem, NutritionSummary, RecommendResponse
from .korean_food_loader import load_korean_foods

# Create FastAPI app
app = FastAPI(
    title="Korean Meal Recommendation API",
    description="API for personalized Korean meal recommendations based on user profile",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load authentic Korean food database on startup
print("🍲 Loading authentic Korean food database...")
food_database = load_korean_foods()
print(f"✅ Successfully loaded {len(food_database)} Korean food items")

# API routes
@app.get("/")
async def root():
    """Root endpoint to check if API is running"""
    return {
        "message": "Meal Recommendation API is running",
        "status": "active",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/foods")
async def get_all_foods():
    """Get all available foods in the database"""
    return {"foods": food_database}

@app.post("/api/recommend")
async def recommend(user_info: UserInfo):
    """Generate personalized Korean meal recommendations based on user info"""
    try:
        if not food_database:
            raise HTTPException(status_code=500, detail="Korean food database not available")
        
        # Filter by budget (convert weekly to daily)
        daily_budget = user_info.budget / 7
        affordable_foods = [food for food in food_database if food.price <= daily_budget]
        
        if not affordable_foods:
            affordable_foods = food_database[:20]  # Take first 20 as fallback
        
        # Filter by allergies
        if user_info.allergies:
            safe_foods = []
            for food in affordable_foods:
                is_safe = True
                for allergy in user_info.allergies:
                    if allergy.lower() in [a.lower() for a in food.allergies]:
                        is_safe = False
                        break
                if is_safe:
                    safe_foods.append(food)
            if safe_foods:
                affordable_foods = safe_foods
        
        # Select foods based on health goals
        if user_info.goal == "muscle-gain":
            # Prioritize high-protein foods
            affordable_foods.sort(key=lambda x: x.protein, reverse=True)
        elif user_info.goal == "weight-loss":
            # Prioritize low-calorie foods
            affordable_foods.sort(key=lambda x: x.calories)
        
        # Create meals (distribute foods across meals)
        meal_count = min(user_info.mealCount, len(affordable_foods))
        selected_foods = affordable_foods[:meal_count]
        meals = [[food] for food in selected_foods]
        
        # Calculate nutrition summary
        total_calories = sum(food.calories for food in selected_foods)
        total_protein = sum(food.protein for food in selected_foods)
        total_fat = sum(food.fat for food in selected_foods)
        total_carbs = sum(food.carbs for food in selected_foods)
        total_cost = sum(food.price for food in selected_foods)
        
        # Calculate targets based on user profile
        target_calories = 2000 + (100 if user_info.goal == "muscle-gain" else -200)
        target_protein = 120 if user_info.goal == "muscle-gain" else 80
        
        summary = NutritionSummary(
            calories={"current": total_calories, "target": target_calories, "percentage": (total_calories/target_calories)*100},
            protein={"current": total_protein, "target": target_protein, "percentage": (total_protein/target_protein)*100},
            fat={"current": total_fat, "target": 60, "percentage": (total_fat/60)*100},
            carbs={"current": total_carbs, "target": 200, "percentage": (total_carbs/200)*100},
            budget={"current": total_cost, "target": daily_budget, "percentage": (total_cost/daily_budget)*100},
            allergy=len(user_info.allergies) > 0
        )
        
        return RecommendResponse(
            meals=meals,
            summary=summary,
            fallback=len(affordable_foods) < user_info.mealCount
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating Korean meal recommendations: {str(e)}")

# For local development
if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)