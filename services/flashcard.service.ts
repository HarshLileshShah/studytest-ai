import { prisma } from "@/lib/prisma";
import { generateFlashcards, generateSingleFlashcardFromText } from "./ai.service";
import { calculateSM2 } from "@/lib/sm2";

export { calculateSM2 };

/**
 * Generate a unique 6-character uppercase alphanumeric share code with prefix "FD-".
 */
async function getUniqueShareCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const MAX_ATTEMPTS = 10;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let code = "FD-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await prisma.flashcardDeck.findUnique({
      where: { shareCode: code },
    });
    if (!existing) {
      return code;
    }
  }

  throw new Error(
    "Could not generate a unique share code after 10 attempts. Please try again."
  );
}

/**
 * Generate a new flashcard deck from an existing document.
 */
export async function generateDeck(documentId: string, userId: string) {
  // Verify document ownership & text extraction status
  const document = await prisma.document.findUnique({
    where: { id: documentId, userId },
  });

  if (!document) {
    throw new Error("Document not found or access denied.");
  }

  if (!document.extractedText) {
    throw new Error("Document text has not been extracted yet.");
  }

  // Generate question/answer pairs from Gemini AI
  const rawCards = await generateFlashcards(document.extractedText, 10);
  const shareCode = await getUniqueShareCode();

  // Save the deck and cards in a database transaction
  const deck = await prisma.$transaction(async (tx) => {
    const newDeck = await tx.flashcardDeck.create({
      data: {
        documentId,
        title: `${document.title} — Flashcards`,
        cardCount: rawCards.length,
        shareCode,
      },
    });

    await tx.flashcard.createMany({
      data: rawCards.map((card) => ({
        deckId: newDeck.id,
        front: card.front,
        back: card.back,
      })),
    });

    return newDeck;
  });

  return deck;
}

/**
 * Generate a single flashcard from highlighted text and append it to the document's deck.
 */
export async function createSingleFlashcardFromHighlight(
  documentId: string,
  userId: string,
  highlightedText: string
) {
  // 1. Verify document ownership & access
  const document = await prisma.document.findUnique({
    where: { id: documentId, userId },
  });

  if (!document) {
    throw new Error("Document not found or access denied.");
  }

  // 2. Generate flashcard front/back pair via Gemini AI
  const cardData = await generateSingleFlashcardFromText(highlightedText);

  // 3. Find or create the flashcard deck for this document
  const deck = await prisma.$transaction(async (tx) => {
    let existingDeck = await tx.flashcardDeck.findFirst({
      where: { documentId },
    });

    if (!existingDeck) {
      const shareCode = await getUniqueShareCode();
      existingDeck = await tx.flashcardDeck.create({
        data: {
          documentId,
          title: `${document.title} — Flashcards`,
          cardCount: 0,
          shareCode,
        },
      });
    }

    // 4. Create the new flashcard inside this deck
    const newCard = await tx.flashcard.create({
      data: {
        deckId: existingDeck.id,
        front: cardData.front,
        back: cardData.back,
      },
    });

    // 5. Increment cardCount
    await tx.flashcardDeck.update({
      where: { id: existingDeck.id },
      data: { cardCount: { increment: 1 } },
    });

    return existingDeck;
  });

  return deck;
}

/**
 * Get all decks for a user (either owned through document or studied/joined).
 */
export async function getDecks(userId: string) {
  return prisma.flashcardDeck.findMany({
    where: {
      OR: [
        {
          document: {
            userId,
          },
        },
        {
          flashcards: {
            some: {
              progress: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      ],
    },
    include: {
      document: {
        select: { id: true, title: true, userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a specific deck, its cards, and the user's progress reviews (accessible to anyone with deckId).
 */
export async function getDeck(deckId: string, userId: string) {
  const deck = await prisma.flashcardDeck.findUnique({
    where: {
      id: deckId,
    },
    include: {
      document: {
        select: { id: true, title: true, userId: true },
      },
      flashcards: {
        include: {
          progress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!deck) return null;

  // Retroactively generate shareCode if missing for legacy decks
  if (!deck.shareCode) {
    const shareCode = await getUniqueShareCode();
    const updated = await prisma.flashcardDeck.update({
      where: { id: deckId },
      data: { shareCode },
      include: {
        document: {
          select: { id: true, title: true, userId: true },
        },
        flashcards: {
          include: {
            progress: {
              where: { userId },
            },
          },
        },
      },
    });
    return updated;
  }

  return deck;
}


/**
 * Review a flashcard and update its spaced repetition intervals using SuperMemo-2 (SM-2).
 */
export async function reviewCard(cardId: string, userId: string, quality: number) {
  // Find current review progress
  const progress = await prisma.flashcardProgress.findUnique({
    where: {
      userId_cardId: { userId, cardId },
    },
  });

  const { interval, repetitions, easeFactor } = calculateSM2(
    quality,
    progress?.repetitions ?? 0,
    progress?.interval ?? 0,
    progress?.easeFactor ?? 2.5
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return prisma.flashcardProgress.upsert({
    where: {
      userId_cardId: { userId, cardId },
    },
    create: {
      userId,
      cardId,
      interval,
      repetitions,
      easeFactor,
      nextReview,
    },
    update: {
      interval,
      repetitions,
      easeFactor,
      nextReview,
    },
  });
}
