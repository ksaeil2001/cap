import { UserInfo } from "@/types";
import { FoodItem, NutritionSummary } from "@/stores/useRecommendStore";
import { mockRecommend } from "./mockRecommend";

interface RecommendResponse {
  meals: FoodItem[][];
  summary: NutritionSummary;
  fallback: boolean;
}

/**
 * Get recommended foods based on user information
 * This is the main API function that will be called from the UI
 */
export async function getRecommendedFoods(userInfo: UserInfo): Promise<RecommendResponse> {
  // For development, we'll use the mock implementation
  // In a production environment, this would call an actual API endpoint
  try {
    return await mockRecommend(userInfo);
  } catch (error) {
    console.error("Error getting recommendations:", error);
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