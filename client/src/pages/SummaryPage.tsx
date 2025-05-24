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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SummaryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get stores
  const { meals, nutritionSummary, validationStatus } = useMealConfigStore();
  const userStore = useUserStore();
  const summaryStore = useSummaryStore();
  
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
          goal: userStore.goal,
          budget: userStore.budget,
          allergies: userStore.allergies
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
  
  // Prepare chart data
  const nutritionData = [
    { name: 'Protein', value: selectedDayPlan.nutritionSummary.protein, unit: 'g' },
    { name: 'Carbs', value: selectedDayPlan.nutritionSummary.carbs, unit: 'g' },
    { name: 'Fat', value: selectedDayPlan.nutritionSummary.fat, unit: 'g' },
  ];
  
  // Budget percentage
  const budgetPercentage = calculatePercentage(
    selectedDayPlan.budgetUsed, 
    userStore.budget / 7 // Daily budget
  );
  
  // Handle restart
  const handleRestart = () => {
    summaryStore.reset();
    navigate('/');
  };
  
  // Daily tabs
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Meal Plan Summary</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/meal-config')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Config
          </Button>
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <Home className="mr-2 h-4 w-4" />
            Start Over
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
              Day {day.day}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {summaryStore.weekPlan.map((day, index) => (
          <TabsContent key={index} value={index.toString()}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nutrition Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Summary</CardTitle>
                  <CardDescription>
                    {selectedDayPlan.nutritionSummary.calories} kcal total
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
                      label="Protein" 
                      current={selectedDayPlan.nutritionSummary.protein}
                      target={nutritionSummary.protein.target}
                      unit="g"
                      color="#0088FE"
                    />
                    <NutritionProgressBar 
                      label="Carbs" 
                      current={selectedDayPlan.nutritionSummary.carbs}
                      target={nutritionSummary.carbs.target}
                      unit="g"
                      color="#00C49F"
                    />
                    <NutritionProgressBar 
                      label="Fat" 
                      current={selectedDayPlan.nutritionSummary.fat}
                      target={nutritionSummary.fat.target}
                      unit="g"
                      color="#FFBB28"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Budget Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget</CardTitle>
                  <CardDescription>
                    Daily budget: {formatCurrency(userStore.budget / 7)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Used: {formatCurrency(selectedDayPlan.budgetUsed)}</span>
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
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Budget Exceeded</AlertTitle>
                        <AlertDescription>
                          You have exceeded your daily budget by {formatCurrency(selectedDayPlan.budgetUsed - (userStore.budget / 7))}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {validationStatus.hasAllergies && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Allergy Warning</AlertTitle>
                        <AlertDescription>
                          Your meal plan contains foods you're allergic to. Please review carefully.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleSharePlan}>
                    <Copy className="mr-2 h-4 w-4" />
                    Share Plan
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Goal Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Goal</CardTitle>
                  <CardDescription>
                    {userStore.goal === 'weight-loss' ? 'Weight Loss' : 'Muscle Gain'}
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
                          {userStore.goal === 'weight-loss' ? 'Weight Loss Plan' : 'Muscle Gain Plan'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userStore.height}cm, {userStore.weight}kg
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="mb-2 font-medium">Activity Level</div>
                      <Badge variant="outline">
                        {userStore.activityLevel === 'low' && 'Low Activity'}
                        {userStore.activityLevel === 'medium' && 'Medium Activity'}
                        {userStore.activityLevel === 'high' && 'High Activity'}
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="mb-2 font-medium">Allergies</div>
                      {userStore.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userStore.allergies.map((allergy, i) => (
                            <Badge key={i} variant="secondary">{allergy}</Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No allergies</div>
                      )}
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
                    userGoal={userStore.goal}
                    userWeight={userStore.weight}
                    userHeight={userStore.height}
                    userGender={userStore.gender}
                    userAge={userStore.age}
                    userActivityLevel={userStore.activityLevel}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">AI Nutrition Coach</h3>
                  <AIRecommendations 
                    userGoal={userStore.goal}
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
                      gender: userStore.gender,
                      age: userStore.age,
                      height: userStore.height,
                      weight: userStore.weight,
                      activityLevel: userStore.activityLevel,
                      allergies: userStore.allergies
                    }}
                  />
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