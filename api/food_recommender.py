import random
from typing import List, Dict, Any
import numpy as np
from api.models import UserInfo, FoodItem, NutritionSummary, RecommendResponse
from api.utils import calculate_bmr, calculate_tdee, calculate_macro_targets

def recommend_meals(user_info: UserInfo, food_database: List[FoodItem]) -> RecommendResponse:
    """
    Generate meal recommendations based on user profile and nutritional needs
    
    Args:
        user_info: UserInfo object containing user profile
        food_database: List of FoodItem objects
        
    Returns:
        RecommendResponse: Object containing meal recommendations and nutrition summary
    """
    # Calculate user's nutritional needs
    bmr = calculate_bmr(user_info)
    tdee = calculate_tdee(bmr, user_info.activityLevel)
    targets = calculate_macro_targets(user_info, tdee)
    
    # Filter out foods with allergens if user has allergies
    available_foods = food_database
    if user_info.allergies:
        available_foods = [
            food for food in food_database 
            if not any(allergen.lower() in tag.lower() for allergen in user_info.allergies for tag in food.tags)
        ]
    
    # Check if we have enough foods left after filtering
    if len(available_foods) < 10:  # Arbitrary threshold
        # Not enough foods available with allergy restrictions
        return generate_fallback_response(user_info, food_database, targets)
    
    # Group foods by category for balanced meal creation
    foods_by_category = {}
    for food in available_foods:
        category = food.category if food.category else "other"
        if category not in foods_by_category:
            foods_by_category[category] = []
        foods_by_category[category].append(food)
    
    # Create meals based on user's meal count preference
    meal_count = min(user_info.mealCount, 5)  # Cap at 5 meals per day
    meals = []
    
    # Assign calorie distribution per meal
    if meal_count == 3:
        # Standard 3 meals per day
        meal_calories = [0.3, 0.4, 0.3]  # breakfast, lunch, dinner
    elif meal_count == 4:
        meal_calories = [0.25, 0.3, 0.25, 0.2]  # with afternoon snack
    elif meal_count == 5:
        meal_calories = [0.2, 0.25, 0.2, 0.2, 0.15]  # with morning and afternoon snacks
    else:
        # Default to 3 meals
        meal_calories = [0.3, 0.4, 0.3]
        meal_count = 3
    
    # Generate meals to match calorie distribution
    budget_per_meal = user_info.budget / 7  # Daily budget (weekly budget / 7)
    
    total_calories = 0
    total_protein = 0
    total_fat = 0
    total_carbs = 0
    total_cost = 0
    
    for i in range(meal_count):
        meal_target_calories = targets['calories'] * meal_calories[i]
        meal_foods = generate_meal(
            foods_by_category,
            meal_target_calories,
            budget_per_meal * meal_calories[i],
            user_info.goal
        )
        meals.append(meal_foods)
        
        # Add to nutrition totals
        for food in meal_foods:
            total_calories += food.kcal
            total_protein += food.protein
            total_fat += food.fat
            total_carbs += food.carbs
            total_cost += food.price
    
    # Create nutrition summary
    summary = NutritionSummary(
        calories={
            'target': round(targets['calories']),
            'actual': round(total_calories)
        },
        protein={
            'target': round(targets['protein']),
            'actual': round(total_protein)
        },
        fat={
            'target': round(targets['fat']),
            'actual': round(total_fat)
        },
        carbs={
            'target': round(targets['carbs']),
            'actual': round(total_carbs)
        },
        budget={
            'target': round(budget_per_meal, 2),
            'actual': round(total_cost, 2)
        },
        allergy=len(user_info.allergies) > 0
    )
    
    return RecommendResponse(
        meals=meals,
        summary=summary,
        fallback=False
    )

