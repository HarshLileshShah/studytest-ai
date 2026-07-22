"use server";

import { revalidatePath } from "next/cache";
import { getDocument } from "@/services/document.service";
import { generateQuestions } from "@/services/ai.service";
import { createQuiz } from "@/services/quiz.service";
import { auth } from "@/auth";

/**
 * Server Action: Generate a quiz from a document's extracted text.
 */
export async function generateQuiz(
  documentId: string,
  format: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "FILL_IN_THE_BLANKS" = "MCQ",
  count: number = 10,
  timeLimit?: number | null,
  cognitiveStyle: "THEORY" | "PRACTICAL" | "MIXED" = "MIXED",
  customPrompt?: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const document = await getDocument(documentId);

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    if (document.userId !== userId) {
      return { success: false, error: "Access denied to document" };
    }

    if (document.status !== "READY" || !document.extractedText) {
      return { success: false, error: "Document text has not been extracted yet" };
    }

    // Generate questions via AI
    const questions = await generateQuestions(document.extractedText, count, format, cognitiveStyle, customPrompt);

    // Create quiz in database
    const quizNumber = document.quizzes.length + 1;
    const formatSuffix =
      format === "MCQ"
        ? "MCQ Quiz"
        : format === "TRUE_FALSE"
        ? "True/False Quiz"
        : format === "FILL_IN_THE_BLANKS"
        ? "Fill in the Blanks Quiz"
        : "Short Answer Quiz";

    const styleLabel =
      cognitiveStyle === "THEORY"
        ? "Theory"
        : cognitiveStyle === "PRACTICAL"
        ? "Practical"
        : "Mixed";

    const quiz = await createQuiz(
      documentId,
      `${document.title} — ${formatSuffix} (${styleLabel}) ${quizNumber}`,
      questions,
      format,
      timeLimit
    );

    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/quizzes");

    return { success: true, quizId: quiz.id };
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Quiz generation failed",
    };
  }
}
