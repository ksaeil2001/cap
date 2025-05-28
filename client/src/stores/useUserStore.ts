import { create } from 'zustand';

export interface UserInfo {
  gender: 'male' | 'female'; // BMR 공식 선택, 체지방률 계산
  age: number; // BMR 계산 시 사용
  height: number; // in cm, BMR, 체지방률에 사용
  weight: number; // in kg, BMR, FFM 계산
  bodyFatPercent?: number; // in %, FFM, 단백질 비율 계산
  goal: 'weight-loss' | 'weight-maintenance' | 'muscle-gain'; // kcal 목표 설정, 매크로 비율에 영향
  activityLevel: 'low' | 'medium' | 'high'; // 활동계수 → TDEE 결정
  mealCount: 2 | 3; // 끼니당 kcal 및 예산 계산
  allergies: string[]; // 식단 제한 요소
  budgetPerMeal: number; // 1회 식사 예산 (KRW 단위)
  preferences: string[]; // 식습관/선호도 (채식, 키토, 고단백 등)
  diseases: string[]; // 질환 정보 (당뇨, 고혈압 등)
  isAgreementChecked: boolean; // 이용약관 동의 여부
}

export interface UserStore extends UserInfo {
  // Actions
  updateUserInfo: (info: Partial<UserInfo>) => void;
  resetUserInfo: () => void;
}

const initialUserInfo: UserInfo = {
  gender: 'male',
  age: 30,
  height: 175,
  weight: 75,
  bodyFatPercent: 15, // 기본값 설정
  goal: 'weight-loss',
  activityLevel: 'medium',
  mealCount: 3, // 3을 기본값으로 설정
  allergies: [],
  budgetPerMeal: 10000, // 1회 식사 예산 (KRW)
  preferences: [], // 식습관/선호도
  diseases: [], // 질환 정보
  isAgreementChecked: true
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialUserInfo,
  
  // Update user info with partial data
  updateUserInfo: (info) => {
    set((state) => ({ ...state, ...info }));
  },
  
  // Reset to initial state
  resetUserInfo: () => {
    set(initialUserInfo);
  }
}));