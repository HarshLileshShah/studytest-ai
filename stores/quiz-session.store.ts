import { create } from "zustand";

export interface QuizSessionState {
  // Quiz metadata
  quizId: string | null;
  totalQuestions: number;

  // Navigation
  currentIndex: number;

  // Answers: questionId -> selectedAnswer
  answers: Record<string, string>;

  // Timer
  startTime: number | null;
  timeElapsed: number;

  // State
  isSubmitted: boolean;

  // Actions
  initSession: (quizId: string, totalQuestions: number) => void;
  selectAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  updateTimer: () => void;
  markSubmitted: () => void;
  reset: () => void;
}

export const useQuizSession = create<QuizSessionState>((set, get) => ({
  quizId: null,
  totalQuestions: 0,
  currentIndex: 0,
  answers: {},
  startTime: null,
  timeElapsed: 0,
  isSubmitted: false,

  initSession: (quizId, totalQuestions) =>
    set({
      quizId,
      totalQuestions,
      currentIndex: 0,
      answers: {},
      startTime: Date.now(),
      timeElapsed: 0,
      isSubmitted: false,
    }),

  selectAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.totalQuestions - 1),
    })),

  prevQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  goToQuestion: (index) =>
    set({ currentIndex: index }),

  updateTimer: () =>
    set((state) => ({
      timeElapsed: state.startTime
        ? Math.floor((Date.now() - state.startTime) / 1000)
        : 0,
    })),

  markSubmitted: () =>
    set({ isSubmitted: true }),

  reset: () =>
    set({
      quizId: null,
      totalQuestions: 0,
      currentIndex: 0,
      answers: {},
      startTime: null,
      timeElapsed: 0,
      isSubmitted: false,
    }),
}));
