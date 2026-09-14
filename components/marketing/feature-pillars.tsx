"use client";

import {
  Brain,
  Layers,
  Activity,
  Mic,
  Users2,
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Flame,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export function FeaturePillars() {
  const pillars = [
    {
      icon: Brain,
      tag: "Assessment Engine",
      title: "Multi-Format Cognitive Testing",
      description:
        "Generates 4 distinct question modalities: standard Multiple Choice, verification True/False, semantically graded Short Answers, and interactive Voice-to-Voice Oral Exams. Choose between Theory, Practical, or Mixed cognitive depth.",
      gradient: "from-blue-500/20 via-primary/20 to-purple-500/20",
      accent: "text-blue-400 border-blue-500/30",
      bullets: [
        "Defensive JSON parser prevents LLM markdown fence breakage",
        "Semantic short-answer AI grading with constructive advice",
        "Configurable exam time limits and question count (5–20 Qs)"
      ]
    },
    {
      icon: Layers,
      tag: "Memory Science",
      title: "SuperMemo-2 (SM-2) Spaced Repetition",
      description:
        "Implements the exact mathematical SM-2 interval algorithm with lower-bound Ease Factor clamping (EF ≥ 1.3). Mathematically guarantees review intervals expand optimally while preventing recall collapse during difficult retention cycles.",
      gradient: "from-purple-500/20 via-indigo-500/20 to-pink-500/20",
      accent: "text-purple-400 border-purple-500/30",
      bullets: [
        "Interactive 3D card flips with 6-tier recall grading (0–5)",
        "Automated daily review scheduling and streak counters",
        "Instant deck creation directly from uploaded PDF chapters"
      ]
    },
    {
      icon: Activity,
      tag: "Analytics & Remediation",
      title: "Diagnostic Cockpit & Weakness Slaying",
      description:
        "Every mistake is tagged across a conceptual taxonomy heatmap. The system pinpoints exact weak topics where retention falls below 70% and generates a 1-click targeted remedial study deck to conquer weaknesses immediately.",
      gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
      accent: "text-emerald-400 border-emerald-500/30",
      bullets: [
        "Real-time accuracy heatmaps across all study modules",
        "One-click targeted remediation question generator",
        "Progressive mastery badges and XP reward mechanics"
      ]
    },
    {
      icon: Mic,
      tag: "Audio Synthesis",
      title: "Zero-Cost Dual-Speaker AI Podcasts",
      description:
        "Synthesizes dynamic, dual-speaker AI podcast debates between a seasoned professor and an inquisitive student. Rendered entirely client-side on the device via the Web Speech API, eliminating all cloud TTS per-character API costs.",
      gradient: "from-amber-500/20 via-orange-500/20 to-yellow-500/20",
      accent: "text-amber-400 border-amber-500/30",
      bullets: [
        "Audio study companion for commutes, workouts, and multitasking",
        "Synchronized visual transcript with active speaker highlighting",
        "Native multi-language and voice timbre customization"
      ]
    },
    {
      icon: Users2,
      tag: "Live Multiplayer",
      title: "Serverless Classroom Presentation Polling",
      description:
        "Turn any study deck into a live interactive Kahoot/Mentimeter classroom session in one click. Students join with a 6-character room code on mobile and submit real-time responses with sub-1.5s live synchronized broadcast.",
      gradient: "from-rose-500/20 via-pink-500/20 to-indigo-500/20",
      accent: "text-rose-400 border-rose-500/30",
      bullets: [
        "Present slides with embedded live audience MCQs & polls",
        "Real-time aggregate voting distributions on presenter screen",
        "Zero stateful server infrastructure: pure serverless PostgreSQL"
      ]
    },
    {
      icon: Cpu,
      tag: "Gateway Architecture",
      title: "Universal Multi-Provider & BYOK Gateway",
      description:
        "Switch effortlessly between Google Gemini Cloud, Groq High-Speed Cloud, OpenAI ChatGPT, OpenRouter, or private local Ollama. Bring your own keys with automatic cloud fallback and zero vendor lock-in.",
      gradient: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20",
      accent: "text-cyan-400 border-cyan-500/30",
      bullets: [
        "Multi-cloud automatic failover prevents API outages",
        "Local Ollama support for private, offline zero-data-leak study",
        "Client cookies securely store user-specified custom API keys"
      ]
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Engineered for Maximum Retention</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Six Pillars of High-Efficacy Learning
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Every feature in StudyTest AI is designed around validated cognitive psychology principles: retrieval practice, spacing intervals, and active diagnostic feedback.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="glass-card rounded-3xl p-7 border border-border/80 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg shadow-black/5 relative overflow-hidden"
              >
                {/* Background Corner Glow */}
                <div
                  className={`absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br ${pillar.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                />

                <div>
                  {/* Icon & Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted/40 border ${pillar.accent}`}>
                      {pillar.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-2 pt-4 border-t border-border/60">
                  {pillar.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Bottom Banner */}
        <div className="mt-12 p-6 rounded-2xl glass-card border border-primary/20 bg-gradient-to-r from-primary/10 via-purple-600/5 to-indigo-600/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Want to see all six pillars in action?</div>
              <div className="text-xs text-muted-foreground">Upload any PDF document or try our instant interactive sandbox.</div>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 cursor-pointer transition-all whitespace-nowrap"
          >
            <span>Launch Free Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
