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
    
    // 관련 테이블들 순서대로 정리
    console.log('🗑️ 관련 데이터 정리...');
    await db.delete(foodNutrients);
    await db.delete(foods);
    
    // 데이터 변환 및 삽입
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const food of koreanFoods) {
      try {
        // 데이터 매핑 (기존 foods 테이블 스키마에 맞춤)
        const foodData = {
          name: food.name,
          category: food.category || 'unknown',
          calories: parseInt(food.calories) || 0,
          price: Math.round((parseFloat(food.price) || 0) * 100), // 원을 센트로 변환
          image: '/images/default-food.jpg' // 기본 이미지 경로
        };
        
        // 데이터베이스에 삽입
        await db.insert(foods).values(foodData);
        insertedCount++;
        
        if (insertedCount % 50 === 0) {
          console.log(`✅ ${insertedCount}개 음식 데이터 삽입 완료...`);
        }
        
      } catch (error) {
        console.warn(`⚠️ 음식 데이터 삽입 실패: ${food.name} - ${error.message}`);
        skippedCount++;
      }
    }
    
    console.log('\n🎉 한국 음식 데이터 가져오기 완료!');
    console.log(`✅ 성공: ${insertedCount}개`);
    console.log(`⚠️ 건너뜀: ${skippedCount}개`);
    
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