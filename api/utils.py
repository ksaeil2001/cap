import json
import os
import random
from typing import List, Dict, Any
import numpy as np
from api.models import FoodItem

# Sample food database for development
SAMPLE_FOODS = [
    {
        "id": "f1",
        "foodId": 1,
        "name": "Grilled Chicken Breast",
        "category": "protein",
        "kcal": 165,
        "protein": 31,
        "fat": 3.6,
        "carbs": 0,
        "price": 2.50,
        "tags": ["high-protein", "low-carb"],
        "image": "https://source.unsplash.com/random/300x200/?grilled,chicken"
    },
    {
        "id": "f2",
        "foodId": 2,
        "name": "Brown Rice",
        "category": "carbs",
        "kcal": 216,
        "protein": 4.5,
        "fat": 1.8,
        "carbs": 45,
        "price": 0.75,
        "tags": ["whole-grain", "fiber"],
        "image": "https://source.unsplash.com/random/300x200/?brown,rice"
    },
    {
        "id": "f3",
        "foodId": 3,
        "name": "Avocado",
        "category": "fat",
        "kcal": 240,
        "protein": 3,
        "fat": 22,
        "carbs": 12,
        "price": 1.25,
        "tags": ["healthy-fat", "fiber"],
        "image": "https://source.unsplash.com/random/300x200/?avocado"
    },
    {
        "id": "f4",
        "foodId": 4,
        "name": "Salmon",
        "category": "protein",
        "kcal": 208,
        "protein": 20,
        "fat": 13,
        "carbs": 0,
        "price": 3.75,
        "tags": ["omega-3", "high-protein"],
        "image": "https://source.unsplash.com/random/300x200/?salmon"
    },
    {
        "id": "f5",
        "foodId": 5,
        "name": "Sweet Potato",
        "category": "carbs",
        "kcal": 86,
        "protein": 1.6,
        "fat": 0.1,
        "carbs": 20,
        "price": 0.60,
        "tags": ["complex-carbs", "vitamin-a"],
        "image": "https://source.unsplash.com/random/300x200/?sweet,potato"
    },
    {
        "id": "f6",
        "foodId": 6,
        "name": "Greek Yogurt",
        "category": "protein",
        "kcal": 100,
        "protein": 17,
        "fat": 0.4,
        "carbs": 6,
        "price": 1.20,
        "tags": ["probiotics", "calcium"],
        "image": "https://source.unsplash.com/random/300x200/?greek,yogurt"
    },
    {
        "id": "f7",
        "foodId": 7,
        "name": "Broccoli",
        "category": "vegetable",
        "kcal": 55,
        "protein": 3.7,
        "fat": 0.6,
        "carbs": 11,
        "price": 0.80,
        "tags": ["cruciferous", "vitamin-c"],
        "image": "https://source.unsplash.com/random/300x200/?broccoli"
    },
    {
        "id": "f8",
        "foodId": 8,
        "name": "Quinoa",
        "category": "carbs",
        "kcal": 222,
        "protein": 8,
        "fat": 3.6,
        "carbs": 39,
        "price": 1.50,
        "tags": ["complete-protein", "whole-grain"],
        "image": "https://source.unsplash.com/random/300x200/?quinoa"
    },
    {
        "id": "f9",
        "foodId": 9,
        "name": "Almonds",
        "category": "fat",
        "kcal": 164,
        "protein": 6,
        "fat": 14,
        "carbs": 6,
        "price": 1.80,
        "tags": ["vitamin-e", "healthy-fat"],
        "image": "https://source.unsplash.com/random/300x200/?almonds"
    },
    {
        "id": "f10",
        "foodId": 10,
        "name": "Spinach",
        "category": "vegetable",
        "kcal": 23,
        "protein": 2.9,
        "fat": 0.4,
        "carbs": 3.6,
        "price": 0.70,
        "tags": ["iron", "vitamin-k"],
        "image": "https://source.unsplash.com/random/300x200/?spinach"
    },
    {
        "id": "f11",
        "foodId": 11,
        "name": "Banana",
        "category": "fruit",
        "kcal": 105,
        "protein": 1.3,
        "fat": 0.4,
        "carbs": 27,
        "price": 0.30,
        "tags": ["potassium", "vitamin-b6"],
        "image": "https://source.unsplash.com/random/300x200/?banana"
    },
    {
        "id": "f12",
        "foodId": 12,
        "name": "Eggs",
        "category": "protein",
        "kcal": 155,
        "protein": 12.6,
        "fat": 10.6,
        "carbs": 1.1,
        "price": 0.25,
        "tags": ["vitamin-d", "complete-protein"],
        "image": "https://source.unsplash.com/random/300x200/?eggs"
    },
    {
        "id": "f13",
        "foodId": 13,
        "name": "Lentils",
        "category": "protein",
        "kcal": 116,
        "protein": 9,
        "fat": 0.4,
        "carbs": 20,
        "price": 0.60,
        "tags": ["plant-protein", "fiber"],
        "image": "https://source.unsplash.com/random/300x200/?lentils"
    },
    {
        "id": "f14",
        "foodId": 14,
        "name": "Oatmeal",
        "category": "carbs",
        "kcal": 158,
        "protein": 6,
        "fat": 3.2,
        "carbs": 27,
        "price": 0.40,
        "tags": ["fiber", "whole-grain"],
        "image": "https://source.unsplash.com/random/300x200/?oatmeal"
    },
    {
        "id": "f15",
        "foodId": 15,
        "name": "Tofu",
        "category": "protein",
        "kcal": 76,
        "protein": 8,
        "fat": 4.8,
        "carbs": 1.9,
        "price": 1.30,
        "tags": ["plant-protein", "calcium"],
        "image": "https://source.unsplash.com/random/300x200/?tofu"
    }
]

def load_food_database() -> List[FoodItem]:
    """
    Load food data from file or use sample data
    
    Returns:
        List[FoodItem]: List of food items
    """
    try:
        # Try to load from a file if it exists
        food_db_path = os.path.join(os.path.dirname(__file__), 'data/foods.json')
        if os.path.exists(food_db_path):
            with open(food_db_path, 'r') as f:
                foods_data = json.load(f)
        else:
            # Use sample data
            foods_data = SAMPLE_FOODS
        
        # Convert to FoodItem objects
        return [FoodItem(**food) for food in foods_data]
    except Exception as e:
        print(f"Error loading food database: {e}")
        # Fallback to sample data
        return [FoodItem(**food) for food in SAMPLE_FOODS]

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