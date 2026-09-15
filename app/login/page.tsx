import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeIconToggle } from "@/components/layout/theme-icon-toggle";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 dark:bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <ThemeIconToggle />
      </header>

      {/* Main Login Card Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="glass-card w-full p-8 sm:p-10 shadow-2xl border border-border/80 backdrop-blur-xl text-center rounded-3xl">
          {/* Logo & Header */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            StudyTest <span className="text-primary font-black">AI</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-[280px] mx-auto">
            Upload study materials, generate custom quizzes, and get AI analytics scoped to you.
          </p>

          {/* OAuth Form */}
          <div className="space-y-3">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-card hover:bg-muted/50 dark:bg-white dark:hover:bg-zinc-100 text-foreground dark:text-zinc-950 border border-border/80 dark:border-transparent font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] group cursor-pointer"
              >
                {/* 4-Color Official Google Icon */}
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border/80 w-full" />
              <span className="bg-card dark:bg-[#0f0f13] px-3 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                or
              </span>
              <div className="border-t border-border/80 w-full" />
            </div>

            {/* Instant Demo Account Sign-in */}
            <form
              action={async () => {
                "use server";
                await signIn("demo", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>⚡ Instant Demo Sign-In (Zero Setup)</span>
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Evaluators & guests can use the Demo Sign-In to test all features instantly.
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="relative z-20 py-4 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} StudyTest AI. All rights reserved.
      </footer>
    </div>
  );
}
