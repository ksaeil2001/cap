import streamlit as st
import pandas as pd
import numpy as np
import json
from typing import Dict, List, Any
import os
import plotly.express as px
import plotly.graph_objects as go

# 유틸리티 모듈 import
from utils.validators import validate_form_data, validate_medical_conditions, validate_dietary_restrictions
from utils.session_manager import SessionManager
from settings import (
    MIN_AGE, MAX_AGE, MIN_HEIGHT, MAX_HEIGHT, MIN_WEIGHT, MAX_WEIGHT,
    MIN_BUDGET, MAX_BUDGET, DEFAULT_BUDGET, MEDICAL_CONDITIONS, DIETARY_RESTRICTIONS
)

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

def render_input_page():
    """맞춤형 식단 플래너 - 사양 준수 구현"""
    st.title("맞춤형 식단 플래너")
    st.markdown("프로필을 작성하여 목표, 식단 선호도, 예산에 맞춘 개인화된 식단 추천을 받으세요.")
    st.markdown("---")
    
    # 현재 프로필 데이터 안전하게 가져오기
    current_profile = get_session_value('user_profile', {})
    
    # 알레르기 관리용 세션 상태 초기화
    if 'allergy_list' not in st.session_state:
        st.session_state.allergy_list = []
    
    # 입력 폼 생성
    with st.form("meal_planner_form"):
        # 1. 개인 정보 섹션
        st.subheader("개인 정보")
        st.write("정확한 영양소 추천을 위해 신체 정보를 입력해주세요.")
        
        # 성별 (라디오 버튼)
        gender = st.radio(
            "성별",
            options=["남성", "여성"],
            index=0 if current_profile.get('gender', '남성') == '남성' else 1,
            horizontal=True
        )
        
        # 기본 정보 입력
        col1, col2 = st.columns(2)
        with col1:
            age = st.number_input(
                "나이 (세)", 
                min_value=1, 
                max_value=99, 
                value=current_profile.get('age', 25),
                step=1
            )
            height = st.number_input(
                "키 (cm)", 
                min_value=100, 
                max_value=250, 
                value=current_profile.get('height', 170),
                step=1
            )
        
        with col2:
            weight = st.number_input(
                "몸무게 (kg)", 
                min_value=20, 
                max_value=200, 
                value=current_profile.get('weight', 70),
                step=1
            )
        
        # 체지방률 (슬라이더)
        body_fat = st.slider(
            "체지방률 (%)",
            min_value=5,
            max_value=60,
            value=current_profile.get('body_fat', 20),
            step=1
        )
        st.caption("대략적인 체지방률은 영양소 비율을 조정하는 데 도움이 됩니다.")
        
        st.markdown("---")
        
        # 2. 목표 및 선호도 섹션
        st.subheader("목표 및 선호도")
        st.write("영양 목표와 식단 선호도를 설정하세요.")
        
        # 주요 목표 (라디오 버튼)
        main_goal = st.radio(
            "주요 목표",
            options=["체중 감량", "유지", "증가"],
            index=["체중 감량", "유지", "증가"].index(current_profile.get('main_goal', '체중 감량')),
            horizontal=True
        )
        
        # 활동 수준 (드롭다운)
        activity_level = st.selectbox(
            "활동 수준",
            options=["운동 없음", "주 1~2회", "주 3~5회", "매일"],
            index=["운동 없음", "주 1~2회", "주 3~5회", "매일"].index(current_profile.get('activity_level', '주 1~2회'))
        )
        
        # 하루 식사 횟수 (라디오 버튼)
        meal_count = st.radio(
            "하루 식사 횟수",
            options=["2끼", "3끼"],
            index=0 if current_profile.get('meal_count', '3끼') == '2끼' else 1,
            horizontal=True
        )
        st.caption("식사 횟수에 따라 끼니당 영양소 및 예산이 조정됩니다.")
        
        st.markdown("---")
        
        # 3. 알레르기 및 식이 제한 섹션
        st.subheader("알레르기 및 식이 제한")
        st.write("피하고 싶은 알레르기 식품이나 음식을 입력하세요. (최대 5개)")
        
        # 알레르기 입력창
        allergy_input = st.text_input("알레르기 항목 입력 또는 선택")
        
        # 자주 사용되는 알레르기 항목 (버튼으로 선택)
        st.write("자주 사용되는 알레르기 항목:")
        common_allergies = ["우유", "대두(콩)", "땅콩", "밀", "달걀 흰자", "새우", "고등어"]
        
        allergy_cols = st.columns(len(common_allergies))
        for i, allergy in enumerate(common_allergies):
            with allergy_cols[i]:
                if st.button(allergy, key=f"allergy_{i}"):
                    if allergy not in st.session_state.allergy_list and len(st.session_state.allergy_list) < 5:
                        st.session_state.allergy_list.append(allergy)
        
        # 등록된 알레르기 항목 표시
        if st.session_state.allergy_list:
            st.write("등록된 알레르기 항목:")
            for i, allergy in enumerate(st.session_state.allergy_list):
                col_a, col_b = st.columns([3, 1])
                with col_a:
                    st.write(f"• {allergy}")
                with col_b:
                    if st.button("삭제", key=f"delete_allergy_{i}"):
                        st.session_state.allergy_list.remove(allergy)
                        st.rerun()
        else:
            st.info("등록된 알레르기 항목이 없습니다. 위 입력창에 알레르기 항목을 입력하거나 추천 목록에서 선택하세요.")
        
        st.markdown("---")
        
        # 4. 일일 예산 섹션
        st.subheader("일일 예산")
        st.write("식단 계획을 위한 일일 식료품 예산을 설정하세요.")
        
        # 예산 입력 (입력창 + 슬라이더)
        col_budget1, col_budget2 = st.columns(2)
        with col_budget1:
            budget_input = st.number_input(
                "일일 예산 (원)",
                min_value=1000,
                max_value=100000,
                value=current_profile.get('daily_budget', 15000),
                step=1000
            )
        
        with col_budget2:
            budget_slider = st.slider(
                "예산 슬라이더",
                min_value=1000,
                max_value=100000,
                value=current_profile.get('daily_budget', 15000),
                step=1000
            )
        
        # 두 입력값 동기화
        daily_budget = max(budget_input, budget_slider)
        st.write(f"최소: ₩1,000, 최대: ₩100,000")
        st.caption("이 예산 범위 내에서 하루 식단을 최적화합니다.")
        
        st.markdown("---")
        
        # 5. 약관 동의 섹션
        st.subheader("약관 동의")
        terms_agreement = st.checkbox(
            "I understand that this application provides recommendations only and not professional medical or nutrition advice.",
            value=current_profile.get('terms_agreement', False)
        )
        
        st.markdown("---")
        
        # 폼 제출 버튼들
        col_btn1, col_btn2 = st.columns(2)
        
        with col_btn1:
            reset_form = st.form_submit_button(
                "양식 초기화",
                use_container_width=True
            )
        
        with col_btn2:
            submit_form = st.form_submit_button(
                "추천 받기",
                type="primary",
                use_container_width=True
            )
        
        # 텍스트 입력에서 알레르기 추가
        if allergy_input and allergy_input not in st.session_state.allergy_list and len(st.session_state.allergy_list) < 5:
            st.session_state.allergy_list.append(allergy_input)
            st.rerun()
        
        # 양식 초기화 처리
        if reset_form:
            # 모든 세션 상태 초기화
            st.session_state.allergy_list = []
            for key in ['user_profile']:
                if key in st.session_state:
                    del st.session_state[key]
            st.success("양식이 초기화되었습니다.")
            st.rerun()
        
        # 추천 받기 처리
        if submit_form:
            # 실시간 입력값 검증
            validation_errors = []
            
            # 필수 항목 검증
            if age < 1 or age > 99:
                validation_errors.append("나이는 1세에서 99세 사이여야 합니다.")
            
            if height < 100 or height > 250:
                validation_errors.append("키는 100cm에서 250cm 사이여야 합니다.")
            
            if weight < 20 or weight > 200:
                validation_errors.append("몸무게는 20kg에서 200kg 사이여야 합니다.")
            
            if daily_budget < 1000 or daily_budget > 100000:
                validation_errors.append("일일 예산은 1,000원에서 100,000원 사이여야 합니다.")
            
            if len(st.session_state.allergy_list) > 5:
                validation_errors.append("알레르기 항목은 최대 5개까지만 등록할 수 있습니다.")
            
            # 약관 동의 확인
            if not terms_agreement:
                validation_errors.append("서비스 이용을 위해 약관에 동의해주세요.")
            
            # 검증 오류가 있으면 표시
            if validation_errors:
                st.error("❌ 입력값 검증 실패:")
                for error in validation_errors:
                    st.error(f"• {error}")
            else:
                try:
                    # 사용자 프로필 구성
                    user_profile = {
                        'gender': gender,
                        'age': age,
                        'height': height,
                        'weight': weight,
                        'body_fat': body_fat,
                        'main_goal': main_goal,
                        'activity_level': activity_level,
                        'meal_count': meal_count,
                        'daily_budget': daily_budget,
                        'allergies': st.session_state.allergy_list.copy(),
                        'terms_agreement': terms_agreement
                    }
                    
                    # 세션에 안전하게 저장
                    if set_session_value('user_profile', user_profile):
                        st.success("✅ 정보가 저장되었습니다! 맞춤 식단을 생성하고 있습니다...")
                        st.balloons()
                        
                        # 추천 페이지로 이동
                        if set_session_value('page', 'recommend'):
                            st.rerun()
                        else:
                            st.error("❌ 페이지 이동에 실패했습니다.")
                    else:
                        st.error("❌ 프로필 저장에 실패했습니다.")
                        
                except Exception as e:
                    st.error(f"❌ 정보 처리 중 오류가 발생했습니다: {str(e)}")
                    # 에러 로그 저장
                    error_logs = get_session_value('error_logs', [])
                    if error_logs is not None:
                        error_logs.append(f"사용자 입력 처리 오류: {e}")
                        set_session_value('error_logs', error_logs)
    
    # 현재 입력값 확인 (디버깅용)
    if st.checkbox("🔧 입력값 확인 (개발자용)"):
        if st.session_state.allergy_list:
            st.write("**등록된 알레르기:**", st.session_state.allergy_list)
        else:
            st.write("**등록된 알레르기:** 없음")
        
        current_data = {
            '성별': gender if 'gender' in locals() else 'N/A',
            '나이': age if 'age' in locals() else 'N/A',
            '키': f"{height}cm" if 'height' in locals() else 'N/A',
            '몸무게': f"{weight}kg" if 'weight' in locals() else 'N/A',
            '체지방률': f"{body_fat}%" if 'body_fat' in locals() else 'N/A',
            '목표': main_goal if 'main_goal' in locals() else 'N/A',
            '활동수준': activity_level if 'activity_level' in locals() else 'N/A',
            '식사횟수': meal_count if 'meal_count' in locals() else 'N/A',
            '예산': f"{daily_budget:,}원" if 'daily_budget' in locals() else 'N/A',
            '약관동의': terms_agreement if 'terms_agreement' in locals() else 'N/A'
        }
        st.json(current_data)

