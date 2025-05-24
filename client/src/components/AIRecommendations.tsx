import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, Check, Sparkles, Loader2, ThumbsUp, MessageSquare, SendHorizonal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FoodItem } from '@/api/mockRecommend';
import { useToast } from '@/hooks/use-toast';

interface AIRecommendationsProps {
  userGoal: 'weight-loss' | 'muscle-gain';
  foods: FoodItem[];
  nutritionSummary: {
    calories: { target: number; actual: number };
    protein: { target: number; actual: number };
    carbs: { target: number; actual: number };
    fat: { target: number; actual: number };
  };
  userProfile: {
    gender: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: string;
    allergies: string[];
  };
}

interface Recommendation {
  title: string;
  description: string;
  type: 'nutrition' | 'meal-timing' | 'optimization' | 'motivation';
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  userGoal,
  foods,
  nutritionSummary,
  userProfile
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // Generate recommendations based on user data
  const generateRecommendations = () => {
    setLoading(true);
    
    // In a production app, this would call the OpenAI API
    // For this demo, we'll simulate the AI response with a timeout
    setTimeout(() => {
      const generatedRecommendations = simulateAIRecommendations(
        userGoal, 
        foods, 
        nutritionSummary,
        userProfile
      );
      
      setRecommendations(generatedRecommendations);
      setLoading(false);
      
      toast({
        title: "AI Analysis Complete",
        description: "We've analyzed your meal plan and generated personalized recommendations.",
      });
    }, 1500);
  };
  
  // Handle asking a specific nutrition question
  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;
    
    setLoading(true);
    
    // In a production app, this would call the OpenAI API
    // For this demo, we'll simulate the AI response with a timeout
    setTimeout(() => {
      const response = simulateAIResponse(userQuestion, userGoal, foods, nutritionSummary, userProfile);
      setAiResponse(response);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Nutrition Coach
              </CardTitle>
              <CardDescription>
                Get personalized recommendations based on your meal plan and goals
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate personalized recommendations based on your meal plan, nutritional goals, and health profile.
              </p>
              <Button onClick={generateRecommendations} className="mt-2">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Recommendations
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Analyzing your meal plan and nutrition data...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="pb-4 border-b last:border-b-0">
                  <div className="flex items-start gap-2">
                    {rec.type === 'nutrition' && <Sparkles className="h-5 w-5 mt-0.5 text-blue-500" />}
                    {rec.type === 'meal-timing' && <Clock className="h-5 w-5 mt-0.5 text-green-500" />}
                    {rec.type === 'optimization' && <Settings className="h-5 w-5 mt-0.5 text-purple-500" />}
                    {rec.type === 'motivation' && <ThumbsUp className="h-5 w-5 mt-0.5 text-amber-500" />}
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {showChat ? "Hide Nutrition Chat" : "Ask a Nutrition Question"}
              </Button>
            </div>
          )}
          
