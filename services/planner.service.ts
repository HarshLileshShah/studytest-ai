import { prisma } from "@/lib/prisma";
import { generateStudyPlan, rescheduleStudyPlanTasks } from "./ai.service";

/**
 * Fetch all study plans for a user, including task completion counts.
 */
export async function getStudyPlans(userId: string) {
  return prisma.studyPlan.findMany({
    where: { userId },
    include: {
      tasks: {
        orderBy: { dayNumber: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetch a specific study plan for a user.
 */
export async function getStudyPlan(planId: string, userId: string) {
  return prisma.studyPlan.findFirst({
    where: { id: planId, userId },
    include: {
      tasks: {
        orderBy: { dayNumber: "asc" },
      },
    },
  });
}

/**
 * Generate and save a new day-by-day study plan.
 */
export async function createStudyPlan(
  userId: string,
  title: string,
  targetDate: Date,
  dailyMinutes: number,
  documentIds: string[]
) {
  // Fetch documents to build study materials context
  const documents = await prisma.document.findMany({
    where: {
      id: { in: documentIds },
      userId,
    },
    select: {
      title: true,
      extractedText: true,
    },
  });

  if (documents.length === 0) {
    throw new Error("No valid study documents selected.");
  }

  // Build summary text
  const summary = documents
    .map((doc) => {
      const excerpt = doc.extractedText ? doc.extractedText.slice(0, 1000) : "No text excerpt";
      return `Document Title: ${doc.title}\nKey Excerpt: ${excerpt}`;
    })
    .join("\n\n");

  // Calculate day intervals
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  let daysCount = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // Include target day

  if (daysCount < 1) {
    throw new Error("Target date must be in the future.");
  }
  if (daysCount > 30) {
    daysCount = 30; // clamp bounds to prevent AI timeout or context overflow
  }

  // Call LLM generator
  const rawTasks = await generateStudyPlan(summary, daysCount, dailyMinutes, title);

  // Store inside transaction: insert new plan and its tasks
  const plan = await prisma.$transaction(async (tx) => {
    const newPlan = await tx.studyPlan.create({
      data: {
        userId,
        title,
        targetDate: target,
        dailyMinutes,
      },
    });

    // Bulk create daily tasks with dates calculated sequentially
    const tasksData = rawTasks.map((t) => {
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + (t.dayNumber - 1));

      return {
        planId: newPlan.id,
        dayNumber: t.dayNumber,
        date: taskDate,
        topic: t.topic,
        description: t.description,
        estimatedMinutes: t.estimatedMinutes,
        isCompleted: false,
      };
    });

    await tx.studyPlanTask.createMany({
      data: tasksData,
    });

    return newPlan;
  });

  return getStudyPlan(plan.id, userId);
}

/**
 * Toggle the completion status of a planner task.
 */
export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  return prisma.studyPlanTask.update({
    where: { id: taskId },
    data: { isCompleted },
  });
}

/**
 * Delete/wipe a user's study plan.
 */
export async function deleteStudyPlan(planId: string, userId: string) {
  return prisma.studyPlan.delete({
    where: { id: planId, userId },
  });
}

/**
 * Recalibrate uncompleted study plan tasks over the remaining days.
 */
export async function recalibrateStudyPlan(planId: string, userId: string) {
  const plan = await prisma.studyPlan.findFirst({
    where: { id: planId, userId },
    include: { tasks: true },
  });

  if (!plan) {
    throw new Error("Study plan not found.");
  }

  // Filter completed and uncompleted tasks
  const completedTasks = plan.tasks.filter((t) => t.isCompleted);
  const uncompletedTasks = plan.tasks.filter((t) => !t.isCompleted);

  if (uncompletedTasks.length === 0) {
    return plan; // All tasks are already completed!
  }

  // Calculate remaining days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(plan.targetDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  let remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // Include target day

  if (remainingDays < 1) {
    remainingDays = 1; // Clamp to at least 1 day if exam is today or passed
  }
  if (remainingDays > 30) {
    remainingDays = 30; // clamp bounds
  }

  // Build summary of uncompleted topics
  const uncompletedSummary = uncompletedTasks
    .map((t) => `- Topic: ${t.topic}\n  Details: ${t.description}`)
    .join("\n\n");

  // Call AI generator to reschedule them
  const rawTasks = await rescheduleStudyPlanTasks(
    uncompletedSummary,
    remainingDays,
    plan.dailyMinutes,
    plan.title
  );

  // Database transaction: remove old uncompleted tasks, add new ones
  const updatedPlan = await prisma.$transaction(async (tx) => {
    // Delete uncompleted tasks
    await tx.studyPlanTask.deleteMany({
      where: {
        planId: plan.id,
        isCompleted: false,
      },
    });

    // Determine the next day number.
    const maxCompletedDayNum = completedTasks.reduce((max, t) => Math.max(max, t.dayNumber), 0);

    const tasksData = rawTasks.map((t, idx) => {
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + idx);

      return {
        planId: plan.id,
        dayNumber: maxCompletedDayNum + idx + 1,
        date: taskDate,
        topic: t.topic,
        description: t.description,
        estimatedMinutes: t.estimatedMinutes,
        isCompleted: false,
      };
    });

    await tx.studyPlanTask.createMany({
      data: tasksData,
    });

    return plan;
  });

  return getStudyPlan(plan.id, userId);
}
