"use client";

import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Heart } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const freeFeatures = [
    "Unlimited PDF & slide document vectorization (up to 20MB)",
    "Multi-provider AI inference (Google Gemini 2.5 & Groq Cloud)",
    "Full SuperMemo-2 (SM-2) Spaced Repetition with EF ≥ 1.3 clamping",
    "Adaptive Multiple Choice, True/False, and Short Answer grading",
    "Interactive Voice-to-Voice Oral Exam practice mode",
    "Dual-Speaker AI Audio Podcasts (100% free client-side synthesis)",
    "Diagnostic Heatmap Cockpit & 1-click Weakness Slaying decks",
    "Live classroom presentations & real-time multiplayer polling",
    "Mermaid.js concept mind maps & topology graphs",
    "Bring Your Own Key (BYOK) & local private Ollama support",
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>100% Free Forever</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Invest in Effortless Long-Term Retention
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            All active recall tools, algorithms, and AI study features are completely free. No subscriptions, hidden fees, or paywalls.
          </p>
        </div>

        {/* Single Premium Free Plan Card */}
        <div className="max-w-3xl mx-auto relative pt-3">
          {/* Top Pill - Placed in normal layout flow so it never gets clipped */}
          <div className="flex justify-center -mb-3.5 relative z-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-primary/30 border border-white/20 select-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Community Edition • All Features Included</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 sm:p-12 pt-10 sm:pt-12 border border-primary/30 shadow-2xl shadow-primary/10 bg-gradient-to-b from-card via-card to-primary/5 relative">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-border/70 mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                    Complete Study Suite
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Everything you need to master exams, technical certifications, and university courses.
                  </p>
                </div>
                <div className="flex items-baseline gap-1.5 flex-shrink-0">
                  <span className="text-4xl sm:text-5xl font-black text-foreground">$0</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    / Free Forever
                  </span>
                </div>
              </div>

              {/* 2-Column Features Grid */}
              <div className="mb-10">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Everything Included In Your Free Account:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {freeFeatures.map((feat) => (
                    <div key={feat} className="flex items-start gap-3 text-xs text-foreground">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button & Trust Note */}
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/95 hover:to-indigo-500 shadow-xl shadow-primary/30 hover:shadow-primary/45 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Start Studying Free Now</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Instant demo mode available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Open for all students
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
