"use server";

import { auth } from "@/auth";
import { evaluateAttempt } from "@/services/evaluation.service";
import { generateFeedback } from "@/services/ai.service";
import { recordStudyActivity } from "@/services/gamification.service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface SubmitAttemptInput {
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
  }>;
  timeSpentSeconds: number;
  mode?: string;
}

/**
 * Server Action: Submit a quiz attempt, evaluate answers, and generate AI feedback.
 */
export async function submitAttempt(input: SubmitAttemptInput) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    // Evaluate the attempt using the authenticated userId
    const attempt = await evaluateAttempt(
      userId,
      input.quizId,
      input.answers,
      input.timeSpentSeconds,
      input.mode || "PRACTICE"
    );

    // Record study activity and evaluate badges
    await recordStudyActivity(userId, { quizAttemptId: attempt.id });

    // Generate AI feedback synchronously so it is available immediately on the results page
    try {
      await generateAIFeedback(attempt.id);
    } catch (err) {
      console.error("AI feedback generation failed:", err);
    }

    revalidatePath("/dashboard");
    revalidatePath("/quizzes");

    return {
      success: true,
      attemptId: attempt.id,
    };
  } catch (error) {
    console.error("Submit attempt failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Submission failed",
    };
  }
}

/**
 * Generate AI feedback for an attempt (runs asynchronously).
 */
async function generateAIFeedback(attemptId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
      answers: {
        include: { question: true },
      },
    },
  });

  if (!attempt) return;

  // Build topic results
  const topicMap = new Map<string, { correct: number; total: number }>();
  const incorrectQuestions: Array<{
    question: string;
    topic: string;
    correctAnswer: string;
    selectedAnswer: string;
  }> = [];

  for (const answer of attempt.answers) {
    const topic = answer.question.topic || "General";
    const existing = topicMap.get(topic) || { correct: 0, total: 0 };
    existing.total++;
    if (answer.isCorrect) existing.correct++;
    topicMap.set(topic, existing);

    if (!answer.isCorrect) {
      incorrectQuestions.push({
        question: answer.question.question,
        topic: answer.question.topic || "General",
        correctAnswer: answer.question.correctAnswer,
        selectedAnswer: answer.selectedAnswer,
      });
    }
  }

  const topicResults = Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    ...data,
  }));

  try {
    const feedback = await generateFeedback({
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      topicResults,
      incorrectQuestions,
    });

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { aiFeedback: feedback },
    });
    return { success: true, feedback };
  } catch (error) {
    console.error("Failed to generate AI feedback:", error);
    return { success: false, error: "Failed to generate feedback" };
  }
}

/**
 * Server Action: On-demand generation of AI feedback for a past attempt.
 */
export async function generateAIFeedbackAction(attemptId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const res = await generateAIFeedback(attemptId);
    revalidatePath(`/quiz/*/results/${attemptId}`);
    return res || { success: false, error: "Could not compile feedback." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate AI feedback." };
  }
}
