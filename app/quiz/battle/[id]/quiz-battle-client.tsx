"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Trophy,
  Play,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import {
  getBattleStateAction,
  startQuizBattleAction,
  updateBattlePlayerProgressAction,
} from "@/app/actions/battle.actions";
import { cn } from "@/lib/utils";

interface Player {
  userId: string;
  userName: string;
  progress: number;
  score: number;
  timeSpent: number;
  isFinished: boolean;
}

interface Question {
  id: string;
  question: string;
  options: any; // string[]
  correctAnswer: string;
  explanation: string;
}

interface QuizBattleClientProps {
  battleId: string;
  userId: string;
}

export function QuizBattleClient({ battleId, userId }: QuizBattleClientProps) {
  const [isPending, startTransition] = useTransition();

  // Sync state states
  const [status, setStatus] = useState<"LOBBY" | "ACTIVE" | "FINISHED">("LOBBY");
  const [hostId, setHostId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");

  // Quiz execution states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const isHost = hostId === userId;
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Core Sync loop
  const syncState = async () => {
    const res = await getBattleStateAction(battleId);
    if (res.success && res.status) {
      setStatus(res.status as "LOBBY" | "ACTIVE" | "FINISHED");
      setHostId(res.hostId || "");
      setQuizTitle(res.quizTitle || "");
      setQuestionCount(res.questionCount || 0);
      setQuestions((res.questions as any) || []);
      setPlayers(res.players || []);
    } else {
      setError(res.error || "Lobby sync connection failed.");
    }
  };

  useEffect(() => {
    // Initial fetch
    syncState();

    // Start polling sync loop every 2 seconds
    pollIntervalRef.current = setInterval(syncState, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Timer loop for active battles
  useEffect(() => {
    if (status === "ACTIVE") {
      const myPlayer = players.find((p) => p.userId === userId);
      if (myPlayer && !myPlayer.isFinished) {
        timerIntervalRef.current = setInterval(() => {
          setTimeElapsed((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, players]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const inviteLink = `${window.location.origin}/quiz/battle/${battleId}`;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStartQuiz = async () => {
    setError("");
    startTransition(async () => {
      const res = await startQuizBattleAction(battleId);
      if (res.success) {
        setStatus("ACTIVE");
      } else {
        setError(res.error || "Failed to start lobby quiz.");
      }
    });
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || isSubmitted) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newScore = isCorrect ? myScore + 1 : myScore;
    setMyScore(newScore);
    setIsSubmitted(true);

    const isLast = currentIndex === questions.length - 1;

    // Submit sync progress to backend DB
    await updateBattlePlayerProgressAction(
      battleId,
      currentIndex + 1,
      newScore,
      isLast,
      timeElapsed
    );
  };

  const handleNextQuestion = async () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative px-4">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-6 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* STATE 1: Lobby view (Waiting Room) */}
      {status === "LOBBY" && (
        <div className="max-w-2xl mx-auto glass-card p-8 border border-border/80 rounded-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <Users className="w-14 h-14 text-primary mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">Multiplayer Battle Lobby</h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Invite your classmates to join! Once everyone enters the room, the host can start the battle.
          </p>

          <div className="my-6 p-4 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-muted-foreground truncate text-left flex-1 select-all">
              {typeof window !== "undefined" && `${window.location.origin}/quiz/battle/${battleId}`}
            </span>
            <button
              onClick={handleCopyLink}
              className="btn-secondary h-8 text-[11px] px-3 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? "Copied" : "Copy Invite"}
            </button>
          </div>

          <div className="text-left mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Classmates Joined ({players.length})
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {players.map((p) => {
                const isPlayerHost = p.userId === hostId;
                return (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between p-3 border border-border/40 rounded-xl bg-card"
                  >
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {p.userName} {p.userId === userId && "(You)"}
                    </span>
                    {isPlayerHost && (
                      <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase">
                        👑 Host
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isHost ? (
            <button
              onClick={handleStartQuiz}
              disabled={isPending}
              className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer h-12 text-sm shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-white" />
              )}
              Start Quiz Battle
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 bg-primary/5 border border-primary/10 rounded-xl gap-2 text-primary">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Waiting for host to start the battle...</span>
            </div>
          )}
        </div>
      )}

      {/* STATE 2: Active Battle Quiz view */}
      {status === "ACTIVE" && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Active Question */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header progress info */}
            <div className="flex items-center justify-between bg-muted/20 border border-border/80 p-4 rounded-xl flex-wrap gap-3">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider select-none">
                  Quiz Battle Active
                </span>
                <h2 className="text-base font-bold text-foreground mt-0.5 truncate max-w-sm">
                  {quizTitle}
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeElapsed}s
                </span>
                <span className="text-border">|</span>
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>
            </div>

            {/* Quiz Card */}
            <div className="glass-card p-6 border border-border/85 rounded-2xl relative">
              <p className="text-sm font-bold text-foreground leading-relaxed mb-6">
                {questions[currentIndex].question}
              </p>

              <div className="space-y-2.5">
                {((questions[currentIndex].options as string[]) || []).map((option) => {
                  const isSelected = selectedOption === option;
                  const currentQuestion = questions[currentIndex];
                  const showCorrect = isSubmitted && option === currentQuestion.correctAnswer;
                  const showWrong = isSubmitted && isSelected && option !== currentQuestion.correctAnswer;

                  return (
                    <button
                      key={option}
                      onClick={() => !isSubmitted && setSelectedOption(option)}
                      disabled={isSubmitted}
                      className={cn(
                        "w-full p-4 text-left text-xs sm:text-sm border rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3",
                        showCorrect
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
                          : showWrong
                          ? "border-red-500 bg-red-500/10 text-red-400 font-semibold"
                          : isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{option}</span>
                      {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      {showWrong && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explainer Block */}
              {isSubmitted && questions[currentIndex].explanation && (
                <div className="mt-6 p-4 rounded-xl bg-violet-600/5 border border-violet-500/20 text-xs text-muted-foreground leading-relaxed animate-fade-in">
                  <span className="font-bold text-violet-400 block mb-1">Explanation</span>
                  {questions[currentIndex].explanation}
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-8 pt-6 border-t border-border/40 flex justify-end">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="btn-primary py-2 px-5 font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    Submit Answer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="btn-primary py-2 px-5 font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    Next Question
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    All questions completed! Waiting for battle results...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: LiveScoreboard */}
          <div className="lg:col-span-4 glass-card p-6 border border-border/85 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">Multiplayer Scoreboard</h3>
            </div>

            <div className="space-y-4">
              {players.map((p, index) => {
                const isMe = p.userId === userId;
                const progressPercent = questionCount > 0 ? (p.progress / questionCount) * 100 : 0;
                return (
                  <div key={p.userId} className={cn("space-y-1.5 p-3 rounded-xl border border-transparent", isMe && "bg-primary/5 border-primary/20")}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold flex items-center gap-1 text-foreground">
                        <span className="text-muted-foreground text-[10px] w-4">{index + 1}.</span>
                        {p.userName} {isMe && "(You)"}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                        Score: {p.score}
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-300", isMe ? "bg-primary" : "bg-zinc-500")}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>{p.progress} / {questionCount} questions</span>
                      {p.isFinished && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          Done in {p.timeSpent}s
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: Finished / Results Summary View */}
      {status === "FINISHED" && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="glass-card p-8 border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h1 className="text-3xl font-extrabold tracking-tight">Battle Finished!</h1>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
              Friendly competition makes learning stick. Here are the final lobby rankings:
            </p>

            <div className="mt-8 space-y-3.5 text-left max-w-md mx-auto">
              {players.map((p, index) => {
                const isMe = p.userId === userId;
                const isPodium = index < 3;
                const medalColors = ["text-yellow-400", "text-zinc-300", "text-amber-600"];
                return (
                  <div
                    key={p.userId}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-2xl transition-all",
                      isMe
                        ? "border-primary bg-primary/5 font-semibold"
                        : "border-border/60 bg-card"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs select-none", 
                        isPodium ? medalColors[index] + " bg-muted/60" : "text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {p.userName} {isMe && "(You)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                      <span>Score: <strong className="text-foreground">{p.score}</strong></span>
                      <span>Time: <strong className="text-foreground">{p.timeSpent}s</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link href="/quizzes" className="btn-primary py-2.5 px-6 text-xs font-bold cursor-pointer">
                Return to Quizzes
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
