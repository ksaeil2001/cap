"""
실제 한국 음식 데이터 로더
정제된 한국 음식 데이터셋을 FoodItem 모델과 연결
"""

import json
import os
from typing import List
from .models import FoodItem

def load_korean_foods() -> List[FoodItem]:
    """실제 한국 음식 데이터를 로드합니다"""
    try:
        # 정제된 데이터 경로
        file_path = os.path.join(os.path.dirname(__file__), "..", "data", "정제 데이터.json")
        
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                foods_data = json.load(f)
                print(f"✅ 정제된 한국 음식 데이터 {len(foods_data)}개 로드 완료")
                return [FoodItem(**food) for food in foods_data]
        
        # attached_assets에서 시도
        alt_path = os.path.join(os.path.dirname(__file__), "..", "attached_assets", "정제 데이터.json")
        if os.path.exists(alt_path):
            with open(alt_path, 'r', encoding='utf-8') as f:
                foods_data = json.load(f)
                print(f"✅ 첨부된 한국 음식 데이터 {len(foods_data)}개 로드 완료")
                return [FoodItem(**food) for food in foods_data]
        
        print("❌ 한국 음식 데이터 파일을 찾을 수 없습니다")
        return []
        
    except Exception as e:
        print(f"❌ 한국 음식 데이터 로드 실패: {e}")
        return []