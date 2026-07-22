"use client";

import { useState } from "react";
import { Printer, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topic: string | null;
}

interface PrintQuizClientProps {
  quiz: {
    id: string;
    title: string;
    document: {
      title: string;
    };
    questions: Question[];
  };
}

export function PrintQuizClient({ quiz }: PrintQuizClientProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-page min-h-screen max-w-4xl mx-auto py-6 md:py-10">
      {/* Print Controls / Action Bar */}
      <div className="print-hide flex flex-wrap items-center justify-between gap-4 p-4 mb-6 rounded-xl bg-card border border-border">
        <Link
          href={`/quiz/${quiz.id}`}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {showAnswers ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Answer Key
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Answer Key
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Save to PDF
          </button>
        </div>
      </div>

      {/* Main Worksheet Content */}
      <div className="printable-sheet p-8 md:p-12 shadow-lg bg-white text-black">
        {/* Worksheet Header */}
        <div className="border-b-2 border-zinc-950 pb-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight uppercase">
                {quiz.title}
              </h1>
              <p className="text-sm text-zinc-600 mt-1">
                Source Document: {quiz.document.title}
              </p>
            </div>
            <div className="text-right text-xs text-zinc-500 font-mono">
              StudyTest AI Sheet
            </div>
          </div>

          {/* Student Fields */}
          <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-zinc-200">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                Student Name:
              </span>
              <div className="border-b border-zinc-500 h-8 mt-1"></div>
            </div>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                Date:
              </span>
              <div className="border-b border-zinc-500 h-8 mt-1"></div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {quiz.questions.map((q, index) => (
            <div key={q.id} className="print-keep-together">
              <div className="flex items-start gap-3">
                <span className="font-bold text-lg">{index + 1}.</span>
                <div>
                  <h3 className="font-semibold text-base leading-relaxed text-zinc-900">
                    {q.question}
                  </h3>
                  {q.topic && (
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded mt-1 print-hide">
                      Topic: {q.topic}
                    </span>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 ml-6">
                {q.options.map((opt, oIndex) => {
                  const letter = String.fromCharCode(65 + oIndex); // A, B, C, D
                  return (
                    <div
                      key={oIndex}
                      className="flex items-center gap-3 py-1.5 px-3 rounded border border-zinc-200 bg-zinc-50/50"
                    >
                      <span className="w-5 h-5 rounded-md border border-zinc-400 flex items-center justify-center text-xs font-bold text-zinc-600 flex-shrink-0 bg-white">
                        {letter}
                      </span>
                      <span className="text-sm text-zinc-800">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key Page / Section */}
        {showAnswers && (
          <div className="mt-16 pt-8 border-t-2 border-dashed border-zinc-400 print-keep-together">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-zinc-900 border-b border-zinc-300 pb-2">
              Answer Key & Explanations
            </h2>
            <div className="space-y-6">
              {quiz.questions.map((q, index) => {
                const correctIndex = q.options.indexOf(q.correctAnswer);
                const letter = String.fromCharCode(65 + correctIndex);

                return (
                  <div key={q.id} className="print-keep-together text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-zinc-900">Q{index + 1}.</span>
                      <div>
                        <p className="font-semibold text-zinc-800">{q.question}</p>
                        <p className="font-bold text-emerald-700 mt-1">
                          Correct Answer: {letter} ({q.correctAnswer})
                        </p>
                        <p className="text-zinc-600 mt-1 leading-relaxed">
                          <span className="font-bold text-zinc-700">Explanation:</span>{" "}
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
