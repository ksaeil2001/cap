/**
 * 정제된 한국 음식 데이터 완전 가져오기
 * 누락된 음식만 추가하고 price에서 00 제거
 */

import fs from 'fs';
import path from 'path';
import { db } from '../server/db.ts';
import { foods } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function completeImport() {
  try {
    console.log('🚀 정제된 한국 음식 데이터 완전 가져오기 시작...');
    
    // 정제된 데이터 파일 읽기
    const dataPath = path.join(process.cwd(), 'attached_assets/정제 데이터 .json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ 정제 데이터 파일을 찾을 수 없습니다:', dataPath);
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const koreanFoods = JSON.parse(rawData);
    
    console.log(`📊 총 ${koreanFoods.length}개의 음식 데이터 발견`);
    
    // 현재 데이터베이스의 모든 ID 조회
    const existingFoods = await db.select({ id: foods.id }).from(foods);
    const existingIds = new Set(existingFoods.map(f => f.id));
    
    console.log(`📝 기존 데이터베이스에 ${existingIds.size}개 음식 존재`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const food of koreanFoods) {
      try {
        // 이미 존재하는 음식인지 확인
        if (existingIds.has(food.id)) {
          skippedCount++;
          continue;
        }
        
        // 가격 정규화: 끝에 00이 있으면 제거
        let normalizedPrice = food.price;
        if (typeof normalizedPrice === 'number' && normalizedPrice >= 100) {
          const priceStr = normalizedPrice.toString();
          if (priceStr.endsWith('00')) {
            normalizedPrice = Math.floor(normalizedPrice / 100);
          }
        }
        
        // 새로운 음식 삽입
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
          price: normalizedPrice,
          score: food.score || null,
          popularity: food.popularity || null,
          rating: food.rating || null,
          brand: food.brand || null
        });
        
        insertedCount++;
        
        if (insertedCount % 20 === 0) {
          console.log(`⏳ ${insertedCount}개 새 음식 추가됨...`);
        }
        
      } catch (error) {
        console.error(`❌ ${food.name} 삽입 중 오류:`, error.message);
      }
    }
    
    console.log('✅ 데이터 가져오기 완료!');
    console.log(`📈 새로 추가된 음식: ${insertedCount}개`);
    console.log(`⏭️ 이미 존재하여 스킵된 음식: ${skippedCount}개`);
    
    // 최종 확인
    const finalCount = await db.select().from(foods);
    console.log(`🎯 데이터베이스 총 음식 수: ${finalCount.length}개`);
    
    // 가격 정규화 예시 출력
    const sampleFoods = await db.select().from(foods).limit(5);
    console.log('\n📋 가격 정규화 예시:');
    sampleFoods.forEach(food => {
      console.log(`- ${food.name}: ₩${food.price}`);
    });
    
  } catch (error) {
    console.error('💥 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
completeImport();