import { getStudyPlans } from "@/services/planner.service";
import { PlansListClient } from "./plans-list-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PlannerIndexPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch all study plans for this user
  const plans = await getStudyPlans(userId);

  // If they have no study plans, redirect them directly to the planner creation setup form
  if (plans.length === 0) {
    redirect("/planner/new");
  }

  const serializedPlans = plans.map((plan) => ({
    id: plan.id,
    title: plan.title,
    dailyMinutes: plan.dailyMinutes,
    targetDate: plan.targetDate.toISOString(),
    tasks: plan.tasks.map((task) => ({
      isCompleted: task.isCompleted,
    })),
  }));

  return <PlansListClient plans={serializedPlans} />;
}
