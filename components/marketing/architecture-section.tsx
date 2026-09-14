"use client";

import {
  FileUp,
  ScanText,
  Cpu,
  ShieldCheck,
  GraduationCap,
  Layers,
  ArrowRight,
  Database,
  Code2,
  CheckCircle2,
  Terminal
} from "lucide-react";

export function ArchitectureSection() {
  const steps = [
    {
      num: "01",
      icon: FileUp,
      title: "Document Ingestion",
      desc: "Accepts lecture slides, textbook PDFs, syllabi, or handwritten class notes. Computes SHA-256 hash and chunks text intelligently.",
      badge: "PDF / Slides",
    },
    {
      num: "02",
      icon: ScanText,
      title: "Native Visual OCR",
      desc: "Extracts formulas, diagrams, and scanned text via base64 multimodal vision pipelines, preserving layout and structural context.",
      badge: "High-Fidelity OCR",
    },
    {
      num: "03",
      icon: Cpu,
      title: "Multi-Provider LLM Gateway",
      desc: "Routes inference dynamically to Google Gemini 2.5, Groq High-Speed Llama, OpenAI, or local Ollama with zero-latency failover.",
      badge: "Dual Gateway",
    },
    {
      num: "04",
      icon: ShieldCheck,
      title: "Defensive JSON Parser & Zod Validation",
      desc: "Strips markdown ```json fences, extracts JSON from conversational preambles, and enforces strict TypeScript/Zod schema guarantees.",
      badge: "Zero-Hallucination",
    },
    {
      num: "05",
      icon: GraduationCap,
      title: "Adaptive Learning Modules",
      desc: "Instantly compiles SM-2 spaced repetition cards, interactive quizzes, Mermaid mind maps, and Web Speech audio debates.",
      badge: "Active Recall",
    },
  ];

  return (
    <section id="architecture" className="py-20 md:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>Under the Hood</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            The 5-Stage AI Study Pipeline
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            How StudyTest AI turns messy, unformatted documents into mathematically validated, structured active recall systems in milliseconds.
          </p>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="glass-card rounded-2xl p-6 border border-border/80 hover:border-primary/50 transition-all duration-200 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono font-black text-xl text-muted-foreground/40 group-hover:text-primary transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:border-primary/40 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground font-mono flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Validated & Tested</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Dive Code & Architecture Box */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 bg-[#09090d] shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left explanation */}
            <div className="lg:w-1/2 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>Defensive Parsing Architecture</span>
              </div>
              <h3 className="text-2xl font-extrabold text-foreground leading-snug">
                Why Naive Fixed Prompts Fail in Production
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Raw LLM outputs frequently break when models wrap responses in markdown fences (<code className="text-purple-300 font-mono">```json ... ```</code>), introduce conversational intros (<em className="text-zinc-400">"Sure, here are your questions:"</em>), or hallucinate a <code className="text-purple-300 font-mono">correctAnswer</code> that doesn't exist in the options array.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                StudyTest AI solves this at the protocol level with a multi-layered defensive parser and Zod schema validator, backed by 34 automated unit tests verifying edge-case resilience.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-[11px] px-3 py-1 rounded-lg bg-muted/40 border border-border font-mono text-zinc-300">
                  ✓ Vitest & tsx --test
                </span>
                <span className="text-[11px] px-3 py-1 rounded-lg bg-muted/40 border border-border font-mono text-zinc-300">
                  ✓ SM-2 Math Clamped
                </span>
                <span className="text-[11px] px-3 py-1 rounded-lg bg-muted/40 border border-border font-mono text-zinc-300">
                  ✓ Zod Type Safety
                </span>
              </div>
            </div>

            {/* Right code snippet mock */}
            <div className="lg:w-1/2 w-full">
              <div className="rounded-2xl bg-[#060609] border border-border/80 p-4 font-mono text-[11px] overflow-x-auto shadow-inner text-zinc-300">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-muted-foreground text-[10px]">
                  <span>services/flashcard.service.ts</span>
                  <span className="text-emerald-400">SM-2 Pure Math</span>
                </div>
                <pre className="leading-relaxed">
{`export function calculateSM2(
  quality: number,
  currentRepetitions: number = 0,
  currentInterval: number = 0,
  currentEaseFactor: number = 2.5
) {
  const q = Math.max(0, Math.min(5, quality));
  
  if (q >= 3) {
    // Correct recall: expand review interval
    let nextInterval = currentInterval === 0 ? 1 : 
                       currentInterval === 1 ? 6 : 
                       Math.round(currentInterval * currentEaseFactor);
                       
    let nextEaseFactor = currentEaseFactor + 
      (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      
    // Clamp Ease Factor lower bound to prevent interval collapse
    nextEaseFactor = Math.max(1.3, nextEaseFactor);
    
    return { interval: nextInterval, easeFactor: nextEaseFactor };
  }
  // Failed recall: reset to day 1
  return { interval: 1, easeFactor: currentEaseFactor };
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
