import { notFound, redirect } from "next/navigation";
import { getQuizByShareCode } from "@/services/quiz.service";
import { auth } from "@/auth";

export default async function JoinQuizPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { code } = await params;
  const quiz = await getQuizByShareCode(code.toUpperCase());

  if (!quiz) {
    notFound();
  }

  // Check if there is an active or lobby QuizBattle for this quiz
  const prismaImport = (await import("@/lib/prisma")).prisma;
  const activeBattle = await prismaImport.quizBattle.findFirst({
    where: {
      quizId: quiz.id,
      status: { in: ["LOBBY", "ACTIVE"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (activeBattle) {
    // Redirect classmate directly to the battle lobby!
    redirect(`/quiz/battle/${activeBattle.id}`);
  }

  // Redirect classmate directly to quiz start landing page
  redirect(`/quiz/${quiz.id}`);
}
