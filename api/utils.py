import json
import os
import random
from typing import List, Dict, Any
import numpy as np
from .models import FoodItem

# 한국어 음식 데이터만 사용
SAMPLE_FOODS = [
    {
        "id": "f1",
        "foodId": 1,
        "name": "버거 에그불고기 버거",
        "category": "burger",
        "kcal": 236.0,
        "protein": 9.48,
        "fat": 10.5,
        "carbs": 18.2,
        "price": 8.50,
        "tags": ["한식", "lunch", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,burger"
    },
    {
        "id": "f2",
        "foodId": 2,
        "name": "버거 오리지널더블 버거",
        "category": "burger",
        "kcal": 260.0,
        "protein": 13.06,
        "fat": 12.5,
        "carbs": 20.3,
        "price": 7.90,
        "tags": ["한식", "lunch", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,double,burger"
    },
    {
        "id": "f3",
        "foodId": 3,
        "name": "버거 오리지널싱글 버거",
        "category": "burger",
        "kcal": 221.0,
        "protein": 9.83,
        "fat": 9.5,
        "carbs": 16.2,
        "price": 6.50,
        "tags": ["한식", "lunch"],
        "image": "https://source.unsplash.com/random/300x200/?korean,single,burger"
    },
    {
        "id": "f4",
        "foodId": 4,
        "name": "버거 와규에디션",
        "category": "burger",
        "kcal": 269.0,
        "protein": 10.81,
        "fat": 13.2,
        "carbs": 18.5,
        "price": 9.20,
        "tags": ["한식", "premium", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,wagyu,burger"
    },
    {
        "id": "f5",
        "foodId": 5,
        "name": "버거 와퍼 버거",
        "category": "burger",
        "kcal": 223.0,
        "protein": 10.43,
        "fat": 10.8,
        "carbs": 15.6,
        "price": 7.20,
        "tags": ["한식", "lunch", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,whopper,burger"
    },
    {
        "id": "f6",
        "foodId": 6,
        "name": "버거 와퍼주니어 버거",
        "category": "burger",
        "kcal": 253.0,
        "protein": 10.76,
        "fat": 12.5,
        "carbs": 18.2,
        "price": 6.30,
        "tags": ["한식", "lunch"],
        "image": "https://source.unsplash.com/random/300x200/?korean,junior,burger"
    },
    {
        "id": "f7",
        "foodId": 7,
        "name": "버거 인크레더블 버거",
        "category": "burger",
        "kcal": 240.0,
        "protein": 12.18,
        "fat": 12.6,
        "carbs": 19.23,
        "price": 8.80,
        "tags": ["한식", "lunch", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,incredible,burger"
    },
    {
        "id": "f8",
        "foodId": 8,
        "name": "버거 직화버섯소불고기 버거",
        "category": "burger",
        "kcal": 239.0,
        "protein": 7.77,
        "fat": 11.2,
        "carbs": 17.5,
        "price": 7.80,
        "tags": ["한식", "bulgogi", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,bulgogi,burger"
    },
    {
        "id": "f9",
        "foodId": 9,
        "name": "버거 직화소불고기버거",
        "category": "burger",
        "kcal": 257.0,
        "protein": 7.87,
        "fat": 12.4,
        "carbs": 19.8,
        "price": 7.60,
        "tags": ["한식", "bulgogi", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,bulgogi,burger"
    },
    {
        "id": "f10",
        "foodId": 10,
        "name": "버거 징거 더블다운맥스 버거",
        "category": "burger",
        "kcal": 216.0,
        "protein": 16.62,
        "fat": 12.64,
        "carbs": 8.97,
        "price": 9.40,
        "tags": ["한식", "high-protein", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?korean,zinger,burger"
    },
    {
        "id": "f11",
        "foodId": 11,
        "name": "김치찌개",
        "category": "soup",
        "kcal": 180.0,
        "protein": 12.0,
        "fat": 8.5,
        "carbs": 15.0,
        "price": 6.0,
        "tags": ["한식", "spicy", "lunch", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?kimchi,stew"
    },
    {
        "id": "f12",
        "foodId": 12,
        "name": "된장찌개",
        "category": "soup",
        "kcal": 165.0,
        "protein": 10.5,
        "fat": 7.2,
        "carbs": 14.0,
        "price": 5.5,
        "tags": ["한식", "breakfast", "lunch", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?soybean,paste,soup"
    },
    {
        "id": "f13",
        "foodId": 13,
        "name": "비빔밥",
        "category": "rice",
        "kcal": 510.0,
        "protein": 15.0,
        "fat": 10.0,
        "carbs": 85.0,
        "price": 7.5,
        "tags": ["한식", "lunch", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?bibimbap"
    },
    {
        "id": "f14",
        "foodId": 14,
        "name": "떡볶이",
        "category": "rice",
        "kcal": 380.0,
        "protein": 8.0,
        "fat": 5.0,
        "carbs": 75.0,
        "price": 4.5,
        "tags": ["한식", "spicy", "lunch", "snack"],
        "image": "https://source.unsplash.com/random/300x200/?tteokbokki"
    },
    {
        "id": "f15",
        "foodId": 15,
        "name": "불고기",
        "category": "meat",
        "kcal": 350.0,
        "protein": 25.0,
        "fat": 18.0,
        "carbs": 15.0,
        "price": 10.0,
        "tags": ["한식", "high-protein", "dinner"],
        "image": "https://source.unsplash.com/random/300x200/?bulgogi"
    }
]

def load_food_database() -> List[FoodItem]:
    """
    ❌ 비활성화됨: 기존 DB 및 샘플 데이터는 사용하지 않음
    ✅ 대신 korean_food_loader.load_korean_foods() 사용
    """
    print("⚠️ load_food_database()는 비활성화되었습니다.")
    print("   정제된 한국 음식 데이터만 사용합니다.")
    print("   korean_food_loader.load_korean_foods()를 사용하세요.")
    return []

def calculate_bmr(user_info):
    """
    Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
    
    Args:
        user_info: UserInfo object with gender, weight, height, age
        
    Returns:
        float: BMR value in calories
    """
    if user_info.gender == 'male':
        return (10 * user_info.weight) + (6.25 * user_info.height) - (5 * user_info.age) + 5
    else:
        return (10 * user_info.weight) + (6.25 * user_info.height) - (5 * user_info.age) - 161

def calculate_tdee(bmr, activity_level):
    """
    Calculate Total Daily Energy Expenditure based on activity level
    
    Args:
        bmr: Base Metabolic Rate
        activity_level: Activity level (low, medium, high)
        
    Returns:
        float: TDEE value in calories
    """
    activity_multipliers = {
        'low': 1.2,      # Sedentary
        'medium': 1.55,  # Moderate exercise
        'high': 1.8      # Hard exercise
    }
    
    return bmr * activity_multipliers.get(activity_level, 1.2)

def calculate_macro_targets(user_info, tdee):
    """
    Calculate target macronutrients based on user goal
    
    Args:
        user_info: UserInfo object with goal
        tdee: Total Daily Energy Expenditure
        
    Returns:
        dict: Target macronutrients in grams
    """
    if user_info.goal == 'weight-loss':
        # Caloric deficit for weight loss
        target_calories = tdee * 0.8
        protein_ratio = 0.4  # Higher protein for weight loss
        fat_ratio = 0.3
        carb_ratio = 0.3
    else:  # muscle-gain
        # Caloric surplus for muscle gain
        target_calories = tdee * 1.1
        protein_ratio = 0.3
        fat_ratio = 0.25
        carb_ratio = 0.45  # Higher carbs for muscle gain
    
    # Convert percentages to grams
    protein_target = (target_calories * protein_ratio) / 4  # 4 calories per gram
    fat_target = (target_calories * fat_ratio) / 9  # 9 calories per gram
    carb_target = (target_calories * carb_ratio) / 4  # 4 calories per gram
    
    return {
        'calories': target_calories,
        'protein': protein_target,
        'fat': fat_target,
        'carbs': carb_target
    }