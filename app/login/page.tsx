import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-10 shadow-2xl border border-white/5 backdrop-blur-xl text-center">
          {/* Logo & Header */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-2">
            StudyTest AI
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-[280px] mx-auto">
            Upload study materials, generate custom quizzes, and get AI analytics scoped to you.
          </p>

          {/* OAuth Form */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3.5 bg-white text-zinc-950 font-semibold py-4 px-6 rounded-xl hover:bg-zinc-100 transition-all duration-300 shadow-xl active:scale-[0.98] group cursor-pointer"
            >
              {/* Custom SVG Google Icon */}
              <svg
                className="w-5 h-5 flex-shrink-0"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path
                    d="M21.35,11.1H12v2.7h5.38C16.88,16.5,14.77,18,12,18A6,6,0,1,1,12,6c1.6,0,3,.62,4.1,1.63L18.2,5.53A8.88,8.88,0,0,0,12,3.3a8.7,8.7,0,1,0,8.7,8.7C20.7,11.75,21.35,11.1,21.35,11.1Z"
                    fill="#09090b"
                  />
                </g>
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Card Footer */}
          <p className="text-xs text-muted-foreground mt-8">
            Access to generated quizzes and analytics is secured and private.
          </p>
        </div>
      </div>
    </div>
  );
}
