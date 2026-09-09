"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { loadSampleDemoDataAction } from "@/app/actions/demo.actions";
import { useRouter } from "next/navigation";

export function LoadDemoButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLoadDemo() {
    setLoading(true);
    try {
      const result = await loadSampleDemoDataAction();
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to load demo data");
      }
    } catch (e) {
      console.error(e);
      alert("Error loading demo data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLoadDemo}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating Demo Course...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 text-primary" />
          <span>⚡ Load Sample Demo Course (1-Click)</span>
        </>
      )}
    </button>
  );
}
