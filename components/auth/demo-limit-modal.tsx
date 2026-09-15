"use client";

import { Modal } from "@/components/ui/modal";
import { Sparkles, Check, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface DemoLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  limitType?: "document" | "quiz" | "general";
}

export function DemoLimitModal({
  isOpen,
  onClose,
  title,
  description,
  limitType = "general",
}: DemoLimitModalProps) {
  const [loading, setLoading] = useState(false);

  const defaultTitle =
    limitType === "document"
      ? "Document Upload Limit Reached"
      : limitType === "quiz"
      ? "Test Generation Limit Reached"
      : "Demo Sandbox Limit Reached";

  const defaultDescription =
    limitType === "document"
      ? "Demo accounts are limited to 1 document upload. Sign in with Google to get unlimited document uploads, spaced repetition flashcards, and persistent storage."
      : limitType === "quiz"
      ? "Demo accounts are limited to 1 test generation. Sign in with Google to generate unlimited tests, oral exams, and personalized weakness slaying decks."
      : "You've reached the free demo limit (1 document upload & 1 test generation). Sign in with Google to unlock unlimited access with zero paywalls.";

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: window.location.href || "/dashboard" });
    } catch (e) {
      console.error("Google sign in failed:", e);
      setLoading(false);
    }
  };

  const perks = [
    "Unlimited PDF & slide document uploads (up to 20MB)",
    "Unlimited AI practice quizzes, mock vivas & voice oral exams",
    "Full SuperMemo-2 (SM-2) Spaced Repetition memory scheduler",
    "1-Click Diagnostic Cockpit & Weakness Slaying decks",
    "100% Free & private permanent cloud storage",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      icon={<Sparkles className="w-5 h-5 text-primary animate-pulse" />}
      title={title || defaultTitle}
      description={description || defaultDescription}
    >
      <div className="space-y-6 pt-2">
        {/* Perks Box */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Sign In to Unlock Everything (100% Free):</span>
          </div>
          <div className="space-y-2">
            {perks.map((p) => (
              <div key={p} className="flex items-start gap-2.5 text-xs text-foreground">
                <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span className="leading-tight">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/95 hover:to-indigo-500 shadow-xl shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {/* Google 4-color icon */}
            <svg
              className="w-4 h-4 flex-shrink-0 bg-white rounded-full p-0.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>{loading ? "Redirecting to Google..." : "Continue with Google (Free & Unlimited)"}</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </Modal>
  );
}
