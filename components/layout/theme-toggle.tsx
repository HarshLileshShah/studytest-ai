"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const currentTheme = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "dark";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
      aria-label="Toggle theme"
    >
      <div className="flex items-center gap-3">
        {theme === "dark" ? (
          <>
            <Moon className="w-5 h-5 text-violet-400 animate-pulse" />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <span>Light Mode</span>
          </>
        )}
      </div>
      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 bg-muted/80 py-0.5 px-1.5 rounded">
        {theme === "dark" ? "on" : "off"}
      </span>
    </button>
  );
}
