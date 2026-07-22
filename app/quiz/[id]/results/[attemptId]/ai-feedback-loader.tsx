"use client";

import { useState, useTransition } from "react";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { generateAIFeedbackAction } from "@/app/actions/attempt.actions";

interface AIFeedbackLoaderProps {
  attemptId: string;
  initialFeedback: string | null;
}

export function AIFeedbackLoader({ attemptId, initialFeedback }: AIFeedbackLoaderProps) {
  const [feedback, setFeedback] = useState<string | null>(initialFeedback);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleGenerate = () => {
    setError("");
    startTransition(async () => {
      try {
        const res = await generateAIFeedbackAction(attemptId) as any;
        if (res?.success && res?.feedback) {
          setFeedback(res.feedback);
        } else {
          setError(res?.error || "Failed to compile recommendations.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      }
    });
  };

  if (feedback) {
    return (
      <div className="glass-card p-8 mb-10 border border-primary/10 animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          AI Study Recommendations
        </h2>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {feedback}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 mb-10 border border-border/80 text-center animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <Sparkles className="w-10 h-10 text-primary/70 mx-auto mb-3" />
      <h2 className="text-base font-bold mb-1">AI Study Recommendations</h2>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
        Receive personalized study recommendations and weaknesses diagnostic analysis for this attempt.
      </p>

      {error && (
        <div className="p-3 mb-4 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl max-w-sm mx-auto flex items-center gap-1.5 justify-center">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="btn-primary py-2 px-5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 mx-auto"
      >
        {isPending ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing Results...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Study Recommendations</span>
          </>
        )}
      </button>
    </div>
  );
}
