"use client";

import { useState, useEffect } from "react";
import { Volume2, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeechButtonProps {
  text: string;
  className?: string;
  sizeClassName?: string;
}

export function SpeechButton({
  text,
  className,
  sizeClassName = "w-4 h-4",
}: SpeechButtonProps) {
  const [status, setStatus] = useState<"stopped" | "playing" | "paused">("stopped");
  const [voiceName, setVoiceName] = useState<string>("");

  // Sync selected voice preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    setVoiceName(localStorage.getItem("tts-voice") || "");

    const handleVoiceChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setVoiceName(customEvent.detail || "");
    };

    window.addEventListener("tts-voice-changed", handleVoiceChange);
    return () => window.removeEventListener("tts-voice-changed", handleVoiceChange);
  }, []);

  // Stop speaking on text update or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const toggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering parents (e.g. card flips)

    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    } else {
      window.speechSynthesis.cancel();

      // Clean HTML tags or markdown markers if any (for clean audio)
      const cleanText = text
        .replace(/[*#`_~]/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Assign matching custom voice if exists
      if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const selected = voices.find((v) => v.name === voiceName);
        if (selected) {
          utterance.voice = selected;
        }
      }

      utterance.onend = () => setStatus("stopped");
      utterance.onerror = () => setStatus("stopped");

      window.speechSynthesis.speak(utterance);
      setStatus("playing");
    }
  };

  const getIcon = () => {
    if (status === "playing") {
      return <Pause className={sizeClassName} />;
    }
    return <Volume2 className={cn(sizeClassName, status === "paused" && "animate-pulse text-primary")} />;
  };

  return (
    <button
      onClick={toggleSpeech}
      type="button"
      className={cn(
        "p-1 hover:bg-muted-foreground/15 rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer inline-flex items-center justify-center",
        status === "playing" && "bg-primary/10 text-primary hover:text-primary",
        status === "paused" && "bg-amber-500/10 text-amber-500 hover:text-amber-500",
        className
      )}
      title={
        status === "playing"
          ? "Pause listening"
          : status === "paused"
            ? "Resume listening"
            : "Listen aloud"
      }
    >
      {getIcon()}
    </button>
  );
}
