import { notFound } from "next/navigation";
import { getDeck } from "@/services/flashcard.service";
import { FlashcardStudyClient } from "./flashcard-study-client";
import { auth } from "@/auth";

interface FlashcardStudyPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardStudyPage({ params }: FlashcardStudyPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const { id } = await params;
  const deck = await getDeck(id, userId);

  if (!deck) {
    notFound();
  }

  // Cast dates to string inside relations to prevent serialization warnings
  const serializedDeck = {
    id: deck.id,
    title: deck.title,
    shareCode: deck.shareCode,
    flashcards: deck.flashcards.map((card: any) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      progress: card.progress.map((prog: any) => ({
        interval: prog.interval,
        repetitions: prog.repetitions,
        easeFactor: prog.easeFactor,
        nextReview: prog.nextReview.toISOString(),
      })),
    })),
  };

  return <FlashcardStudyClient deck={serializedDeck} />;
}