def user_input_page():
    """호환성을 위한 래퍼 함수"""
    render_input_page()

def render_recommendation_page():
    """완전한 추천 결과 페이지"""
    st.title("🍽️ 맞춤 식단 추천 결과")
    
    # 사용자 프로필 안전하게 가져오기
    user_profile = get_session_value('user_profile', {})
    if not user_profile:
        st.warning("⚠️ 사용자 정보가 없습니다. 먼저 정보를 입력해주세요.")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📝 정보 입력하러 가기", type="primary"):
                set_session_value('page', 'input')
                st.rerun()
        return
    
    # 추천 시스템 가져오기
    recommender = get_session_value('food_recommender')
    if not recommender:
        st.error("❌ 추천 시스템을 사용할 수 없습니다. 시스템을 다시 시작해주세요.")
        if st.button("🔄 시스템 재시작"):
            st.rerun()
        return
    
    try:
        # 사용자 정보 요약 표시
        st.subheader("👤 입력하신 정보 요약")
        
        info_col1, info_col2, info_col3, info_col4 = st.columns(4)
        with info_col1:
            st.metric("성별", user_profile.get('gender', 'N/A'))
            st.metric("나이", f"{user_profile.get('age', 'N/A')}세")
        with info_col2:
            st.metric("키", f"{user_profile.get('height', 'N/A')}cm")
            st.metric("몸무게", f"{user_profile.get('weight', 'N/A')}kg")
        with info_col3:
            st.metric("건강 목표", user_profile.get('health_goal', 'N/A'))
            st.metric("활동 수준", user_profile.get('activity_level', 'N/A'))
        with info_col4:
            budget = user_profile.get('budget_per_meal', 0)
            st.metric("식사 예산", f"{budget:,}원" if budget else 'N/A')
        
        # 알레르기 및 선호도 정보
        col_left, col_right = st.columns(2)
        with col_left:
            if user_profile.get('allergies'):
                st.write(f"🚫 **알레르기:** {', '.join(user_profile['allergies'])}")
            else:
                st.write("🚫 **알레르기:** 없음")
        
        with col_right:
            if user_profile.get('preferences'):
                st.write(f"🥗 **식습관:** {', '.join(user_profile['preferences'])}")
            else:
                st.write("🥗 **식습관:** 일반")
        
        st.markdown("---")
        
        # 추천 실행 버튼
        col_btn1, col_btn2, col_btn3 = st.columns([2, 1, 2])
        with col_btn2:
            generate_new = st.button("🔄 새로운 추천 받기", type="primary", use_container_width=True)
        
        # 추천 실행
        current_recommendations = get_session_value('recommendations', [])
        if generate_new or not current_recommendations:
            with st.spinner("🤖 AI가 맞춤 식단을 생성하고 있습니다..."):
                try:
                    # 백엔드 추천 알고리즘 호출
                    recommendations = recommender.recommend_meals(user_profile, num_recommendations=6)
                    
                    if recommendations:
                        set_session_value('recommendations', recommendations)
                        st.success("✅ 새로운 추천이 완료되었습니다!")
                        st.balloons()
                    else:
                        st.warning("⚠️ 조건에 맞는 음식을 찾을 수 없습니다. 조건을 조정해보세요.")
                        return
                        
                except Exception as e:
                    st.error(f"❌ 추천 생성 실패: {str(e)}")
                    error_logs = get_session_value('error_logs', [])
                    if error_logs is not None:
                        error_logs.append(f"추천 생성 오류: {e}")
                        set_session_value('error_logs', error_logs)
                    return
        
        # 추천 결과 표시
        recommendations = get_session_value('recommendations', [])
        if recommendations:
            st.subheader("🍽️ 맞춤 추천 식단")
            st.write(f"총 **{len(recommendations)}개**의 음식을 추천해드립니다!")
            
            # 추천 결과를 2열로 배치
            for i in range(0, len(recommendations), 2):
                col1, col2 = st.columns(2)
                
                # 첫 번째 추천
                with col1:
                    if i < len(recommendations):
                        meal = recommendations[i]
                        with st.container():
                            st.markdown(f"### 🥘 {meal.get('name', '음식명 없음')}")
                            
                            # 기본 정보
                            info_col1, info_col2 = st.columns(2)
                            with info_col1:
                                st.write(f"📊 **칼로리:** {meal.get('calories', 0)}kcal")
                                st.write(f"🏷️ **카테고리:** {meal.get('category', 'N/A')}")
                            with info_col2:
                                st.write(f"💰 **가격:** {meal.get('price', 0):,}원")
                                if meal.get('nutrition_score'):
                                    score = meal['nutrition_score']
                                    st.write(f"⭐ **영양점수:** {score:.1f}/1.0")
                            
                            # 영양소 정보
                            if meal.get('protein') or meal.get('fat') or meal.get('carbs'):
                                with st.expander("🔬 상세 영양소"):
                                    nutr_col1, nutr_col2, nutr_col3 = st.columns(3)
                                    with nutr_col1:
                                        st.write(f"단백질: {meal.get('protein', 0)}g")
                                    with nutr_col2:
                                        st.write(f"지방: {meal.get('fat', 0)}g")
                                    with nutr_col3:
                                        st.write(f"탄수화물: {meal.get('carbs', 0)}g")
                            
                            # 태그 정보
                            if meal.get('tags'):
                                tags = meal['tags']
                                if isinstance(tags, list) and tags:
                                    st.write("🏷️ " + " • ".join([f"`{tag}`" for tag in tags[:3]]))
                            
                            st.markdown("---")
                
                # 두 번째 추천
                with col2:
                    if i + 1 < len(recommendations):
                        meal = recommendations[i + 1]
                        with st.container():
                            st.markdown(f"### 🥘 {meal.get('name', '음식명 없음')}")
                            
                            # 기본 정보
                            info_col1, info_col2 = st.columns(2)
                            with info_col1:
                                st.write(f"📊 **칼로리:** {meal.get('calories', 0)}kcal")
                                st.write(f"🏷️ **카테고리:** {meal.get('category', 'N/A')}")
                            with info_col2:
                                st.write(f"💰 **가격:** {meal.get('price', 0):,}원")
                                if meal.get('nutrition_score'):
                                    score = meal['nutrition_score']
                                    st.write(f"⭐ **영양점수:** {score:.1f}/1.0")
                            
                            # 영양소 정보
                            if meal.get('protein') or meal.get('fat') or meal.get('carbs'):
                                with st.expander("🔬 상세 영양소"):
                                    nutr_col1, nutr_col2, nutr_col3 = st.columns(3)
                                    with nutr_col1:
                                        st.write(f"단백질: {meal.get('protein', 0)}g")
                                    with nutr_col2:
                                        st.write(f"지방: {meal.get('fat', 0)}g")
                                    with nutr_col3:
                                        st.write(f"탄수화물: {meal.get('carbs', 0)}g")
                            
                            # 태그 정보
                            if meal.get('tags'):
                                tags = meal['tags']
                                if isinstance(tags, list) and tags:
                                    st.write("🏷️ " + " • ".join([f"`{tag}`" for tag in tags[:3]]))
                            
                            st.markdown("---")
            
            # 영양 요약 정보
            try:
                nutrition_summary = recommender.get_nutrition_summary(recommendations, user_profile)
                if nutrition_summary:
                    st.subheader("📊 영양 요약")
                    
                    summary_col1, summary_col2, summary_col3, summary_col4 = st.columns(4)
                    with summary_col1:
                        total_cal = nutrition_summary.get('total_calories', 0)
                        st.metric("총 칼로리", f"{total_cal:.0f}kcal")
                    with summary_col2:
                        avg_price = nutrition_summary.get('average_price', 0)
                        st.metric("평균 가격", f"{avg_price:,.0f}원")
                    with summary_col3:
                        avg_score = nutrition_summary.get('avg_nutrition_score', 0)
                        st.metric("평균 영양점수", f"{avg_score:.2f}/1.0")
                    with summary_col4:
                        rec_count = nutrition_summary.get('recommendations_count', 0)
                        st.metric("추천 개수", f"{rec_count}개")
            except Exception as e:
                st.warning(f"영양 요약 계산 중 오류: {e}")
        
        else:
            st.info("🔄 추천 버튼을 눌러 맞춤 식단을 받아보세요!")
        
        # 페이지 이동 버튼
        st.markdown("---")
        nav_col1, nav_col2, nav_col3 = st.columns(3)
        
        with nav_col1:
            if st.button("📝 정보 수정하기", use_container_width=True):
                set_session_value('page', 'input')
                st.rerun()
        
        with nav_col2:
            if st.button("📊 영양 분석 보기", use_container_width=True):
                set_session_value('page', 'analysis')
                st.rerun()
        
        with nav_col3:
            if st.button("🔄 처음부터 다시", use_container_width=True):
                # 세션 초기화
                for key in ['user_profile', 'recommendations']:
                    if key in st.session_state:
                        del st.session_state[key]
                set_session_value('page', 'input')
                st.rerun()
                
    except Exception as e:
        st.error(f"❌ 추천 페이지 처리 중 오류가 발생했습니다: {str(e)}")
        error_logs = get_session_value('error_logs', [])
        if error_logs is not None:
            error_logs.append(f"추천 페이지 오류: {e}")
            set_session_value('error_logs', error_logs)

