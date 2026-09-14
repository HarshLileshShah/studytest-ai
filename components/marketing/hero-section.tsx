"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  FileText,
  BrainCircuit,
  GraduationCap,
  Layers,
  Flame,
  CheckCircle2,
  Users,
  Cpu,
  ChevronRight
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-primary/25 via-indigo-600/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Subtle Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow Floating Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-8 backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500 hover:scale-105 transition-transform cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span>Next-Gen Active Recall & Spaced Repetition Engine</span>
          <ChevronRight className="w-3 h-3 text-primary/70" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.12] mb-6">
          Transform Static Notes Into{" "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Active Mastery
          </span>{" "}
          in Seconds
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
          Upload PDF textbooks, lecture slides, or syllabus outlines. StudyTest AI synthesizes{" "}
          <strong className="text-foreground font-semibold">adaptive diagnostic quizzes</strong>,{" "}
          <strong className="text-foreground font-semibold">SM-2 spaced repetition decks</strong>,{" "}
          <strong className="text-foreground font-semibold">interactive concept mind maps</strong>, and{" "}
          <strong className="text-foreground font-semibold">live multiplayer classroom polls</strong> — built to conquer the illusion of competence.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/95 hover:to-indigo-500 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Start Studying Free</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-sm text-foreground bg-muted/30 hover:bg-muted/60 border border-border/80 backdrop-blur-md hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <PlayCircle className="w-4 h-4 text-primary" />
            <span>Try Interactive Sandbox</span>
          </a>
        </div>

        {/* Live Metrics Proof Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <div className="glass-card p-4 rounded-2xl text-center border border-border/70 hover:border-primary/30 transition-colors">
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-1">
              100k+
            </div>
            <div className="text-xs font-medium text-muted-foreground">Questions Generated</div>
          </div>

          <div className="glass-card p-4 rounded-2xl text-center border border-border/70 hover:border-primary/30 transition-colors">
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-1">
              94.2%
            </div>
            <div className="text-xs font-medium text-muted-foreground">Long-Term Retention</div>
          </div>

          <div className="glass-card p-4 rounded-2xl text-center border border-border/70 hover:border-primary/30 transition-colors">
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1">
              &lt;1.5s
            </div>
            <div className="text-xs font-medium text-muted-foreground">AI Generation Latency</div>
          </div>

          <div className="glass-card p-4 rounded-2xl text-center border border-border/70 hover:border-primary/30 transition-colors">
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-1">
              SM-2 Math
            </div>
            <div className="text-xs font-medium text-muted-foreground">SuperMemo Spaced Repetition</div>
          </div>
        </div>

        {/* Hero Interactive Visual Dashboard Showcase */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glowing Border Wrapper */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-primary/40 via-indigo-500/20 to-transparent shadow-2xl shadow-primary/10">
            <div className="bg-card/90 dark:bg-[#0c0c12] rounded-[22px] p-4 sm:p-6 lg:p-8 border border-border/80 dark:border-white/5 overflow-hidden text-left shadow-2xl backdrop-blur-md">
              {/* Mock Window Title Bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-medium text-muted-foreground ml-2 hidden sm:inline-block">
                    studytest-ai.app • Neuroscience_Lecture_4.pdf
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  <Cpu className="w-3 h-3" />
                  <span>Dual AI Gateway Active</span>
                </div>
              </div>

              {/* Grid Content Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Card: Document Ingestion */}
                <div className="bg-muted/20 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Document Ingestion & OCR
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal mb-3">
                      High-fidelity PDF vectorization with native diagram extraction & math OCR.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[10px] flex justify-between text-muted-foreground">
                      <span>Synaptic_Transmission.pdf</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready (100%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-indigo-500 w-full" />
                    </div>
                  </div>
                </div>

                {/* Middle Card: Adaptive Quiz Question */}
                <div className="bg-muted/20 border border-primary/30 rounded-xl p-4 relative shadow-lg shadow-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Adaptive Question #4
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Medium
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground mb-3 leading-snug">
                    Which ion influx triggers the exocytosis of neurotransmitter vesicles at the presynaptic terminal?
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-muted-foreground">
                      A. Sodium (Na⁺)
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
                      <span>B. Calcium (Ca²⁺)</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40 border border-border/60 text-muted-foreground">
                      C. Potassium (K⁺)
                    </div>
                  </div>
                </div>

                {/* Right Card: Spaced Repetition Analytics */}
                <div className="bg-muted/20 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        SM-2 Memory Schedule
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> 7d Streak
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal mb-3">
                      Ease Factor: <span className="text-foreground font-semibold">2.60</span> (Next review in 6 days).
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                      🎯 Weakness Slaying Deck automatically queued for tomorrow!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
