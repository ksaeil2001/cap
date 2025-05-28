"""
사용자 입력값 검증 및 처리 유틸리티
"""

from typing import Dict, List, Any, Tuple
from settings import (
    MIN_BUDGET, MAX_BUDGET, MIN_AGE, MAX_AGE, 
    MIN_HEIGHT, MAX_HEIGHT, MIN_WEIGHT, MAX_WEIGHT,
    MAX_ALLERGIES, MAX_PREFERENCES, MAX_DISEASES,
    BUDGET_ERROR_MSG, AGE_ERROR_MSG, HEIGHT_ERROR_MSG, WEIGHT_ERROR_MSG,
    MEDICAL_CONDITIONS, DIETARY_RESTRICTIONS
)

def validate_user_profile(profile: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    사용자 프로필 데이터 검증
    
    Args:
        profile: 사용자 프로필 딕셔너리
        
    Returns:
        Tuple[bool, List[str]]: (검증 성공 여부, 오류 메시지 리스트)
    """
    errors = []
    
    try:
        # 필수 필드 검증
        required_fields = ['gender', 'age', 'height', 'weight', 'health_goal', 'budget_per_meal']
        for field in required_fields:
            if field not in profile or profile[field] is None:
                field_names = {
                    'gender': '성별',
                    'age': '나이', 
                    'height': '키',
                    'weight': '몸무게',
                    'health_goal': '건강 목표',
                    'budget_per_meal': '식사 예산'
                }
                errors.append(f"{field_names.get(field, field)}는 필수 입력 항목입니다.")
        
        # 나이 검증
        age = profile.get('age', 0)
        if not isinstance(age, (int, float)) or age < MIN_AGE or age > MAX_AGE:
            errors.append(AGE_ERROR_MSG)
        
        # 키 검증
        height = profile.get('height', 0)
        if not isinstance(height, (int, float)) or height < MIN_HEIGHT or height > MAX_HEIGHT:
            errors.append(HEIGHT_ERROR_MSG)
        
        # 몸무게 검증
        weight = profile.get('weight', 0)
        if not isinstance(weight, (int, float)) or weight < MIN_WEIGHT or weight > MAX_WEIGHT:
            errors.append(WEIGHT_ERROR_MSG)
        
        # 예산 검증
        budget = profile.get('budget_per_meal', 0)
        if not isinstance(budget, (int, float)) or budget < MIN_BUDGET or budget > MAX_BUDGET:
            errors.append(BUDGET_ERROR_MSG)
        
        # 알레르기 개수 검증
        allergies = profile.get('allergies', [])
        if isinstance(allergies, list) and len(allergies) > MAX_ALLERGIES:
            errors.append(f"알레르기는 최대 {MAX_ALLERGIES}개까지 선택할 수 있습니다.")
        
        # 선호도 개수 검증
        preferences = profile.get('preferences', [])
        if isinstance(preferences, list) and len(preferences) > MAX_PREFERENCES:
            errors.append(f"식습관/선호도는 최대 {MAX_PREFERENCES}개까지 선택할 수 있습니다.")
        
        # 질환 개수 검증
        diseases = profile.get('diseases', [])
        if isinstance(diseases, list) and len(diseases) > 5:
            errors.append("질환 정보는 최대 5개까지 선택할 수 있습니다.")
            
    except Exception as e:
        errors.append(f"검증 중 오류 발생: {str(e)}")
    
    return len(errors) == 0, errors

def validate_age(age: int) -> Tuple[bool, str]:
    """나이 유효성 검증"""
    try:
        if not isinstance(age, (int, float)):
            return False, "나이는 숫자여야 합니다."
        if age < 10 or age > 120:
            return False, "나이는 10세에서 120세 사이여야 합니다."
        return True, ""
    except:
        return False, "나이 검증 중 오류가 발생했습니다."

def validate_height_weight(height: float, weight: float) -> Tuple[bool, List[str]]:
    """키와 몸무게 유효성 검증"""
    errors = []
    try:
        if not isinstance(height, (int, float)) or height < 100 or height > 250:
            errors.append("키는 100cm에서 250cm 사이여야 합니다.")
        if not isinstance(weight, (int, float)) or weight < 30 or weight > 200:
            errors.append("몸무게는 30kg에서 200kg 사이여야 합니다.")
        return len(errors) == 0, errors
    except:
        return False, ["키와 몸무게 검증 중 오류가 발생했습니다."]

def validate_budget(budget: int) -> Tuple[bool, str]:
    """예산 유효성 검증"""
    try:
        if not isinstance(budget, (int, float)):
            return False, "예산은 숫자여야 합니다."
        if budget < MIN_BUDGET or budget > MAX_BUDGET:
            return False, BUDGET_ERROR_MSG
        return True, ""
    except:
        return False, "예산 검증 중 오류가 발생했습니다."

def validate_selection_limits(allergies: List[str], preferences: List[str], diseases: List[str]) -> Tuple[bool, List[str]]:
    """선택 항목 개수 제한 검증"""
    errors = []
    try:
        if len(allergies) > 7:
            errors.append("알레르기는 최대 7개까지 선택할 수 있습니다.")
        if len(preferences) > 5:
            errors.append("식습관/선호도는 최대 5개까지 선택할 수 있습니다.")
        if len(diseases) > 5:
            errors.append("질환 정보는 최대 5개까지 선택할 수 있습니다.")
        return len(errors) == 0, errors
    except:
        return False, ["선택 항목 검증 중 오류가 발생했습니다."]

def sanitize_input(value: Any, input_type: str = 'string') -> Any:
    """
    입력값 정제 및 타입 변환
    
    Args:
        value: 입력값
        input_type: 변환할 타입 ('string', 'int', 'float', 'list')
        
    Returns:
        정제된 값
    """
    try:
        if value is None:
            return None
            
        if input_type == 'string':
            return str(value).strip()
        elif input_type == 'int':
            return int(float(value))
        elif input_type == 'float':
            return float(value)
        elif input_type == 'list':
            if isinstance(value, list):
                return value
            elif isinstance(value, str):
                return [item.strip() for item in value.split(',') if item.strip()]
            else:
                return [value]
        else:
            return value
            
    except (ValueError, TypeError):
        return None

def validate_form_data(form_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Streamlit 폼 데이터 종합 검증
    
    Args:
        form_data: Streamlit 폼에서 수집한 데이터
        
    Returns:
        Tuple[bool, List[str]]: (검증 성공 여부, 오류 메시지 리스트)
    """
    errors = []
    
    # 필수 항목 검사
    required_fields = ['gender', 'age', 'height', 'weight', 'goal', 'budget_per_meal']
    for field in required_fields:
        if field not in form_data or form_data[field] is None:
            errors.append(f"{field} 항목은 필수입니다.")
    
    # 개별 필드 검증
    if 'age' in form_data:
        is_valid, error_msg = validate_age(form_data['age'])
        if not is_valid:
            errors.append(error_msg)
    
    if 'height' in form_data and 'weight' in form_data:
        is_valid, height_weight_errors = validate_height_weight(
            form_data['height'], form_data['weight']
        )
        if not is_valid:
            errors.extend(height_weight_errors)
    
    if 'budget_per_meal' in form_data:
        is_valid, error_msg = validate_budget(form_data['budget_per_meal'])
        if not is_valid:
            errors.append(error_msg)
    
    # 선택 제한 검증
    allergies = form_data.get('allergies', [])
    preferences = form_data.get('preferences', [])
    medical_conditions = form_data.get('medical_conditions', [])
    
    is_valid, limit_errors = validate_selection_limits(
        allergies, preferences, medical_conditions
    )
    if not is_valid:
        errors.extend(limit_errors)
    
    return len(errors) == 0, errors

def validate_medical_conditions(conditions: List[str]) -> Tuple[bool, str]:
    """의학적 조건 유효성 검증"""
    if len(conditions) > MAX_DISEASES:
        return False, f"의학적 조건은 최대 {MAX_DISEASES}개까지 선택 가능합니다."
    
    # 유효한 조건인지 확인
    valid_conditions = set(MEDICAL_CONDITIONS)
    for condition in conditions:
        if condition not in valid_conditions:
            return False, f"'{condition}'은(는) 유효하지 않은 의학적 조건입니다."
    
    return True, ""

def validate_dietary_restrictions(restrictions: List[str]) -> Tuple[bool, str]:
    """식단 제한 유효성 검증"""
    if len(restrictions) > MAX_DISEASES:  # 같은 제한 사용
        return False, f"식단 제한은 최대 {MAX_DISEASES}개까지 선택 가능합니다."
    
    # 유효한 제한인지 확인
    valid_restrictions = set(DIETARY_RESTRICTIONS)
    for restriction in restrictions:
        if restriction not in valid_restrictions:
            return False, f"'{restriction}'은(는) 유효하지 않은 식단 제한입니다."
    
    return True, ""