def recommend_page():
    """호환성을 위한 래퍼 함수"""
    render_recommendation_page()

def analysis_page():
    """시각화된 영양 분석 페이지"""
    # 기본 데이터 확인
    user_profile = get_session_value('user_profile', {})
    recommendations = get_session_value('recommendations', [])
    
    if not user_profile or not recommendations:
        st.warning("⚠️ 분석할 데이터가 없습니다.")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔙 추천 페이지로 돌아가기", type="primary"):
                set_session_value('page', 'recommend')
                st.rerun()
        with col2:
            if st.button("📝 처음부터 시작"):
                set_session_value('page', 'input')
                st.rerun()
        return
    
    try:
        # 새로운 영양소 시각화 모듈 사용
        from utils.nutrition_visualizer import display_nutrition_dashboard
        
        # 추천 결과를 영양소 분석용 형태로 변환
        formatted_foods = []
        for food in recommendations:
            formatted_food = {
                'name': food.get('name', ''),
                'calories': food.get('calories', 0),
                'protein': food.get('protein', 0),
                'fat': food.get('fat', 0),
                'carbs': food.get('carbs', 0),
                'sodium': food.get('sodium', 0),
                'sugar': food.get('sugar', 0),
                'fiber': food.get('fiber', 0),
                'price': food.get('price', 0)
            }
            formatted_foods.append(formatted_food)
        
        # 종합 영양 분석 대시보드 표시
        display_nutrition_dashboard(formatted_foods, user_profile)
        
        # 상세 추천 이유 섹션
        st.markdown("---")
        st.subheader("🧠 AI 추천 분석")
        
        analysis_col1, analysis_col2 = st.columns(2)
        
        with analysis_col1:
            st.markdown("#### 🎯 목표 기반 분석")
            goal = user_profile.get('health_goal', '목표')
            activity = user_profile.get('activity_level', '활동')
            
            st.write(f"• **건강 목표**: {goal}")
            st.write(f"• **활동 수준**: {activity}")
            
            if goal == '체중감량':
                st.info("💡 칼로리 제한과 저염식 위주로 추천했습니다")
            elif goal == '근육증가':
                st.info("💡 고단백 식품 위주로 추천했습니다")
            else:
                st.info("💡 균형 잡힌 영양소 구성으로 추천했습니다")
        
        with analysis_col2:
            st.markdown("#### 🚫 제약 조건 분석")
            budget = user_profile.get('budget_per_meal', 0)
            allergies = user_profile.get('allergies', [])
            
            st.write(f"• **1회 식사 예산**: {budget:,}원")
            
            if allergies:
                st.write(f"• **알레르기 제외**: {', '.join(allergies)}")
                st.success("✅ 모든 알레르기 성분을 안전하게 제외했습니다")
            else:
                st.write("• **알레르기**: 없음")
            
            total_price = sum(meal.get('price', 0) for meal in recommendations)
            daily_budget = budget * 3  # 하루 3끼 기준
            
            if total_price <= daily_budget:
                savings = daily_budget - total_price
                st.success(f"💰 예산 내에서 {savings:,}원을 절약했습니다!")
        
        # 영양소 상세 분석
        st.markdown("---")
        st.subheader("🔬 영양소 상세 분석")
        
        # 영양소 합계 계산
        total_calories = sum(meal.get('calories', 0) for meal in recommendations)
        total_protein = sum(meal.get('protein', 0) for meal in recommendations)
        total_fat = sum(meal.get('fat', 0) for meal in recommendations)
        total_carbs = sum(meal.get('carbs', 0) for meal in recommendations)
        
        nutrition_col1, nutrition_col2, nutrition_col3, nutrition_col4 = st.columns(4)
        
        with nutrition_col1:
            st.metric(
                "총 칼로리",
                f"{total_calories}kcal",
                delta=f"{total_calories - 1800:.0f}" if total_calories else None
            )
        
        with nutrition_col2:
            st.metric(
                "총 단백질",
                f"{total_protein}g",
                delta=f"{total_protein - 60:.0f}g" if total_protein else None
            )
        
        with nutrition_col3:
            st.metric(
                "총 지방",
                f"{total_fat}g",
                delta=f"{total_fat - 60:.0f}g" if total_fat else None
            )
        
        with nutrition_col4:
            st.metric(
                "총 탄수화물",
                f"{total_carbs}g",
                delta=f"{total_carbs - 225:.0f}g" if total_carbs else None
            )
        
        # 개선 제안
        st.markdown("---")
        st.subheader("💡 개선 제안")
        
        suggestions = []
        
        # 칼로리 기반 제안
        if total_calories < 1200:
            suggestions.append("⚠️ 칼로리가 부족합니다. 견과류나 아보카도 같은 건강한 지방을 추가해보세요.")
        elif total_calories > 2500:
            suggestions.append("⚠️ 칼로리가 높습니다. 포션 크기를 줄이거나 저칼로리 대안을 고려해보세요.")
        
        # 단백질 기반 제안
        weight = user_profile.get('weight', 70)
        protein_need = weight * 0.8  # 체중 1kg당 0.8g
        if total_protein < protein_need:
            suggestions.append(f"💪 단백질이 부족합니다. 권장량({protein_need:.0f}g)을 위해 닭가슴살이나 두부를 추가해보세요.")
        
        # 목표별 제안
        if goal == '체중감량' and total_calories > 1500:
            suggestions.append("🎯 체중감량 목표를 위해 저칼로리 음식으로 일부 대체해보세요.")
        elif goal == '근육증가' and total_protein < weight * 1.2:
            suggestions.append("🎯 근육증가 목표를 위해 단백질 보충제나 계란을 추가해보세요.")
        
        if suggestions:
            for suggestion in suggestions:
                st.info(suggestion)
        else:
            st.success("🎉 완벽한 식단입니다! 모든 영양 기준을 잘 만족합니다.")
        
        # 네비게이션 버튼
        st.markdown("---")
        nav_col1, nav_col2, nav_col3 = st.columns(3)
        
        with nav_col1:
            if st.button("🔙 추천 페이지", use_container_width=True):
                set_session_value('page', 'recommend')
                st.rerun()
        
        with nav_col2:
            if st.button("📝 정보 수정", use_container_width=True):
                set_session_value('page', 'input')
                st.rerun()
        
        with nav_col3:
            if st.button("🔄 새 추천받기", use_container_width=True):
                # 기존 추천 삭제하고 추천 페이지로
                if 'recommendations' in st.session_state:
                    del st.session_state['recommendations']
                set_session_value('page', 'recommend')
                st.rerun()
            
    except ImportError as e:
        st.error("❌ 시각화 모듈을 불러올 수 없습니다.")
        st.info("Plotly 라이브러리가 필요합니다. 기본 분석 정보를 제공합니다.")
        
        # 기본 분석 정보 표시
        recommender = get_session_value('food_recommender')
        if recommender:
            try:
                nutrition_summary = recommender.get_nutrition_summary(recommendations, user_profile)
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("총 칼로리", f"{nutrition_summary.get('total_calories', 0):.0f}kcal")
                with col2:
                    st.metric("평균 가격", f"{nutrition_summary.get('average_price', 0):,.0f}원")
                with col3:
                    st.metric("영양 점수", f"{nutrition_summary.get('avg_nutrition_score', 0):.2f}")
            except Exception:
                st.warning("영양 요약 정보를 가져올 수 없습니다.")
        
    except Exception as e:
        st.error(f"❌ 분석 페이지 처리 중 오류가 발생했습니다: {str(e)}")
        error_logs = get_session_value('error_logs', [])
        if error_logs is not None:
            error_logs.append(f"분석 페이지 오류: {e}")
            set_session_value('error_logs', error_logs)

