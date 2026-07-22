import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyTest AI — AI-Powered Study Assistant",
  description:
    "Upload PDF study materials and let AI generate practice quizzes, evaluate your answers, and provide personalized feedback.",
  keywords: ["study", "AI", "quiz", "learning", "PDF", "practice test"],
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
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="layout-main">
              <div className="main-container">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
