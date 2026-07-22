"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { generateRemedialDeckAction } from "@/app/actions/remedial.actions";

interface AnswerItem {
  id: string;
  isCorrect: boolean;
  question: {
    id: string;
    topic: string;
    question: string;
  };
}

interface GapAnalysisProps {
  documentId: string;
  quizTitle: string;
  answers: AnswerItem[];
}

export function GapAnalysis({ documentId, quizTitle, answers }: GapAnalysisProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Group incorrect answers by topic
  const incorrectAnswers = answers.filter((a) => !a.isCorrect);

  if (incorrectAnswers.length === 0) {
    return (
      <div className="glass-card p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex items-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-400 text-sm">Perfect Performance!</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            No knowledge gaps detected in this attempt. You have mastered all topics covered in this quiz!
          </p>
        </div>
      </div>
    );
  }

  // Calculate distinct weak topics and count incorrect replies in each
  const weakTopicsMap = incorrectAnswers.reduce((acc, current) => {
    const topic = current.question.topic || "General Concepts";
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weakTopics = Object.entries(weakTopicsMap).map(([name, count]) => ({
    name,
    count,
  }));

  const handleGenerateRemedial = async () => {
    setLoading(true);
    setError("");

    const topicNames = weakTopics.map((t) => t.name);

    try {
      const res = await generateRemedialDeckAction(documentId, topicNames, quizTitle);
      if (res.success && res.deckId) {
        router.push(`/flashcards/${res.deckId}`);
      } else {
        setError(res.error || "Failed to generate remedial deck.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 border border-border/80 rounded-2xl mb-8 relative overflow-hidden">
      {/* Glow Highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center flex-shrink-0 text-violet-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            Knowledge Gap Analysis
            <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] py-0.5 px-2 rounded-full font-bold uppercase tracking-wider">
              AI Diagnostic
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on your answers, you had some trouble with the following concepts.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
          {error}
        </div>
      )}

      {/* Weak Topics List */}
      <div className="space-y-2 mb-6">
        {weakTopics.map((topic) => (
          <div
            key={topic.name}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-border transition-all"
          >
            <div className="min-w-0 pr-4">
              <p className="font-semibold text-foreground text-xs">{topic.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                AI Suggestion: Re-read PDF sections related to &quot;{topic.name}&quot;.
              </p>
            </div>
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono px-2 py-0.5 rounded-md flex-shrink-0 font-semibold whitespace-nowrap">
              {topic.count} missed {topic.count === 1 ? "question" : "questions"}
            </span>
          </div>
        ))}
      </div>

      {/* Remedial Deck CTA */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold text-foreground">Master these weak concepts</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Generate an AI flashcard deck focusing exclusively on your missed topics.
          </p>
        </div>

        <button
          onClick={handleGenerateRemedial}
          disabled={loading}
          className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Deck...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Remedial Deck</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