def generate_meal(
    foods_by_category: Dict[str, List[FoodItem]],
    target_calories: float,
    budget: float,
    goal: str
) -> List[FoodItem]:
    """
    Generate a balanced meal based on target calories and budget
    
    Args:
        foods_by_category: Dictionary of foods grouped by category
        target_calories: Target calories for the meal
        budget: Budget for the meal
        goal: User's fitness goal
    
    Returns:
        List[FoodItem]: List of foods for the meal
    """
    meal = []
    current_calories = 0
    current_cost = 0
    
    # Prioritize protein for muscle gain and carbs for energy
    if goal == 'muscle-gain':
        priority_categories = ['protein', 'carbs', 'vegetable', 'fat', 'fruit']
    else:  # weight-loss
        priority_categories = ['protein', 'vegetable', 'fruit', 'carbs', 'fat']
    
    # Add foods from each category until we reach target calories or budget
    for category in priority_categories:
        if category not in foods_by_category or not foods_by_category[category]:
            continue
            
        # Choose random food from category
        available_foods = [
            f for f in foods_by_category[category] 
            if current_cost + f.price <= budget and current_calories + f.kcal <= target_calories * 1.1
        ]
        
        if not available_foods:
            continue
            
        food = random.choice(available_foods)
        meal.append(food)
        current_calories += food.kcal
        current_cost += food.price
        
        # Stop if we've reached the target calories (with 10% flexibility)
        if current_calories >= target_calories * 0.9:
            break
    
    # If we haven't reached minimum calories, add more foods
    if current_calories < target_calories * 0.8 and current_cost < budget:
        all_foods = []
        for foods in foods_by_category.values():
            all_foods.extend(foods)
            
        # Sort by calories per dollar for efficiency
        all_foods.sort(key=lambda f: f.kcal / max(f.price, 0.01), reverse=True)
        
        for food in all_foods:
            if current_cost + food.price <= budget and current_calories + food.kcal <= target_calories * 1.1:
                if food not in meal:  # Avoid duplicates
                    meal.append(food)
                    current_calories += food.kcal
                    current_cost += food.price
                    
                    if current_calories >= target_calories * 0.9:
                        break
    
    return meal

def generate_fallback_response(
    user_info: UserInfo,
    food_database: List[FoodItem],
    targets: Dict[str, float]
) -> RecommendResponse:
    """
    Generate a fallback response when allergies restrict too many foods
    
    Args:
        user_info: UserInfo object containing user profile
        food_database: List of FoodItem objects
        targets: Dictionary of nutritional targets
        
    Returns:
        RecommendResponse: Object containing meal recommendations and nutrition summary
    """
    # Simply select random foods for the meals
    meal_count = min(user_info.mealCount, 5)
    meals = []
    
    # Create random meal groups
    for _ in range(meal_count):
        # Randomly select 3-5 foods per meal
        meal_size = random.randint(3, 5)
        meal = random.sample(food_database, min(meal_size, len(food_database)))
        meals.append(meal)
    
    # Calculate nutrition totals
    total_calories = sum(food.kcal for meal in meals for food in meal)
    total_protein = sum(food.protein for meal in meals for food in meal)
    total_fat = sum(food.fat for meal in meals for food in meal)
    total_carbs = sum(food.carbs for meal in meals for food in meal)
    total_cost = sum(food.price for meal in meals for food in meal)
    
    # Create nutrition summary
    summary = NutritionSummary(
        calories={
            'target': round(targets['calories']),
            'actual': round(total_calories)
        },
        protein={
            'target': round(targets['protein']),
            'actual': round(total_protein)
        },
        fat={
            'target': round(targets['fat']),
            'actual': round(total_fat)
        },
        carbs={
            'target': round(targets['carbs']),
            'actual': round(total_carbs)
        },
        budget={
            'target': round(user_info.budget / 7, 2),  # Daily budget
            'actual': round(total_cost, 2)
        },
        allergy=len(user_info.allergies) > 0
    )
    
    return RecommendResponse(
        meals=meals,
        summary=summary,
        fallback=True  # Indicate this is a fallback response
    )