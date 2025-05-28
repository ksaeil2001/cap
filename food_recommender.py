import json
import pandas as pd
import numpy as np
from typing import Dict, List, Any
import streamlit as st

class KoreanFoodRecommender:
    """한국 음식 데이터 기반 AI 추천 시스템"""
    
    def __init__(self):
        """추천 시스템 초기화"""
        self.food_data = None
        self.load_food_data()
    
    def load_food_data(self):
        """한국 음식 데이터 로드 (강화된 예외 처리)"""
        try:
            # 파일 존재 여부 확인
            file_path = 'attached_assets/food_items_part_1.json'
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"음식 데이터 파일을 찾을 수 없습니다: {file_path}")
            
            # JSON 파일 로드
            with open(file_path, 'r', encoding='utf-8') as f:
                food_list = json.load(f)
            
            # 데이터 유효성 검사
            if not food_list or not isinstance(food_list, list):
                raise ValueError("음식 데이터가 비어있거나 올바른 형식이 아닙니다.")
            
            # DataFrame으로 변환
            self.food_data = pd.DataFrame(food_list)
            
            # 필수 컬럼 확인
            required_columns = ['name', 'calories']
            missing_columns = [col for col in required_columns if col not in self.food_data.columns]
            if missing_columns:
                print(f"⚠️ 필수 컬럼이 누락되었습니다: {missing_columns}")
            
            # 가격 정보가 없는 경우 칼로리 기반으로 추정
            if 'price' not in self.food_data.columns:
                try:
                    self.food_data['price'] = self.estimate_price_from_calories()
                except Exception as price_error:
                    print(f"⚠️ 가격 추정 실패: {price_error}")
                    # 기본 가격 설정
                    self.food_data['price'] = 5000
            
            # 결측값 처리
            self.food_data = self.food_data.fillna(0)
            
            # 데이터 유효성 최종 확인
            if len(self.food_data) == 0:
                raise ValueError("로드된 음식 데이터가 비어있습니다.")
            
            print(f"✅ 총 {len(self.food_data)}개의 한국 음식 데이터를 성공적으로 로드했습니다.")
            
        except FileNotFoundError as e:
            print(f"❌ 파일 오류: {e}")
            self.food_data = self._create_sample_data()
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON 파싱 오류: {e}")
            self.food_data = self._create_sample_data()
            
        except Exception as e:
            print(f"❌ 예상치 못한 오류: {e}")
            self.food_data = self._create_sample_data()
    
    def _create_sample_data(self):
        """테스트용 샘플 데이터 생성"""
        sample_foods = [
            {
                'id': 'sample_1',
                'name': '김치찌개',
                'category': '국물류',
                'calories': 150,
                'protein': 8.5,
                'fat': 5.2,
                'carbs': 18.3,
                'sodium': 950,
                'price': 8000
            },
            {
                'id': 'sample_2', 
                'name': '닭가슴살 샐러드',
                'category': '샐러드',
                'calories': 180,
                'protein': 25.0,
                'fat': 3.5,
                'carbs': 12.0,
                'sodium': 420,
                'price': 12000
            },
            {
                'id': 'sample_3',
                'name': '현미밥',
                'category': '주식',
                'calories': 220,
                'protein': 4.5,
                'fat': 1.8,
                'carbs': 45.0,
                'sodium': 5,
                'price': 3000
            }
        ]
        
        print("⚠️ 원본 데이터 로드 실패로 테스트용 샘플 데이터를 사용합니다.")
        return pd.DataFrame(sample_foods)
    
    def estimate_price_from_calories(self):
        """칼로리 기반 가격 추정 (원 단위)"""
        # 한국 음식의 일반적인 가격 범위를 고려한 추정
        base_prices = []
        for _, food in self.food_data.iterrows():
            calories = food.get('calories', 200)
            category = food.get('category', '기타')
            
            # 카테고리별 기본 가격 설정
            if '외식' in str(category) or '버거' in str(food.get('name', '')):
                base_price = 8000 + (calories * 15)  # 외식 음식
            elif '밥류' in str(category) or '면류' in str(category):
                base_price = 3000 + (calories * 8)   # 주식류
            elif '반찬' in str(category) or '나물' in str(category):
                base_price = 2000 + (calories * 5)   # 반찬류
            else:
                base_price = 4000 + (calories * 10)  # 기타
            
            # 가격 범위 조정 (1,000원 ~ 25,000원)
            price = max(1000, min(25000, int(base_price)))
            base_prices.append(price)
        
        return base_prices
    
    def filter_by_allergies(self, user_allergies: List[str]) -> pd.DataFrame:
        """알레르기 필터링"""
        if not user_allergies or self.food_data.empty:
            return self.food_data
        
        filtered_data = self.food_data.copy()
        
        # 음식명과 카테고리에서 알레르기 유발 요소 확인
        for allergy in user_allergies:
            # 간단한 키워드 매칭으로 필터링
            allergy_keywords = {
                '계란': ['계란', '달걀', '에그'],
                '유제품': ['우유', '치즈', '버터', '크림', '요구르트'],
                '견과류': ['견과', '땅콩', '호두', '아몬드'],
                '갑각류': ['새우', '게', '랍스터', '가재'],
                '생선': ['생선', '어류', '참치', '연어', '고등어'],
                '대두': ['콩', '두부', '된장', '간장'],
                '밀': ['밀', '밀가루', '빵', '면', '파스타'],
            }
            
            keywords = allergy_keywords.get(allergy, [allergy])
            for keyword in keywords:
                filtered_data = filtered_data[
                    ~filtered_data['name'].str.contains(keyword, case=False, na=False)
                ]
        
        return filtered_data
    
    def filter_by_budget(self, data: pd.DataFrame, max_budget: int) -> pd.DataFrame:
        """예산 필터링"""
        if data.empty:
            return data
        return data[data['price'] <= max_budget]
    
    def filter_by_preferences(self, data: pd.DataFrame, preferences: List[str]) -> pd.DataFrame:
        """식습관 선호도 필터링"""
        if not preferences or data.empty:
            return data
        
        filtered_data = data.copy()
        
        for pref in preferences:
            if pref == '채식':
                # 육류 제외
                filtered_data = filtered_data[
                    ~filtered_data['name'].str.contains('고기|닭|돼지|소|오리', case=False, na=False)
                ]
            elif pref == '저염식':
                # 나트륨 낮은 음식 선택
                if 'sodium' in filtered_data.columns:
                    median_sodium = filtered_data['sodium'].median()
                    filtered_data = filtered_data[filtered_data['sodium'] <= median_sodium]
            elif pref == '고단백':
                # 단백질 높은 음식 우선
                if 'protein' in filtered_data.columns:
                    median_protein = filtered_data['protein'].median()
                    filtered_data = filtered_data[filtered_data['protein'] >= median_protein]
        
        return filtered_data
    
    def calculate_nutrition_score(self, data: pd.DataFrame, target_calories: float, health_goal: str) -> pd.DataFrame:
        """영양 점수 계산"""
        if data.empty:
            return data
        
        scored_data = data.copy()
        
        # 칼로리 목표 대비 점수
        scored_data['calorie_score'] = 100 - abs(scored_data['calories'] - target_calories) / target_calories * 100
        scored_data['calorie_score'] = scored_data['calorie_score'].clip(0, 100)
        
        # 건강 목표별 점수 조정
        if health_goal == '체중 감량':
            # 저칼로리, 고단백, 고섬유질 우선
            scored_data['goal_score'] = (
                (100 - scored_data['calories'] / 500 * 100).clip(0, 100) * 0.4 +
                (scored_data['protein'] / 30 * 100).clip(0, 100) * 0.3 +
                (scored_data['fiber'] / 10 * 100).clip(0, 100) * 0.3
            )
        elif health_goal == '근육 증가':
            # 고단백, 적정 칼로리 우선
            scored_data['goal_score'] = (
                scored_data['calorie_score'] * 0.4 +
                (scored_data['protein'] / 40 * 100).clip(0, 100) * 0.6
            )
        else:  # 체중 유지
            # 균형 잡힌 영양소 우선
            scored_data['goal_score'] = scored_data['calorie_score']
        
        # 최종 점수 계산
        scored_data['total_score'] = (
            scored_data['calorie_score'] * 0.4 +
            scored_data['goal_score'] * 0.6
        )
        
        return scored_data.sort_values('total_score', ascending=False)
    
    def recommend_meals(self, user_profile: Dict[str, Any], num_recommendations: int = 10) -> List[Dict]:
        """맞춤 식단 추천"""
        if self.food_data.empty:
            return []
        
        # 기본 정보 추출
        height = user_profile.get('height', 170)
        weight = user_profile.get('weight', 70)
        age = user_profile.get('age', 30)
        gender = user_profile.get('gender', '남성')
        health_goal = user_profile.get('health_goal', '체중 유지')
        budget = user_profile.get('budget_per_meal', 10000)
        allergies = user_profile.get('allergies', [])
        preferences = user_profile.get('preferences', [])
        
        # 목표 칼로리 계산
        if gender == '남성':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        tdee = bmr * 1.55  # 보통 활동량 가정
        
        if health_goal == '체중 감량':
            target_calories = (tdee - 300) / 3  # 3끼 기준
        elif health_goal == '근육 증가':
            target_calories = (tdee + 200) / 3
        else:
            target_calories = tdee / 3
        
        # 필터링 단계별 적용
        filtered_data = self.food_data.copy()
        
        # 1. 알레르기 필터링
        filtered_data = self.filter_by_allergies(allergies)
        
        # 2. 예산 필터링  
        filtered_data = self.filter_by_budget(filtered_data, budget)
        
        # 3. 선호도 필터링
        filtered_data = self.filter_by_preferences(filtered_data, preferences)
        
        # 4. 영양 점수 계산 및 정렬
        if not filtered_data.empty:
            scored_data = self.calculate_nutrition_score(filtered_data, target_calories, health_goal)
            
            # 상위 추천 음식 선택
            recommendations = scored_data.head(num_recommendations).to_dict('records')
            
            return recommendations
        
        return []
    
    def get_nutrition_summary(self, recommended_foods: List[Dict], user_profile: Dict) -> Dict:
        """영양 요약 정보 계산"""
        if not recommended_foods:
            return {}
        
        total_calories = sum(food.get('calories', 0) for food in recommended_foods)
        total_protein = sum(food.get('protein', 0) for food in recommended_foods)
        total_carbs = sum(food.get('carbs', 0) for food in recommended_foods)
        total_fat = sum(food.get('fat', 0) for food in recommended_foods)
        total_cost = sum(food.get('price', 0) for food in recommended_foods)
        
        # 목표 영양소 계산
        height = user_profile.get('height', 170)
        weight = user_profile.get('weight', 70)
        age = user_profile.get('age', 30)
        gender = user_profile.get('gender', '남성')
        health_goal = user_profile.get('health_goal', '체중 유지')
        
        if gender == '남성':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        tdee = bmr * 1.55
        
        if health_goal == '체중 감량':
            target_calories = tdee - 300
            target_protein = weight * 1.2
        elif health_goal == '근육 증가':
            target_calories = tdee + 200
            target_protein = weight * 1.6
        else:
            target_calories = tdee
            target_protein = weight * 1.0
        
        return {
            'total_calories': total_calories,
            'target_calories': target_calories,
            'total_protein': total_protein,
            'target_protein': target_protein,
            'total_carbs': total_carbs,
            'total_fat': total_fat,
            'total_cost': total_cost,
            'budget': user_profile.get('budget_per_meal', 10000) * 3,  # 하루 예산
            'calorie_percentage': (total_calories / target_calories * 100) if target_calories > 0 else 0,
            'protein_percentage': (total_protein / target_protein * 100) if target_protein > 0 else 0,
        }