import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { useUserStore } from '@/stores/useUserStore';
import { useToast } from '@/hooks/use-toast';

// Form schema validation
const formSchema = z.object({
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select your gender',
  }),
  age: z.coerce.number().min(16).max(100),
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(30).max(250),
  bodyFatPercent: z.coerce.number().min(3).max(50).optional(),
  goal: z.enum(['weight-loss', 'muscle-gain'], {
    required_error: 'Please select your goal',
  }),
  activityLevel: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select your activity level',
  }),
  mealCount: z.coerce.number().min(3).max(6),
  allergies: z.array(z.string()).optional().default([]),
  budget: z.coerce.number().min(20).max(300),
  isAgreementChecked: z.literal(true, {
    invalid_type_error: 'You must agree to the terms',
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Allergies options
const allergiesOptions = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'nuts', label: 'Nuts' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'soy', label: 'Soy' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
];

const MainInputPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Get user store state and actions
  const userState = useUserStore();
  
  // Initialize form with existing user info
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: userState.gender,
      age: userState.age,
      height: userState.height,
      weight: userState.weight,
      bodyFatPercent: userState.bodyFatPercent || 15,
      goal: userState.goal,
      activityLevel: userState.activityLevel,
      mealCount: userState.mealCount,
      allergies: userState.allergies,
      budget: userState.budget,
      isAgreementChecked: true, // 필수 동의 체크
    },
  });

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      // Update user info in store
      userState.updateUserInfo(data);
      
      // Show success toast
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
      
      // Navigate to recommendation page
      navigate('/recommend');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'There was a problem saving your profile.',
        variant: 'destructive',
      });
    }
  };

  // Handle reset form
  const handleReset = () => {
    userState.resetUserInfo();
    form.reset({
      gender: 'male',
      age: 30,
      height: 175,
      weight: 70,
      bodyFatPercent: 15,
      goal: 'weight-loss',
      activityLevel: 'medium',
      mealCount: 3,
      allergies: [],
      budget: 100,
      isAgreementChecked: true,
    });
    
    toast({
      title: 'Form Reset',
      description: 'Your profile has been reset to default values.',
    });
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-heading font-bold mb-2">Personalized Meal Planner</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Complete your profile to receive personalized meal recommendations tailored to your goals, dietary preferences, and budget.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Enter your physical details for accurate nutritional recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender Selection */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age Input */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Height Input */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weight Input */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Body Fat Percentage */}
              <FormField
                control={form.control}
                name="bodyFatPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Fat Percentage (optional)</FormLabel>
                    <FormControl>
                      <div className="pt-2">
                        <Slider
                          defaultValue={[field.value || 15]}
                          min={3}
                          max={50}
                          step={1}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-neutral-500">3%</span>
                          <span className="text-xs font-medium">{field.value || 15}%</span>
                          <span className="text-xs text-neutral-500">50%</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Approximate body fat percentage helps tailor nutrient ratios.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Goals and Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Goals and Preferences</CardTitle>
              <CardDescription>
                Set your nutritional goals and dietary preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Goal Selection */}
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Activity Level */}
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Mostly Sedentary)</SelectItem>
                          <SelectItem value="medium">Medium (Moderate Exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="high">High (Intense Exercise 6-7 days/week)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meal Count */}
              <FormField
                control={form.control}
                name="mealCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Meals Per Day</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of meals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Meals</SelectItem>
                          <SelectItem value="4">4 Meals</SelectItem>
                          <SelectItem value="5">5 Meals</SelectItem>
                          <SelectItem value="6">6 Meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      We'll adjust portion sizes based on your meal frequency.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allergies */}
              <FormField
                control={form.control}
                name="allergies"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Allergies and Dietary Restrictions</FormLabel>
                      <FormDescription>
                        Select any allergies or foods you want to avoid.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {allergiesOptions.map((option) => (
                        <FormField
                          key={option.id}
                          control={form.control}
                          name="allergies"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Budget Card */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Budget</CardTitle>
              <CardDescription>
                Set your weekly grocery budget for meal planning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Slider */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Food Budget (USD)</FormLabel>
                    <FormControl>
                      <div className="pt-2">
                        <Slider
                          defaultValue={[field.value]}
                          min={20}
                          max={300}
                          step={5}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-neutral-500">$20</span>
                          <span className="text-xs font-medium">${field.value}</span>
                          <span className="text-xs text-neutral-500">$300</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      We'll optimize your meal plan to stay within this budget.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Agreement Checkbox */}
          <FormField
            control={form.control}
            name="isAgreementChecked"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    I understand that this application provides recommendations only and not professional medical or nutrition advice.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Reset Form
            </Button>
            <Button type="submit">
              Get Recommendations
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MainInputPage;