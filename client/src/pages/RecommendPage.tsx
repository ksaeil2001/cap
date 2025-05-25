import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useRecommendStore } from '@/stores/useRecommendStore';
import { FoodItem } from '@/api/mockRecommend';
import { getRecommendedFoods } from '@/api/mealApi';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import FoodCardList from '@/components/FoodCardList';
import FoodDetailModal from '@/components/FoodDetailModal';
import MealTypeTabs from '@/components/MealTypeTabs';
import { useToast } from '@/hooks/use-toast';

const RecommendPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore();
  
  // 스토어에서 사용 가능한 함수만 가져오기
  const { 
    recommendedFoods,
    filteredFoods,
    summary, 
    fallback,
    setRecommendedFoods, 
    setSummary,
    setFallback,
    filterByMealType
  } = useRecommendStore();
  
  // 필요한 state 변수 추가 (기존 스토어에 없는 기능)
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [currentMealType, setCurrentMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [meals, setMeals] = useState<FoodItem[][]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verify user has completed profile
        if (!userInfo || !userInfo.gender || !userInfo.age || !userInfo.weight) {
          toast({
            title: "프로필 미완성",
            description: "먼저 프로필 정보를 완성해주세요.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        // Get food recommendations
        // Strip out isAgreementChecked to make it compatible with API
        const { 
          gender, age, height, weight, bodyFatPercent, 
          goal, activityLevel, mealCount, allergies, budget 
        } = userInfo;
        
        const apiUserInfo = {
          gender, age, height, weight, bodyFatPercent, 
          goal, activityLevel, mealCount, allergies, budget
        };
        
        const response = await getRecommendedFoods(apiUserInfo);
        
        // 방어적 프로그래밍: 응답이 유효한지 확인
        if (!response) {
          throw new Error("서버 응답이 없습니다.");
        }
        
        // meals 확인 및 기본값 설정
        const validMeals = Array.isArray(response.meals) ? response.meals : [[], [], []];
        
        // 스토어 상태 업데이트
        setRecommendedFoods(validMeals);
        setSummary(response.summary || {
          calories: { target: 2000, actual: 0 },
          protein: { target: 150, actual: 0 },
          fat: { target: 70, actual: 0 },
          carbs: { target: 250, actual: 0 },
          budget: { target: 100, actual: 0 },
          allergy: false
        });
        setFallback(response.fallback || false);
        
        // 로컬 상태 업데이트
        setMeals(validMeals);
        
        // Show fallback warning if needed
        if (response.fallback) {
          toast({
            title: "제한된 추천",
            description: "선호도에 따라 대체 옵션을 제공했습니다.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error instanceof Error ? error.message : error);
        console.error("Error details:", error);
        
        // 더 구체적인 오류 메시지 제공
        let errorMessage = "식품 추천을 불러오는 데 실패했습니다.";
        
        if (error instanceof Error) {
          errorMessage += ` 오류: ${error.message}`;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage += ` 상세 정보를 로그에서 확인하세요.`;
        }
        
        setError(errorMessage);
        
        // 오류 발생 시 기본 빈 데이터 설정
        setMeals([[], [], []]);
        setRecommendedFoods([[], [], []]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [userInfo, navigate, toast, setRecommendedFoods, setSummary, setFallback]);
  
  // Handle meal type tab change
  const handleMealTypeChange = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setCurrentMealType(mealType);
    // 필터링 함수 호출 (Zustand store의 기능 사용)
    filterByMealType(mealType);
  };
  
  // Handle food selection
  const handleSelectFood = (food: FoodItem) => {
    const isAlreadySelected = selectedFoods.some(f => f.id === food.id);
    
    if (isAlreadySelected) {
      // 로컬 상태에서 음식 제거
      setSelectedFoods(prev => prev.filter(item => item.id !== food.id));
    } else {
      // 로컬 상태에 음식 추가 
      setSelectedFoods(prev => [...prev, food]);
    }
    
    // Close the modal if open
    if (isDetailModalOpen) {
      setIsDetailModalOpen(false);
    }
  };
  
  // Handle viewing food details
  const handleViewDetails = (food: FoodItem) => {
    setSelectedFood(food);
    setIsDetailModalOpen(true);
  };
  
  // Handle continuing to meal configuration
  const handleContinue = () => {
    // Defensive check to ensure selectedFoods is an array and has items
    if (!Array.isArray(selectedFoods) || selectedFoods.length === 0) {
      toast({
        title: "No foods selected",
        description: "Please select at least one food item before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/meal-config");
  };
  
  // Get current meal foods with improved error handling
  const getCurrentMealFoods = (): FoodItem[] => {
    // 방어적 프로그래밍: meals가 배열인지 확인
    if (!Array.isArray(meals) || meals.length === 0) {
      // 필터링된 음식이 있다면 사용, 없으면 빈 배열 반환
      return Array.isArray(filteredFoods) ? filteredFoods : [];
    }
    
    const mealIndex = currentMealType === 'breakfast' ? 0 : 
                     currentMealType === 'lunch' ? 1 : 2;
    
    // meals[mealIndex]가 배열인지 확인
    if (!Array.isArray(meals[mealIndex])) {
      // 대체 로직: 필터링된 음식이 있다면 사용, 없으면 빈 배열 반환
      return Array.isArray(filteredFoods) ? filteredFoods : [];
    }
    
    return meals[mealIndex];
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Generating Recommendations</h2>
        <p className="text-neutral-600 mb-8">
          We're finding the perfect meals based on your profile...
        </p>
        
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-[125px] w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-[125px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
        <p className="text-neutral-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">추천 식품</h2>
        {userInfo ? (
          <p className="text-neutral-600 max-w-2xl mx-auto">
            이 식품들은 {userInfo?.goal === 'weight-loss' ? '체중 감량' : '근육 증가'} 목표, 식이 선호도, 일일 예산 ₩{userInfo?.budget?.toLocaleString() || '0'}원에 맞춰 개인화되었습니다.
            식단에 포함하고 싶은 항목을 선택하세요.
          </p>
        ) : (
          <p className="text-neutral-600 max-w-2xl mx-auto">
            이 식품들은 식이 선호도와 예산에 맞춰 개인화되었습니다.
            식단에 포함하고 싶은 항목을 선택하세요.
          </p>
        )}
      </div>
      
      {/* Fallback Warning */}
      {fallback && (
        <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>대체 추천 식품</AlertTitle>
          <AlertDescription>
            식이 제한으로 인해 일부 대체 옵션을 포함했습니다.
            성분을 주의 깊게 확인해주세요.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="browse" className="mb-6">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="browse" className="flex-1">식품 둘러보기</TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1">영양 분석</TabsTrigger>
        </TabsList>
        
        {/* Browse Foods Tab */}
        <TabsContent value="browse">
          {/* Meal Type Tabs */}
          <MealTypeTabs 
            activeMealType={currentMealType}
            onTabChange={handleMealTypeChange}
          />
          
          {/* Selected Foods Summary */}
          {Array.isArray(selectedFoods) && selectedFoods.length > 0 && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="text-lg font-medium mb-2 text-primary-700">선택한 식품 ({selectedFoods.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFoods.map(food => (
                  <Card key={food.id} className="bg-white flex-grow-0">
                    <CardContent className="p-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{food.name}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setSelectedFoods(prev => prev.filter(item => item.id !== food.id))}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Food Card List */}
          <div className="mb-6">
            <FoodCardList 
              foods={getCurrentMealFoods()}
              userInfo={userInfo || {
                gender: 'male',
                age: 30,
                height: 175,
                weight: 70,
                goal: 'weight-loss',
                activityLevel: 'medium',
                mealCount: 3,
                allergies: [],
                isAgreementChecked: true,
                budget: 100
              }}
              selectedFoods={selectedFoods}
              onSelectFood={handleSelectFood}
              onViewDetails={handleViewDetails}
            />
          </div>
        </TabsContent>
        
        {/* Nutrition Analysis Tab */}
        <TabsContent value="nutrition">
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">영양 정보</h3>
                  <div className="space-y-6">
                    <NutritionProgressBar
                      label="일일 칼로리"
                      current={summary.calories.actual}
                      target={summary.calories.target}
                      unit="kcal"
                    />
                    
                    <NutritionProgressBar
                      label="단백질"
                      current={summary.protein.actual}
                      target={summary.protein.target}
                      color="bg-blue-500"
                    />
                    
                    <NutritionProgressBar
                      label="탄수화물"
                      current={summary.carbs.actual}
                      target={summary.carbs.target}
                      color="bg-amber-500"
                    />
                    
                    <NutritionProgressBar
                      label="지방"
                      current={summary.fat.actual}
                      target={summary.fat.target}
                      color="bg-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">예산 분석</h3>
                  <NutritionProgressBar
                    label="일일 예산"
                    current={summary.budget.actual}
                    target={summary.budget.target} // 일일 예산으로 변경
                    unit="₩"
                    color="bg-green-500"
                  />
                  
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">설정 예산:</span>
                      <span className="font-medium">₩{summary.budget.target.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">현재 사용:</span>
                      <span className="font-medium">₩{summary.budget.actual.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">주간 비용 (예상):</span>
                      <span className="font-medium">₩{(summary.budget.actual * 7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">남은 예산:</span>
                      <span className="font-medium text-green-600">
                        ₩{(summary.budget.target - summary.budget.actual).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Bottom Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
        >
          프로필로 돌아가기
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!Array.isArray(selectedFoods) || selectedFoods.length === 0}
        >
          식단 구성으로 계속하기
        </Button>
      </div>
      
      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFood}
        isOpen={isDetailModalOpen}
        isSelected={selectedFood && Array.isArray(selectedFoods) ? selectedFoods.some((f) => f.id === selectedFood.id) : false}
        onClose={() => setIsDetailModalOpen(false)}
        onSelect={handleSelectFood}
      />
    </div>
  );
};

export default RecommendPage;