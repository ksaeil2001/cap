import { FoodItem } from '@/api/mockRecommend';

// 원본 데이터에서 필요한 필드만 추출하고 타입에 맞게 변환
const rawFoodData = [
  {
    "id": "f7c0cdab-a348-47d6-abd4-681a1f7077d7",
    "name": "버거_에그불고기 버거",
    "type": "버거",
    "category": "빵 및 과자류",
    "cuisine": "외식(프랜차이즈 등 업체 제공 영양정",
    "calories": 236.0,
    "protein": 9.48,
    "fat": 0.0,
    "carbs": 0.0,
    "sodium": 451.0,
    "sugar": 7.11,
    "fiber": 0.0,
    "saturatedFat": 3.03,
    "cholesterol": 0.0,
    "transFat": 0.0,
    "calcium": 0.0,
    "iron": 0.0,
    "vitaminC": 0.0,
    "ingredients": [],
    "tags": [],
    "allergies": [],
    "price": 0,
    "score": 0,
    "popularity": 0,
    "rating": 0
  },
  {
    "id": "97e129f7-5944-4be5-9d68-a87056cf8f28",
    "name": "버거_에그불고기 버거",
    "type": "버거",
    "category": "빵 및 과자류",
    "cuisine": "외식(프랜차이즈 등 업체 제공 영양정",
    "calories": 221.0,
    "protein": 9.46,
    "fat": 11.71,
    "carbs": 19.82,
    "sodium": 337.0,
    "sugar": 6.31,
    "fiber": 0.0,
    "saturatedFat": 3.15,
    "cholesterol": 82.43,
    "transFat": 0.0,
    "calcium": 0.0,
    "iron": 0.0,
    "vitaminC": 0.0,
    "ingredients": [],
    "tags": [],
    "allergies": [],
    "price": 0,
    "score": 0,
    "popularity": 0,
    "rating": 0
  },
  {
    "id": "50a1edff-a522-43a1-b33e-dcfa6dbe99d3",
    "name": "버거_오리지널더블 버거",
    "type": "버거",
    "category": "빵 및 과자류",
    "cuisine": "외식(프랜차이즈 등 업체 제공 영양정",
    "calories": 260.0,
    "protein": 13.06,
    "fat": 0.0,
    "carbs": 0.0,
    "sodium": 452.0,
    "sugar": 2.23,
    "fiber": 0.0,
    "saturatedFat": 7.32,
    "cholesterol": 0.0,
    "transFat": 0.0,
    "calcium": 0.0,
    "iron": 0.0,
    "vitaminC": 0.0,
    "ingredients": [],
    "tags": [],
    "allergies": [],
    "price": 0,
    "score": 0,
    "popularity": 0,
    "rating": 0
  },
  {
    "id": "b73a3df6-6e97-427a-a86a-c169a8ffdba6",
    "name": "버거_오리지널싱글 버거",
    "type": "버거",
    "category": "빵 및 과자류",
    "cuisine": "외식(프랜차이즈 등 업체 제공 영양정",
    "calories": 221.0,
    "protein": 9.83,
    "fat": 0.0,
    "carbs": 0.0,
    "sodium": 337.0,
    "sugar": 2.14,
    "fiber": 0.0,
    "saturatedFat": 5.56,
    "cholesterol": 0.0,
    "transFat": 0.0,
    "calcium": 0.0,
    "iron": 0.0,
    "vitaminC": 0.0,
    "ingredients": [],
    "tags": [],
    "allergies": [],
    "price": 0,
    "score": 0,
    "popularity": 0,
    "rating": 0
  },
  {
    "id": "67ce0776-cfbb-4d67-895b-ae67241809f5",
    "name": "버거_와규에디션 Ⅱ",
    "type": "버거",
    "category": "빵 및 과자류",
    "cuisine": "외식(프랜차이즈 등 업체 제공 영양정",
    "calories": 269.0,
    "protein": 10.81,
    "fat": 0.0,
    "carbs": 0.0,
    "sodium": 398.0,
    "sugar": 7.57,
    "fiber": 0.0,
    "saturatedFat": 6.16,
    "cholesterol": 0.0,
    "transFat": 0.0,
    "calcium": 0.0,
    "iron": 0.0,
    "vitaminC": 0.0,
    "ingredients": [],
    "tags": [],
    "allergies": [],
    "price": 0,
    "score": 0,
    "popularity": 0,
    "rating": 0
  },
  {
    "id": "99d8ebfa-d781-4844-a4fa-e86f07f09718",
    "name": "버거_와퍼 버거",
    "type": "버거",
    "category": "빵 및 과자류",
    "cuisine": "외식(프랜차이즈 등 업체 제공 영양정",
    "calories": 223.0,
    "protein": 10.43,
    "fat": 0.0,
    "carbs": 0.0,
    "sodium": 291.0,
    "sugar": 3.78,
    "fiber": 0.0,
    "saturatedFat": 4.68,
    "cholesterol": 0.0,
    "transFat": 0.0,
    "calcium": 0.0,
    "iron": 0.0,
    "vitaminC": 0.0,
    "ingredients": [],
    "tags": [],
    "allergies": [],
    "price": 0,
    "score": 0,
    "popularity": 0,
    "rating": 0
  },
  // 데이터 생략...
];

// 원본 데이터를 FoodItem 타입에 맞게 변환하고 누락된 값 채우기
export const foodItems: FoodItem[] = rawFoodData.map((item, index) => {
  // 카테고리 매핑
  let category = 'other';
  if (item.type.includes('버거')) category = 'burger';
  else if (item.type.includes('샐러드')) category = 'salad';
  else if (item.type.includes('스프') || item.category.includes('국')) category = 'soup';
  else if (item.category.includes('채소')) category = 'vegetable';
  else if (item.category.includes('과일')) category = 'fruit';
  else if (item.category.includes('육류')) category = 'meat';
  else if (item.category.includes('해산물')) category = 'seafood';
  else if (item.category.includes('유제품')) category = 'dairy';
  
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
  
  // 알레르기 정보 생성 (랜덤)
  const possibleAllergies = ['gluten', 'dairy', 'nuts', 'soy', 'shellfish'];
  const allergies = item.allergies.length > 0 ? item.allergies : [];
  
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
    tags: [...mealTags, ...item.tags],
    allergies: allergies,
    image: `https://source.unsplash.com/300x200/?korean,food,${encodeURIComponent(item.name.split('_')[0])}`
  };
});

// FoodItem 타입에 맞게 변환된 데이터 100개만 사용
export const sampleFoodItems: FoodItem[] = foodItems.slice(0, 100).map((item, index) => {
  return {
    ...item,
    id: `f${index + 1}`,
    foodId: index + 1
  };
});

export default sampleFoodItems;