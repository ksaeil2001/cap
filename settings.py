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

# 의학적 조건 옵션
MEDICAL_CONDITIONS = [
    "없음",
    "당뇨병",
    "고혈압", 
    "고지혈증",
    "신장질환",
    "간질환",
    "심장질환",
    "갑상선질환",
    "위장질환",
    "관절염",
    "골다공증",
    "빈혈",
    "기타"
]

# 식단 제한 옵션
DIETARY_RESTRICTIONS = [
    "없음",
    "채식주의",
    "비건",
    "할랄",
    "코셔",
    "글루텐프리",
    "저염식",
    "저당식",
    "저지방식",
    "무유제품",
    "기타"
]

# 질환별 금지 식품/영양소 매핑
DISEASE_RESTRICTIONS = {
    "당뇨병": {
        "forbidden_nutrients": ["고당류", "단순당"],
        "forbidden_tags": ["당분높음", "달콤한", "설탕많음"],
        "recommended_tags": ["저당", "무설탕", "당뇨적합"]
    },
    "고혈압": {
        "forbidden_nutrients": ["나트륨", "염분"],
        "forbidden_tags": ["짠맛", "염분높음", "간장많음"],
        "recommended_tags": ["저염", "무염", "저나트륨"]
    },
    "고지혈증": {
        "forbidden_nutrients": ["포화지방", "트랜스지방"],
        "forbidden_tags": ["기름많음", "튀김", "고지방"],
        "recommended_tags": ["저지방", "올리브오일", "견과류"]
    },
    "신장질환": {
        "forbidden_nutrients": ["인", "칼륨", "단백질"],
        "forbidden_tags": ["단백질높음", "유제품", "견과류"],
        "recommended_tags": ["저단백", "저인", "저칼륨"]
    },
    "간질환": {
        "forbidden_nutrients": ["지방", "나트륨"],
        "forbidden_tags": ["기름진", "술", "자극적"],
        "recommended_tags": ["담백한", "저지방", "간건강"]
    }
}

# 식단 제한별 필터링 규칙
DIET_RESTRICTIONS_RULES = {
    "채식주의": {
        "forbidden_tags": ["육류", "생선", "해산물"],
        "allowed_tags": ["채소", "과일", "곡류", "유제품", "달걀"]
    },
    "비건": {
        "forbidden_tags": ["육류", "생선", "해산물", "유제품", "달걀", "꿀"],
        "allowed_tags": ["채소", "과일", "곡류", "견과류", "콩류"]
    },
    "할랄": {
        "forbidden_tags": ["돼지고기", "술", "젤라틴"],
        "allowed_tags": ["할랄인증", "채소", "과일", "할랄육류"]
    },
    "글루텐프리": {
        "forbidden_tags": ["밀", "보리", "호밀", "글루텐"],
        "allowed_tags": ["쌀", "옥수수", "글루텐프리"]
    }
}

# 에러 메시지 템플릿
BUDGET_ERROR_MSG = f"1회 식사 예산은 {MIN_BUDGET:,}원에서 {MAX_BUDGET:,}원 사이여야 합니다."
AGE_ERROR_MSG = f"나이는 {MIN_AGE}세에서 {MAX_AGE}세 사이여야 합니다."
HEIGHT_ERROR_MSG = f"키는 {MIN_HEIGHT}cm에서 {MAX_HEIGHT}cm 사이여야 합니다."
WEIGHT_ERROR_MSG = f"몸무게는 {MIN_WEIGHT}kg에서 {MAX_WEIGHT}kg 사이여야 합니다."