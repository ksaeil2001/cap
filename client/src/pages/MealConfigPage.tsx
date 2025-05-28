import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AlertCustom from '@/components/ui/alert-custom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Wallet, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useMealConfigStore } from '@/stores/useMealConfigStore';
import { useRecommendStore } from '@/stores/useRecommendStore';
import { useUserStore } from '@/stores/useUserStore';
import { useMealSelectionStore } from '@/stores/useMealSelectionStore';
import MealSlot from '@/components/MealSlot';
import FoodCard from '@/components/Food/FoodCard';
import { FoodItem } from '@/api/mockRecommend';
import { formatCurrency } from '@/lib/utils';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import { MealTime } from '@/stores/useMealConfigStore';

const mealTypes: { id: MealTime; label: string; iconType: 'primary' | 'secondary' | 'accent' }[] = [
  { id: 'breakfast', label: '아침', iconType: 'primary' },
  { id: 'lunch', label: '점심', iconType: 'secondary' },
  { id: 'dinner', label: '저녁', iconType: 'accent' }
];

const MealConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MealTime>('breakfast');
  
  // Get data from stores
  const {
    meals,
    nutritionSummary,
    validationStatus,
    addFoodToMeal: addFoodToMealConfig,
    removeFoodFromMeal: removeFoodFromMealConfig,
    getMealTotalCalories,
    getMealTotalCost,
    updateNutritionSummary,
    isReadyForSummary
  } = useMealConfigStore();
  
  const { 
    allFoods, 
    filteredFoods, 
    filterByMealType, 
    clearFilters,
    selectedPerMeal, // 새로 추가한 끼니별 선택 음식
    addFoodToMeal: addFoodToRecommend,
    removeFoodFromMeal: removeFoodFromRecommend
  } = useRecommendStore();
  const userInfo = useUserStore();
  
  // 컴포넌트 마운트 시 실행할 초기화 로직
  useEffect(() => {
    // selectedPerMeal이 undefined인 경우 안전하게 처리
    if (!selectedPerMeal) {
      console.log('추천 데이터를 불러오는 중입니다...');
      return;
    }
    
    // RecommendPage에서 선택한 음식을 MealConfigStore에 로드
    const { breakfast = [], lunch = [], dinner = [] } = selectedPerMeal;
    
    // 끼니별로 음식을 MealConfigStore에 추가
    if (breakfast && breakfast.length > 0) {
      breakfast.forEach(food => {
        addFoodToMealConfig('breakfast', food);
      });
    }
    
    if (lunch && lunch.length > 0) {
      lunch.forEach(food => {
        addFoodToMealConfig('lunch', food);
      });
    }
    
    if (dinner && dinner.length > 0) {
      dinner.forEach(food => {
        addFoodToMealConfig('dinner', food);
      });
    }
    
    // 영양 정보 업데이트
    updateNutritionSummary();
    
    // 첫 번째 탭에 대한 추천 음식 로드
    clearFilters();
    filterByMealType(activeTab);
  }, []);
  
  // Handle tab change
  const handleTabChange = (mealType: MealTime) => {
    setActiveTab(mealType);
    clearFilters();
    filterByMealType(mealType);
  };
  
  // Handle add food - MealConfig 스토어를 사용
  const handleAddFood = (mealType: MealTime, food: FoodItem) => {
    addFoodToMealConfig(mealType, food);
    
    // 선택 정보를 RecommendStore에도 동기화 (선택사항)
    addFoodToRecommend(mealType, food);
  };
  
  // Handle remove food - MealConfig 스토어를 사용
  const handleRemoveFood = (mealType: MealTime, foodId: string) => {
    removeFoodFromMealConfig(mealType, foodId);
    
    // 선택 정보를 RecommendStore에도 동기화 (선택사항)
    removeFoodFromRecommend(mealType, foodId);
  };
  
  // Navigate to previous page
  const goBack = () => {
    navigate('/recommend');
  };
  
  // Navigate to summary page if validation passes
  const goToSummary = () => {
    if (isReadyForSummary()) {
      navigate('/summary');
    }
  };
  
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">끼니 구성하기</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              추천 페이지로 돌아가기
            </Button>
            <Button 
              onClick={goToSummary}
              disabled={!isReadyForSummary()}
            >
              요약 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Validation Alerts */}
        <div className="space-y-3">
          {validationStatus.budgetExceeded && (
            <AlertCustom type="danger" className="mb-2">
              <strong>예산 초과:</strong> 설정한 일일 예산 {formatCurrency(nutritionSummary.budget.target)}을 초과했습니다. 
              현재 총액: {formatCurrency(nutritionSummary.budget.actual)}
            </AlertCustom>
          )}
          
          {validationStatus.hasAllergies && (
            <AlertCustom type="danger" className="mb-2">
              <strong>알레르기 경고:</strong> 선택한 식단에 알레르기 유발 성분이 포함되어 있습니다.
              식단 구성을 다시 확인하고 조정해 주세요.
            </AlertCustom>
          )}
          
          {validationStatus.missingMeals && (
            <AlertCustom type="warning" className="mb-2">
              <strong>미완성 식단:</strong> 모든 끼니(아침, 점심, 저녁)에 최소 한 가지 이상의 음식을 추가해 주세요.
            </AlertCustom>
          )}
          
          {isReadyForSummary() && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>식단 준비 완료</AlertTitle>
              <AlertDescription>
                식단이 완성되었으며 모든 요구사항을 충족합니다. 요약 페이지로 진행할 수 있습니다.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Selected Meals */}
        <Card>
          <CardHeader>
            <CardTitle>내 식단 계획</CardTitle>
            <CardDescription>
              음식 항목을 추가하거나 제거하여 일일 식단을 구성하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mealTypes.map((mealType) => (
                <MealSlot
                  key={mealType.id}
                  title={mealType.label}
                  foods={meals[mealType.id]}
                  onAddFood={(food) => handleAddFood(mealType.id, food)}
                  onRemoveFood={(foodId) => handleRemoveFood(mealType.id, foodId)}
                  totalCalories={getMealTotalCalories(mealType.id)}
                  totalCost={getMealTotalCost(mealType.id)}
                  iconType={mealType.iconType}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Nutrition Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>영양 요약</CardTitle>
            <CardDescription>
              영양 목표와 예산 현황을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <NutritionProgressBar
                label="칼로리"
                current={nutritionSummary.calories.actual}
                target={nutritionSummary.calories.target}
                unit="kcal"
                color="blue"
              />
              
              <NutritionProgressBar
                label="단백질"
                current={nutritionSummary.protein.actual}
                target={nutritionSummary.protein.target}
                unit="g"
                color="purple"
              />
              
              <NutritionProgressBar
                label="탄수화물"
                current={nutritionSummary.carbs.actual}
                target={nutritionSummary.carbs.target}
                unit="g"
                color="orange"
              />
              
              <NutritionProgressBar
                label="지방"
                current={nutritionSummary.fat.actual}
                target={nutritionSummary.fat.target}
                unit="g"
                color="yellow"
              />
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">일일 예산</h3>
                <div className={`flex items-center ${nutritionSummary.budget.actual > nutritionSummary.budget.target ? 'text-red-500' : 'text-green-500'}`}>
                  <Wallet className="h-4 w-4 mr-1" />
                  <span>
                    {formatCurrency(nutritionSummary.budget.actual)} / {formatCurrency(nutritionSummary.budget.target)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MealConfigPage;