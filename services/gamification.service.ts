import { prisma } from "@/lib/prisma";

export interface BadgeInfo {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export const AVAILABLE_BADGES: BadgeInfo[] = [
  {
    key: "quick_starter",
    name: "Quick Starter",
    description: "Awarded for completing your first study session or quiz.",
    icon: "🚀",
  },
  {
    key: "exam_conqueror",
    name: "Exam Conqueror",
    description: "Score 80% or higher on a quiz in strict Exam Mode.",
    icon: "⚔️",
  },
  {
    key: "persistence_master",
    name: "Persistence Master",
    description: "Maintain a study streak of 7 or more consecutive days.",
    icon: "🔥",
  },
  {
    key: "speed_demon",
    name: "Speed Demon",
    description: "Score 80% or higher on a quiz of 5+ questions in under 1 minute.",
    icon: "⚡",
  },
  {
    key: "night_owl",
    name: "Night Owl",
    description: "Complete a study session or quiz between 10 PM and 4 AM.",
    icon: "🦉",
  },
];

/**
 * Update the user's study streak and check/award milestone badges.
 */
export async function recordStudyActivity(
  userId: string,
  context?: {
    quizAttemptId?: string;
  }
) {
  try {
    const now = new Date();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastStudyDate: true, badges: true },
    });

    if (!user) return { success: false, error: "User not found" };

    let currentStreak = user.streakCount;
    const lastStudyDate = user.lastStudyDate;

    let updateStreak = false;

    if (!lastStudyDate) {
      currentStreak = 1;
      updateStreak = true;
    } else {
      // Calculate day difference at local calendar level
      const d1 = new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate());
      const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
        updateStreak = true;
      } else if (diffDays > 1) {
        currentStreak = 1;
        updateStreak = true;
      }
      // If diffDays === 0, they already studied today, so streak is active but not incremented
    }

    // Prepare lists
    const existingBadges = (user.badges as string[]) || [];
    const newBadges: string[] = [];

    // Rule 1: Quick Starter (first activity ever)
    if (!existingBadges.includes("quick_starter")) {
      newBadges.push("quick_starter");
    }

    // Rule 2: Night Owl (activity completed between 10 PM and 4 AM local time)
    const hour = now.getHours();
    if (hour >= 22 || hour < 4) {
      if (!existingBadges.includes("night_owl")) {
        newBadges.push("night_owl");
      }
    }

    // Rule 3: Persistence Master (Streak >= 7 days)
    if (currentStreak >= 7 && !existingBadges.includes("persistence_master")) {
      newBadges.push("persistence_master");
    }

    // Rule 4: Quiz specific achievements (if quizAttemptId context is supplied)
    if (context?.quizAttemptId) {
      const attempt = await prisma.attempt.findUnique({
        where: { id: context.quizAttemptId },
        include: { quiz: true },
      });

      if (attempt) {
        // Exam Conqueror: Score >= 80% in Exam Mode
        if (attempt.mode === "EXAM" && attempt.percentage >= 80) {
          if (!existingBadges.includes("exam_conqueror")) {
            newBadges.push("exam_conqueror");
          }
        }

        // Speed Demon: Score >= 80% on 5+ questions in < 60s
        if (
          attempt.totalQuestions >= 5 &&
          attempt.percentage >= 80 &&
          attempt.timeSpentSeconds < 60
        ) {
          if (!existingBadges.includes("speed_demon")) {
            newBadges.push("speed_demon");
          }
        }
      }
    }

    // Save stats to Database
    const updatedBadges = [...existingBadges, ...newBadges];
    const updateData: Record<string, any> = {
      badges: updatedBadges,
    };

    if (updateStreak || !lastStudyDate) {
      updateData.streakCount = currentStreak;
      updateData.lastStudyDate = now;
    } else {
      // Just refresh the timestamp for lastStudyDate to mark study today
      updateData.lastStudyDate = now;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      success: true,
      streakCount: currentStreak,
      newBadges,
    };
  } catch (error) {
    console.error("Failed to record study activity:", error);
    return { success: false, error };
  }
}
