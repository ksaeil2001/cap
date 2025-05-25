import { create } from 'zustand';

export interface UserInfo {
  gender: 'male' | 'female'; // BMR 공식 선택, 체지방률 계산
  age: number; // BMR 계산 시 사용
  height: number; // in cm, BMR, 체지방률에 사용
  weight: number; // in kg, BMR, FFM 계산
  bodyFatPercent?: number; // in %, FFM, 단백질 비율 계산
  goal: 'weight-loss' | 'muscle-gain'; // kcal 목표 설정, 매크로 비율에 영향
  activityLevel: 'low' | 'medium' | 'high'; // 활동계수 → TDEE 결정
  mealCount: 2 | 3; // 끼니당 kcal 및 예산 계산
  allergies: string[]; // 식단 제한 요소
  budget: number; // 식단 내 식품 가격 제한 (KRW 단위)
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
  budget: 30000, // 원 단위로 조정
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