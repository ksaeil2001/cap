import { UserInfo } from "@/types";
import { FoodItem, NutritionSummary } from "@/stores/useRecommendStore";
import { mockRecommend } from "./mockRecommend";
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
export async function getRecommendedFoods(userInfo: UserInfo): Promise<RecommendResponse> {
  try {
    // Try to use the real API endpoint
    console.log("Using FastAPI backend for recommendations...");
    
    try {
      const apiResponse = await apiRequest("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });
      
      return await apiResponse.json();
    } catch (apiError) {
      // If the FastAPI endpoint fails, fallback to mock implementation
      console.log("FastAPI endpoint not available, using mock API for development");
      return await mockRecommend(userInfo);
    }
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