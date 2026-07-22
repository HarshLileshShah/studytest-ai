import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trash2,
  File,
} from "lucide-react";
import { getDocument } from "@/services/document.service";
import { getChatHistory } from "@/services/tutor.service";
import { TutorChat } from "./tutor-chat";
import { formatDate, formatFileSize } from "@/lib/utils";
import { DeleteDocumentButton } from "./delete-button";
import { GenerateQuizModal } from "./generate-quiz-modal";
import { GenerateFlashcardButton } from "./generate-flashcard-button";
import { DocumentTabs } from "./document-tabs";
import { auth } from "@/auth";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const { id } = await params;
  const [document, chatMessages] = await Promise.all([
    getDocument(id),
    getChatHistory(id, userId),
  ]);

  if (!document || document.userId !== userId) {
    notFound();
  }

  const serializedMessages = chatMessages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Back Link */}
      <Link
        href="/documents"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <File className="w-3.5 h-3.5" />
                {document.filename}
              </div>
              <span className="text-border">•</span>
              <span>{formatFileSize(document.fileSize)}</span>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(document.uploadedAt)}
              </div>
              {document.pageCount > 0 && (
                <>
                  <span className="text-border">•</span>
                  <span>{document.pageCount} pages</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {document.status === "READY" && (
            <>
              <GenerateFlashcardButton documentId={document.id} />
              <GenerateQuizModal documentId={document.id} />
            </>
          )}
          <DeleteDocumentButton documentId={document.id} />
        </div>
      </div>

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details & Document data */}
        <div className="lg:col-span-7 space-y-8">
          {/* Status */}
          {document.status === "FAILED" && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Text extraction failed for this document. The PDF may be image-based or
              corrupted. Try uploading a different file.
            </div>
          )}

          {document.status === "PROCESSING" && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
              Text is being extracted from this document. Please refresh the page in a
              moment.
            </div>
          )}

          {/* Extracted Text & Mind-Map Tabs */}
          {document.extractedText && (
            <DocumentTabs
              documentId={document.id}
              documentTitle={document.title}
              extractedText={document.extractedText}
              initialVisualOutline={document.visualOutline}
            />
          )}

          {/* Generated Quizzes */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generated Quizzes
            </h2>

            {document.quizzes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-4">
                  No quizzes generated yet.{" "}
                  {document.status === "READY"
                    ? "Click the button above to generate your first quiz!"
                    : "Extract text first, then generate quizzes."}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {document.quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quiz/${quiz.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/45 border border-border/80 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors truncate" title={quiz.title}>
                        {quiz.title}
                      </h3>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                        <span>{quiz.questionCount} questions</span>
                        <span className="text-border">•</span>
                        <span>{formatDate(quiz.createdAt)}</span>
                        {quiz._count.attempts > 0 && (
                          <>
                            <span className="text-border">•</span>
                            <span>{quiz._count.attempts} attempts</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap inline-flex items-center gap-1">
                      Take Quiz
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Tutor Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-8">
          {document.status === "READY" ? (
            <TutorChat documentId={document.id} initialMessages={serializedMessages} />
          ) : (
            <div className="glass-card p-6 text-center border border-border/60 bg-muted/10">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <h3 className="font-bold text-foreground text-sm">AI Tutor Unavailable</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                The tutor will become available once the document has finished processing and text has been successfully extracted.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
