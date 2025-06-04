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

// 영양소 이름 목록 (JSON 파일에서 추출할 필드들)
const nutrientFields = [
  'protein', 'fat', 'carbs', 'sodium', 'sugar', 'fiber', 
  'saturatedFat', 'cholesterol', 'transFat', 'calcium', 'iron', 'vitaminC'
];

// 영양소 단위 매핑
const nutrientUnits = {
  'protein': 'g',
  'fat': 'g',
  'carbs': 'g',
  'sodium': 'mg',
  'sugar': 'g',
  'fiber': 'g',
  'saturatedFat': 'g',
  'cholesterol': 'mg',
  'transFat': 'g',
  'calcium': 'mg',
  'iron': 'mg',
  'vitaminC': 'mg'
};

// 카테고리 매핑 함수
function mapCategory(item) {
  let category = 'Other';
  if (item.type?.includes('버거')) category = 'Burger';
  else if (item.category?.includes('빵')) category = 'Bakery';
  else if (item.type?.includes('면')) category = 'Noodle';
  else if (item.category?.includes('채소')) category = 'Vegetable';
  else if (item.category?.includes('과일')) category = 'Fruit';
  else if (item.category?.includes('육류')) category = 'Meat';
  else if (item.category?.includes('해산물')) category = 'Seafood';
  else if (item.category?.includes('유제품')) category = 'Dairy';
  return category;
}

// 데이터베이스 초기화 함수
async function resetDatabase() {
  const client = await pool.connect();
  try {
    // 트랜잭션 시작
    await client.query('BEGIN');

    // 기존 데이터 삭제 (순서 주의: 외래 키 제약 조건 고려)
    await client.query('DELETE FROM food_nutrients');
    await client.query('DELETE FROM foods');
    await client.query('DELETE FROM nutrients');

    // 시퀀스 초기화
    await client.query('ALTER SEQUENCE foods_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE nutrients_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE food_nutrients_id_seq RESTART WITH 1');

    // 트랜잭션 커밋
    await client.query('COMMIT');
    console.log('데이터베이스 초기화 완료');
  } catch (err) {
    // 오류 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('데이터베이스 초기화 실패:', err);
    throw err;
  } finally {
    client.release();
  }
}

// 영양소 정보 삽입 함수
async function insertNutrients() {
  const client = await pool.connect();
  try {
    // 트랜잭션 시작
    await client.query('BEGIN');

    // 영양소 데이터 삽입
    const nutrientMap = {};
    for (const field of nutrientFields) {
      const nutrientName = field.replace(/([A-Z])/g, ' $1').trim(); // camelCase를 공백으로 분리
      const unit = nutrientUnits[field] || 'g';
      
      const result = await client.query(
        'INSERT INTO nutrients (name, unit) VALUES ($1, $2) RETURNING id',
        [nutrientName, unit]
      );
      
      nutrientMap[field] = result.rows[0].id;
    }

    // 트랜잭션 커밋
    await client.query('COMMIT');
    console.log(`${Object.keys(nutrientMap).length}개의 영양소 데이터 삽입 완료`);
    return nutrientMap;
  } catch (err) {
    // 오류 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('영양소 데이터 삽입 실패:', err);
    throw err;
  } finally {
    client.release();
  }
}

// 음식 데이터 삽입 함수
async function importFoods(nutrientMap) {
  // 파일에서 데이터 읽기
  const rawData = fs.readFileSync(foodDataPath, 'utf8');
  const foodItems = JSON.parse(rawData);
  
  console.log(`총 ${foodItems.length}개의 음식 항목을 읽었습니다.`);
  
  const client = await pool.connect();
  try {
    // 트랜잭션 시작
    await client.query('BEGIN');

    // 모든 음식 항목 처리
    for (let i = 0; i < foodItems.length; i++) {
      const item = foodItems[i];
      
      // 각 음식 항목의 영양소 값 추출 및 메인 영양소 찾기
      const nutrients = [];
      let maxNutrientId = null;
      let maxAmount = -1;
      
      for (const field of nutrientFields) {
        const value = item[field] || 0;
        const nutrientId = nutrientMap[field];
        
        if (value > 0) {
          nutrients.push({ id: nutrientId, amount: value });
          
          // 메인 영양소 결정 (단백질, 지방, 탄수화물 중 가장 높은 값)
          if ((field === 'protein' || field === 'fat' || field === 'carbs') && value > maxAmount) {
            maxAmount = value;
            maxNutrientId = nutrientId;
          }
        }
      }
      
      // 메인 영양소가 없으면 첫 번째 영양소 사용
      if (maxNutrientId === null && nutrients.length > 0) {
        maxNutrientId = nutrients[0].id;
      } else if (maxNutrientId === null) {
        // 기본값으로 단백질 영양소 ID 사용
        maxNutrientId = nutrientMap['protein'];
      }
      
      // 음식 데이터 삽입
      const category = mapCategory(item);
      const name = item.name.replace('_', ' ').trim();
      const calories = item.calories || 0;
      const price = (item.price || Math.floor(Math.random() * 15) + 5) * 100; // 가격이 없는 경우 랜덤 생성
      const image = `https://source.unsplash.com/random/500x300/?korean,food,${encodeURIComponent(name.split(' ')[0])}`;
      
      const foodResult = await client.query(
        'INSERT INTO foods (name, category, calories, price, image, main_nutrient_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [name, category, calories, price, image, maxNutrientId]
      );
      
      const foodId = foodResult.rows[0].id;
      
      // 음식-영양소 연결 데이터 삽입
      for (const nutrient of nutrients) {
        await client.query(
          'INSERT INTO food_nutrients (food_id, nutrient_id, amount) VALUES ($1, $2, $3)',
          [foodId, nutrient.id, nutrient.amount]
        );
      }
      
      // 진행 상황 로깅 (매 100개 항목마다)
      if ((i + 1) % 100 === 0 || i === foodItems.length - 1) {
        console.log(`${i + 1}/${foodItems.length} 항목 처리 완료`);
      }
    }

    // 트랜잭션 커밋
    await client.query('COMMIT');
    console.log(`${foodItems.length}개의 음식 데이터 삽입 완료`);
  } catch (err) {
    // 오류 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('음식 데이터 삽입 실패:', err);
    throw err;
  } finally {
    client.release();
  }
}

// 메인 함수
async function main() {
  try {
    console.log('한국어 음식 및 영양소 데이터 가져오기 시작...');
    
    // 데이터베이스 초기화
    await resetDatabase();
    
    // 영양소 데이터 삽입
    const nutrientMap = await insertNutrients();
    
    // 음식 및 영양소 연결 데이터 삽입
    await importFoods(nutrientMap);
    
    console.log('모든 데이터 가져오기 작업 완료!');
  } catch (error) {
    console.error('데이터 가져오기 작업 실패:', error);
  } finally {
    // 데이터베이스 연결 종료
    await pool.end();
  }
}

// 스크립트 실행
main();