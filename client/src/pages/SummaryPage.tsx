import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealConfigStore } from '@/stores/useMealConfigStore';
import { useUserStore } from '@/stores/useUserStore';
import { useSummaryStore } from '@/stores/useSummaryStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { FoodItem } from '@/api/mockRecommend';
import { AlertCircle, AlertTriangle, ArrowLeft, Copy, Home, RefreshCw } from 'lucide-react';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DetailedNutritionAnalysis from '@/components/DetailedNutritionAnalysis';
import AIRecommendations from '@/components/AIRecommendations';
import AlertCustom from '@/components/ui/alert-custom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SummaryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get stores
  const { meals, nutritionSummary, validationStatus } = useMealConfigStore();
  const userStore = useUserStore();
  const summaryStore = useSummaryStore();
  
  // For debugging
  console.log("User store:", userStore);
  
  // Generate week plan on component mount
  useEffect(() => {
    summaryStore.generateWeekPlan();
  }, []);
  
  // Extract selected day plan
  const { selectedDayPlan, selectedDay, setSelectedDay } = summaryStore;
  
  // Check if we have missing requirements
  useEffect(() => {
    // If validation fails or no meals, redirect back to meal config
    if (validationStatus.missingMeals || 
        Object.values(meals).every(mealItems => mealItems.length === 0)) {
      toast({
        title: "Missing meal information",
        description: "Please complete your meal configuration first.",
        variant: "destructive"
      });
      navigate('/meal-config');
    }
  }, [validationStatus, meals, navigate, toast]);
  
  // Helper for calculating nutrition percentage
  const calculatePercentage = (value: number, total: number) => {
    return Math.round((value / total) * 100);
  };
  
  // Handle share plan
  const handleSharePlan = () => {
    try {
      const planData = {
        weekPlan: summaryStore.weekPlan,
        selectedDay: summaryStore.selectedDay,
        nutritionSummary: nutritionSummary,
        userInfo: {
          goal: 'weight-loss',
          budget: 100,
          allergies: []
        }
      };
      
      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(planData));
      
      // Create a shareable link (in a real app, this would generate an actual link)
      const demoShareableLink = `${window.location.origin}/shared-plan/${new Date().getTime()}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(demoShareableLink).then(() => {
        toast({
          title: "Plan shared successfully!",
          description: "A link to your meal plan has been copied to clipboard.",
        });
      });
    } catch (error) {
      console.error("Error sharing plan:", error);
      toast({
        title: "Share failed",
        description: "There was a problem sharing your meal plan.",
        variant: "destructive"
      });
    }
  };
  
  // 차트 데이터 준비
  const nutritionData = [
    { name: '단백질', value: selectedDayPlan.nutritionSummary.protein, unit: 'g' },
    { name: '탄수화물', value: selectedDayPlan.nutritionSummary.carbs, unit: 'g' },
    { name: '지방', value: selectedDayPlan.nutritionSummary.fat, unit: 'g' },
  ];
  
  // Budget percentage
  const budgetPercentage = calculatePercentage(
    selectedDayPlan.budgetUsed, 
    100 / 7 // Default daily budget
  );
  
  // Handle restart
  const handleRestart = () => {
    summaryStore.reset();
    navigate('/');
  };
  
  // 요일별 탭
  const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  
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
      
      {/* Week day selector */}
      <Tabs 
        defaultValue={selectedDay.toString()} 
        className="w-full mb-6"
        onValueChange={(value) => setSelectedDay(parseInt(value))}
      >
        <TabsList className="grid grid-cols-7 w-full">
          {summaryStore.weekPlan.map((day, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              {day.day}일차
            </TabsTrigger>
          ))}
        </TabsList>
        
        {summaryStore.weekPlan.map((day, index) => (
          <TabsContent key={index} value={index.toString()}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 영양 요약 카드 */}
              <Card>
                <CardHeader>
                  <CardTitle>영양 요약</CardTitle>
                  <CardDescription>
                    총 {selectedDayPlan.nutritionSummary.calories} kcal
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
                    <NutritionProgressBar 
                      label="단백질" 
                      current={selectedDayPlan.nutritionSummary.protein}
                      target={nutritionSummary.protein.target}
                      unit="g"
                      color="#0088FE"
                    />
                    <NutritionProgressBar 
                      label="탄수화물" 
                      current={selectedDayPlan.nutritionSummary.carbs}
                      target={nutritionSummary.carbs.target}
                      unit="g"
                      color="#00C49F"
                    />
                    <NutritionProgressBar 
                      label="지방" 
                      current={selectedDayPlan.nutritionSummary.fat}
                      target={nutritionSummary.fat.target}
                      unit="g"
                      color="#FFBB28"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* 예산 카드 */}
              <Card>
                <CardHeader>
                  <CardTitle>예산</CardTitle>
                  <CardDescription>
                    일일 예산: {formatCurrency(100 / 7)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>사용: {formatCurrency(selectedDayPlan.budgetUsed)}</span>
                        <span className={budgetPercentage > 100 ? "text-red-500" : "text-green-500"}>
                          {budgetPercentage}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(budgetPercentage, 100)} 
                        className={budgetPercentage > 100 ? "bg-red-200" : ""}
                      />
                    </div>
                    
                    {budgetPercentage > 100 && (
                      <AlertCustom type="danger" className="mb-2">
                        <strong>예산 초과:</strong> 일일 예산을 {formatCurrency(selectedDayPlan.budgetUsed - (100 / 7))} 초과했습니다.
                        식단 구성을 조정하거나 예산을 늘려보세요.
                      </AlertCustom>
                    )}
                    
                    {validationStatus.hasAllergies && (
                      <AlertCustom type="danger" className="mb-2">
                        <strong>알레르기 경고:</strong> 현재 식단에 알레르기 유발 성분이 포함되어 있습니다.
                        신중하게 검토하고 필요시 조정해 주세요.
                      </AlertCustom>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleSharePlan}>
                    <Copy className="mr-2 h-4 w-4" />
                    식단 공유
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Goal Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Goal</CardTitle>
                  <CardDescription>
                    Weight Loss
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          Weight Loss Plan
                        </div>
                        <div className="text-sm text-muted-foreground">
                          175cm, 70kg
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="mb-2 font-medium">Activity Level</div>
                      <Badge variant="outline">
                        Medium Activity
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="mb-2 font-medium">Allergies</div>
                      <div className="text-sm text-muted-foreground">No allergies</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Meal Breakdown */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Meal Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Breakfast */}
                <Card>
                  <CardHeader>
                    <CardTitle>Breakfast</CardTitle>
                    <CardDescription>
                      {selectedDayPlan.meals.breakfast.reduce((sum, food) => sum + food.kcal, 0)} kcal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedDayPlan.meals.breakfast.map((food: FoodItem) => (
                        <div key={food.id} className="p-2 border rounded-md">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>{food.kcal} kcal</span>
                            <span>{formatCurrency(food.price)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Lunch */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lunch</CardTitle>
                    <CardDescription>
                      {selectedDayPlan.meals.lunch.reduce((sum, food) => sum + food.kcal, 0)} kcal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedDayPlan.meals.lunch.map((food: FoodItem) => (
                        <div key={food.id} className="p-2 border rounded-md">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>{food.kcal} kcal</span>
                            <span>{formatCurrency(food.price)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Dinner */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dinner</CardTitle>
                    <CardDescription>
                      {selectedDayPlan.meals.dinner.reduce((sum, food) => sum + food.kcal, 0)} kcal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedDayPlan.meals.dinner.map((food: FoodItem) => (
                        <div key={food.id} className="p-2 border rounded-md">
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>{food.kcal} kcal</span>
                            <span>{formatCurrency(food.price)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Advanced Nutrition Analysis Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Advanced Nutrition Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedDayPlan && (
                    <DetailedNutritionAnalysis 
                      foods={[...selectedDayPlan.meals.breakfast, ...selectedDayPlan.meals.lunch, ...selectedDayPlan.meals.dinner]}
                      nutritionData={{
                        calories: {
                          target: nutritionSummary.calories.target,
                          actual: selectedDayPlan.nutritionSummary.calories
                        },
                        protein: {
                          target: nutritionSummary.protein.target,
                          actual: selectedDayPlan.nutritionSummary.protein
                        },
                        carbs: {
                          target: nutritionSummary.carbs.target,
                          actual: selectedDayPlan.nutritionSummary.carbs
                        },
                        fat: {
                          target: nutritionSummary.fat.target,
                          actual: selectedDayPlan.nutritionSummary.fat
                        }
                      }}
                      userGoal={'weight-loss'}
                      userWeight={70}
                      userHeight={170}
                      userGender={'male'}
                      userAge={30}
                      userActivityLevel={'medium'}
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">AI Nutrition Coach</h3>
                  {selectedDayPlan && (
                    <AIRecommendations 
                      userGoal={'weight-loss'}
                      foods={[...selectedDayPlan.meals.breakfast, ...selectedDayPlan.meals.lunch, ...selectedDayPlan.meals.dinner]}
                      nutritionSummary={{
                        calories: {
                          target: nutritionSummary.calories.target,
                          actual: selectedDayPlan.nutritionSummary.calories
                        },
                        protein: {
                          target: nutritionSummary.protein.target,
                          actual: selectedDayPlan.nutritionSummary.protein
                        },
                        carbs: {
                          target: nutritionSummary.carbs.target,
                          actual: selectedDayPlan.nutritionSummary.carbs
                        },
                        fat: {
                          target: nutritionSummary.fat.target,
                          actual: selectedDayPlan.nutritionSummary.fat
                        }
                      }}
                      userProfile={{
                        gender: 'male',
                        age: 30,
                        height: 170,
                        weight: 70,
                        activityLevel: 'medium',
                        allergies: []
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SummaryPage;