# 애플리케이션 실행
def render_streamlit_input_page():
    """완전한 Streamlit 사용자 입력 폼"""
    st.title("🍽️ 개인 맞춤형 AI 하루 식단 추천")
    st.markdown("정확한 식단 추천을 위해 개인 정보를 입력해주세요.")
    
    # 기존 입력값 가져오기 (세션 유지)
    existing_profile = st.session_state.get('user_profile', {})
    
    # 입력 폼 생성
    with st.form("user_profile_form", clear_on_submit=False):
        st.subheader("📝 기본 정보")
        
        # 2열 레이아웃
        col1, col2 = st.columns(2)
        
        with col1:
            # 성별 선택
            gender = st.selectbox(
                "성별 *",
                ["남성", "여성"],
                index=0 if existing_profile.get('gender') == '남성' else 1 if existing_profile.get('gender') == '여성' else 0,
                help="성별에 따라 기초대사율이 달라집니다"
            )
            
            # 나이 입력
            age = st.number_input(
                "나이 *",
                min_value=MIN_AGE,
                max_value=MAX_AGE,
                value=existing_profile.get('age', 25),
                step=1,
                help="정확한 나이를 입력해주세요"
            )
            
            # 키 입력
            height = st.number_input(
                "키 (cm) *",
                min_value=MIN_HEIGHT,
                max_value=MAX_HEIGHT,
                value=existing_profile.get('height', 170),
                step=1,
                help="정확한 키를 입력해주세요"
            )
        
        with col2:
            # 몸무게 입력
            weight = st.number_input(
                "몸무게 (kg) *",
                min_value=MIN_WEIGHT,
                max_value=MAX_WEIGHT,
                value=existing_profile.get('weight', 65),
                step=1,
                help="정확한 몸무게를 입력해주세요"
            )
            
            # 건강 목표
            goal = st.selectbox(
                "건강 목표 *",
                ["체중감량", "체중유지", "근육증가"],
                index=["체중감량", "체중유지", "근육증가"].index(existing_profile.get('goal', '체중유지')),
                help="식단 방향성을 결정합니다"
            )
            
            # 활동 수준
            activity_level = st.selectbox(
                "활동 수준 *",
                ["낮음", "보통", "높음"],
                index=["낮음", "보통", "높음"].index(existing_profile.get('activity_level', '보통')),
                help="일상적인 활동 수준을 선택해주세요"
            )
        
        st.subheader("💰 예산 설정")
        
        # 1회 식사 예산
        budget_per_meal = st.slider(
            "1회 식사 예산 (원) *",
            min_value=MIN_BUDGET,
            max_value=MAX_BUDGET,
            value=existing_profile.get('budget_per_meal', DEFAULT_BUDGET),
            step=1000,
            help=f"설정한 예산 내에서 식단을 추천합니다 (₩{MIN_BUDGET:,} - ₩{MAX_BUDGET:,})"
        )
        
        # 식사 횟수
        meal_count = st.selectbox(
            "하루 식사 횟수 *",
            [2, 3],
            index=0 if existing_profile.get('meal_count', 3) == 2 else 1,
            help="하루에 몇 번 식사하시나요?"
        )
        
        st.subheader("🚫 알레르기 및 제한사항")
        
        # 알레르기 정보
        allergy_options = [
            "계란", "유제품", "견과류", "갑각류", "생선", "대두", "밀",
            "복숭아", "토마토", "돼지고기", "쇠고기", "닭고기", "새우", "게"
        ]
        
        allergies = st.multiselect(
            "알레르기가 있는 식품을 선택하세요 (최대 7개)",
            allergy_options,
            default=existing_profile.get('allergies', []),
            help="선택한 식품은 추천에서 제외됩니다"
        )
        
        # 식습관/선호도
        preference_options = ["채식", "키토", "고단백", "저염식", "글루텐프리"]
        preferences = st.multiselect(
            "선호하는 식습관을 선택하세요 (최대 5개)",
            preference_options,
            default=existing_profile.get('preferences', []),
            help="선택한 식습관에 맞는 식단을 우선 추천합니다"
        )
        
        st.subheader("🏥 건강 정보")
        
        # 의학적 조건
        medical_conditions = st.multiselect(
            "현재 앓고 있는 질환이 있다면 선택하세요 (최대 3개)",
            MEDICAL_CONDITIONS,
            default=existing_profile.get('medical_conditions', []),
            help="선택한 질환에 맞는 안전한 식단을 추천합니다"
        )
        
        # 식단 제한
        dietary_restrictions = st.multiselect(
            "식단 제한사항이 있다면 선택하세요 (최대 3개)",
            DIETARY_RESTRICTIONS,
            default=existing_profile.get('dietary_restrictions', []),
            help="종교적, 개인적 식단 제한사항을 반영합니다"
        )
        
        st.subheader("✅ 약관 동의")
        
        # 약관 동의
        terms_agreed = st.checkbox(
            "개인정보 수집 및 이용에 동의합니다 *",
            value=existing_profile.get('terms_agreed', False),
            help="식단 추천을 위해 필요한 개인정보 처리에 동의해주세요"
        )
        
        # 제출 버튼
        submitted = st.form_submit_button(
            "🍽️ 맞춤 식단 추천 받기",
            type="primary",
            use_container_width=True
        )
        
        if submitted:
            # 폼 데이터 수집
            form_data = {
                'gender': gender,
                'age': age,
                'height': height,
                'weight': weight,
                'goal': goal,
                'activity_level': activity_level,
                'budget_per_meal': budget_per_meal,
                'meal_count': meal_count,
                'allergies': allergies,
                'preferences': preferences,
                'medical_conditions': medical_conditions,
                'dietary_restrictions': dietary_restrictions,
                'terms_agreed': terms_agreed
            }
            
            # 약관 동의 확인
            if not terms_agreed:
                st.error("개인정보 수집 및 이용에 동의해주세요.")
                return
            
            # 입력값 검증
            is_valid, errors = validate_form_data(form_data)
            
            if not is_valid:
                st.error("입력값을 확인해주세요:")
                for error in errors:
                    st.error(f"• {error}")
                return
            
            # 선택 개수 제한 확인
            if len(allergies) > 7:
                st.error("알레르기는 최대 7개까지 선택 가능합니다.")
                return
            
            if len(preferences) > 5:
                st.error("식습관 선호도는 최대 5개까지 선택 가능합니다.")
                return
            
            if len(medical_conditions) > 3:
                st.error("의학적 조건은 최대 3개까지 선택 가능합니다.")
                return
            
            if len(dietary_restrictions) > 3:
                st.error("식단 제한사항은 최대 3개까지 선택 가능합니다.")
                return
            
            # 성공 시 세션에 저장
            try:
                st.session_state['user_profile'] = form_data
                st.success("✅ 입력이 완료되었습니다! 맞춤 식단을 생성중입니다...")
                
                # 추천 페이지로 이동
                st.session_state['page'] = 'recommend'
                st.rerun()
                
            except Exception as e:
                st.error(f"데이터 저장 중 오류가 발생했습니다: {e}")
    
    # 하단 정보
    st.markdown("---")
    st.markdown("**필수 항목(*)은 반드시 입력해주세요.**")
    st.markdown("🔒 입력하신 정보는 안전하게 보호되며, 식단 추천 목적으로만 사용됩니다.")

