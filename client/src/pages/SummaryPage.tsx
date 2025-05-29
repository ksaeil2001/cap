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
        
        {/* 예산 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>예산</CardTitle>
            <CardDescription>
              일일 예산: {formatCurrency(budgetInfo.totalBudget)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>사용: {formatCurrency(budgetInfo.usedBudget)}</span>
                  <span className={budgetInfo.isOverBudget ? "text-red-500" : "text-green-500"}>
                    {budgetInfo.budgetPercentage}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(budgetInfo.budgetPercentage, 100)} 
                  className={budgetInfo.isOverBudget ? "bg-red-200" : ""}
                />
              </div>
              
              {budgetInfo.isOverBudget && (
                <AlertCustom type="danger" className="mb-2">
                  <strong>예산 초과:</strong> 일일 예산을 {formatCurrency(budgetInfo.usedBudget - budgetInfo.totalBudget)} 초과했습니다.
                  식단 구성을 조정하거나 예산을 늘려보세요.
                </AlertCustom>
              )}
              
              {hasAllergies && (
                <AlertCustom type="danger" className="mb-2">
                  <strong>알레르기 경고:</strong> 현재 식단에 알레르기 유발 성분이 포함되어 있습니다.
                  신중하게 검토하고 필요시 조정해 주세요.
                </AlertCustom>
              )}
            </div>
          </CardContent>
          <CardContent>
            <Button className="w-full" onClick={handleSharePlan}>
              <Copy className="mr-2 h-4 w-4" />
              식단 공유
            </Button>
          </CardContent>
        </Card>
        
        {/* 목표 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>나의 목표</CardTitle>
            <CardDescription>
              {userStore.goal === 'weight-loss' ? '체중 감량' : '근육 증가'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback>{userStore.gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {userStore.goal === 'weight-loss' ? '체중 감량 계획' : '근육 증가 계획'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userStore.height}cm, {userStore.weight}kg
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="mb-2 font-medium">활동 수준</div>
                <Badge variant="outline">
                  {userStore.activityLevel === 'low' ? '낮은 활동량' : 
                   userStore.activityLevel === 'medium' ? '보통 활동량' : '높은 활동량'}
                </Badge>
              </div>
              
              <div>
                <div className="mb-2 font-medium">알레르기</div>
                <div className="text-sm text-muted-foreground">
                  {userStore.allergies && userStore.allergies.length > 0 
                    ? userStore.allergies.join(', ')
                    : '알레르기 없음'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 5️⃣ 식사별 구성 */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">식사별 구성</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 아침식사 */}
          <Card>
            <CardHeader>
              <CardTitle>아침식사</CardTitle>
              <CardDescription>
                {selectedPerMeal.breakfast.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0)} kcal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPerMeal.breakfast.length === 0 ? (
                  <p className="text-muted-foreground text-sm">식단이 아직 구성되지 않았습니다</p>
                ) : (
                  selectedPerMeal.breakfast.map((food: FoodItem) => (
                    <div key={food.id} className="p-2 border rounded-md">
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{food.calories || food.kcal || 0} kcal</span>
                        <span>{formatCurrency(food.price || 0)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        단백질: {food.protein || 0}g | 탄수화물: {food.carbs || 0}g | 지방: {food.fat || 0}g
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* 점심식사 */}
          <Card>
            <CardHeader>
              <CardTitle>점심식사</CardTitle>
              <CardDescription>
                {selectedPerMeal.lunch.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0)} kcal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPerMeal.lunch.length === 0 ? (
                  <p className="text-muted-foreground text-sm">식단이 아직 구성되지 않았습니다</p>
                ) : (
                  selectedPerMeal.lunch.map((food: FoodItem) => (
                    <div key={food.id} className="p-2 border rounded-md">
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{food.calories || food.kcal || 0} kcal</span>
                        <span>{formatCurrency(food.price || 0)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        단백질: {food.protein || 0}g | 탄수화물: {food.carbs || 0}g | 지방: {food.fat || 0}g
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* 저녁식사 */}
          <Card>
            <CardHeader>
              <CardTitle>저녁식사</CardTitle>
              <CardDescription>
                {selectedPerMeal.dinner.reduce((sum, food) => sum + (food.calories || food.kcal || 0), 0)} kcal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPerMeal.dinner.length === 0 ? (
                  <p className="text-muted-foreground text-sm">식단이 아직 구성되지 않았습니다</p>
                ) : (
                  selectedPerMeal.dinner.map((food: FoodItem) => (
                    <div key={food.id} className="p-2 border rounded-md">
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{food.calories || food.kcal || 0} kcal</span>
                        <span>{formatCurrency(food.price || 0)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        단백질: {food.protein || 0}g | 탄수화물: {food.carbs || 0}g | 지방: {food.fat || 0}g
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
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
        <h2 className="text-2xl font-bold mb-4">AI 식단 개선 제안</h2>
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              {budgetInfo.isOverBudget && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">💰 예산 최적화 제안</h3>
                  <p className="text-red-700 text-sm">
                    현재 예산을 {formatCurrency(budgetInfo.usedBudget - budgetInfo.totalBudget)} 초과했습니다. 
                    더 경제적인 대체 음식을 찾아보거나 일부 음식의 양을 조절해보세요.
                  </p>
                </div>
              )}
              
              {nutritionSummary.totalProtein < 50 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">🥩 단백질 보충 제안</h3>
                  <p className="text-blue-700 text-sm">
                    단백질 섭취가 부족합니다. 계란, 닭가슴살, 두부 등의 단백질 식품을 추가해보세요.
                  </p>
                </div>
              )}
              
              {nutritionSummary.totalCalories < 1200 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚡ 칼로리 보충 제안</h3>
                  <p className="text-yellow-700 text-sm">
                    총 칼로리가 너무 낮습니다. 건강한 간식이나 견과류를 추가하여 영양을 보충해보세요.
                  </p>
                </div>
              )}
              
              {!budgetInfo.isOverBudget && nutritionSummary.totalProtein >= 50 && nutritionSummary.totalCalories >= 1200 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✅ 균형잡힌 식단</h3>
                  <p className="text-green-700 text-sm">
                    영양 균형과 예산이 잘 맞춰진 훌륭한 식단입니다! 이대로 유지하시면 좋겠습니다.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummaryPage;