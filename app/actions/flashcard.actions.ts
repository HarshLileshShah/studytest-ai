"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { generateDeck, reviewCard, createSingleFlashcardFromHighlight } from "@/services/flashcard.service";

/**
 * Server Action: Generate a flashcard deck from a document's extracted text.
 */
export async function generateFlashcardDeckAction(documentId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const deck = await generateDeck(documentId, userId);

    // Revalidate index page to show the newly generated deck
    revalidatePath("/flashcards");
    revalidatePath("/documents");

    return { success: true, deckId: deck.id };
  } catch (err: any) {
    console.error("Flashcard deck generation failed:", err);
    return { success: false, error: err.message || "Failed to generate flashcard deck." };
  }
}

import { recordStudyActivity } from "@/services/gamification.service";

/**
 * Server Action: Review/grade a flashcard and update its study progress.
 */
export async function submitCardReviewAction(cardId: string, quality: number) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    await reviewCard(cardId, userId, quality);
    // Record study activity for streaks and achievements
    await recordStudyActivity(userId);
    return { success: true };
  } catch (err: any) {
    console.error("Flashcard review submission failed:", err);
    return { success: false, error: err.message || "Failed to record review progress." };
  }
}

/**
 * Server Action: Generate a single flashcard from highlighted text and append it to the document's deck.
 */
export async function createFlashcardFromHighlightAction(
  documentId: string,
  highlightedText: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const deck = await createSingleFlashcardFromHighlight(documentId, userId, highlightedText);

    revalidatePath("/flashcards");
    revalidatePath(`/documents/${documentId}`);

    return { success: true, deckId: deck.id };
  } catch (err: any) {
    console.error("Failed to generate single flashcard from highlight:", err);
    return { success: false, error: err.message || "Failed to generate flashcard." };
  }
}
