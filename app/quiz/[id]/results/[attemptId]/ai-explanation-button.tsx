"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { getWrongAnswerExplanationAction } from "@/app/actions/tutor.actions";
import { SpeechButton } from "@/components/ui/speech-button";

interface AIExplanationButtonProps {
  answerId: string;
  initialExplanation: string | null;
}

export function AIExplanationButton({
  answerId,
  initialExplanation,
}: AIExplanationButtonProps) {
  const [explanation, setExplanation] = useState<string | null>(initialExplanation);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleFetchExplanation = () => {
    if (isPending) return;
    setError("");

    startTransition(async () => {
      const res = await getWrongAnswerExplanationAction(answerId);
      if (res.success && res.aiExplanation) {
        setExplanation(res.aiExplanation);
      } else {
        setError(res.error || "Failed to load explanation.");
      }
    });
  };

  if (explanation) {
    return (
      <div className="ml-11 mt-3 p-4 rounded-xl bg-violet-500/[0.03] border border-violet-500/10 text-xs sm:text-sm text-muted-foreground animate-fade-in">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5 text-primary font-bold">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Deep AI Analysis</span>
          </div>
          <SpeechButton
            text={explanation}
            className="cursor-pointer"
            sizeClassName="w-3.5 h-3.5"
          />
        </div>
        <p className="leading-relaxed whitespace-pre-wrap">{explanation}</p>
      </div>
    );
  }

  return (
    <div className="ml-11 mt-3 space-y-2">
      {isPending ? (
        <div className="inline-flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          <span>AI is analyzing your mistake...</span>
        </div>
      ) : (
        <button
          onClick={handleFetchExplanation}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-primary/20 hover:border-primary text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Explain with AI
        </button>
      )}

      {error && (
        <div className="flex gap-1.5 text-[11px] text-red-400 items-center">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
