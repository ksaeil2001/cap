"""
정제된 한국 음식 데이터 전용 로더
기존 DB 및 샘플 데이터는 완전히 비활성화하고 정제된 JSON만 사용
"""

import json
import os
from typing import List
from .models import FoodItem

def load_korean_foods() -> List[FoodItem]:
    """정제된 한국 음식 데이터만 로드 (기존 DB 완전 교체)"""
    
    # 1차: data 폴더의 정제된 데이터
    refined_path = os.path.join(os.path.dirname(__file__), "..", "data", "korean_foods_refined.json")
    
    # 2차: attached_assets의 원본 데이터  
    original_path = os.path.join(os.path.dirname(__file__), "..", "attached_assets", "정제 데이터.json")
    
    # 3차: data 폴더의 원본 복사본
    backup_path = os.path.join(os.path.dirname(__file__), "..", "data", "정제 데이터.json")
    
    for path in [refined_path, original_path, backup_path]:
        try:
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    foods_data = json.load(f)
                    
                print(f"🍲 정제된 한국 음식 데이터 로드 성공:")
                print(f"   📁 경로: {path}")
                print(f"   📊 총 {len(foods_data)}개 음식")
                
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
            print(f"   ❌ 파일 읽기 실패 ({path}): {e}")
            continue
    
    # 모든 경로에서 실패한 경우
    print("🚨 치명적 오류: 정제된 한국 음식 데이터를 찾을 수 없습니다!")
    print("   기존 DB나 샘플 데이터는 사용하지 않습니다.")
    return []