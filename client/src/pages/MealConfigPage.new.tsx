import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  DollarSign, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AlertCustom from '@/components/ui/alert-custom';
import { useMealConfigStore } from '@/stores/useMealConfigStore';
import { useRecommendStore } from '@/stores/useRecommendStore';
import { useUserStore } from '@/stores/useUserStore';
import { useMealSelectionStore } from '@/stores/useMealSelectionStore';
import MealSlot from '@/components/MealSlot';
import { FoodItem } from '@/api/mockRecommend';
import { formatCurrency } from '@/lib/utils';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import { MealTime } from '@/stores/useMealConfigStore';

const MealConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MealTime>('breakfast');
  
  // MealConfig 스토어 상태 및 함수
  const {
    meals,
    nutritionSummary,
    validationStatus,
    addFoodToMeal,
    removeFoodFromMeal,
    getMealTotalCalories,
    getMealTotalCost,
    updateNutritionSummary,
    isReadyForSummary
  } = useMealConfigStore();
  
  // RecommendStore 상태 및 함수
  const { 
    filteredFoods, 
    filterByMealType, 
    clearFilters,
    currentMealType
  } = useRecommendStore();
  
  // 선택 스토어 상태 및 함수 (별도로 만든 스토어)
  const {
    selectedFoods,
    getSelectedFoodsForMeal,
    addFoodToMeal: selectFood,
    removeFoodFromMeal: unselectFood
  } = useMealSelectionStore();
  
  const userInfo = useUserStore();
  
  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 끼니별 미리 선택된 음식 로드 (추천 페이지에서 선택한 음식)
    const breakfastFoods = getSelectedFoodsForMeal('breakfast');
    const lunchFoods = getSelectedFoodsForMeal('lunch');
    const dinnerFoods = getSelectedFoodsForMeal('dinner');
    
    // 각 끼니별로 선택된 음식을 MealConfig에 추가
    breakfastFoods.forEach(food => addFoodToMeal('breakfast', food));
    lunchFoods.forEach(food => addFoodToMeal('lunch', food));
    dinnerFoods.forEach(food => addFoodToMeal('dinner', food));
    
    // 영양 정보 업데이트
    updateNutritionSummary();
    
    // 첫 번째 탭에 대한 추천 음식 로드
    clearFilters();
    filterByMealType(activeTab);
  }, []);
  
  // 탭 변경 처리
  const handleTabChange = (mealType: MealTime) => {
    setActiveTab(mealType);
    clearFilters();
    filterByMealType(mealType);
  };
  
  // 음식 추가 처리
  const handleAddFood = (mealType: MealTime, food: FoodItem) => {
    // MealConfig 스토어에 음식 추가
    addFoodToMeal(mealType, food);
    
    // 선택 스토어에도 동기화 (필요 시)
    selectFood(mealType, food);
    
    // 영양 정보 업데이트
    updateNutritionSummary();
  };
  
  // 음식 제거 처리
  const handleRemoveFood = (mealType: MealTime, foodId: string) => {
    // MealConfig 스토어에서 음식 제거
    removeFoodFromMeal(mealType, foodId);
    
    // 선택 스토어에서도 동기화 (필요 시)
    unselectFood(mealType, foodId);
    
    // 영양 정보 업데이트
    updateNutritionSummary();
  };
  
  // 이전 페이지로 이동
  const goBack = () => {
    navigate('/recommend');
  };
  
  // 요약 페이지로 이동
  const goToSummary = () => {
    if (isReadyForSummary()) {
      navigate('/summary');
    }
  };
  
  // 현재 사용자의 끼니 수에 따라 표시할 끼니 타입 결정
  const mealCount = userInfo?.mealCount || 3;
  const mealTypes = mealCount === 2 
    ? [
        { id: 'lunch' as MealTime, label: '점심', iconType: 'secondary' as const },
        { id: 'dinner' as MealTime, label: '저녁', iconType: 'accent' as const }
      ]
    : [
        { id: 'breakfast' as MealTime, label: '아침', iconType: 'primary' as const },
        { id: 'lunch' as MealTime, label: '점심', iconType: 'secondary' as const },
        { id: 'dinner' as MealTime, label: '저녁', iconType: 'accent' as const }
      ];
  
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
        
        {/* 유효성 검사 알림 */}
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
              <strong>미완성 식단:</strong> {mealCount === 2 ? '점심과 저녁' : '아침, 점심, 저녁'} 각각에 최소 한 가지 이상의 음식을 추가해 주세요.
            </AlertCustom>
          )}
          
          {isReadyForSummary() && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>식단 준비 완료</AlertTitle>
              <AlertDescription>
                식단 구성이 완료되었으며 모든 요구사항을 충족합니다. 요약 페이지로 진행할 수 있습니다.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 열 - 선택된 식단 */}
          <div className="col-span-1 lg:col-span-2">
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
          </div>
          
          {/* 오른쪽 열 - 영양 요약 */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>영양 요약</CardTitle>
                <CardDescription>
                  영양 목표와 예산 현황을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">일일 예산</h3>
                    <div className={`flex items-center ${nutritionSummary.budget.actual > nutritionSummary.budget.target ? 'text-red-500' : 'text-green-500'}`}>
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>
                        {formatCurrency(nutritionSummary.budget.actual)} / {formatCurrency(nutritionSummary.budget.target)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 현재 끼니에 추가할 음식 추천 */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>{activeTab === 'breakfast' ? '아침' : activeTab === 'lunch' ? '점심' : '저녁'}에 음식 추가하기</CardTitle>
                <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as MealTime)}>
                  <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${mealTypes.length}, 1fr)` }}>
                    {mealTypes.map((mealType) => (
                      <TabsTrigger key={mealType.id} value={mealType.id}>
                        {mealType.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {filteredFoods && filteredFoods.length > 0 ? (
                    filteredFoods.map((food: FoodItem) => (
                      <div
                        key={food.id}
                        className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => handleAddFood(activeTab, food)}
                      >
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <div className="text-sm text-gray-500 flex gap-3">
                            <span>{food.kcal} kcal</span>
                            <span>{formatCurrency(food.price)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">추가</Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      사용 가능한 추천 음식이 없습니다. 추천 페이지로 돌아가서 제안을 받아보세요.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/recommend')}>
                  추천 페이지로 돌아가기
                </Button>
                <Button 
                  onClick={() => navigate('/summary')}
                  disabled={!isReadyForSummary()}
                >
                  요약 보기
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealConfigPage;