"use client";

import { useState, useTransition } from "react";
import { Search, Sparkles, Loader2, Book, ArrowRight, X } from "lucide-react";
import { searchKnowledgeBaseAction } from "@/app/actions/document.actions";
import Link from "next/link";

export function AISearchBar() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [docsUsed, setDocsUsed] = useState<Array<{ id: string; title: string }>>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isPending) return;

    setError("");
    startTransition(async () => {
      try {
        const res = await searchKnowledgeBaseAction(query);
        if (res.success && res.answer) {
          setAnswer(res.answer);
          setDocsUsed(res.documentsUsed || []);
        } else {
          setError(res.error || "Search failed.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      }
    });
  };

  const handleClear = () => {
    setQuery("");
    setAnswer(null);
    setDocsUsed([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Search Input Card */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-lg group-focus-within:bg-primary/15 transition-all pointer-events-none" />
        <div className="relative flex items-center bg-muted/50 dark:bg-zinc-950/40 border border-border focus-within:border-primary/60 p-1.5 rounded-2xl transition-all">
          <div className="pl-3.5 text-muted-foreground flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question across all your uploaded study PDFs... (e.g., Explain ACID properties)"
            className="w-full bg-transparent border-0 outline-none px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground"
            disabled={isPending}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading feedback */}
      {isPending && (
        <div className="glass-card p-6 border border-primary/20 bg-primary/5 rounded-2xl flex items-center gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-semibold">
            Scanning all uploaded library PDFs & compiling summary briefing...
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl">
          {error}
        </div>
      )}

      {/* Answer synthesized panel */}
      {answer && !isPending && (
        <div className="glass-card p-6 border border-primary/20 bg-primary/5 rounded-2xl space-y-5 animate-scale-up">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              Unified Knowledge Briefing
            </h3>
            <button
              onClick={handleClear}
              className="text-[10px] text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider py-1 px-2 rounded hover:bg-muted/40 border border-border/40 cursor-pointer"
            >
              Close Briefing
            </button>
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
            {answer}
          </div>

          {/* Document citations */}
          {docsUsed.length > 0 && (
            <div className="border-t border-border/30 pt-4">
              <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block mb-2.5">
                Sources Cited
              </span>
              <div className="flex flex-wrap gap-2">
                {docsUsed.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-muted/60 dark:bg-zinc-950/60 border border-border hover:border-primary/40 p-1.5 px-3 rounded-lg text-foreground hover:text-primary transition-all"
                  >
                    <Book className="w-3 h-3" />
                    <span>{doc.title}</span>
                    <ArrowRight className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
