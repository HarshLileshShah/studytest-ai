"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useQuizSession } from "@/stores/quiz-session.store";
import { submitAttempt } from "@/app/actions/attempt.actions";
import { formatTime, getDifficultyColor, cn } from "@/lib/utils";
import type { QuestionInfo } from "@/types";

interface QuizAttemptClientProps {
  quizId: string;
  questions: QuestionInfo[];
  initialMode?: string;
  timeLimit?: number | null;
}

export default function QuizAttemptClient({
  quizId,
  questions,
  initialMode = "practice",
  timeLimit = null,
}: QuizAttemptClientProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabViolations, setTabViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);

  const {
    currentIndex,
    answers,
    timeElapsed,
    initSession,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    updateTimer,
    markSubmitted,
  } = useQuizSession();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize session on mount
  useEffect(() => {
    initSession(quizId, questions.length);
  }, [quizId, questions.length, initSession]);

  // Timer interval
  useEffect(() => {
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [updateTimer]);

  const isExamMode = initialMode === "exam";
  const timeLimitSeconds = timeLimit ? timeLimit * 60 : questions.length * 90; // Custom limit or fallback to 1.5m/question
  const timeRemaining = timeLimitSeconds - timeElapsed;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));

    const result = await submitAttempt({
      quizId,
      answers: answerArray,
      timeSpentSeconds: isExamMode ? Math.min(timeElapsed, timeLimitSeconds) : timeElapsed,
      mode: isExamMode ? "EXAM" : "PRACTICE",
    });

    if (result.success && result.attemptId) {
      markSubmitted();
      router.push(`/quiz/${quizId}/results/${result.attemptId}`);
    } else {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  }, [answers, quizId, timeElapsed, markSubmitted, router, isExamMode, timeLimitSeconds, isSubmitting]);

  // Auto-submit when countdown hits zero
  useEffect(() => {
    if (isExamMode && timeRemaining <= 0 && !isSubmitting) {
      handleSubmit();
    }
  }, [timeRemaining, isExamMode, isSubmitting, handleSubmit]);

  // Intercept navigation & refresh
  useEffect(() => {
    if (!isExamMode || isSubmitting) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Warning: Leaving this page will submit your quiz attempt immediately!";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isExamMode, isSubmitting]);

  // Tab visibility changes monitor
  useEffect(() => {
    if (!isExamMode || isSubmitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations((prev) => prev + 1);
        setShowViolationWarning(true);
      }
    };

    const handleWindowBlur = () => {
      setTabViolations((prev) => prev + 1);
      setShowViolationWarning(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isExamMode, isSubmitting]);

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Violations Warning Banner */}
      {isExamMode && showViolationWarning && (
        <div className="p-4 mb-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs sm:text-sm flex items-center justify-between animate-shake">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>
              <strong>Warning:</strong> Tab change or window focus loss detected ({tabViolations} violation{tabViolations > 1 ? "s" : ""}). This action is logged.
            </span>
          </div>
          <button
            onClick={() => setShowViolationWarning(false)}
            className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="glass-card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              Question {currentIndex + 1}
              <span className="text-muted-foreground"> / {questions.length}</span>
            </span>
            <span className={`badge text-[10px] ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className={cn("w-4 h-4 text-muted-foreground", isExamMode && timeRemaining <= 20 && "text-red-500 animate-pulse")} />
            {isExamMode ? (
              <span
                className={cn(
                  "font-mono font-bold transition-all",
                  timeRemaining <= 20
                    ? "text-red-500 text-base animate-pulse"
                    : timeRemaining <= 60
                      ? "text-yellow-500 font-semibold"
                      : "text-primary"
                )}
              >
                {formatTime(Math.max(0, timeRemaining))}
              </span>
            ) : (
              <span className="font-mono text-muted-foreground">{formatTime(timeElapsed)}</span>
            )}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {answeredCount} of {questions.length} answered
        </p>
      </div>

      {/* Question Card */}
      <div className="glass-card p-8 mb-8">
        {currentQuestion.topic && (
          <p className="text-xs text-primary font-medium uppercase tracking-wider mb-3">
            {currentQuestion.topic}
          </p>
        )}
        <h2 className="text-lg font-semibold leading-relaxed mb-6">
          {currentQuestion.question}
        </h2>

        {/* Options / Input */}
        {currentQuestion.type === "SHORT_ANSWER" ? (
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Your Written Answer
            </label>
            <textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here... AI will grade it semantically based on key concepts."
              className="w-full min-h-[140px] p-4 bg-muted/20 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none resize-none transition-all"
            />
          </div>
        ) : currentQuestion.type === "FILL_IN_THE_BLANKS" ? (
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Fill in the Blank Word/Phrase
            </label>
            <input
              type="text"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
              placeholder="Type the missing concept/word here..."
              className="w-full p-4 bg-muted/20 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {currentQuestion.options.map((option, i) => {
              const isSelected = answers[currentQuestion.id] === option;
              const optionLabel = String.fromCharCode(65 + i); // A, B, C, D

              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(currentQuestion.id, option)}
                  className={cn("option-card w-full text-left", isSelected && "selected")}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-muted-foreground/10 text-muted-foreground"
                    )}
                  >
                    {optionLabel}
                  </span>
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Navigator Dots */}
      <div className="glass-card p-5 mb-8">
        <p className="text-xs text-muted-foreground mb-2">Jump to question:</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(i)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                i === currentIndex
                  ? "bg-primary text-white"
                  : answers[q.id]
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-muted text-muted-foreground border border-border hover:border-primary/30"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="btn-secondary flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="btn-primary flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {mounted && showConfirm && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border p-6 max-w-md w-full rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Submit Quiz?</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              You have answered{" "}
              <span className="text-foreground font-medium">{answeredCount}</span>{" "}
              of{" "}
              <span className="text-foreground font-medium">{questions.length}</span>{" "}
              questions.
            </p>

            {answeredCount < questions.length && (
              <p className="text-sm text-amber-400 mb-4">
                ⚠ {questions.length - answeredCount} questions are unanswered and
                will be marked incorrect.
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
                disabled={isSubmitting}
              >
                Continue Quiz
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
