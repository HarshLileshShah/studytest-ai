import Link from "next/link";
import { Layers, Plus, Clock, FileText, ArrowRight, Play } from "lucide-react";
import { getDecks } from "@/services/flashcard.service";
import { getDocuments } from "@/services/document.service";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { GenerateFlashcardButton } from "../documents/[id]/generate-flashcard-button";

export default async function FlashcardsIndexPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch decks and documents
  const [decks, allDocuments] = await Promise.all([
    getDecks(userId),
    getDocuments(userId),
  ]);

  // Find READY documents that do not have a flashcard deck yet
  const availableDocs = allDocuments.filter(
    (doc: any) =>
      doc.status === "READY" &&
      !decks.some((deck: any) => deck.documentId === doc.id)
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Flashcard Decks</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Spaced-repetition card decks for active recall learning
          </p>
        </div>
        <Link href="/documents" className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload Document
        </Link>
      </div>

      {/* Main Study Decks List */}
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-foreground">
        <Layers className="w-5 h-5 text-primary" />
        Your Study Decks
      </h2>

      {decks.length === 0 ? (
        <div className="glass-card p-12 text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No flashcard decks yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Generate a card deck from your uploaded PDF study materials to start learning.
          </p>
          {availableDocs.length > 0 ? (
            <p className="text-xs text-muted-foreground mb-4">
              Select one of your uploaded documents below to generate flashcards!
            </p>
          ) : (
            <Link href="/documents" className="btn-primary inline-flex items-center gap-2">
              Get Started by Uploading PDF
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {decks.map((deck: any) => {
            return (
              <Link
                key={deck.id}
                href={`/flashcards/${deck.id}`}
                className="glass-card p-6 group block hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
                      <span className="truncate">{deck.title}</span>
                      {deck.document.userId !== userId && (
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] py-0.5 px-1.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 select-none">
                          Shared
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      From: {deck.document.title}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-4">
                  <div className="flex items-center gap-3">
                    <span>{deck.cardCount} Cards</span>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(deck.createdAt)}
                    </div>
                  </div>
                  <span className="text-primary font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Study Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Available Documents for Generation */}
      {availableDocs.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Generate Decks from Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableDocs.map((doc: any) => (
              <div
                key={doc.id}
                className="glass-card p-5 flex flex-col justify-between h-40"
              >
                <div>
                  <h3 className="font-semibold text-foreground truncate text-sm">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {doc.filename}
                  </p>
                </div>
                <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ready to generate</span>
                  <GenerateFlashcardButton documentId={doc.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
