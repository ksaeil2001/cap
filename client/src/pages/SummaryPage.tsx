import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import NutritionProgressBar from '@/components/NutritionProgressBar';
import { FoodItem } from '@/stores/useRecommendStore';
import { useUserStore } from '@/stores/useUserStore';
import { useMealConfigStore } from '@/stores/useMealConfigStore';
import { useSummaryStore, WeeklyPlanDay } from '@/stores/useSummaryStore';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Printer, Download, Copy, CheckCircle2 } from 'lucide-react';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userInfo = useUserStore((state) => state.userInfo);
  const { meals, nutritionSummary } = useMealConfigStore();
  const { 
    weeklyPlan, 
    nutritionData, 
    budgetData, 
    generateWeeklyPlan,
    exportMealPlan
  } = useSummaryStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [date, setDate] = useState<Date>(new Date());
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Generate the weekly plan on component mount
  useEffect(() => {
    // Check if we have configured meals
    if (Object.values(meals).some(mealFoods => mealFoods.length === 0)) {
      toast({
        title: "Incomplete meal configuration",
        description: "Please complete your meal configuration before viewing the summary.",
        variant: "destructive",
      });
      navigate("/meal-config");
      return;
    }
    
    // Generate the weekly plan
    generateWeeklyPlan();
  }, [meals, generateWeeklyPlan, navigate, toast]);
  
  // Get the selected day's meal plan
  const getSelectedDayPlan = (): WeeklyPlanDay | undefined => {
    if (weeklyPlan.length === 0) return undefined;
    
    const dateString = date.toLocaleDateString('en-US', { weekday: 'long' });
    return weeklyPlan.find(day => day.day === dateString);
  };
  
  const selectedDayPlan = getSelectedDayPlan();
  
  // Handle printing the meal plan
  const handlePrint = () => {
    window.print();
  };
  
  // Handle exporting the meal plan
  const handleExport = () => {
    const exportData = exportMealPlan();
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Meal plan exported",
      description: "Your meal plan has been downloaded as a text file.",
    });
  };
  
  // Handle copying the meal plan to clipboard
  const handleCopy = () => {
    const exportData = exportMealPlan();
    navigator.clipboard.writeText(exportData)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        
        toast({
          title: "Meal plan copied",
          description: "Your meal plan has been copied to clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Copy failed",
          description: "Failed to copy meal plan to clipboard.",
          variant: "destructive",
        });
      });
  };
  
  // Handle going back to meal configuration
  const handleBack = () => {
    navigate("/meal-config");
  };
  
  // Create data for the nutrition breakdown pie chart
  const nutritionPieData = [
    { name: 'Protein', value: nutritionData.protein, color: '#3b82f6' },
    { name: 'Carbs', value: nutritionData.carbs, color: '#f59e0b' },
    { name: 'Fats', value: nutritionData.fats, color: '#8b5cf6' },
  ];
  
  // Create data for the meal cost breakdown pie chart
  const costPieData = [
    { name: 'Breakfast', value: budgetData.mealCosts.breakfast, color: '#3b82f6' },
    { name: 'Lunch', value: budgetData.mealCosts.lunch, color: '#f59e0b' },
    { name: 'Dinner', value: budgetData.mealCosts.dinner, color: '#8b5cf6' },
  ];
  
  // Create data for the daily calories bar chart
  const caloriesBarData = weeklyPlan.map(day => ({
    name: day.day.slice(0, 3),
    calories: day.totalCalories,
    target: nutritionData.calorieTarget,
  }));
  
  return (
    <div className="pb-10">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Weekly Meal Plan Summary</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Review your personalized meal plan, nutritional breakdown, and budget analysis.
        </p>
      </div>
      
      {/* Actions Row */}
      <div className="flex flex-wrap gap-3 mb-6 justify-end">
        <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy} 
          className="flex items-center gap-2"
          disabled={copySuccess}
        >
          {copySuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1">Nutrition Analysis</TabsTrigger>
          <TabsTrigger value="budget" className="flex-1">Budget Analysis</TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1">Weekly Calendar</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Daily Averages Card */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Averages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Calories:</span>
                    <span className="font-medium">{Math.round(nutritionData.averageCalories)} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Protein:</span>
                    <span className="font-medium">{Math.round(nutritionData.protein)}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Carbohydrates:</span>
                    <span className="font-medium">{Math.round(nutritionData.carbs)}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Fats:</span>
                    <span className="font-medium">{Math.round(nutritionData.fats)}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Daily Cost:</span>
                    <span className="font-medium">${(budgetData.actualSpend / 7).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Budget Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Weekly Budget:</span>
                    <span className="font-medium">${budgetData.weeklyBudget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Actual Spend:</span>
                    <span className="font-medium">${budgetData.actualSpend.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Savings:</span>
                    <span className="font-medium text-green-600">${budgetData.savings.toFixed(2)}</span>
                  </div>
                  <div className="h-10"></div> {/* Spacer */}
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                    <span className="text-neutral-600">Budget Utilization:</span>
                    <span className="font-medium">
                      {Math.round((budgetData.actualSpend / budgetData.weeklyBudget) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Nutrition Distribution Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Macronutrient Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nutritionPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {nutritionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}g`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Daily Calories Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={caloriesBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calories" name="Daily Calories" fill="#3b82f6" />
                    <Bar dataKey="target" name="Target" fill="#e5e7eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Nutrition Analysis Tab */}
        <TabsContent value="nutrition">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Nutrition Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <NutritionProgressBar
                  label="Daily Calories"
                  current={nutritionData.averageCalories}
                  target={nutritionData.calorieTarget}
                  unit="kcal"
                />
                
                <NutritionProgressBar
                  label="Protein"
                  current={nutritionData.protein}
                  target={nutritionData.proteinTarget}
                  color="bg-blue-500"
                />
                
                <NutritionProgressBar
                  label="Carbohydrates"
                  current={nutritionData.carbs}
                  target={nutritionData.carbsTarget}
                  color="bg-amber-500"
                />
                
                <NutritionProgressBar
                  label="Fats"
                  current={nutritionData.fats}
                  target={nutritionData.fatsTarget}
                  color="bg-purple-500"
                />
                
                <NutritionProgressBar
                  label="Fiber"
                  current={nutritionData.fiber}
                  target={nutritionData.fiberTarget}
                  color="bg-green-500"
                />
              </CardContent>
            </Card>
            
            {/* Nutrition Distribution Card */}
            <Card>
              <CardHeader>
                <CardTitle>Macronutrient Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nutritionPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {nutritionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}g`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <h4 className="font-medium mb-3">Nutrition Insights</h4>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>• Your protein intake is {nutritionData.protein >= nutritionData.proteinTarget ? 'sufficient' : 'below target'} for your goals.</li>
                    <li>• Your calorie intake is aligned with your {userInfo.goal} goal.</li>
                    <li>• Your fat intake is within the recommended range for hormonal health.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Budget Analysis Tab */}
        <TabsContent value="budget">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Budget Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Weekly Budget:</span>
                  <span className="font-medium">${budgetData.weeklyBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Actual Spend:</span>
                  <span className="font-medium">${budgetData.actualSpend.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Savings:</span>
                  <span className="font-medium text-green-600">${budgetData.savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Daily Average:</span>
                  <span className="font-medium">${(budgetData.actualSpend / 7).toFixed(2)}</span>
                </div>
                
                <div className="pt-4 mt-4 border-t border-neutral-200">
                  <h4 className="font-medium mb-3">Meal Cost Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Breakfast:</span>
                      <span className="font-medium">${budgetData.mealCosts.breakfast.toFixed(2)} ({budgetData.mealCostPercentages.breakfast.toFixed(0)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Lunch:</span>
                      <span className="font-medium">${budgetData.mealCosts.lunch.toFixed(2)} ({budgetData.mealCostPercentages.lunch.toFixed(0)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Dinner:</span>
                      <span className="font-medium">${budgetData.mealCosts.dinner.toFixed(2)} ({budgetData.mealCostPercentages.dinner.toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Meal Cost Distribution Card */}
            <Card>
              <CardHeader>
                <CardTitle>Meal Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {costPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <h4 className="font-medium mb-3">Budget Insights</h4>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>• You're currently spending {budgetData.savings > 0 ? 'less than' : 'more than'} your weekly budget.</li>
                    <li>• Your {Object.entries(budgetData.mealCostPercentages).sort((a, b) => b[1] - a[1])[0][0]} meals account for the largest portion of your food budget.</li>
                    <li>• At this rate, your monthly food expense would be approximately ${(budgetData.actualSpend * 4).toFixed(2)}.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Weekly Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="rounded-md border"
                />
                
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Selected day:</span>
                    <span className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                  {selectedDayPlan && (
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span>{Math.round(selectedDayPlan.totalCalories)} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span>${selectedDayPlan.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Day Plan Column */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  Meal Plan for {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDayPlan ? (
                  <div className="space-y-6">
                    {/* Breakfast */}
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">Breakfast</h4>
                      {selectedDayPlan.meals.breakfast.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDayPlan.meals.breakfast.map((food: FoodItem) => (
                            <Card key={food.id} className="bg-blue-50">
                              <CardContent className="p-3">
                                <div className="font-medium">{food.name}</div>
                                <div className="text-sm text-neutral-600">
                                  {food.calories || food.kcal || 0} kcal | ${food.price?.toFixed(2)}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-neutral-500 italic">No breakfast items selected</div>
                      )}
                    </div>
                    
                    {/* Lunch */}
                    <div>
                      <h4 className="font-medium text-amber-600 mb-2">Lunch</h4>
                      {selectedDayPlan.meals.lunch.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDayPlan.meals.lunch.map((food: FoodItem) => (
                            <Card key={food.id} className="bg-amber-50">
                              <CardContent className="p-3">
                                <div className="font-medium">{food.name}</div>
                                <div className="text-sm text-neutral-600">
                                  {food.calories || food.kcal || 0} kcal | ${food.price?.toFixed(2)}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-neutral-500 italic">No lunch items selected</div>
                      )}
                    </div>
                    
                    {/* Dinner */}
                    <div>
                      <h4 className="font-medium text-purple-600 mb-2">Dinner</h4>
                      {selectedDayPlan.meals.dinner.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDayPlan.meals.dinner.map((food: FoodItem) => (
                            <Card key={food.id} className="bg-purple-50">
                              <CardContent className="p-3">
                                <div className="font-medium">{food.name}</div>
                                <div className="text-sm text-neutral-600">
                                  {food.calories || food.kcal || 0} kcal | ${food.price?.toFixed(2)}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-neutral-500 italic">No dinner items selected</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-500">
                    Select a day to view the meal plan
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Bottom Navigation */}
      <div className="flex justify-between mt-10">
        <Button 
          variant="outline" 
          onClick={handleBack}
        >
          Back to Meal Configuration
        </Button>
        
        <Button>
          Start New Plan
        </Button>
      </div>
    </div>
  );
};

export default SummaryPage;