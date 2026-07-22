import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-emerald-500";
  if (percentage >= 60) return "text-amber-500";
  return "text-red-500";
}

export function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (percentage >= 60) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case "EASY":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "MEDIUM":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "HARD":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

/** Demo user ID — used until auth is integrated */
export const DEMO_USER_ID = "demo-user-001";
