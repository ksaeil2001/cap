import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;

// ESM에서는 __dirname이 없으므로 현재 파일 경로를 기준으로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 한국어 음식 데이터 파일 경로
const foodDataPath = path.join(__dirname, '../attached_assets/food_items_part_1.json');

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 배치 크기 설정 - 한 번에 처리할 음식 항목 수
const BATCH_SIZE = 20;

// 배치 처리 함수
async function processBatch(foodItems, startIdx, endIdx, existingFoodCount) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 현재 배치의 음식 항목 처리
    const batch = foodItems.slice(startIdx, endIdx);
    
    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      const foodId = existingFoodCount + startIdx + i + 1;
      
      // 카테고리 매핑
      let category = 'Other';
      if (item.type?.includes('버거')) category = 'Burger';
      else if (item.category?.includes('빵')) category = 'Bakery';
      else if (item.type?.includes('면')) category = 'Noodle';
      else if (item.category?.includes('채소')) category = 'Vegetable';
      else if (item.category?.includes('과일')) category = 'Fruit';
      else if (item.category?.includes('육류')) category = 'Meat';
      else if (item.category?.includes('해산물')) category = 'Seafood';
      else if (item.category?.includes('유제품')) category = 'Dairy';
      
      // 가격 설정 (없으면 랜덤 생성)
      const price = (item.price || Math.floor(Math.random() * 15) + 5) * 100;
      
      // 이미지 URL 생성
      const name = item.name.replace('_', ' ').trim();
      const image = `https://source.unsplash.com/random/500x300/?korean,food,${encodeURIComponent(name.split(' ')[0])}`;
      
      // 메인 영양소 ID 결정 (단백질, 지방, 탄수화물 중 가장 높은 값)
      let mainNutrientId = 1; // 기본값은 단백질
      if (item.carbs > item.protein && item.carbs > item.fat) {
        mainNutrientId = 3; // 탄수화물
      } else if (item.fat > item.protein && item.fat > item.carbs) {
        mainNutrientId = 2; // 지방
      }
      
      // 음식 데이터 삽입
      await client.query(
        'INSERT INTO foods (name, category, calories, price, image, main_nutrient_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, category, item.calories || 0, price, image, mainNutrientId]
      );
      
      // 영양소 데이터 삽입
      if (item.protein > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 1, item.protein]
        );
      }
      
      if (item.fat > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 2, item.fat]
        );
      }
      
      if (item.carbs > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 3, item.carbs]
        );
      }
      
      if (item.sodium > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 4, item.sodium]
        );
      }
      
      if (item.sugar > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 5, item.sugar]
        );
      }
      
      if (item.fiber > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 6, item.fiber]
        );
      }
      
      if (item.saturatedFat > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 7, item.saturatedFat]
        );
      }
      
      if (item.cholesterol > 0) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, 8, item.cholesterol]
        );
      }
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`배치 처리 중 오류 발생 (${startIdx}-${endIdx}):`, error);
    return false;
  } finally {
    client.release();
  }
}

// 메인 함수
async function main() {
  try {
    console.log('한국어 음식 데이터 배치 가져오기 시작...');
    
    // 데이터 파일 읽기
    const rawData = fs.readFileSync(foodDataPath, 'utf8');
    const foodItems = JSON.parse(rawData);
    
    console.log(`총 ${foodItems.length}개의 음식 항목을 읽었습니다.`);
    
    // 현재 음식 데이터 수 확인
    const countResult = await pool.query('SELECT COUNT(*) FROM foods');
    const existingFoodCount = parseInt(countResult.rows[0].count);
    
    console.log(`현재 데이터베이스에 ${existingFoodCount}개의 음식 항목이 있습니다.`);
    
    // 배치 처리 (기존 20개 이후부터 처리)
    const startPosition = 0;
    const totalItems = Math.min(100, foodItems.length); // 일단 100개만 처리 (테스트용)
    
    for (let i = startPosition; i < totalItems; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, totalItems);
      console.log(`배치 처리 중: ${i + 1} ~ ${batchEnd}/${totalItems}`);
      
      const success = await processBatch(foodItems, i, batchEnd, existingFoodCount);
      if (!success) {
        console.error(`배치 처리 실패: ${i + 1} ~ ${batchEnd}`);
        break;
      }
      
      console.log(`배치 ${i + 1} ~ ${batchEnd} 처리 완료`);
    }
    
    console.log('배치 데이터 가져오기 완료!');
  } catch (error) {
    console.error('데이터 가져오기 실패:', error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
main();