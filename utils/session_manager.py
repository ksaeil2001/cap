"""
Streamlit 세션 상태 관리 유틸리티
"""

import streamlit as st
from typing import Dict, Any, Optional

class SessionManager:
    """세션 상태 안전 관리 클래스"""
    
    @staticmethod
    def get_user_profile() -> Dict[str, Any]:
        """사용자 프로필 안전하게 가져오기"""
        return st.session_state.get('user_profile', {})
    
    @staticmethod
    def set_user_profile(profile: Dict[str, Any]) -> None:
        """사용자 프로필 저장"""
        try:
            st.session_state['user_profile'] = profile
        except Exception as e:
            st.error(f"프로필 저장 실패: {e}")
    
    @staticmethod
    def get_current_page() -> str:
        """현재 페이지 상태 가져오기"""
        return st.session_state.get('page', 'input')
    
    @staticmethod
    def set_current_page(page: str) -> None:
        """페이지 상태 설정"""
        try:
            st.session_state['page'] = page
        except Exception as e:
            st.error(f"페이지 상태 변경 실패: {e}")
    
    @staticmethod
    def get_recommendations() -> list:
        """추천 결과 가져오기"""
        return st.session_state.get('recommendations', [])
    
    @staticmethod
    def set_recommendations(recommendations: list) -> None:
        """추천 결과 저장"""
        try:
            st.session_state['recommendations'] = recommendations
        except Exception as e:
            st.error(f"추천 결과 저장 실패: {e}")
    
    @staticmethod
    def get_recommender():
        """추천 시스템 인스턴스 가져오기"""
        return st.session_state.get('food_recommender', None)
    
    @staticmethod
    def clear_session() -> None:
        """세션 데이터 초기화"""
        try:
            keys_to_clear = ['user_profile', 'recommendations']
            for key in keys_to_clear:
                if key in st.session_state:
                    del st.session_state[key]
            st.success("세션 데이터가 초기화되었습니다.")
        except Exception as e:
            st.error(f"세션 초기화 실패: {e}")
    
    @staticmethod
    def is_profile_complete() -> bool:
        """프로필 완성 여부 확인"""
        profile = SessionManager.get_user_profile()
        required_fields = ['gender', 'age', 'height', 'weight', 'health_goal']
        
        for field in required_fields:
            if field not in profile or not profile[field]:
                return False
        return True
    
    @staticmethod
    def get_profile_field(field: str, default: Any = None) -> Any:
        """프로필 특정 필드 안전하게 가져오기"""
        profile = SessionManager.get_user_profile()
        return profile.get(field, default)