import { prisma } from "@/lib/prisma";
import type {
  DashboardStats,
  ScoreTrendPoint,
  TopicAccuracy,
  DifficultyBreakdown,
} from "@/types";

/**
 * Get dashboard stats for a user.
 */
export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const attempts = await prisma.attempt.findMany({
    where: { userId, completedAt: { not: null } },
    select: {
      score: true,
      totalQuestions: true,
      percentage: true,
    },
  });

  if (attempts.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      totalQuestionsAnswered: 0,
    };
  }

  const totalQuizzes = attempts.length;
  const averageScore =
    attempts.reduce((sum: number, a: { percentage: number }) => sum + a.percentage, 0) / totalQuizzes;
  const bestScore = Math.max(...attempts.map((a: { percentage: number }) => a.percentage));
  const totalQuestionsAnswered = attempts.reduce(
    (sum: number, a: { totalQuestions: number }) => sum + a.totalQuestions,
    0
  );

  return {
    totalQuizzes,
    averageScore: Math.round(averageScore * 10) / 10,
    bestScore: Math.round(bestScore * 10) / 10,
    totalQuestionsAnswered,
  };
}

/**
 * Get score trend data for chart.
 */
export async function getScoreTrend(
  userId: string
): Promise<ScoreTrendPoint[]> {
  const attempts = await prisma.attempt.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "asc" },
    take: 20,
    select: {
      percentage: true,
      completedAt: true,
      quiz: {
        select: { title: true },
      },
    },
  });

  return attempts.map((a: { completedAt: Date | null; percentage: number; quiz: { title: string } }) => ({
    date: a.completedAt
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(a.completedAt)
      : "",
    score: Math.round(a.percentage),
    quizTitle: a.quiz.title,
  }));
}

/**
 * Get accuracy by topic.
 */
export async function getTopicAnalysis(
  userId: string
): Promise<TopicAccuracy[]> {
  const answers = await prisma.answer.findMany({
    where: {
      attempt: { userId },
    },
    include: {
      question: {
        select: { topic: true },
      },
    },
  });

  const topicMap = new Map<string, { correct: number; total: number }>();

  for (const answer of answers) {
    const topic = answer.question.topic || "General";
    const existing = topicMap.get(topic) || { correct: 0, total: 0 };
    existing.total++;
    if (answer.isCorrect) existing.correct++;
    topicMap.set(topic, existing);
  }

  return Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      ...data,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

/**
 * Get accuracy breakdown by difficulty.
 */
export async function getDifficultyBreakdown(
  userId: string
): Promise<DifficultyBreakdown[]> {
  const answers = await prisma.answer.findMany({
    where: {
      attempt: { userId },
    },
    include: {
      question: {
        select: { difficulty: true },
      },
    },
  });

  const diffMap = new Map<string, { correct: number; total: number }>();

  for (const answer of answers) {
    const diff = answer.question.difficulty;
    const existing = diffMap.get(diff) || { correct: 0, total: 0 };
    existing.total++;
    if (answer.isCorrect) existing.correct++;
    diffMap.set(diff, existing);
  }

  const order = ["EASY", "MEDIUM", "HARD"];
  return order
    .filter((d) => diffMap.has(d))
    .map((diff) => {
      const data = diffMap.get(diff)!;
      return {
        difficulty: diff as "EASY" | "MEDIUM" | "HARD",
        ...data,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      };
    });
}
