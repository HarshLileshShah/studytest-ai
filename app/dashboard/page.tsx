import Link from "next/link";
import {
  Sparkles,
  GraduationCap,
  Target,
  Trophy,
  BookOpen,
  Clock,
  ArrowRight,
  Flame,
} from "lucide-react";
import {
  getDashboardStats,
  getScoreTrend,
  getTopicAnalysis,
  getDifficultyBreakdown,
} from "@/services/analytics.service";
import { getRecentAttempts } from "@/services/evaluation.service";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { TopicChart } from "@/components/dashboard/topic-chart";
import { DifficultyChart } from "@/components/dashboard/difficulty-chart";
import { getQuizzes } from "@/services/quiz.service";
import { JoinTestModal } from "@/components/dashboard/join-test-modal";
import { getStudyPlans } from "@/services/planner.service";
import { TodayPlanWidget } from "./today-plan-widget";
import { AISearchBar } from "./ai-search-bar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatDate, formatTime, getScoreColor } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { AVAILABLE_BADGES } from "@/services/gamification.service";
import { getWeaknessDiagnosticAction } from "@/app/actions/remedial.actions";
import { RemediationCockpit } from "@/components/dashboard/remediation-cockpit";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [stats, scoreTrend, topicAnalysis, difficultyBreakdown, recentAttempts, createdQuizzes, studyPlans, userProfile, diagnosticsResult] =
    await Promise.all([
      getDashboardStats(userId),
      getScoreTrend(userId),
      getTopicAnalysis(userId),
      getDifficultyBreakdown(userId),
      getRecentAttempts(userId, 5),
      getQuizzes(userId),
      getStudyPlans(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { streakCount: true, badges: true },
      }),
      getWeaknessDiagnosticAction(),
    ]);

  const diagnostics = diagnosticsResult.success && diagnosticsResult.diagnostics ? diagnosticsResult.diagnostics : [];
  const streakCount = userProfile?.streakCount ?? 0;
  const userBadges = (userProfile?.badges as string[]) || [];
  const hasData = stats.totalQuizzes > 0;

  // Find the first plan that has uncompleted tasks, or fallback to the most recent one
  const activePlan = studyPlans.find((p) => p.tasks.some((t) => !t.isCompleted)) || studyPlans[0] || null;

  const serializedPlan = activePlan
    ? {
        id: activePlan.id,
        title: activePlan.title,
        dailyMinutes: activePlan.dailyMinutes,
        targetDate: activePlan.targetDate.toISOString(),
        tasks: activePlan.tasks.map((task) => ({
          id: task.id,
          dayNumber: task.dayNumber,
          date: task.date.toISOString(),
          topic: task.topic,
          description: task.description,
          estimatedMinutes: task.estimatedMinutes,
          isCompleted: task.isCompleted,
        })),
      }
    : null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex flex-wrap items-center gap-3">
            <span>Welcome back, {session?.user?.name || "User"}!</span>
            {streakCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-sm shadow-amber-500/5 animate-pulse cursor-default select-none" title="Review flashcards or complete quizzes daily to increase your streak!">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {streakCount} Day Streak
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Your learning analytics and performance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <JoinTestModal />
          <Link
            href="/documents/upload"
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Upload PDF
          </Link>
        </div>
      </div>

      {/* AI Cross-Document Knowledge Search */}
      <div className="mb-8">
        <AISearchBar />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground font-medium">
              Total Quizzes
            </p>
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold gradient-text">
            {stats.totalQuizzes}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground font-medium">
              Avg. Score
            </p>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className={`text-3xl font-bold ${hasData ? getScoreColor(stats.averageScore) : "gradient-text"}`}>
            {hasData ? `${stats.averageScore}%` : "—"}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground font-medium">
              Best Score
            </p>
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <p className={`text-3xl font-bold ${hasData ? getScoreColor(stats.bestScore) : "gradient-text"}`}>
            {hasData ? `${stats.bestScore}%` : "—"}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground font-medium">
              Questions Answered
            </p>
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold gradient-text">
            {stats.totalQuestionsAnswered}
          </p>
        </div>
      </div>

      {/* Today's Study Target */}
      <TodayPlanWidget plan={serializedPlan} />

      {/* AI Weakness Diagnostic & Remediation */}
      <div className="mb-10">
        <RemediationCockpit diagnostics={diagnostics} limit={4} />
      </div>

      {/* Quiz Generation & Attendance Overview */}
      <div className="glass-card p-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Your Shared Quizzes & Attendance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Overview of all AI-generated tests and their participant statistics.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-medium text-muted-foreground bg-muted/30 py-2 px-3.5 rounded-xl border border-border/30 w-fit">
            <div>
              <span className="text-muted-foreground">Generated:</span>{" "}
              <strong className="text-foreground font-bold">{createdQuizzes.length} Tests</strong>
            </div>
            <span className="text-border">|</span>
            <div>
              <span className="text-muted-foreground">Total Attendees:</span>{" "}
              <strong className="text-foreground font-bold">
                {createdQuizzes.reduce((sum, q) => sum + q._count.attempts, 0)} Attempts
              </strong>
            </div>
          </div>
        </div>

        {createdQuizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            You haven't generated any quizzes yet. Upload a document to start sharing!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Test Title</th>
                  <th className="py-3 px-4 text-center font-semibold">Share Code</th>
                  <th className="py-3 px-4 text-center font-semibold">Questions</th>
                  <th className="py-3 px-4 text-center font-semibold">Total Attendees</th>
                  <th className="py-3 px-4 text-right font-semibold">Created Date</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {createdQuizzes.slice(0, 5).map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <Link href={`/quiz/${quiz.id}`} className="hover:text-primary transition-colors">
                        {quiz.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs text-violet-400 bg-violet-500/5 px-2.5 py-1 rounded border border-violet-500/10 font-bold">
                        {quiz.shareCode || "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">{quiz.questionCount} Qs</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`badge ${quiz._count.attempts > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground border-border/50"}`}>
                        {quiz._count.attempts} attempts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-muted-foreground">{formatDate(quiz.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/quiz/${quiz.id}`}
                        className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                      >
                        View Scoreboard →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {createdQuizzes.length > 5 && (
              <div className="text-center pt-4 border-t border-border/30">
                <Link href="/quizzes" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  View all generated quizzes ({createdQuizzes.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No data yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Upload your first PDF document and take a quiz to see your
            performance analytics here.
          </p>
          <Link
            href="/documents/upload"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get Started
          </Link>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Score Trend */}
            <div className="glass-card p-7">
              <h3 className="text-base font-semibold mb-4">Score Trend</h3>
              <ScoreChart data={scoreTrend} />
            </div>

            {/* Topic Accuracy */}
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">
                Accuracy by Topic
              </h3>
              <TopicChart data={topicAnalysis} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Difficulty Breakdown */}
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">
                Difficulty Breakdown
              </h3>
              <DifficultyChart data={difficultyBreakdown} />
            </div>

            {/* Topic Strengths & Weaknesses */}
            <div className="glass-card p-6 lg:col-span-2">
              <h3 className="text-base font-semibold mb-4">
                Strong & Weak Topics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strong Topics */}
                <div>
                  <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-3">
                    💪 Strong Topics
                  </p>
                  <div className="space-y-2">
                    {topicAnalysis
                      .filter((t) => t.accuracy >= 70)
                      .slice(0, 5)
                      .map((t) => (
                        <div
                          key={t.topic}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                        >
                          <span className="text-sm">{t.topic}</span>
                          <span className="text-sm font-semibold text-emerald-400">
                            {t.accuracy}%
                          </span>
                        </div>
                      ))}
                    {topicAnalysis.filter((t) => t.accuracy >= 70).length ===
                      0 && (
                      <p className="text-sm text-muted-foreground">
                        Take more quizzes to identify strengths.
                      </p>
                    )}
                  </div>
                </div>

                {/* Weak Topics */}
                <div>
                  <p className="text-xs text-red-400 font-medium uppercase tracking-wider mb-3">
                    📚 Needs Review
                  </p>
                  <div className="space-y-2">
                    {topicAnalysis
                      .filter((t) => t.accuracy < 70)
                      .slice(0, 5)
                      .map((t) => (
                        <div
                          key={t.topic}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/5 border border-red-500/10"
                        >
                          <span className="text-sm">{t.topic}</span>
                          <span className="text-sm font-semibold text-red-400">
                            {t.accuracy}%
                          </span>
                        </div>
                      ))}
                    {topicAnalysis.filter((t) => t.accuracy < 70).length ===
                      0 && (
                      <p className="text-sm text-muted-foreground">
                        Great job! No weak topics found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements & Recent Attempts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Achievements Showcase */}
            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Unlocked Achievements
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {userBadges.length} / {AVAILABLE_BADGES.length} Badges
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AVAILABLE_BADGES.map((badge) => {
                  const isUnlocked = userBadges.includes(badge.key);
                  return (
                    <div
                      key={badge.key}
                      className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                        isUnlocked
                          ? "bg-primary/5 border-primary/20 text-foreground"
                          : "bg-muted/10 border-border/40 text-muted-foreground opacity-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 select-none ${
                          isUnlocked ? "bg-primary/15 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {badge.icon}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                          {badge.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Recent Attempts</h3>
                <Link
                  href="/quizzes"
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <Link
                    key={attempt.id}
                    href={`/quiz/${attempt.quizId}/results/${attempt.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border hover:border-primary/30 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {attempt.quiz.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{formatDate(attempt.completedAt || attempt.startedAt)}</span>
                        <span className="text-border">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(attempt.timeSpentSeconds)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-lg font-bold ${getScoreColor(attempt.percentage)}`}>
                        {attempt.percentage.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                    </div>
                  </Link>
                ))}
                {recentAttempts.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No attempts recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
