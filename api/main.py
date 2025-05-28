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
        
        # 추천 실행
        recommendations = get_recommendations(user_profile)
        
        if not recommendations:
            raise HTTPException(status_code=404, detail="추천 가능한 음식이 없습니다")
        
        # 추천 결과를 FoodItem 형태로 변환
        recommended_foods = []
        for rec in recommendations:
            food_item = FoodItem(
                id=f"rec-{len(recommended_foods)}",
                name=rec['name'],
                type=rec.get('type', ''),
                category=rec.get('category', ''),
                cuisine='한식',
                calories=rec['calories'],
                protein=rec['protein'],
                fat=0,  # 기본값
                carbs=0,  # 기본값
                sodium=0,  # 기본값
                sugar=0,  # 기본값
                fiber=0,  # 기본값
                ingredients=[],
                tags=rec.get('tags', []),
                allergies=[],
                price=rec['price'],
                score=rec['score']
            )
            recommended_foods.append(food_item)
        
        # 식사별로 분배 (각 식사에 1개씩)
        meal_count = min(user_info.mealCount, len(recommended_foods))
        meals = [[food] for food in recommended_foods[:meal_count]]
        
        # 영양 요약 계산
        total_calories = sum(food.calories for food in recommended_foods[:meal_count])
        total_protein = sum(food.protein for food in recommended_foods[:meal_count])
        total_cost = sum(food.price for food in recommended_foods[:meal_count])
        
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