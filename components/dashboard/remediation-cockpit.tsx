"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit, AlertTriangle, CheckCircle, Flame, ArrowRight } from "lucide-react";
import { generateRemedialDeckAction } from "@/app/actions/remedial.actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";

interface DiagnosticItem {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  documentId: string;
  documentTitle: string;
  isWeak: boolean;
}

interface RemediationCockpitProps {
  diagnostics: DiagnosticItem[];
  limit?: number;
}

export function RemediationCockpit({ diagnostics, limit }: RemediationCockpitProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const weakTopics = diagnostics.filter((d) => d.isWeak);
  const displayedWeakTopics = limit ? weakTopics.slice(0, limit) : weakTopics;
  const hasWeakness = weakTopics.length > 0;

  const handleSlayWeaknesses = async () => {
    if (!hasWeakness || isPending) return;
    setError("");
    setSuccess("");

    const primaryDocId = weakTopics[0].documentId;
    const docTitle = weakTopics[0].documentTitle;
    const targetTopics = weakTopics
      .filter((t) => t.documentId === primaryDocId)
      .slice(0, 3)
      .map((t) => t.topic);

    startTransition(async () => {
      try {
        const res = await generateRemedialDeckAction(primaryDocId, targetTopics, docTitle);
        if (res.success && res.deckId) {
          setSuccess("Remedial flashcard deck generated successfully!");
          router.push(`/flashcards/${res.deckId}`);
          router.refresh();
        } else {
          setError(res.error || "Failed to generate targeted study material.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Card variant="glass">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            AI Weakness Diagnostic & Smart Remediation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 select-none">
            AI clusters incorrect quiz answers by concept and dynamically maps your critical knowledge gaps.
          </p>
        </div>

        {hasWeakness && (
          <Button
            onClick={handleSlayWeaknesses}
            loading={isPending}
            variant="primary"
            size="sm"
            className="self-start sm:self-auto cursor-pointer"
          >
            {!isPending && <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />}
            {isPending ? "Forging Deck..." : "Slay Weaknesses"}
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-1.5 animate-fade-in select-none relative z-10">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-1.5 animate-fade-in select-none relative z-10">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Topics Heatmap/Analysis Grid */}
      {!hasWeakness ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/60 rounded-2xl bg-muted/5 text-center select-none relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-500">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Mastery Clear!</h3>
          <p className="text-[11px] text-muted-foreground max-w-sm mt-1">
            You don't have any concept accuracy under 70%. Keep practicing to maintain your excellent streak!
          </p>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedWeakTopics.map((t) => (
              <div
                key={t.topic}
                className="p-4 rounded-xl bg-muted/40 dark:bg-zinc-950/20 border border-border flex flex-col justify-between gap-3 shadow-sm hover:border-primary/30 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-relaxed">{t.topic}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px] select-none">
                        Source: {t.documentTitle}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full flex-shrink-0 select-none">
                      {t.accuracy}% Accuracy
                    </span>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar
                    value={t.accuracy}
                    color={t.accuracy < 40 ? "bg-red-500" : "bg-amber-500"}
                    className="mt-3"
                  />
                </div>

                <p className="text-[10px] text-muted-foreground select-none">
                  Missed {t.total - t.correct} out of {t.total} questions testing this concept.
                </p>
              </div>
            ))}
          </div>

          {limit && weakTopics.length > limit && (
            <div className="flex justify-end mt-5">
              <Link
                href="/dashboard/diagnostics"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer select-none group transition-colors"
              >
                See All Diagnostics ({weakTopics.length})
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
