"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Play,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Award,
  HelpCircle,
  BarChart3,
  MessageSquare,
  MessageSquareOff,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  getPresenterSessionState,
  advanceSlideAction,
  markQAAnsweredAction,
} from "@/app/actions/session.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  slideIndex: number;
  type: "INFO" | "MULTIPLE_CHOICE" | "WORD_CLOUD" | "LEADERBOARD" | "Q_A";
  title: string;
  content: string | null;
  options: any;
  correctAnswer: string | null;
  responses: Array<{
    id: string;
    userId: string;
    userName: string;
    value: string;
  }>;
}

interface Participant {
  userId: string;
  userName: string;
  score: number;
}

interface QAQuestion {
  id: string;
  userName: string;
  questionText: string;
  likes: number;
  isAnswered: boolean;
}

export function PresentClient({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();

  // Core Presentation states
  const [status, setStatus] = useState<"LOBBY" | "ACTIVE" | "FINISHED">("LOBBY");
  const [shareCode, setShareCode] = useState("");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>([]);
  const [error, setError] = useState("");

  // Visual toggles
  const [showResults, setShowResults] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"slides" | "qa">("slides");

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync session state from server
  const syncState = async () => {
    const res = await getPresenterSessionState(sessionId);
    if (res.success) {
      setStatus(res.status as any);
      setShareCode(res.shareCode || "");
      setCurrentSlideIndex(res.currentSlideIndex || 0);
      setSlides((res.slides as any) || []);
      setParticipants(res.participants || []);
      setQaQuestions(res.qaQuestions || []);
    } else {
      setError(res.error || "Failed to sync presentation state.");
    }
  };

  useEffect(() => {
    syncState();
    syncIntervalRef.current = setInterval(syncState, 2000);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== "ACTIVE" || activeTab === "qa") return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, currentSlideIndex, slides.length, activeTab]);

  const handleNextSlide = () => {
    if (isPending) return;
    setShowResults(false);
    startTransition(async () => {
      const res = await advanceSlideAction(sessionId, "next");
      if (res.success) {
        // Optimistic update
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
        } else {
          setStatus("FINISHED");
        }
      }
    });
  };

  const handlePrevSlide = () => {
    if (isPending || currentSlideIndex === 0) return;
    setShowResults(false);
    startTransition(async () => {
      const res = await advanceSlideAction(sessionId, "prev");
      if (res.success) {
        setCurrentSlideIndex((prev) => prev - 1);
      }
    });
  };

  const handleStartSession = () => {
    if (isPending) return;
    startTransition(async () => {
      const res = await advanceSlideAction(sessionId, "start");
      if (res.success) {
        setStatus("ACTIVE");
        setCurrentSlideIndex(0);
      }
    });
  };

  const handleMarkAnswered = (qaId: string) => {
    startTransition(async () => {
      const res = await markQAAnsweredAction(qaId);
      if (res.success) {
        setQaQuestions((prev) =>
          prev.map((q) => (q.id === qaId ? { ...q, isAnswered: true } : q))
        );
      }
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentSlide = slides[currentSlideIndex];

  // Helper: Aggregate Word Cloud tag frequencies
  const getWordCloudTags = (responses: Slide["responses"]) => {
    const freqMap: Record<string, number> = {};
    responses.forEach((r) => {
      const word = r.value.trim().toLowerCase();
      if (!word) return;
      freqMap[word] = (freqMap[word] || 0) + 1;
    });

    return Object.entries(freqMap).map(([text, count]) => ({
      text,
      count,
    }));
  };

  // Helper: Aggregate MCQ responses
  const getMCQStats = (slide: Slide) => {
    if (!slide || !slide.options) return [];
    const optionsArray: string[] = typeof slide.options === "string" ? JSON.parse(slide.options) : slide.options;
    const counts = optionsArray.map((opt) => {
      const count = slide.responses.filter(
        (r) => r.value.trim().toLowerCase() === opt.trim().toLowerCase()
      ).length;
      return { option: opt, count };
    });
    return counts;
  };

  // ──── Lobby Render ──────────────────────────────────────────────────────────
  if (status === "LOBBY") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-8 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-bold text-lg tracking-wider text-white">StudyTest Live</span>
          </div>
          <Link href="/documents">
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 cursor-pointer">
              Exit Session
            </Button>
          </Link>
        </div>

        {/* Central Code Display Card */}
        <div className="max-w-4xl mx-auto w-full text-center my-auto space-y-8 z-10">
          <div className="space-y-3">
            <p className="text-violet-400 font-bold uppercase tracking-widest text-sm">Join Presentation Session</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Interactive Learning Lobby
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Join details */}
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-violet-300/80">Step 1: Open website on phone</span>
                <div className="flex items-center gap-2 text-xl font-bold text-white">
                  <span>/quiz/join</span>
                  <ExternalLink className="w-4 h-4 text-violet-400" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-violet-300/80">Step 2: Enter Room Code</span>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">
                    {shareCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Count / Start */}
            <div className="flex flex-col items-center justify-center p-6 border-l border-white/10 md:border-l space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2.5 text-white mb-2">
                  <Users className="w-7 h-7 text-violet-400" />
                  <span className="text-5xl font-black">{participants.length}</span>
                </div>
                <p className="text-xs text-violet-300/80 font-medium">Participants Joined</p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleStartSession}
                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold tracking-wide shadow-lg shadow-violet-500/20 hover:scale-[1.02] cursor-pointer"
              >
                <Play className="w-5 h-5" /> Start Presentation
              </Button>
            </div>
          </div>

          {/* Lobby Players Roster */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold text-violet-300/60 uppercase tracking-widest">Awaiting Learners</h3>
            <div className="flex flex-wrap justify-center gap-3.5">
              {participants.length === 0 ? (
                <p className="text-sm text-white/40 italic">Lobby is empty. Open browser to join...</p>
              ) : (
                participants.map((player) => (
                  <div
                    key={player.userId}
                    className="py-2 px-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-xs animate-scale-up shadow-md shadow-black/10"
                  >
                    {player.userName}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/30 tracking-wider z-10">
          STUDYTEST AI © PRESENTATION SYSTEM ENGINE v1.2
        </div>
      </div>
    );
  }

  // ──── Finished Render ──────────────────────────────────────────────────────
  if (status === "FINISHED") {
    const winner = participants[0];

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-8 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px]" />

        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6 z-10 backdrop-blur-md shadow-2xl animate-scale-up">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
            <Trophy className="w-10 h-10 text-amber-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">Session Completed!</h1>
            <p className="text-sm text-muted-foreground">Great job to all interactive participants!</p>
          </div>

          {winner && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <Award className="w-8 h-8 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Session Winner</h4>
                  <p className="text-xs text-muted-foreground">{winner.userName}</p>
                </div>
              </div>
              <span className="text-xl font-black text-amber-400">{winner.score} XP</span>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Link href="/documents" className="flex-1">
              <Button variant="secondary" size="md" className="w-full cursor-pointer">
                Back to Documents
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──── Presentation Mode Render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6">
      {/* 1. Header Bar */}
      <header className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
            <span className="font-extrabold text-sm tracking-wider uppercase text-white">Live Session</span>
          </div>
          {/* Active Navigation Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("slides")}
              className={cn(
                "py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer",
                activeTab === "slides"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/15"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              Slides Presentation
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={cn(
                "py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === "qa"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/15"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              Q&A Board ({qaQuestions.filter((q) => !q.isAnswered).length})
            </button>
          </div>
        </div>

        {/* Dynamic header stats */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-white/95">{participants.length} Active</span>
          </div>
          <div className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            Join Code: <strong className="font-bold text-violet-400 tracking-wider">{shareCode}</strong>
          </div>
        </div>
      </header>

      {/* 2. Main Slides Dashboard Frame */}
      <main className="flex-1 flex justify-center items-center py-4">
        {activeTab === "slides" ? (
          <div className="w-full max-w-5xl bg-white/[0.03] border border-white/5 rounded-3xl shadow-2xl p-8 relative flex flex-col justify-center min-h-[500px]">
            {/* Outline background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none rounded-3xl" />

            {currentSlide ? (
              <div className="space-y-8 z-10 max-w-4xl mx-auto w-full text-center">
                {/* Slide Type / Label badge */}
                <div className="flex justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-400/10 border border-violet-400/20 px-3 py-1.5 rounded-full">
                    {currentSlide.type} SLIDE
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {currentSlide.title}
                </h2>

                {/* Content Render Based on Slide Types */}
                <div className="mt-4">
                  {/* CASE A: INFO SLIDE */}
                  {currentSlide.type === "INFO" && currentSlide.content && (
                    <div className="text-left max-w-2xl mx-auto space-y-4">
                      {currentSlide.content.split("\n").map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm transition-all duration-200 hover:bg-white/8 hover:translate-x-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0 mt-1.5 animate-pulse" />
                          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
                            {bullet.replace(/^-\s*/, "")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CASE B: MULTIPLE CHOICE SLIDE */}
                  {currentSlide.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-8 max-w-3xl mx-auto text-left">
                      {/* Option choices cards */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        {currentSlide.options &&
                          (currentSlide.options as any).map((opt: string, idx: number) => {
                            const isCorrect =
                              currentSlide.correctAnswer &&
                              opt.trim().toLowerCase() === currentSlide.correctAnswer.trim().toLowerCase();
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "p-4.5 rounded-2xl border font-bold text-sm tracking-wide transition-all shadow-sm",
                                  showResults && isCorrect
                                    ? "bg-green-500/10 border-green-500 text-green-300 shadow-md shadow-green-500/5"
                                    : "bg-white/5 border-white/10 text-white"
                                )}
                              >
                                <span className="inline-block w-6.5 h-6.5 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black mr-3 shadow-inner">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {opt}
                              </div>
                            );
                          })}
                      </div>

                      {/* Display live results visual bar chart */}
                      {showResults && (
                        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">Live Class Results</h4>
                          <div className="space-y-3.5">
                            {getMCQStats(currentSlide).map((stat, idx) => {
                              const totalVotes = currentSlide.responses.length || 1;
                              const pct = (stat.count / totalVotes) * 100;
                              const isCorrect =
                                currentSlide.correctAnswer &&
                                stat.option.trim().toLowerCase() === currentSlide.correctAnswer.trim().toLowerCase();

                              return (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-bold text-white/80">
                                    <span>{stat.option}</span>
                                    <span>
                                      {stat.count} {stat.count === 1 ? "vote" : "votes"} ({pct.toFixed(0)}%)
                                    </span>
                                  </div>
                                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all duration-500 ease-out",
                                        isCorrect ? "bg-green-500" : "bg-violet-500"
                                      )}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASE C: WORD CLOUD POLL */}
                  {currentSlide.type === "WORD_CLOUD" && (
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="flex flex-wrap justify-center items-center gap-4.5 p-8 border border-white/10 rounded-3xl bg-white/5">
                        {currentSlide.responses.length === 0 ? (
                          <p className="text-sm text-white/40 italic">Awaiting audience tag submissions...</p>
                        ) : (
                          getWordCloudTags(currentSlide.responses).map((tag, idx) => {
                            const sizes = [
                              "text-xs font-normal text-violet-300/70",
                              "text-sm font-semibold text-violet-200",
                              "text-lg font-bold text-violet-100",
                              "text-2xl font-extrabold text-white",
                              "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300 animate-pulse",
                            ];
                            const sizeIndex = Math.min(tag.count - 1, sizes.length - 1);
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "py-1.5 px-3.5 rounded-xl bg-white/5 border border-white/10 transition-all shadow-md",
                                  sizes[sizeIndex]
                                )}
                              >
                                {tag.text}
                              </div>
                            );
                          })
                        )}
                      </div>
                      <p className="text-xs text-white/40">Total responses submitted: {currentSlide.responses.length}</p>
                    </div>
                  )}

                  {/* CASE D: LEADERBOARD PODIUM */}
                  {currentSlide.type === "LEADERBOARD" && (
                    <div className="max-w-2xl mx-auto space-y-8">
                      {/* 3D podium columns for top 3 */}
                      <div className="flex justify-center items-end gap-5 h-56 mt-4">
                        {/* 2nd Place */}
                        {participants[1] && (
                          <div className="flex flex-col items-center space-y-2 w-28">
                            <span className="text-xs font-bold text-slate-300 truncate max-w-full">{participants[1].userName}</span>
                            <div className="h-28 w-full bg-slate-400/10 border border-slate-300/20 rounded-t-xl flex flex-col justify-between p-3.5 text-center shadow-lg shadow-black/10">
                              <span className="text-2xl font-black text-slate-300">2</span>
                              <span className="text-xs font-bold text-slate-300">{participants[1].score} XP</span>
                            </div>
                          </div>
                        )}
                        {/* 1st Place */}
                        {participants[0] && (
                          <div className="flex flex-col items-center space-y-2 w-32">
                            <Award className="w-6 h-6 text-amber-400 animate-bounce" />
                            <span className="text-sm font-black text-amber-400 truncate max-w-full">{participants[0].userName}</span>
                            <div className="h-40 w-full bg-amber-500/10 border border-amber-400/20 rounded-t-xl flex flex-col justify-between p-4.5 text-center shadow-lg shadow-amber-500/5">
                              <span className="text-3xl font-black text-amber-400">1</span>
                              <span className="text-sm font-black text-amber-400">{participants[0].score} XP</span>
                            </div>
                          </div>
                        )}
                        {/* 3rd Place */}
                        {participants[2] && (
                          <div className="flex flex-col items-center space-y-2 w-28">
                            <span className="text-xs font-bold text-amber-700 truncate max-w-full">{participants[2].userName}</span>
                            <div className="h-20 w-full bg-amber-700/10 border border-amber-600/20 rounded-t-xl flex flex-col justify-between p-3 text-center shadow-lg shadow-black/10">
                              <span className="text-xl font-black text-amber-600">3</span>
                              <span className="text-xs font-bold text-amber-600">{participants[2].score} XP</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Runners Up List */}
                      {participants.length > 3 && (
                        <div className="p-4.5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
                          <h4 className="text-[10px] font-bold text-violet-300 uppercase tracking-widest block mb-1">Class standings</h4>
                          {participants.slice(3, 8).map((p, idx) => (
                            <div key={p.userId} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0 text-white/95">
                              <span>
                                <strong className="font-bold mr-2 text-white/40">{idx + 4}</strong> {p.userName}
                              </span>
                              <span className="font-black text-violet-400">{p.score} XP</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASE E: AUDIENCE Q&A BOARD */}
                  {currentSlide.type === "Q_A" && (
                    <div className="max-w-2xl mx-auto space-y-4">
                      {qaQuestions.filter((q) => !q.isAnswered).length === 0 ? (
                        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                          <HelpCircle className="w-8 h-8 text-white/30 mx-auto mb-2" />
                          <p className="text-sm text-white/40 italic">No open audience questions submitted yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-96 overflow-y-auto text-left">
                          {qaQuestions
                            .filter((q) => !q.isAnswered)
                            .map((q) => (
                              <div
                                key={q.id}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4 shadow-sm"
                              >
                                <div className="space-y-1.5">
                                  <p className="text-sm text-white font-medium">{q.questionText}</p>
                                  <p className="text-[10px] text-white/40">
                                    Submitted by <strong>{q.userName}</strong> · {q.likes} upvotes
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkAnswered(q.id)}
                                  className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 cursor-pointer"
                                >
                                  Mark Answered
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">Slide details rendering...</div>
            )}
          </div>
        ) : (
          /* Q&A Tab View */
          <div className="w-full max-w-5xl bg-white/[0.03] border border-white/5 rounded-3xl p-8 flex flex-col justify-start min-h-[500px]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-400" /> Presenter Q&A Board
            </h2>
            <div className="space-y-4 max-w-4xl w-full mx-auto">
              {qaQuestions.map((q) => (
                <div
                  key={q.id}
                  className={cn(
                    "p-4.5 rounded-xl border flex items-center justify-between gap-4",
                    q.isAnswered ? "bg-green-500/5 border-green-500/20 opacity-60" : "bg-white/5 border-white/10"
                  )}
                >
                  <div>
                    <p className="text-sm text-white/95">{q.questionText}</p>
                    <p className="text-[10px] text-white/40 mt-1">
                      By <strong>{q.userName}</strong> · {q.likes} upvotes · {q.isAnswered ? "Answered" : "Pending"}
                    </p>
                  </div>
                  {!q.isAnswered && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAnswered(q.id)}
                      className="border-green-500/30 text-green-300 hover:bg-green-500/10 cursor-pointer"
                    >
                      Answered
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. Controls / Toolbar Footer */}
      <footer className="mt-4 border-t border-white/5 pt-4 flex justify-between items-center z-10">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0 || isPending}
            className="border-white/10 hover:bg-white/5 cursor-pointer text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4.5 h-4.5" /> Previous
          </Button>
          {currentSlide && currentSlide.type === "MULTIPLE_CHOICE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResults(!showResults)}
              className="border-violet-500/20 text-violet-300 hover:bg-violet-500/10 cursor-pointer"
            >
              {showResults ? (
                <>
                  <MessageSquareOff className="w-4 h-4" /> Hide Correct Answer
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" /> Show Correct Answer
                </>
              )}
            </Button>
          )}
        </div>

        {/* Counter */}
        {slides.length > 0 && (
          <span className="text-xs font-semibold text-white/60">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={handleNextSlide}
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl cursor-pointer"
        >
          {currentSlideIndex < slides.length - 1 ? (
            <>
              Next Slide <ChevronRight className="w-4.5 h-4.5" />
            </>
          ) : (
            "Complete Presentation"
          )}
        </Button>
      </footer>
    </div>
  );
}
