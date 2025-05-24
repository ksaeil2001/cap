from pydantic import BaseModel, Field
from typing import List, Optional, Literal

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
    budget: float = Field(..., ge=20, le=300)  # Weekly budget

class FoodItem(BaseModel):
    """Food item data model"""
    id: str
    foodId: int
    name: str
    category: Optional[str] = None
    kcal: float
    protein: float
    fat: float
    carbs: float
    price: float
    tags: List[str] = []
    image: Optional[str] = None
    
    # Compatibility fields
    calories: Optional[float] = None
    mainNutrient: Optional[dict] = None
    
    class Config:
        populate_by_name = True
        
    def __init__(self, **data):
        super().__init__(**data)
        # Ensure compatibility fields are populated
        if not self.calories and self.kcal:
            self.calories = self.kcal
        if not self.mainNutrient:
            self.mainNutrient = {
                "name": "Protein",
                "amount": self.protein,
                "unit": "g"
            }

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