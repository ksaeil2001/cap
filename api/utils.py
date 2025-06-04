import json
import os
import random
from typing import List, Dict, Any
import numpy as np
from .models import FoodItem

# ❌ SAMPLE_FOODS는 완전히 비활성화됨
# ✅ 오직 /data/정제 데이터.json 파일만 사용
SAMPLE_FOODS = []  # 빈 배열로 비활성화

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
    weight = user_info.weight
    height = user_info.height
    age = user_info.age
    gender = user_info.gender.lower()
    
    if gender == 'male':
        # Men: BMR = 66.47 + (13.75 × weight in kg) + (5.003 × height in cm) - (6.755 × age in years)
        bmr = 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age)
    else:
        # Women: BMR = 655.1 + (9.563 × weight in kg) + (1.85 × height in cm) - (4.676 × age in years)
        bmr = 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age)
    
    return max(bmr, 1200)  # Minimum BMR of 1200 calories

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
        'low': 1.2,      # Little to no exercise
        'medium': 1.55,   # Light exercise/sports 3-5 days/week
        'high': 1.725     # Moderate exercise/sports 6-7 days a week
    }
    
    multiplier = activity_multipliers.get(activity_level.lower(), 1.4)
    return bmr * multiplier

def calculate_macro_targets(user_info, tdee):
    """
    Calculate target macronutrients based on user goal
    
    Args:
        user_info: UserInfo object with goal
        tdee: Total Daily Energy Expenditure
        
    Returns:
        dict: Target macronutrients in grams
    """
    goal = user_info.goal.lower()
    
    if goal == 'muscle-gain':
        # High protein, moderate carbs
        protein_ratio = 0.25  # 25% of calories from protein
        carb_ratio = 0.45     # 45% of calories from carbs
        fat_ratio = 0.30      # 30% of calories from fat
        calorie_adjustment = 1.10  # 10% surplus for muscle gain
    else:  # weight-loss
        # Higher protein to preserve muscle, lower carbs
        protein_ratio = 0.30  # 30% of calories from protein
        carb_ratio = 0.35     # 35% of calories from carbs
        fat_ratio = 0.35      # 35% of calories from fat
        calorie_adjustment = 0.85  # 15% deficit for weight loss
    
    adjusted_calories = tdee * calorie_adjustment
    
    # Convert ratios to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    target_protein = (adjusted_calories * protein_ratio) / 4
    target_carbs = (adjusted_calories * carb_ratio) / 4
    target_fat = (adjusted_calories * fat_ratio) / 9
    
    return {
        'calories': adjusted_calories,
        'protein': target_protein,
        'carbs': target_carbs,
        'fat': target_fat
    }