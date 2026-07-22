"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Loader2 } from "lucide-react";
import { generateFlashcardDeckAction } from "@/app/actions/flashcard.actions";

export function GenerateFlashcardButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const result = await generateFlashcardDeckAction(documentId);

      if (result.success && result.deckId) {
        router.push(`/flashcards/${result.deckId}`);
      } else {
        setError(result.error || "Failed to generate flashcard deck.");
        setIsGenerating(false);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="btn-secondary flex items-center gap-2 cursor-pointer whitespace-nowrap"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Cards...
          </>
        ) : (
          <>
            <Layers className="w-4 h-4 text-violet-400" />
            Generate Flashcards
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-xs mt-2 text-right">{error}</p>
      )}
    </div>
  );
}
