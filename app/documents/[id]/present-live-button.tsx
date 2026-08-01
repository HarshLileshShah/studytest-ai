"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Presentation, Loader2 } from "lucide-react";
import { createSessionAction } from "@/app/actions/session.actions";

export function PresentLiveButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handlePresent = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const result = await createSessionAction(documentId);

      if (result.success && result.sessionId) {
        router.push(`/documents/present/${result.sessionId}`);
      } else {
        setError(result.error || "Failed to start presentation session.");
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
        onClick={handlePresent}
        disabled={isGenerating}
        className="btn-secondary flex items-center gap-2 cursor-pointer whitespace-nowrap border-violet-500/30 text-violet-300 hover:bg-violet-500/10 shadow-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            Building Slides...
          </>
        ) : (
          <>
            <Presentation className="w-4 h-4 text-violet-400" />
            Present Live
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-xs mt-2 text-right font-medium">{error}</p>
      )}
    </div>
  );
}
