"use client";

import Link from "next/link";
import { GraduationCap, Code2, Heart, ShieldCheck, Globe, ExternalLink } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/80 bg-[#07070a] text-muted-foreground pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-border/60">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md shadow-primary/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                StudyTest <span className="text-primary font-black">AI</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              The AI-Powered Active Recall Operating System. Transforming static lecture notes, slides, and textbooks into adaptive quizzes, spaced repetition memory decks, and live classroom polls.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All AI Pipelines Operational</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-foreground">
              Product
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#demo" className="hover:text-foreground transition-colors">
                  Interactive Sandbox
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Adaptive Quizzes
                </a>
              </li>
              <li>
                <a href="#sm2" className="hover:text-foreground transition-colors">
                  Spaced Repetition
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors text-primary font-semibold">
                  Launch Studio →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Science & Math */}
          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-foreground">
              Science & Math
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#sm2" className="hover:text-foreground transition-colors">
                  SuperMemo-2 (SM-2)
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Diagnostic Heatmaps
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-foreground transition-colors">
                  Active Recall Psychology
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-foreground transition-colors">
                  Weakness Slaying
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Engineering */}
          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-foreground">
              Engineering
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/HarshLileshShah/studytest-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-foreground transition-colors">
                  Defensive JSON Parser
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-foreground transition-colors">
                  Multi-Cloud Gateway
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  BYOK & Ollama Docs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} StudyTest AI. Built for the Zamp Finance Engineering Project Round.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/HarshLileshShah/studytest-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4 text-primary" />
              <span>Source Code</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
