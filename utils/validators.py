"""
사용자 입력값 검증 및 처리 유틸리티
"""

from typing import Dict, List, Any, Tuple

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
        if not isinstance(age, (int, float)) or age < 10 or age > 120:
            errors.append("나이는 10세에서 120세 사이여야 합니다.")
        
        # 키 검증
        height = profile.get('height', 0)
        if not isinstance(height, (int, float)) or height < 100 or height > 250:
            errors.append("키는 100cm에서 250cm 사이여야 합니다.")
        
        # 몸무게 검증
        weight = profile.get('weight', 0)
        if not isinstance(weight, (int, float)) or weight < 30 or weight > 200:
            errors.append("몸무게는 30kg에서 200kg 사이여야 합니다.")
        
        # 예산 검증
        budget = profile.get('budget_per_meal', 0)
        if not isinstance(budget, (int, float)) or budget < 1000 or budget > 100000:
            errors.append("1회 식사 예산은 1,000원에서 100,000원 사이여야 합니다.")
        
        # 알레르기 개수 검증
        allergies = profile.get('allergies', [])
        if isinstance(allergies, list) and len(allergies) > 7:
            errors.append("알레르기는 최대 7개까지 선택할 수 있습니다.")
        
        # 선호도 개수 검증
        preferences = profile.get('preferences', [])
        if isinstance(preferences, list) and len(preferences) > 5:
            errors.append("식습관/선호도는 최대 5개까지 선택할 수 있습니다.")
        
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
        if budget < 1000 or budget > 100000:
            return False, "1회 식사 예산은 1,000원에서 100,000원 사이여야 합니다."
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