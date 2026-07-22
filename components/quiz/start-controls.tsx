"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Play, Printer, Clock, AlertTriangle, BookOpen, Users, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { createQuizBattleAction } from "@/app/actions/battle.actions";
import { useRouter } from "next/navigation";

interface StartControlsProps {
  quizId: string;
  estimatedMinutes: number;
}

export function StartControls({ quizId, estimatedMinutes }: StartControlsProps) {
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStartBattle = () => {
    startTransition(async () => {
      const res = await createQuizBattleAction(quizId);
      if (res.success && res.battleId) {
        router.push(`/quiz/battle/${res.battleId}`);
      } else {
        alert(res.error || "Failed to start battle lobby.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Panel */}
      <div className="glass-card p-6 border border-primary/10 bg-muted/15">
        <h3 className="text-sm font-bold mb-3 text-foreground flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary" />
          Choose Quiz Mode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Practice Mode Choice */}
          <button
            onClick={() => setMode("practice")}
            className={cn(
              "flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer outline-none focus:ring-1 focus:ring-primary/40",
              mode === "practice"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-border/80 bg-background/50"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-foreground">Practice Mode</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Default</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              No time limits, count-up timer, free navigation, and study at your own comfortable pace.
            </p>
          </button>

          {/* Exam Mode Choice */}
          <button
            onClick={() => setMode("exam")}
            className={cn(
              "flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer outline-none focus:ring-1 focus:ring-primary/40",
              mode === "exam"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-border/80 bg-background/50"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-foreground">Exam Mode</span>
              <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Timed</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Strict countdown timer ({estimatedMinutes} mins), automatic submission on time limit, and tab blur warning monitoring.
            </p>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/quiz/${quizId}/attempt?mode=${mode}`}
          className="btn-primary flex items-center justify-center gap-2 flex-1 py-4 text-base font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Solo Quiz
        </Link>
        <button
          onClick={handleStartBattle}
          disabled={isPending}
          className="btn-secondary text-primary border-primary/25 hover:bg-primary/5 flex items-center justify-center gap-2 flex-1 py-4 text-base font-semibold cursor-pointer disabled:opacity-40"
        >
          {isPending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Users className="w-5 h-5" />
          )}
          Multiplayer Battle
        </button>
        <Link
          href={`/quiz/${quizId}/print`}
          className="btn-secondary flex items-center justify-center gap-2 flex-1 py-4 text-base font-semibold"
        >
          <Printer className="w-5 h-5" />
          Print / PDF
        </Link>
      </div>
    </div>
  );
}
