"""
식단 계획 시각화 모듈
"""

import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
from typing import List, Dict, Any
import streamlit as st

class MealPlanVisualizer:
    """개인화된 식단 계획 시각화 클래스"""
    
    def __init__(self):
        """시각화 설정 초기화"""
        self.colors = {
            'primary': '#FF6B6B',
            'secondary': '#4ECDC4', 
            'accent': '#45B7D1',
            'success': '#96CEB4',
            'warning': '#FECA57',
            'info': '#6C5CE7'
        }
    
    def create_meal_timeline(self, recommendations: List[Dict], user_profile: Dict) -> go.Figure:
        """하루 식단 타임라인 차트 생성"""
        try:
            # 식사 시간대 설정
            meal_times = ['아침 (07:00)', '점심 (12:00)', '저녁 (18:00)']
            
            # 추천된 음식들을 식사 시간대에 배정
            meals_by_time = []
            calories_by_time = []
            prices_by_time = []
            
            for i, meal_time in enumerate(meal_times):
                if i < len(recommendations):
                    meal = recommendations[i]
                    meals_by_time.append(meal.get('name', '추천 음식'))
                    calories_by_time.append(meal.get('calories', 0))
                    prices_by_time.append(meal.get('price', 0))
                else:
                    meals_by_time.append('추가 추천 필요')
                    calories_by_time.append(0)
                    prices_by_time.append(0)
            
            # 서브플롯 생성
            fig = make_subplots(
                rows=2, cols=1,
                subplot_titles=('칼로리 분포', '예산 사용'),
                specs=[[{"secondary_y": False}], [{"secondary_y": False}]]
            )
            
            # 칼로리 바 차트
            fig.add_trace(
                go.Bar(
                    x=meal_times,
                    y=calories_by_time,
                    name='칼로리',
                    marker_color=self.colors['primary'],
                    text=[f"{cal}kcal<br>{meal}" for cal, meal in zip(calories_by_time, meals_by_time)],
                    textposition='auto',
                ),
                row=1, col=1
            )
            
            # 예산 바 차트
            fig.add_trace(
                go.Bar(
                    x=meal_times,
                    y=prices_by_time,
                    name='가격',
                    marker_color=self.colors['secondary'],
                    text=[f"{price:,}원" for price in prices_by_time],
                    textposition='auto',
                ),
                row=2, col=1
            )
            
            # 레이아웃 설정
            fig.update_layout(
                title=f"🍽️ {user_profile.get('gender', '')} {user_profile.get('age', '')}세님의 하루 식단 계획",
                showlegend=False,
                height=600,
                font=dict(family="Arial, sans-serif", size=12)
            )
            
            fig.update_xaxes(title_text="식사 시간", row=2, col=1)
            fig.update_yaxes(title_text="칼로리 (kcal)", row=1, col=1)
            fig.update_yaxes(title_text="가격 (원)", row=2, col=1)
            
            return fig
            
        except Exception as e:
            st.error(f"타임라인 차트 생성 중 오류: {e}")
            return None
    
    def create_nutrition_pie_chart(self, recommendations: List[Dict]) -> go.Figure:
        """영양소 분포 파이 차트 생성"""
        try:
            total_protein = sum(meal.get('protein', 0) for meal in recommendations)
            total_fat = sum(meal.get('fat', 0) for meal in recommendations)
            total_carbs = sum(meal.get('carbs', 0) for meal in recommendations)
            
            # 0인 경우 기본값 설정
            if total_protein + total_fat + total_carbs == 0:
                total_protein, total_fat, total_carbs = 1, 1, 1
            
            fig = go.Figure(data=[go.Pie(
                labels=['단백질', '지방', '탄수화물'],
                values=[total_protein, total_fat, total_carbs],
                hole=.3,
                marker_colors=[self.colors['success'], self.colors['warning'], self.colors['info']]
            )])
            
            fig.update_traces(textposition='inside', textinfo='percent+label')
            fig.update_layout(
                title="🔬 영양소 분포",
                font=dict(family="Arial, sans-serif", size=12),
                height=400
            )
            
            return fig
            
        except Exception as e:
            st.error(f"영양소 차트 생성 중 오류: {e}")
            return None
    
    def create_budget_gauge(self, recommendations: List[Dict], target_budget: float) -> go.Figure:
        """예산 사용률 게이지 차트 생성"""
        try:
            total_spent = sum(meal.get('price', 0) for meal in recommendations)
            usage_percentage = (total_spent / target_budget * 100) if target_budget > 0 else 0
            
            fig = go.Figure(go.Indicator(
                mode = "gauge+number+delta",
                value = usage_percentage,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "💰 예산 사용률 (%)"},
                delta = {'reference': 100},
                gauge = {
                    'axis': {'range': [None, 150]},
                    'bar': {'color': self.colors['primary']},
                    'steps': [
                        {'range': [0, 80], 'color': "lightgray"},
                        {'range': [80, 100], 'color': "gray"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 100
                    }
                }
            ))
            
            fig.update_layout(
                height=300,
                font=dict(family="Arial, sans-serif", size=12)
            )
            
            return fig
            
        except Exception as e:
            st.error(f"예산 게이지 생성 중 오류: {e}")
            return None
    
    def create_goal_progress_chart(self, recommendations: List[Dict], user_profile: Dict) -> go.Figure:
        """목표 달성률 차트 생성"""
        try:
            # 목표 칼로리 계산 (간단한 BMR 기반)
            weight = user_profile.get('weight', 70)
            height = user_profile.get('height', 170)
            age = user_profile.get('age', 25)
            gender = user_profile.get('gender', '남성')
            
            if gender == '남성':
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            else:
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
            
            activity_multiplier = {'낮음': 1.2, '보통': 1.55, '높음': 1.9}
            activity_level = user_profile.get('activity_level', '보통')
            target_calories = bmr * activity_multiplier.get(activity_level, 1.55)
            
            # 목표에 따른 조정
            goal = user_profile.get('health_goal', '체중유지')
            if goal == '체중감량':
                target_calories *= 0.8
            elif goal == '근육증가':
                target_calories *= 1.1
            
            # 실제 섭취 칼로리
            actual_calories = sum(meal.get('calories', 0) for meal in recommendations)
            
            # 진행률 계산
            progress_percentage = (actual_calories / target_calories * 100) if target_calories > 0 else 0
            
            # 막대 차트 생성
            fig = go.Figure()
            
            fig.add_trace(go.Bar(
                x=['목표 칼로리', '계획된 칼로리'],
                y=[target_calories, actual_calories],
                marker_color=[self.colors['accent'], self.colors['success']],
                text=[f"{target_calories:.0f}kcal", f"{actual_calories:.0f}kcal"],
                textposition='auto'
            ))
            
            fig.update_layout(
                title=f"🎯 {goal} 목표 달성률: {progress_percentage:.1f}%",
                yaxis_title="칼로리 (kcal)",
                height=400,
                font=dict(family="Arial, sans-serif", size=12)
            )
            
            return fig
            
        except Exception as e:
            st.error(f"목표 달성률 차트 생성 중 오류: {e}")
            return None
    
    def create_meal_category_distribution(self, recommendations: List[Dict]) -> go.Figure:
        """음식 카테고리 분포 차트"""
        try:
            # 카테고리별 개수 계산
            categories = {}
            for meal in recommendations:
                category = meal.get('category', '기타')
                categories[category] = categories.get(category, 0) + 1
            
            if not categories:
                categories = {'기타': 1}
            
            fig = go.Figure(data=[go.Bar(
                x=list(categories.keys()),
                y=list(categories.values()),
                marker_color=self.colors['info'],
                text=list(categories.values()),
                textposition='auto'
            )])
            
            fig.update_layout(
                title="🏷️ 음식 카테고리 분포",
                xaxis_title="카테고리",
                yaxis_title="개수",
                height=300,
                font=dict(family="Arial, sans-serif", size=12)
            )
            
            return fig
            
        except Exception as e:
            st.error(f"카테고리 분포 차트 생성 중 오류: {e}")
            return None
    
    def display_comprehensive_dashboard(self, recommendations: List[Dict], user_profile: Dict):
        """종합 대시보드 표시"""
        try:
            st.title("📊 개인화된 식단 계획 시각화")
            st.markdown("### 당신의 하루 식단을 한눈에 확인하세요!")
            
            if not recommendations:
                st.warning("표시할 추천 데이터가 없습니다.")
                return
            
            # 상단 요약 메트릭
            col1, col2, col3, col4 = st.columns(4)
            
            total_calories = sum(meal.get('calories', 0) for meal in recommendations)
            total_price = sum(meal.get('price', 0) for meal in recommendations)
            avg_score = sum(meal.get('nutrition_score', 0) for meal in recommendations) / len(recommendations)
            meal_count = len(recommendations)
            
            with col1:
                st.metric("총 칼로리", f"{total_calories}kcal")
            with col2:
                st.metric("총 예산", f"{total_price:,}원")
            with col3:
                st.metric("평균 영양점수", f"{avg_score:.2f}")
            with col4:
                st.metric("추천 음식", f"{meal_count}개")
            
            st.markdown("---")
            
            # 첫 번째 행: 타임라인과 영양소 분포
            col1, col2 = st.columns([2, 1])
            
            with col1:
                timeline_fig = self.create_meal_timeline(recommendations, user_profile)
                if timeline_fig:
                    st.plotly_chart(timeline_fig, use_container_width=True)
            
            with col2:
                nutrition_fig = self.create_nutrition_pie_chart(recommendations)
                if nutrition_fig:
                    st.plotly_chart(nutrition_fig, use_container_width=True)
            
            # 두 번째 행: 예산 게이지와 목표 달성률
            col1, col2 = st.columns(2)
            
            with col1:
                target_budget = user_profile.get('budget_per_meal', 8000) * 3  # 하루 예산
                budget_fig = self.create_budget_gauge(recommendations, target_budget)
                if budget_fig:
                    st.plotly_chart(budget_fig, use_container_width=True)
            
            with col2:
                goal_fig = self.create_goal_progress_chart(recommendations, user_profile)
                if goal_fig:
                    st.plotly_chart(goal_fig, use_container_width=True)
            
            # 세 번째 행: 카테고리 분포
            category_fig = self.create_meal_category_distribution(recommendations)
            if category_fig:
                st.plotly_chart(category_fig, use_container_width=True)
            
            # 인사이트 제공
            self._display_insights(recommendations, user_profile)
            
        except Exception as e:
            st.error(f"대시보드 표시 중 오류: {e}")
    
    def _display_insights(self, recommendations: List[Dict], user_profile: Dict):
        """개인화된 인사이트 제공"""
        try:
            st.markdown("---")
            st.subheader("💡 개인화된 인사이트")
            
            insights = []
            
            # 칼로리 분석
            total_calories = sum(meal.get('calories', 0) for meal in recommendations)
            if total_calories < 1200:
                insights.append("⚠️ 칼로리가 부족할 수 있습니다. 더 영양가 있는 음식을 추가해보세요.")
            elif total_calories > 2500:
                insights.append("⚠️ 칼로리가 높습니다. 양을 조절하거나 저칼로리 대안을 고려해보세요.")
            
            # 예산 분석
            total_price = sum(meal.get('price', 0) for meal in recommendations)
            target_budget = user_profile.get('budget_per_meal', 8000) * len(recommendations)
            if total_price > target_budget:
                insights.append("💰 예산을 초과했습니다. 더 경제적인 옵션을 찾아보세요.")
            else:
                savings = target_budget - total_price
                insights.append(f"💰 예산을 {savings:,}원 절약했습니다! 훌륭해요!")
            
            # 건강 목표 분석
            goal = user_profile.get('health_goal', '체중유지')
            if goal == '체중감량':
                high_cal_foods = [meal['name'] for meal in recommendations if meal.get('calories', 0) > 600]
                if high_cal_foods:
                    insights.append(f"🎯 체중감량 목표: {', '.join(high_cal_foods[:2])} 등은 칼로리가 높으니 주의하세요.")
            elif goal == '근육증가':
                total_protein = sum(meal.get('protein', 0) for meal in recommendations)
                if total_protein < 100:
                    insights.append("🎯 근육증가 목표: 단백질 섭취를 늘려보세요. 닭가슴살, 계란 등을 추가해보세요.")
            
            # 알레르기 확인
            user_allergies = user_profile.get('allergies', [])
            if user_allergies:
                insights.append(f"🚫 알레르기 주의: {', '.join(user_allergies)} 성분이 포함되지 않은 안전한 음식들로 추천되었습니다.")
            
            # 인사이트 표시
            for insight in insights:
                st.info(insight)
            
            if not insights:
                st.success("🎉 완벽한 식단 계획입니다! 모든 조건을 잘 만족합니다.")
                
        except Exception as e:
            st.error(f"인사이트 생성 중 오류: {e}")