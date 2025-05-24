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
from .food_recommender import recommend_meals
from .utils import load_food_database

# Create FastAPI app
app = FastAPI(
    title="Meal Recommendation API",
    description="API for personalized meal recommendations based on user profile",
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

# Load food database on startup
food_database = load_food_database()

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
    """Generate personalized meal recommendations based on user info"""
    try:
        # Call recommendation engine
        recommendations = recommend_meals(user_info, food_database)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

# For local development
if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)