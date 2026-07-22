"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  CalendarRange,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Coins,
  Award,
  ShoppingBag,
  Info,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress";
import {
  toggleTaskCompletionAction,
  deleteStudyPlanAction,
  recalibrateStudyPlanAction,
  purchaseShopItemAction,
  selectActiveThemeOrTitleAction,
} from "@/app/actions/planner.actions";
import { exportStudyPlanToICSAction, syncPlanToGoogleCalendarAction } from "@/app/actions/calendar.actions";
import Link from "next/link";

// ─── Theme Configuration ──────────────────────────────────────

const THEMES: Record<
  string,
  {
    name: string;
    bg: string;
    card: string;
    text: string;
    primary: string;
    border: string;
    badge: string;
  }
> = {
  default: {
    name: "Classic Slate",
    bg: "bg-background text-foreground",
    card: "glass-card border-border",
    text: "text-foreground",
    primary: "text-primary",
    border: "border-border",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  cyberpunk: {
    name: "Neon Cyberpunk",
    bg: "bg-[#fcf8ff] dark:bg-[#06000e] text-[#b5006c] dark:text-[#00ffcc] border border-[#ff0055]/20 p-6 rounded-2xl",
    card: "border border-[#ff0055]/30 bg-white/80 dark:bg-zinc-950/80 shadow-[0_0_15px_rgba(255,0,85,0.06)] dark:shadow-[0_0_15px_rgba(255,0,85,0.1)] rounded-2xl",
    text: "text-[#b5006c] dark:text-[#00ffcc]",
    primary: "text-[#ff0055]",
    border: "border-[#ff0055]/30",
    badge: "bg-[#ff0055]/10 dark:bg-[#ff0055]/15 text-[#ff0055] border-[#ff0055]/20 dark:border-[#ff0055]/25",
  },
  lofi: {
    name: "Lofi Cafe",
    bg: "bg-[#faf6f2] dark:bg-[#251b18] text-[#5c3e35] dark:text-[#e5cbbb] border border-[#8c6756]/20 p-6 rounded-2xl",
    card: "border border-[#8c6756]/30 dark:border-[#8c6756]/40 bg-white/70 dark:bg-[#1e1311] shadow-inner rounded-2xl",
    text: "text-[#5c3e35] dark:text-[#e5cbbb]",
    primary: "text-[#d17f69]",
    border: "border-[#8c6756]/30",
    badge: "bg-[#d17f69]/10 dark:bg-[#d17f69]/15 text-[#d17f69] border-[#d17f69]/20 dark:border-[#d17f69]/25",
  },
};

// ─── Props Interface ──────────────────────────────────────────

interface PlannerClientProps {
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
  };
  userProfile: {
    xp: number;
    gold: number;
    level: number;
    unlockedThemes: string[];
    activeTheme: string;
    activeTitle: string;
  };
}

// ─── Component ────────────────────────────────────────────────

