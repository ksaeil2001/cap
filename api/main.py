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
    """Generate personalized Korean meal recommendations using authentic data"""
    try:
        # 정제된 한국 음식 데이터로 추천 생성
        from utils.recommender import recommend as get_recommendations
        
        # 사용자 프로필 변환
        user_profile = {
            "gender": "남성" if user_info.gender == "male" else "여성",
            "age": user_info.age,
            "height": user_info.height,
            "weight": user_info.weight,
            "goal": "체중감량" if user_info.goal == "weight-loss" else "근육증가" if user_info.goal == "muscle-gain" else "체중유지",
            "budget": user_info.budget / 7,  # 주간 예산을 일간으로 변환
            "allergies": user_info.allergies,
            "preferences": ["단백질 위주", "간편식"],  # 기본 선호도
            "diseases": []  # 추후 확장 가능
        }
        
        # 추천 실행 (끼니별 구조로 반환됨)
        meal_recommendations = get_recommendations(user_profile)
        
        if not meal_recommendations:
            raise HTTPException(status_code=404, detail="추천 가능한 음식이 없습니다")
        
        # 끼니별 추천 결과를 FoodItem 형태로 변환
        meals = []
        all_recommended_foods = []
        
        for meal_time in ['breakfast', 'lunch', 'dinner']:
            meal_foods = []
            if meal_time in meal_recommendations:
                for rec in meal_recommendations[meal_time]:
                    try:
                        food_item = FoodItem(
                            id=f"rec-{meal_time}-{len(meal_foods)}",
                            name=rec['name'],
                            type=rec.get('type', ''),
                            category=rec.get('category', ''),
                            cuisine='한식',
                            calories=float(rec['calories']),
                            protein=float(rec['protein']),
                            fat=float(rec.get('fat', 0)),
                            carbs=float(rec.get('carbs', 0)),
                            sodium=0,  # 기본값
                            sugar=0,  # 기본값
                            fiber=0,  # 기본값
                            ingredients=[],
                            tags=rec.get('tags', []),
                            allergies=[],
                            price=float(rec['price']),
                            score=float(rec['score'])
                        )
                        meal_foods.append(food_item)
                        all_recommended_foods.append(food_item)
                    except (ValueError, KeyError) as e:
                        print(f"Error converting food item {rec.get('name', 'unknown')}: {e}")
                        continue
            
            meals.append(meal_foods)
        
        # 영양 요약 계산
        total_calories = sum(food.calories for food in all_recommended_foods)
        total_protein = sum(food.protein for food in all_recommended_foods)
        total_cost = sum(food.price for food in all_recommended_foods)
        
        target_calories = 2000 if user_info.goal == "weight-loss" else 2200
        target_protein = 120 if user_info.goal == "muscle-gain" else 80
        daily_budget = user_info.budget / 7
        
        summary = NutritionSummary(
            calories={"current": total_calories, "target": target_calories, "percentage": (total_calories/target_calories)*100},
            protein={"current": total_protein, "target": target_protein, "percentage": (total_protein/target_protein)*100},
            fat={"current": 0, "target": 60, "percentage": 0},
            carbs={"current": 0, "target": 200, "percentage": 0},
            budget={"current": total_cost, "target": daily_budget, "percentage": (total_cost/daily_budget)*100},
            allergy=len(user_info.allergies) > 0
        )
        
        return RecommendResponse(
            meals=meals,
            summary=summary,
            fallback=False
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추천 생성 오류: {str(e)}")

# For local development
if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)