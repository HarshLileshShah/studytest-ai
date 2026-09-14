"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Sparkles, Menu, X, ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { ThemeIconToggle } from "@/components/layout/theme-icon-toggle";
import { useSession } from "next-auth/react";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Interactive Demo", href: "#demo" },
    { label: "Features", href: "#features" },
    { label: "SM-2 Engine", href: "#sm2" },
    { label: "Architecture", href: "#architecture" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/70 shadow-lg shadow-black/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                  StudyTest <span className="text-primary font-black">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  v2.0 Live
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                Active Recall Operating System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3.5">
            <ThemeIconToggle />

            {session ? (
              <Link
                href="/dashboard"
                className="relative inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:to-indigo-600 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="relative inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:to-indigo-600 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started Free
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeIconToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border/80 px-4 pt-3 pb-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold text-foreground border border-border rounded-xl hover:bg-muted/40 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-primary rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Launch App
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
