"""
개인 맞춤형 한국 음식 추천 시스템
오직 /data/정제 데이터.json 파일만 사용
"""

import json
import pandas as pd
from typing import Dict, List, Any

def recommend(user_profile: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """
    사용자 프로필 기반 개인 맞춤 한국 음식 추천 (끼니별 2-3개씩)
    
    Args:
        user_profile: 사용자 정보 딕셔너리
        
    Returns:
        끼니별 추천 음식 딕셔너리 
        {
            "breakfast": [...],
            "lunch": [...], 
            "dinner": [...]
        }
    """
    
    # 🔒 정제된 한국 음식 데이터만 로드
    import os
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "정제 데이터.json")
    with open(data_path, "r", encoding="utf-8") as f:
        food_data = json.load(f)
    
    df = pd.DataFrame(food_data)
    print(f"🍲 로드된 한국 음식 데이터: {len(df)}개")
    
    # 1️⃣ Step 1: 기본 필터링
    filtered_df = apply_basic_filters(df, user_profile)
    print(f"✅ 기본 필터링 후: {len(filtered_df)}개")
    
    if len(filtered_df) == 0:
        print("⚠️ 필터링 조건에 맞는 음식이 없습니다.")
        return {"breakfast": [], "lunch": [], "dinner": []}
    
    # 2️⃣ Step 2: 영양 기준 점수 계산
    scored_df = calculate_nutrition_scores(filtered_df, user_profile)
    
    # 3️⃣ Step 3: 선호도 반영
    final_df = apply_preference_bonus(scored_df, user_profile)
    
    # 4️⃣ Step 4: 끼니별로 분류하여 추천
    meal_recommendations = generate_meal_based_recommendations(final_df, user_profile)
    
    # 각 끼니별 추천 개수 출력
    total_count = sum(len(meals) for meals in meal_recommendations.values())
    print(f"🎯 최종 추천: 총 {total_count}개 음식")
    print(f"   - 아침: {len(meal_recommendations['breakfast'])}개")
    print(f"   - 점심: {len(meal_recommendations['lunch'])}개") 
    print(f"   - 저녁: {len(meal_recommendations['dinner'])}개")
    
    return meal_recommendations


def apply_basic_filters(df: pd.DataFrame, user_profile: Dict[str, Any]) -> pd.DataFrame:
    """기본 필터링: 알레르기, 예산, 질환 기반"""
    
    filtered = df.copy()
    
    # 알레르기 필터링
    if 'allergies' in user_profile and user_profile['allergies']:
        user_allergies = user_profile['allergies']
        for allergy in user_allergies:
            # 각 음식의 allergies 필드에서 알레르기 항목 확인
            filtered = filtered[~filtered['allergies'].apply(
                lambda x: any(allergy.lower() in item.lower() for item in x) if isinstance(x, list) else False
            )]
    
    # 예산 필터링 (1회 식사 기준)
    if 'budget' in user_profile:
        budget = user_profile['budget']
        filtered = filtered[filtered['price'] <= budget]
    
    # 질환 기반 필터링
    if 'diseases' in user_profile and user_profile['diseases']:
        diseases = user_profile['diseases']
        for disease in diseases:
            if disease == "고혈압":
                # 저염식 태그가 있는 음식 우선, 고나트륨 음식 제외
                filtered = filtered[filtered['sodium'] <= 1000]  # 나트륨 1000mg 이하
            elif disease == "당뇨":
                # 저당 음식 우선
                filtered = filtered[filtered['sugar'] <= 10]  # 당류 10g 이하
    
    return filtered


def calculate_nutrition_scores(df: pd.DataFrame, user_profile: Dict[str, Any]) -> pd.DataFrame:
    """영양 기준 점수 계산"""
    
    goal = user_profile.get('goal', '체중감량')
    scored_df = df.copy()
    
    # 목표별 영양 기준 설정
    if goal == "체중감량":
        # 저칼로리, 고단백 선호
        calorie_weight = -0.4  # 낮을수록 좋음
        protein_weight = 0.6   # 높을수록 좋음
        target_calories = 400  # 목표 칼로리
        target_protein = 25    # 목표 단백질
        
    elif goal == "근육증가":
        # 고단백, 적정 칼로리
        calorie_weight = 0.3
        protein_weight = 0.7
        target_calories = 600
        target_protein = 35
        
    else:  # 체중유지
        # 균형 잡힌 영양
        calorie_weight = 0.2
        protein_weight = 0.4
        target_calories = 500
        target_protein = 20
    
    # 정규화된 점수 계산
    scored_df['calorie_score'] = 1 - abs(scored_df['calories'] - target_calories) / target_calories
    scored_df['protein_score'] = scored_df['protein'] / target_protein
    
    # 전체 영양 점수 (0~1)
    scored_df['nutrition_score'] = (
        scored_df['calorie_score'] * abs(calorie_weight) + 
        scored_df['protein_score'] * protein_weight
    ).clip(0, 1)
    
    return scored_df


def apply_preference_bonus(df: pd.DataFrame, user_profile: Dict[str, Any]) -> pd.DataFrame:
    """선호도 반영하여 점수 가산"""
    
    final_df = df.copy()
    preferences = user_profile.get('preferences', [])
    
    # 선호도 점수 초기화
    final_df['preference_score'] = 0
    
    for preference in preferences:
        if preference == "단백질 위주":
            # 고단백 태그가 있는 음식에 가산점
            final_df['preference_score'] += final_df['tags'].apply(
                lambda x: 0.2 if isinstance(x, list) and any('고단백' in tag for tag in x) else 0
            )
        elif preference == "간편식":
            # 도시락, 즉석식품 타입에 가산점
            final_df['preference_score'] += final_df['type'].apply(
                lambda x: 0.15 if x in ['도시락', '즉석밥', '간편식'] else 0
            )
        elif preference == "저염식":
            # 저염식 태그에 가산점
            final_df['preference_score'] += final_df['tags'].apply(
                lambda x: 0.2 if isinstance(x, list) and any('저염식' in tag for tag in x) else 0
            )
    
    # 최종 점수 = 영양 점수 + 선호도 점수
    final_df['final_score'] = (final_df['nutrition_score'] + final_df['preference_score']).clip(0, 1)
    
    return final_df


def generate_meal_based_recommendations(df: pd.DataFrame, user_profile: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """끼니별 추천 리스트 생성"""
    
    # 끼니별 분류 기준 정의
    meal_categories = {
        'breakfast': ['아침', '간편식', '도시락', '즉석밥', '시리얼', '빵', '유제품'],
        'lunch': ['점심', '밥', '국', '찌개', '덮밥', '비빔밥', '도시락', '정식'],
        'dinner': ['저녁', '밥', '국', '찌개', '구이', '볶음', '전골', '정식', '반찬']
    }
    
    # 끼니별 추천 결과 초기화
    meal_recommendations = {
        'breakfast': [],
        'lunch': [],
        'dinner': []
    }
    
    # 점수 순으로 정렬
    sorted_df = df.sort_values('final_score', ascending=False)
    
    # 각 끼니별로 2-3개씩 추천
    for meal_time, keywords in meal_categories.items():
        # 해당 끼니에 적합한 음식 필터링
        meal_suitable = sorted_df[
            sorted_df['type'].str.contains('|'.join(keywords), case=False, na=False) |
            sorted_df['category'].str.contains('|'.join(keywords), case=False, na=False) |
            sorted_df['name'].str.contains('|'.join(keywords), case=False, na=False)
        ]
        
        # 끼니에 특화된 음식이 부족하면 전체에서 선택
        if len(meal_suitable) < 2:
            meal_suitable = sorted_df
        
        # 각 끼니별로 최대 3개 추천
        target_count = 3
        selected_foods = meal_suitable.head(target_count)
        
        for _, row in selected_foods.iterrows():
            # 이미 다른 끼니에 추가된 음식은 제외
            food_name = row['name']
            already_added = any(
                food_name in [food['name'] for food in meals] 
                for meals in meal_recommendations.values()
            )
            
            if not already_added and len(meal_recommendations[meal_time]) < target_count:
                # 추천 이유 생성
                match_reason = generate_match_reason(row)
                
                recommendation = {
                    'name': row['name'],
                    'brand': row.get('brand', ''),
                    'calories': int(row['calories']),
                    'protein': float(row['protein']),
                    'carbs': float(row.get('carbs', 0)),
                    'fat': float(row.get('fat', 0)),
                    'price': int(row['price']),
                    'tags': row.get('tags', []),
                    'score': round(float(row['final_score']), 2),
                    'match_reason': match_reason,
                    'type': row.get('type', ''),
                    'category': row.get('category', ''),
                    'meal_time': meal_time  # 끼니 정보 추가
                }
                
                meal_recommendations[meal_time].append(recommendation)
    
    # 끼니별 최소 2개씩 보장 (전체 데이터에서 추가 선택)
    for meal_time in meal_recommendations:
        while len(meal_recommendations[meal_time]) < 2 and len(sorted_df) > 0:
            # 아직 선택되지 않은 음식 중에서 추가
            for _, row in sorted_df.iterrows():
                food_name = row['name']
                already_added = any(
                    food_name in [food['name'] for food in meals] 
                    for meals in meal_recommendations.values()
                )
                
                if not already_added:
                    match_reason = generate_match_reason(row)
                    
                    recommendation = {
                        'name': row['name'],
                        'brand': row.get('brand', ''),
                        'calories': int(row['calories']),
                        'protein': float(row['protein']),
                        'carbs': float(row.get('carbs', 0)),
                        'fat': float(row.get('fat', 0)),
                        'price': int(row['price']),
                        'tags': row.get('tags', []),
                        'score': round(float(row['final_score']), 2),
                        'match_reason': match_reason,
                        'type': row.get('type', ''),
                        'category': row.get('category', ''),
                        'meal_time': meal_time
                    }
                    
                    meal_recommendations[meal_time].append(recommendation)
                    break
            
            # 무한 루프 방지
            if len(meal_recommendations[meal_time]) >= len(sorted_df):
                break
    
    return meal_recommendations


def generate_final_recommendations(df: pd.DataFrame, limit: int = 8) -> List[Dict[str, Any]]:
    """최종 추천 리스트 생성 (하위 호환성 유지)"""
    
    # 점수 순으로 정렬
    sorted_df = df.sort_values('final_score', ascending=False).head(limit)
    
    recommendations = []
    
    for _, row in sorted_df.iterrows():
        # 추천 이유 생성
        match_reason = generate_match_reason(row)
        
        recommendation = {
            'name': row['name'],
            'brand': row.get('brand', ''),
            'calories': int(row['calories']),
            'protein': float(row['protein']),
            'price': int(row['price']),
            'tags': row.get('tags', []),
            'score': round(float(row['final_score']), 2),
            'match_reason': match_reason,
            'type': row.get('type', ''),
            'category': row.get('category', '')
        }
        
        recommendations.append(recommendation)
    
    return recommendations


def generate_match_reason(row: pd.Series) -> str:
    """추천 이유 생성"""
    
    reasons = []
    
    # 영양적 특징
    if row['protein'] >= 25:
        reasons.append("고단백")
    if row['calories'] <= 400:
        reasons.append("저칼로리")
    if row['sodium'] <= 800:
        reasons.append("저염식")
    
    # 태그 기반 특징
    tags = row.get('tags', [])
    if isinstance(tags, list):
        for tag in tags:
            if tag in ['체중감량', '다이어트', '고단백', '저염식']:
                if tag not in reasons:
                    reasons.append(tag)
    
    # 브랜드/타입 정보
    if row.get('type') in ['도시락', '간편식']:
        reasons.append("간편함")
    
    if not reasons:
        reasons = ["균형잡힌 영양"]
    
    return " + ".join(reasons[:3])  # 최대 3개 이유