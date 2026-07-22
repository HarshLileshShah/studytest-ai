import { notFound } from "next/navigation";
import { getQuiz } from "@/services/quiz.service";
import QuizAttemptClient from "./quiz-attempt-client";
import { auth } from "@/auth";

export default async function QuizAttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const { id } = await params;
  const { mode } = await searchParams;
  const quiz = await getQuiz(id);

  if (!quiz) {
    notFound();
  }

  // Strip correct answers from questions sent to client
  // (prevents cheating by inspecting page source)
  const clientQuestions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options as string[],
    correctAnswer: "", // Hidden from client
    explanation: "", // Hidden from client
    difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
    topic: q.topic,
    type: q.type,
    orderIndex: q.orderIndex,
  }));

  return (
    <QuizAttemptClient
      quizId={quiz.id}
      questions={clientQuestions}
      initialMode={mode || "practice"}
      timeLimit={quiz.timeLimit}
    />
  );
}
