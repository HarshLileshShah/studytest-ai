"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { uploadDocument, createDocumentFromTopicAction } from "@/app/actions/document.actions";
import { formatFileSize, cn } from "@/lib/utils";
import Link from "next/link";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [activeTab, setActiveTab] = useState<"file" | "topic">("file");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files are supported.");
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMessage("File size must be under 20MB.");
      return;
    }
    setFile(selectedFile);
    setErrorMessage("");
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, ""));
    }
  }, [title]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleSubmit = async () => {
    if (!file) return;

    setUploadState("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name.replace(/\.pdf$/i, ""));

    const result = await uploadDocument(formData);

    if (result.success) {
      setUploadState("success");
      setTimeout(() => {
        router.push(`/documents/${result.documentId}`);
      }, 1500);
    } else {
      setUploadState("error");
      setErrorMessage(result.error || "Upload failed");
    }
  };

  const handleTopicSubmit = async () => {
    if (!topic.trim() || uploadState === "uploading") return;

    setUploadState("uploading");
    setErrorMessage("");

    try {
      const result = await createDocumentFromTopicAction(topic);
      if (result.success && result.documentId) {
        setUploadState("success");
        setTimeout(() => {
          router.push(`/documents/${result.documentId}`);
        }, 1500);
      } else {
        setUploadState("error");
        setErrorMessage(result.error || "Generation failed.");
      }
    } catch (err) {
      setUploadState("error");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setTopic("");
    setUploadState("idle");
    setErrorMessage("");
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 select-none">
        <Link
          href="/documents"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1.5"
        >
          ← Back to Documents
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Add Study Material</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload a PDF study material or enter a topic directly to generate your AI study guide.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="glass-card p-8">
        {uploadState === "success" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Content Ready!</h2>
            <p className="text-muted-foreground">
              Redirecting to document workspace...
            </p>
          </div>
        ) : (
          <>
            {/* Tab Selectors */}
            {uploadState !== "uploading" && (
              <div className="flex border-b border-border/60 mb-6 select-none">
                <button
                  onClick={() => setActiveTab("file")}
                  className={cn(
                    "pb-3 text-sm font-bold border-b-2 px-4 transition-colors cursor-pointer",
                    activeTab === "file"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  📁 Upload PDF
                </button>
                <button
                  onClick={() => setActiveTab("topic")}
                  className={cn(
                    "pb-3 text-sm font-bold border-b-2 px-4 transition-colors cursor-pointer",
                    activeTab === "topic"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  ✨ Study Topic
                </button>
              </div>
            )}

            {activeTab === "file" ? (
              /* TAB A: PDF FILE UPLOADER */
              <>
                {!file ? (
                  <div
                    className={cn(
                      "upload-zone cursor-pointer",
                      dragOver && "dragover"
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
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                      <Upload className="w-7 h-7" />
                    </div>
                    <p className="text-lg font-medium mb-1">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF files up to 20MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-muted border border-border">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {uploadState === "idle" && (
                        <button
                          onClick={resetForm}
                          className="btn-ghost p-2 rounded-lg cursor-pointer"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label htmlFor="doc-title" className="block text-sm font-medium mb-2">
                        Document Title
                      </label>
                      <input
                        id="doc-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Operating Systems Chapter 5"
                        className="input"
                        disabled={uploadState === "uploading"}
                      />
                    </div>

                    {errorMessage && (
                      <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errorMessage}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={uploadState === "uploading"}
                        className="btn-primary flex items-center gap-2 flex-1 justify-center cursor-pointer"
                      >
                        {uploadState === "uploading" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing PDF...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload & Extract Text
                          </>
                        )}
                      </button>
                      {uploadState !== "uploading" && (
                        <button onClick={resetForm} className="btn-secondary cursor-pointer">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* TAB B: TOPIC DESCRIPTION GENERATOR */
              <div className="space-y-6">
                <div>
                  <label htmlFor="topic-name" className="block text-sm font-medium mb-2">
                    Topic / Concept Name
                  </label>
                  <input
                    id="topic-name"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, Linear Algebra, Renaissance Art"
                    className="input"
                    disabled={uploadState === "uploading"}
                  />
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed select-none">
                    Our AI will compile a comprehensive, master study guide on this topic. Once generated, you can immediately create quizzes, flashcards, study schedules, and audio podcasts for it.
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleTopicSubmit}
                    disabled={uploadState === "uploading" || !topic.trim()}
                    className="btn-primary flex items-center gap-2 flex-1 justify-center cursor-pointer"
                  >
                    {uploadState === "uploading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Study Guide...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Study Guide
                      </>
                    )}
                  </button>
                  {uploadState !== "uploading" && (
                    <button onClick={resetForm} className="btn-secondary cursor-pointer">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
