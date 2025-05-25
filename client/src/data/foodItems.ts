import { FoodItem } from '@/api/mockRecommend';
import rawFoodData from './food_items.json';

// 원본 데이터를 FoodItem 타입에 맞게 변환하고 누락된 값 채우기
export const foodItems: FoodItem[] = rawFoodData.map((item: any, index: number) => {
  // 카테고리 매핑
  let category = 'other';
  if (item.type?.includes('버거')) category = 'burger';
  else if (item.type?.includes('샐러드')) category = 'salad';
  else if (item.type?.includes('스프') || item.category?.includes('국')) category = 'soup';
  else if (item.category?.includes('채소')) category = 'vegetable';
  else if (item.category?.includes('과일')) category = 'fruit';
  else if (item.category?.includes('육류')) category = 'meat';
  else if (item.category?.includes('해산물')) category = 'seafood';
  else if (item.category?.includes('유제품')) category = 'dairy';
  
  // 아침/점심/저녁 식사 태그 생성
  const mealTags = [];
  if (item.calories < 300) mealTags.push('breakfast');
  if (item.calories >= 250 && item.calories <= 600) mealTags.push('lunch');
  if (item.calories >= 400) mealTags.push('dinner');
  
  // 영양 관련 태그 생성
  if (item.protein > 15) mealTags.push('high-protein');
  if (item.fat < 5) mealTags.push('low-fat');
  if (item.carbs < 10) mealTags.push('low-carb');
  
  // 한국어 태그 추가
  mealTags.push('한식');
  
  // 가격 범위 생성 (랜덤)
  const priceRange = [3000, 8000, 12000, 18000];
  const price = item.price > 0 ? item.price : priceRange[Math.floor(Math.random() * priceRange.length)] / 1000;
  
  // 영양소 값이 0인 경우 기본값 설정
  const fat = item.fat > 0 ? item.fat : Math.floor(Math.random() * 15) + 2;
  const carbs = item.carbs > 0 ? item.carbs : Math.floor(Math.random() * 30) + 5;
  
  return {
    id: `f${index + 1}`, // 짧은 ID로 변환
    foodId: index + 1,
    name: item.name.replace('_', ' ').trim(),
    category: category,
    kcal: item.calories,
    protein: item.protein,
    fat: fat,
    carbs: carbs,
    price: price,
    tags: [...mealTags, ...(item.tags || [])],
    allergies: item.allergies || [],
    image: `https://source.unsplash.com/300x200/?korean,food,${encodeURIComponent(item.name.split('_')[0])}`
  };
});

// 모든 음식 데이터 사용
export const sampleFoodItems: FoodItem[] = foodItems;

export default sampleFoodItems;