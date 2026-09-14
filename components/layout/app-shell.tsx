"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public standalone routes that should not display the authenticated dashboard sidebar
  const isStandalone =
    pathname === "/" ||
    pathname === "/login" ||
    pathname?.startsWith("/session");

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="layout-main">
        <div className="main-container">{children}</div>
      </main>
    </div>
  );
}
