"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarRange,
  Calendar,
  Clock,
  Trash2,
  Plus,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deleteStudyPlanAction } from "@/app/actions/planner.actions";

interface PlanItem {
  id: string;
  title: string;
  targetDate: string;
  dailyMinutes: number;
  tasks: Array<{ isCompleted: boolean }>;
}

interface PlansListClientProps {
  plans: PlanItem[];
}

export function PlansListClient({ plans }: PlansListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeletePlan = async (planId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to delete this study plan? All tracking progress will be lost."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteStudyPlanAction(planId);
      if (res.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
            <span className="badge bg-primary/10 text-primary border-primary/20">
              {plans.length} Roadmaps
            </span>
          </div>
          <p className="text-muted-foreground mt-2">
            Manage your daily learning milestones and schedules.
          </p>
        </div>
        <Link
          href="/planner/new"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Study Plan
        </Link>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const totalTasks = plan.tasks.length;
          const completedTasks = plan.tasks.filter((t) => t.isCompleted).length;
          const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <Link
              key={plan.id}
              href={`/planner/${plan.id}`}
              className="glass-card p-6 hover:border-primary/30 transition-all duration-300 relative group flex flex-col justify-between"
            >
              {/* Trash/Delete button */}
              <button
                onClick={(e) => handleDeletePlan(plan.id, e)}
                disabled={isPending}
                className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 p-2 rounded-lg hover:bg-red-500/5 transition-colors cursor-pointer"
                title="Delete Study Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <span className="badge bg-muted/60 text-muted-foreground border-border/40 mb-3">
                  Roadmap
                </span>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors pr-8 line-clamp-1">
                  {plan.title}
                </h3>

                <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {formatDate(plan.targetDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{plan.dailyMinutes} mins / day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {totalTasks} days total ({completedTasks} completed)
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 pt-6 border-t border-border/20">
                <div className="flex justify-between items-center text-[10px] font-semibold mb-2">
                  <span className="text-muted-foreground">Completion Progress</span>
                  <span className="text-primary font-bold">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-end gap-1 text-xs font-semibold text-primary mt-4 group-hover:translate-x-1 transition-transform">
                  View Roadmap <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