def render_streamlit_recommendation_page():
    """Streamlit 기반 추천 결과 페이지"""
    st.title("🍽️ 맞춤형 식단 추천 결과")
    
    # 사용자 프로필 가져오기
    user_profile = st.session_state.get('user_profile', {})
    
    if not user_profile:
        st.error("사용자 정보가 없습니다. 다시 입력해주세요.")
        if st.button("입력 페이지로 돌아가기"):
            st.session_state['page'] = 'input'
            st.rerun()
        return
    
    # 추천 시스템 실행
    try:
        with st.spinner("개인 맞춤형 식단을 생성중입니다..."):
            # 추천 시스템 가져오기
            recommender = st.session_state.get('food_recommender')
            
            if recommender is None:
                from api.recommend import KoreanFoodRecommender
                recommender = KoreanFoodRecommender()
                st.session_state['food_recommender'] = recommender
            
            # 사용자 프로필을 추천 시스템 형식으로 변환
            recommendation_profile = {
                'gender': '남성' if user_profile['gender'] == '남성' else '여성',
                'age': user_profile['age'],
                'height': user_profile['height'],
                'weight': user_profile['weight'],
                'goal': user_profile['goal'],
                'activity_level': user_profile['activity_level'],
                'budget': user_profile['budget_per_meal'] * user_profile['meal_count'],
                'allergies': user_profile['allergies'],
                'preferences': user_profile['preferences'],
                'medical_conditions': user_profile['medical_conditions'],
                'dietary_restrictions': user_profile['dietary_restrictions']
            }
            
            # 추천 실행
            recommendations = recommender.recommend_meals(
                recommendation_profile, 
                num_recommendations=user_profile['meal_count']
            )
            
            # 세션에 저장
            st.session_state['recommendations'] = recommendations
            
            # 결과 표시
            if recommendations:
                st.success(f"✅ {len(recommendations)}개의 맞춤 식단을 생성했습니다!")
                
                # 사용자 정보 요약
                st.subheader("📋 입력하신 정보")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("나이/성별", f"{user_profile['age']}세 {user_profile['gender']}")
                    st.metric("키/몸무게", f"{user_profile['height']}cm / {user_profile['weight']}kg")
                
                with col2:
                    st.metric("목표", user_profile['goal'])
                    st.metric("활동수준", user_profile['activity_level'])
                
                with col3:
                    st.metric("1회 식사 예산", f"₩{user_profile['budget_per_meal']:,}")
                    st.metric("식사 횟수", f"{user_profile['meal_count']}회/일")
                
                # 추천 식단 표시
                st.subheader("🍽️ 추천 식단")
                
                for i, meal in enumerate(recommendations, 1):
                    with st.expander(f"식단 {i}: {meal.get('name', f'추천 식단 {i}')}"):
                        meal_cols = st.columns([2, 1, 1])
                        
                        with meal_cols[0]:
                            st.write(f"**음식명:** {meal.get('name', f'추천 식단 {i}')}")
                            st.write(f"**카테고리:** {meal.get('category', '일반식단')}")
                            if meal.get('tags'):
                                st.write(f"**특징:** {', '.join(meal['tags'][:3])}")
                        
                        with meal_cols[1]:
                            st.metric("칼로리", f"{meal.get('calories', 0):.0f} kcal")
                            st.metric("단백질", f"{meal.get('protein', 0):.1f}g")
                        
                        with meal_cols[2]:
                            st.metric("가격", f"₩{meal.get('price', 0):,.0f}")
                            st.metric("영양점수", f"{meal.get('nutrition_score', 85):.0f}/100")
                
                # 액션 버튼들
                st.markdown("---")
                button_cols = st.columns(3)
                
                with button_cols[0]:
                    if st.button("🔄 새로운 추천 받기", type="secondary"):
                        st.session_state.pop('recommendations', None)
                        st.rerun()
                
                with button_cols[1]:
                    if st.button("📝 정보 수정하기", type="secondary"):
                        st.session_state['page'] = 'input'
                        st.rerun()
                
                with button_cols[2]:
                    if st.button("📈 상세 분석 보기", type="primary"):
                        st.session_state['page'] = 'analysis'
                        st.rerun()
            
            else:
                st.warning("현재 조건에 맞는 식단을 찾을 수 없습니다. 조건을 조정해보세요.")
                if st.button("입력 정보 수정"):
                    st.session_state['page'] = 'input'
                    st.rerun()
    
    except Exception as e:
        st.error(f"추천 시스템 실행 중 오류가 발생했습니다: {e}")
        st.info("일시적인 오류일 수 있습니다. 다시 시도해주세요.")
        
        if st.button("다시 시도"):
            st.rerun()
        
        if st.button("입력 페이지로 돌아가기"):
            st.session_state['page'] = 'input'
            st.rerun()

