import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateCalories(
  gender: 'male' | 'female', 
  weight: number, 
  height: number, 
  goal: 'weight-loss' | 'muscle-gain'
): number {
  // Basic BMR calculation using Harris-Benedict equation
  let bmr = 0;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * 30); // Assuming age 30
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * 30); // Assuming age 30
  }
  
  // Apply activity factor (moderate activity = 1.55)
  const tdee = bmr * 1.55;
  
  // Adjust based on goal
  if (goal === 'weight-loss') {
    return Math.round(tdee - 500); // 500 calorie deficit
  } else {
    return Math.round(tdee + 300); // 300 calorie surplus
  }
}

export function getPercentage(value: number, total: number): number {
  return Math.round((value / total) * 100);
}
