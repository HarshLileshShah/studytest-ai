"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  Code,
  Layout,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Volume2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Music,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { SpeechButton } from "@/components/ui/speech-button";
import { MarkdownText } from "@/components/ui/markdown-text";
import { Mermaid } from "@/components/ui/mermaid";
import { getDocumentMindMap, getDocumentPodcastLecture } from "@/app/actions/document.actions";
import { createFlashcardFromHighlightAction } from "@/app/actions/flashcard.actions";
import { cn } from "@/lib/utils";

// ─── Utility Parsers ──────────────────────────────────────────

// Dialogue Podcast script parser
function parsePodcastScript(scriptText: string) {
  const lines = scriptText.split("\n");
  const turns: { speaker: "Alex" | "Taylor"; text: string }[] = [];
  let currentSpeaker: "Alex" | "Taylor" | null = null;
  let currentText = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const alexMatch = line.match(/^\[Alex\]:\s*(.*)/i);
    const taylorMatch = line.match(/^\[Taylor\]:\s*(.*)/i);

    if (alexMatch) {
      if (currentSpeaker && currentText) {
        turns.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = "Alex";
      currentText = alexMatch[1];
    } else if (taylorMatch) {
      if (currentSpeaker && currentText) {
        turns.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = "Taylor";
      currentText = taylorMatch[1];
    } else {
      if (currentSpeaker) {
        currentText += " " + line;
      }
    }
  }

  if (currentSpeaker && currentText) {
    turns.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return turns;
}

// Mermaid mindmap node parser
function parseMermaidChart(chartText: string) {
  const lines = chartText.split("\n");
  const nodes: { id: string; label: string }[] = [];
  const connections: { from: string; to: string }[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Matches: NodeId["Concept Label"]
    const nodeMatch = line.match(/^([a-zA-Z0-9_-]+)\["([^"]+)"\]/);
    if (nodeMatch) {
      nodes.push({ id: nodeMatch[1], label: nodeMatch[2] });
      continue;
    }

    // Matches: Node1 --> Node2
    const connMatch = line.match(/^([a-zA-Z0-9_-]+)\s*-->\s*([a-zA-Z0-9_-]+)/);
    if (connMatch) {
      connections.push({ from: connMatch[1], to: connMatch[2] });
    }
  }

  return { nodes, connections };
}

// ─── Component ────────────────────────────────────────────────

interface DocumentTabsProps {
  documentId: string;
  documentTitle: string;
  extractedText: string;
  initialVisualOutline: string | null;
}

export function DocumentTabs({
  documentId,
  documentTitle,
  extractedText,
  initialVisualOutline,
}: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState<"text" | "mindmap" | "podcast">("text");
  const [diagram, setDiagram] = useState<string | null>(initialVisualOutline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");

  const [selectedText, setSelectedText] = useState("");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFullText, setShowFullText] = useState(false);

  // Concept Map Explorer states
  const [selectedConceptNode, setSelectedConceptNode] = useState<{ id: string; label: string } | null>(null);

  // Podcast Audio Lecture states
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [parsedPodcastTurns, setParsedPodcastTurns] = useState<{ speaker: "Alex" | "Taylor"; text: string }[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(-1);
  const currentTurnIndexRef = useRef<number>(-1);
  const [podcastSpeed, setPodcastSpeed] = useState<number>(1);
  const [loadingPodcast, setLoadingPodcast] = useState(false);
  const [podcastError, setPodcastError] = useState("");
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [isPodcastPaused, setIsPodcastPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedAlexVoiceName, setSelectedAlexVoiceName] = useState<string>("");
  const [selectedTaylorVoiceName, setSelectedTaylorVoiceName] = useState<string>("");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeTurnRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcript to active turn
  useEffect(() => {
    if (currentTurnIndex >= 0 && activeTurnRef.current) {
      activeTurnRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentTurnIndex]);

  // Load SpeechSynthesis API
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const updateVoicesList = () => {
    const synth = synthRef.current;
    if (!synth) return;
    const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
    setAvailableVoices(voices);
    if (voices.length > 0) {
      if (!selectedAlexVoiceName) {
        const maleVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes("male") ||
            v.name.toLowerCase().includes("david") ||
            v.name.toLowerCase().includes("google us english")
        );
        setSelectedAlexVoiceName(maleVoice ? maleVoice.name : voices[0].name);
      }
      if (!selectedTaylorVoiceName) {
        const femaleVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("susan") ||
            v.name.toLowerCase().includes("google uk english female")
        );
        setSelectedTaylorVoiceName(femaleVoice ? femaleVoice.name : (voices[1] || voices[0]).name);
      }
    }
  };

  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;

    updateVoicesList();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoicesList;
    }
  }, [podcastScript]);

  // Parse podcast turns whenever the script updates
  useEffect(() => {
    if (podcastScript) {
      const turns = parsePodcastScript(podcastScript);
      setParsedPodcastTurns(turns);
    }
  }, [podcastScript]);

  const handleGenerateMindMap = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getDocumentMindMap(documentId);
      if (res.success && res.diagram) {
        setDiagram(res.diagram);
        setSelectedConceptNode(null);
      } else {
        setError(res.error || "Failed to generate visual mind-map.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelection = () => {
    if (typeof window === "undefined" || activeTab !== "text") return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText("");
      setTooltipPos(null);
      return;
    }

    const text = selection.toString().trim();
    const container = containerRef.current;
    if (text.length > 5 && container && container.contains(selection.anchorNode)) {
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setTooltipPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 45,
      });
    } else {
      setSelectedText("");
      setTooltipPos(null);
    }
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleTextSelection);
    return () => {
      document.removeEventListener("selectionchange", handleTextSelection);
    };
  }, [activeTab]);

  const handleGenerateFlashcard = async () => {
    if (!selectedText || isGeneratingCard) return;
    setIsGeneratingCard(true);
    setError("");

    try {
      const res = await createFlashcardFromHighlightAction(documentId, selectedText);
      if (res.success) {
        setSuccessMessage("Flashcard added directly to your deck!");
        setSelectedText("");
        setTooltipPos(null);
        if (typeof window !== "undefined") {
          window.getSelection()?.removeAllRanges();
        }
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setError(res.error || "Failed to generate flashcard from selection.");
      }
    } catch (e) {
      setError("An unexpected error occurred during flashcard generation.");
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleAskTutor = () => {
    if (!selectedText) return;
    const event = new CustomEvent("ask-tutor-quote", { detail: selectedText });
    window.dispatchEvent(event);
    setSelectedText("");
    setTooltipPos(null);
    if (typeof window !== "undefined") {
      window.getSelection()?.removeAllRanges();
    }
  };

  const loadPodcastLecture = async () => {
    if (podcastScript) return;
    setLoadingPodcast(true);
    setPodcastError("");

    try {
      const res = await getDocumentPodcastLecture(documentId);
      if (res.success && res.script) {
        setPodcastScript(res.script);
      } else {
        setPodcastError(res.error || "Failed to load audio lecture script.");
      }
    } catch (err) {
      setPodcastError("An unexpected error occurred loading your audio lecture.");
    } finally {
      setLoadingPodcast(false);
    }
  };

  useEffect(() => {
    if (activeTab === "podcast") {
      loadPodcastLecture();
    }
  }, [activeTab]);

  // Dialogue-based speech synthesizer play script
  const playPodcastTurn = (index: number) => {
    const synth = synthRef.current;
    if (!synth || index >= parsedPodcastTurns.length) {
      setIsPodcastPlaying(false);
      setIsPodcastPaused(false);
      setCurrentTurnIndex(-1);
      currentTurnIndexRef.current = -1;
      return;
    }

    currentTurnIndexRef.current = index;
    setCurrentTurnIndex(index);

    const turn = parsedPodcastTurns[index];
    const cleanText = turn.text.replace(/[\*\_]/g, "").trim();
    if (!cleanText) {
      // Empty text turn, skip to next
      playPodcastTurn(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Dynamic speaker voice mapping
    let voice: SpeechSynthesisVoice | undefined;
    if (turn.speaker === "Alex") {
      voice = availableVoices.find((v) => v.name === selectedAlexVoiceName);
    } else {
      voice = availableVoices.find((v) => v.name === selectedTaylorVoiceName);
    }

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = podcastSpeed;
    utteranceRef.current = utterance;

    utterance.onend = () => {
      playPodcastTurn(index + 1);
    };

    utterance.onerror = (e) => {
      console.error("Audio dialogue playback issue:", e);
      setIsPodcastPlaying(false);
      setIsPodcastPaused(false);
      setCurrentTurnIndex(-1);
      currentTurnIndexRef.current = -1;
    };

    synth.speak(utterance);
    setIsPodcastPlaying(true);
    setIsPodcastPaused(false);
  };

  const handlePlayPodcast = () => {
    const synth = synthRef.current;
    if (!synth || parsedPodcastTurns.length === 0) return;

    if (isPodcastPaused) {
      synth.resume();
      setIsPodcastPaused(false);
      setIsPodcastPlaying(true);
      return;
    }

    synth.cancel();

    setTimeout(() => {
      playPodcastTurn(0);
    }, 100);
  };

  const handlePausePodcast = () => {
    const synth = synthRef.current;
    if (synth && isPodcastPlaying) {
      synth.pause();
      setIsPodcastPaused(true);
      setIsPodcastPlaying(false);
    }
  };

  const handleStopPodcast = () => {
    const synth = synthRef.current;
    if (synth) {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
      }
      synth.cancel();
      setIsPodcastPaused(false);
      setIsPodcastPlaying(false);
      setCurrentTurnIndex(-1);
      currentTurnIndexRef.current = -1;
    }
  };

  // Triggers concept-based action in the Chat panel
  const handleConceptTutorQuery = (action: "explain" | "quiz") => {
    if (!selectedConceptNode) return;
    const detailText =
      action === "explain"
        ? `Can you explain the concept of "${selectedConceptNode.label}" from this document in detail?`
        : `Can you generate a quiz question about the concept "${selectedConceptNode.label}" from this document to test my knowledge?`;

    const event = new CustomEvent("ask-tutor-quote", { detail: detailText });
    window.dispatchEvent(event);
  };

  // Parse mind-map details
  const parsedMindMap = diagram ? parseMermaidChart(diagram) : { nodes: [], connections: [] };

  return (
    <div className="space-y-4 relative" ref={containerRef}>
      {/* Custom Premium Tabs Bar */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab("text")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 cursor-pointer",
            activeTab === "text"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Text Outline
        </button>
        <button
          onClick={() => setActiveTab("mindmap")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 cursor-pointer",
            activeTab === "mindmap"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Visual Mind-Map
        </button>
        <button
          onClick={() => setActiveTab("podcast")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 cursor-pointer",
            activeTab === "podcast"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          AI Audio Lecture
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === "text" ? (
        <div className="glass-card p-6 animate-fade-in">
          {successMessage && (
            <div className="p-3 mb-4 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-1.5 animate-fade-in select-none">
              <CheckCircle2 className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Extracted Text
            </span>
            <SpeechButton text={showFullText ? extractedText : extractedText.slice(0, 3000)} className="cursor-pointer" />
          </h2>
          <div className="max-h-[500px] overflow-y-auto rounded-lg bg-muted/50 p-4 border border-border">
            <MarkdownText text={showFullText ? extractedText : extractedText.slice(0, 3000)} />
            {extractedText.length > 3000 && (
              <div className="mt-4 flex items-center justify-between gap-4 select-none border-t border-border/40 pt-3">
                <span className="text-xs text-muted-foreground">
                  {showFullText ? "Showing all" : "Showing first 3,000"} of {extractedText.length.toLocaleString()} characters
                </span>
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer select-none"
                >
                  {showFullText ? "Show Less" : "Read Full Content"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "mindmap" ? (
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Concept Mind-Map Outline
            </h2>

            {diagram && !loading && (
              <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/40 text-xs">
                <button
                  onClick={() => setViewMode("visual")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                    viewMode === "visual"
                      ? "bg-primary text-white shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Layout className="w-3.5 h-3.5" />
                  Visual Map
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                    viewMode === "code"
                      ? "bg-primary text-white shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Code className="w-3.5 h-3.5" />
                  Mermaid Syntax
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {!diagram && !loading ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">Visualize concepts at a glance</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                Let AI extract core terms from this document and structure them into an interactive visual flowchart.
              </p>
              <button
                onClick={handleGenerateMindMap}
                className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4 cursor-pointer"
              >
                Generate Mind-Map
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-medium">AI is structuring outline relationships...</span>
            </div>
          ) : viewMode === "visual" && diagram ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mermaid Diagram Area */}
              <div className="lg:col-span-2 space-y-4">
                <Mermaid chart={diagram} title={documentTitle} />
                <div className="flex justify-between items-center text-[10px] text-muted-foreground select-none">
                  <span>⚡ Interactive SVG Mind-Map rendered dynamically</span>
                  <button
                    onClick={handleGenerateMindMap}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate Map
                  </button>
                </div>
              </div>

              {/* Concepts Explorer Sidebar */}
              <div className="bg-muted/40 dark:bg-zinc-950/20 border border-border rounded-xl p-4 flex flex-col h-[400px] overflow-hidden">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5 select-none">
                  <HelpCircle className="w-3.5 h-3.5 text-primary" />
                  Concept Explorer
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                  {parsedMindMap.nodes.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">No parsed nodes found.</p>
                  ) : (
                    parsedMindMap.nodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedConceptNode(node)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-between cursor-pointer",
                          selectedConceptNode?.id === node.id
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                      >
                        <span className="truncate">{node.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>

                {selectedConceptNode ? (
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 animate-fade-in space-y-3 flex-shrink-0 select-none">
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-primary">Selected Topic</span>
                      <h4 className="text-xs font-bold text-foreground truncate mt-0.5">{selectedConceptNode.label}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConceptTutorQuery("explain")}
                        className="flex-1 text-[10px] font-bold bg-primary hover:bg-primary-hover text-white py-1.5 px-2 rounded-lg shadow-sm cursor-pointer flex items-center justify-center gap-1"
                      >
                        💬 Explain in Chat
                      </button>
                      <button
                        onClick={() => handleConceptTutorQuery("quiz")}
                        className="flex-1 text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/80 py-1.5 px-2 rounded-lg shadow-sm cursor-pointer flex items-center justify-center gap-1"
                      >
                        📝 Practice Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[10px] text-muted-foreground border border-dashed border-border/40 rounded-xl bg-muted/5 flex-shrink-0 select-none">
                    Select a concept topic to study it
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <pre className="p-4 rounded-lg bg-zinc-950/70 border border-border/80 text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {diagram}
              </pre>
              <p className="text-[10px] text-muted-foreground">
                Copy and paste the raw syntax above into any Mermaid.js visualizer editor.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-6 flex items-center justify-between gap-3 border-b border-border/40 pb-4">
            <span className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary animate-pulse" />
              AI Audio Lecture Podcast (Alex & Taylor)
            </span>
          </h2>

          {loadingPodcast ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground select-none">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-medium">Generating audio podcast script...</span>
            </div>
          ) : podcastError ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {podcastError}
            </div>
          ) : (
            <div className="space-y-6">
              <style jsx>{`
                @keyframes bar-bounce {
                  0%,
                  100% {
                    height: 8px;
                  }
                  50% {
                    height: 24px;
                  }
                }
                .animate-bar-bounce {
                  animation: bar-bounce 0.8s ease-in-out infinite;
                }
              `}</style>

              {/* Premium Dual-Speaker Audio Player Control Board */}
              <div className="relative p-6 rounded-2xl bg-muted/40 dark:bg-zinc-950/40 border border-border flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner flex-shrink-0">
                    <Volume2 className={cn("w-6 h-6", isPodcastPlaying && "animate-bounce")} />
                  </div>
                  <div className="flex flex-col gap-2.5 w-full">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Co-Host Dialogue Podcast</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
                        {isPodcastPlaying ? "Now Playing" : isPodcastPaused ? "Paused" : "Ready to Play"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 select-none">
                      {availableVoices.length > 0 && (
                        <>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-1 rounded-lg border border-border/40">
                            <span className="font-semibold text-[8px] uppercase tracking-wider text-muted-foreground pl-1">
                              Alex (Host):
                            </span>
                            <select
                              value={selectedAlexVoiceName}
                              onChange={(e) => setSelectedAlexVoiceName(e.target.value)}
                              className="bg-background text-foreground text-[10px] py-0.5 px-1.5 rounded border border-border outline-none focus:border-primary cursor-pointer max-w-[130px] font-bold"
                            >
                              {availableVoices.map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                  {voice.name.replace("Microsoft ", "").replace("Google ", "")}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-1 rounded-lg border border-border/40">
                            <span className="font-semibold text-[8px] uppercase tracking-wider text-muted-foreground pl-1">
                              Taylor (Expert):
                            </span>
                            <select
                              value={selectedTaylorVoiceName}
                              onChange={(e) => setSelectedTaylorVoiceName(e.target.value)}
                              className="bg-background text-foreground text-[10px] py-0.5 px-1.5 rounded border border-border outline-none focus:border-primary cursor-pointer max-w-[130px] font-bold"
                            >
                              {availableVoices.map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                  {voice.name.replace("Microsoft ", "").replace("Google ", "")}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {/* Speed Controller */}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/40 p-1 rounded-lg border border-border/40">
                        <span className="font-semibold text-[8px] uppercase tracking-wider pl-1 pr-1">Speed:</span>
                        {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => setPodcastSpeed(speed)}
                            className={cn(
                              "px-1 py-0.5 rounded text-[8px] font-bold cursor-pointer transition-colors",
                              podcastSpeed === speed ? "bg-primary text-white" : "hover:text-foreground"
                            )}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Waveforms for both speakers */}
                {isPodcastPlaying && (
                  <div className="flex items-end gap-1.5 h-6 flex-shrink-0">
                    <span className="w-1 h-3 bg-primary rounded-full animate-bar-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-1 h-5 bg-primary rounded-full animate-bar-bounce" style={{ animationDelay: "0.3s" }} />
                    <span className="w-1.5 h-2 bg-indigo-500 rounded-full animate-bar-bounce" style={{ animationDelay: "0.5s" }} />
                    <span className="w-1 h-6 bg-primary rounded-full animate-bar-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-4 bg-indigo-500 rounded-full animate-bar-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                )}

                {/* Player button controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!isPodcastPlaying ? (
                    <button
                      onClick={handlePlayPodcast}
                      className="p-2.5 rounded-full bg-primary hover:bg-primary-hover text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                    >
                      <PlayCircle className="w-6 h-6 fill-white" />
                      Listen Dialogue
                    </button>
                  ) : (
                    <button
                      onClick={handlePausePodcast}
                      className="p-2.5 rounded-full bg-muted border border-border hover:bg-muted/80 text-foreground transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                    >
                      <PauseCircle className="w-6 h-6 fill-foreground" />
                      Pause
                    </button>
                  )}
                  {(isPodcastPlaying || isPodcastPaused) && (
                    <button
                      onClick={handleStopPodcast}
                      className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center"
                      title="Stop Audio"
                    >
                      <StopCircle className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              {/* Chat-style transcript display */}
              <div className="space-y-3 select-none">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interactive Transcript</h3>

                <div className="space-y-4 max-h-80 overflow-y-auto rounded-xl bg-muted/40 p-5 border border-border">
                  {parsedPodcastTurns.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-6">
                      Parsing podcast script turns...
                    </p>
                  ) : (
                    parsedPodcastTurns.map((turn, idx) => (
                      <div
                        key={idx}
                        ref={currentTurnIndex === idx ? activeTurnRef : null}
                        className={cn(
                          "p-3.5 rounded-2xl max-w-[85%] border transition-all duration-300 shadow-sm",
                          turn.speaker === "Alex"
                            ? "bg-primary/5 border-primary/20 mr-auto text-left"
                            : "bg-indigo-500/5 border-indigo-500/20 ml-auto text-left",
                          currentTurnIndex === idx && "border-primary bg-primary/10 scale-[1.01] shadow-md shadow-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className={cn(
                              "text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md",
                              turn.speaker === "Alex"
                                ? "bg-primary/20 text-primary"
                                : "bg-indigo-500/20 text-indigo-400"
                            )}
                          >
                            {turn.speaker}
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-normal leading-relaxed">{turn.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection Overlay Tooltip */}
      {tooltipPos && selectedText && (
        <div
          className="absolute z-50 bg-popover text-popover-foreground border border-border/85 p-2 rounded-xl shadow-xl flex items-center gap-2 animate-scale-up -translate-x-1/2 select-none"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          <button
            onClick={handleGenerateFlashcard}
            disabled={isGeneratingCard}
            className="text-[10px] font-bold bg-primary hover:bg-primary-hover text-white py-1.5 px-3 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            {isGeneratingCard ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Card
              </>
            )}
          </button>
          <button
            onClick={handleAskTutor}
            className="text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/80 py-1.5 px-3 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            💬 Ask Tutor
          </button>
        </div>
      )}
    </div>
  );
}
