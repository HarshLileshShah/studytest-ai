import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function JoinFlashcardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { code } = await params;
  const deck = await prisma.flashcardDeck.findUnique({
    where: {
      shareCode: code.toUpperCase(),
    },
    include: {
      flashcards: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!deck) {
    notFound();
  }

  // Pre-initialize spaced repetition progress on the first card
  // so the deck immediately registers in "Your Study Decks" list
  const firstCard = deck.flashcards[0];
  if (firstCard) {
    await prisma.flashcardProgress.upsert({
      where: {
        userId_cardId: {
          userId,
          cardId: firstCard.id,
        },
      },
      create: {
        userId,
        cardId: firstCard.id,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
      },
      update: {}, // No-op if they already studied/joined it
    });
  }

  redirect(`/flashcards/${deck.id}`);
}
