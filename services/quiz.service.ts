import { prisma } from "@/lib/prisma";
import type { GeneratedQuestion } from "@/types";

/**
 * Generate a unique 6-character uppercase alphanumeric share code.
 */
async function getUniqueShareCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (true) {
    let code = "ST-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await prisma.generatedQuiz.findUnique({
      where: { shareCode: code },
    });
    if (!existing) {
      return code;
    }
  }
}

/**
 * Create a quiz with its questions in a single transaction.
 */
export async function createQuiz(
  documentId: string,
  title: string,
  questions: GeneratedQuestion[],
  format: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "FILL_IN_THE_BLANKS" = "MCQ",
  timeLimit?: number | null
) {
  const shareCode = await getUniqueShareCode();

  return prisma.generatedQuiz.create({
    data: {
      documentId,
      title,
      questionCount: questions.length,
      shareCode,
      format,
      timeLimit,
      questions: {
        create: questions.map((q, index) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topic: q.topic,
          type: format,
          orderIndex: index,
        })),
      },
    },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });
}

/**
 * Get all quizzes with document info, ordered by creation date.
 */
export async function getQuizzes(userId: string) {
  return prisma.generatedQuiz.findMany({
    where: {
      document: {
        userId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      document: {
        select: { id: true, title: true },
      },
      _count: {
        select: { attempts: true },
      },
    },
  });
}

/**
 * Get a single quiz with all questions and attempts.
 */
export async function getQuiz(id: string) {
  return prisma.generatedQuiz.findUnique({
    where: { id },
    include: {
      document: {
        select: { id: true, title: true, userId: true },
      },
      questions: {
        orderBy: { orderIndex: "asc" },
      },
      attempts: {
        orderBy: { completedAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      _count: {
        select: { attempts: true },
      },
    },
  });
}

/**
 * Find a quiz by its unique share code.
 */
export async function getQuizByShareCode(shareCode: string) {
  return prisma.generatedQuiz.findUnique({
    where: { shareCode: shareCode.trim().toUpperCase() },
    include: {
      document: {
        select: { id: true, title: true, userId: true },
      },
    },
  });
}

/**
 * Delete a quiz.
 */
export async function deleteQuiz(id: string) {
  return prisma.generatedQuiz.delete({
    where: { id },
  });
}
