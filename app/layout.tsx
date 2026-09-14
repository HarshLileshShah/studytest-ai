import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyTest AI — AI-Powered Active Recall & Learning Operating System",
  description:
    "Transform PDFs and lecture slides into interactive quizzes, SM-2 spaced repetition flashcards, concept mind maps, and live multiplayer classroom sessions.",
  keywords: ["study", "AI", "quiz", "learning", "PDF", "flashcards", "spaced repetition", "SM-2", "active recall"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
