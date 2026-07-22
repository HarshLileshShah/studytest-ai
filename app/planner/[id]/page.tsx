import { getStudyPlan } from "@/services/planner.service";
import { PlannerClient } from "../planner-client";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailsPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  const [plan, userProfile] = await Promise.all([
    getStudyPlan(id, userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        gold: true,
        level: true,
        unlockedThemes: true,
        activeTheme: true,
        activeTitle: true,
      },
    }),
  ]);

  if (!plan || !userProfile) {
    notFound();
  }

  const serializedPlan = {
    id: plan.id,
    title: plan.title,
    dailyMinutes: plan.dailyMinutes,
    targetDate: plan.targetDate.toISOString(),
    tasks: plan.tasks.map((task) => ({
      id: task.id,
      dayNumber: task.dayNumber,
      date: task.date.toISOString(),
      topic: task.topic,
      description: task.description,
      estimatedMinutes: task.estimatedMinutes,
      isCompleted: task.isCompleted,
    })),
  };

  const serializedProfile = {
    xp: userProfile.xp,
    gold: userProfile.gold,
    level: userProfile.level,
    unlockedThemes: (userProfile.unlockedThemes as string[]) || ["default"],
    activeTheme: userProfile.activeTheme,
    activeTitle: userProfile.activeTitle,
  };

  return <PlannerClient plan={serializedPlan} userProfile={serializedProfile} />;
}
