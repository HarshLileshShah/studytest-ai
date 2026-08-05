"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Sparkles,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  Send,
  X,
  Clock,
} from "lucide-react";
import {
  getParticipantSessionState,
  submitSlideResponseAction,
  submitSessionQAAction,
  upvoteQAAction,
} from "@/app/actions/session.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QAQuestion {
  id: string;
  userName: string;
  questionText: string;
  likes: number;
  isAnswered: boolean;
}

interface SessionClientProps {
  sessionId: string;
  participantUserId: string;
}

export function SessionClient({ sessionId, participantUserId }: SessionClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Polling states
  const [status, setStatus] = useState<"LOBBY" | "ACTIVE" | "FINISHED">("LOBBY");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<{
    id: string;
    type: "INFO" | "MULTIPLE_CHOICE" | "WORD_CLOUD" | "LEADERBOARD" | "Q_A" | "POLL";
    title: string;
    content: string | null;
    options: string[] | null;
  } | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [myResponse, setMyResponse] = useState<string | null>(null);
  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>([]);
  const [error, setError] = useState("");

  // Input states
  const [wordCloudVal, setWordCloudVal] = useState("");
  const [qaInput, setQaInput] = useState("");
  const [showQADrawer, setShowQADrawer] = useState(false);

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize state from server
  const syncState = async () => {
    const res = await getParticipantSessionState(sessionId, participantUserId);
    if (res.success) {
      setStatus(res.status as any);
      setCurrentSlideIndex(res.currentSlideIndex || 0);
      setCurrentSlide((res.currentSlide as any) || null);
      setHasSubmitted(res.hasSubmitted || false);
      setMyResponse(res.myResponse || null);
      setQaQuestions(res.qaQuestions || []);
    } else {
      setError(res.error || "Session synchronization connection lost.");
    }
  };

  useEffect(() => {
    syncState();
    syncIntervalRef.current = setInterval(syncState, 1500); // Fast 1.5s sync loop

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const handleVoteMCQ = (optionValue: string) => {
    if (isPending || hasSubmitted) return;
    startTransition(async () => {
      const res = await submitSlideResponseAction(currentSlide!.id, optionValue, participantUserId);
      if (res.success) {
        setHasSubmitted(true);
        setMyResponse(optionValue);
      }
    });
  };

  const handleWordCloudSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || hasSubmitted || !wordCloudVal.trim()) return;

    startTransition(async () => {
      const res = await submitSlideResponseAction(
        currentSlide!.id,
        wordCloudVal.trim().toLowerCase(),
        participantUserId
      );
      if (res.success) {
        setHasSubmitted(true);
        setMyResponse(wordCloudVal.trim());
      }
    });
  };

  const handleQASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || !qaInput.trim()) return;

    startTransition(async () => {
      const res = await submitSessionQAAction(sessionId, qaInput.trim(), participantUserId);
      if (res.success) {
        setQaInput("");
        syncState(); // Instantly update
      }
    });
  };

  const handleUpvote = (qaId: string) => {
    startTransition(async () => {
      const res = await upvoteQAAction(qaId);
      if (res.success) {
        setQaQuestions((prev) =>
          prev.map((q) => (q.id === qaId ? { ...q, likes: q.likes + 1 } : q))
        );
      }
    });
  };

  // ──── Lobby Render ──────────────────────────────────────────────────────────
  if (status === "LOBBY") {
    return (
      <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-violet-500 animate-spin" style={{ animationDuration: "3s" }} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-foreground">Lobby Room Joined</h1>
          <p className="text-xs text-muted-foreground">
            Waiting for the presenter to start the slideshow. Keep this tab open...
          </p>
        </div>
      </div>
    );
  }

  // ──── Finished Render ──────────────────────────────────────────────────────
  if (status === "FINISHED") {
    return (
      <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-foreground">Session Finished</h1>
          <p className="text-xs text-muted-foreground leading-normal">
            Thank you for participating! Check the presenter podium screen to see final XP standings.
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => router.push("/dashboard")} className="w-full cursor-pointer">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // ──── Active Slides Presentation ────────────────────────────────────────────
  return (
    <div className="max-w-md w-full relative flex flex-col justify-between min-h-[400px]">
      {currentSlide ? (
        <div className="bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-2xl space-y-6 flex-1 flex flex-col justify-center">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400 bg-violet-400/10 px-3 py-1 rounded-full">
              Live: Slide {currentSlideIndex + 1}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-foreground text-center">
            {currentSlide.title}
          </h2>

          {/* 1. INFO SLIDE VIEW */}
          {currentSlide.type === "INFO" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Eyes on the presenter's screen! They are showcasing summary slides. Get ready to interact on the upcoming poll slides.
              </p>
            </div>
          )}

          {/* 2. LEADERBOARD VIEW */}
          {currentSlide.type === "LEADERBOARD" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6 text-amber-500 animate-bounce" />
              </div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Class scores and standing details are visible on the main screen podium! Did you make the top 3?
              </p>
            </div>
          )}

          {/* 3. MULTIPLE CHOICE OR POLL VOTING */}
          {(currentSlide.type === "MULTIPLE_CHOICE" || currentSlide.type === "POLL") && (
            <div className="space-y-4 py-2">
              {hasSubmitted ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {currentSlide.type === "MULTIPLE_CHOICE" ? "Answer Submitted!" : "Vote Submitted!"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      You voted: <strong>{myResponse}</strong>. Awaiting presenter results...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3.5">
                  {currentSlide.options &&
                    currentSlide.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleVoteMCQ(opt)}
                        disabled={isPending}
                        className="w-full text-left p-4 rounded-2xl border border-border bg-muted/20 hover:bg-muted/50 focus:border-primary active:scale-[0.98] font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center"
                      >
                        <span className="w-6.5 h-6.5 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black mr-3 shadow-inner">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* 4. WORD CLOUD INPUT */}
          {currentSlide.type === "WORD_CLOUD" && (
            <div className="space-y-4 py-2">
              {hasSubmitted ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Tag Submitted!</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Your tag: <strong>{myResponse}</strong>. Watch the Word Cloud cluster dynamically update!
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWordCloudSubmit} className="space-y-3.5">
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Enter 1-2 words (e.g. Awesome)"
                    value={wordCloudVal}
                    onChange={(e) => setWordCloudVal(e.target.value)}
                    disabled={isPending}
                    className="w-full px-4 py-3 text-sm bg-muted/30 border border-border focus:border-primary rounded-2xl outline-none text-foreground text-center"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isPending}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl cursor-pointer"
                  >
                    Submit Word Tag
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* 5. AUDIENCE Q&A BOARD */}
          {currentSlide.type === "Q_A" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-violet-500" />
              </div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Audience Q&A is active! Use the Ask Question board to submit queries or vote on other questions.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">Synchronizing presentation deck...</div>
      )}

      {/* ───── Dynamic Collapsible Audience Q&A Panel ───── */}
      {/* Drawer Toggle Trigger Button */}
      <button
        onClick={() => setShowQADrawer(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-500/20 transition-all border border-violet-500/15 cursor-pointer z-40 active:scale-95"
        title="Ask Question to Presenter"
      >
        <MessageSquare className="w-5.5 h-5.5" />
      </button>

      {/* Q&A Drawer Drawer Modal */}
      {showQADrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          {/* Backdrop closer */}
          <div className="absolute inset-0" onClick={() => setShowQADrawer(false)} />

          {/* Content container card */}
          <div className="bg-card border border-border rounded-t-3xl max-w-md w-full p-6 space-y-4.5 relative z-10 animate-slide-up shadow-2xl max-h-[85vh] flex flex-col justify-between">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-500" />
                <h3 className="font-bold text-sm text-foreground">Interactive Q&A Session</h3>
              </div>
              <button
                onClick={() => setShowQADrawer(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of submitted questions */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[40vh] pr-1">
              {qaQuestions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 italic">No questions submitted yet. Be the first!</p>
              ) : (
                qaQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={cn(
                      "p-3.5 rounded-xl border flex items-center justify-between gap-4 text-left",
                      q.isAnswered ? "bg-green-500/5 border-green-500/20 opacity-60" : "bg-muted/10 border-border/60"
                    )}
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-foreground font-medium">{q.questionText}</p>
                      <p className="text-[9px] text-muted-foreground">
                        By <strong>{q.userName}</strong> · {q.isAnswered ? "Answered live" : "Pending"}
                      </p>
                    </div>
                    {!q.isAnswered && (
                      <button
                        onClick={() => handleUpvote(q.id)}
                        disabled={isPending}
                        className="flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-border hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-muted-foreground"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {q.likes}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Form to submit questions */}
            <form onSubmit={handleQASubmit} className="border-t border-border/80 pt-4 flex gap-2">
              <input
                type="text"
                placeholder="Ask presenter a question..."
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 text-xs bg-muted/30 border border-border focus:border-primary rounded-xl outline-none text-foreground"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isPending}
                disabled={!qaInput.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
