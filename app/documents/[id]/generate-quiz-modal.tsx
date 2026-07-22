"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, HelpCircle, CheckSquare, AlignLeft, Mic } from "lucide-react";
import { generateQuiz } from "@/app/actions/quiz.actions";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface GenerateQuizModalProps {
  documentId: string;
}

export function GenerateQuizModal({ documentId }: GenerateQuizModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "ORAL_EXAM">("MCQ");
  const [cognitiveStyle, setCognitiveStyle] = useState<"THEORY" | "PRACTICAL" | "MIXED">("MIXED");
  const [oralMode, setOralMode] = useState<"standard" | "viva">("standard");
  const [count, setCount] = useState<number>(10);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGenerate = async () => {
    if (format === "ORAL_EXAM") {
      setIsOpen(false);
      router.push(`/documents/${documentId}/oral-exam?mode=${oralMode}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await generateQuiz(documentId, format, count, timeLimit, cognitiveStyle, customPrompt);

      if (result.success && result.quizId) {
        setIsOpen(false);
        router.push(`/quiz/${result.quizId}`);
      } else {
        setError(result.error || "Failed to generate quiz.");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred during generation.");
      setLoading(false);
    }
  };

  const formats = [
    {
      id: "MCQ" as const,
      title: "Multiple Choice",
      description: "Standard 4-option multiple choice questions.",
      icon: CheckSquare,
      color: "text-violet-400 bg-violet-500/10",
    },
    {
      id: "TRUE_FALSE" as const,
      title: "True / False",
      description: "True/False statement verification assessments.",
      icon: HelpCircle,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      id: "SHORT_ANSWER" as const,
      title: "Short Answer",
      description: "Type answers directly. Graded semantically by AI.",
      icon: AlignLeft,
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      id: "ORAL_EXAM" as const,
      title: "Oral Exam (Voice-to-Voice)",
      description: "Interactive study Q&A using your microphone.",
      icon: Mic,
      color: "text-amber-400 bg-amber-500/10",
    },
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        className="whitespace-nowrap flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Generate Quiz
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Configure Practice Quiz"
        loading={loading}
        icon={<Sparkles className="w-4 h-4 text-primary" />}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Format Selection Card Grid */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3 select-none">
              Question Format
            </label>
            <div className="grid grid-cols-1 gap-3">
              {formats.map((f) => {
                const IconComponent = f.icon;
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => !loading && setFormat(f.id)}
                    className={`flex items-start gap-4 p-4 border rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${f.color} flex-shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Oral Exam Mode Selector */}
          {format === "ORAL_EXAM" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3 select-none">
                Oral Exam Mode
              </label>
              <div className="flex gap-3">
                {([
                  { id: "standard", title: "Friendly Practice", desc: "Encouraging voice study assistant" },
                  { id: "viva", title: "Strict Mock Viva", desc: "Rigorous technical examiner panel" }
                ] as const).map((modeOption) => {
                  const isSelected = oralMode === modeOption.id;
                  return (
                    <button
                      key={modeOption.id}
                      type="button"
                      onClick={() => setOralMode(modeOption.id)}
                      className={`flex-1 p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <h4 className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {modeOption.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        {modeOption.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cognitive Style Selector - Hide on Oral Exam */}
          {format !== "ORAL_EXAM" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3 select-none">
                Quiz Focus & Style
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: "THEORY", label: "📚 Theory", desc: "Concepts & facts" },
                  { id: "PRACTICAL", label: "🛠️ Practical", desc: "Scenarios & cases" },
                  { id: "MIXED", label: "🔄 Mixed", desc: "Balanced blend" },
                ].map((styleOpt) => {
                  const isSelected = cognitiveStyle === styleOpt.id;
                  return (
                    <button
                      key={styleOpt.id}
                      onClick={() => !loading && setCognitiveStyle(styleOpt.id as any)}
                      className={`flex-1 py-2 px-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span>{styleOpt.label}</span>
                      <span className="text-[9px] text-muted-foreground/80 font-normal">
                        {styleOpt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Count Selector - Hide on Oral Exam */}
          {format !== "ORAL_EXAM" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3 select-none">
                Number of Questions
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 20].map((num) => {
                  const isSelected = count === num;
                  return (
                    <button
                      key={num}
                      onClick={() => !loading && setCount(num)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {num} Qs
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Limit Selector - Hide on Oral Exam */}
          {format !== "ORAL_EXAM" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5 select-none">
                Custom Time Limit (Exam Mode)
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {([null, 5, 10, 15, 20, 30, 45, 60] as (number | null)[]).map((num) => {
                  const isSelected = timeLimit === num && !customTimeInput;
                  return (
                    <button
                      key={num === null ? "default" : num}
                      type="button"
                      onClick={() => {
                        if (!loading) {
                          setTimeLimit(num);
                          setCustomTimeInput("");
                        }
                      }}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {num === null ? "Default" : `${num} Min`}
                    </button>
                  );
                })}

                <div className="flex items-center gap-1.5 ml-1">
                  <span className="text-xs text-muted-foreground">Or:</span>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    placeholder="Minutes"
                    value={customTimeInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTimeInput(val);
                      if (val) {
                        setTimeLimit(parseInt(val, 10) || null);
                      } else {
                        setTimeLimit(null);
                      }
                    }}
                    className="w-20 px-2 py-1.5 text-xs bg-muted/20 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg outline-none text-foreground text-center"
                    disabled={loading}
                  />
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 leading-normal select-none">
                * Default runs with 1.5 minutes per question. This limit is active when starting the quiz in Exam Mode.
              </p>
            </div>
          )}

          {/* Custom Prompt Personalization - Hide on Oral Exam */}
          {format !== "ORAL_EXAM" && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5 select-none">
                Personalized Custom Instructions (Optional)
              </label>
              <textarea
                placeholder="e.g., 'Focus heavily on formulas and calculations', 'Ask questions about chapter 3 only', 'Include simple numerical examples'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={loading}
                className="w-full min-h-[70px] p-3 text-xs bg-muted/20 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground resize-none leading-relaxed"
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs text-center font-medium bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              {error}
            </p>
          )}

          {/* Action Trigger */}
          <Button
            onClick={handleGenerate}
            loading={loading}
            variant="primary"
            className="w-full py-3 h-12 cursor-pointer"
          >
            {format === "ORAL_EXAM" ? (
              <>
                <Mic className="w-5 h-5" />
                {loading ? "Initiating Spoken Exam..." : "Start Oral Exam"}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {loading ? "Generating Practice Quiz..." : "Generate Quiz"}
              </>
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}
