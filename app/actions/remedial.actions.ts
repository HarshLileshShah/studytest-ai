"use server";

import { generateFlashcardsForTopics } from "@/services/ai.service";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function generateRemedialDeckAction(
  documentId: string,
  topics: string[],
  quizTitle: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (topics.length === 0) {
    return { success: false, error: "No topics specified for remedial study." };
  }

  try {
    // 1. Fetch document text
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { extractedText: true, title: true },
    });

    if (!document || !document.extractedText) {
      return { success: false, error: "Document content not found." };
    }

    // 2. Call AI to generate targeted flashcards focusing ONLY on the missed topics
    const rawCards = await generateFlashcardsForTopics(document.extractedText, topics, 8);

    if (rawCards.length === 0) {
      return { success: false, error: "AI was unable to extract specific cards for these concepts." };
    }

    // 3. Create unique shareCode
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let shareCode = "FD-";
    for (let i = 0; i < 6; i++) {
      shareCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 4. Create the deck and cards in database
    const deck = await prisma.$transaction(async (tx) => {
      const newDeck = await tx.flashcardDeck.create({
        data: {
          documentId,
          title: `Remedial: ${topics.slice(0, 3).join(", ")}${topics.length > 3 ? "..." : ""} (from ${quizTitle})`,
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

      // Auto-initialize progress for the user on the first card
      const firstCard = await tx.flashcard.findFirst({
        where: { deckId: newDeck.id },
      });
      if (firstCard) {
        await tx.flashcardProgress.create({
          data: {
            userId,
            cardId: firstCard.id,
            interval: 0,
            repetitions: 0,
            easeFactor: 2.5,
            nextReview: new Date(),
          },
        });
      }

      return newDeck;
    });

    return { success: true, deckId: deck.id };
  } catch (error) {
    console.error("Failed to generate remedial deck:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate deck",
    };
  }
}

export async function getWeaknessDiagnosticAction() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const answers = await prisma.answer.findMany({
      where: { attempt: { userId } },
      include: {
        question: {
          select: {
            topic: true,
            quiz: {
              select: {
                documentId: true,
                document: {
                  select: { title: true },
                },
              },
            },
          },
        },
      },
    });

    const topicMap = new Map<string, { correct: number; total: number; documentId: string; documentTitle: string }>();

    for (const ans of answers) {
      const topic = ans.question.topic || "General";
      const docId = ans.question.quiz.documentId;
      const docTitle = ans.question.quiz.document.title;

      const existing = topicMap.get(topic) || { correct: 0, total: 0, documentId: docId, documentTitle: docTitle };
      existing.total++;
      if (ans.isCorrect) {
        existing.correct++;
      }
      topicMap.set(topic, existing);
    }

    const diagnostics = Array.from(topicMap.entries())
      .map(([topic, data]) => {
        const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        return {
          topic,
          correct: data.correct,
          total: data.total,
          accuracy,
          documentId: data.documentId,
          documentTitle: data.documentTitle,
          isWeak: accuracy < 70,
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy);

    return { success: true, diagnostics };
  } catch (error) {
    console.error("Diagnostic fetch failed:", error);
    return { success: false, error: "Failed to compile diagnostic data." };
  }
}
