import { create } from 'zustand';

export interface UserInfo {
  gender: 'male' | 'female';
  age: number;
  height: number; // in cm
  weight: number; // in kg
  bodyFatPercent?: number;
  goal: 'weight-loss' | 'muscle-gain';
  activityLevel: 'low' | 'medium' | 'high';
  mealCount: number;
  allergies: string[];
  budget: number; // Weekly budget
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
  bodyFatPercent: undefined,
  goal: 'weight-loss',
  activityLevel: 'medium',
  mealCount: 3,
  allergies: [],
  budget: 100,
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