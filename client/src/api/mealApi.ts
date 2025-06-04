import { UserInfo } from "@/types";
import { FoodItem, NutritionSummary, mockRecommend } from "./mockRecommend";
import { apiRequest } from "@/lib/queryClient";

interface RecommendResponse {
  meals: FoodItem[][];
  summary: NutritionSummary;
  fallback: boolean;
}

/**
 * Get recommended foods based on user information
 * This is the main API function that will be called from the UI
 */
export async function getRecommendedFoods(userInfo: Partial<UserInfo>): Promise<RecommendResponse> {
  try {
    // Try to use the real API endpoint
    console.log("Using FastAPI backend for recommendations...");
    
    try {
      const apiResponse = await apiRequest("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: userInfo,
      });
      
      const responseData = await apiResponse.json();
      
      // 방어적 프로그래밍: 응답 데이터 구조 확인
      if (!responseData || !responseData.meals) {
        console.warn("API returned incomplete data structure:", responseData);
        // 응답에 meals가 없으면 mockRecommend 사용
        return await mockRecommend(userInfo);
      }
      
      // meals 배열이 올바른지 확인하고 빈 배열로 초기화
      if (!Array.isArray(responseData.meals)) {
        console.warn("API returned invalid meals data (not an array):", responseData.meals);
        responseData.meals = [[], [], []];
      }
      
      return responseData;
    } catch (apiError) {
      // If the FastAPI endpoint fails, fallback to mock implementation
      console.error("FastAPI endpoint error:", apiError instanceof Error ? apiError.message : apiError);
      console.log("FastAPI endpoint not available, using mock API for development");
      return await mockRecommend(userInfo);
    }
  } catch (error) {
    console.error("Error getting recommendations:", error instanceof Error ? error.message : error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack available");
    return getFallbackResponse();
  }
}

/**
 * Get fallback response if recommendation API fails
 * This provides a graceful degradation in case of API failures
 */
function getFallbackResponse(): RecommendResponse {
  // Create a simple fallback with minimal data
  return {
    meals: [[], [], []], // Empty meal arrays
    summary: {
      calories: { target: 2000, actual: 0 },
      protein: { target: 150, actual: 0 },
      fat: { target: 70, actual: 0 },
      carbs: { target: 250, actual: 0 },
      budget: { target: 100, actual: 0 },
      allergy: false
    },
    fallback: true
  };
}

export default { getRecommendedFoods };