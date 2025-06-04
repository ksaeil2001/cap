import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { FoodItem } from '@/api/mockRecommend';
import NutritionProgressBar from './NutritionProgressBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface NutritionData {
  calories: {
    target: number;
    actual: number;
  };
  protein: {
    target: number;
    actual: number;
  };
  fat: {
    target: number;
    actual: number;
  };
  carbs: {
    target: number;
    actual: number;
  };
}

interface DetailedNutritionAnalysisProps {
  foods: FoodItem[];
  nutritionData: NutritionData;
  userGoal: 'weight-loss' | 'muscle-gain';
  userWeight: number;
  userHeight: number;
  userGender: 'male' | 'female';
  userAge: number;
  userActivityLevel: 'low' | 'medium' | 'high';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DetailedNutritionAnalysis: React.FC<DetailedNutritionAnalysisProps> = ({
  foods,
  nutritionData,
  userGoal,
  userWeight,
  userHeight,
  userGender,
  userAge,
  userActivityLevel
}) => {
  // Calculate macronutrient ratio
  const totalMacros = nutritionData.protein.actual * 4 + nutritionData.carbs.actual * 4 + nutritionData.fat.actual * 9;
  const proteinPercentage = Math.round((nutritionData.protein.actual * 4 / totalMacros) * 100);
  const carbsPercentage = Math.round((nutritionData.carbs.actual * 4 / totalMacros) * 100);
  const fatPercentage = Math.round((nutritionData.fat.actual * 9 / totalMacros) * 100);

  // Analyze meal timing and composition
  const mealTiming = analyzeMealTiming(foods);
  
  // Calculate micronutrient distribution
  const micronutrientScores = calculateMicronutrientScores(foods);
  
  // Generate nutrition recommendations
  const recommendations = generateRecommendations(
    nutritionData, 
    userGoal, 
    userWeight, 
    userHeight, 
    userGender,
    userAge,
    userActivityLevel,
    micronutrientScores
  );

  // Prepare data for charts
  const macroData = [
    { name: 'Protein', value: proteinPercentage, color: '#0088FE' },
    { name: 'Carbs', value: carbsPercentage, color: '#00C49F' },
    { name: 'Fat', value: fatPercentage, color: '#FF8042' },
  ];
  
  const micronutrientData = Object.entries(micronutrientScores).map(([name, score]) => ({
    name,
    score,
    // Color based on score: red for low, yellow for medium, green for high
    fill: score < 3 ? '#FF6B6B' : score < 7 ? '#FFD166' : '#06D6A0'
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="macros" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="macros">Macronutrients</TabsTrigger>
          <TabsTrigger value="micros">Micronutrients</TabsTrigger>
          <TabsTrigger value="timing">Meal Timing</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="macros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Distribution</CardTitle>
              <CardDescription>
                Analysis of your protein, carbohydrate, and fat intake
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <NutritionProgressBar 
                  label="Protein" 
                  current={nutritionData.protein.actual}
                  target={nutritionData.protein.target}
                  unit="g"
                  color="blue"
                />
                
                <div className="text-sm text-gray-500">
                  {userGoal === 'muscle-gain' 
                    ? `For muscle gain, aim for 1.6-2.2g of protein per kg of body weight (${Math.round(userWeight * 1.6)}-${Math.round(userWeight * 2.2)}g).`
                    : `For weight loss, maintain adequate protein intake of 1.2-1.6g per kg of body weight (${Math.round(userWeight * 1.2)}-${Math.round(userWeight * 1.6)}g).`
                  }
                </div>
                
                <NutritionProgressBar 
                  label="Carbs" 
                  current={nutritionData.carbs.actual}
                  target={nutritionData.carbs.target}
                  unit="g"
                  color="green"
                />
                
                <div className="text-sm text-gray-500">
                  {userGoal === 'muscle-gain' 
                    ? 'For muscle gain, moderately high carb intake provides energy for workouts and recovery.'
                    : 'For weight loss, moderate carbs help maintain energy while creating a calorie deficit.'
                  }
                </div>
                
                <NutritionProgressBar 
                  label="Fat" 
                  current={nutritionData.fat.actual}
                  target={nutritionData.fat.target}
                  unit="g"
                  color="orange"
                />
                
                <div className="text-sm text-gray-500">
                  Healthy fats are essential for hormone production and nutrient absorption. Aim for mostly unsaturated sources.
                </div>
              </div>
              
              {analyzeRatio(proteinPercentage, carbsPercentage, fatPercentage, userGoal)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="micros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Micronutrient Analysis</CardTitle>
              <CardDescription>
                Estimated content of essential vitamins and minerals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={micronutrientData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 10]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value}/10`, 'Score']} />
                    <Legend />
                    <Bar dataKey="score" fill="#8884d8">
                      {micronutrientData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Nutrition Quality Score</div>
                <div className="flex gap-2 mb-4">
                  {calculateOverallScore(micronutrientScores) >= 7 && (
                    <Badge className="bg-green-500">Excellent</Badge>
                  )}
                  {calculateOverallScore(micronutrientScores) >= 5 && calculateOverallScore(micronutrientScores) < 7 && (
                    <Badge className="bg-yellow-500">Good</Badge>
                  )}
                  {calculateOverallScore(micronutrientScores) < 5 && (
                    <Badge className="bg-red-500">Needs Improvement</Badge>
                  )}
                </div>
                
                {findDeficientNutrients(micronutrientScores).length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Potential Nutrient Gaps</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">Your meal plan may be low in these nutrients:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {findDeficientNutrients(micronutrientScores).map((nutrient, i) => (
                          <li key={i}>{nutrient}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Timing Analysis</CardTitle>
              <CardDescription>
                Distribution of nutrients throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealTiming.map((meal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-gray-500">{meal.calories} kcal</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div>Protein: {meal.protein}g</div>
                        <Progress value={Math.min((meal.protein / nutritionData.protein.actual) * 100, 100)} className="h-1 mt-1" />
                      </div>
                      <div>
                        <div>Carbs: {meal.carbs}g</div>
                        <Progress value={Math.min((meal.carbs / nutritionData.carbs.actual) * 100, 100)} className="h-1 mt-1" />
                      </div>
                      <div>
                        <div>Fat: {meal.fat}g</div>
                        <Progress value={Math.min((meal.fat / nutritionData.fat.actual) * 100, 100)} className="h-1 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {analyzeMealDistribution(mealTiming, userGoal)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Based on your goals, nutrition profile, and dietary patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="pb-4 border-b last:border-0">
                    <div className="font-medium mb-1">{rec.title}</div>
                    <div className="text-sm text-gray-700">{rec.description}</div>
                    {rec.suggestions && (
                      <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                        {rec.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper functions for nutritional analysis

function analyzeMealTiming(foods: FoodItem[]): Array<{
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  // In a real app, we would have meal timing information
  // For this demo, we'll simulate it based on the foods in the meal plan
  
  // Group foods by meal type (breakfast, lunch, dinner)
  const breakfast: FoodItem[] = foods.filter(food => 
    food.tags.some(tag => tag.toLowerCase().includes('breakfast')));
  const lunch: FoodItem[] = foods.filter(food => 
    food.tags.some(tag => tag.toLowerCase().includes('lunch')));
  const dinner: FoodItem[] = foods.filter(food => 
    food.tags.some(tag => tag.toLowerCase().includes('dinner')));
  
  // If no specific tagging, distribute evenly
  if (breakfast.length === 0 && lunch.length === 0 && dinner.length === 0) {
    const third = Math.ceil(foods.length / 3);
    return [
      {
        name: 'Breakfast',
        calories: calculateMealNutrition(foods.slice(0, third), 'kcal'),
        protein: calculateMealNutrition(foods.slice(0, third), 'protein'),
        carbs: calculateMealNutrition(foods.slice(0, third), 'carbs'),
        fat: calculateMealNutrition(foods.slice(0, third), 'fat'),
      },
      {
        name: 'Lunch',
        calories: calculateMealNutrition(foods.slice(third, third * 2), 'kcal'),
        protein: calculateMealNutrition(foods.slice(third, third * 2), 'protein'),
        carbs: calculateMealNutrition(foods.slice(third, third * 2), 'carbs'),
        fat: calculateMealNutrition(foods.slice(third, third * 2), 'fat'),
      },
      {
        name: 'Dinner',
        calories: calculateMealNutrition(foods.slice(third * 2), 'kcal'),
        protein: calculateMealNutrition(foods.slice(third * 2), 'protein'),
        carbs: calculateMealNutrition(foods.slice(third * 2), 'carbs'),
        fat: calculateMealNutrition(foods.slice(third * 2), 'fat'),
      }
    ];
  }
  
  return [
    {
      name: 'Breakfast',
      calories: calculateMealNutrition(breakfast, 'kcal'),
      protein: calculateMealNutrition(breakfast, 'protein'),
      carbs: calculateMealNutrition(breakfast, 'carbs'),
      fat: calculateMealNutrition(breakfast, 'fat'),
    },
    {
      name: 'Lunch',
      calories: calculateMealNutrition(lunch, 'kcal'),
      protein: calculateMealNutrition(lunch, 'protein'),
      carbs: calculateMealNutrition(lunch, 'carbs'),
      fat: calculateMealNutrition(lunch, 'fat'),
    },
    {
      name: 'Dinner',
      calories: calculateMealNutrition(dinner, 'kcal'),
      protein: calculateMealNutrition(dinner, 'protein'),
      carbs: calculateMealNutrition(dinner, 'carbs'),
      fat: calculateMealNutrition(dinner, 'fat'),
    }
  ];
}

function calculateMealNutrition(foods: FoodItem[], nutrient: 'kcal' | 'protein' | 'carbs' | 'fat'): number {
  return Math.round(foods.reduce((sum, food) => sum + food[nutrient], 0));
}

function calculateMicronutrientScores(foods: FoodItem[]): Record<string, number> {
  // In a real app, this would calculate actual micronutrient content
  // For this demo, we'll provide estimated scores based on food categories and diversity
  
  // Check for presence of different food groups
  const hasFruits = foods.some(food => 
    food.tags.some(tag => tag.toLowerCase().includes('fruit')));
  const hasVegetables = foods.some(food => 
    food.tags.some(tag => tag.toLowerCase().includes('vegetable')));
  const hasDairy = foods.some(food => 
    food.tags.some(tag => tag.toLowerCase().includes('dairy')));
  const hasProtein = foods.some(food => 
    food.tags.some(tag => tag.toLowerCase().includes('protein')));
  const hasWholegrains = foods.some(food => 
    food.tags.some(tag => tag.toLowerCase().includes('grain')));
  
  // Calculate diversity score (1-10)
  const uniqueFoodCategories = new Set(foods.map(food => food.category)).size;
  const diversityScore = Math.min(Math.round(uniqueFoodCategories * 2), 10);
  
  // Estimate micronutrient scores based on food diversity and categories
  return {
    'Vitamin A': hasFruits && hasVegetables ? 8 : hasFruits || hasVegetables ? 5 : 3,
    'Vitamin C': hasFruits && hasVegetables ? 9 : hasFruits || hasVegetables ? 6 : 2,
    'Vitamin D': hasDairy ? 7 : 3,
    'Vitamin E': hasVegetables ? 7 : 4,
    'B Vitamins': hasProtein && hasWholegrains ? 8 : hasProtein || hasWholegrains ? 5 : 3,
    'Calcium': hasDairy ? 8 : 4,
    'Iron': hasProtein ? 7 : 3,
    'Magnesium': hasWholegrains && hasVegetables ? 8 : hasWholegrains || hasVegetables ? 5 : 3,
    'Zinc': hasProtein ? 7 : 3,
    'Fiber': (hasVegetables && hasFruits && hasWholegrains) ? 9 : 
             (hasVegetables || hasFruits || hasWholegrains) ? 5 : 2,
    'Omega-3': foods.some(food => food.tags.some(tag => tag.toLowerCase().includes('fish'))) ? 8 : 3,
    'Antioxidants': (hasFruits && hasVegetables) ? 9 : (hasFruits || hasVegetables) ? 6 : 2,
    'Overall Diversity': diversityScore
  };
}

function findDeficientNutrients(microScores: Record<string, number>): string[] {
  return Object.entries(microScores)
    .filter(([name, score]) => score < 4 && name !== 'Overall Diversity')
    .map(([name]) => name);
}

function calculateOverallScore(microScores: Record<string, number>): number {
  const scores = Object.entries(microScores)
    .filter(([name]) => name !== 'Overall Diversity')
    .map(([_, score]) => score);
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function analyzeRatio(protein: number, carbs: number, fat: number, goal: string): React.ReactNode {
  // Evaluate if the macronutrient ratio aligns with the goal
  let message = '';
  let variant: 'default' | 'destructive' = 'default';
  
  if (goal === 'muscle-gain') {
    if (protein < 25) {
      message = 'For muscle gain, consider increasing your protein intake to at least 25-30% of total calories.';
      variant = 'destructive';
    } else if (carbs < 40) {
      message = 'For optimal muscle gain, consider increasing your carbohydrate intake to fuel workouts and recovery.';
      variant = 'destructive';
    } else {
      message = 'Your macronutrient distribution is well-aligned with your muscle gain goal.';
    }
  } else if (goal === 'weight-loss') {
    if (protein < 30) {
      message = 'For weight loss, consider increasing protein to 30-35% to help preserve muscle and increase satiety.';
      variant = 'destructive';
    } else if (fat > 35) {
      message = 'Consider moderating fat intake to create a calorie deficit while maintaining essential fat consumption.';
      variant = 'destructive';
    } else {
      message = 'Your macronutrient distribution supports your weight loss goal.';
    }
  }
  
  return message ? (
    <Alert variant={variant} className="mt-4">
      <Info className="h-4 w-4" />
      <AlertTitle>Macronutrient Analysis</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;
}

function analyzeMealDistribution(
  mealTiming: Array<{ name: string; calories: number; protein: number; carbs: number; fat: number }>,
  goal: string
): React.ReactNode {
  // Analyze distribution of nutrients across meals
  const totalCalories = mealTiming.reduce((sum, meal) => sum + meal.calories, 0);
  const breakfastPct = totalCalories > 0 ? (mealTiming[0].calories / totalCalories) * 100 : 0;
  const dinnerPct = totalCalories > 0 ? (mealTiming[2].calories / totalCalories) * 100 : 0;
  
  let message = '';
  let variant: 'default' | 'destructive' = 'default';
  
  if (goal === 'weight-loss') {
    if (breakfastPct < 20) {
      message = 'Consider a more substantial breakfast to jumpstart metabolism and reduce evening hunger.';
      variant = 'destructive';
    } else if (dinnerPct > 45) {
      message = 'Your dinner represents a large portion of daily calories. Consider shifting more calories to earlier meals.';
      variant = 'destructive';
    } else {
      message = 'Your meal timing distribution supports your weight loss goal with appropriate energy distribution throughout the day.';
    }
  } else if (goal === 'muscle-gain') {
    const proteinDistribution = mealTiming.map(meal => meal.protein);
    const evenProteinDistribution = proteinDistribution.every(p => 
      p >= proteinDistribution.reduce((sum, val) => sum + val, 0) / proteinDistribution.length * 0.7
    );
    
    if (!evenProteinDistribution) {
      message = 'For optimal muscle protein synthesis, distribute protein more evenly across all meals.';
      variant = 'destructive';
    } else {
      message = 'Your protein distribution across meals supports consistent muscle protein synthesis throughout the day.';
    }
  }
  
  return message ? (
    <Alert variant={variant} className="mt-4">
      <Info className="h-4 w-4" />
      <AlertTitle>Meal Timing Analysis</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null;
}

interface Recommendation {
  title: string;
  description: string;
  suggestions?: string[];
}

function generateRecommendations(
  nutritionData: NutritionData,
  goal: string,
  weight: number,
  height: number,
  gender: string,
  age: number,
  activityLevel: string,
  micronutrientScores: Record<string, number>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // BMI-based recommendations
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi > 25 && goal === 'weight-loss') {
    recommendations.push({
      title: 'Focus on Caloric Deficit',
      description: `With a BMI of ${bmi.toFixed(1)}, a moderate caloric deficit of 500-750 calories per day will support healthy weight loss.`,
      suggestions: [
        'Increase fiber-rich foods to improve satiety',
        'Prioritize protein at each meal to preserve muscle mass',
        'Consider tracking portions to maintain your caloric target'
      ]
    });
  } else if (bmi < 20 && goal === 'muscle-gain') {
    recommendations.push({
      title: 'Focus on Caloric Surplus',
      description: `With a BMI of ${bmi.toFixed(1)}, aim for a moderate caloric surplus of 300-500 calories per day to support muscle growth.`,
      suggestions: [
        'Include nutrient-dense, calorie-rich foods like nuts, avocados, and olive oil',
        'Consider adding an additional snack between meals',
        'Prioritize post-workout nutrition with protein and carbohydrates'
      ]
    });
  }
  
  // Protein recommendations
  const idealProtein = goal === 'muscle-gain' 
    ? weight * 1.8 // 1.8g per kg for muscle gain
    : weight * 1.4; // 1.4g per kg for weight loss
  
  if (nutritionData.protein.actual < idealProtein * 0.8) {
    recommendations.push({
      title: 'Increase Protein Intake',
      description: `For your ${goal === 'muscle-gain' ? 'muscle building' : 'weight management'} goals, aim for approximately ${Math.round(idealProtein)}g of protein daily.`,
      suggestions: [
        'Add a protein source to each meal (e.g., chicken, fish, tofu, legumes)',
        'Consider protein-rich snacks like Greek yogurt or cottage cheese',
        'Include a protein shake on training days if needed to meet targets'
      ]
    });
  }
  
  // Carbohydrate recommendations
  if (goal === 'muscle-gain' && nutritionData.carbs.actual < nutritionData.carbs.target * 0.8) {
    recommendations.push({
      title: 'Optimize Carbohydrate Timing',
      description: 'Adequate carbohydrates are essential for fueling workouts and supporting recovery.',
      suggestions: [
        'Consume carbs 1-2 hours before and after training sessions',
        'Focus on complex carbs like whole grains, fruits, and starchy vegetables',
        'Consider higher carb intake on training days vs. rest days'
      ]
    });
  } else if (goal === 'weight-loss' && nutritionData.carbs.actual > nutritionData.carbs.target * 1.2) {
    recommendations.push({
      title: 'Moderate Carbohydrate Intake',
      description: 'Controlling carbohydrate intake can help manage hunger and insulin levels during weight loss.',
      suggestions: [
        'Focus on fiber-rich, low glycemic index carbs',
        'Reduce refined carbs and added sugars',
        'Pair carbs with protein and healthy fats to slow digestion'
      ]
    });
  }
  
  // Fat recommendations
  if (nutritionData.fat.actual < nutritionData.fat.target * 0.7) {
    recommendations.push({
      title: 'Include Essential Healthy Fats',
      description: 'Adequate fat intake is crucial for hormone production and nutrient absorption.',
      suggestions: [
        'Include sources of omega-3 fatty acids like fatty fish, walnuts, or flaxseeds',
        'Add avocados, olive oil, or nuts for monounsaturated fats',
        'Don\'t eliminate fat when reducing calories - just choose healthier sources'
      ]
    });
  }
  
  // Micronutrient recommendations
  const deficientNutrients = findDeficientNutrients(micronutrientScores);
  if (deficientNutrients.length > 0) {
    const nutrientSources: Record<string, string[]> = {
      'Vitamin A': ['carrots', 'sweet potatoes', 'spinach', 'kale'],
      'Vitamin C': ['citrus fruits', 'bell peppers', 'strawberries', 'broccoli'],
      'Vitamin D': ['fatty fish', 'egg yolks', 'fortified dairy', 'mushrooms'],
      'Vitamin E': ['nuts', 'seeds', 'spinach', 'broccoli'],
      'B Vitamins': ['whole grains', 'meat', 'eggs', 'legumes'],
      'Calcium': ['dairy products', 'fortified plant milks', 'leafy greens', 'tofu'],
      'Iron': ['red meat', 'spinach', 'legumes', 'fortified cereals'],
      'Magnesium': ['nuts', 'seeds', 'whole grains', 'leafy greens'],
      'Zinc': ['meat', 'shellfish', 'legumes', 'seeds'],
      'Fiber': ['fruits', 'vegetables', 'whole grains', 'legumes'],
      'Omega-3': ['fatty fish', 'walnuts', 'flaxseeds', 'chia seeds'],
      'Antioxidants': ['berries', 'dark chocolate', 'green tea', 'colorful vegetables']
    };
    
    const suggestionsList = deficientNutrients.map(nutrient => 
      `Increase ${nutrient} with ${nutrientSources[nutrient]?.slice(0, 3).join(', ') || 'various food sources'}`
    );
    
    recommendations.push({
      title: 'Address Nutrient Gaps',
      description: 'Your meal plan may be low in some essential micronutrients.',
      suggestions: suggestionsList
    });
  }
  
  // Meal timing recommendations
  if (activityLevel === 'high') {
    recommendations.push({
      title: 'Optimize Meal Timing for Performance',
      description: 'With your high activity level, proper nutrient timing can enhance performance and recovery.',
      suggestions: [
        'Consume a carb and protein meal 2-3 hours before intense activity',
        'Have a protein and carb snack within 30 minutes post-workout',
        'Consider dividing your daily intake into 4-6 smaller meals to maintain energy'
      ]
    });
  }
  
  // Age-specific recommendations
  if (age > 40) {
    recommendations.push({
      title: 'Age-Optimized Nutrition',
      description: 'As we age, nutrient needs shift to support metabolic health and muscle maintenance.',
      suggestions: [
        'Prioritize protein to combat age-related muscle loss',
        'Include foods rich in antioxidants to fight inflammation',
        'Ensure adequate calcium and vitamin D for bone health'
      ]
    });
  }
  
  return recommendations;
}

export default DetailedNutritionAnalysis;