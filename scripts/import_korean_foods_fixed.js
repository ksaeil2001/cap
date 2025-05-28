/**
 * 정제된 한국 음식 데이터를 데이터베이스에 추가하는 스크립트
 * 기존 데이터는 유지하고 새로운 데이터만 추가
 */

import fs from 'fs';
import path from 'path';
import { db } from '../server/db.ts';
import { foods } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function importKoreanFoods() {
  try {
    console.log('🚀 정제된 한국 음식 데이터 가져오기 시작...');
    
    // 정제된 데이터 파일 읽기
    const dataPath = path.join(process.cwd(), 'data/정제 데이터.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ 정제 데이터 파일을 찾을 수 없습니다:', dataPath);
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const koreanFoods = JSON.parse(rawData);
    
    console.log(`📊 총 ${koreanFoods.length}개의 음식 데이터 발견`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const food of koreanFoods) {
      try {
        // 기존 데이터 확인
        const existingFood = await db.select().from(foods).where(eq(foods.id, food.id)).limit(1);
        
        if (existingFood.length > 0) {
          skippedCount++;
          continue;
        }
        
        // 가격 정규화 (끝의 00 제거)
        let normalizedPrice = food.price;
        if (typeof normalizedPrice === 'number' && normalizedPrice >= 100) {
          const priceStr = normalizedPrice.toString();
          if (priceStr.endsWith('00')) {
            normalizedPrice = Math.floor(normalizedPrice / 100);
          }
        }
        
        // 데이터 삽입
        await db.insert(foods).values({
          id: food.id,
          name: food.name,
          type: food.type,
          category: food.category,
          cuisine: food.cuisine,
          calories: food.calories,
          protein: food.protein,
          fat: food.fat,
          carbs: food.carbs,
          sodium: food.sodium,
          sugar: food.sugar,
          fiber: food.fiber,
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
          score: food.score || 0,
          popularity: food.popularity || null,
          rating: food.rating || null,
          brand: food.brand || null
        });
        
        insertedCount++;
        
        if (insertedCount % 50 === 0) {
          console.log(`⏳ ${insertedCount}개 삽입 완료...`);
        }
        
      } catch (error) {
        console.error(`❌ ${food.name} 삽입 중 오류:`, error.message);
      }
    }
    
    console.log('✅ 데이터 가져오기 완료!');
    console.log(`📈 총 삽입된 음식: ${insertedCount}개`);
    console.log(`⏭️ 이미 존재하여 스킵된 음식: ${skippedCount}개`);
    
    // 최종 확인
    const totalFoods = await db.select().from(foods);
    console.log(`🎯 데이터베이스 총 음식 수: ${totalFoods.length}개`);
    
  } catch (error) {
    console.error('💥 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트 실행
importKoreanFoods();