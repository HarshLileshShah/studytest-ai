import { prisma } from "@/lib/prisma";
import { generateFlashcards, generateSingleFlashcardFromText } from "./ai.service";

/**
 * Generate a unique 6-character uppercase alphanumeric share code with prefix "FD-".
 */
async function getUniqueShareCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (true) {
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

  // 2. Generate flashcard term/def via Groq AI
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
  // Validate quality bounds (0 to 5)
  const q = Math.max(0, Math.min(5, quality));

  // Find current review progress
  const progress = await prisma.flashcardProgress.findUnique({
    where: {
      userId_cardId: { userId, cardId },
    },
  });

  let interval = progress?.interval ?? 0;
  let repetitions = progress?.repetitions ?? 0;
  let easeFactor = progress?.easeFactor ?? 2.5;

  // Spaced repetition scheduler logic
  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Adjust EF according to SM-2 formula
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3; // Bounds restriction
  }

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
