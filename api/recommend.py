"""
새로운 정제 데이터셋 기반 한국 음식 추천 시스템
"""

import json
import pandas as pd
import numpy as np
import os
from typing import Dict, List, Any
from settings import (
    MEDICAL_CONDITIONS, DIETARY_RESTRICTIONS, 
    DISEASE_RESTRICTIONS, DIET_RESTRICTIONS_RULES
)

class KoreanFoodRecommender:
    """새로운 정제 데이터 기반 AI 추천 시스템"""
    
    def __init__(self):
        """추천 시스템 초기화"""
        self.food_data = None
        self.load_food_data()
    
    def load_food_data(self):
        """오직 /data/정제 데이터.json 파일만 사용하는 고정된 로더"""
        try:
            # 고정된 단일 경로만 사용
            file_path = 'data/정제 데이터.json'
            
            with open(file_path, 'r', encoding='utf-8') as f:
                food_list = json.load(f)
            
            self.food_data = pd.DataFrame(food_list)
            print(f"🍲 Streamlit 추천 엔진: /data/정제 데이터.json 로드 성공 ({len(food_list)}개 음식)")
            
            # 필수 컬럼 확인
            required_columns = ['id', 'name', 'calories', 'price', 'tags', 'allergies']
            missing_columns = [col for col in required_columns if col not in self.food_data.columns]
            if missing_columns:
                raise KeyError(f"필수 컬럼이 누락되었습니다: {missing_columns}")
            
            # 데이터 타입 변환
            numeric_columns = ['calories', 'price', 'protein', 'fat', 'carbs', 'score', 'rating']
            for col in numeric_columns:
                if col in self.food_data.columns:
                    self.food_data[col] = pd.to_numeric(self.food_data[col], errors='coerce')
                    self.food_data[col].fillna(0, inplace=True)
            
            print(f"✅ 정제 데이터 로드 완료: {len(self.food_data)}개 항목")
            
        except Exception as e:
            print(f"❌ 데이터 로드 실패: {e}")
            self.food_data = self._create_fallback_data()
    
    def _create_fallback_data(self):
        """데이터 로드 실패 시 최소한의 대체 데이터"""
        return pd.DataFrame([
            {
                'id': 'fallback-1',
                'name': '기본 한식 정식',
                'type': '도시락',
                'category': '곡류 및 밥',
                'calories': 600,
                'protein': 25,
                'fat': 15,
                'carbs': 80,
                'price': 8000,
                'tags': ['일반식'],
                'allergies': [],
                'score': 0.8,
                'rating': 4.0
            }
        ])
    
    def filter_by_allergies(self, user_allergies: List[str]) -> pd.DataFrame:
        """알레르기 필터링"""
        if not user_allergies or self.food_data is None:
            return self.food_data.copy()
        
        try:
            def has_allergy_conflict(food_allergies):
                if not isinstance(food_allergies, list):
                    return False
                return any(allergy in user_allergies for allergy in food_allergies)
            
            filtered_data = self.food_data[
                ~self.food_data['allergies'].apply(has_allergy_conflict)
            ]
            
            return filtered_data if not filtered_data.empty else self.food_data.copy()
            
        except Exception as e:
            print(f"❌ 알레르기 필터링 오류: {e}")
            return self.food_data.copy()
    
    def filter_by_budget(self, data: pd.DataFrame, max_budget: int) -> pd.DataFrame:
        """예산 필터링"""
        try:
            if data is None or data.empty:
                return data
            
            budget_filtered = data[data['price'] <= max_budget]
            return budget_filtered if not budget_filtered.empty else data.copy()
            
        except Exception as e:
            print(f"❌ 예산 필터링 오류: {e}")
            return data.copy()
    
    def filter_by_health_goal(self, data: pd.DataFrame, goal: str) -> pd.DataFrame:
        """건강 목표에 따른 필터링"""
        try:
            if data is None or data.empty:
                return data
            
            def matches_goal(tags):
                if not isinstance(tags, list):
                    return True
                
                if goal == '체중감량':
                    return any(tag in tags for tag in ['체중감량', '다이어트', '저염식', '키토'])
                elif goal == '근육증가':
                    return any(tag in tags for tag in ['고단백', '근육증가'])
                else:  # 체중유지
                    return any(tag in tags for tag in ['일반식', '체중감량', '고단백'])
            
            goal_filtered = data[data['tags'].apply(matches_goal)]
            return goal_filtered if not goal_filtered.empty else data.copy()
            
        except Exception as e:
            print(f"❌ 건강 목표 필터링 오류: {e}")
            return data.copy()

    def filter_by_medical_conditions(self, data: pd.DataFrame, conditions: List[str]) -> pd.DataFrame:
        """의학적 조건에 따른 필터링"""
        try:
            if data is None or data.empty or not conditions or "없음" in conditions:
                return data
            
            filtered_data = data.copy()
            
            for condition in conditions:
                if condition in DISEASE_RESTRICTIONS:
                    restrictions = DISEASE_RESTRICTIONS[condition]
                    
                    # 금지 태그가 있는 음식 제외
                    if 'forbidden_tags' in restrictions and 'tags' in filtered_data.columns:
                        forbidden_tags = restrictions['forbidden_tags']
                        
                        def has_forbidden_tag(tags):
                            if not isinstance(tags, list):
                                return False
                            return any(forbidden_tag in tags for forbidden_tag in forbidden_tags)
                        
                        filtered_data = filtered_data[~filtered_data['tags'].apply(has_forbidden_tag)]
                    
                    # 권장 태그가 있는 음식 우선순위 부여
                    if 'recommended_tags' in restrictions and 'tags' in filtered_data.columns:
                        recommended_tags = restrictions['recommended_tags']
                        
                        def has_recommended_tag(tags):
                            if not isinstance(tags, list):
                                return False
                            return any(rec_tag in tags for rec_tag in recommended_tags)
                        
                        # 권장 음식을 앞쪽으로 정렬
                        recommended_foods = filtered_data[filtered_data['tags'].apply(has_recommended_tag)]
                        other_foods = filtered_data[~filtered_data['tags'].apply(has_recommended_tag)]
                        filtered_data = pd.concat([recommended_foods, other_foods], ignore_index=True)
            
            return filtered_data if not filtered_data.empty else data.copy()
            
        except Exception as e:
            print(f"❌ 의학적 조건 필터링 오류: {e}")
            return data.copy()

    def filter_by_dietary_restrictions(self, data: pd.DataFrame, restrictions: List[str]) -> pd.DataFrame:
        """식단 제한에 따른 필터링"""
        try:
            if data is None or data.empty or not restrictions or "없음" in restrictions:
                return data
            
            filtered_data = data.copy()
            
            for restriction in restrictions:
                if restriction in DIET_RESTRICTIONS_RULES:
                    rules = DIET_RESTRICTIONS_RULES[restriction]
                    
                    # 금지 태그가 있는 음식 제외
                    if 'forbidden_tags' in rules and 'tags' in filtered_data.columns:
                        forbidden_tags = rules['forbidden_tags']
                        
                        def has_forbidden_tag(tags):
                            if not isinstance(tags, list):
                                return False
                            return any(forbidden_tag in tags for forbidden_tag in forbidden_tags)
                        
                        filtered_data = filtered_data[~filtered_data['tags'].apply(has_forbidden_tag)]
                    
                    # 허용 태그만 포함하는 음식으로 제한 (더 엄격한 필터링)
                    if 'allowed_tags' in rules and 'tags' in filtered_data.columns:
                        allowed_tags = rules['allowed_tags']
                        
                        def has_allowed_tag(tags):
                            if not isinstance(tags, list):
                                return False
                            return any(allowed_tag in tags for allowed_tag in allowed_tags)
                        
                        allowed_foods = filtered_data[filtered_data['tags'].apply(has_allowed_tag)]
                        if not allowed_foods.empty:
                            filtered_data = allowed_foods
            
            return filtered_data if not filtered_data.empty else data.copy()
            
        except Exception as e:
            print(f"❌ 식단 제한 필터링 오류: {e}")
            return data.copy()
    
    def calculate_nutrition_score(self, data: pd.DataFrame, user_profile: Dict) -> pd.DataFrame:
        """영양 점수 계산"""
        try:
            if data is None or data.empty:
                return data
            
            data_copy = data.copy()
            
            # 기본 BMR 계산
            weight = user_profile.get('weight', 70)
            height = user_profile.get('height', 170)
            age = user_profile.get('age', 25)
            gender = user_profile.get('gender', '남성')
            
            if gender == '남성':
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            else:
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
            
            # 활동 수준에 따른 칼로리 조정
            activity_level = user_profile.get('activity_level', '보통')
            activity_multiplier = {'낮음': 1.2, '보통': 1.55, '높음': 1.9}
            target_calories = bmr * activity_multiplier.get(activity_level, 1.55)
            
            # 목표에 따른 칼로리 조정
            goal = user_profile.get('health_goal', '체중유지')
            if goal == '체중감량':
                target_calories *= 0.8
            elif goal == '근육증가':
                target_calories *= 1.1
            
            # 식사 횟수로 나누기 (기본 3끼)
            meal_calories = target_calories / 3
            
            # 칼로리 점수 계산 (목표 칼로리와의 차이)
            data_copy['calorie_score'] = 1 - abs(data_copy['calories'] - meal_calories) / meal_calories
            data_copy['calorie_score'] = data_copy['calorie_score'].clip(0, 1)
            
            # 기존 점수와 결합
            if 'score' in data_copy.columns:
                data_copy['final_score'] = (data_copy['score'] * 0.7) + (data_copy['calorie_score'] * 0.3)
            else:
                data_copy['final_score'] = data_copy['calorie_score']
            
            return data_copy
            
        except Exception as e:
            print(f"❌ 영양 점수 계산 오류: {e}")
            return data.copy()
    
    def recommend_meals(self, user_profile: Dict[str, Any], num_recommendations: int = 5) -> List[Dict]:
        """맞춤 식단 추천"""
        try:
            if self.food_data is None or self.food_data.empty:
                return []
            
            # 1. 알레르기 필터링
            filtered_data = self.filter_by_allergies(user_profile.get('allergies', []))
            
            # 2. 예산 필터링
            budget = user_profile.get('budget_per_meal', 10000)
            filtered_data = self.filter_by_budget(filtered_data, budget)
            
            # 3. 의학적 조건 필터링
            medical_conditions = user_profile.get('medical_conditions', [])
            filtered_data = self.filter_by_medical_conditions(filtered_data, medical_conditions)
            
            # 4. 식단 제한 필터링
            dietary_restrictions = user_profile.get('dietary_restrictions', [])
            filtered_data = self.filter_by_dietary_restrictions(filtered_data, dietary_restrictions)
            
            # 5. 건강 목표 필터링
            goal = user_profile.get('health_goal', '체중유지')
            filtered_data = self.filter_by_health_goal(filtered_data, goal)
            
            # 6. 영양 점수 계산
            scored_data = self.calculate_nutrition_score(filtered_data, user_profile)
            
            # 5. 점수 순으로 정렬 및 상위 추천
            if 'final_score' in scored_data.columns:
                top_foods = scored_data.nlargest(num_recommendations, 'final_score')
            else:
                top_foods = scored_data.head(num_recommendations)
            
            # 6. 결과를 딕셔너리 리스트로 변환
            recommendations = []
            for _, food in top_foods.iterrows():
                rec = {
                    'id': food.get('id', ''),
                    'name': food.get('name', ''),
                    'calories': food.get('calories', 0),
                    'price': food.get('price', 0),
                    'protein': food.get('protein', 0),
                    'category': food.get('category', ''),
                    'tags': food.get('tags', []),
                    'nutrition_score': food.get('final_score', 0),
                    'rating': food.get('rating', 0)
                }
                recommendations.append(rec)
            
            return recommendations
            
        except Exception as e:
            print(f"❌ 추천 생성 오류: {e}")
            return []
    
    def get_nutrition_summary(self, recommendations: List[Dict], user_profile: Dict) -> Dict:
        """영양 요약 정보 계산"""
        try:
            if not recommendations:
                return {'total_calories': 0, 'average_price': 0, 'avg_nutrition_score': 0}
            
            total_calories = sum(rec.get('calories', 0) for rec in recommendations)
            total_price = sum(rec.get('price', 0) for rec in recommendations)
            avg_score = sum(rec.get('nutrition_score', 0) for rec in recommendations) / len(recommendations)
            
            return {
                'total_calories': total_calories,
                'average_price': total_price / len(recommendations),
                'avg_nutrition_score': avg_score,
                'recommendations_count': len(recommendations)
            }
            
        except Exception as e:
            print(f"❌ 영양 요약 계산 오류: {e}")
            return {'total_calories': 0, 'average_price': 0, 'avg_nutrition_score': 0}