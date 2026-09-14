"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCw,
  Layers,
  BrainCircuit,
  Radio,
  Users,
  Play,
  Pause,
  HelpCircle,
  Flame,
  Volume2,
  Calculator,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import { calculateSM2 } from "@/lib/sm2";

export function InteractiveSandbox() {
  const [activeTab, setActiveTab] = useState<"quiz" | "flashcard" | "mindmap" | "podcast" | "multiplayer">("quiz");

  // --- TAB 1: QUIZ STATE ---
  const quizQuestions = [
    {
      subject: "Neurobiology",
      question: "Which neurotransmitter is primarily synthesized in the Substantia Nigra and plays a critical role in motor control and reward pathways?",
      options: [
        "Acetylcholine",
        "Dopamine",
        "Gamma-Aminobutyric Acid (GABA)",
        "Serotonin"
      ],
      correctIndex: 1,
      explanation: "Dopamine is synthesized by dopaminergic neurons in the Substantia Nigra pars compacta. Degeneration of these neurons is the hallmark pathophysiology of Parkinson's Disease.",
      topic: "Basal Ganglia Circuitry",
      difficulty: "Medium",
    },
    {
      subject: "Computer Science",
      question: "In distributed consensus, what property does the Raft algorithm guarantee when a Leader node receives a majority of acknowledgments from followers for a log entry?",
      options: [
        "Eventual Liveness",
        "Log Matching & Commit Safety",
        "Byzantine Fault Tolerance",
        "Zero-Latency Propagation"
      ],
      correctIndex: 1,
      explanation: "Once a log entry is replicated on a majority of nodes in Raft, it is considered committed and guaranteed never to be overwritten by any future leader election.",
      topic: "Distributed Systems",
      difficulty: "Hard",
    },
  ];

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // --- TAB 2: FLASHCARD SM-2 STATE ---
  const [cardFlipped, setCardFlipped] = useState(false);
  const [sm2State, setSm2State] = useState({
    repetitions: 1,
    interval: 6,
    easeFactor: 2.5,
    lastQuality: 4,
  });

  const handleSM2Rate = (quality: number) => {
    const result = calculateSM2(
      quality,
      sm2State.repetitions,
      sm2State.interval,
      sm2State.easeFactor
    );
    setSm2State({
      repetitions: result.repetitions,
      interval: result.interval,
      easeFactor: Number(result.easeFactor.toFixed(2)),
      lastQuality: quality,
    });
    setCardFlipped(false);
  };

  // --- TAB 4: PODCAST STATE ---
  const [podcastPlaying, setPodcastPlaying] = useState(false);
  const [podcastTime, setPodcastTime] = useState(14);

  // --- TAB 5: MULTIPLAYER STATE ---
  const [pollVotes, setPollVotes] = useState({ A: 18, B: 42, C: 8, D: 4 });
  const [userVoted, setUserVoted] = useState<string | null>(null);

  const handleVote = (option: "A" | "B" | "C" | "D") => {
    if (userVoted) return;
    setUserVoted(option);
    setPollVotes((prev) => ({ ...prev, [option]: prev[option] + 1 }));
  };

  return (
    <section id="demo" className="py-20 md:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Login Live Playground</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Experience the Engine Live
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Test our core active recall components right now in your browser — no account, credit card, or configuration required.
          </p>
        </div>

        {/* Playground Container */}
        <div className="glass-card rounded-3xl border border-border/80 shadow-2xl overflow-hidden backdrop-blur-xl bg-card/60">
          {/* Top Mode Selector Tabs */}
          <div className="flex border-b border-border/70 overflow-x-auto scrollbar-none bg-muted/30 p-2 gap-1.5">
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Adaptive Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab("flashcard")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === "flashcard"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>SM-2 Spaced Repetition</span>
            </button>

            <button
              onClick={() => setActiveTab("mindmap")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === "mindmap"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Concept Mind Map</span>
            </button>

            <button
              onClick={() => setActiveTab("podcast")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === "podcast"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>AI Audio Podcast</span>
            </button>

            <button
              onClick={() => setActiveTab("multiplayer")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === "multiplayer"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Live Classroom Poll</span>
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="p-6 sm:p-8 lg:p-10 min-h-[460px] flex flex-col justify-center">
            {/* ========================================================================= */}
            {/* TAB 1: ADAPTIVE QUIZ */}
            {/* ========================================================================= */}
            {activeTab === "quiz" && (
              <div className="max-w-3xl mx-auto w-full">
                {/* Subject Selector & Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Sample Syllabus:</span>
                    <button
                      onClick={() => {
                        setSelectedQuestionIndex(0);
                        setSelectedOption(null);
                        setSubmitted(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selectedQuestionIndex === 0
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Neurobiology
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuestionIndex(1);
                        setSelectedOption(null);
                        setSubmitted(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selectedQuestionIndex === 1
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Distributed Systems
                    </button>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                    {quizQuestions[selectedQuestionIndex].topic} • {quizQuestions[selectedQuestionIndex].difficulty}
                  </span>
                </div>

                {/* Question Statement */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                    {quizQuestions[selectedQuestionIndex].question}
                  </h3>
                </div>

                {/* Option Cards */}
                <div className="space-y-3 mb-6">
                  {quizQuestions[selectedQuestionIndex].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === quizQuestions[selectedQuestionIndex].correctIndex;
                    let style = "bg-muted/20 border-border/80 text-foreground hover:border-primary/50 hover:bg-muted/40";

                    if (submitted) {
                      if (isCorrect) {
                        style = "bg-emerald-500/15 border-emerald-500/60 text-emerald-700 dark:text-emerald-300 font-semibold";
                      } else if (isSelected && !isCorrect) {
                        style = "bg-red-500/15 border-red-500/60 text-red-700 dark:text-red-300";
                      } else {
                        style = "bg-muted/10 border-border/40 text-muted-foreground opacity-60";
                      }
                    } else if (isSelected) {
                      style = "bg-primary/15 border-primary text-primary font-semibold shadow-md shadow-primary/10";
                    }

                    return (
                      <button
                        key={opt}
                        disabled={submitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full p-4 rounded-xl border text-left text-sm flex items-center justify-between transition-all duration-200 cursor-pointer ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-background/50 flex items-center justify-center font-bold text-xs">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                        {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback / Submit Panel */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  {!submitted ? (
                    <button
                      disabled={selectedOption === null}
                      onClick={() => setSubmitted(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/25 cursor-pointer transition-all"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="w-full p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                      <div>
                        <div className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Diagnostic Explanation:</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {quizQuestions[selectedQuestionIndex].explanation}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOption(null);
                          setSubmitted(false);
                        }}
                        className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-muted/60 hover:bg-muted border border-border text-foreground transition-colors cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: SM-2 FLASHCARD */}
            {/* ========================================================================= */}
            {activeTab === "flashcard" && (
              <div className="max-w-2xl mx-auto w-full text-center">
                {/* Math Telemetry HUD */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="glass-card p-3 rounded-xl border border-border/70">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                      Repetitions
                    </div>
                    <div className="text-xl font-extrabold text-foreground">{sm2State.repetitions}</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl border border-border/70">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                      Next Review Interval
                    </div>
                    <div className="text-xl font-extrabold text-primary">{sm2State.interval} Days</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl border border-border/70">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                      Ease Factor (EF)
                    </div>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{sm2State.easeFactor}</div>
                  </div>
                </div>

                {/* 3D Flip Card Container */}
                <div
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className="w-full min-h-56 rounded-2xl p-6 bg-gradient-to-br from-card to-muted/40 border border-primary/30 shadow-xl flex flex-col justify-between cursor-pointer hover:border-primary/60 transition-all duration-300 relative group select-none"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span className="text-primary font-semibold">SuperMemo-2 (SM-2) Spaced Repetition</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <RotateCw className="w-3.5 h-3.5" /> Click to Flip
                    </span>
                  </div>

                  <div className="py-2">
                    {!cardFlipped ? (
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                          Front (Prompt)
                        </div>
                        <h4 className="text-lg font-bold text-foreground">
                          What is the critical lower bound clamp for the SM-2 Ease Factor (EF), and why is it necessary?
                        </h4>
                      </div>
                    ) : (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 font-bold">
                          Back (Answer)
                        </div>
                        <p className="text-sm font-medium text-foreground leading-relaxed max-w-md mx-auto">
                          The lower bound is clamped at <strong className="text-emerald-700 dark:text-emerald-300 font-bold">EF ≥ 1.3</strong>.
                          Without this mathematical floor, repeated difficult recall attempts cause ease factor degradation, leading to interval collapse and permanent review congestion.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-muted-foreground">
                    {!cardFlipped ? "Tap card to reveal answer and update mathematical interval" : "Grade your recall quality below to calculate next interval"}
                  </div>
                </div>

                {/* SuperMemo-2 Quality Grading Buttons */}
                <div className="mt-6">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">
                    Grade Recall Quality (0 = Total Blackout, 5 = Instant Recall):
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { q: 0, label: "0 (Blackout)", color: "hover:bg-red-500/20 text-red-600 dark:text-red-400" },
                      { q: 1, label: "1 (Failed)", color: "hover:bg-red-500/20 text-red-600 dark:text-red-300" },
                      { q: 2, label: "2 (Hard)", color: "hover:bg-amber-500/20 text-amber-700 dark:text-amber-300" },
                      { q: 3, label: "3 (Pass)", color: "hover:bg-blue-500/20 text-blue-700 dark:text-blue-300" },
                      { q: 4, label: "4 (Good)", color: "hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
                      { q: 5, label: "5 (Mastery)", color: "hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
                    ].map((item) => (
                      <button
                        key={item.q}
                        onClick={() => handleSM2Rate(item.q)}
                        className={`p-2.5 rounded-xl border border-border/80 bg-muted/20 font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${item.color}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: CONCEPT MIND MAP */}
            {/* ========================================================================= */}
            {activeTab === "mindmap" && (
              <div className="max-w-3xl mx-auto w-full text-center">
                <div className="p-6 rounded-2xl bg-card dark:bg-[#09090e] border border-border/80 relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4" /> Mermaid.js Concept Topology Graph
                    </span>
                    <span className="text-[10px] text-muted-foreground">Auto-extracted from PDF Chapters</span>
                  </div>

                  {/* Visual Node Graph Simulation */}
                  <div className="py-6 flex flex-col items-center justify-center gap-4">
                    {/* Root Node */}
                    <div className="px-5 py-2.5 rounded-xl bg-primary/20 border border-primary text-primary font-bold text-xs shadow-lg shadow-primary/20 animate-pulse">
                      ⚡ Action Potential Generation
                    </div>

                    <div className="w-0.5 h-6 bg-primary/40" />

                    {/* Level 2 Nodes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div className="p-3 rounded-xl bg-muted/40 border border-border hover:border-purple-500 transition-colors text-left">
                        <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">1. Depolarization</div>
                        <div className="text-[10px] text-muted-foreground">Voltage-gated Na⁺ channels open rapidly.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border hover:border-indigo-500 transition-colors text-left">
                        <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">2. Repolarization</div>
                        <div className="text-[10px] text-muted-foreground">Delayed rectifier K⁺ channels efflux ions.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border hover:border-emerald-500 transition-colors text-left">
                        <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-1">3. Refractory Period</div>
                        <div className="text-[10px] text-muted-foreground">Inactivation gates enforce unidirectional flow.</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                    💡 Click any concept node in the app to immediately synthesize targeted 5-question remedial quizzes.
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: AI AUDIO PODCAST */}
            {/* ========================================================================= */}
            {activeTab === "podcast" && (
              <div className="max-w-2xl mx-auto w-full text-left">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-primary/20 shadow-xl">
                  {/* Player Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                        🎙️ AI
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          Dual-Host Debate: The Quantum Hall Effect
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Host 1 (Dr. Aris AI) vs. Host 2 (Curious Maya AI)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      00:{podcastTime < 10 ? `0${podcastTime}` : podcastTime} / 03:45
                    </span>
                  </div>

                  {/* Simulated Waveform */}
                  <div className="flex items-center gap-1.5 h-10 my-4 px-2 bg-muted/30 rounded-xl border border-border/60">
                    {[40, 60, 25, 90, 75, 45, 100, 30, 80, 65, 50, 85, 30, 95, 70, 40, 60, 80, 35, 90, 45, 60].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          podcastPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                        }`}
                        style={{ height: `${podcastPlaying ? h : 25}%` }}
                      />
                    ))}
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setPodcastPlaying(!podcastPlaying)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 cursor-pointer transition-all"
                    >
                      {podcastPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      <span>{podcastPlaying ? "Pause Audio" : "Play Dual-Host Audio"}</span>
                    </button>

                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Zero Cloud TTS Fees (Synthesized Client-Side)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: MULTIPLAYER CLASSROOM */}
            {/* ========================================================================= */}
            {activeTab === "multiplayer" && (
              <div className="max-w-2xl mx-auto w-full text-left">
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xl">
                  {/* Live Room Header */}
                  <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-foreground">Room: #BIO-409</span>
                      <span className="text-[10px] text-muted-foreground">(72 Students Connected)</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Sub-1.5s Live Sync
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground mb-4">
                    Live Poll: What is the rate-limiting enzyme in Glycolysis?
                  </h4>

                  {/* Live Response Bars */}
                  <div className="space-y-2.5 mb-6">
                    {[
                      { key: "A" as const, text: "Hexokinase", count: pollVotes.A, color: "bg-blue-500" },
                      { key: "B" as const, text: "Phosphofructokinase-1 (PFK-1)", count: pollVotes.B, color: "bg-emerald-500" },
                      { key: "C" as const, text: "Pyruvate Kinase", count: pollVotes.C, color: "bg-amber-500" },
                      { key: "D" as const, text: "Aldolase", count: pollVotes.D, color: "bg-purple-500" },
                    ].map((opt) => {
                      const total = pollVotes.A + pollVotes.B + pollVotes.C + pollVotes.D;
                      const pct = Math.round((opt.count / total) * 100);
                      const isVoted = userVoted === opt.key;

                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleVote(opt.key)}
                          className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer relative overflow-hidden ${
                            isVoted
                              ? "border-primary bg-primary/10 font-bold"
                              : "border-border/70 bg-muted/20 hover:border-primary/40"
                          }`}
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 opacity-15 transition-all duration-500 ${opt.color}`}
                            style={{ width: `${pct}%` }}
                          />
                          <div className="flex items-center justify-between relative z-10">
                            <span className="flex items-center gap-2">
                              <span className="font-bold">{opt.key}.</span> {opt.text}
                            </span>
                            <span className="font-bold text-muted-foreground">{pct}% ({opt.count})</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-center text-muted-foreground">
                    {userVoted ? "✅ Your vote has been broadcasted to the presenter screen!" : "👆 Click any option above to simulate cast of a live student vote."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
