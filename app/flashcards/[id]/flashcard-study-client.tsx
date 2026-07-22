"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowLeft,
  RotateCw,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Frown,
  Meh,
  Smile,
  Zap,
} from "lucide-react";
import { submitCardReviewAction } from "@/app/actions/flashcard.actions";
import { SpeechButton } from "@/components/ui/speech-button";
import { InviteButton } from "@/components/quiz/invite-button";

interface FlashcardStudyClientProps {
  deck: {
    id: string;
    title: string;
    shareCode?: string | null;
    flashcards: Array<{
      id: string;
      front: string;
      back: string;
      progress: Array<{
        interval: number;
        repetitions: number;
        easeFactor: number;
        nextReview: Date | string;
      }>;
    }>;
  };
}

export function FlashcardStudyClient({ deck }: FlashcardStudyClientProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewsThisSession, setReviewsThisSession] = useState<Record<string, number>>({});

  const cards = deck.flashcards;

  if (cards.length === 0) {
    return (
      <div className="glass-card p-12 text-center max-w-2xl mx-auto">
        <p className="text-muted-foreground">This deck contains no cards.</p>
        <button onClick={() => router.push("/flashcards")} className="btn-secondary mt-6">
          Back to Decks
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const hasProgress = currentCard.progress && currentCard.progress.length > 0;
  const cardProgress = hasProgress ? currentCard.progress[0] : null;

  // Spaced repetition status values
  const repetitions = cardProgress?.repetitions ?? 0;
  const interval = cardProgress?.interval ?? 0;

  const handleReview = async (quality: number) => {
    // Optimistically log session results
    setReviewsThisSession((prev) => ({
      ...prev,
      [currentCard.id]: quality,
    }));

    // Reset card face before transitioning
    setIsFlipped(false);

    // Call server action to write review statistics
    await submitCardReviewAction(currentCard.id, quality);

    // Smooth transition delay to let card rotate back
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    }, 300);
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setReviewsThisSession({});
  };

  // Calculate deck metrics
  const cardsStudied = Object.keys(reviewsThisSession).length;
  const forgotCount = Object.values(reviewsThisSession).filter((val) => val <= 2).length;
  const hardCount = Object.values(reviewsThisSession).filter((val) => val === 3).length;
  const goodCount = Object.values(reviewsThisSession).filter((val) => val === 4).length;
  const easyCount = Object.values(reviewsThisSession).filter((val) => val === 5).length;

  if (sessionCompleted) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Completion Header */}
        <div className="glass-card text-center p-10 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Session Completed!</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Great job! You have studied all the cards in this deck. Spaced repetition intervals have been scheduled.
          </p>
        </div>

        {/* Results Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="stat-card text-center">
            <Frown className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{forgotCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Forgot</p>
          </div>
          <div className="stat-card text-center">
            <Meh className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-400">{hardCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Hard</p>
          </div>
          <div className="stat-card text-center">
            <Smile className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-400">{goodCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Good</p>
          </div>
          <div className="stat-card text-center">
            <Zap className="w-5 h-5 text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-violet-400">{easyCount}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Easy</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
          <button
            onClick={restartSession}
            className="btn-secondary flex-1 py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            Study Again
          </button>
          <button
            onClick={() => router.push("/flashcards")}
            className="btn-primary flex-1 py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Decks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/flashcards")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Decks List
          </button>
          {deck.shareCode && (
            <InviteButton shareCode={deck.shareCode} type="flashcard" />
          )}
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-1.5 mb-8 overflow-hidden">
        <div
          className="bg-primary h-1.5 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full h-80 relative cursor-pointer mb-8" onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className="w-full h-full relative duration-500 transform-style-3d"
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Card Front (Question) */}
          <div
            className="absolute inset-0 w-full h-full bg-card text-card-foreground border border-border rounded-2xl shadow-xl p-8 flex flex-col justify-between backface-hidden"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/20 pb-3">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                Study Term
                <SpeechButton text={currentCard.front} className="ml-1 cursor-pointer" />
              </span>
              <div className="flex items-center gap-2">
                <span className="badge bg-muted text-muted-foreground border-border/40">
                  {repetitions === 0 ? "New" : `${repetitions} reviews`}
                </span>
                {interval > 0 && (
                  <span className="badge bg-violet-500/5 text-violet-400 border-violet-500/10">
                    {interval}d interval
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-6">
              <p className="text-xl font-bold text-center leading-relaxed text-foreground select-none">
                {currentCard.front}
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-muted-foreground/60 animate-spin-slow" />
              Click card to reveal definition/answer
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div
            className="absolute inset-0 w-full h-full bg-card text-card-foreground border border-border rounded-2xl shadow-xl p-8 flex flex-col justify-between backface-hidden rotate-y-180"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/20 pb-3">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Explanation
                <SpeechButton text={currentCard.back} className="ml-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 cursor-pointer" />
              </span>
              <span className="badge bg-emerald-500/5 text-emerald-400 border-emerald-500/10">
                Correct Answer
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center py-6">
              <p className="text-base md:text-lg font-medium text-center leading-relaxed text-foreground select-none">
                {currentCard.back}
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Click card to view question front
            </div>
          </div>
        </div>
      </div>
      {/* Card Navigation Controls (No rating) */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
          }}
          disabled={currentIndex === 0}
          className="btn-secondary py-2.5 px-4 text-xs font-semibold inline-flex items-center gap-1.5 flex-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Card
        </button>

        <button
          onClick={() => {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
          }}
          disabled={currentIndex === cards.length - 1}
          className="btn-secondary py-2.5 px-4 text-xs font-semibold inline-flex items-center gap-1.5 flex-1 justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Next Card
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Spaced Repetition Grading Controls */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4 text-center">
          Rate your recall memory quality
        </h4>

        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReview(1); // Forgot
            }}
            className="flex flex-col items-center gap-1 px-3 py-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Frown className="w-4 h-4 mb-0.5" />
            <span>Forgot</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReview(3); // Hard
            }}
            className="flex flex-col items-center gap-1 px-3 py-3 border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-400 hover:text-yellow-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Meh className="w-4 h-4 mb-0.5" />
            <span>Hard</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReview(4); // Good
            }}
            className="flex flex-col items-center gap-1 px-3 py-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 hover:text-emerald-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Smile className="w-4 h-4 mb-0.5" />
            <span>Good</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReview(5); // Easy
            }}
            className="flex flex-col items-center gap-1 px-3 py-3 border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/15 text-violet-400 hover:text-violet-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4 mb-0.5" />
            <span>Easy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
