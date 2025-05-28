import React, { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import AlertCustom from '@/components/ui/alert-custom';
import { X, Plus } from 'lucide-react';
import { 
  MIN_BUDGET, MAX_BUDGET, DEFAULT_BUDGET, MIN_AGE, MAX_AGE, 
  MIN_HEIGHT, MAX_HEIGHT, MIN_WEIGHT, MAX_WEIGHT, MAX_ALLERGIES, 
  MAX_PREFERENCES, BUDGET_ERROR_MSG, AGE_ERROR_MSG, HEIGHT_ERROR_MSG, 
  WEIGHT_ERROR_MSG, BUDGET_MIN_DISPLAY, BUDGET_MAX_DISPLAY 
} from '@/constants/budget';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useUserStore } from '@/stores/useUserStore';
import { useToast } from '@/hooks/use-toast';

// 완전한 사용자 프로파일 폼 스키마 검증
const formSchema = z.object({
  gender: z.enum(['male', 'female'], {
    required_error: '성별을 선택해주세요',
  }),
  age: z.coerce.number().min(MIN_AGE).max(MAX_AGE).int()
    .refine(val => val >= MIN_AGE && val <= MAX_AGE, {
      message: AGE_ERROR_MSG,
    }),
  height: z.coerce.number().min(MIN_HEIGHT).max(MAX_HEIGHT).refine(val => val >= MIN_HEIGHT && val <= MAX_HEIGHT, {
    message: HEIGHT_ERROR_MSG,
  }),
  weight: z.coerce.number().min(MIN_WEIGHT).max(MAX_WEIGHT).refine(val => val >= MIN_WEIGHT && val <= MAX_WEIGHT, {
    message: WEIGHT_ERROR_MSG,
  }),
  healthGoal: z.enum(['weight-loss', 'weight-maintenance', 'muscle-gain'], {
    required_error: '건강 목표를 선택해주세요',
  }),
  budgetPerMeal: z.coerce.number().min(MIN_BUDGET).max(MAX_BUDGET).int()
    .refine(val => val >= MIN_BUDGET && val <= MAX_BUDGET, {
      message: BUDGET_ERROR_MSG,
    }),
  allergies: z.array(z.string()).max(MAX_ALLERGIES, {
    message: `알레르기는 최대 ${MAX_ALLERGIES}개까지 선택할 수 있습니다`,
  }).default([]),
  preferences: z.array(z.string()).max(MAX_PREFERENCES, {
    message: `식습관/선호도는 최대 ${MAX_PREFERENCES}개까지 선택할 수 있습니다`,
  }).default([]),
  diseases: z.array(z.string()).max(5, {
    message: '질환 정보는 최대 5개까지 선택할 수 있습니다',
  }).default([]),
  isAgreementChecked: z.literal(true, {
    invalid_type_error: '이용 약관에 동의해주세요',
  }),
});

type FormValues = z.infer<typeof formSchema>;

// 알레르기 옵션 목록
const allergyOptions = [
  '계란', '유제품', '견과류', '갑각류', '생선', '대두', '밀',
  '복숭아', '토마토', '돼지고기', '쇠고기', '닭고기', '새우', '게'
];

// 식습관/선호도 옵션
const preferenceOptions = [
  { value: 'vegetarian', label: '채식' },
  { value: 'keto', label: '키토' },
  { value: 'high-protein', label: '고단백' },
  { value: 'low-sodium', label: '저염식' },
  { value: 'gluten-free', label: '글루텐프리' }
];

// 질환 정보 옵션
const diseaseOptions = [
  { value: 'diabetes', label: '당뇨' },
  { value: 'hypertension', label: '고혈압' },
  { value: 'hyperlipidemia', label: '고지혈증' },
  { value: 'kidney-disease', label: '신장질환' }
];

const MainInputPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userState = useUserStore();

  // 폼 초기화 - 기존 사용자 정보를 사용하되 안전하게 접근
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: userState?.gender || 'male',
      age: userState?.age || 30,
      height: userState?.height || 175,
      weight: userState?.weight || 70,
      healthGoal: 'weight-loss', // 기본값
      budgetPerMeal: userState?.budgetPerMeal || 10000,
      allergies: userState?.allergies || [],
      preferences: userState?.preferences || [],
      diseases: userState?.diseases || [],
      isAgreementChecked: true,
    },
  });

  // 1단계: 폼 제출 처리 및 검증
  const onSubmit = async (data: FormValues) => {
    try {
      // 2단계: 필수 항목 검증
      if (!data.gender || !data.age || !data.height || !data.weight) {
        toast({
          title: '필수 정보 누락',
          description: '성별, 나이, 키, 몸무게는 필수 입력 항목입니다.',
          variant: 'destructive',
        });
        return;
      }

      if (!data.healthGoal) {
        toast({
          title: '건강 목표 누락',
          description: '건강 목표를 선택해주세요.',
          variant: 'destructive',
        });
        return;
      }

      if (!data.isAgreementChecked) {
        toast({
          title: '약관 동의 필요',
          description: '이용 약관에 동의해주세요.',
          variant: 'destructive',
        });
        return;
      }

      // 3단계: user_profile 딕셔너리 생성
      const userProfile = {
        gender: data.gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        health_goal: data.healthGoal,
        budget_per_meal: data.budgetPerMeal,
        allergies: data.allergies,
        preferences: data.preferences.map(pref => 
          preferenceOptions.find(option => option.value === pref)?.label || pref
        ),
        diseases: data.diseases.map(disease => 
          diseaseOptions.find(option => option.value === disease)?.label || disease
        )
      };

      // 4단계: 세션 상태에 저장 (Zustand 스토어 사용)
      userState.updateUserInfo({
        gender: data.gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        goal: data.healthGoal === 'weight-maintenance' ? 'weight-loss' : data.healthGoal as 'weight-loss' | 'muscle-gain',
        activityLevel: 'medium', // 기본값
        mealCount: 3, // 기본값
        allergies: data.allergies,
        budgetPerMeal: data.budgetPerMeal,
        preferences: data.preferences,
        diseases: data.diseases,
        isAgreementChecked: data.isAgreementChecked
      });

      // 성공 메시지
      toast({
        title: '프로필 저장 완료',
        description: '사용자 프로필이 성공적으로 저장되었습니다.',
      });

      // 다음 페이지로 이동 (추천 페이지)
      navigate('/recommend');
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: '오류 발생',
        description: '프로필 저장 중 문제가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  // 폼 리셋 처리
  const handleReset = () => {
    form.reset({
      gender: 'male',
      age: 30,
      height: 175,
      weight: 70,
      healthGoal: 'weight-loss',
      budgetPerMeal: 10000,
      allergies: [],
      preferences: [],
      diseases: [],
      isAgreementChecked: true,
    });
    
    toast({
      title: '폼 초기화',
      description: '입력 폼이 기본값으로 초기화되었습니다.',
    });
  };

  // 태그 형태의 다중 선택 컴포넌트
  const renderMultiSelect = (
    fieldName: 'allergies' | 'preferences' | 'diseases',
    options: string[] | { value: string; label: string }[],
    placeholder: string,
    maxItems: number
  ) => {
    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {fieldName === 'allergies' && '알레르기'}
              {fieldName === 'preferences' && '식습관/선호도'}
              {fieldName === 'diseases' && '질환 정보'}
            </FormLabel>
            <FormControl>
              <div className="space-y-3">
                {/* 선택된 항목들 표시 */}
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((item: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {typeof options[0] === 'object' 
                          ? (options as { value: string; label: string }[]).find(opt => opt.value === item)?.label || item
                          : item
                        }
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            const newValue = field.value.filter((_: string, i: number) => i !== index);
                            field.onChange(newValue);
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* 선택 옵션들 */}
                {field.value?.length < maxItems && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {options.map((option, index) => {
                      const optionValue = typeof option === 'object' ? option.value : option;
                      const optionLabel = typeof option === 'object' ? option.label : option;
                      const isSelected = field.value?.includes(optionValue);
                      
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${fieldName}-${index}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                if (field.value?.length < maxItems) {
                                  field.onChange([...(field.value || []), optionValue]);
                                }
                              } else {
                                field.onChange(field.value?.filter((item: string) => item !== optionValue));
                              }
                            }}
                          />
                          <label
                            htmlFor={`${fieldName}-${index}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {optionLabel}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {field.value?.length >= maxItems && (
                  <p className="text-sm text-gray-500">최대 {maxItems}개까지 선택할 수 있습니다.</p>
                )}
              </div>
            </FormControl>
            <FormDescription>
              {fieldName === 'allergies' && '알레르기가 있는 식품을 선택하세요 (최대 7개)'}
              {fieldName === 'preferences' && '선호하는 식습관을 선택하세요 (최대 5개)'}
              {fieldName === 'diseases' && '해당하는 질환이 있다면 선택하세요 (최대 5개)'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-heading font-bold mb-2">개인 맞춤형 AI 하루 식단 추천</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          정확한 식단 추천을 위해 개인 정보를 입력해주세요. 모든 정보는 안전하게 보호됩니다.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 1단계: 기본 개인정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 개인 정보</CardTitle>
              <CardDescription>
                영양소 계산을 위한 기본 신체 정보를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 성별 선택 */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성별 *</FormLabel>
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

              {/* 나이 입력 */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>나이 (세) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="예: 30" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 키 입력 */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>키 (cm) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="예: 175" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 몸무게 입력 */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>몸무게 (kg) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="예: 70" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 2단계: 건강 목표 및 예산 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>건강 목표 및 예산</CardTitle>
              <CardDescription>
                식단 추천의 방향성을 결정하는 중요한 정보입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 건강 목표 선택 */}
              <FormField
                control={form.control}
                name="healthGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>건강 목표 *</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="건강 목표를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">체중 감량</SelectItem>
                          <SelectItem value="weight-maintenance">체중 유지</SelectItem>
                          <SelectItem value="muscle-gain">근육 증가</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 1회 식사 예산 슬라이더 */}
              <FormField
                control={form.control}
                name="budgetPerMeal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1회 식사 예산 (원) *</FormLabel>
                    <FormControl>
                      <div className="pt-2">
                        <Slider
                          defaultValue={[field.value || DEFAULT_BUDGET]}
                          min={MIN_BUDGET}
                          max={MAX_BUDGET}
                          step={1000}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-neutral-500">{BUDGET_MIN_DISPLAY}</span>
                          <span className="text-sm font-medium">
                            {(field.value || DEFAULT_BUDGET).toLocaleString()}원
                          </span>
                          <span className="text-xs text-neutral-500">{BUDGET_MAX_DISPLAY}</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      설정한 예산 내에서 최적의 식단을 추천해드립니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 3단계: 알레르기 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>알레르기 정보</CardTitle>
              <CardDescription>
                안전한 식단을 위해 알레르기 정보를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMultiSelect('allergies', allergyOptions, '알레르기 식품 선택', 7)}
            </CardContent>
          </Card>

          {/* 4단계: 식습관/선호도 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>식습관/선호도</CardTitle>
              <CardDescription>
                개인 식습관에 맞는 맞춤 추천을 위해 선택해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMultiSelect('preferences', preferenceOptions, '식습관 선택', 5)}
            </CardContent>
          </Card>

          {/* 5단계: 질환 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>질환 정보</CardTitle>
              <CardDescription>
                안전하고 적절한 식단 추천을 위해 해당하는 질환이 있다면 선택해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMultiSelect('diseases', diseaseOptions, '질환 선택', 5)}
            </CardContent>
          </Card>

          {/* 약관 동의 및 제출 */}
          <Card>
            <CardHeader>
              <CardTitle>약관 동의 및 제출</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <FormLabel>
                        이용 약관 및 개인정보 처리방침에 동의합니다 *
                      </FormLabel>
                      <FormDescription>
                        입력하신 개인정보는 식단 추천 목적으로만 사용되며 안전하게 보호됩니다.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  초기화
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!form.formState.isValid}
                >
                  식단 추천 받기
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default MainInputPage;