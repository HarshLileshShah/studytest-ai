"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Sparkles,
  Menu,
  X,
  Layers,
  CalendarRange,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

import { ThemeIconToggle } from "./theme-icon-toggle";
import { VoiceSelector } from "./voice-selector";
import { SettingsModal } from "./settings-modal";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Quizzes",
    href: "/quizzes",
    icon: GraduationCap,
  },
  {
    label: "Flashcards",
    href: "/flashcards",
    icon: Layers,
  },
  {
    label: "Study Planner",
    href: "/planner",
    icon: CalendarRange,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-16 bg-sidebar border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">StudyTest AI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-ghost p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: 256 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">StudyTest</h1>
              <p className="text-xs text-muted-foreground font-medium">
                AI-Powered Learning
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5", isActive && "text-primary")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        {status === "authenticated" && session?.user ? (
          <div className="p-4 border-t border-sidebar-border mt-auto">
            <div className="flex items-center gap-3 p-2 mb-3 bg-muted/30 rounded-lg">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  className="w-8 h-8 rounded-full border border-sidebar-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate leading-tight">
                  {session.user.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  {session.user.email}
                </p>
              </div>
              <ThemeIconToggle />
              <VoiceSelector />
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                title="AI Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-center py-2 px-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 hover:text-red-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="p-5 border-t border-sidebar-border">
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload PDFs · Generate Quizzes · Learn Smarter
              </p>
            </div>
          </div>
        )}
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </aside>
    </>
  );
}