          {showChat && (
            <div className="mt-6 space-y-4">
              <Separator />
              <h4 className="font-medium">Ask a Question</h4>
              <p className="text-sm text-muted-foreground">
                Get personalized answers about your nutrition, meal plan, or fitness goals.
              </p>
              
              {aiResponse && (
                <Alert className="my-4">
                  <AlertTitle className="flex items-center">
                    <Brain className="mr-2 h-4 w-4" /> AI Response
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    {aiResponse}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="E.g., How can I increase my protein intake? Should I eat more before workouts?"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAskQuestion} 
                  disabled={loading || !userQuestion.trim()}
                  className="self-end"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          Note: These recommendations are generated based on your current meal plan and profile information.
          Always consult with a healthcare professional before making significant dietary changes.
        </CardFooter>
      </Card>
    </div>
  );
};

// Helper function to simulate AI-generated recommendations
function simulateAIRecommendations(
  userGoal: string,
  foods: FoodItem[],
  nutritionSummary: {
    calories: { target: number; actual: number };
    protein: { target: number; actual: number };
    carbs: { target: number; actual: number };
    fat: { target: number; actual: number };
  },
  userProfile: {
    gender: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: string;
    allergies: string[];
  }
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Check protein intake
  const proteinPerKg = nutritionSummary.protein.actual / userProfile.weight;
  if (userGoal === 'muscle-gain' && proteinPerKg < 1.6) {
    recommendations.push({
      title: "Increase Protein for Muscle Growth",
      description: `Your current protein intake (${proteinPerKg.toFixed(1)}g/kg) is below optimal for muscle growth. Consider adding more lean protein sources to reach 1.6-2.2g per kg of body weight.`,
      type: 'nutrition'
    });
  }
  
  // Check for diverse food groups
  const categories = new Set(foods.map(food => food.category));
  if (categories.size < 4) {
    recommendations.push({
      title: "Increase Food Diversity",
      description: "Your current meal plan has limited food variety. Include more diverse food groups for a broader spectrum of nutrients.",
      type: 'nutrition'
    });
  }
  
  // Check calorie alignment with goal
  const calorieRatio = nutritionSummary.calories.actual / nutritionSummary.calories.target;
  if (userGoal === 'weight-loss' && calorieRatio > 0.95) {
    recommendations.push({
      title: "Adjust Caloric Intake",
      description: "Your calorie intake is very close to your target. For weight loss, consider creating a slightly larger deficit through food choices or activity.",
      type: 'optimization'
    });
  } else if (userGoal === 'muscle-gain' && calorieRatio < 0.9) {
    recommendations.push({
      title: "Increase Energy Intake",
      description: "Your current calorie intake may be insufficient for optimal muscle growth. Consider adding nutrient-dense foods to meet your caloric needs.",
      type: 'optimization'
    });
  }
  
  // Check meal timing for workouts
  if (userProfile.activityLevel === 'high') {
    recommendations.push({
      title: "Optimize Pre/Post Workout Nutrition",
      description: "With your high activity level, consider timing carbohydrates around your workouts - consume complex carbs 1-2 hours before, and simple carbs with protein within 30 minutes after exercise.",
      type: 'meal-timing'
    });
  }
  
  // Age-specific recommendations
  if (userProfile.age > 40) {
    recommendations.push({
      title: "Age-Optimized Nutrition Strategy",
      description: "As we age, metabolism changes and protein needs increase. Ensure you're consuming adequate protein with each meal to maintain muscle mass.",
      type: 'nutrition'
    });
  }
  
  // Motivational recommendation
  recommendations.push({
    title: `Stay Consistent for ${userGoal === 'weight-loss' ? 'Weight Loss' : 'Muscle Building'} Success`,
    description: "Your meal plan is well-structured for your goals. Remember that consistency is key - sticking to your nutrition plan 80-90% of the time will yield long-term results.",
    type: 'motivation'
  });
  
  return recommendations;
}

// Helper function to simulate AI responses to user questions
function simulateAIResponse(
  question: string,
  userGoal: string,
  foods: FoodItem[],
  nutritionSummary: any,
  userProfile: any
): string {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('protein') && questionLower.includes('increase')) {
    return `Based on your current meal plan, you could increase your protein intake by adding more lean sources like chicken breast, fish, Greek yogurt, or plant-based options like tofu and legumes. For your ${userGoal} goal, aiming for ${userGoal === 'muscle-gain' ? '1.6-2.2g' : '1.2-1.6g'} of protein per kg of body weight is optimal. Try adding a protein source to each meal and consider a protein shake after workouts if needed.`;
  }
  
  if (questionLower.includes('before workout') || questionLower.includes('after workout')) {
    return `For optimal performance, eat a balanced meal with complex carbs and moderate protein 2-3 hours before your workout (e.g., oatmeal with fruit and Greek yogurt). After training, consume a combination of fast-digesting protein and carbs within 30 minutes (like a protein shake with banana) to support recovery. Based on your ${userGoal} goal, your post-workout nutrition is particularly important for ${userGoal === 'muscle-gain' ? 'promoting muscle synthesis' : 'preserving lean mass while in a calorie deficit'}.`;
  }
  
  if (questionLower.includes('carb') || questionLower.includes('carbohydrate')) {
    return `For your ${userGoal} goal, ${userGoal === 'muscle-gain' ? 'adequate carbohydrates are essential to fuel workouts and support recovery' : 'focusing on fiber-rich, complex carbohydrates can help manage hunger while in a calorie deficit'}. Based on your activity level (${userProfile.activityLevel}), prioritize carbs around your workout times and choose nutrient-dense sources like whole grains, fruits, and starchy vegetables. Your current carb intake is at ${Math.round((nutritionSummary.carbs.actual / nutritionSummary.carbs.target) * 100)}% of your target.`;
  }
  
  if (questionLower.includes('meal') && questionLower.includes('time')) {
    return `Meal timing can be optimized based on your daily schedule and workout routine. For your ${userGoal} goal, consider having balanced meals every 3-4 hours to maintain stable energy and support metabolism. If you exercise regularly, try to consume a balanced meal 2-3 hours before training and a protein-carb combination within 30-60 minutes after. However, overall daily nutrition intake is generally more important than precise timing for most people.`;
  }
  
  // Default response
  return `Thanks for your question about "${question}". This is important for your ${userGoal} journey. Based on your profile (${userProfile.age} years old, ${userProfile.activityLevel} activity level) and current nutrition data, I'd recommend focusing on consistent application of balanced nutrition principles while monitoring your progress. Consider tracking your results every 2-3 weeks and adjusting your approach based on how your body responds to your current meal plan.`;
}

// Missing icon components
const Clock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Settings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default AIRecommendations;