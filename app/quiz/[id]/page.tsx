import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Clock,
  BarChart3,
  ArrowLeft,
  Play,
  Printer,
  Trophy,
} from "lucide-react";
import { getQuiz } from "@/services/quiz.service";
import { formatDate, getDifficultyColor, formatTime } from "@/lib/utils";
import { auth } from "@/auth";
import { InviteButton } from "@/components/quiz/invite-button";
import { StartControls } from "@/components/quiz/start-controls";

export default async function QuizStartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const { id } = await params;
  const quiz = await getQuiz(id);

  if (!quiz) {
    notFound();
  }

  const isOwner = quiz.document.userId === userId;

  // Calculate difficulty breakdown
  const difficultyBreakdown = quiz.questions.reduce(
    (acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Use custom time limit or fallback to default estimate (1.5 min per question)
  const estimatedMinutes = quiz.timeLimit ?? Math.ceil(quiz.questionCount * 1.5);

  // Sort attempts by rank (percentage desc, then timeSpentSeconds asc)
  const rankedAttempts = [...(quiz.attempts || [])].sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });

  const getRankBadge = (index: number) => {
    if (index === 0) return <span className="text-amber-400 font-bold flex items-center gap-1">🥇 1st</span>;
    if (index === 1) return <span className="text-slate-300 font-bold flex items-center gap-1">🥈 2nd</span>;
    if (index === 2) return <span className="text-amber-600 font-bold flex items-center gap-1">🥉 3rd</span>;
    return <span className="text-muted-foreground font-mono text-xs">#{index + 1}</span>;
  };

  return (
    <div className={`animate-fade-in ${isOwner ? "max-w-4xl" : "max-w-2xl"} mx-auto`}>
      {/* Back Link */}
      <Link
        href="/quizzes"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      {/* Main Info Card */}
      <div className="glass-card mb-8 p-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {quiz.title}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-2">
              Based on: {quiz.document.title}
            </p>
          </div>
          {quiz.shareCode && (
            <div className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-xl border border-border/30 w-fit flex-shrink-0">
              <div className="min-w-0 pr-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                  Group Invite Code
                </p>
                <p className="font-mono text-xs font-bold text-violet-400 mt-1 leading-none">
                  {quiz.shareCode}
                </p>
              </div>
              <InviteButton shareCode={quiz.shareCode} />
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-5 mb-10">
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Questions
            </p>
            <p className="text-2xl font-bold text-foreground">
              {quiz.questionCount}
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Time Limit
            </p>
            <p className="text-2xl font-bold text-foreground">
              {estimatedMinutes}m
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Difficulty
            </p>
            <p className="text-base font-bold text-foreground capitalize mt-1">
              {Object.keys(difficultyBreakdown).join(", ")}
            </p>
          </div>
        </div>

        {/* Actions & Mode Selector */}
        <StartControls quizId={quiz.id} estimatedMinutes={estimatedMinutes} />
      </div>

      {/* Group Leaderboard / Scoreboard Section */}
      {quiz.shareCode && (
        <div className="glass-card p-6 mt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Group Leaderboard
          </h2>
          {!rankedAttempts || rankedAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No one has attended this test yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold text-center w-20">Rank</th>
                    <th className="py-3 px-4 font-semibold">Attendee</th>
                    <th className="py-3 px-4 font-semibold text-center">Score</th>
                    <th className="py-3 px-4 font-semibold text-center">Accuracy</th>
                    <th className="py-3 px-4 font-semibold text-center">Time Spent</th>
                    <th className="py-3 px-4 font-semibold text-right">Date Completed</th>
                    <th className="py-3 px-4 font-semibold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {rankedAttempts.map((attempt, index) => {
                    const canViewDetail = isOwner || attempt.userId === userId;
                    return (
                      <tr key={attempt.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          {getRankBadge(index)}
                        </td>
                        <td className="py-3.5 px-4 font-medium flex items-center gap-2.5">
                          {attempt.user.image ? (
                            <img
                              src={attempt.user.image}
                              alt={attempt.user.name || "Attendee"}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                              {attempt.user.name ? attempt.user.name[0].toUpperCase() : "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground text-xs leading-none">{attempt.user.name || "Guest"}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{attempt.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs">{attempt.score} / {attempt.totalQuestions}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">
                          <span className={`badge ${attempt.percentage >= 70 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                            {attempt.percentage.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">{formatTime(attempt.timeSpentSeconds)}</td>
                        <td className="py-3.5 px-4 text-right text-xs text-muted-foreground">{attempt.completedAt ? formatDate(attempt.completedAt) : "N/A"}</td>
                        <td className="py-3.5 px-4 text-right">
                          {canViewDetail ? (
                            <Link
                              href={`/quiz/${quiz.id}/results/${attempt.id}`}
                              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                              View Sheet
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground italic font-medium select-none">Private</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
