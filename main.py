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

# 세션 상태 초기화 (강화된 예외 처리)
def initialize_session_state():
    """세션 상태를 안전하게 초기화합니다."""
    try:
        if 'page' not in st.session_state:
            st.session_state.page = "input"
        
        if 'user_profile' not in st.session_state:
            st.session_state.user_profile = {}
        
        if 'recommendations' not in st.session_state:
            st.session_state.recommendations = []
        
        if 'food_recommender' not in st.session_state:
            # 추천 시스템 초기화 시 예외 처리
            try:
                from food_recommender import KoreanFoodRecommender
                st.session_state.food_recommender = KoreanFoodRecommender()
            except ImportError as e:
                st.error(f"❌ 추천 시스템 로드 실패: {e}")
                st.session_state.food_recommender = None
            except Exception as e:
                st.error(f"❌ 예상치 못한 오류: {e}")
                st.session_state.food_recommender = None
    
    except Exception as e:
        st.error(f"❌ 세션 초기화 실패: {e}")

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
                st.session_state.user_profile = get_sample_user_profile()
                st.session_state.page = "recommend"
                st.success("✅ 테스트 데이터가 로드되었습니다!")
                st.rerun()
            except Exception as e:
                st.error(f"❌ 테스트 데이터 로드 실패: {e}")
        
        # 현재 페이지 표시
        current_page = st.session_state.get("page", "input")
        st.sidebar.write(f"현재 페이지: **{current_page}**")
        
        # 기본 메시지
        if current_page == "input":
            st.info("👆 왼쪽 사이드바에서 '테스트 데이터 로드' 버튼을 눌러 빠르게 테스트해보세요!")
        
        # 추천 시스템 상태 확인
        if st.session_state.food_recommender is None:
            st.warning("⚠️ 추천 시스템이 초기화되지 않았습니다. 페이지를 새로고침해주세요.")
            return
        
        st.success("✅ 시스템이 정상적으로 초기화되었습니다!")
        
    except Exception as e:
        st.error(f"❌ 애플리케이션 실행 중 오류 발생: {e}")
        st.write("오류 세부 정보:", str(e))

# 애플리케이션 실행
if __name__ == "__main__":
    main()