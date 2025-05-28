"""
추천 결과 기반 영양소 요약 및 시각화 모듈
오직 정제된 한국 음식 데이터만 사용
"""

import json
import os
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from typing import List, Dict, Any
import streamlit as st

def calculate_nutrition_summary(recommended_foods: List[Dict[str, Any]], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    추천된 음식들의 영양소 합계 계산 및 목표 대비 달성률 분석
    
    Args:
        recommended_foods: 추천된 음식 리스트
        user_profile: 사용자 프로필 정보
        
    Returns:
        영양소 요약 딕셔너리
    """
    
    # 1️⃣ Step 1: 총 영양값 계산
    total_nutrition = {
        'calories': sum(food.get('calories', 0) for food in recommended_foods),
        'protein': sum(food.get('protein', 0) for food in recommended_foods),
        'fat': sum(food.get('fat', 0) for food in recommended_foods),
        'carbs': sum(food.get('carbs', 0) for food in recommended_foods),
        'sodium': sum(food.get('sodium', 0) for food in recommended_foods),
        'sugar': sum(food.get('sugar', 0) for food in recommended_foods),
        'fiber': sum(food.get('fiber', 0) for food in recommended_foods)
    }
    
    # 2️⃣ Step 2: 사용자 목표 기준 설정
    goal = user_profile.get('goal', '체중감량')
    age = user_profile.get('age', 25)
    weight = user_profile.get('weight', 70)
    height = user_profile.get('height', 170)
    gender = user_profile.get('gender', '남성')
    
    # BMR 계산 (Mifflin-St Jeor 공식)
    if gender == '남성':
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    
    # 활동 수준에 따른 TDEE 계산
    activity_multiplier = 1.5  # 중간 활동 수준 기본값
    tdee = bmr * activity_multiplier
    
    # 목표별 영양 기준 설정
    if goal == '체중감량':
        target_calories = tdee * 0.8  # 20% 칼로리 감소
        target_protein = weight * 1.2  # 체중 1kg당 1.2g
        target_fat = target_calories * 0.25 / 9  # 칼로리의 25%
        target_carbs = (target_calories - (target_protein * 4 + target_fat * 9)) / 4
    elif goal == '근육증가':
        target_calories = tdee * 1.1  # 10% 칼로리 증가
        target_protein = weight * 1.8  # 체중 1kg당 1.8g
        target_fat = target_calories * 0.25 / 9
        target_carbs = (target_calories - (target_protein * 4 + target_fat * 9)) / 4
    else:  # 체중유지
        target_calories = tdee
        target_protein = weight * 1.0
        target_fat = target_calories * 0.3 / 9
        target_carbs = (target_calories - (target_protein * 4 + target_fat * 9)) / 4
    
    # 기타 영양소 목표
    target_sodium = 2300  # mg/일 (WHO 권장)
    target_sugar = 50     # g/일
    target_fiber = 25     # g/일
    
    # 3️⃣ Step 3: 달성률 계산
    targets = {
        'calories': target_calories,
        'protein': target_protein,
        'fat': target_fat,
        'carbs': target_carbs,
        'sodium': target_sodium,
        'sugar': target_sugar,
        'fiber': target_fiber
    }
    
    achievement_rates = {}
    for nutrient, current in total_nutrition.items():
        target = targets.get(nutrient, 1)
        achievement_rates[nutrient] = (current / target) * 100 if target > 0 else 0
    
    return {
        'total_nutrition': total_nutrition,
        'targets': targets,
        'achievement_rates': achievement_rates,
        'bmr': bmr,
        'tdee': tdee
    }


def create_nutrition_bar_chart(nutrition_summary: Dict[str, Any]) -> go.Figure:
    """영양소별 달성률 막대 차트 생성"""
    
    achievement_rates = nutrition_summary['achievement_rates']
    
    # 영양소명 한글화
    nutrient_names = {
        'calories': '칼로리',
        'protein': '단백질',
        'fat': '지방',
        'carbs': '탄수화물',
        'sodium': '나트륨',
        'sugar': '당류',
        'fiber': '식이섬유'
    }
    
    nutrients = list(achievement_rates.keys())
    rates = list(achievement_rates.values())
    names = [nutrient_names.get(n, n) for n in nutrients]
    
    # 색상 설정 (목표 달성률에 따라)
    colors = []
    for rate in rates:
        if rate < 70:
            colors.append('#ff4757')  # 빨강 (부족)
        elif rate <= 120:
            colors.append('#2ed573')  # 초록 (적정)
        else:
            colors.append('#ffa502')  # 주황 (과다)
    
    fig = go.Figure(data=[
        go.Bar(
            x=names,
            y=rates,
            marker_color=colors,
            text=[f'{rate:.1f}%' for rate in rates],
            textposition='auto',
        )
    ])
    
    fig.update_layout(
        title='🎯 영양소별 목표 달성률',
        xaxis_title='영양소',
        yaxis_title='달성률 (%)',
        font=dict(family="Arial", size=12),
        height=500,
        showlegend=False
    )
    
    # 목표선 추가 (100%)
    fig.add_hline(y=100, line_dash="dash", line_color="gray", 
                  annotation_text="목표 100%")
    
    return fig


def create_nutrition_radar_chart(nutrition_summary: Dict[str, Any]) -> go.Figure:
    """영양소 균형 레이더 차트 생성"""
    
    achievement_rates = nutrition_summary['achievement_rates']
    
    # 주요 영양소만 선택 (레이더 차트용)
    main_nutrients = ['calories', 'protein', 'fat', 'carbs']
    nutrient_names = {
        'calories': '칼로리',
        'protein': '단백질', 
        'fat': '지방',
        'carbs': '탄수화물'
    }
    
    categories = [nutrient_names[n] for n in main_nutrients]
    values = [achievement_rates[n] for n in main_nutrients]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatterpolar(
        r=values,
        theta=categories,
        fill='toself',
        name='현재 섭취',
        line_color='#3742fa',
        fillcolor='rgba(55, 66, 250, 0.3)'
    ))
    
    # 목표선 (100%) 추가
    target_values = [100] * len(categories)
    fig.add_trace(go.Scatterpolar(
        r=target_values,
        theta=categories,
        fill=None,
        name='목표 (100%)',
        line_color='#ff4757',
        line_dash='dash'
    ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, max(150, max(values))]
            )),
        title='🎯 영양소 균형 분석',
        font=dict(family="Arial", size=12),
        height=500
    )
    
    return fig


def create_nutrition_detail_table(nutrition_summary: Dict[str, Any]) -> pd.DataFrame:
    """영양소 상세 정보 테이블 생성"""
    
    total_nutrition = nutrition_summary['total_nutrition']
    targets = nutrition_summary['targets']
    achievement_rates = nutrition_summary['achievement_rates']
    
    # 영양소별 상세 정보
    nutrient_info = {
        'calories': {'name': '칼로리', 'unit': 'kcal'},
        'protein': {'name': '단백질', 'unit': 'g'},
        'fat': {'name': '지방', 'unit': 'g'},
        'carbs': {'name': '탄수화물', 'unit': 'g'},
        'sodium': {'name': '나트륨', 'unit': 'mg'},
        'sugar': {'name': '당류', 'unit': 'g'},
        'fiber': {'name': '식이섬유', 'unit': 'g'}
    }
    
    data = []
    for nutrient, info in nutrient_info.items():
        current = total_nutrition.get(nutrient, 0)
        target = targets.get(nutrient, 0)
        rate = achievement_rates.get(nutrient, 0)
        
        # 상태 평가
        if rate < 70:
            status = "⚠️ 부족"
        elif rate <= 120:
            status = "✅ 적정"
        else:
            status = "🔥 과다"
        
        data.append({
            '영양소': info['name'],
            '현재 섭취': f"{current:.1f} {info['unit']}",
            '목표량': f"{target:.1f} {info['unit']}",
            '달성률': f"{rate:.1f}%",
            '상태': status
        })
    
    return pd.DataFrame(data)


def display_nutrition_dashboard(recommended_foods: List[Dict[str, Any]], user_profile: Dict[str, Any]):
    """종합 영양 분석 대시보드 표시"""
    
    st.header("📊 영양소 분석 대시보드")
    
    # 영양소 요약 계산
    nutrition_summary = calculate_nutrition_summary(recommended_foods, user_profile)
    
    # 4️⃣ Step 4: 시각화
    col1, col2 = st.columns(2)
    
    with col1:
        # 막대 차트
        bar_fig = create_nutrition_bar_chart(nutrition_summary)
        st.plotly_chart(bar_fig, use_container_width=True)
    
    with col2:
        # 레이더 차트
        radar_fig = create_nutrition_radar_chart(nutrition_summary)
        st.plotly_chart(radar_fig, use_container_width=True)
    
    # 상세 정보 테이블
    st.subheader("📋 영양소 상세 분석")
    detail_table = create_nutrition_detail_table(nutrition_summary)
    st.dataframe(detail_table, use_container_width=True)
    
    # 개인화된 조언
    st.subheader("💡 개인 맞춤 영양 조언")
    
    achievement_rates = nutrition_summary['achievement_rates']
    advice = []
    
    if achievement_rates['protein'] < 80:
        advice.append("🥩 단백질 섭취가 부족합니다. 닭가슴살, 두부, 계란 등을 추가해보세요.")
    
    if achievement_rates['fiber'] < 70:
        advice.append("🥬 식이섬유가 부족합니다. 채소와 현미를 더 드시는 것을 권장합니다.")
    
    if achievement_rates['sodium'] > 120:
        advice.append("🧂 나트륨 섭취가 과다합니다. 저염식품을 선택하고 국물류를 줄여보세요.")
    
    if achievement_rates['calories'] > 110:
        advice.append("⚖️ 칼로리가 목표보다 높습니다. 간식을 줄이거나 운동량을 늘려보세요.")
    
    if not advice:
        advice.append("🎉 영양 균형이 잘 맞춰져 있습니다! 현재 식단을 유지해보세요.")
    
    for tip in advice:
        st.info(tip)
    
    # 기초대사율 정보
    with st.expander("📈 개인 기초 정보"):
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("기초대사율 (BMR)", f"{nutrition_summary['bmr']:.0f} kcal")
        with col2:
            st.metric("일일 소모 칼로리 (TDEE)", f"{nutrition_summary['tdee']:.0f} kcal")
        with col3:
            total_calories = nutrition_summary['total_nutrition']['calories']
            st.metric("추천 식단 칼로리", f"{total_calories:.0f} kcal")


def get_recommended_foods_from_session():
    """세션에서 추천 결과 가져오기"""
    
    if 'recommend_result' in st.session_state and st.session_state['recommend_result']:
        return st.session_state['recommend_result']
    
    # 테스트용 샘플 데이터 (실제 정제 데이터에서 추출)
    sample_foods = [
        {
            "name": "닭가슴살 도시락",
            "calories": 430,
            "protein": 36,
            "fat": 8,
            "carbs": 45,
            "sodium": 890,
            "sugar": 5,
            "fiber": 3,
            "price": 4500
        },
        {
            "name": "현미 비빔밥",
            "calories": 380,
            "protein": 12,
            "fat": 6,
            "carbs": 72,
            "sodium": 650,
            "sugar": 8,
            "fiber": 5,
            "price": 3800
        },
        {
            "name": "두부 김치찌개",
            "calories": 220,
            "protein": 18,
            "fat": 12,
            "carbs": 15,
            "sodium": 1200,
            "sugar": 3,
            "fiber": 4,
            "price": 3200
        }
    ]
    
    return sample_foods