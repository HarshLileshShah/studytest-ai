"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  AlertCircle,
  FileText,
  User,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sendTutorMessageAction,
  clearTutorChatAction,
} from "@/app/actions/tutor.actions";
import { MarkdownText } from "@/components/ui/markdown-text";
import { SpeechButton } from "@/components/ui/speech-button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  createdAt: string | Date;
}

interface TutorChatProps {
  documentId: string;
  initialMessages: ChatMessage[];
}

export function TutorChat({ documentId, initialMessages }: TutorChatProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat log on message load
  useEffect(() => {
    const handleQuote = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const quoteText = customEvent.detail;
      setInput(`Can you explain this excerpt: "${quoteText}"?`);
      inputRef.current?.focus();
    };

    window.addEventListener("ask-tutor-quote", handleQuote);
    return () => {
      window.removeEventListener("ask-tutor-quote", handleQuote);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [initialMessages, isPending]);

  const handleSend = async (questionText: string) => {
    if (!questionText.trim() || isPending) return;

    setError("");
    setInput("");

    startTransition(async () => {
      const res = await sendTutorMessageAction(documentId, questionText);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || "Failed to get tutor reply.");
      }
    });
  };

  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear this conversation?")) return;

    startTransition(async () => {
      const res = await clearTutorChatAction(documentId);
      if (res.success) {
        router.refresh();
      }
    });
  };

  const quickPrompts = [
    "Summarize document",
    "Explain key concepts",
    "List important terms",
  ];

  return (
    <div className="glass-card flex flex-col h-[580px] border border-primary/10 overflow-hidden">
      {/* Chat Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">AI Document Tutor</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Ask questions directly about this file
            </p>
          </div>
        </div>

        {initialMessages.length > 0 && (
          <button
            onClick={handleClearChat}
            disabled={isPending}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {initialMessages.length === 0 ? (
          /* Empty Chat Area Welcome Panel */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-bounce-subtle">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Ask your Document Tutor</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Get explanations, key concept extractions, terms, or calculations based contextually on your document.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground text-left mb-1">
                Quick Prompts
              </p>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={isPending}
                  className="w-full text-left p-2.5 text-xs border border-border/60 hover:border-primary bg-muted/20 hover:bg-primary/5 rounded-xl transition-all cursor-pointer truncate font-medium text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat List */
          <div className="space-y-4">
            {initialMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%] items-start animate-fade-in",
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {/* Avatar Icon */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border",
                      isUser
                        ? "bg-muted/60 border-border/80 text-muted-foreground"
                        : "bg-primary/10 border-primary/20 text-primary"
                    )}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="flex flex-col gap-1 items-start max-w-full">
                    <div
                      className={cn(
                        "p-3 rounded-2xl text-xs sm:text-sm",
                        isUser
                          ? "bg-primary text-white rounded-tr-none font-medium"
                          : "bg-muted/40 border border-border/60 text-foreground rounded-tl-none font-normal"
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.content}</p>
                      ) : (
                        <MarkdownText text={msg.content} />
                      )}
                    </div>
                    {!isUser && (
                      <SpeechButton
                        text={msg.content}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                        sizeClassName="w-3.5 h-3.5"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating loading feedback */}
        {isPending && !error && (
          <div className="flex gap-3 max-w-[80%] items-start animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-muted/30 border border-border/40 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Tutor is reading & thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-red-400 items-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input Message Footer Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 border-t border-border/30 bg-muted/10 flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this material..."
          className="input flex-1 p-2.5 text-xs"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="btn-primary p-2.5 flex items-center justify-center rounded-xl cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}

