"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function InviteButton({
  shareCode,
  type = "quiz",
}: {
  shareCode: string;
  type?: "quiz" | "flashcard";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const pathSegment = type === "quiz" ? "quiz" : "flashcards";
      const inviteUrl = `${window.location.origin}/${pathSegment}/join/${shareCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy invite link:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 font-medium transition-all duration-200 flex-shrink-0 cursor-pointer"
      aria-label="Copy invite link"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Copied Link</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-white" />
          <span>Copy Invite Link</span>
        </>
      )}
    </button>
  );
}
