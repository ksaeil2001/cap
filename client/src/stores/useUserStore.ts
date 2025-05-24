import { create } from 'zustand';

interface UserInfo {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  bodyFatPercent?: number;
  goal: 'weight-loss' | 'muscle-gain';
  activityLevel?: 'low' | 'medium' | 'high';
  budget: number;
  mealCount: number;
  allergies: string[];
}

interface UserStore {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: {
    gender: 'male',
    age: 30,
    height: 170,
    weight: 70,
    goal: 'weight-loss',
    budget: 100,
    mealCount: 3,
    allergies: [],
  },
  setUserInfo: (info) => set({ userInfo: info }),
}));
