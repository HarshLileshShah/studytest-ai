"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, Sparkles, HelpCircle } from "lucide-react";
import { joinSessionAction } from "@/app/actions/session.actions";
import { Button } from "@/components/ui/button";

export function JoinClient({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [shareCode, setShareCode] = useState("");
  const [userName, setUserName] = useState(defaultName);
  const [error, setError] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode.trim()) {
      setError("Please enter a valid session code.");
      return;
    }
    if (!userName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    setError("");
    const formattedCode = shareCode.toUpperCase().trim();

    startTransition(async () => {
      // 1. If it's an Interactive Presentation Session (starts with LIVE-)
      if (formattedCode.startsWith("LIVE-")) {
        const res = await joinSessionAction(formattedCode, userName);
        if (res.success && res.sessionId && res.userId) {
          router.push(`/session/${res.sessionId}?pId=${res.userId}`);
        } else {
          setError(res.error || "Failed to join live session lobby.");
        }
      } 
      // 2. If it's a standard Quiz Battle Code (starts with ST-)
      else if (formattedCode.startsWith("ST-")) {
        router.push(`/quiz/join/${formattedCode}`);
      } 
      // 3. Fallback search
      else {
        // Try joining as a live session first
        const res = await joinSessionAction(formattedCode, userName);
        if (res.success && res.sessionId && res.userId) {
          router.push(`/session/${res.sessionId}?pId=${res.userId}`);
        } else {
          setError("Invalid code. Enter a LIVE-XXXX presentation or ST-XXXX quiz code.");
        }
      }
    });
  };

  return (
    <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Visual background sparkles */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-6 text-center">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-lg shadow-primary/5">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Join Live Session</h1>
          <p className="text-xs text-muted-foreground leading-normal">
            Enter a presentation code or quiz battle room code to participate in real-time.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4 text-left">
          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="e.g. Alex Smith"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isPending}
                className="w-full pl-10 pr-4 py-3 text-sm bg-muted/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-foreground transition-all"
              />
            </div>
          </div>

          {/* Session Code Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
              Room Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <KeyRound className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="e.g. LIVE-A1B2 or ST-C3D4"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                disabled={isPending}
                className="w-full pl-10 pr-4 py-3 text-sm bg-muted/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-foreground transition-all uppercase tracking-wide font-semibold"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-semibold leading-normal text-center mt-2 animate-shake">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isPending}
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold tracking-wide shadow-lg shadow-primary/10 cursor-pointer"
          >
            {isPending ? "Connecting..." : "Join Interactive Room"}
          </Button>
        </form>

        {/* Tip panel */}
        <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground border-t border-border/50">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Ask your teacher/presenter for the room code</span>
        </div>
      </div>
    </div>
  );
}
