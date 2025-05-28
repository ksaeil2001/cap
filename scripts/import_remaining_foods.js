/**
 * 정제 데이터.json에서 누락된 모든 음식 데이터 가져오기
 */

import fs from 'fs';
import path from 'path';
import { db } from '../server/db.ts';
import { foods } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function importRemainingFoods() {
  try {
    console.log('🚀 누락된 음식 데이터 완전 가져오기 시작...');
    
    // 정제된 데이터 파일 읽기
    const dataPath = path.join(process.cwd(), 'attached_assets/정제 데이터 .json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const allFoods = JSON.parse(rawData);
    
    console.log(`📊 정제 데이터.json 총 음식 수: ${allFoods.length}개`);
    
    // 현재 데이터베이스의 모든 ID 조회
    const existingFoods = await db.select({ id: foods.id }).from(foods);
    const existingIds = new Set(existingFoods.map(f => f.id));
    
    console.log(`📝 기존 데이터베이스에 ${existingIds.size}개 음식 존재`);
    console.log(`🎯 가져와야 할 음식: ${allFoods.length - existingIds.size}개`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const food of allFoods) {
      try {
        // 이미 존재하는 음식인지 확인
        if (existingIds.has(food.id)) {
          skippedCount++;
          continue;
        }
        
        // 새로운 음식 삽입 (가격은 원래대로 유지)
        await db.insert(foods).values({
          id: food.id,
          name: food.name,
          type: food.type || null,
          category: food.category,
          cuisine: food.cuisine || null,
          calories: food.calories,
          protein: food.protein || null,
          fat: food.fat || null,
          carbs: food.carbs || null,
          sodium: food.sodium || null,
          sugar: food.sugar || null,
          fiber: food.fiber || null,
          saturatedFat: food.saturatedFat || null,
          cholesterol: food.cholesterol || null,
          transFat: food.transFat || null,
          calcium: food.calcium || null,
          iron: food.iron || null,
          vitaminC: food.vitaminC || null,
          ingredients: food.ingredients || [],
          tags: food.tags || [],
          allergies: food.allergies || [],
          price: food.price, // 원래 가격 그대로 유지
          score: food.score || null,
          popularity: food.popularity || null,
          rating: food.rating || null,
          brand: food.brand || null
        });
        
        insertedCount++;
        
        if (insertedCount % 50 === 0) {
          console.log(`⏳ ${insertedCount}개 새 음식 추가됨... (총 ${insertedCount + existingIds.size}개)`);
        }
        
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) {
          console.error(`❌ ${food.name} 삽입 중 오류:`, error.message);
        }
      }
    }
    
    console.log('\n✅ 모든 음식 데이터 가져오기 완료!');
    console.log(`📈 새로 추가된 음식: ${insertedCount}개`);
    console.log(`⏭️ 이미 존재하여 스킵된 음식: ${skippedCount}개`);
    console.log(`❌ 오류 발생한 음식: ${errorCount}개`);
    
    // 최종 확인
    const finalFoods = await db.select().from(foods);
    console.log(`🎯 데이터베이스 최종 음식 수: ${finalFoods.length}개`);
    
    // 성공률 계산
    const successRate = ((insertedCount / (allFoods.length - skippedCount)) * 100).toFixed(1);
    console.log(`📊 성공률: ${successRate}%`);
    
  } catch (error) {
    console.error('💥 치명적 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
importRemainingFoods();