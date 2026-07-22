"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarRange,
  Loader2,
  Sparkles,
  CheckSquare,
  Square,
  FileText,
  AlertCircle,
  ChevronLeft,
  Upload,
  X,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { createStudyPlanAction } from "@/app/actions/planner.actions";
import { uploadDocument } from "@/app/actions/document.actions";

interface NewPlanClientProps {
  documents: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

type SourceMode = "select" | "upload";

export function NewPlanClient({ documents }: NewPlanClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Core config states
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [error, setError] = useState("");

  // Source selection states
  const [sourceMode, setSourceMode] = useState<SourceMode>("select");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  // Direct upload states
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const activeDocs = documents.filter((doc) => doc.status === "READY");

  const handleToggleDoc = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB.");
      return;
    }
    setFile(selectedFile);
    setError("");

    // Auto-fill study goal title from filename if empty
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, "") + " Plan");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please set a study goal title.");
      return;
    }
    if (!targetDate) {
      setError("Please choose a target date.");
      return;
    }

    // Verify date is in the future
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (target <= today) {
      setError("Target date must be in the future.");
      return;
    }

    if (sourceMode === "select" && selectedDocs.length === 0) {
      setError("Please select at least one study material document.");
      return;
    }

    if (sourceMode === "upload" && !file) {
      setError("Please select or drop a PDF study document to upload.");
      return;
    }

    startTransition(async () => {
      let finalDocIds = [...selectedDocs];

      // If user uploaded a new document, upload it first
      if (sourceMode === "upload" && file) {
        setUploadMessage("Uploading and extracting PDF text...");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name.replace(/\.pdf$/i, ""));

        const uploadRes = await uploadDocument(formData);
        if (!uploadRes.success || !uploadRes.documentId) {
          setError(uploadRes.error || "Failed to upload study document.");
          setUploadMessage("");
          return;
        }

        finalDocIds = [uploadRes.documentId];
      }

      setUploadMessage("Structuring daily study roadmap...");
      const res = await createStudyPlanAction({
        title: title.trim(),
        targetDateStr: targetDate,
        dailyMinutes,
        documentIds: finalDocIds,
      });

      if (res.success && res.planId) {
        router.push(`/planner/${res.planId}`);
        router.refresh();
      } else {
        setError(res.error || "Failed to generate study plan.");
        setUploadMessage("");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link
        href="/planner"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Study Plans
      </Link>

      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarRange className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Study Plan</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Let AI structure a customized study timeline from your materials
          </p>
        </div>
      </div>

      <form onSubmit={handleCreatePlan} className="glass-card p-6 space-y-6">
        {/* Goal Title */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Study Goal / Exam Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Biology Semester Final, React Certification"
            className="input w-full p-3 text-sm"
            disabled={isPending}
          />
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Target Date (Exam/Deadline)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input w-full p-3 text-sm"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Daily Study Limit
            </label>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="input w-full p-3 text-sm"
              disabled={isPending}
            >
              <option value={30}>30 mins / day</option>
              <option value={60}>60 mins / day</option>
              <option value={90}>90 mins / day</option>
              <option value={120}>120 mins / day</option>
            </select>
          </div>
        </div>

        {/* Materials selector tabs */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Study Materials Source
          </label>

          <div className="flex gap-2 p-1 bg-muted/40 border border-border/40 rounded-xl mb-4 w-fit">
            <button
              type="button"
              onClick={() => setSourceMode("select")}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                sourceMode === "select"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              disabled={isPending}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("upload")}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                sourceMode === "upload"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              disabled={isPending}
            >
              Upload New PDF
            </button>
          </div>

          {/* Tab 1: Existing list selector */}
          {sourceMode === "select" && (
            <>
              {activeDocs.length === 0 ? (
                <div className="text-center border border-dashed border-border/80 p-6 rounded-xl bg-muted/10">
                  <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No ready documents found. Go to the "Upload New PDF" tab to select a file directly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {activeDocs.map((doc) => {
                    const isChecked = selectedDocs.includes(doc.id);
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleToggleDoc(doc.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-xl text-left text-xs transition-all cursor-pointer",
                          isChecked
                            ? "border-primary bg-primary/5"
                            : "border-border/60 bg-muted/20 hover:bg-muted/40"
                        )}
                        disabled={isPending}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-foreground font-medium">{doc.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Tab 2: Upload new document */}
          {sourceMode === "upload" && (
            <div className="space-y-4">
              {!file ? (
                <div
                  className={cn(
                    "upload-zone p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer",
                    dragOver
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-border/60 bg-muted/10 hover:bg-muted/20"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Drag and drop PDF here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only PDF files are supported, up to 20MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs font-medium text-center bg-red-500/5 p-3 rounded-lg border border-red-500/10 animate-shake">
            {error}
          </p>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          disabled={
            isPending ||
            (sourceMode === "select" && selectedDocs.length === 0) ||
            (sourceMode === "upload" && !file)
          }
          className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer h-12"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploadMessage || "Structuring Study Plan..."}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Study Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
