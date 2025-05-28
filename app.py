import streamlit as st
import pandas as pd
import numpy as np
import json
from typing import Dict, List, Any
import os
import plotly.express as px
import plotly.graph_objects as go
from food_recommender import KoreanFoodRecommender

# 페이지 설정
st.set_page_config(
    page_title="개인 맞춤형 AI 하루 식단 추천",
    page_icon="🍽️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 세션 상태 초기화 (5단계: Robust 처리)
def initialize_session_state():
    """세션 상태를 안전하게 초기화합니다."""
    if 'page' not in st.session_state:
        st.session_state.page = "input"
    
    if 'user_profile' not in st.session_state:
        st.session_state.user_profile = {}
    
    if 'recommendations' not in st.session_state:
        st.session_state.recommendations = []
    
    if 'food_recommender' not in st.session_state:
        st.session_state.food_recommender = KoreanFoodRecommender()

# 1단계: 사용자 정보 입력 폼
def user_input_page():
    """사용자 정보 입력 페이지"""
    st.title("🍽️ 개인 맞춤형 AI 하루 식단 추천")
    st.markdown("정확한 식단 추천을 위해 개인 정보를 입력해주세요.")
    
    # st.form() 사용하여 폼 구성
    with st.form("user_profile_form"):
        st.subheader("📝 기본 정보")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # 성별 선택
            gender = st.selectbox(
                "성별",
                ["남성", "여성"],
                help="BMR 계산을 위해 필요합니다"
            )
            
            # 나이 입력
            age = st.number_input(
                "나이",
                min_value=10,
                max_value=120,
                value=30,
                help="기초대사율 계산에 사용됩니다"
            )
            
            # 키 입력
            height = st.number_input(
                "키 (cm)",
                min_value=100,
                max_value=250,
                value=170,
                help="적정 체중과 칼로리 계산에 필요합니다"
            )
        
        with col2:
            # 몸무게 입력
            weight = st.number_input(
                "몸무게 (kg)",
                min_value=30,
                max_value=200,
                value=70,
                help="칼로리 요구량 계산에 사용됩니다"
            )
            
            # 건강 목표 선택
            health_goal = st.selectbox(
                "건강 목표",
                ["체중 감량", "체중 유지", "근육 증가"],
                help="식단 방향성을 결정합니다"
            )
            
            # 1회 식사 예산 슬라이더
            budget_per_meal = st.slider(
                "1회 식사 예산 (원)",
                min_value=1000,
                max_value=20000,
                value=10000,
                step=500,
                help="설정한 예산 내에서 식단을 추천합니다"
            )
        
        st.subheader("🚫 알레르기 정보")
        
        # 알레르기 다중 선택
        allergy_options = [
            "계란", "유제품", "견과류", "갑각류", "생선", "대두", "밀",
            "복숭아", "토마토", "돼지고기", "쇠고기", "닭고기", "새우", "게"
        ]
        
        allergies = st.multiselect(
            "알레르기가 있는 식품을 선택하세요 (최대 7개)",
            allergy_options,
            help="선택한 식품은 추천에서 제외됩니다"
        )
        
        st.subheader("🥗 식습관/선호도")
        
        # 식습관 선호도 다중 선택
        preference_options = ["채식", "키토", "고단백", "저염식", "글루텐프리"]
        preferences = st.multiselect(
            "선호하는 식습관을 선택하세요 (최대 5개)",
            preference_options,
            help="선택한 식습관에 맞는 식단을 우선 추천합니다"
        )
        
        st.subheader("🏥 질환 정보")
        
        # 질환 정보 다중 선택
        disease_options = ["당뇨", "고혈압", "고지혈증", "신장질환"]
        diseases = st.multiselect(
            "해당하는 질환이 있다면 선택하세요 (최대 5개)",
            disease_options,
            help="질환에 적합한 안전한 식단을 추천합니다"
        )
        
        # 약관 동의
        agreement = st.checkbox(
            "이용 약관 및 개인정보 처리방침에 동의합니다 ✓",
            help="입력하신 정보는 식단 추천 목적으로만 사용됩니다"
        )
        
        # 폼 제출 버튼
        submitted = st.form_submit_button("🎯 식단 추천 받기", use_container_width=True)
        
        # 2단계: 입력값 검증
        if submitted:
            # 필수 항목 검증
            if not all([gender, age, height, weight, health_goal, agreement]):
                st.error("❌ 필수 항목을 모두 입력하고 약관에 동의해주세요.")
                return
            
            # 알레르기 개수 검증
            if len(allergies) > 7:
                st.error("❌ 알레르기는 최대 7개까지 선택할 수 있습니다.")
                return
            
            # 선호도 개수 검증
            if len(preferences) > 5:
                st.error("❌ 식습관/선호도는 최대 5개까지 선택할 수 있습니다.")
                return
            
            # 질환 개수 검증
            if len(diseases) > 5:
                st.error("❌ 질환 정보는 최대 5개까지 선택할 수 있습니다.")
                return
            
            # 3단계: user_profile 딕셔너리 생성
            user_profile = {
                "gender": gender,
                "age": age,
                "height": height,
                "weight": weight,
                "health_goal": health_goal,
                "budget_per_meal": budget_per_meal,
                "allergies": allergies,
                "preferences": preferences,
                "diseases": diseases
            }
            
            # 4단계: 세션 상태에 저장
            st.session_state["user_profile"] = user_profile
            st.session_state.page = "recommend"
            
            st.success("✅ 프로필이 저장되었습니다! 식단 추천 페이지로 이동합니다.")
            st.rerun()

# 추천 페이지
def recommend_page():
    """식단 추천 페이지"""
    st.title("🎯 맞춤 식단 추천")
    
    # 사용자 프로필 확인
    if not st.session_state.user_profile:
        st.error("❌ 사용자 프로필이 없습니다. 먼저 정보를 입력해주세요.")
        if st.button("정보 입력 페이지로 돌아가기"):
            st.session_state.page = "input"
            st.rerun()
        return
    
    profile = st.session_state.user_profile
    recommender = st.session_state.food_recommender
    
    # 사용자 정보 요약 표시
    with st.expander("👤 입력한 정보 확인", expanded=False):
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("성별", profile.get("gender", "미입력"))
            st.metric("나이", f"{profile.get('age', 0)}세")
        
        with col2:
            st.metric("키", f"{profile.get('height', 0)}cm")
            st.metric("몸무게", f"{profile.get('weight', 0)}kg")
        
        with col3:
            st.metric("목표", profile.get("health_goal", "미설정"))
            st.metric("예산", f"{profile.get('budget_per_meal', 0):,}원")
    
    # 실제 AI 식단 추천 실행
    st.subheader("🍽️ AI 맞춤 식단 추천")
    
    with st.spinner("🤖 한국 음식 데이터베이스에서 최적의 식단을 분석 중입니다..."):
        # 실제 추천 시스템 실행
        recommendations = recommender.recommend_meals(profile, num_recommendations=9)
        st.session_state.recommendations = recommendations
    
    if recommendations:
        st.success(f"✅ {len(recommendations)}개의 맞춤 한국 음식을 추천해드립니다!")
        
        # 추천 결과를 3개씩 3행으로 표시
        st.subheader("🥘 추천 메뉴")
        
        for i in range(0, len(recommendations), 3):
            cols = st.columns(3)
            
            for j, col in enumerate(cols):
                if i + j < len(recommendations):
                    food = recommendations[i + j]
                    
                    with col:
                        with st.container():
                            st.markdown(f"### {food.get('name', '알 수 없는 음식')}")
                            
                            # 음식 정보 카드
                            col_info1, col_info2 = st.columns(2)
                            
                            with col_info1:
                                st.metric("칼로리", f"{food.get('calories', 0):.0f} kcal")
                                st.metric("단백질", f"{food.get('protein', 0):.1f}g")
                            
                            with col_info2:
                                st.metric("가격", f"{food.get('price', 0):,}원")
                                st.metric("점수", f"{food.get('total_score', 0):.0f}/100")
                            
                            # 카테고리 및 타입 표시
                            if food.get('category'):
                                st.caption(f"🏷️ {food.get('category')}")
                            
                            # 영양소 세부 정보
                            with st.expander("영양 정보 자세히 보기"):
                                st.write(f"**탄수화물:** {food.get('carbs', 0):.1f}g")
                                st.write(f"**지방:** {food.get('fat', 0):.1f}g")
                                st.write(f"**나트륨:** {food.get('sodium', 0):.1f}mg")
                                st.write(f"**식이섬유:** {food.get('fiber', 0):.1f}g")
                            
                            st.divider()
        
        # 영양 요약 정보
        nutrition_summary = recommender.get_nutrition_summary(recommendations, profile)
        
        if nutrition_summary:
            st.subheader("📊 영양 요약")
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                calorie_pct = nutrition_summary.get('calorie_percentage', 0)
                st.metric(
                    "총 칼로리",
                    f"{nutrition_summary.get('total_calories', 0):.0f} kcal",
                    f"목표 대비 {calorie_pct:.0f}%"
                )
            
            with col2:
                protein_pct = nutrition_summary.get('protein_percentage', 0)
                st.metric(
                    "총 단백질",
                    f"{nutrition_summary.get('total_protein', 0):.1f}g",
                    f"목표 대비 {protein_pct:.0f}%"
                )
            
            with col3:
                st.metric(
                    "총 탄수화물",
                    f"{nutrition_summary.get('total_carbs', 0):.1f}g"
                )
            
            with col4:
                st.metric(
                    "총 예상 비용",
                    f"{nutrition_summary.get('total_cost', 0):,}원",
                    f"예산: {nutrition_summary.get('budget', 0):,}원"
                )
            
            # 영양 균형 차트
            st.subheader("📈 영양 균형 분석")
            
            # 칼로리와 단백질 목표 달성률 시각화
            target_data = {
                '영양소': ['칼로리', '단백질'],
                '목표 달성률 (%)': [calorie_pct, protein_pct],
                '상태': ['적정' if 80 <= calorie_pct <= 120 else '조정 필요',
                        '적정' if 80 <= protein_pct <= 120 else '조정 필요']
            }
            
            fig = px.bar(
                target_data, 
                x='영양소', 
                y='목표 달성률 (%)',
                color='상태',
                title="영양소 목표 달성률",
                color_discrete_map={'적정': 'green', '조정 필요': 'orange'}
            )
            fig.update_layout(showlegend=True)
            st.plotly_chart(fig, use_container_width=True)
    
    else:
        st.warning("😅 조건에 맞는 음식을 찾지 못했습니다. 알레르기나 예산 조건을 조정해보세요.")
    
    # 페이지 네비게이션
    col1, col2 = st.columns(2)
    with col1:
        if st.button("⬅️ 정보 수정", use_container_width=True):
            st.session_state.page = "input"
            st.rerun()
    
    with col2:
        if st.button("📊 상세 분석 보기", use_container_width=True):
            st.session_state.page = "analysis"
            st.rerun()

# 분석 페이지
def analysis_page():
    """영양 분석 및 상세 정보 페이지"""
    st.title("📊 영양 분석 및 상세 정보")
    
    if not st.session_state.user_profile:
        st.error("❌ 사용자 프로필이 없습니다.")
        return
    
    profile = st.session_state.user_profile
    
    # BMR 계산 (Harris-Benedict 공식)
    if profile.get("gender") == "남성":
        bmr = 88.362 + (13.397 * profile.get("weight", 70)) + (4.799 * profile.get("height", 170)) - (5.677 * profile.get("age", 30))
    else:
        bmr = 447.593 + (9.247 * profile.get("weight", 70)) + (3.098 * profile.get("height", 170)) - (4.330 * profile.get("age", 30))
    
    # 활동 대사율 (임시로 보통 활동량 적용)
    tdee = bmr * 1.55
    
    # 목표에 따른 칼로리 조정
    goal = profile.get("health_goal", "체중 유지")
    if goal == "체중 감량":
        target_calories = tdee - 300
    elif goal == "근육 증가":
        target_calories = tdee + 200
    else:
        target_calories = tdee
    
    # 영양 정보 표시
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("기초대사율 (BMR)", f"{bmr:.0f} kcal")
    
    with col2:
        st.metric("총 에너지 소비량 (TDEE)", f"{tdee:.0f} kcal")
    
    with col3:
        st.metric("목표 칼로리", f"{target_calories:.0f} kcal")
    
    # 추가 분석 정보
    st.subheader("🔍 맞춤 분석 결과")
    
    # 알레르기 주의사항
    if profile.get("allergies"):
        st.warning(f"⚠️ 알레르기 주의: {', '.join(profile.get('allergies', []))}")
    
    # 질환별 권장사항
    if profile.get("diseases"):
        st.info(f"🏥 건강 관리: {', '.join(profile.get('diseases', []))} 관리에 적합한 식단을 추천합니다.")
    
    # 페이지 네비게이션
    if st.button("⬅️ 추천 페이지로 돌아가기", use_container_width=True):
        st.session_state.page = "recommend"
        st.rerun()

# 사이드바 네비게이션
def sidebar_navigation():
    """사이드바 네비게이션 메뉴"""
    st.sidebar.title("🍽️ 식단 추천 서비스")
    
    # 현재 페이지 상태 표시
    pages = {
        "input": "📝 정보 입력",
        "recommend": "🎯 식단 추천", 
        "analysis": "📊 분석 결과"
    }
    
    current_page = st.session_state.get("page", "input")
    
    # 페이지 선택
    selected_page = st.sidebar.radio(
        "페이지 선택",
        list(pages.keys()),
        format_func=lambda x: pages[x],
        index=list(pages.keys()).index(current_page)
    )
    
    if selected_page != current_page:
        st.session_state.page = selected_page
        st.rerun()
    
    # 사용자 정보 요약 (프로필이 있는 경우)
    if st.session_state.user_profile:
        st.sidebar.divider()
        st.sidebar.subheader("👤 현재 사용자")
        profile = st.session_state.user_profile
        st.sidebar.text(f"성별: {profile.get('gender', '미입력')}")
        st.sidebar.text(f"나이: {profile.get('age', 0)}세")
        st.sidebar.text(f"목표: {profile.get('health_goal', '미설정')}")
        
        # 프로필 초기화 버튼
        if st.sidebar.button("🔄 새로 시작하기"):
            st.session_state.user_profile = {}
            st.session_state.page = "input"
            st.rerun()

# 메인 애플리케이션
def main():
    """메인 애플리케이션 실행"""
    # 세션 상태 초기화
    initialize_session_state()
    
    # 사이드바 네비게이션
    sidebar_navigation()
    
    # 현재 페이지에 따라 컨텐츠 표시
    current_page = st.session_state.get("page", "input")
    
    if current_page == "input":
        user_input_page()
    elif current_page == "recommend":
        recommend_page()
    elif current_page == "analysis":
        analysis_page()
    else:
        st.error("❌ 알 수 없는 페이지입니다.")

# 애플리케이션 실행
if __name__ == "__main__":
    main()