import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle, Coffee, UtensilsCrossed, Utensils } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useRecommendStore } from '@/stores/useRecommendStore';
import { FoodItem } from '@/api/mockRecommend';
import { getRecommendedFoods } from '@/api/mealApi';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import FoodCardList from '@/components/FoodCardList';
import FoodDetailModal from '@/components/FoodDetailModal';
import MealTypeTabs from '@/components/MealTypeTabs';
import { MealTime } from '@/stores/useMealConfigStore';
import { useToast } from '@/hooks/use-toast';

const RecommendPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore();
  
  // 스토어에서 필요한 상태와 함수 가져오기
  const { 
    filteredFoods,
    currentMealType,
    summary, 
    fallback,
    setRecommendedFoods, 
    setSummary,
    setFallback,
    setCurrentMealType
  } = useRecommendStore();
  
  // 로컬 상태
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // 추천 음식 가져오기
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 사용자 프로필 완성 여부 확인
        if (!userInfo || !userInfo.gender || !userInfo.age || !userInfo.weight) {
          toast({
            title: "프로필 미완성",
            description: "먼저 프로필 정보를 완성해주세요.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        // API 호출을 위한 사용자 정보 준비
        const { 
          gender, age, height, weight, bodyFatPercent, 
          goal, activityLevel, mealCount, allergies, budget 
        } = userInfo;
        
        const apiUserInfo = {
          gender, age, height, weight, bodyFatPercent, 
          goal, activityLevel, mealCount, allergies, budget
        };
        
        // 추천 API 호출
        const response = await getRecommendedFoods(apiUserInfo);
        
        // 응답 유효성 검사
        if (!response) {
          throw new Error("서버 응답이 없습니다.");
        }
        
        // 끼니별 음식 준비
        const validMeals = Array.isArray(response.meals) ? response.meals : [[], [], []];
        
        // 스토어 상태 업데이트
        setRecommendedFoods(validMeals);
        setSummary(response.summary || {
          calories: { target: 2000, actual: 0 },
          protein: { target: 150, actual: 0 },
          fat: { target: 70, actual: 0 },
          carbs: { target: 250, actual: 0 },
          budget: { target: 15000, actual: 0 },
          allergy: false
        });
        setFallback(response.fallback || false);
        
        // 대체 응답 안내
        if (response.fallback) {
          toast({
            title: "제한된 추천",
            description: "선호도에 따라 대체 옵션을 제공했습니다.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("추천 가져오기 실패:", error instanceof Error ? error.message : error);
        console.error("오류 상세:", error);
        
        // 오류 메시지 준비
        let errorMessage = "식품 추천을 불러오는 데 실패했습니다.";
        
        if (error instanceof Error) {
          errorMessage += ` 오류: ${error.message}`;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage += ` 상세 정보를 로그에서 확인하세요.`;
        }
        
        setError(errorMessage);
        
        // 오류 시 빈 데이터 설정
        setRecommendedFoods([[], [], []]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [userInfo, navigate, toast, setRecommendedFoods, setSummary, setFallback]);
  
  // 끼니 타입 변경 처리
  const handleMealTypeChange = (mealType: MealTime) => {
    setCurrentMealType(mealType);
  };
  
  // 음식 선택 처리
  const handleSelectFood = (food: FoodItem) => {
    const isAlreadySelected = selectedFoods.some(f => f.id === food.id);
    
    if (isAlreadySelected) {
      // 이미 선택된 경우 제거
      setSelectedFoods(prev => prev.filter(item => item.id !== food.id));
    } else {
      // 새로 선택
      setSelectedFoods(prev => [...prev, food]);
    }
    
    // 모달 열려있으면 닫기
    if (isDetailModalOpen) {
      setIsDetailModalOpen(false);
    }
  };
  
  // 음식 상세 보기 처리
  const handleViewDetails = (food: FoodItem) => {
    setSelectedFood(food);
    setIsDetailModalOpen(true);
  };
  
  // 계속하기 버튼 처리
  const handleContinue = () => {
    // 선택된 음식 확인
    if (!Array.isArray(selectedFoods) || selectedFoods.length === 0) {
      toast({
        title: "선택된 음식 없음",
        description: "계속하기 전에 적어도 하나 이상의 음식을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/meal-config");
  };
  
  // 로딩 상태 렌더링
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">추천 생성 중</h2>
        <p className="text-neutral-600 mb-8">
          프로필에 기반한 최적의 식단을 찾고 있습니다...
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
  
  // 오류 상태 렌더링
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">오류가 발생했습니다</h2>
        <p className="text-neutral-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          다시 시도하기
        </Button>
      </div>
    );
  }
  
  // 끼니별 탭 구성
  const mealTabs = [
    { id: 'breakfast' as MealTime, label: '아침', icon: <Coffee className="h-4 w-4 mr-2" /> },
    { id: 'lunch' as MealTime, label: '점심', icon: <UtensilsCrossed className="h-4 w-4 mr-2" /> },
    { id: 'dinner' as MealTime, label: '저녁', icon: <Utensils className="h-4 w-4 mr-2" /> }
  ];
  
  return (
    <div className="container max-w-7xl">
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
      
      {/* 대체 추천 경고 */}
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
        
        {/* 식품 둘러보기 탭 */}
        <TabsContent value="browse">
          {/* 끼니별 탭 */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex">
                {mealTabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`flex-1 py-3 px-4 flex items-center justify-center text-sm font-medium transition-colors ${
                      currentMealType === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleMealTypeChange(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 선택된 음식 요약 */}
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
          
          {/* 음식 카드 목록 */}
          <div className="mb-6">
            {filteredFoods && filteredFoods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FoodCardList 
                  foods={filteredFoods}
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
                    budget: 15000
                  }}
                  selectedFoods={selectedFoods}
                  onSelectFood={handleSelectFood}
                  onViewDetails={handleViewDetails}
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  현재 선택한 끼니에 대한 추천 음식이 없습니다
                </h3>
                <p className="text-gray-400">
                  다른 끼니를 선택하거나 프로필 정보를 업데이트하세요
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* 영양 분석 탭 */}
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
                      unit="g"
                      color="bg-blue-500"
                    />
                    
                    <NutritionProgressBar
                      label="탄수화물"
                      current={summary.carbs.actual}
                      target={summary.carbs.target}
                      unit="g"
                      color="bg-amber-500"
                    />
                    
                    <NutritionProgressBar
                      label="지방"
                      current={summary.fat.actual}
                      target={summary.fat.target}
                      unit="g"
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
                    target={summary.budget.target}
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
      
      {/* 하단 네비게이션 */}
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
      
      {/* 음식 상세 모달 */}
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