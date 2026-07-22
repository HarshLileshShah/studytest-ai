"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  ArrowLeft,
  RefreshCw,
  Trophy,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  startOralExamAction,
  evaluateOralResponseAction,
  gradeOralSessionAction,
} from "@/app/actions/oral.actions";
import { formatTime } from "@/lib/utils";

interface Message {
  role: "tutor" | "student";
  text: string;
}

interface OralExamClientProps {
  documentId: string;
  documentTitle: string;
  initialMode?: "standard" | "viva";
}

export function OralExamClient({ documentId, documentTitle, initialMode = "standard" }: OralExamClientProps) {
  const [status, setStatus] = useState<"idle" | "speaking" | "listening" | "processing" | "finished">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [summary, setSummary] = useState("");
  const [vivaScorecard, setVivaScorecard] = useState<{
    accuracyScore: number;
    confidenceScore: number;
    vocabularyScore: number;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Audio & Speech Recognition APIs
  useEffect(() => {
    if (typeof window === "undefined") return;

    synthRef.current = window.speechSynthesis;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (e: any) => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setTranscript(text);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error !== "no-speech") {
          setError(`Microphone error: ${e.error}. Please check permissions.`);
          setStatus("speaking"); // Fallback to speaking state so they can manual submit or retry
        }
      };

      rec.onend = () => {
        // If mic ended and we are still in listening mode, check if we have a transcript to submit
        if (status === "listening") {
          // If we had no transcription, reset and allow speaking/trying again
          // otherwise we wait for the student to submit
        }
      };

      recognitionRef.current = rec;
    } else {
      setError("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
    }

    return () => {
      stopAllAudioAndListening();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Handle active session timer
  useEffect(() => {
    if (status !== "idle" && status !== "finished") {
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const stopAllAudioAndListening = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleSpeak = (textToSpeak: string, onEndCallback: () => void) => {
    if (!synthRef.current) return onEndCallback();

    synthRef.current.cancel();

    if (!textToSpeak || !textToSpeak.trim()) {
      return onEndCallback();
    }

    // A tiny timeout prevents Chromium SpeechSynthesis race conditions after canceling
    setTimeout(() => {
      if (isMuted) {
        onEndCallback();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());

      // Apply voice settings matching layout.tsx if stored
      const voices = synthRef.current?.getVoices() || [];
      const savedVoiceName = localStorage.getItem("tts-voice") || "";
      if (savedVoiceName && utterance) {
        const selected = voices.find((v) => v.name === savedVoiceName);
        if (selected) utterance.voice = selected;
      }

      utterance.onend = () => {
        onEndCallback();
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.error("Speech Synthesis Error:", e);
        }
        onEndCallback();
      };

      currentUtteranceRef.current = utterance;
      synthRef.current?.speak(utterance);
    }, 100);
  };

  const handleStartExam = async () => {
    setError("");
    setStatus("processing");
    setMessages([]);
    setTimeSpent(0);
    setTranscript("");

    const res = await startOralExamAction(documentId, initialMode);
    if (res.success && res.question) {
      setCurrentQuestion(res.question);
      setMessages([{ role: "tutor", text: res.question }]);
      setStatus("speaking");
      handleSpeak(res.question, () => {
        startListeningForResponse();
      });
    } else {
      setError(res.error || "Failed to initiate exam.");
      setStatus("idle");
    }
  };

  const startListeningForResponse = () => {
    if (!recognitionRef.current) return;
    stopAllAudioAndListening();
    setTranscript("");
    setStatus("listening");
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start mic:", e);
    }
  };

  const handleSubmitResponse = async () => {
    if (!transcript.trim()) return;

    stopAllAudioAndListening();
    setStatus("processing");

    const answer = transcript.trim();
    const updatedMessages = [...messages, { role: "student" as const, text: answer }];
    setMessages(updatedMessages);

    const res = await evaluateOralResponseAction(documentId, currentQuestion, answer, updatedMessages, initialMode);
    if (res.success && res.evaluation && res.nextQuestion) {
      const tutorFeedback = `${res.evaluation} ${res.nextQuestion}`;
      const nextMsgs = [
        ...updatedMessages,
        { role: "tutor" as const, text: tutorFeedback },
      ];
      setMessages(nextMsgs);
      setCurrentQuestion(res.nextQuestion);
      setStatus("speaking");
      handleSpeak(tutorFeedback, () => {
        startListeningForResponse();
      });
    } else {
      setError(res.error || "Failed to evaluate your answer.");
      setStatus("speaking"); // allow retrying
    }
  };

  const handleFinishExam = async () => {
    stopAllAudioAndListening();
    setStatus("processing");

    const res = await gradeOralSessionAction(messages, initialMode);
    if (res.success && res.summary) {
      setSummary(res.summary);
      if (res.isViva) {
        setVivaScorecard({
          accuracyScore: res.accuracyScore || 0,
          confidenceScore: res.confidenceScore || 0,
          vocabularyScore: res.vocabularyScore || 0,
          strengths: res.strengths || [],
          weaknesses: res.weaknesses || [],
        });
      }
      setStatus("finished");
      handleSpeak(res.summary, () => {});
    } else {
      setError("Failed to generate final performance summary.");
      setStatus("finished");
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && synthRef.current) {
        synthRef.current.cancel();
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <Link
          href={`/documents/${documentId}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Document
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            title={isMuted ? "Unmute tutor speech" : "Mute tutor speech"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="glass-card p-8 border border-border/80 rounded-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Welcome and Instructions */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-400">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              AI Oral Exam Mode
              <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] py-0.5 px-2 rounded-full font-bold uppercase tracking-wider select-none">
                Interactive Voice
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Practice answering questions aloud based on &quot;{documentTitle}&quot;.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* State 1: Idle (CTA) */}
        {status === "idle" && (
          <div className="text-center py-16">
            <HelpCircle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <h3 className="text-base font-semibold mb-2">Test your knowledge verbally</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
              The AI Tutor will ask you questions based on the PDF content, listen to your verbal answers, and grade your understanding.
            </p>
            <button
              onClick={handleStartExam}
              className="btn-primary py-2.5 px-6 font-semibold inline-flex items-center gap-2 text-sm cursor-pointer shadow-lg shadow-primary/20"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Oral Exam
            </button>
          </div>
        )}

        {/* State 2: Processing (AI Loading Loader) */}
        {status === "processing" && (
          <div className="text-center py-20">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-xs font-semibold text-foreground">AI Examiner is listening and thinking...</p>
            <p className="text-[10px] text-muted-foreground mt-1">Analyzing your concepts accuracy</p>
          </div>
        )}

        {/* State 3: Active Exam (Tutor speaking or Listening to mic) */}
        {(status === "speaking" || status === "listening") && (
          <div className="space-y-8 py-4">
            {/* Visualizer Animations */}
            <div className="flex flex-col items-center justify-center py-8 gap-4 select-none">
              {status === "speaking" ? (
                // Animated soundwave bars
                <div className="flex items-end gap-1.5 h-16 w-32 justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-primary rounded-full animate-bounce"
                      style={{
                        height: `${Math.floor(Math.random() * 80) + 20}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "0.8s",
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Pulsing mic circle
                <button
                  onClick={handleSubmitResponse}
                  disabled={!transcript}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                    transcript
                      ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                      : "bg-red-500/90 hover:bg-red-600 shadow-lg shadow-red-500/20 animate-pulse"
                  }`}
                  title={transcript ? "Submit your answer" : "Speak into your mic"}
                >
                  <Mic className="w-8 h-8 fill-white" />
                </button>
              )}

              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {status === "speaking" ? "AI Tutor is speaking..." : "Listening... Speak your answer now"}
              </p>
            </div>

            {/* Speech real-time transcripts */}
            {status === "listening" && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 min-h-[80px] flex flex-col justify-between">
                <p className="text-xs text-foreground leading-relaxed italic">
                  {transcript || "Speak clearly into your microphone..."}
                </p>
                {transcript && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={startListeningForResponse}
                      className="text-[10px] text-muted-foreground hover:text-foreground font-semibold py-1 px-2.5 rounded border border-border bg-background cursor-pointer"
                    >
                      Clear & Retry
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      className="text-[10px] text-white font-bold bg-primary hover:bg-primary-hover py-1 px-2.5 rounded shadow cursor-pointer flex items-center gap-1"
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Current prompt details card */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Current Question
              </span>
              <p className="text-sm font-semibold text-foreground mt-3 leading-relaxed">
                {currentQuestion}
              </p>
            </div>

            {/* Live Timer and Complete Button */}
            <div className="flex items-center justify-between border-t border-border/50 pt-6">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Session Time:</span>
                <span className="font-bold font-mono text-foreground">{formatTime(timeSpent)}</span>
              </div>
              <button
                onClick={handleFinishExam}
                className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" />
                Finish & Grade
              </button>
            </div>
          </div>
        )}

        {/* State 4: Finished (Grading results dashboard) */}
        {status === "finished" && (
          <div className="space-y-6">
            <div className="p-8 text-center bg-violet-600/5 border border-violet-500/20 rounded-2xl">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-bounce" />
              <h3 className="text-base font-bold">Exam Session Completed!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You spent {formatTime(timeSpent)} practicing your oral answers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
              <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Examiner Summary Report
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>

            {vivaScorecard && (
              <div className="glass-card p-6 border border-primary/20 bg-primary/5 rounded-2xl space-y-6">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-3">
                  <Trophy className="w-4 h-4 text-yellow-500 animate-pulse" />
                  Technical Viva Scorecard
                </h4>
                
                {/* Scoring metrics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title: "Technical Accuracy", score: vivaScorecard.accuracyScore, color: "text-violet-400 bg-violet-500/10 border border-violet-500/20" },
                    { title: "Confidence & Clarity", score: vivaScorecard.confidenceScore, color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
                    { title: "Technical Vocabulary", score: vivaScorecard.vocabularyScore, color: "text-blue-400 bg-blue-500/10 border border-blue-500/20" }
                  ].map((metric) => (
                    <div key={metric.title} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${metric.color}`}>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{metric.title}</span>
                      <span className="text-3xl font-black font-mono mt-1">{metric.score}/100</span>
                      <div className="w-full bg-zinc-950/40 rounded-full h-1.5 mt-3 overflow-hidden border border-border/20">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${metric.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths & Weaknesses lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">Strengths</span>
                    <ul className="mt-2 space-y-1">
                      {vivaScorecard.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {str}
                        </li>
                      ))}
                      {vivaScorecard.strengths.length === 0 && (
                        <li className="text-xs text-muted-foreground italic">None identified.</li>
                      )}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider font-mono">Areas to Review</span>
                    <ul className="mt-2 space-y-1">
                      {vivaScorecard.weaknesses.map((weak, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          {weak}
                        </li>
                      ))}
                      {vivaScorecard.weaknesses.length === 0 && (
                        <li className="text-xs text-muted-foreground italic">None identified.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center gap-4 pt-4 flex-wrap">
              <button
                onClick={handleStartExam}
                className="btn-primary text-xs font-semibold py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restart Exam
              </button>
              <Link
                href={`/documents/${documentId}`}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold transition-all py-2 px-4 rounded-xl border border-border/80 hover:bg-muted/40"
              >
                Return to Document
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* History Log view */}
      {messages.length > 0 && (
        <div className="glass-card p-6 border border-border/50 rounded-2xl">
          <h3 className="text-sm font-bold text-foreground mb-4">Conversation Transcript</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 text-xs leading-relaxed max-w-[85%] ${
                  msg.role === "tutor" ? "mr-auto" : "ml-auto flex-row-reverse"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold uppercase select-none text-[10px] ${
                    msg.role === "tutor"
                      ? "bg-violet-600/10 text-violet-400 border border-violet-500/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {msg.role === "tutor" ? "AI" : "You"}
                </div>
                <div
                  className={`p-3.5 rounded-2xl ${
                    msg.role === "tutor"
                      ? "bg-muted/40 border border-border/60 text-muted-foreground"
                      : "bg-primary text-white font-medium"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
