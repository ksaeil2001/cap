import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/useUserStore';
import { useRecommendStore } from '@/stores/useRecommendStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { FoodItem } from '@/api/mockRecommend';
import { ArrowLeft, Home, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AlertCustom from '@/components/ui/alert-custom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SummaryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get stores
  const userStore = useUserStore();
  const recommendStore = useRecommendStore();
  
  // 1️⃣ 전역 상태에서 식단 정보 불러오기
  const { selectedPerMeal } = recommendStore;
  
  // 선택된 식단이 있는지 확인
  const hasSelectedMeals = useMemo(() => {
    return selectedPerMeal.breakfast.length > 0 || 
           selectedPerMeal.lunch.length > 0 || 
           selectedPerMeal.dinner.length > 0;
  }, [selectedPerMeal]);
  
  // 2️⃣ 영양 요약 계산
  const nutritionSummary = useMemo(() => {
    if (!hasSelectedMeals) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalPrice: 0
      };
    }
    
    // 모든 식단을 flatten하여 하나의 배열로 통합
    const allFoods = [
      ...selectedPerMeal.breakfast,
      ...selectedPerMeal.lunch,
      ...selectedPerMeal.dinner
    ];
    
    // 각 영양소 누적 계산
    const summary = allFoods.reduce((acc, food) => {
      acc.totalCalories += food.calories || food.kcal || 0;
      acc.totalProtein += food.protein || 0;
      acc.totalCarbs += food.carbs || 0;
      acc.totalFat += food.fat || 0;
      acc.totalPrice += food.price || 0;
      return acc;
    }, {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalPrice: 0
    });
    
    return summary;
  }, [selectedPerMeal, hasSelectedMeals]);
  
  // 4️⃣ 예산 정보 계산
  const budgetInfo = useMemo(() => {
    const userBudget = userStore.budgetPerMeal * userStore.mealCount || 30000; // 일일 예산
    const usedBudget = nutritionSummary.totalPrice;
    const budgetPercentage = userBudget > 0 ? (usedBudget / userBudget) * 100 : 0;
    
    return {
      totalBudget: userBudget,
      usedBudget,
      budgetPercentage: Math.round(budgetPercentage * 100) / 100,
      isOverBudget: budgetPercentage > 100
    };
  }, [userStore.budgetPerMeal, userStore.mealCount, nutritionSummary.totalPrice]);

  // 알레르기 체크
  const hasAllergies = useMemo(() => {
    if (!userStore.allergies || userStore.allergies.length === 0) return false;
    
    const allFoods = [
      ...selectedPerMeal.breakfast,
      ...selectedPerMeal.lunch,
      ...selectedPerMeal.dinner
    ];
    
    return allFoods.some(food => 
      food.allergies && food.allergies.some(allergy => 
        userStore.allergies.includes(allergy)
      )
    );
  }, [selectedPerMeal, userStore.allergies]);
  
  // 3️⃣ 영양 목표 설정 (사용자의 목표에 따라 계산)
  const nutritionTargets = useMemo(() => {
    // 기본 목표 칼로리 (활동 수준과 목표에 따라)
    const baseCalories = userStore.goal === 'weight-loss' ? 1800 : 2200;
    const activityMultiplier = userStore.activityLevel === 'low' ? 0.9 : 
                              userStore.activityLevel === 'high' ? 1.2 : 1.0;
    const targetCalories = Math.round(baseCalories * activityMultiplier);
    
    // 목표 매크로 영양소 (칼로리 기준으로 계산)
    const targetProtein = Math.round(targetCalories * 0.15 / 4); // 15% of calories, 4kcal per gram
    const targetCarbs = Math.round(targetCalories * 0.55 / 4); // 55% of calories, 4kcal per gram  
    const targetFat = Math.round(targetCalories * 0.30 / 9); // 30% of calories, 9kcal per gram
    
    return {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat
    };
  }, [userStore.goal, userStore.activityLevel]);

  // 3️⃣ 영양 요약 UI용 데이터 준비 (목표 대비 달성률 포함)
  const nutritionData = [
    { name: '단백질', value: nutritionSummary.totalProtein, unit: 'g' },
    { name: '탄수화물', value: nutritionSummary.totalCarbs, unit: 'g' },
    { name: '지방', value: nutritionSummary.totalFat, unit: 'g' },
  ];

  // 영양소별 달성률 계산
  const nutritionProgress = useMemo(() => {
    const calculateProgress = (current: number, target: number) => {
      const percentage = target > 0 ? (current / target) * 100 : 0;
      return {
        current,
        target,
        percentage: Math.round(percentage * 10) / 10,
        status: percentage < 80 ? 'insufficient' : percentage > 120 ? 'excess' : 'good'
      };
    };

    return {
      calories: calculateProgress(nutritionSummary.totalCalories, nutritionTargets.calories),
      protein: calculateProgress(nutritionSummary.totalProtein, nutritionTargets.protein),
      carbs: calculateProgress(nutritionSummary.totalCarbs, nutritionTargets.carbs),
      fat: calculateProgress(nutritionSummary.totalFat, nutritionTargets.fat)
    };
  }, [nutritionSummary, nutritionTargets]);

  // Handle restart
  const handleRestart = () => {
    recommendStore.clearSelectedMeals();
    navigate('/');
  };

  // Handle share plan
  const handleSharePlan = () => {
    try {
      const planData = {
        selectedMeals: selectedPerMeal,
        nutritionSummary: nutritionSummary,
        budgetInfo: budgetInfo,
        userInfo: {
          goal: userStore.goal,
          budget: budgetInfo.totalBudget,
          allergies: userStore.allergies
        }
      };
      
      navigator.clipboard.writeText(JSON.stringify(planData, null, 2));
      
      toast({
        title: "식단이 복사되었습니다",
        description: "식단 정보가 클립보드에 복사되어 다른 곳에 붙여넣을 수 있습니다.",
      });
    } catch (error) {
      toast({
        title: "공유 실패",
        description: "식단 공유 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 선택된 식단이 없을 경우 메시지 표시
  if (!hasSelectedMeals) {
    return (
      <div className="container py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">식단 계획 요약</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/meal-config')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              구성으로 돌아가기
            </Button>
            <Button variant="outline" size="sm" onClick={handleRestart}>
              <Home className="mr-2 h-4 w-4" />
              처음부터 시작
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">선택된 식단이 없습니다</h2>
              <p className="text-muted-foreground mb-4">
                먼저 식단을 구성해주세요.
              </p>
              <Button onClick={() => navigate('/recommend')}>
                식단 추천 받기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">식단 계획 요약</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/meal-config')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            구성으로 돌아가기
          </Button>
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <Home className="mr-2 h-4 w-4" />
            처음부터 시작
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 영양 요약 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>영양 요약</CardTitle>
            <CardDescription>
              총 {nutritionSummary.totalCalories} kcal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}g`}
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span>단백질:</span>
                <span>{nutritionSummary.totalProtein}g</span>
              </div>
              <div className="flex justify-between">
                <span>탄수화물:</span>
                <span>{nutritionSummary.totalCarbs}g</span>
              </div>
              <div className="flex justify-between">
                <span>지방:</span>
                <span>{nutritionSummary.totalFat}g</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 예산 및 건강 목표 통합 카드 */}
        <div className="w-full max-w-6xl mx-auto min-w-[400px]">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-6 px-10">
              <CardTitle className="text-xl">예산 및 건강 목표</CardTitle>
              <CardDescription className="text-base">일일 예산 현황과 설정된 건강 목표</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <div className="space-y-10">
                {/* 예산 정보 섹션 */}
                <div className="space-y-6">
                  <div className="text-xl font-semibold text-gray-800">
                    일일 예산: {formatCurrency(budgetInfo.totalBudget)}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base text-gray-600">사용 금액: {formatCurrency(budgetInfo.usedBudget)} ({budgetInfo.budgetPercentage.toFixed(1)}%)</span>
                  </div>
                  <Progress 
                    value={Math.min(budgetInfo.budgetPercentage, 100)} 
                    className={`h-4 ${budgetInfo.isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {budgetInfo.isOverBudget && (
                    <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                      예산을 {formatCurrency(budgetInfo.usedBudget - budgetInfo.totalBudget)} 초과했습니다.
                    </div>
                  )}
                  {hasAllergies && (
                    <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                      현재 식단에 알레르기 유발 성분이 포함되어 있습니다.
                    </div>
                  )}
                </div>

                {/* 구분선 */}
                <div className="border-t border-gray-300 my-8"></div>

                {/* 사용자 목표 섹션 */}
                <div className="space-y-6">
                  <div className="text-xl font-semibold text-gray-800 mb-8">
                    {userStore.goal === 'weight-loss' ? '체중 감량' : '근육 증가'} 계획 ({userStore.gender === 'male' ? 'M' : 'F'})
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center py-2 border-b border-gray-100">
                        <span className="text-base text-gray-600 pr-2">키/몸무게:</span>
                        <span className="font-medium text-gray-800">
                          {userStore.height}cm / {userStore.weight}kg
                        </span>
                      </div>
                      <div className="flex items-center py-2 border-b border-gray-100">
                        <span className="text-base text-gray-600 pr-2">활동 수준:</span>
                        <div className="inline-flex items-center px-3 py-1 ml-2 rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                          {userStore.activityLevel === 'low' ? '낮은 활동량' : 
                           userStore.activityLevel === 'medium' ? '보통 활동량' : '높은 활동량'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center py-2 border-b border-gray-100">
                        <span className="text-base text-gray-600 pr-2">식사 횟수:</span>
                        <span className="font-medium text-gray-800">
                          {userStore.mealCount}회
                        </span>
                      </div>
                      <div className="flex items-center py-2 border-b border-gray-100">
                        <span className="text-base text-gray-600 pr-2">알레르기:</span>
                        <span className="font-medium text-gray-800">
                          {!userStore.allergies || userStore.allergies.length === 0 ? '없음' : userStore.allergies.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 5️⃣ 식사별 구성 */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">식사별 구성</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 아침식사 */}
          {(() => {
            const mealFoods = selectedPerMeal.breakfast;
            const totalCalories = mealFoods.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0);
            const totalPrice = mealFoods.reduce((sum, food) => sum + (food.price || 0), 0);
            const totalProtein = mealFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
            const totalCarbs = mealFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
            const totalFat = mealFoods.reduce((sum, food) => sum + (food.fat || 0), 0);
            
            // 중복 음식 체크
            const allOtherFoods = [...selectedPerMeal.lunch, ...selectedPerMeal.dinner];
            const duplicateFoods = mealFoods.filter(food => 
              allOtherFoods.some(otherFood => otherFood.id === food.id)
            );
            
            // AI 코멘트 생성
            const getAIComment = () => {
              if (mealFoods.length === 0) return "식단을 구성해주세요.";
              if (totalProtein < 15) return "단백질이 다소 부족한 식단입니다. 달걀 또는 두부 추가를 고려해보세요.";
              if (totalCarbs < 20) return "에너지원이 부족합니다. 토스트나 시리얼을 추가해보세요.";
              if (totalCalories < 200) return "아침 식사량이 부족합니다. 조금 더 충실하게 드세요.";
              return "균형 잡힌 아침 식단입니다.";
            };
            
            // 영양소 비율 계산
            const totalMacros = totalProtein + totalCarbs + totalFat;
            const proteinRatio = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0;
            const carbsRatio = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0;
            const fatRatio = totalMacros > 0 ? (totalFat / totalMacros) * 100 : 0;
            
            return (
              <Card className="overflow-hidden">
                <CardHeader className="bg-orange-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      🍳 아침식사
                    </CardTitle>
                  </div>
                  <CardDescription className="text-orange-600 font-medium">
                    총 {totalCalories} kcal / {formatCurrency(totalPrice)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* 음식 리스트 */}
                    <div className="space-y-3">
                      {mealFoods.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-4">식단이 아직 구성되지 않았습니다</p>
                      ) : (
                        mealFoods.map((food: FoodItem) => (
                          <div key={food.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {food.name}
                                  {duplicateFoods.some(df => df.id === food.id) && (
                                    <Badge variant="secondary" className="text-xs">중복</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {food.calories || food.kcal || 0} kcal | {formatCurrency(food.price || 0)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  단백질: {food.protein || 0}g | 탄수화물: {food.carbs || 0}g | 지방: {food.fat || 0}g
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {mealFoods.length > 0 && (
                      <>
                        {/* 총합 요약 */}
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">영양소 총합</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{totalProtein}g</div>
                              <div className="text-muted-foreground">단백질</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">{totalCarbs}g</div>
                              <div className="text-muted-foreground">탄수화물</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-yellow-600">{totalFat}g</div>
                              <div className="text-muted-foreground">지방</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 영양소 비율 시각화 */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium">영양소 비율</div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                            <div 
                              className="bg-blue-500" 
                              style={{ width: `${proteinRatio}%` }}
                            />
                            <div 
                              className="bg-orange-500" 
                              style={{ width: `${carbsRatio}%` }}
                            />
                            <div 
                              className="bg-yellow-500" 
                              style={{ width: `${fatRatio}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* AI 코멘트 */}
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800">{getAIComment()}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
          
          {/* 점심식사 */}
          {(() => {
            const mealFoods = selectedPerMeal.lunch;
            const totalCalories = mealFoods.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0);
            const totalPrice = mealFoods.reduce((sum, food) => sum + (food.price || 0), 0);
            const totalProtein = mealFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
            const totalCarbs = mealFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
            const totalFat = mealFoods.reduce((sum, food) => sum + (food.fat || 0), 0);
            
            // 중복 음식 체크
            const allOtherFoods = [...selectedPerMeal.breakfast, ...selectedPerMeal.dinner];
            const duplicateFoods = mealFoods.filter(food => 
              allOtherFoods.some(otherFood => otherFood.id === food.id)
            );
            
            // AI 코멘트 생성
            const getAIComment = () => {
              if (mealFoods.length === 0) return "식단을 구성해주세요.";
              if (totalProtein < 20) return "점심 단백질이 부족합니다. 고기나 생선 요리를 추가해보세요.";
              if (totalCarbs > 80) return "탄수화물이 과다합니다. 밥량을 조절하거나 샐러드를 추가해보세요.";
              if (totalCalories > 800) return "점심 칼로리가 높습니다. 적당한 양을 유지해보세요.";
              return "균형 잡힌 점심 식단입니다.";
            };
            
            // 영양소 비율 계산
            const totalMacros = totalProtein + totalCarbs + totalFat;
            const proteinRatio = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0;
            const carbsRatio = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0;
            const fatRatio = totalMacros > 0 ? (totalFat / totalMacros) * 100 : 0;
            
            return (
              <Card className="overflow-hidden">
                <CardHeader className="bg-green-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      🍽️ 점심식사
                    </CardTitle>
                  </div>
                  <CardDescription className="text-green-600 font-medium">
                    총 {totalCalories} kcal / {formatCurrency(totalPrice)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* 음식 리스트 */}
                    <div className="space-y-3">
                      {mealFoods.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-4">식단이 아직 구성되지 않았습니다</p>
                      ) : (
                        mealFoods.map((food: FoodItem) => (
                          <div key={food.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {food.name}
                                  {duplicateFoods.some(df => df.id === food.id) && (
                                    <Badge variant="secondary" className="text-xs">중복</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {food.calories || food.kcal || 0} kcal | {formatCurrency(food.price || 0)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  단백질: {food.protein || 0}g | 탄수화물: {food.carbs || 0}g | 지방: {food.fat || 0}g
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {mealFoods.length > 0 && (
                      <>
                        {/* 총합 요약 */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">영양소 총합</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{totalProtein}g</div>
                              <div className="text-muted-foreground">단백질</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">{totalCarbs}g</div>
                              <div className="text-muted-foreground">탄수화물</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-yellow-600">{totalFat}g</div>
                              <div className="text-muted-foreground">지방</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 영양소 비율 시각화 */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium">영양소 비율</div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                            <div 
                              className="bg-blue-500" 
                              style={{ width: `${proteinRatio}%` }}
                            />
                            <div 
                              className="bg-orange-500" 
                              style={{ width: `${carbsRatio}%` }}
                            />
                            <div 
                              className="bg-yellow-500" 
                              style={{ width: `${fatRatio}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* AI 코멘트 */}
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800">{getAIComment()}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
          
          {/* 저녁식사 */}
          {(() => {
            const mealFoods = selectedPerMeal.dinner;
            const totalCalories = mealFoods.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0);
            const totalPrice = mealFoods.reduce((sum, food) => sum + (food.price || 0), 0);
            const totalProtein = mealFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
            const totalCarbs = mealFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
            const totalFat = mealFoods.reduce((sum, food) => sum + (food.fat || 0), 0);
            
            // 중복 음식 체크
            const allOtherFoods = [...selectedPerMeal.breakfast, ...selectedPerMeal.lunch];
            const duplicateFoods = mealFoods.filter(food => 
              allOtherFoods.some(otherFood => otherFood.id === food.id)
            );
            
            // AI 코멘트 생성
            const getAIComment = () => {
              if (mealFoods.length === 0) return "식단을 구성해주세요.";
              if (totalCalories > 700) return "저녁 칼로리가 높습니다. 가벼운 식단으로 조절해보세요.";
              if (totalFat > 25) return "저녁 지방 섭취가 많습니다. 구이나 찜 요리를 선택해보세요.";
              if (totalProtein < 15) return "저녁 단백질이 부족합니다. 생선이나 두부를 추가해보세요.";
              return "균형 잡힌 저녁 식단입니다.";
            };
            
            // 영양소 비율 계산
            const totalMacros = totalProtein + totalCarbs + totalFat;
            const proteinRatio = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0;
            const carbsRatio = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0;
            const fatRatio = totalMacros > 0 ? (totalFat / totalMacros) * 100 : 0;
            
            return (
              <Card className="overflow-hidden">
                <CardHeader className="bg-purple-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      🌙 저녁식사
                    </CardTitle>
                  </div>
                  <CardDescription className="text-purple-600 font-medium">
                    총 {totalCalories} kcal / {formatCurrency(totalPrice)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* 음식 리스트 */}
                    <div className="space-y-3">
                      {mealFoods.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-4">식단이 아직 구성되지 않았습니다</p>
                      ) : (
                        mealFoods.map((food: FoodItem) => (
                          <div key={food.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {food.name}
                                  {duplicateFoods.some(df => df.id === food.id) && (
                                    <Badge variant="secondary" className="text-xs">중복</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {food.calories || food.kcal || 0} kcal | {formatCurrency(food.price || 0)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  단백질: {food.protein || 0}g | 탄수화물: {food.carbs || 0}g | 지방: {food.fat || 0}g
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {mealFoods.length > 0 && (
                      <>
                        {/* 총합 요약 */}
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">영양소 총합</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{totalProtein}g</div>
                              <div className="text-muted-foreground">단백질</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">{totalCarbs}g</div>
                              <div className="text-muted-foreground">탄수화물</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-yellow-600">{totalFat}g</div>
                              <div className="text-muted-foreground">지방</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 영양소 비율 시각화 */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium">영양소 비율</div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                            <div 
                              className="bg-blue-500" 
                              style={{ width: `${proteinRatio}%` }}
                            />
                            <div 
                              className="bg-orange-500" 
                              style={{ width: `${carbsRatio}%` }}
                            />
                            <div 
                              className="bg-yellow-500" 
                              style={{ width: `${fatRatio}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* AI 코멘트 */}
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800">{getAIComment()}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
      
      {/* Advanced Nutrition Analysis Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">상세 영양 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 총 칼로리 */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-purple-600">총 칼로리</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    nutritionProgress.calories.status === 'insufficient' ? 'bg-red-100 text-red-600' :
                    nutritionProgress.calories.status === 'excess' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {nutritionProgress.calories.status === 'insufficient' ? '부족' :
                     nutritionProgress.calories.status === 'excess' ? '과다' : '적정'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{nutritionProgress.calories.current} / {nutritionProgress.calories.target} kcal</span>
                    <span className="font-medium">{nutritionProgress.calories.percentage}%</span>
                  </div>
                  <Progress 
                    value={Math.min(nutritionProgress.calories.percentage, 100)} 
                    className="h-2"
                    style={{
                      background: nutritionProgress.calories.status === 'insufficient' ? '#fee2e2' : 
                                 nutritionProgress.calories.status === 'excess' ? '#fef3c7' : '#dcfce7'
                    }}
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{nutritionProgress.calories.current}</div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 단백질 */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-600">단백질</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    nutritionProgress.protein.status === 'insufficient' ? 'bg-red-100 text-red-600' :
                    nutritionProgress.protein.status === 'excess' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {nutritionProgress.protein.status === 'insufficient' ? '부족' :
                     nutritionProgress.protein.status === 'excess' ? '과다' : '적정'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{nutritionProgress.protein.current} / {nutritionProgress.protein.target}g</span>
                    <span className="font-medium">{nutritionProgress.protein.percentage}%</span>
                  </div>
                  <Progress 
                    value={Math.min(nutritionProgress.protein.percentage, 100)} 
                    className="h-2"
                    style={{
                      background: nutritionProgress.protein.status === 'insufficient' ? '#fee2e2' : 
                                 nutritionProgress.protein.status === 'excess' ? '#fef3c7' : '#dcfce7'
                    }}
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{nutritionProgress.protein.current}</div>
                  <div className="text-xs text-muted-foreground">g</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 탄수화물 */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-orange-600">탄수화물</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    nutritionProgress.carbs.status === 'insufficient' ? 'bg-red-100 text-red-600' :
                    nutritionProgress.carbs.status === 'excess' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {nutritionProgress.carbs.status === 'insufficient' ? '부족' :
                     nutritionProgress.carbs.status === 'excess' ? '과다' : '적정'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{nutritionProgress.carbs.current} / {nutritionProgress.carbs.target}g</span>
                    <span className="font-medium">{nutritionProgress.carbs.percentage}%</span>
                  </div>
                  <Progress 
                    value={Math.min(nutritionProgress.carbs.percentage, 100)} 
                    className="h-2"
                    style={{
                      background: nutritionProgress.carbs.status === 'insufficient' ? '#fee2e2' : 
                                 nutritionProgress.carbs.status === 'excess' ? '#fef3c7' : '#dcfce7'
                    }}
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{nutritionProgress.carbs.current}</div>
                  <div className="text-xs text-muted-foreground">g</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 지방 */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-yellow-600">지방</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    nutritionProgress.fat.status === 'insufficient' ? 'bg-red-100 text-red-600' :
                    nutritionProgress.fat.status === 'excess' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {nutritionProgress.fat.status === 'insufficient' ? '부족' :
                     nutritionProgress.fat.status === 'excess' ? '과다' : '적정'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{nutritionProgress.fat.current} / {nutritionProgress.fat.target}g</span>
                    <span className="font-medium">{nutritionProgress.fat.percentage}%</span>
                  </div>
                  <Progress 
                    value={Math.min(nutritionProgress.fat.percentage, 100)} 
                    className="h-2"
                    style={{
                      background: nutritionProgress.fat.status === 'insufficient' ? '#fee2e2' : 
                                 nutritionProgress.fat.status === 'excess' ? '#fef3c7' : '#dcfce7'
                    }}
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">{nutritionProgress.fat.current}</div>
                  <div className="text-xs text-muted-foreground">g</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">🧠 AI 식단 분석 및 개선 제안</h2>
        <Card>
          <CardContent className="py-6">
            {!hasSelectedMeals ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">먼저 식단을 구성해 주세요.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 분석 결과 요약 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">📊 식단 분석 결과</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">예산:</span>
                      <span className={`font-medium ${
                        budgetInfo.budgetPercentage > 120 ? 'text-red-600' :
                        budgetInfo.budgetPercentage < 50 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {budgetInfo.budgetPercentage > 120 ? '초과' :
                         budgetInfo.budgetPercentage < 50 ? '부족' : '적정'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">칼로리:</span>
                      <span className={`font-medium ${
                        nutritionProgress.calories.status === 'insufficient' ? 'text-red-600' :
                        nutritionProgress.calories.status === 'excess' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {nutritionProgress.calories.status === 'insufficient' ? '부족' :
                         nutritionProgress.calories.status === 'excess' ? '과다' : '적정'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">단백질:</span>
                      <span className={`font-medium ${
                        nutritionProgress.protein.status === 'insufficient' ? 'text-red-600' :
                        nutritionProgress.protein.status === 'excess' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {nutritionProgress.protein.status === 'insufficient' ? '부족' :
                         nutritionProgress.protein.status === 'excess' ? '과다' : '적정'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">탄수화물:</span>
                      <span className={`font-medium ${
                        nutritionProgress.carbs.status === 'insufficient' ? 'text-red-600' :
                        nutritionProgress.carbs.status === 'excess' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {nutritionProgress.carbs.status === 'insufficient' ? '부족' :
                         nutritionProgress.carbs.status === 'excess' ? '과다' : '적정'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">지방:</span>
                      <span className={`font-medium ${
                        nutritionProgress.fat.status === 'insufficient' ? 'text-red-600' :
                        nutritionProgress.fat.status === 'excess' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {nutritionProgress.fat.status === 'insufficient' ? '부족' :
                         nutritionProgress.fat.status === 'excess' ? '과다' : '적정'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 개선 제안 */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    📌 개선 제안
                  </h3>
                  
                  {(() => {
                    const issues = [];
                    const recommendations = [];
                    
                    // 예산 분석
                    if (budgetInfo.budgetPercentage > 120) {
                      issues.push('예산 초과');
                      recommendations.push('더 경제적인 대체 식품을 고려해보세요. 편의점 도시락보다 김밥이나 삼각김밥이 예산 절약에 도움됩니다.');
                    } else if (budgetInfo.budgetPercentage < 50) {
                      issues.push('예산 부족');
                      recommendations.push('현재 예산이 충분히 활용되지 않고 있습니다. 영양가 높은 식품을 추가로 선택하셔도 좋습니다.');
                    }
                    
                    // 칼로리 분석
                    if (nutritionProgress.calories.status === 'insufficient') {
                      issues.push('칼로리 부족');
                      recommendations.push(`현재 ${nutritionProgress.calories.percentage}%만 섭취하고 있습니다. 견과류나 과일을 간식으로 추가해보세요.`);
                    } else if (nutritionProgress.calories.status === 'excess') {
                      issues.push('칼로리 과다');
                      recommendations.push('칼로리 섭취가 많습니다. 일부 식품의 양을 줄이거나 저칼로리 대안을 고려해보세요.');
                    }
                    
                    // 단백질 분석
                    if (nutritionProgress.protein.status === 'insufficient') {
                      issues.push('단백질 부족');
                      recommendations.push(`단백질이 목표의 ${nutritionProgress.protein.percentage}%에 불과합니다. 닭가슴살 도시락, 계란김밥, 두부 샐러드를 추가해보세요.`);
                    }
                    
                    // 탄수화물 분석
                    if (nutritionProgress.carbs.status === 'excess') {
                      issues.push('탄수화물 과다');
                      recommendations.push('탄수화물 섭취가 권장치를 초과했습니다. 일부 밥류 식품을 샐러드로 대체하는 것을 추천합니다.');
                    } else if (nutritionProgress.carbs.status === 'insufficient') {
                      issues.push('탄수화물 부족');
                      recommendations.push('에너지원이 부족합니다. 현미밥이나 통곡물 식품을 추가해보세요.');
                    }
                    
                    // 지방 분석
                    if (nutritionProgress.fat.status === 'insufficient') {
                      issues.push('지방 부족');
                      recommendations.push('건강한 지방이 부족합니다. 견과류나 아보카도를 포함한 식품을 고려해보세요.');
                    } else if (nutritionProgress.fat.status === 'excess') {
                      issues.push('지방 과다');
                      recommendations.push('지방 섭취가 많습니다. 튀김류보다는 구이나 찜 요리를 선택해보세요.');
                    }
                    
                    // 끼니별 불균형 체크
                    const mealCalories = {
                      breakfast: selectedPerMeal.breakfast.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0),
                      lunch: selectedPerMeal.lunch.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0),
                      dinner: selectedPerMeal.dinner.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0)
                    };
                    
                    const totalMealCalories = mealCalories.breakfast + mealCalories.lunch + mealCalories.dinner;
                    if (totalMealCalories > 0) {
                      const lunchRatio = (mealCalories.lunch / totalMealCalories) * 100;
                      const breakfastRatio = (mealCalories.breakfast / totalMealCalories) * 100;
                      
                      if (lunchRatio > 60) {
                        issues.push('끼니 불균형');
                        recommendations.push('점심에 칼로리가 과도하게 집중되어 있습니다. 아침과 저녁에도 균형있게 배분해보세요.');
                      } else if (breakfastRatio < 15 && mealCalories.breakfast > 0) {
                        recommendations.push('아침 식사를 좀 더 충실하게 드시는 것이 좋겠습니다.');
                      }
                    }
                    
                    // 결과 출력
                    if (issues.length === 0) {
                      return (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-medium">✅ 균형잡힌 식단</p>
                          <p className="text-green-700 text-sm mt-1">
                            영양과 예산이 모두 적절한 식단입니다. 현재 식단을 그대로 유지하셔도 좋습니다.
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {recommendations.map((recommendation, index) => (
                          <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummaryPage;