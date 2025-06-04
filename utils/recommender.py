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
    """끼니별 추천 리스트 생성 - 개선된 버전"""
    
    import random
    
    # 실제 데이터 기반 끼니별 분류 기준 정의
    meal_categories = {
        'breakfast': {
            'types': ['샌드위치', '삼각김밥'],  # 간편한 아침 메뉴
            'keywords': ['아침', '샌드위치', '토스트', '간편'],
            'avoid_types': ['볶음밥', '초밥'],  # 아침에 부적합한 메뉴
            'fallback_types': ['김밥', '롤/김밥']  # 부족할 때 사용
        },
        'lunch': {
            'types': ['도시락', '볶음밥', '김밥', '롤/김밥'],  # 점심 메인 메뉴
            'keywords': ['점심', '밥', '덮밥', '정식', '볶음'],
            'avoid_types': ['샐러드', '스낵'],  # 점심에 부족한 메뉴
            'fallback_types': ['삼각김밥', '냉동식품']
        },
        'dinner': {
            'types': ['초밥', '샐러드', '냉동식품'],  # 저녁 메뉴
            'keywords': ['저녁', '초밥', '샐러드', '냉동'],
            'avoid_types': ['삼각김밥', '스낵'],  # 저녁에 부적합한 메뉴
            'fallback_types': ['도시락', '김밥']
        }
    }
    
    # 끼니별 추천 결과 초기화
    meal_recommendations = {
        'breakfast': [],
        'lunch': [],
        'dinner': []
    }
    
    # 점수 순으로 정렬
    sorted_df = df.sort_values('final_score', ascending=False).reset_index(drop=True)
    used_foods = set()  # 이미 사용된 음식 추적
    
    # 각 끼니별로 순차적으로 추천
    for meal_time, criteria in meal_categories.items():
        keywords = criteria['keywords']
        types = criteria['types']
        avoid_types = criteria['avoid_types']
        fallback_types = criteria['fallback_types']
        
        # 1단계: 끼니별 특화 음식 필터링
        # 우선 조건: 해당 끼니 타입에 맞는 음식
        primary_suitable = sorted_df[
            (sorted_df['type'].isin(types) |
             sorted_df['name'].str.contains('|'.join(keywords), case=False, na=False)) &
            (~sorted_df['type'].isin(avoid_types))
        ].copy()
        
        # 이미 사용된 음식 제외
        primary_suitable = primary_suitable[~primary_suitable['name'].isin(used_foods)]
        
        print(f"🍽️ {meal_time}: 우선 적합한 음식 {len(primary_suitable)}개 발견")
        print(f"   🔄 현재 used_foods: {list(used_foods)}")
        if len(primary_suitable) > 0:
            print(f"   📋 후보 예시: {primary_suitable['name'].head(3).tolist()}")
            print(f"   🏷️ 타입 분포: {primary_suitable['type'].value_counts().head(3).to_dict()}")
        
        # 2단계: 우선 후보가 부족하면 fallback 타입 추가
        if len(primary_suitable) < 3:
            fallback_suitable = sorted_df[
                (sorted_df['type'].isin(fallback_types)) &
                (~sorted_df['type'].isin(avoid_types)) &
                (~sorted_df['name'].isin(used_foods))
            ].copy()
            
            # 우선 후보와 fallback 후보 결합
            meal_suitable = pd.concat([primary_suitable, fallback_suitable]).drop_duplicates().reset_index(drop=True)
            print(f"⚠️ {meal_time}: fallback 추가 후 {len(meal_suitable)}개 후보")
        else:
            meal_suitable = primary_suitable
        
        # 3단계: 다양성을 위한 랜덤 샘플링
        target_count = 3
        if len(meal_suitable) >= target_count:
            # 상위 점수 음식들 중에서 랜덤하게 선택 (다양성 확보)
            top_candidates = meal_suitable.head(min(8, len(meal_suitable)))  # 상위 8개 중에서
            if len(top_candidates) >= target_count:
                selected_indices = random.sample(range(len(top_candidates)), target_count)
                selected_foods = top_candidates.iloc[selected_indices]
            else:
                selected_foods = top_candidates
        else:
            # 그래도 부족하면 전체에서 선택 (피해야 할 타입만 제외)
            available_foods = sorted_df[
                (~sorted_df['type'].isin(avoid_types)) &
                (~sorted_df['name'].isin(used_foods))
            ]
            if len(available_foods) >= target_count:
                selected_foods = available_foods.head(target_count)
            else:
                selected_foods = available_foods
            
            print(f"⚠️ {meal_time}: 최종 보완 후 {len(selected_foods)}개 선택")
        
        # 4단계: 추천 객체 생성
        for _, row in selected_foods.iterrows():
            food_name = row['name']
            if food_name not in used_foods:
                # 추천 이유 생성
                match_reason = generate_match_reason(row)
                
                recommendation = {
                    'name': food_name,
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
                used_foods.add(food_name)  # 사용된 음식으로 표시
                
                print(f"   ✅ {meal_time} 추가: {food_name} (타입: {row.get('type', '')})")
                
                # 목표 개수 달성 시 중단
                if len(meal_recommendations[meal_time]) >= target_count:
                    break
    
    # 4단계: 끼니별 최소 2개씩 보장
    for meal_time in meal_recommendations:
        while len(meal_recommendations[meal_time]) < 2:
            # 아직 사용되지 않은 음식 중에서 추가
            available_foods = sorted_df[~sorted_df['name'].isin(used_foods)]
            
            if len(available_foods) == 0:
                print(f"⚠️ {meal_time}: 더 이상 추가할 음식이 없습니다.")
                break
                
            # 랜덤하게 하나 선택
            selected_row = available_foods.iloc[0]  # 점수가 가장 높은 것
            food_name = selected_row['name']
            
            match_reason = generate_match_reason(selected_row)
            
            recommendation = {
                'name': food_name,
                'brand': selected_row.get('brand', ''),
                'calories': int(selected_row['calories']),
                'protein': float(selected_row['protein']),
                'carbs': float(selected_row.get('carbs', 0)),
                'fat': float(selected_row.get('fat', 0)),
                'price': int(selected_row['price']),
                'tags': selected_row.get('tags', []),
                'score': round(float(selected_row['final_score']), 2),
                'match_reason': match_reason,
                'type': selected_row.get('type', ''),
                'category': selected_row.get('category', ''),
                'meal_time': meal_time
            }
            
            meal_recommendations[meal_time].append(recommendation)
            used_foods.add(food_name)
    
    # 최종 결과 요약 출력
    print("\n🎯 끼니별 추천 결과 요약:")
    for meal_time, foods in meal_recommendations.items():
        print(f"   {meal_time}: {len(foods)}개")
        for food in foods:
            print(f"     - {food['name']} (타입: {food['type']})")
    
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