import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuizBattleClient } from "./quiz-battle-client";
import { joinQuizBattleAction } from "@/app/actions/battle.actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizBattlePage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { id: battleId } = await params;

  // Let's call the join battle action to ensure the current player is inside the lobby
  const joinRes = await joinQuizBattleAction(battleId);
  if (!joinRes.success) {
    redirect("/quizzes");
  }

  const battle = await prisma.quizBattle.findUnique({
    where: { id: battleId },
    select: { id: true, quizId: true },
  });

  if (!battle) {
    notFound();
  }

  return (
    <QuizBattleClient
      battleId={battle.id}
      userId={userId}
    />
  );
}
