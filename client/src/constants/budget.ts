/**
 * 예산 관련 상수 정의
 * 모든 예산 관련 값은 이 파일에서만 정의하고 import하여 사용
 */

// 예산 관련 상수
export const MIN_BUDGET = 1000;
export const MAX_BUDGET = 100000;
export const DEFAULT_BUDGET = 10000;

// 사용자 프로필 상수
export const MIN_AGE = 16;
export const MAX_AGE = 100;
export const MIN_HEIGHT = 100;
export const MAX_HEIGHT = 250;
export const MIN_WEIGHT = 30;
export const MAX_WEIGHT = 250;

// 선택 제한 상수
export const MAX_ALLERGIES = 7;
export const MAX_PREFERENCES = 5;
export const MAX_DISEASES = 3;

// 식단 관련 상수
export const MIN_MEAL_COUNT = 3;
export const MAX_MEAL_COUNT = 6;

// 에러 메시지 템플릿
export const BUDGET_ERROR_MSG = `1회 식사 예산은 ${MIN_BUDGET.toLocaleString()}원에서 ${MAX_BUDGET.toLocaleString()}원 사이여야 합니다.`;
export const AGE_ERROR_MSG = `나이는 ${MIN_AGE}세에서 ${MAX_AGE}세 사이여야 합니다.`;
export const HEIGHT_ERROR_MSG = `키는 ${MIN_HEIGHT}cm에서 ${MAX_HEIGHT}cm 사이여야 합니다.`;
export const WEIGHT_ERROR_MSG = `몸무게는 ${MIN_WEIGHT}kg에서 ${MAX_WEIGHT}kg 사이여야 합니다.`;

// 화면 표시용 포맷팅된 텍스트
export const BUDGET_MIN_DISPLAY = `₩${MIN_BUDGET.toLocaleString()}`;
export const BUDGET_MAX_DISPLAY = `₩${MAX_BUDGET.toLocaleString()}`;
export const BUDGET_RANGE_DISPLAY = `${BUDGET_MIN_DISPLAY} - ${BUDGET_MAX_DISPLAY}`;