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

def render_input_page():
    """완전한 사용자 정보 입력 페이지"""
    st.title("🍽️ 개인 맞춤 식단 추천 시스템")
    st.markdown("### 건강한 한국 음식 추천을 위해 정보를 입력해주세요")
    st.markdown("---")
    
    # 현재 프로필 데이터 안전하게 가져오기
    current_profile = get_session_value('user_profile', {})
    
    # 입력 폼 생성
    with st.form("comprehensive_user_input_form"):
        # 1. 기본 정보 섹션
        st.subheader("👤 기본 정보")
        col1, col2 = st.columns(2)
        
        with col1:
            gender = st.selectbox(
                "성별 *", 
                ["남성", "여성"], 
                index=0 if current_profile.get('gender', '남성') == '남성' else 1,
                help="필수 입력 항목입니다"
            )
            age = st.number_input(
                "나이 *", 
                min_value=10, 
                max_value=120, 
                value=current_profile.get('age', 25), 
                step=1,
                help="10세 ~ 120세 사이로 입력해주세요"
            )
        
        with col2:
            height = st.number_input(
                "키 (cm) *", 
                min_value=100, 
                max_value=250, 
                value=current_profile.get('height', 170), 
                step=1,
                help="100cm ~ 250cm 사이로 입력해주세요"
            )
            weight = st.number_input(
                "몸무게 (kg) *", 
                min_value=30, 
                max_value=200, 
                value=current_profile.get('weight', 70), 
                step=1,
                help="30kg ~ 200kg 사이로 입력해주세요"
            )
        
        st.markdown("---")
        
        # 2. 건강 목표 및 활동 섹션
        st.subheader("🎯 건강 목표 및 활동 수준")
        col3, col4 = st.columns(2)
        
        with col3:
            health_goal = st.selectbox(
                "건강 목표 *", 
                ["체중감량", "체중유지", "근육증가"], 
                index=["체중감량", "체중유지", "근육증가"].index(
                    current_profile.get('health_goal', '체중감량')
                ),
                help="현재 목표를 선택해주세요"
            )
            activity_level = st.selectbox(
                "활동 수준", 
                ["낮음", "보통", "높음"], 
                index=["낮음", "보통", "높음"].index(
                    current_profile.get('activity_level', '보통')
                ),
                help="낮음: 사무직, 보통: 가벼운 운동, 높음: 격한 운동"
            )
        
        with col4:
            budget_per_meal = st.slider(
                "1회 식사 예산 (원) *", 
                min_value=1000, 
                max_value=20000, 
                value=current_profile.get('budget_per_meal', 8000), 
                step=500,
                help="한 끼 식사에 사용할 수 있는 예산을 설정해주세요"
            )
            st.write(f"선택된 예산: {budget_per_meal:,}원")
        
        st.markdown("---")
        
        # 3. 알레르기 정보 섹션
        st.subheader("🚫 알레르기 정보")
        st.write("알레르기가 있는 항목을 선택해주세요 (최대 7개)")
        
        allergy_options = ["견과류", "갑각류", "유제품", "계란", "밀가루", "콩", "생선", "조개류"]
        current_allergies = current_profile.get('allergies', [])
        
        allergies = st.multiselect(
            "알레르기 항목",
            options=allergy_options,
            default=current_allergies,
            help="해당하는 알레르기를 모두 선택해주세요"
        )
        
        st.markdown("---")
        
        # 4. 식습관/선호도 섹션
        st.subheader("🥗 식습관 및 선호도")
        st.write("선호하는 식습관을 선택해주세요 (최대 5개)")
        
        preference_options = ["저염식", "저당식", "고단백", "채식위주", "키토", "비건", "일반식"]
        current_preferences = current_profile.get('preferences', [])
        
        preferences = st.multiselect(
            "식습관/선호도",
            options=preference_options,
            default=current_preferences,
            help="원하는 식습관이나 다이어트 방식을 선택해주세요"
        )
        
        st.markdown("---")
        
        # 5. 질환 정보 섹션 (선택사항)
        st.subheader("⚕️ 건강 상태 (선택사항)")
        st.write("현재 관리 중인 질환이 있다면 선택해주세요 (최대 5개)")
        
        disease_options = ["당뇨", "고혈압", "고지혈증", "위장장애", "신장질환"]
        current_diseases = current_profile.get('diseases', [])
        
        diseases = st.multiselect(
            "질환 정보",
            options=disease_options,
            default=current_diseases,
            help="식단 추천 시 고려할 질환을 선택해주세요"
        )
        
        st.markdown("---")
        
        # 6. 약관 동의 섹션
        st.subheader("📋 약관 동의")
        
        col5, col6 = st.columns([3, 1])
        with col5:
            privacy_agreement = st.checkbox(
                "개인정보 수집 및 이용에 동의합니다",
                value=current_profile.get('privacy_agreement', False),
                help="입력하신 정보는 식단 추천 목적으로만 사용됩니다"
            )
            service_agreement = st.checkbox(
                "서비스 이용약관에 동의합니다",
                value=current_profile.get('service_agreement', False),
                help="추천 서비스 이용을 위해 동의가 필요합니다"
            )
        
        # 폼 제출 버튼
        st.markdown("---")
        submitted = st.form_submit_button(
            "🔍 맞춤 식단 추천받기", 
            type="primary", 
            use_container_width=True
        )
        
        # 폼 제출 처리
        if submitted:
            try:
                # 약관 동의 확인
                if not privacy_agreement or not service_agreement:
                    st.error("❌ 서비스 이용을 위해 약관 동의가 필요합니다.")
                    return
                
                # 사용자 프로필 구성
                user_profile = {
                    'gender': gender,
                    'age': age,
                    'height': height,
                    'weight': weight,
                    'health_goal': health_goal,
                    'activity_level': activity_level,
                    'budget_per_meal': budget_per_meal,
                    'allergies': allergies,
                    'preferences': preferences,
                    'diseases': diseases,
                    'privacy_agreement': privacy_agreement,
                    'service_agreement': service_agreement
                }
                
                # 입력값 검증
                from utils.validators import (
                    validate_user_profile, 
                    validate_selection_limits,
                    validate_age,
                    validate_height_weight,
                    validate_budget
                )
                
                # 개별 검증
                age_valid, age_error = validate_age(age)
                if not age_valid:
                    st.error(f"❌ {age_error}")
                    return
                
                height_weight_valid, hw_errors = validate_height_weight(height, weight)
                if not height_weight_valid:
                    for error in hw_errors:
                        st.error(f"❌ {error}")
                    return
                
                budget_valid, budget_error = validate_budget(budget_per_meal)
                if not budget_valid:
                    st.error(f"❌ {budget_error}")
                    return
                
                selection_valid, selection_errors = validate_selection_limits(allergies, preferences, diseases)
                if not selection_valid:
                    for error in selection_errors:
                        st.error(f"❌ {error}")
                    return
                
                # 전체 프로필 검증
                profile_valid, profile_errors = validate_user_profile(user_profile)
                if not profile_valid:
                    st.error("❌ 입력값 검증 실패:")
                    for error in profile_errors:
                        st.error(f"• {error}")
                    return
                
                # 세션에 안전하게 저장
                if set_session_value('user_profile', user_profile):
                    # 추천 시스템 연동 준비
                    if set_session_value('page', 'recommend'):
                        st.success("✅ 정보가 저장되었습니다! 맞춤 식단을 생성하고 있습니다...")
                        st.balloons()  # 성공 시 축하 효과
                        st.rerun()
                    else:
                        st.error("❌ 페이지 이동에 실패했습니다.")
                else:
                    st.error("❌ 프로필 저장에 실패했습니다.")
                
            except Exception as e:
                st.error(f"❌ 정보 처리 중 오류가 발생했습니다: {e}")
                # 에러 로그 저장
                error_logs = get_session_value('error_logs', [])
                if error_logs is not None:
                    error_logs.append(f"사용자 입력 처리 오류: {e}")
                    set_session_value('error_logs', error_logs)
    
    # 입력 도움말
    with st.expander("💡 입력 도움말"):
        st.markdown("""
        **필수 항목 (*)**: 정확한 추천을 위해 반드시 입력해주세요.
        
        **건강 목표**:
        - 체중감량: 칼로리 제한 및 저염식 위주 추천
        - 체중유지: 균형 잡힌 영양소 구성 추천  
        - 근육증가: 고단백 식품 위주 추천
        
        **활동 수준**:
        - 낮음: 주로 앉아서 생활 (사무직 등)
        - 보통: 주 1-3회 가벼운 운동
        - 높음: 주 4회 이상 격한 운동
        
        **예산**: 설정한 예산 내에서 최적의 음식을 추천해드립니다.
        """)

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