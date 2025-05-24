import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import AlertCustom from '@/components/ui/alert-custom';

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
    required_error: '성별을 선택해주세요',
  }),
  age: z.coerce.number().min(16).max(100),
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(30).max(250),
  bodyFatPercent: z.coerce.number().min(3).max(50).optional(),
  goal: z.enum(['weight-loss', 'muscle-gain'], {
    required_error: '목표를 선택해주세요',
  }),
  activityLevel: z.enum(['low', 'medium', 'high'], {
    required_error: '활동 수준을 선택해주세요',
  }),
  mealCount: z.coerce.number().min(3).max(6),
  allergies: z.array(z.string()).optional().default([]),
  budget: z.coerce.number().min(20).max(300),
  isAgreementChecked: z.literal(true, {
    invalid_type_error: '이용 약관에 동의해주세요',
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Allergies options
const allergiesOptions = [
  { id: 'gluten', label: '글루텐' },
  { id: 'dairy', label: '유제품' },
  { id: 'nuts', label: '견과류' },
  { id: 'eggs', label: '계란' },
  { id: 'soy', label: '대두(콩)' },
  { id: 'fish', label: '생선' },
  { id: 'shellfish', label: '조개류' },
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
        title: '프로필 업데이트 완료',
        description: '프로필이 성공적으로 저장되었습니다.',
      });
      
      // Navigate to recommendation page
      navigate('/recommend');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: '오류',
        description: '프로필 저장 중 문제가 발생했습니다.',
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
      title: '양식 초기화',
      description: '프로필이 기본값으로 초기화되었습니다.',
    });
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-heading font-bold mb-2">맞춤형 식단 플래너</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          프로필을 작성하여 목표, 식단 선호도, 예산에 맞춘 개인화된 식단 추천을 받으세요.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>개인 정보</CardTitle>
              <CardDescription>
                정확한 영양소 추천을 위해 신체 정보를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender Selection */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성별</FormLabel>
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
                          <FormLabel className="font-normal cursor-pointer">남성</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">여성</FormLabel>
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
                    <FormLabel>나이 (세)</FormLabel>
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
                    <FormLabel>키 (cm)</FormLabel>
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
                    <FormLabel>몸무게 (kg)</FormLabel>
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
                    <FormLabel>체지방률 (선택사항)</FormLabel>
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
                      대략적인 체지방률은 영양소 비율을 조정하는 데 도움이 됩니다.
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
              <CardTitle>목표 및 선호도</CardTitle>
              <CardDescription>
                영양 목표와 식단 선호도를 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Goal Selection */}
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주요 목표</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="주요 목표를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">체중 감량</SelectItem>
                          <SelectItem value="muscle-gain">근육 증가</SelectItem>
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
                    <FormLabel>활동 수준</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="활동 수준을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">낮음 (주로 앉아서 생활)</SelectItem>
                          <SelectItem value="medium">보통 (주 3-5일 운동)</SelectItem>
                          <SelectItem value="high">높음 (주 6-7일 고강도 운동)</SelectItem>
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
                    <FormLabel>하루 식사 횟수</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="식사 횟수 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3끼</SelectItem>
                          <SelectItem value="4">4끼</SelectItem>
                          <SelectItem value="5">5끼</SelectItem>
                          <SelectItem value="6">6끼</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      식사 횟수에 따라 1회 식사량을 조정합니다.
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
                      <FormLabel>알레르기 및 식이 제한</FormLabel>
                      <FormDescription>
                        피하고 싶은 알레르기 식품이나 음식을 선택하세요.
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
              <CardTitle>주간 예산</CardTitle>
              <CardDescription>
                식단 계획을 위한 주간 식료품 예산을 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Slider */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주간 식품 예산 (원)</FormLabel>
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
                          <span className="text-xs text-neutral-500">₩20,000</span>
                          <span className="text-xs font-medium">₩{field.value * 1000}</span>
                          <span className="text-xs text-neutral-500">₩300,000</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      이 예산 범위 내에서 식단을 최적화합니다.
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
              양식 초기화
            </Button>
            <Button type="submit">
              추천 받기
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MainInputPage;