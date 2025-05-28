/**
 * 정제된 한국 음식 데이터를 PostgreSQL foods 테이블에 가져오기
 */

import { db } from '../server/db.ts';
import { foods, foodNutrients } from '../shared/schema.ts';
import fs from 'fs';
import path from 'path';

async function importRefinedKoreanFoods() {
  try {
    console.log('🍲 정제된 한국 음식 데이터 가져오기 시작...');
    
    // JSON 파일 읽기
    const dataPath = path.join(process.cwd(), 'data', '정제 데이터.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const koreanFoods = JSON.parse(rawData);
    
    console.log(`📊 총 ${koreanFoods.length}개의 한국 음식 데이터 발견`);
    
    // 기존 음식 이름들 가져오기
    console.log('📋 기존 음식 데이터 확인...');
    const existingFoods = await db.select({ name: foods.name }).from(foods);
    const existingNames = new Set(existingFoods.map(f => f.name));
    console.log(`📊 기존 음식 ${existingNames.size}개 발견`);
    
    // 데이터 변환 및 삽입
    let insertedCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    
    for (const food of koreanFoods) {
      try {
        // 이미 존재하는 음식인지 확인
        if (existingNames.has(food.name)) {
          duplicateCount++;
          continue;
        }
        
        // 데이터 매핑 (기존 foods 테이블 스키마에 맞춤)
        const foodData = {
          name: food.name,
          category: food.category || 'unknown',
          calories: parseInt(food.calories) || 0,
          price: parseInt(food.price) || 0, // 이미 원 단위로 저장
          image: null // image 필드는 선택사항
        };
        
        // 데이터베이스에 삽입
        await db.insert(foods).values(foodData);
        insertedCount++;
        
        if (insertedCount % 100 === 0) {
          console.log(`✅ ${insertedCount}개 새로운 음식 데이터 삽입 완료...`);
        }
        
      } catch (error) {
        console.warn(`⚠️ 음식 데이터 삽입 실패: ${food.name} - ${error.message}`);
        skippedCount++;
      }
    }
    
    console.log('\n🎉 한국 음식 데이터 가져오기 완료!');
    console.log(`✅ 새로 추가: ${insertedCount}개`);
    console.log(`🔄 기존 중복: ${duplicateCount}개`);
    console.log(`⚠️ 실패: ${skippedCount}개`);
    
    // 결과 확인
    const totalFoods = await db.select().from(foods);
    console.log(`📊 데이터베이스 총 음식 수: ${totalFoods.length}개`);
    
    // 샘플 데이터 표시
    console.log('\n📋 샘플 음식 데이터:');
    const sampleFoods = totalFoods.slice(0, 5);
    sampleFoods.forEach((food, index) => {
      console.log(`${index + 1}. ${food.name} (${food.type}) - ${food.calories}kcal`);
    });
    
  } catch (error) {
    console.error('❌ 한국 음식 데이터 가져오기 실패:', error);
    throw error;
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  importRefinedKoreanFoods()
    .then(() => {
      console.log('🏁 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { importRefinedKoreanFoods };