import { create } from 'zustand';

// UserInfo interface definition
export interface UserInfo {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  bodyFatPercent?: number;
  goal: 'weight-loss' | 'muscle-gain';
  activityLevel?: 'low' | 'medium' | 'high';
  mealCount: number;
  allergies: string[];
  budget: number;
  isAgreementChecked: boolean;
}

// Zustand store state interface
interface UserStore {
  userInfo: UserInfo;
  setUserInfo: (info: Partial<UserInfo>) => void;
  resetUserInfo: () => void;
}

// Initial state values
const initialUserInfo: UserInfo = {
  gender: 'male',
  age: 30,
  height: 170,
  weight: 70,
  goal: 'weight-loss',
  mealCount: 3,
  allergies: [],
  budget: 100,
  isAgreementChecked: false,
};

// Create Zustand store
export const useUserStore = create<UserStore>((set) => ({
  userInfo: initialUserInfo,

  // Allows partial updates to the state
  setUserInfo: (info) =>
    set((state) => ({
      userInfo: { ...state.userInfo, ...info },
    })),

  // Reset state to initial values
  resetUserInfo: () => set({ userInfo: initialUserInfo }),
}));
