import { z } from "zod";

// ─── Zod Schemas ─────────────────────────────────────────

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const documentStatusSchema = z.enum(["PENDING", "PROCESSING", "READY", "FAILED"]);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const generatedQuestionSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string(),
  explanation: z.string().min(10),
  difficulty: difficultySchema,
  topic: z.string(),
});
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

export const generatedQuestionsResponseSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});
export type GeneratedQuestionsResponse = z.infer<typeof generatedQuestionsResponseSchema>;

// ─── Client-Side Types ───────────────────────────────────

export interface DocumentInfo {
  id: string;
  title: string;
  filename: string;
  filePath: string;
  fileSize: number;
  pageCount: number;
  status: DocumentStatus;
  extractedText: string | null;
  uploadedAt: string;
  updatedAt: string;
  _count?: {
    quizzes: number;
  };
}

export interface QuizInfo {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
  document: {
    id: string;
    title: string;
  };
  _count?: {
    attempts: number;
  };
}

export interface QuestionInfo {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  type: string;
  orderIndex: number;
}

export interface QuizWithQuestions extends QuizInfo {
  questions: QuestionInfo[];
}

export interface AttemptInfo {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  aiFeedback: string | null;
  startedAt: string;
  completedAt: string | null;
  quiz: {
    id: string;
    title: string;
    document: {
      id: string;
      title: string;
    };
  };
}

export interface AttemptWithAnswers extends AttemptInfo {
  answers: AnswerInfo[];
}

export interface AnswerInfo {
  id: string;
  selectedAnswer: string;
  isCorrect: boolean;
  question: QuestionInfo;
}

export interface QuizSessionAnswer {
  questionId: string;
  selectedAnswer: string;
}

// ─── Dashboard Analytics ─────────────────────────────────

export interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalQuestionsAnswered: number;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
  quizTitle: string;
}

export interface TopicAccuracy {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface DifficultyBreakdown {
  difficulty: Difficulty;
  correct: number;
  total: number;
  accuracy: number;
}

// ─── API Response Wrapper ────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Flashcards ──────────────────────────────────────────

export interface FlashcardDeckInfo {
  id: string;
  documentId: string;
  title: string;
  cardCount: number;
  createdAt: string;
  document: {
    id: string;
    title: string;
  };
}

export interface FlashcardInfo {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: string;
  progress?: FlashcardProgressInfo[];
}

export interface FlashcardProgressInfo {
  id: string;
  userId: string;
  cardId: string;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: string;
}
