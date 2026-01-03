import { UserProfile, ApiResponse } from "../types";
import { callAnalyzeEndpoint } from "../backend/mockServer";

// This service is now purely a client-side bridge that calls the backend.
// In a real application, `callAnalyzeEndpoint` would be a `fetch('/api/analyze', ...)` call.

export const sendChatRequest = async (
  user: UserProfile,
  userMessage: string,
  history: any[] = []
): Promise<ApiResponse> => {
  
  // Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    // Call the "Cloud Function"
    const response = await callAnalyzeEndpoint(user, userMessage, history);
    return response;
  } catch (err) {
    console.error("Network Error", err);
    return {
      text: "",
      remainingCredits: user.credits,
      error: { code: "NETWORK_ERROR", message: "Failed to reach server." }
    };
  }
};