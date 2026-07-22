"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeIconToggle() {
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
      className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer flex-shrink-0 ${
        theme === "dark"
          ? "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/25 hover:text-violet-300 shadow-sm shadow-violet-500/5"
          : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/25 hover:text-amber-700 shadow-sm shadow-amber-500/5"
      }`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="w-4 h-4 text-violet-400 animate-pulse" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
      )}
    </button>
  );
}
