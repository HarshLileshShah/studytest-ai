"use client";

import { useEffect, useState, useRef } from "react";
import { Mic, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoiceSelector() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter English or common local voices for clean study pronunciation
      const englishVoices = allVoices.filter((v) => v.lang.startsWith("en") || v.lang.includes("EN"));
      const available = englishVoices.length > 0 ? englishVoices : allVoices;
      setVoices(available);

      const saved = localStorage.getItem("tts-voice") || "";
      if (saved) {
        setSelectedVoice(saved);
      } else if (available.length > 0) {
        // Fallback to default browser voice
        const defaultVoice = available.find((v) => v.default) || available[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectVoiceName = (name: string) => {
    setSelectedVoice(name);
    localStorage.setItem("tts-voice", name);
    window.dispatchEvent(new CustomEvent("tts-voice-changed", { detail: name }));
    setIsOpen(false);
  };

  if (voices.length === 0) return null;

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={cn(
          "p-1.5 rounded-lg border transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center justify-center",
          isOpen
            ? "bg-primary/20 text-primary border-primary/30"
            : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/80 hover:text-foreground"
        )}
        title="Change study voice settings"
        aria-label="Voice settings"
      >
        <Mic className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 z-50 w-48 max-h-60 overflow-y-auto bg-card text-card-foreground border border-border p-2 rounded-xl shadow-2xl animate-scale-up">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1.5 border-b border-border/40 mb-1 select-none">
            Select Study Voice
          </p>
          <div className="space-y-0.5">
            {voices.map((voice) => {
              const isSelected = selectedVoice === voice.name;
              return (
                <button
                  key={voice.name}
                  type="button"
                  onClick={() => selectVoiceName(voice.name)}
                  className={cn(
                    "w-full text-left px-2.5 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="truncate pr-2" title={voice.name}>
                    {voice.name.replace(/Microsoft|Google|Apple/g, "").trim()} ({voice.lang.split("-")[1] || voice.lang})
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
