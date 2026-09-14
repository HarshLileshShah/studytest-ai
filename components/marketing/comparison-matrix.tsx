"use client";

import { Check, X, Sparkles, Scale } from "lucide-react";

export function ComparisonMatrix() {
  const rows = [
    {
      feature: "Instant PDF / Slide Document Vectorization",
      studytest: true,
      anki: false,
      chatgpt: "Manual Copy-Paste",
      kahoot: false,
    },
    {
      feature: "Mathematical SuperMemo-2 (SM-2) Spaced Repetition",
      studytest: true,
      anki: true,
      chatgpt: false,
      kahoot: false,
    },
    {
      feature: "AI Semantic Feedback on Short Answers & Oral Exams",
      studytest: true,
      anki: false,
      chatgpt: true,
      kahoot: false,
    },
    {
      feature: "Diagnostic Cockpit & 1-Click Weakness Slaying",
      studytest: true,
      anki: false,
      chatgpt: false,
      kahoot: false,
    },
    {
      feature: "Client-Side Zero-Cost Dual-Speaker AI Podcasts",
      studytest: true,
      anki: false,
      chatgpt: false,
      kahoot: false,
    },
    {
      feature: "Live Multiplayer Classroom Presentations & Polling",
      studytest: true,
      anki: false,
      chatgpt: false,
      kahoot: true,
    },
    {
      feature: "Multi-Provider BYOK (Gemini, Groq, OpenAI, Ollama)",
      studytest: true,
      anki: false,
      chatgpt: false,
      kahoot: false,
    },
  ];

  return (
    <section id="comparison" className="py-20 md:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Why StudyTest AI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Unified Active Recall vs. Fragmented Tools
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Stop switching between five different disconnected apps. StudyTest AI unifies ingestion, testing, spaced repetition, and live presentation in one cohesive ecosystem.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="glass-card rounded-3xl border border-border/80 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30">
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground w-2/5">
                    Feature Capability
                  </th>
                  <th className="py-5 px-6 text-sm font-extrabold text-primary bg-primary/10 border-x border-primary/20 text-center w-1/5">
                    <div className="flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>StudyTest AI</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center w-1/5">
                    Anki / Quizlet
                  </th>
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center w-1/5">
                    Generic ChatGPT
                  </th>
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center w-1/5">
                    Kahoot
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {rows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={`hover:bg-muted/20 transition-colors ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-muted/5"
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-foreground">
                      {row.feature}
                    </td>

                    {/* StudyTest AI Column (Highlighted) */}
                    <td className="py-4 px-6 bg-primary/5 border-x border-primary/20 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                    </td>

                    {/* Anki */}
                    <td className="py-4 px-6 text-center text-muted-foreground">
                      {typeof row.anki === "boolean" ? (
                        row.anki ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        <span>{row.anki}</span>
                      )}
                    </td>

                    {/* ChatGPT */}
                    <td className="py-4 px-6 text-center text-muted-foreground">
                      {typeof row.chatgpt === "boolean" ? (
                        row.chatgpt ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">{row.chatgpt}</span>
                      )}
                    </td>

                    {/* Kahoot */}
                    <td className="py-4 px-6 text-center text-muted-foreground">
                      {typeof row.kahoot === "boolean" ? (
                        row.kahoot ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        <span>{row.kahoot}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
