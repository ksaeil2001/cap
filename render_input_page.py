"""
완전한 Streamlit 사용자 입력 폼 구현
"""

import streamlit as st
from typing import Dict, Any
from utils.validators import validate_form_data
from utils.session_manager import SessionManager
from settings import (
    MIN_AGE, MAX_AGE, MIN_HEIGHT, MAX_HEIGHT, MIN_WEIGHT, MAX_WEIGHT,
    MIN_BUDGET, MAX_BUDGET, DEFAULT_BUDGET, MEDICAL_CONDITIONS, DIETARY_RESTRICTIONS
)

def render_input_page():
    """사용자 정보 입력 페이지 - 완전한 Streamlit 구현"""
    
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