"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, CheckCircle2, Circle, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTaskCompletionAction } from "@/app/actions/planner.actions";

interface TodayPlanWidgetProps {
  plan: {
    id: string;
    title: string;
    targetDate: string;
    dailyMinutes: number;
    tasks: Array<{
      id: string;
      dayNumber: number;
      date: string;
      topic: string;
      description: string;
      estimatedMinutes: number;
      isCompleted: boolean;
    }>;
  } | null;
}

export function TodayPlanWidget({ plan }: TodayPlanWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!plan) {
    return (
      <div className="glass-card p-6 mb-10 border border-primary/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
              AI Study Planner
              <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                New
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Turn your uploaded PDF textbooks and class notes into a customized, day-by-day study calendar. Stay organized, track learning habits, and prevent exam cramming.
            </p>
          </div>
        </div>
        <Link href="/planner" className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4 whitespace-nowrap self-stretch md:self-auto justify-center">
          <Sparkles className="w-4 h-4" />
          Set Up Planner
        </Link>
      </div>
    );
  }

  const tasks = plan.tasks;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  // Find the first uncompleted task (today's focus)
  const todayTask = tasks.find((t) => !t.isCompleted);

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    startTransition(async () => {
      await toggleTaskCompletionAction(taskId, isCompleted);
      router.refresh();
    });
  };

  return (
    <div className="glass-card p-6 mb-10 border border-primary/10">
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-border/30 pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Today's Study Target
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm sm:max-w-md">
            Roadmap: <strong className="text-foreground font-semibold">{plan.title}</strong>
          </p>
        </div>
        <Link
          href="/planner"
          className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
        >
          View Roadmap <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {todayTask ? (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <button
              onClick={() => handleToggleTask(todayTask.id, todayTask.isCompleted)}
              disabled={isPending}
              className="mt-1 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary font-bold font-mono">
                  Day {todayTask.dayNumber}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3 text-violet-400" />
                  {todayTask.estimatedMinutes}m
                </span>
              </div>
              <h3 className="font-bold text-foreground text-sm mt-1 truncate">
                {todayTask.topic}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {todayTask.description}
              </p>
            </div>
          </div>

          {/* Progress Bar Widget */}
          <div className="w-full md:w-48 flex-shrink-0 bg-muted/20 border border-border/30 p-3 rounded-xl">
            <div className="flex justify-between items-center text-[10px] font-semibold mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">All caught up!</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have completed all learning targets in this study plan.
              </p>
            </div>
          </div>
          <div className="w-24 text-right">
            <span className="text-xs font-bold text-emerald-400">100% Done</span>
          </div>
        </div>
      )}
    </div>
  );
}
