"use server";

import { getQuizByShareCode } from "@/services/quiz.service";

/**
 * Server Action: Join/find a shared test by its code.
 */
export async function joinQuizByCode(shareCode: string) {
  if (!shareCode || typeof shareCode !== "string") {
    return {
      success: false,
      error: "Please enter a valid test code.",
    };
  }

  try {
    const quiz = await getQuizByShareCode(shareCode);

    if (!quiz) {
      return {
        success: false,
        error: "No test found with this code. Please check and try again.",
      };
    }

    return {
      success: true,
      quizId: quiz.id,
    };
  } catch (error) {
    console.error("Failed to join quiz by code:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
