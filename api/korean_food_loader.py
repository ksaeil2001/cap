"""
정제된 한국 음식 데이터 전용 로더
기존 DB 및 샘플 데이터는 완전히 비활성화하고 정제된 JSON만 사용
"""

import json
import os
from typing import List
from .models import FoodItem

def load_korean_foods() -> List[FoodItem]:
    """오직 /data/정제 데이터.json 파일만 사용하는 고정된 로더"""
    
    # 고정된 단일 경로만 사용
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "정제 데이터.json")
    
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            foods_data = json.load(f)
            
        print(f"🍲 정제된 한국 음식 데이터 로드 성공:")
        print(f"   📁 고정 경로: {data_path}")
        print(f"   📊 총 {len(foods_data)}개 한국 음식")
        
        # 데이터 검증
        validated_foods = []
        for food in foods_data:
            try:
                validated_foods.append(FoodItem(**food))
            except Exception as e:
                print(f"   ⚠️  음식 데이터 검증 실패: {food.get('name', 'Unknown')} - {e}")
                continue
        
        print(f"   ✅ 검증된 음식: {len(validated_foods)}개")
        return validated_foods
        
    except Exception as e:
        print(f"🚨 치명적 오류: /data/정제 데이터.json 파일 로드 실패: {e}")
        print("   다른 데이터는 절대 사용하지 않습니다.")
        return []