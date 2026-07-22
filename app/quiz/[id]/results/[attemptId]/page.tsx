import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { getAttempt } from "@/services/evaluation.service";
import { PrintResultsButton } from "@/components/quiz/print-results-button";
import { auth } from "@/auth";
import { AIExplanationButton } from "./ai-explanation-button";
import { SpeechButton } from "@/components/ui/speech-button";
import { GapAnalysis } from "./gap-analysis";
import { AIFeedbackLoader } from "./ai-feedback-loader";
import {
  formatTime,
  getScoreColor,
  getScoreBgColor,
  getDifficultyColor,
  cn,
} from "@/lib/utils";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const { id: quizId, attemptId } = await params;
  const attempt = await getAttempt(attemptId);

  if (!attempt) {
    notFound();
  }

  const isCreator = attempt.quiz.document.userId === userId;
  const isAttendee = attempt.userId === userId;

  if (!isCreator && !isAttendee) {
    notFound();
  }

  const scoreColor = getScoreColor(attempt.percentage);
  const scoreBg = getScoreBgColor(attempt.percentage);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/quizzes"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      {/* Score Card */}
      <div className={`glass-card p-10 mb-10 text-center border ${scoreBg}`}>
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Trophy className={`w-10 h-10 ${scoreColor}`} />
        </div>
        <h1 className="text-3xl font-bold mb-1">Quiz Results</h1>
        <p className="text-muted-foreground mb-6">{attempt.quiz.title}</p>

        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div>
            <p className={`text-4xl font-bold ${scoreColor}`}>
              {attempt.score}/{attempt.totalQuestions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Score</p>
          </div>
          <div>
            <p className={`text-4xl font-bold ${scoreColor}`}>
              {attempt.percentage.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <p className="text-2xl font-bold font-mono">
                {formatTime(attempt.timeSpentSeconds)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Time</p>
          </div>
        </div>
      </div>

      {/* Gap Analysis diagnostic deck generation */}
      <GapAnalysis
        documentId={attempt.quiz.document.id}
        quizTitle={attempt.quiz.title}
        answers={attempt.answers}
      />

      <AIFeedbackLoader
        attemptId={attempt.id}
        initialFeedback={attempt.aiFeedback}
      />

      {/* Question Review */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-6">Question Review</h2>
        <div className="space-y-4">
          {attempt.answers.map((answer, index) => {
            const question = answer.question;
            const options = question.options as string[];

            return (
              <div
                key={answer.id}
                className="glass-card p-6"
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      answer.isCorrect
                        ? "bg-emerald-500/10"
                        : "bg-red-500/10"
                    )}
                  >
                    {answer.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        Q{index + 1}
                      </span>
                      <span
                        className={`badge text-[10px] ${getDifficultyColor(question.difficulty)}`}
                      >
                        {question.difficulty.toLowerCase()}
                      </span>
                      {question.topic && (
                        <span className="text-xs text-muted-foreground">
                          · {question.topic}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{question.question}</p>
                  </div>
                </div>

                {/* Options / Written Answers */}
                {question.type === "SHORT_ANSWER" ? (
                  <div className="ml-11 mb-4 space-y-3">
                    <div className="p-3.5 rounded-xl border border-border bg-muted/10">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                        Your Answer
                      </p>
                      <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                        {answer.selectedAnswer || <span className="italic text-muted-foreground/60">No answer submitted</span>}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 font-medium">
                        Expected Correct Answer
                      </p>
                      <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                        {question.correctAnswer}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 ml-11 mb-4">
                    {options.map((option, i) => {
                      const isCorrect = option === question.correctAnswer;
                      const isSelected = option === answer.selectedAnswer;
                      const optionLabel = String.fromCharCode(65 + i);

                      let className = "option-card py-2.5 px-3 text-sm cursor-default";
                      if (isCorrect) className += " correct";
                      else if (isSelected && !isCorrect) className += " incorrect";

                      return (
                        <div key={i} className={className}>
                          <span
                            className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0",
                              isCorrect
                                ? "bg-emerald-500 text-white"
                                : isSelected
                                  ? "bg-red-500 text-white"
                                  : "bg-muted-foreground/10 text-muted-foreground"
                            )}
                          >
                            {optionLabel}
                          </span>
                          <span>{option}</span>
                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                <div className="ml-11 p-3 rounded-lg bg-muted/50 border border-border text-xs sm:text-sm text-muted-foreground flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Explanation: </span>
                    {question.explanation}
                  </div>
                  <SpeechButton
                    text={question.explanation}
                    className="cursor-pointer flex-shrink-0"
                    sizeClassName="w-3.5 h-3.5"
                  />
                </div>

                {/* Deep AI Explanation & PDF Context Reference */}
                {!answer.isCorrect && (
                  <AIExplanationButton
                    answerId={answer.id}
                    initialExplanation={answer.aiExplanation}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <Link
          href={`/quiz/${quizId}/attempt`}
          className="btn-primary flex items-center justify-center gap-2 flex-1"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Quiz
        </Link>
        <PrintResultsButton />
        <Link
          href="/dashboard"
          className="btn-secondary flex items-center justify-center gap-2 flex-1"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
