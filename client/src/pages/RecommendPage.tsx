import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle, Coffee, UtensilsCrossed, Utensils } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useRecommendStore } from '@/stores/useRecommendStore';
import { useMealSelectionStore } from '@/stores/useMealSelectionStore';
import { FoodItem } from '@/api/mockRecommend';
import { getRecommendedFoods } from '@/api/mealApi';

import FoodCardList from '@/components/FoodCardList';
import FoodDetailModal from '@/components/FoodDetailModal';
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
    selectedPerMeal,
    summary, 
    fallback,
    setRecommendedFoods, 
    setSummary,
    setFallback,
    setCurrentMealType,
    addFoodToMeal,
    removeFoodFromMeal
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
        try {
          // 사용자 mealCount 전달하여 올바른 끼니 배열 설정
          const userMealCount = userInfo?.mealCount || 3;
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
        } catch (e) {
          console.error("스토어 상태 업데이트 실패:", e);
        }
        
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
  
  // 음식 선택 처리 - 현재 선택된 끼니에만 추가
  const handleSelectFood = (food: FoodItem) => {
    // 현재 선택된 끼니의 음식 목록에서 이미 선택된 음식인지 확인
    const currentMealFoods = selectedPerMeal[currentMealType] || [];
    const isAlreadySelected = currentMealFoods.some(item => item.id === food.id);
    
    if (isAlreadySelected) {
      // 이미 선택된 음식이면 제거
      removeFoodFromMeal(currentMealType, food.id);
    } else {
      // 선택되지 않은 음식이면 현재 끼니에 추가
      addFoodToMeal(currentMealType, food);
    }
    
    // 로컬 상태 동기화 (모든 끼니의 선택된 음식 합치기)
    const allSelected = [
      ...selectedPerMeal.breakfast,
      ...selectedPerMeal.lunch, 
      ...selectedPerMeal.dinner
    ];
    setSelectedFoods(allSelected);
    
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
    // 끼니별 선택된 음식 확인
    const totalSelected = selectedPerMeal.breakfast.length + selectedPerMeal.lunch.length + selectedPerMeal.dinner.length;
    
    if (totalSelected === 0) {
      toast({
        title: "선택된 음식 없음",
        description: "계속하기 전에 적어도 하나 이상의 음식을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // MealConfigPage로 이동 (selectedPerMeal 데이터가 전역 상태에 저장되어 있음)
    navigate("/meal-config");
  };
  
  // 사용자 끼니 수에 따라 동적으로 탭 구성
  const mealTypeMapping = [
    { id: 'breakfast' as MealTime, label: '아침', icon: <Coffee className="h-4 w-4 mr-2" />, index: 0 },
    { id: 'lunch' as MealTime, label: '점심', icon: <UtensilsCrossed className="h-4 w-4 mr-2" />, index: 1 },
    { id: 'dinner' as MealTime, label: '저녁', icon: <Utensils className="h-4 w-4 mr-2" />, index: 2 }
  ];
  
  // 끼니 수에 따라 표시할 탭 결정 (2끼 또는 3끼)
  const mealTabs = userInfo?.mealCount === 2
    ? mealTypeMapping.slice(1, 3) // mealCount가 2면 점심, 저녁만 표시
    : mealTypeMapping; // 그 외에는 모든 탭 표시
    
  // 컴포넌트 마운트 시 초기 끼니 설정 - mealCount에 따라 적절한 시작 탭 선택
  useEffect(() => {
    if (userInfo?.mealCount === 2 && currentMealType === 'breakfast') {
      // 2끼 설정인데 아침이 선택된 경우 점심으로 변경
      setCurrentMealType('lunch');
    }
  }, [userInfo?.mealCount, currentMealType, setCurrentMealType]);
  
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
  
  return (
    <div className="container max-w-7xl">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">추천 식품</h2>
        {userInfo ? (
          <p className="text-neutral-600 max-w-2xl mx-auto">
            이 식품들은 {userInfo?.goal === 'weight-loss' ? '체중 감량' : '근육 증가'} 목표, 식이 선호도, 일일 예산 ₩{typeof userInfo?.budget === 'number' ? userInfo.budget.toLocaleString() : '정보 없음'}원에 맞춰 개인화되었습니다.
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
      
      {/* 식품 둘러보기 - 탭 제거하고 직접 표시 */}
      <div className="mb-6">
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
        
        {/* 현재 끼니의 선택된 음식 요약 */}
        {selectedPerMeal[currentMealType] && selectedPerMeal[currentMealType].length > 0 && (
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="text-lg font-medium mb-2 text-primary-700">
              {currentMealType === 'breakfast' ? '아침' : currentMealType === 'lunch' ? '점심' : '저녁'}에 선택한 식품 ({selectedPerMeal[currentMealType].length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedPerMeal[currentMealType].map(food => (
                <Card key={food.id} className="bg-white flex-grow-0">
                  <CardContent className="p-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{food.name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeFoodFromMeal(currentMealType, food.id)}
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
              selectedFoods={selectedPerMeal[currentMealType] || []}
              onSelectFood={handleSelectFood}
              onViewDetails={handleViewDetails}
            />
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
      </div>
      
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
          disabled={(selectedPerMeal.breakfast.length + selectedPerMeal.lunch.length + selectedPerMeal.dinner.length) === 0}
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