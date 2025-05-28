import streamlit as st
import pandas as pd
import numpy as np
import json
from typing import Dict, List, Any
import os
import plotly.express as px
import plotly.graph_objects as go

# 기존 app.py의 내용을 main.py로 이동하되, 예외 처리를 강화합니다

# 페이지 설정
st.set_page_config(
    page_title="개인 맞춤형 AI 하루 식단 추천",
    page_icon="🍽️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 세션 상태 초기화 (강화된 안전 관리)
def initialize_session_state():
    """세션 상태를 안전하게 초기화합니다."""
    try:
        # 페이지 상태 초기화
        if 'page' not in st.session_state:
            st.session_state['page'] = "input"
        
        # 사용자 프로필 초기화
        if 'user_profile' not in st.session_state:
            st.session_state['user_profile'] = {}
        
        # 추천 결과 초기화
        if 'recommendations' not in st.session_state:
            st.session_state['recommendations'] = []
        
        # 에러 로그 초기화
        if 'error_logs' not in st.session_state:
            st.session_state['error_logs'] = []
        
        # 추천 시스템 초기화
        if 'food_recommender' not in st.session_state:
            try:
                from api.recommend import KoreanFoodRecommender
                st.session_state['food_recommender'] = KoreanFoodRecommender()
            except ImportError as e:
                error_msg = f"추천 시스템 로드 실패: {e}"
                st.session_state['error_logs'].append(error_msg)
                st.session_state['food_recommender'] = None
            except Exception as e:
                error_msg = f"예상치 못한 오류: {e}"
                st.session_state['error_logs'].append(error_msg)
                st.session_state['food_recommender'] = None
    
    except Exception as e:
        st.error(f"❌ 세션 초기화 실패: {e}")

# 안전한 세션 상태 접근 함수들
def get_session_value(key: str, default=None):
    """세션 값을 안전하게 가져오기"""
    return st.session_state.get(key, default)

def set_session_value(key: str, value):
    """세션 값을 안전하게 설정"""
    try:
        st.session_state[key] = value
        return True
    except Exception as e:
        st.error(f"세션 값 설정 실패 ({key}): {e}")
        return False

# 테스트용 샘플 데이터
def get_sample_user_profile():
    """테스트용 샘플 사용자 프로필 데이터"""
    return {
        "gender": "남성",
        "age": 28,
        "height": 175,
        "weight": 70,
        "health_goal": "체중 감량",
        "budget_per_meal": 12000,
        "allergies": ["견과류"],
        "preferences": ["고단백"],
        "diseases": []
    }

# 메인 애플리케이션
def main():
    """메인 애플리케이션 실행"""
    try:
        # 세션 상태 초기화
        initialize_session_state()
        
        # 애플리케이션 제목
        st.title("🍽️ 개인 맞춤형 AI 하루 식단 추천")
        st.markdown("---")
        
        # 테스트용 샘플 데이터 버튼 (개발용)
        if st.sidebar.button("🧪 테스트 데이터 로드"):
            try:
                sample_data = get_sample_user_profile()
                if set_session_value('user_profile', sample_data):
                    set_session_value('page', 'recommend')
                    st.success("✅ 테스트 데이터가 로드되었습니다!")
                    st.rerun()
                else:
                    st.error("❌ 테스트 데이터 저장에 실패했습니다.")
            except Exception as e:
                st.error(f"❌ 테스트 데이터 로드 실패: {e}")
                error_logs = get_session_value('error_logs', [])
                error_logs.append(f"테스트 데이터 로드 오류: {e}")
                set_session_value('error_logs', error_logs)
        
        # 현재 페이지 표시
        current_page = get_session_value('page', 'input')
        st.sidebar.write(f"현재 페이지: **{current_page}**")
        
        # 세션 상태 디버깅 (개발용)
        if st.sidebar.checkbox("🔧 세션 상태 확인"):
            user_profile = get_session_value('user_profile', {})
            error_logs = get_session_value('error_logs', [])
            st.sidebar.json({
                'current_page': current_page,
                'profile_keys': list(user_profile.keys()) if user_profile else [],
                'error_count': len(error_logs),
                'recommender_status': 'OK' if get_session_value('food_recommender') else 'None'
            })
        
        # 기본 메시지
        if current_page == "input":
            st.info("👆 왼쪽 사이드바에서 '테스트 데이터 로드' 버튼을 눌러 빠르게 테스트해보세요!")
        
        # 추천 시스템 상태 확인
        recommender = get_session_value('food_recommender')
        if recommender is None:
            st.warning("⚠️ 추천 시스템이 초기화되지 않았습니다. 페이지를 새로고침해주세요.")
            error_logs = get_session_value('error_logs', [])
            if error_logs:
                st.write("최근 오류:")
                for error in error_logs[-3:]:
                    st.write(f"• {error}")
            return
        
        st.success("✅ 시스템이 정상적으로 초기화되었습니다!")
        
        # 페이지별 라우팅
        if current_page == "input":
            user_input_page()
        elif current_page == "recommend":
            recommend_page()
        elif current_page == "analysis":
            analysis_page()
        else:
            st.error(f"알 수 없는 페이지: {current_page}")
            set_session_value('page', 'input')
        
    except Exception as e:
        st.error(f"❌ 애플리케이션 실행 중 오류 발생: {e}")
        st.write("오류 세부 정보:", str(e))

def user_input_page():
    """사용자 정보 입력 페이지"""
    st.title("📝 개인 정보 입력")
    st.markdown("### 맞춤형 식단 추천을 위해 기본 정보를 입력해주세요")
    
    # 현재 프로필 데이터 안전하게 가져오기
    current_profile = get_session_value('user_profile', {})
    
    with st.form("user_input_form"):
        col1, col2 = st.columns(2)
        
        # 기본 정보
        with col1:
            st.subheader("📊 기본 정보")
            gender = st.selectbox("성별", ["남성", "여성"], 
                                index=0 if current_profile.get('gender', '남성') == '남성' else 1)
            age = st.number_input("나이", min_value=10, max_value=120, 
                                value=current_profile.get('age', 25), step=1)
            height = st.number_input("키 (cm)", min_value=100, max_value=250, 
                                   value=current_profile.get('height', 170), step=1)
            weight = st.number_input("몸무게 (kg)", min_value=30, max_value=200, 
                                   value=current_profile.get('weight', 70), step=1)
        
        # 목표 및 활동
        with col2:
            st.subheader("🎯 건강 목표")
            health_goal = st.selectbox("건강 목표", ["체중감량", "근육증가", "체중유지"], 
                                     index=["체중감량", "근육증가", "체중유지"].index(
                                         current_profile.get('health_goal', '체중감량')))
            activity_level = st.selectbox("활동 수준", ["낮음", "보통", "높음"], 
                                        index=["낮음", "보통", "높음"].index(
                                            current_profile.get('activity_level', '보통')))
            budget_per_meal = st.number_input("1회 식사 예산 (원)", min_value=1000, max_value=20000, 
                                            value=current_profile.get('budget_per_meal', 8000), step=500)
        
        # 알레르기 정보
        st.subheader("🚫 알레르기 정보")
        allergy_options = ["견과류", "갑각류", "유제품", "계란", "밀가루", "콩", "생선", "조개류"]
        allergies = []
        current_allergies = current_profile.get('allergies', [])
        
        cols = st.columns(4)
        for i, allergy in enumerate(allergy_options):
            with cols[i % 4]:
                if st.checkbox(allergy, value=allergy in current_allergies):
                    allergies.append(allergy)
        
        # 폼 제출
        submitted = st.form_submit_button("🔍 맞춤 식단 추천받기", type="primary", use_container_width=True)
        
        if submitted:
            try:
                # 사용자 프로필 생성
                user_profile = {
                    'gender': gender,
                    'age': age,
                    'height': height,
                    'weight': weight,
                    'health_goal': health_goal,
                    'activity_level': activity_level,
                    'budget_per_meal': budget_per_meal,
                    'allergies': allergies
                }
                
                # 입력값 검증
                from utils.validators import validate_user_profile
                is_valid, errors = validate_user_profile(user_profile)
                
                if not is_valid:
                    st.error("❌ 입력값 검증 실패:")
                    for error in errors:
                        st.error(f"• {error}")
                    return
                
                # 세션에 안전하게 저장
                if set_session_value('user_profile', user_profile):
                    set_session_value('page', 'recommend')
                    st.success("✅ 정보가 저장되었습니다!")
                    st.rerun()
                else:
                    st.error("❌ 프로필 저장에 실패했습니다.")
                
            except Exception as e:
                st.error(f"❌ 정보 처리 중 오류: {e}")
                error_logs = get_session_value('error_logs', [])
                error_logs.append(f"사용자 입력 처리 오류: {e}")
                set_session_value('error_logs', error_logs)

def recommend_page():
    """식단 추천 페이지"""
    st.title("🍽️ 맞춤 식단 추천")
    
    # 사용자 프로필 안전하게 가져오기
    user_profile = get_session_value('user_profile', {})
    if not user_profile:
        st.warning("사용자 정보가 없습니다. 먼저 정보를 입력해주세요.")
        if st.button("📝 정보 입력하러 가기"):
            set_session_value('page', 'input')
            st.rerun()
        return
    
    # 추천 시스템 가져오기
    recommender = get_session_value('food_recommender')
    if not recommender:
        st.error("추천 시스템을 사용할 수 없습니다.")
        return
    
    try:
        # 사용자 정보 표시
        st.subheader("👤 입력하신 정보")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.write(f"**성별:** {user_profile.get('gender', 'N/A')}")
            st.write(f"**나이:** {user_profile.get('age', 'N/A')}세")
        with col2:
            st.write(f"**키:** {user_profile.get('height', 'N/A')}cm")
            st.write(f"**몸무게:** {user_profile.get('weight', 'N/A')}kg")
        with col3:
            st.write(f"**목표:** {user_profile.get('health_goal', 'N/A')}")
            st.write(f"**예산:** {user_profile.get('budget_per_meal', 'N/A'):,}원")
        
        if user_profile.get('allergies'):
            st.write(f"**알레르기:** {', '.join(user_profile['allergies'])}")
        
        st.markdown("---")
        
        # 추천 실행
        if st.button("🔄 새로운 추천 받기", type="primary") or not get_session_value('recommendations'):
            with st.spinner("맞춤 식단을 생성하고 있습니다..."):
                try:
                    recommendations = recommender.recommend_meals(user_profile, num_recommendations=5)
                    set_session_value('recommendations', recommendations)
                    st.success("✅ 추천이 완료되었습니다!")
                except Exception as e:
                    st.error(f"❌ 추천 생성 실패: {e}")
                    return
        
        # 추천 결과 표시
        recommendations = get_session_value('recommendations', [])
        if recommendations:
            st.subheader("🍽️ 추천 식단")
            
            for i, meal in enumerate(recommendations, 1):
                with st.expander(f"🥘 추천 식단 {i}"):
                    st.write(f"**음식명:** {meal.get('name', 'N/A')}")
                    st.write(f"**칼로리:** {meal.get('calories', 'N/A')}kcal")
                    st.write(f"**예상 가격:** {meal.get('price', 'N/A'):,}원")
                    
                    if meal.get('nutrition_score'):
                        st.write(f"**영양 점수:** {meal['nutrition_score']:.1f}/10")
                    
                    if meal.get('category'):
                        st.write(f"**카테고리:** {meal['category']}")
        
        # 페이지 이동 버튼
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📝 정보 수정하기"):
                set_session_value('page', 'input')
                st.rerun()
        with col2:
            if st.button("📊 영양 분석 보기"):
                set_session_value('page', 'analysis')
                st.rerun()
                
    except Exception as e:
        st.error(f"❌ 추천 페이지 오류: {e}")
        error_logs = get_session_value('error_logs', [])
        error_logs.append(f"추천 페이지 오류: {e}")
        set_session_value('error_logs', error_logs)

def analysis_page():
    """영양 분석 페이지"""
    st.title("📊 영양 분석 및 상세 정보")
    
    # 기본 데이터 확인
    user_profile = get_session_value('user_profile', {})
    recommendations = get_session_value('recommendations', [])
    
    if not user_profile or not recommendations:
        st.warning("분석할 데이터가 없습니다.")
        if st.button("🔙 추천 페이지로 돌아가기"):
            set_session_value('page', 'recommend')
            st.rerun()
        return
    
    try:
        # 영양 요약 정보
        st.subheader("📈 영양 요약")
        
        recommender = get_session_value('food_recommender')
        if recommender:
            nutrition_summary = recommender.get_nutrition_summary(recommendations, user_profile)
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("총 칼로리", f"{nutrition_summary.get('total_calories', 0):.0f}kcal")
            with col2:
                st.metric("평균 가격", f"{nutrition_summary.get('average_price', 0):,.0f}원")
            with col3:
                st.metric("영양 점수", f"{nutrition_summary.get('avg_nutrition_score', 0):.1f}/10")
        
        # 추천 이유
        st.subheader("💡 추천 이유")
        st.write(f"• **{user_profile.get('health_goal', '목표')}**에 최적화된 식단입니다")
        st.write(f"• **{user_profile.get('activity_level', '활동')} 활동 수준**에 맞춘 칼로리입니다")
        st.write(f"• **예산 {user_profile.get('budget_per_meal', 0):,}원** 내에서 선별했습니다")
        
        if user_profile.get('allergies'):
            st.write(f"• **알레르기 항목({', '.join(user_profile['allergies'])})**을 제외했습니다")
        
        # 돌아가기 버튼
        if st.button("🔙 추천 페이지로 돌아가기"):
            set_session_value('page', 'recommend')
            st.rerun()
            
    except Exception as e:
        st.error(f"❌ 분석 페이지 오류: {e}")
        error_logs = get_session_value('error_logs', [])
        error_logs.append(f"분석 페이지 오류: {e}")
        set_session_value('error_logs', error_logs)

# 애플리케이션 실행
if __name__ == "__main__":
    main()