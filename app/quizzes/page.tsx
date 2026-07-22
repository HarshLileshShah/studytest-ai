import Link from "next/link";
import { GraduationCap, Plus, Clock, BookOpen } from "lucide-react";
import { getQuizzes } from "@/services/quiz.service";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

import { JoinQuizForm } from "./join-quiz-form";

export default async function QuizzesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const quizzes = await getQuizzes(userId);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Quizzes</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Your AI-generated practice tests
          </p>
        </div>
        <Link href="/documents" className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload Document
        </Link>
      </div>

      {/* Join Code Section */}
      <JoinQuizForm />

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No quizzes yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Upload a PDF document and generate your first AI-powered quiz.
          </p>
          <Link href="/documents" className="btn-primary inline-flex items-center gap-2">
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/quiz/${quiz.id}`}
              className="glass-card p-6 group block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    From: {quiz.document.title}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {quiz.questionCount} questions
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(quiz.createdAt)}
                </div>
                {quiz._count.attempts > 0 && (
                  <>
                    <span className="text-border">•</span>
                    <span>{quiz._count.attempts} attempts</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
