import { notFound } from "next/navigation";
import { getQuiz } from "@/services/quiz.service";
import { PrintQuizClient } from "./print-quiz-client";
import { auth } from "@/auth";

export default async function PrintQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const { id } = await params;
  const quiz = await getQuiz(id);

  if (!quiz || quiz.document.userId !== userId) {
    notFound();
  }

  // Format options and map types explicitly to resolve JSON type casting issues
  const formattedQuiz = {
    id: quiz.id,
    title: quiz.title,
    document: {
      title: quiz.document.title,
    },
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options as string[],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
      topic: q.topic,
    })),
  };

  return <PrintQuizClient quiz={formattedQuiz} />;
}
