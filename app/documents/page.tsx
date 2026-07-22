import Link from "next/link";
import { FileText, Plus, Clock, BookOpen } from "lucide-react";
import { getDocuments } from "@/services/document.service";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatDate, formatFileSize } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    READY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span className={`badge ${styles[status] || styles.PENDING}`}>
      {status.toLowerCase()}
    </span>
  );
}

export default async function DocumentsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const documents = await getDocuments(userId);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Documents</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Your uploaded study materials
          </p>
        </div>
        <Link href="/documents/upload" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload PDF
        </Link>
      </div>

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Upload your first PDF study material to get started with AI-generated
            practice quizzes.
          </p>
          <Link href="/documents/upload" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Your First PDF
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="glass-card p-6 group block"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {doc.filename}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(doc.uploadedAt)}
                </div>
                <span className="text-border">•</span>
                <span>{formatFileSize(doc.fileSize)}</span>
                {doc._count.quizzes > 0 && (
                  <>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {doc._count.quizzes} quiz{doc._count.quizzes !== 1 && "zes"}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3">
                <StatusBadge status={doc.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