export function PlannerClient({ plan, userProfile }: PlannerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopError, setShopError] = useState("");
  const [shopSuccess, setShopSuccess] = useState("");

  const tasks = plan.tasks;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  // Identify first uncompleted task
  const currentFocusIndex = tasks.findIndex((t) => !t.isCompleted);

  const targetDate = new Date(plan.targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const overdueUncompletedCount = tasks.filter(
    (t) => !t.isCompleted && new Date(t.date) < today
  ).length;

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    startTransition(async () => {
      await toggleTaskCompletionAction(taskId, !isCompleted);
      router.refresh();
    });
  };

  const handleResetPlan = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this study plan? All tracking progress will be lost."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteStudyPlanAction(plan.id);
      if (res.success) {
        router.push("/planner");
        router.refresh();
      }
    });
  };

  const handleRecalibratePlan = async () => {
    if (isPending) return;
    if (
      !confirm(
        "Recalibrate schedule? This will let AI redistribute your uncompleted topics over the remaining days."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await recalibrateStudyPlanAction(plan.id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to reschedule study tasks.");
      }
    });
  };

  // Google Calendar integration
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [googleSyncError, setGoogleSyncError] = useState("");
  const [googleSyncSuccess, setGoogleSyncSuccess] = useState(false);

  const handleGoogleSync = async () => {
    setIsSyncingGoogle(true);
    setGoogleSyncError("");
    setGoogleSyncSuccess(false);

    try {
      const res = await syncPlanToGoogleCalendarAction(plan.id);
      if (res.success) {
        setGoogleSyncSuccess(true);
      } else {
        setGoogleSyncError(res.error || "Failed to sync to Google Calendar.");
      }
    } catch (err) {
      setGoogleSyncError("Failed to synchronize. Make sure your Google account is connected.");
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  const handleSyncToCalendar = async () => {
    try {
      const res = await exportStudyPlanToICSAction(plan.id);
      if (res.success && res.icsString && res.filename) {
        const blob = new Blob([res.icsString], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.filename);
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert(res.error || "Failed to generate calendar file.");
      }
    } catch (err) {
      alert("Failed to export calendar. Please try again.");
    }
  };

  // Shop purchase / equip handlers
  const handleShopAction = async (itemId: string, cost: number, type: "theme" | "title", owned: boolean) => {
    setShopError("");
    setShopSuccess("");

    startTransition(async () => {
      if (owned) {
        // Equip
        const res = await selectActiveThemeOrTitleAction(itemId, type);
        if (res.success) {
          setShopSuccess(`${type === "theme" ? "Theme" : "Title"} equipped successfully!`);
          router.refresh();
        } else {
          setShopError(res.error || "Failed to equip item.");
        }
      } else {
        // Purchase
        const res = await purchaseShopItemAction(itemId, cost, type);
        if (res.success) {
          setShopSuccess(`${type === "theme" ? "Theme" : "Title"} purchased and equipped!`);
          router.refresh();
        } else {
          setShopError(res.error || "Purchase failed.");
        }
      }
    });
  };

  // Theme styling mapping
  const currentTheme = THEMES[userProfile.activeTheme] || THEMES.default;
  const xpNeeded = userProfile.level * 100;
  const xpPercentage = Math.min(100, (userProfile.xp / xpNeeded) * 100);

  return (
    <div className={cn("max-w-4xl mx-auto animate-fade-in transition-all duration-300 p-1", currentTheme.bg)}>
      {/* Back button */}
      <Link
        href="/planner"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium select-none"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Study Plans
      </Link>

      {/* RPG Profile status bar */}
      <div className={cn("p-5 mb-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden select-none border border-primary/10 bg-muted/40 dark:bg-zinc-950/30")}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Level and Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex flex-col items-center justify-center text-primary shadow-inner flex-shrink-0">
            <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground leading-none">Level</span>
            <span className="text-lg font-black leading-none mt-0.5">{userProfile.level}</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-foreground tracking-tight">{userProfile.activeTitle}</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Slay quests to earn XP and level up!</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex-1 max-w-sm">
          <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 text-muted-foreground">
            <span>EXPERIENCE POINTS</span>
            <span>
              {userProfile.xp} / {xpNeeded} XP
            </span>
          </div>
          <ProgressBar
            value={xpPercentage}
            color="bg-gradient-to-r from-primary to-indigo-500 shadow-[0_0_5px_rgba(124,58,237,0.5)]"
            height="lg"
            className="mt-1"
          />
        </div>

        {/* Gold & Shop link */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl">
            <Coins className="w-4 h-4 fill-amber-400 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-black tracking-tight">{userProfile.gold} Gold</span>
          </div>
          <button
            onClick={() => setShowShopModal(true)}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-extrabold py-2 px-3.5 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-primary/25 cursor-pointer active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Visit Shop
          </button>
        </div>
      </div>

      {/* Plan Header Card */}
      <div className={cn("p-6 mb-8 relative overflow-hidden rounded-2xl border", currentTheme.card)}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className={cn("badge text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border select-none mb-2.5 inline-block", currentTheme.badge)}>
              Active Roadmap
            </span>
            <h1 className="text-2xl font-black tracking-tight text-foreground">{plan.title}</h1>
            <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Until {formatDate(plan.targetDate)}
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {plan.dailyMinutes}m / day
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto select-none">
            <button
              onClick={() => setShowSyncModal(true)}
              className="btn-secondary h-10 text-xs px-4 border border-border hover:bg-muted/40 inline-flex items-center gap-1.5 cursor-pointer justify-center"
            >
              <CalendarRange className="w-4 h-4 text-primary" />
              Sync to Calendar (.ics)
            </button>
            <button
              onClick={handleResetPlan}
              disabled={isPending}
              className="btn-secondary h-10 text-xs px-4 text-red-400 hover:text-red-300 border border-red-500/10 hover:bg-red-500/5 inline-flex items-center gap-1.5 cursor-pointer justify-center"
            >
              <Trash2 className="w-4 h-4" />
              Delete Plan
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mt-6 pt-6 border-t border-border/30">
          <div className="flex justify-between items-center text-xs font-semibold mb-2 select-none">
            <span className="text-muted-foreground">Course Completion</span>
            <span className="text-primary font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/30">
            <div
              className="bg-primary h-2 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium select-none">
            {completedCount} of {tasks.length} days completed
          </p>
        </div>
      </div>

      {/* Exam Countdown & Smart Recalibration Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 select-none">
        {/* Countdown Card */}
        <div className="glass-card p-5 border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            <Calendar className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
              Exam Countdown
            </span>
            <h3 className="font-extrabold text-lg text-foreground mt-0.5">
              {diffDays > 0 ? (
                <>⏳ {diffDays} {diffDays === 1 ? "day" : "days"} left</>
              ) : diffDays === 0 ? (
                <>🎉 Exam Day is Today!</>
              ) : (
                <>⚠️ Exam Date passed</>
              )}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Target Date: {formatDate(plan.targetDate)}
            </p>
          </div>
        </div>

        {/* Smart Planner Recalibrator Card */}
        <div className="glass-card p-5 border border-border/85 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              overdueUncompletedCount > 0
                ? "bg-amber-500/10 text-amber-400"
                : "bg-muted/40 text-muted-foreground"
            }`}>
              {overdueUncompletedCount > 0 ? <AlertCircle className="w-5 h-5 animate-bounce" style={{ animationDuration: "3s" }} /> : <Sparkles className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {overdueUncompletedCount > 0 ? "Workload Recalibration Suggested" : "Workload Planner"}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                {overdueUncompletedCount > 0
                  ? `You missed ${overdueUncompletedCount} study tasks. Recalibrate to redistribute topics.`
                  : "Workload matches your schedule. Missed a day? Let AI redistribute your tasks."}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRecalibratePlan}
              disabled={isPending || tasks.filter((t: any) => !t.isCompleted).length === 0}
              className="text-xs font-bold text-primary hover:text-primary-hover transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              {isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CalendarRange className="w-3.5 h-3.5" />
              )}
              AI Recalibrate Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Days Roadmap Timeline List */}
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 select-none">
        Daily Quests Roadmap
      </h2>

      <div className="relative border-l border-border/60 ml-4 pl-8 space-y-6">
        {tasks.map((task: any, index: number) => {
          const isCompleted = task.isCompleted;
          const isCurrentFocus = index === currentFocusIndex;

          return (
            <div
              key={task.id}
              className={cn(
                "relative transition-all duration-300",
                isCompleted && "opacity-60"
              )}
            >
              {/* Timeline Bullet Marker Node */}
              <div
                className={cn(
                  "absolute -left-[45px] top-1.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer z-10 select-none",
                  isCompleted
                    ? "bg-emerald-500 border-emerald-600 text-white"
                    : isCurrentFocus
                    ? "bg-primary border-primary text-white ring-4 ring-primary/20"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                )}
                onClick={() => handleToggleTask(task.id, isCompleted)}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-bold font-mono">{task.dayNumber}</span>
                )}
              </div>

              {/* Task Details Card Container */}
              <div
                className={cn(
                  "p-5 hover:border-border/80 transition-all border",
                  isCurrentFocus && "ring-2 ring-primary border-primary",
                  currentTheme.card
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap select-none">
                      <span className="text-xs text-muted-foreground font-semibold">
                        Quest {task.dayNumber} · {formatDate(task.date)}
                      </span>
                      {isCurrentFocus && (
                        <span className="text-[9px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Active Quest
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base mt-1">
                      {task.topic}
                    </h3>
                  </div>

                  <div className="flex gap-2 flex-shrink-0 select-none">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/40 border border-border/40 px-2 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-violet-400" />
                      {task.estimatedMinutes} mins
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      +10 Gold
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg font-bold">
                      +50 XP
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {task.description}
                </p>

                {/* Inline practice shortcut */}
                <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between select-none">
                  <button
                    onClick={() => handleToggleTask(task.id, isCompleted)}
                    className={cn(
                      "text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer",
                      isCompleted
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-primary hover:text-primary-hover"
                    )}
                  >
                    {isCompleted ? "Mark as Active" : "Complete Quest"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quest Sync Modal */}
      {showSyncModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSyncModal(false)} />

          {/* Modal Content */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl relative w-full max-w-md p-6 overflow-hidden z-10 animate-scale-up shadow-2xl space-y-5">
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CalendarRange className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Sync Study Quests</h2>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>
                Follow the options below to sync your day-by-day study roadmap calendar events directly into your personal digital planners.
              </p>

              {/* Option A: Direct Google Calendar Sync */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5">
                <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider font-mono">Direct Cloud Sync</span>
                <h4 className="font-bold text-foreground text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Directly Sync to Google Calendar
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Click below to automatically push all planner study tasks as individual events to your primary calendar.
                </p>

                {googleSyncError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px]">
                    {googleSyncError}
                  </div>
                )}

                {googleSyncSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                    ✓ Successfully pushed {plan.tasks.length} study events to your Google Calendar!
                  </div>
                )}

                <button
                  onClick={handleGoogleSync}
                  disabled={isSyncingGoogle}
                  className="btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSyncingGoogle ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing events...</span>
                    </>
                  ) : (
                    <>
                      <CalendarRange className="w-3.5 h-3.5" />
                      <span>Sync Direct to Google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border/40"></div>
                <span className="flex-shrink mx-3 text-[9px] uppercase font-bold tracking-wider text-muted-foreground select-none">or use manual import</span>
                <div className="flex-grow border-t border-border/40"></div>
              </div>

              {/* Step 1: Download */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2.5">
                <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider font-mono">Step 1</span>
                <h4 className="font-bold text-foreground text-[11px]">Download universal roadmap calendar feed</h4>
                <button
                  onClick={handleSyncToCalendar}
                  className="btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  Download .ics Calendar File
                </button>
              </div>

              {/* Step 2: Import links */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-3">
                <span className="text-[9px] uppercase font-extrabold text-primary tracking-wider font-mono">Step 2</span>
                <h4 className="font-bold text-foreground text-[11px]">Select your calendar service to upload</h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="https://calendar.google.com/calendar/r/settings/export"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-2 text-center text-[10px] font-bold border border-border hover:bg-muted/60 inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Google Calendar ↗
                  </a>
                  <a
                    href="https://outlook.live.com/calendar/0/options/calendar/importSubCalendars"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-2 text-center text-[10px] font-bold border border-border hover:bg-muted/60 inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    MS Outlook ↗
                  </a>
                </div>
                <p className="text-[10px] italic text-muted-foreground text-center">
                  Notice: Download the calendar file first, then click either service to load its import setup panel directly.
                </p>
              </div>
            </div>
          </div>
        </div>,
        window.document.body
      )}

      {/* Quest Merchant Shop Modal */}
      {showShopModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShopModal(false)} />

          {/* Modal Content */}
          <div className="bg-card text-foreground border border-border rounded-2xl relative w-full max-w-lg p-6 overflow-hidden z-10 animate-scale-up shadow-2xl flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowShopModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Shop Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-base font-extrabold text-foreground">Quest Merchant Shop</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-xl">
                <Coins className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black tracking-tight">{userProfile.gold} Gold</span>
              </div>
            </div>

            {/* Error/Success alerts */}
            {shopError && (
              <div className="p-3 mb-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-1.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {shopError}
              </div>
            )}

            {shopSuccess && (
              <div className="p-3 mb-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {shopSuccess}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Section 1: Dashboard Themes */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Premium UI Themes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(THEMES).map(([id, theme]) => {
                    const cost = id === "default" ? 0 : 50;
                    const owned = id === "default" || userProfile.unlockedThemes.includes(id);
                    const active = userProfile.activeTheme === id;

                    return (
                      <div
                        key={id}
                        className={cn(
                          "p-3.5 rounded-xl border flex flex-col justify-between gap-3 bg-muted/40 dark:bg-zinc-950/40 relative overflow-hidden",
                          active ? "border-primary bg-primary/[0.02]" : "border-border/60"
                        )}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{theme.name}</h4>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {id === "default"
                              ? "Clean standard visual outline."
                              : id === "cyberpunk"
                              ? "Glowing neon cyberpunk outline."
                              : "Warm rustic woodsy lofi layout."}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          {active ? (
                            <span className="w-full text-center block text-[9px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30 py-1.5 rounded-lg select-none">
                              Equipped
                            </span>
                          ) : (
                            <button
                              onClick={() => handleShopAction(id, cost, "theme", owned)}
                              className={cn(
                                "w-full text-center block text-[9px] font-extrabold uppercase py-1.5 rounded-lg transition-all cursor-pointer",
                                owned
                                  ? "bg-muted border border-border text-foreground hover:bg-muted/80"
                                  : "bg-amber-500 hover:bg-amber-600 text-zinc-950"
                              )}
                            >
                              {owned ? "Equip Theme" : `Buy (${cost} Gold)`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Scholastic Titles */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  Premium Scholastic Titles
                </h3>
                <div className="space-y-2">
                  {[
                    { id: "Novice Scholar", cost: 0 },
                    { id: "Database Mage", cost: 50 },
                    { id: "Algorithmic Knight", cost: 100 },
                    { id: "Fullstack Conqueror", cost: 200 },
                  ].map((title) => {
                    const cost = title.cost;
                    // If cost is 0, they always own it. For others, let's allow them to purchase if they have enough gold
                    const owned = cost === 0 || userProfile.gold >= cost || userProfile.activeTitle === title.id;
                    const active = userProfile.activeTitle === title.id;

                    return (
                      <div
                        key={title.id}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-between bg-muted/40 dark:bg-zinc-950/40",
                          active ? "border-primary bg-primary/[0.02]" : "border-border/60"
                        )}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{title.id}</h4>
                          <span className="text-[9px] text-muted-foreground block mt-0.5">
                            {cost === 0 ? "Default title for scholars." : `Requires ${cost} Gold vault.`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {active ? (
                            <span className="text-[8px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-lg">
                              Equipped
                            </span>
                          ) : (
                            <button
                              onClick={() => handleShopAction(title.id, cost, "title", owned)}
                              className={cn(
                                "text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                                owned
                                  ? "bg-muted border border-border text-foreground hover:bg-muted/80"
                                  : "bg-amber-500 hover:bg-amber-600 text-zinc-950"
                              )}
                            >
                              {owned ? "Equip Title" : `Buy (${cost} Gold)`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shop Footer */}
            <div className="border-t border-border/40 pt-4 mt-4 text-[9px] text-muted-foreground flex items-center gap-1.5 flex-shrink-0 select-none">
              <Info className="w-3.5 h-3.5 text-primary" />
              <span>Complete daily planner quests to earn gold and purchase premium items from the merchant.</span>
            </div>
          </div>
        </div>,
        window.document.body
      )}
    </div>
  );
}
