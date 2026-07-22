import { prisma } from "@/lib/prisma";
import { evaluateShortAnswer } from "@/services/ai.service";

interface SubmitAnswerInput {
  questionId: string;
  selectedAnswer: string;
}

/**
 * Evaluate a quiz attempt: score answers, calculate percentage, store in DB.
 */
export async function evaluateAttempt(
  userId: string,
  quizId: string,
  submittedAnswers: SubmitAnswerInput[],
  timeSpentSeconds: number,
  mode: string = "PRACTICE"
) {
  // Fetch quiz with correct answers and source document context
  const quiz = await prisma.generatedQuiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
      },
      document: {
        select: { title: true, extractedText: true },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // Grade each submitted answer
  let score = 0;
  const gradedAnswers = [];

  for (const question of quiz.questions) {
    const submitted = submittedAnswers.find(
      (a) => a.questionId === question.id
    );
    const selectedAnswer = submitted?.selectedAnswer || "";
    let isCorrect = false;

    if (question.type === "SHORT_ANSWER") {
      isCorrect = await evaluateShortAnswer(
        question.question,
        question.correctAnswer,
        selectedAnswer
      );
    } else {
      isCorrect =
        selectedAnswer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
    }

    if (isCorrect) score++;

    gradedAnswers.push({
      questionId: question.id,
      selectedAnswer,
      isCorrect,
    });
  }

  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  // Create attempt with answers in a transaction
  const attempt = await prisma.attempt.create({
    data: {
      userId,
      quizId,
      score,
      totalQuestions,
      percentage,
      timeSpentSeconds,
      mode,
      completedAt: new Date(),
      answers: {
        create: gradedAnswers,
      },
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
      quiz: {
        include: {
          document: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  return attempt;
}

/**
 * Get a specific attempt with full details for the results page.
 */
export async function getAttempt(attemptId: string) {
  return prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          question: true,
        },
        orderBy: {
          question: { orderIndex: "asc" },
        },
      },
      quiz: {
        include: {
          document: {
            select: { id: true, title: true, userId: true, extractedText: true },
          },
        },
      },
    },
  });
}

/**
 * Get recent attempts for a user.
 */
export async function getRecentAttempts(userId: string, limit: number = 10) {
  return prisma.attempt.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: limit,
    include: {
      quiz: {
        include: {
          document: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });
}
