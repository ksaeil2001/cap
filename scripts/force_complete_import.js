/**
 * 1,005개 전체 음식 데이터 강제 완료 가져오기
 */

import fs from 'fs';
import path from 'path';
import { db } from '../server/db.ts';
import { foods } from '../shared/schema.ts';

async function forceCompleteImport() {
  try {
    console.log('🚀 1,005개 전체 음식 데이터 강제 완료 가져오기!');
    
    // 정제된 데이터 파일 읽기
    const dataPath = path.join(process.cwd(), 'attached_assets/정제 데이터 .json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const allFoods = JSON.parse(rawData);
    
    console.log(`📊 목표: ${allFoods.length}개 전체 가져오기`);
    
    // 현재 데이터베이스의 모든 ID 조회
    const existingFoods = await db.select({ id: foods.id }).from(foods);
    const existingIds = new Set(existingFoods.map(f => f.id));
    
    console.log(`📝 현재 데이터베이스: ${existingIds.size}개`);
    console.log(`🎯 추가 필요: ${allFoods.length - existingIds.size}개`);
    
    let insertedCount = 0;
    let errorCount = 0;
    
    // 모든 음식 데이터 하나씩 확실히 추가
    for (let i = 0; i < allFoods.length; i++) {
      const food = allFoods[i];
      
      try {
        // 이미 존재하는지 확인
        if (existingIds.has(food.id)) {
          continue;
        }
        
        // 필수 필드 검증
        if (!food.id || !food.name || !food.category || food.calories === undefined || food.price === undefined) {
          console.log(`⚠️ 필수 필드 누락: ${food.id || 'ID없음'} - ${food.name || '이름없음'}`);
          continue;
        }
        
        // 새로운 음식 삽입
        await db.insert(foods).values({
          id: food.id,
          name: food.name,
          type: food.type || null,
          category: food.category,
          cuisine: food.cuisine || null,
          calories: parseFloat(food.calories) || 0,
          protein: food.protein ? parseFloat(food.protein) : null,
          fat: food.fat ? parseFloat(food.fat) : null,
          carbs: food.carbs ? parseFloat(food.carbs) : null,
          sodium: food.sodium ? parseFloat(food.sodium) : null,
          sugar: food.sugar ? parseFloat(food.sugar) : null,
          fiber: food.fiber ? parseFloat(food.fiber) : null,
          saturatedFat: food.saturatedFat ? parseFloat(food.saturatedFat) : null,
          cholesterol: food.cholesterol ? parseFloat(food.cholesterol) : null,
          transFat: food.transFat ? parseFloat(food.transFat) : null,
          calcium: food.calcium ? parseFloat(food.calcium) : null,
          iron: food.iron ? parseFloat(food.iron) : null,
          vitaminC: food.vitaminC ? parseFloat(food.vitaminC) : null,
          ingredients: Array.isArray(food.ingredients) ? food.ingredients : [],
          tags: Array.isArray(food.tags) ? food.tags : [],
          allergies: Array.isArray(food.allergies) ? food.allergies : [],
          price: parseInt(food.price) || 0,
          score: food.score ? parseFloat(food.score) : null,
          popularity: food.popularity ? parseInt(food.popularity) : null,
          rating: food.rating ? parseFloat(food.rating) : null,
          brand: food.brand || null
        });
        
        insertedCount++;
        existingIds.add(food.id); // 중복 방지용 추가
        
        if (insertedCount % 25 === 0) {
          const total = existingIds.size;
          const progress = ((total / allFoods.length) * 100).toFixed(1);
          console.log(`⏳ ${insertedCount}개 추가 완료! 총 ${total}개 (${progress}%)`);
        }
        
      } catch (error) {
        errorCount++;
        if (errorCount <= 10) {
          console.error(`❌ ${food.name} 오류: ${error.message}`);
        }
      }
    }
    
    // 최종 확인
    const finalFoods = await db.select().from(foods);
    
    console.log('\n🎉 전체 음식 데이터 가져오기 완료!');
    console.log(`📈 새로 추가된 음식: ${insertedCount}개`);
    console.log(`❌ 오류 발생: ${errorCount}개`);
    console.log(`🎯 최종 데이터베이스 음식 수: ${finalFoods.length}개`);
    console.log(`✅ 목표 달성률: ${((finalFoods.length / allFoods.length) * 100).toFixed(1)}%`);
    
    if (finalFoods.length >= 1000) {
      console.log('🚀 1,000개 이상 달성! 한국 음식 추천 시스템 완료!');
    }
    
  } catch (error) {
    console.error('💥 치명적 오류:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
forceCompleteImport();