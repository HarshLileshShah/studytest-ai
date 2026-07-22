"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinQuizByCode } from "@/app/actions/share.actions";
import { KeyRound, Sparkles } from "lucide-react";

export function JoinQuizForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await joinQuizByCode(code.trim());
      if (res.success && res.quizId) {
        router.push(`/quiz/${res.quizId}`);
      } else {
        setError(res.error || "Failed to join quiz.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Join a Shared Test</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter a 6-character test code (e.g. ST-XXXXXX) shared by your peer to attend their test.
          </p>

          <form onSubmit={handleJoin} className="mt-4 flex items-center gap-3 max-w-md">
            <input
              type="text"
              placeholder="e.g. ST-A1B2C3"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={9}
              className="input text-sm flex-1 font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary py-2 px-4 text-xs font-semibold h-10 inline-flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              {loading ? (
                "Joining..."
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Join Test
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="text-xs font-medium text-red-400 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
