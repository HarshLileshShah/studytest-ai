"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinQuizByCode } from "@/app/actions/share.actions";
import { KeyRound, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function JoinTestModal() {
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
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
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
          setCode("");
          setError("");
        }}
        variant="secondary"
        className="h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold"
      >
        <KeyRound className="w-4 h-4" />
        Join Test
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Join Shared Test"
        description="Enter the 6-character shared test code to attend."
        loading={loading}
        icon={<KeyRound className="w-5 h-5 text-violet-400" />}
      >
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="e.g. ST-A1B2C3"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={9}
              className="input w-full text-center text-sm font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal h-11"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!code.trim()}
              loading={loading}
              variant="primary"
              size="sm"
              className="px-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Join Test
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
