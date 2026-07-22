"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDocument } from "@/services/document.service";
import {
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
} from "@/services/tutor.service";
import { askTutorQuestion, generateWrongAnswerExplanation } from "@/services/ai.service";
import { prisma } from "@/lib/prisma";

/**
 * Server Action: Post a question to the AI Tutor for a document and save details.
 */
export async function sendTutorMessageAction(documentId: string, question: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!question.trim()) {
    return { success: false, error: "Question cannot be empty." };
  }

  try {
    // 1. Fetch document text and make sure user owns it
    const document = await getDocument(documentId);
    if (!document || document.userId !== userId) {
      return { success: false, error: "Document not found." };
    }

    // 2. Fetch past conversation memory limit to last 8 messages
    const history = await getChatHistory(documentId, userId);
    const recentHistory = history.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Save student question to db first
    await saveChatMessage(documentId, "user", question.trim());

    // 4. Generate tutor response using AI service
    const documentText = document.extractedText || "No document text content available.";
    const tutorReply = await askTutorQuestion(
      document.title,
      documentText,
      recentHistory,
      question.trim()
    );

    // 5. Save assistant reply to db
    await saveChatMessage(documentId, "assistant", tutorReply);

    revalidatePath(`/documents/${documentId}`);

    return { success: true };
  } catch (error: any) {
    console.error("AI Tutor query failed:", error);
    return {
      success: false,
      error: error.message || "Something went wrong while contacting the AI Tutor.",
    };
  }
}

/**
 * Server Action: Reset/clear tutor chat logs.
 */
export async function clearTutorChatAction(documentId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await clearChatHistory(documentId, userId);
    revalidatePath(`/documents/${documentId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to clear chat log:", error);
    return { success: false, error: "Failed to reset tutor history." };
  }
}

/**
 * Server Action: Generate or retrieve wrong answer explanation on-demand.
 */
export async function getWrongAnswerExplanationAction(answerId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    // 1. Fetch answer with its question, attempt, and quiz document context
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        attempt: {
          include: {
            quiz: {
              include: {
                document: true,
              },
            },
          },
        },
        question: true,
      },
    });

    if (!answer) {
      return { success: false, error: "Answer not found." };
    }

    // Security check: ensure answer belongs to the requesting user
    if (answer.attempt.userId !== userId) {
      return { success: false, error: "Unauthorized access to this answer." };
    }

    // 2. If already generated & cached, return it immediately
    if (answer.aiExplanation) {
      return { success: true, aiExplanation: answer.aiExplanation };
    }

    const quiz = answer.attempt.quiz;
    if (!quiz.document) {
      return { success: false, error: "Source document context is unavailable." };
    }

    // 3. Generate wrong answer explanation using LLM service
    const documentText = quiz.document.extractedText || "";
    const generatedExplanation = await generateWrongAnswerExplanation(
      quiz.document.title,
      documentText,
      answer.question.question,
      (answer.question.options as string[]) || [],
      answer.question.correctAnswer,
      answer.selectedAnswer
    );

    // 4. Cache explanation inside the database answer row
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        aiExplanation: generatedExplanation,
      },
    });

    return { success: true, aiExplanation: updatedAnswer.aiExplanation };
  } catch (error: any) {
    console.error("Failed to retrieve wrong answer explanation:", error);
    return {
      success: false,
      error: error.message || "Failed to generate AI explanation.",
    };
  }
}

