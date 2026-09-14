"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the SuperMemo-2 (SM-2) spaced repetition algorithm work?",
      answer:
        "When you review a flashcard and grade your recall quality from 0 (blackout) to 5 (perfect recall), the algorithm calculates your next review interval and adjusts the card's Ease Factor (EF). Crucially, StudyTest AI clamps the Ease Factor to EF ≥ 1.3 to avoid 'interval collapse'—a common bug in naive implementations where difficult cards become permanently congested.",
    },
    {
      question: "Can I bring my own API keys (Google Gemini, Groq, OpenAI, Ollama)?",
      answer:
        "Yes! StudyTest AI supports full Bring Your Own Key (BYOK) architecture. You can configure your own Google Gemini, Groq, OpenAI, OpenRouter, or local offline Ollama endpoint in the in-app Settings modal. Your custom keys are securely stored in your browser session cookies and are never shared or logged.",
    },
    {
      question: "Does it support complex mathematical equations and scanned PDFs?",
      answer:
        "Yes. Our document ingestion pipeline uses native multimodal visual OCR. If your PDF contains handwritten lecture notes, biochemical reaction diagrams, or LaTeX mathematical formulas, the vision pipeline extracts the full semantic context accurately before quiz compilation.",
    },
    {
      question: "How do Dual-Speaker AI Podcasts work with zero cloud fees?",
      answer:
        "Unlike traditional apps that charge expensive per-character cloud Text-to-Speech (TTS) API fees, StudyTest AI compiles an intelligent conversational script and synthesizes dual-host audio directly on your device using the browser's native Web Speech API. It runs 100% free with zero cloud TTS latency.",
    },
    {
      question: "How does live multiplayer classroom polling work on serverless infrastructure?",
      answer:
        "Presenters create interactive slide decks with embedded poll questions. When students enter the 6-character room code on their mobile devices, responses are recorded and aggregated via lightweight serverless RPC actions in under 1.5 seconds, eliminating the need for expensive stateful WebSocket servers.",
    },
    {
      question: "Is my study material private and secure?",
      answer:
        "Yes. All uploaded documents, generated question banks, spaced repetition schedules, and quiz attempts are strictly scoped to your authenticated user ID in our PostgreSQL database protected by server-side authentication.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 relative scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Everything you need to know about StudyTest AI algorithms, privacy, and BYOK capabilities.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="glass-card rounded-2xl border border-border/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors cursor-pointer select-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
