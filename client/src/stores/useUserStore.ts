import { create } from 'zustand';

interface UserInfo {
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bodyFatPercent?: number;
  goal: 'weight-loss' | 'muscle-gain';
  budget: number;
  allergies: string[];
}

interface UserStore {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: {
    gender: 'male',
    height: 0,
    weight: 0,
    goal: 'weight-loss',
    budget: 0,
    allergies: [],
  },
  setUserInfo: (info) => set({ userInfo: info }),
}));