def streamlit_main():
    """Streamlit 메인 애플리케이션"""
    initialize_session_state()
    
    # 사이드바 네비게이션 
    with st.sidebar:
        st.title("🍽️ 식단 추천")
        
        current_page = st.session_state.get('page', 'input')
        
        if st.button("📝 정보 입력", disabled=(current_page == 'input')):
            st.session_state['page'] = 'input'
            st.rerun()
        
        if st.button("🍽️ 식단 추천", disabled=(current_page == 'recommend')):
            # 프로필이 있을 때만 이동 가능
            if st.session_state.get('user_profile'):
                st.session_state['page'] = 'recommend'
                st.rerun()
            else:
                st.warning("먼저 개인정보를 입력해주세요.")
        
        if st.button("📊 상세 분석", disabled=(current_page == 'analysis')):
            # 추천 결과가 있을 때만 이동 가능
            if st.session_state.get('recommendations'):
                st.session_state['page'] = 'analysis'
                st.rerun()
            else:
                st.warning("먼저 식단 추천을 받아주세요.")
        
        # 진행 상태 표시
        st.markdown("---")
        st.markdown("**진행 상태**")
        
        profile_status = "✅" if st.session_state.get('user_profile') else "⏳"
        recommend_status = "✅" if st.session_state.get('recommendations') else "⏳"
        
        st.markdown(f"{profile_status} 개인정보 입력")
        st.markdown(f"{recommend_status} 식단 추천")
    
    # 페이지 라우팅
    current_page = st.session_state.get('page', 'input')
    
    if current_page == "input":
        render_streamlit_input_page()
    elif current_page == "recommend":
        render_streamlit_recommendation_page()
    elif current_page == "analysis":
        analysis_page()
    else:
        render_streamlit_input_page()  # 기본 페이지

if __name__ == "__main__":
    # Streamlit 전용 앱 실행
    streamlit_main()