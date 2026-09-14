"use client";

import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const plans = [
    {
      name: "Student Starter",
      badge: "Free Forever",
      price: "$0",
      period: "forever",
      description: "Ideal for self-studying students and individual exam preparation.",
      buttonText: "Start Studying Free",
      buttonVariant: "secondary",
      popular: false,
      features: [
        "Unlimited PDF & slide document uploads (20MB)",
        "Google Gemini 2.5 & Groq Cloud inference",
        "Adaptive Multiple Choice & True/False quizzes",
        "Full SuperMemo-2 (SM-2) spaced repetition",
        "Interactive Mermaid concept mind maps",
        "Bring Your Own Key (BYOK) & local Ollama",
      ],
    },
    {
      name: "Scholar Pro",
      badge: "Most Popular",
      price: "$9",
      period: "per month",
      description: "Full active recall suite with voice exams, audio podcasts, and diagnostics.",
      buttonText: "Get Scholar Pro",
      buttonVariant: "primary",
      popular: true,
      features: [
        "Everything in Student Starter",
        "AI Semantic Short-Answer grading & tips",
        "Interactive Voice-to-Voice Oral Exam mode",
        "Unlimited Dual-Speaker AI audio podcast debates",
        "Diagnostic Cockpit & 1-click Weakness Slaying",
        "Advanced retention heatmaps & streak multipliers",
        "Priority multi-cloud routing & zero rate limits",
      ],
    },
    {
      name: "Campus & Educator",
      badge: "For Instructors",
      price: "$29",
      period: "per month",
      description: "Live classroom presentations, student cohort diagnostics, and shared decks.",
      buttonText: "Launch Classroom",
      buttonVariant: "secondary",
      popular: false,
      features: [
        "Everything in Scholar Pro",
        "Live interactive presentation deck builder",
        "Real-time multiplayer classroom polling (Unlimited seats)",
        "Sub-1.5s serverless room code synchronization",
        "Classroom accuracy analytics & CSV export",
        "Shared departmental question & flashcard banks",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Invest in Effortless Long-Term Retention
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Free forever for personal study, or bring your own API keys for unlimited zero-cost high-volume inference.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? "border-primary/80 shadow-2xl shadow-primary/15 bg-gradient-to-b from-card via-card to-primary/5 lg:-translate-y-2"
                  : "border-border/80 hover:border-primary/40 shadow-lg shadow-black/5"
              }`}
            >
              {/* Popular Glowing Pill */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md shadow-primary/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                {/* Plan Title & Tag */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-extrabold text-foreground">{plan.name}</h3>
                  {!plan.popular && (
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-border/60">
                  <span className="text-4xl font-black text-foreground">{plan.price}</span>
                  <span className="text-xs font-semibold text-muted-foreground">/{plan.period}</span>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Included Features:
                  </div>
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/login"
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-muted/40 text-foreground hover:bg-muted/70 border border-border/80 hover:border-primary/40"
                }`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
