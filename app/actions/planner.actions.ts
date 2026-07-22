"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createStudyPlan,
  toggleTaskCompletion,
  deleteStudyPlan,
  recalibrateStudyPlan,
} from "@/services/planner.service";

interface CreatePlanInput {
  title: string;
  targetDateStr: string;
  dailyMinutes: number;
  documentIds: string[];
}

/**
 * Server Action: Generate and save an AI study plan schedule.
 */
export async function createStudyPlanAction(input: CreatePlanInput) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const targetDate = new Date(input.targetDateStr);
    const plan = await createStudyPlan(
      userId,
      input.title,
      targetDate,
      input.dailyMinutes,
      input.documentIds
    );

    revalidatePath("/planner");
    revalidatePath("/planner/[id]", "layout");
    revalidatePath("/dashboard");

    return { success: true, planId: plan?.id };
  } catch (err: any) {
    console.error("Failed to generate study plan action:", err);
    return { success: false, error: err.message || "Failed to create study plan." };
  }
}

/**
 * Server Action: Toggle completion check status of a plan task.
 */
export async function toggleTaskCompletionAction(taskId: string, isCompleted: boolean) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    
    const task = await prisma.studyPlanTask.findUnique({
      where: { id: taskId },
      select: { isCompleted: true },
    });

    if (!task) {
      return { success: false, error: "Task not found." };
    }

    if (task.isCompleted !== isCompleted) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, gold: true, level: true },
      });

      if (user) {
        const addedXp = isCompleted ? 50 : -50;
        const addedGold = isCompleted ? 10 : -10;

        let level = user.level;
        let xp = user.xp + addedXp;
        let gold = Math.max(0, user.gold + addedGold);

        while (xp >= level * 100) {
          xp -= level * 100;
          level += 1;
        }

        while (xp < 0 && level > 1) {
          level -= 1;
          xp += level * 100;
        }
        if (xp < 0) xp = 0;

        await prisma.user.update({
          where: { id: userId },
          data: { xp, gold, level },
        });
      }
    }

    await toggleTaskCompletion(taskId, isCompleted);

    revalidatePath("/planner");
    revalidatePath("/planner/[id]", "layout");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to toggle task completion:", err);
    return { success: false, error: "Failed to update task." };
  }
}

/**
 * Server Action: Reset/delete the active study plan.
 */
export async function deleteStudyPlanAction(planId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await deleteStudyPlan(planId, userId);

    revalidatePath("/planner");
    revalidatePath("/planner/[id]", "layout");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete study plan:", err);
    return { success: false, error: "Failed to reset plan." };
  }
}

/**
 * Server Action: Recalibrate/reschedule uncompleted study tasks over the remaining study days.
 */
export async function recalibrateStudyPlanAction(planId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await recalibrateStudyPlan(planId, userId);

    revalidatePath("/planner");
    revalidatePath("/planner/[id]", "layout");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to recalibrate study plan:", err);
    return { success: false, error: err.message || "Failed to reschedule study roadmap." };
  }
}

export async function purchaseShopItemAction(itemId: string, cost: number, type: "theme" | "title") {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gold: true, unlockedThemes: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (user.gold < cost) {
      return { success: false, error: "Insufficient gold!" };
    }

    if (type === "theme") {
      const currentThemes = (user.unlockedThemes as string[]) || ["default"];
      if (currentThemes.includes(itemId)) {
        return { success: false, error: "Theme already purchased." };
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          gold: user.gold - cost,
          unlockedThemes: [...currentThemes, itemId],
          activeTheme: itemId,
        },
      });
    } else if (type === "title") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          gold: user.gold - cost,
          activeTitle: itemId,
        },
      });
    }

    revalidatePath("/planner");
    revalidatePath("/planner/[id]", "layout");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Shop purchase failed:", err);
    return { success: false, error: "Purchase failed." };
  }
}

export async function selectActiveThemeOrTitleAction(itemId: string, type: "theme" | "title") {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    if (type === "theme") {
      await prisma.user.update({
        where: { id: userId },
        data: { activeTheme: itemId },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { activeTitle: itemId },
      });
    }

    revalidatePath("/planner");
    revalidatePath("/planner/[id]", "layout");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Failed to update profile setting." };
  }
}
