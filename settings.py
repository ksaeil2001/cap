"""
애플리케이션 전역 설정 상수
모든 예산 관련 값은 이 파일에서만 정의하고 import하여 사용
"""

# 예산 관련 상수
MIN_BUDGET = 1000
MAX_BUDGET = 100000
DEFAULT_BUDGET = 10000

# 사용자 프로필 상수
MIN_AGE = 16
MAX_AGE = 100
MIN_HEIGHT = 100
MAX_HEIGHT = 250
MIN_WEIGHT = 30
MAX_WEIGHT = 250

# 선택 제한 상수
MAX_ALLERGIES = 7
MAX_PREFERENCES = 5
MAX_DISEASES = 3

# 식단 관련 상수
MIN_MEAL_COUNT = 3
MAX_MEAL_COUNT = 6

# 에러 메시지 템플릿
BUDGET_ERROR_MSG = f"1회 식사 예산은 {MIN_BUDGET:,}원에서 {MAX_BUDGET:,}원 사이여야 합니다."
AGE_ERROR_MSG = f"나이는 {MIN_AGE}세에서 {MAX_AGE}세 사이여야 합니다."
HEIGHT_ERROR_MSG = f"키는 {MIN_HEIGHT}cm에서 {MAX_HEIGHT}cm 사이여야 합니다."
WEIGHT_ERROR_MSG = f"몸무게는 {MIN_WEIGHT}kg에서 {MAX_WEIGHT}kg 사이여야 합니다."