import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, db } from '../server/db.js';
import { foods } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// ESM에서는 __dirname이 없으므로 현재 파일 경로를 기준으로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 한국어 음식 데이터 파일 경로
const foodDataPath = path.join(__dirname, '../attached_assets/food_items_part_1.json');

async function importKoreanFoods() {
  console.log('한국어 음식 데이터 가져오기 시작...');
  
  try {
    // 파일에서 데이터 읽기
    const rawData = fs.readFileSync(foodDataPath, 'utf8');
    const foodItems = JSON.parse(rawData);
    
    console.log(`총 ${foodItems.length}개의 음식 항목을 읽었습니다.`);
    
    // 현재 가장 큰 ID 값 찾기
    const maxIdResult = await db.select({ maxId: db.fn.max(foods.id) }).from(foods);
    let startId = 1;
    if (maxIdResult[0].maxId) {
      startId = maxIdResult[0].maxId + 1;
    }
    
    // 배치 크기 설정 (한 번에 삽입할 음식 수)
    const batchSize = 100;
    let insertedCount = 0;
    
    // 배치 처리를 위한 데이터 분할
    for (let i = 0; i < foodItems.length; i += batchSize) {
      const batch = foodItems.slice(i, i + batchSize);
      
      // 삽입할 데이터 매핑
      const insertData = batch.map((item, index) => {
        const id = startId + i + index;
        // 카테고리 변환
        let category = 'Other';
        if (item.type?.includes('버거')) category = 'Burger';
        else if (item.category?.includes('빵')) category = 'Bakery';
        else if (item.type?.includes('면')) category = 'Noodle';
        else if (item.category?.includes('채소')) category = 'Vegetable';
        else if (item.category?.includes('과일')) category = 'Fruit';
        else if (item.category?.includes('육류')) category = 'Meat';
        else if (item.category?.includes('해산물')) category = 'Seafood';
        else if (item.category?.includes('유제품')) category = 'Dairy';
        
        return {
          id,
          name: item.name.replace('_', ' ').trim(),
          category,
          calories: item.calories || 0,
          price: (item.price || Math.floor(Math.random() * 15) + 5) * 100, // 가격이 없는 경우 랜덤 생성
          image: `https://source.unsplash.com/random/500x300/?korean,food,${encodeURIComponent(item.name.split('_')[0])}`,
          main_nutrient_id: Math.floor(Math.random() * 3) + 1 // 1, 2, 3 중 랜덤 (단백질, 탄수화물, 비타민)
        };
      });
      
      // 데이터 삽입
      await db.insert(foods).values(insertData).onConflictDoNothing();
      
      insertedCount += batch.length;
      console.log(`${insertedCount}/${foodItems.length} 항목 처리 완료`);
    }
    
    console.log('한국어 음식 데이터 가져오기 완료!');
    
  } catch (error) {
    console.error('한국어 음식 데이터 가져오기 실패:', error);
  } finally {
    // 연결 종료
    await pool.end();
  }
}

// 스크립트 실행
importKoreanFoods();