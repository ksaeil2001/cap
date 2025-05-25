import React, { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import AlertCustom from '@/components/ui/alert-custom';
import { X, Plus } from 'lucide-react';

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

// Form schema validation
const formSchema = z.object({
  gender: z.enum(['male', 'female'], {
    required_error: '성별을 선택해주세요',
  }),
  age: z.coerce.number().min(10).max(120).int()
    .refine(val => val >= 10 && val <= 120, {
      message: '나이는 10세에서 120세 사이여야 합니다',
    }),
  height: z.coerce.number().min(100).max(250).refine(val => val >= 100 && val <= 250, {
    message: '키는 100cm에서 250cm 사이여야 합니다',
  }),
  weight: z.coerce.number().min(30).max(200).refine(val => val >= 30 && val <= 200, {
    message: '체중은 30kg에서 200kg 사이여야 합니다',
  }),
  bodyFatPercent: z.coerce.number().min(5).max(60).optional()
    .refine(val => val === undefined || (val >= 5 && val <= 60), {
      message: '체지방률은 5%에서 60% 사이여야 합니다',
    }),
  goal: z.enum(['weight-loss', 'muscle-gain'], {
    required_error: '목표를 선택해주세요',
  }),
  activityLevel: z.enum(['low', 'medium', 'high'], {
    required_error: '활동 수준을 선택해주세요',
  }),
  mealCount: z.union([z.literal(2), z.literal(3)]).or(z.coerce.number().refine(val => val === 2 || val === 3, {
    message: '식사 횟수는 2 또는 3이어야 합니다',
  })),
  allergies: z.array(z.string()).default([]),
  budget: z.coerce.number().min(1).max(50000).int()
    .refine(val => val >= 1 && val <= 50000, {
      message: '예산은 1원에서 50,000원 사이여야 합니다',
    }),
  isAgreementChecked: z.literal(true, {
    invalid_type_error: '이용 약관에 동의해주세요',
  }),
});

type FormValues = z.infer<typeof formSchema>;

// 알레르기 옵션 목록 - 카테고리별로 정리
const allergyCategoryOptions = {
  '곡류': ['밀', '메밀', '보리', '귀리', '호밀', '옥수수', '쌀'],
  '콩류': ['대두(콩)', '녹두', '팥', '완두콩', '병아리콩', '렌틸콩'],
  '유제품': ['우유', '유청(whey)', '카제인(casein)', '크림', '버터', '치즈', '요구르트'],
  '육류': ['돼지고기', '쇠고기', '닭고기', '양고기', '오리고기', '말고기'],
  '계란': ['달걀 흰자', '달걀 노른자', '메추리알', '오리알'],
  '견과류/씨앗': ['땅콩', '호두', '잣', '아몬드', '캐슈넛', '브라질너트', '피칸', '마카다미아', '헤이즐넛', '해바라기씨', '참깨', '들깨', '치아씨드', '호박씨'],
  '어류': ['고등어', '멸치', '참치', '연어', '꽁치', '방어', '청어', '송어', '대구', '광어', '아나고', '붕장어', '민어'],
  '갑각류': ['새우', '게', '크릴', '바닷가재'],
  '연체류': ['오징어', '낙지', '문어', '쭈꾸미', '해삼', '해파리'],
  '조개류': ['굴', '전복', '홍합', '바지락', '가리비', '대합', '키조개', '모시조개'],
  '과일': ['복숭아', '토마토', '키위', '바나나', '망고', '파인애플', '딸기', '체리', '사과', '포도', '감', '멜론', '수박', '귤', '오렌지', '라임', '레몬', '석류'],
  '향신채소': ['마늘', '생강', '겨자', '고추', '양파', '파', '부추', '후추', '정향', '계피', '고수', '카레가루', '샤프란'],
  '해조류': ['김', '미역', '다시마', '톳', '매생이', '파래', '모자반'],
  '기타 식품': ['표고버섯', '느타리버섯', '새송이', '양송이', '송이버섯', '달팽이', '멍게', '매뚜기', '곤충분말', '로열젤리', '벌꿀', '꽃가루', '이스트'],
  '식품첨가물': ['아황산염', 'MSG', '타르색소', '아질산염', '벤조산염', '소르빈산염', '산화방지제', '구연산', '프로피온산'],
  '가공식품': ['된장', '고추장', '간장', '젤라틴', '햄', '소시지', '어묵', '라면스프', '케첩', '마요네즈', '굴소스'],
  '음료': ['커피', '카카오', '초콜릿', '녹차', '홍차', '청량음료', '유자차', '알로에 음료', '에너지드링크'],
};

// 모든 알레르기 항목을 평면화하여 단일 배열로 생성
const flatAllergyOptions = Object.entries(allergyCategoryOptions).reduce((acc, [category, items]) => {
  // 각 항목에 카테고리 정보 추가
  const categoryItems = items.map(item => ({
    value: item,
    label: item,
    category
  }));
  return [...acc, ...categoryItems];
}, [] as { value: string; label: string; category: string }[]);

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
      budget: 30000,
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
                    <FormLabel>체지방률 (%)</FormLabel>
                    <FormControl>
                      <div className="pt-2">
                        <Slider
                          defaultValue={[field.value || 15]}
                          min={5}
                          max={60}
                          step={1}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-neutral-500">5%</span>
                          <span className="text-xs font-medium">{field.value || 15}%</span>
                          <span className="text-xs text-neutral-500">60%</span>
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
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="2" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">2끼</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="3" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">3끼</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      식사 횟수에 따라 끼니당 영양소 및 예산이 조정됩니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allergies - Tag Input Style with Autocomplete */}
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => {
                  const [inputValue, setInputValue] = useState("");
                  const [showSuggestions, setShowSuggestions] = useState(false);
                  const [filteredSuggestions, setFilteredSuggestions] = useState<typeof flatAllergyOptions>([]);
                  const inputRef = React.useRef<HTMLInputElement>(null);
                  
                  // 입력값에 따라 추천 항목 필터링
                  React.useEffect(() => {
                    if (inputValue.trim() === '') {
                      setFilteredSuggestions([]);
                      return;
                    }
                    
                    const filtered = flatAllergyOptions.filter(option => 
                      option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
                      !field.value.includes(option.value)
                    );
                    
                    setFilteredSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  }, [inputValue, field.value]);
                  
                  // 태그 추가 함수
                  const addTag = (tag: string) => {
                    const trimmedTag = tag.trim();
                    
                    // 빈 입력이거나 특수문자만 있는 경우 무시
                    if (!trimmedTag || !/[a-zA-Z0-9가-힣]+/.test(trimmedTag)) {
                      return;
                    }
                    
                    // 중복 확인
                    if (field.value.includes(trimmedTag)) {
                      toast({
                        title: "중복된 항목",
                        description: "이미 추가된 알레르기 항목입니다.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    // 최대 5개 제한
                    if (field.value.length >= 5) {
                      toast({
                        title: "최대 항목 수 초과",
                        description: "알레르기 항목은 최대 5개까지 입력 가능합니다.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    // 태그 추가
                    field.onChange([...field.value, trimmedTag]);
                    setInputValue("");
                    // 추천 목록 닫기
                    setShowSuggestions(false);
                  };
                  
                  // 태그 삭제 함수
                  const removeTag = (tag: string) => {
                    field.onChange(field.value.filter(t => t !== tag));
                  };
                  
                  // 키보드 이벤트 처리
                  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault(); // 폼 제출 방지
                      
                      // 추천 항목에서 첫 번째 항목 선택 또는 직접 입력값 사용
                      if (showSuggestions && filteredSuggestions.length > 0) {
                        addTag(filteredSuggestions[0].value);
                      } else {
                        addTag(inputValue);
                      }
                    } else if (e.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  };
                  
                  // 입력 필드 외부 클릭 시 추천 목록 닫기
                  React.useEffect(() => {
                    const handleClickOutside = (event: MouseEvent) => {
                      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                        setShowSuggestions(false);
                      }
                    };
                    
                    document.addEventListener('mousedown', handleClickOutside);
                    return () => {
                      document.removeEventListener('mousedown', handleClickOutside);
                    };
                  }, []);
                  
                  return (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>알레르기 및 식이 제한</FormLabel>
                        <FormDescription>
                          피하고 싶은 알레르기 식품이나 음식을 입력하세요. (최대 5개)
                        </FormDescription>
                      </div>
                      
                      <div className="relative" ref={inputRef}>
                        <div className="flex items-center mb-2">
                          <FormControl>
                            <Input
                              placeholder="알레르기 항목 입력 또는 선택"
                              value={inputValue}
                              onChange={(e) => {
                                setInputValue(e.target.value);
                                if (e.target.value.trim() !== '') {
                                  setShowSuggestions(true);
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              onFocus={() => inputValue.trim() !== '' && setShowSuggestions(true)}
                              disabled={field.value.length >= 5}
                              className="flex-1"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => addTag(inputValue)}
                            disabled={!inputValue.trim() || field.value.length >= 5}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* 자동완성 드롭다운 */}
                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border mt-1 max-h-60 overflow-auto">
                            <div className="p-2">
                              <h4 className="text-xs font-semibold text-gray-500 mb-2">추천 알레르기 항목</h4>
                              <div className="space-y-1">
                                {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                    onClick={() => {
                                      addTag(suggestion.value);
                                    }}
                                  >
                                    <div>
                                      <span className="font-medium">{suggestion.label}</span>
                                      <span className="text-xs text-gray-500 ml-2">({suggestion.category})</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addTag(suggestion.value);
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* 선택된 태그 표시 */}
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {field.value.map((tag, index) => {
                            // 태그에 해당하는 카테고리 찾기
                            const tagInfo = flatAllergyOptions.find(option => option.value === tag);
                            
                            return (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="py-1 px-2 flex items-center"
                              >
                                <span>{tag}</span>
                                {tagInfo && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({tagInfo.category})
                                  </span>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* 선택된 태그가 없을 때 안내 메시지 */}
                      {field.value.length === 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-neutral-500">
                            등록된 알레르기 항목이 없습니다. 위 입력창에 알레르기 항목을 입력하거나 추천 목록에서 선택하세요.
                          </p>
                          
                          {/* 자주 사용되는 알레르기 항목 제안 */}
                          <div className="mt-3">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">자주 사용되는 알레르기 항목</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {['우유', '대두(콩)', '땅콩', '밀', '달걀 흰자', '새우', '고등어'].map((item, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-gray-100"
                                  onClick={() => addTag(item)}
                                >
                                  {item} <Plus className="h-3 w-3 ml-1" />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
              {/* Budget Input */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>식단 예산 (원)</FormLabel>
                    <FormControl>
                      <div className="pt-2">
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value || "0"))}
                          min={1}
                          max={50000}
                          step={1000}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-neutral-500">최소: ₩1</span>
                          <span className="text-xs font-medium">₩{field.value.toLocaleString()}</span>
                          <span className="text-xs text-neutral-500">최대: ₩50,000</span>
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