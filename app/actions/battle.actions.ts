"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Create a multiplayer quiz battle lobby.
 */
export async function createQuizBattleAction(quizId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const userName = session?.user?.name || "Anonymous Host";

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const quiz = await prisma.generatedQuiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return { success: false, error: "Quiz not found." };
    }

    // Create new QuizBattle in LOBBY status
    const battle = await prisma.quizBattle.create({
      data: {
        quizId,
        hostId: userId,
        status: "LOBBY",
        players: {
          create: {
            userId,
            userName,
            progress: 0,
            score: 0,
          },
        },
      },
    });

    revalidatePath(`/quiz/${quizId}`);
    return { success: true, battleId: battle.id };
  } catch (error) {
    console.error("Failed to create quiz battle:", error);
    return { success: false, error: "Failed to initialize battle." };
  }
}

/**
 * Server Action: Join an existing quiz battle lobby.
 */
export async function joinQuizBattleAction(battleId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const userName = session?.user?.name || "Anonymous Player";

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const battle = await prisma.quizBattle.findUnique({
      where: { id: battleId },
      include: { players: true },
    });

    if (!battle) {
      return { success: false, error: "Lobby not found." };
    }

    if (battle.status === "FINISHED") {
      return { success: false, error: "This battle has already finished." };
    }

    // Add player to the battle if not already in it
    const existing = battle.players.find((p) => p.userId === userId);
    if (!existing) {
      await prisma.quizBattlePlayer.create({
        data: {
          battleId,
          userId,
          userName,
          progress: 0,
          score: 0,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to join quiz battle:", error);
    return { success: false, error: "Failed to join battle lobby." };
  }
}

/**
 * Server Action: Start the quiz battle (Host Only).
 */
export async function startQuizBattleAction(battleId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const battle = await prisma.quizBattle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return { success: false, error: "Lobby not found." };
    }

    if (battle.hostId !== userId) {
      return { success: false, error: "Only the host can start the battle." };
    }

    await prisma.quizBattle.update({
      where: { id: battleId },
      data: { status: "ACTIVE" },
    });

    revalidatePath(`/quiz/battle/${battleId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to start quiz battle:", error);
    return { success: false, error: "Failed to start battle." };
  }
}

/**
 * Server Action: Submit progress updates from a player inside an active battle.
 */
export async function updateBattlePlayerProgressAction(
  battleId: string,
  progress: number,
  score: number,
  isFinished: boolean = false,
  timeSpent: number = 0
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await prisma.quizBattlePlayer.update({
      where: {
        battleId_userId: {
          battleId,
          userId,
        },
      },
      data: {
        progress,
        score,
        timeSpent,
        finishedAt: isFinished ? new Date() : undefined,
      },
    });

    // Check if all players have completed. If yes, transition status to FINISHED
    const battle = await prisma.quizBattle.findUnique({
      where: { id: battleId },
      include: { players: true },
    });

    if (battle && battle.status === "ACTIVE") {
      const allFinished = battle.players.every((p) => p.finishedAt !== null);
      if (allFinished) {
        await prisma.quizBattle.update({
          where: { id: battleId },
          data: { status: "FINISHED" },
        });
      }
    }

    revalidatePath(`/quiz/battle/${battleId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update player progress:", error);
    return { success: false, error: "Failed to sync battle data." };
  }
}

/**
 * Server Action: Fetch real-time synced scoreboard details.
 */
export async function getBattleStateAction(battleId: string) {
  try {
    const battle = await prisma.quizBattle.findUnique({
      where: { id: battleId },
      include: {
        quiz: {
          select: {
            title: true,
            questionCount: true,
            questions: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        players: {
          orderBy: [
            { score: "desc" },
            { timeSpent: "asc" },
          ],
        },
      },
    });

    if (!battle) {
      return { success: false, error: "Battle not found." };
    }

    return {
      success: true,
      status: battle.status,
      hostId: battle.hostId,
      quizTitle: battle.quiz.title,
      questionCount: battle.quiz.questionCount,
      questions: battle.quiz.questions,
      players: battle.players.map((p) => ({
        userId: p.userId,
        userName: p.userName,
        progress: p.progress,
        score: p.score,
        timeSpent: p.timeSpent,
        isFinished: p.finishedAt !== null,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch battle state:", error);
    return { success: false, error: "Failed to fetch state." };
  }
}
