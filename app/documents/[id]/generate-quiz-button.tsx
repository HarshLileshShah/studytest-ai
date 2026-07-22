"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { generateQuiz } from "@/app/actions/quiz.actions";

export function GenerateQuizButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");

    const result = await generateQuiz(documentId);

    if (result.success && result.quizId) {
      router.refresh();
    } else {
      setError(result.error || "Failed to generate quiz");
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="btn-primary flex items-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Quiz
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
