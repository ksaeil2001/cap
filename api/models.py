from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from settings import MIN_BUDGET_WEEKLY, MAX_BUDGET_WEEKLY

class UserInfo(BaseModel):
    """User profile data model for meal recommendations"""
    gender: Literal['male', 'female']
    age: int = Field(..., ge=16, le=100)
    height: float = Field(..., ge=100, le=250)  # in cm
    weight: float = Field(..., ge=30, le=250)   # in kg
    bodyFatPercent: Optional[float] = Field(None, ge=3, le=50)
    goal: Literal['weight-loss', 'muscle-gain']
    activityLevel: Literal['low', 'medium', 'high']
    mealCount: int = Field(..., ge=3, le=6)
    allergies: List[str] = []
    budget: float = Field(..., ge=MIN_BUDGET_WEEKLY, le=MAX_BUDGET_WEEKLY)  # Weekly budget

class FoodItem(BaseModel):
    """Food item data model"""
    id: str
    name: str
    type: Optional[str] = None
    category: Optional[str] = None
    cuisine: Optional[str] = None
    calories: float  # 정제된 데이터에서는 calories로 명명
    protein: float
    fat: float
    carbs: float
    sodium: Optional[float] = None
    sugar: Optional[float] = None
    fiber: Optional[float] = None
    price: float
    tags: List[str] = []
    allergies: List[str] = []
    ingredients: List[str] = []
    score: Optional[float] = None
    popularity: Optional[int] = None
    rating: Optional[float] = None
    brand: Optional[str] = None
    
    class Config:
        populate_by_name = True

class NutritionSummary(BaseModel):
    """Nutrition summary data model"""
    calories: dict
    protein: dict
    fat: dict
    carbs: dict
    budget: dict
    allergy: bool

class RecommendResponse(BaseModel):
    """API response model for meal recommendations"""
    meals: List[List[FoodItem]]
    summary: NutritionSummary
    fallback: bool