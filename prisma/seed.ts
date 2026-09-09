import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding rich demo dataset for evaluators...");

  // 1. Create or update demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@studytest.ai" },
    update: {
      streakCount: 5,
      xp: 450,
      gold: 90,
      level: 2,
      activeTitle: "Concurrency Master",
    },
    create: {
      id: "demo-user-001",
      name: "Demo Student",
      email: "demo@studytest.ai",
      streakCount: 5,
      xp: 450,
      gold: 90,
      level: 2,
      activeTitle: "Concurrency Master",
    },
  });

  console.log(`✅ User ready: ${user.name} (${user.email})`);

  // 2. Create sample study document
  const doc = await prisma.document.upsert({
    where: { id: "demo-doc-001" },
    update: {},
    create: {
      id: "demo-doc-001",
      userId: user.id,
      title: "Operating Systems: Concurrency & Virtual Memory",
      filename: "cs301_os_concurrency.pdf",
      filePath: "/uploads/demo-os.pdf",
      fileSize: 1024 * 350,
      pageCount: 18,
      status: "READY",
      extractedText: `Operating systems manage hardware resources and provide abstractions for concurrent execution.
Concurrency introduces critical sections, race conditions, and synchronization challenges. Semaphores and mutexes prevent mutual exclusion violations.
Deadlocks require four simultaneous conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.
Virtual memory utilizes paging and page replacement algorithms (LRU, FIFO, Clock) to map virtual addresses to physical frames while managing page faults.`,
    },
  });

  // 3. Create sample generated quiz
  const quiz = await prisma.generatedQuiz.upsert({
    where: { id: "demo-quiz-001" },
    update: {},
    create: {
      id: "demo-quiz-001",
      documentId: doc.id,
      title: "OS Concurrency & Memory Mastery Test",
      questionCount: 4,
      shareCode: "OS-TEST",
      format: "MCQ",
      timeLimit: 300,
    },
  });

  // 4. Create sample questions with distinct topic tags
  const q1 = await prisma.question.upsert({
    where: { id: "demo-q-001" },
    update: {},
    create: {
      id: "demo-q-001",
      quizId: quiz.id,
      question: "Which of the following is NOT one of Coffman's four conditions for deadlock?",
      options: ["Mutual Exclusion", "Hold and Wait", "Preemptive Scheduling", "Circular Wait"],
      correctAnswer: "Preemptive Scheduling",
      explanation: "Coffman's conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
      difficulty: "MEDIUM",
      topic: "Deadlock Avoidance",
      type: "MCQ",
      orderIndex: 0,
    },
  });

  const q2 = await prisma.question.upsert({
    where: { id: "demo-q-002" },
    update: {},
    create: {
      id: "demo-q-002",
      quizId: quiz.id,
      question: "A counting semaphore initialized to 3 allows at most how many threads into the critical section concurrently?",
      options: ["1", "2", "3", "Unlimited"],
      correctAnswer: "3",
      explanation: "A counting semaphore initialized to N permits N concurrent accesses before blocking.",
      difficulty: "EASY",
      topic: "Process Synchronization",
      type: "MCQ",
      orderIndex: 1,
    },
  });

  const q3 = await prisma.question.upsert({
    where: { id: "demo-q-003" },
    update: {},
    create: {
      id: "demo-q-003",
      quizId: quiz.id,
      question: "In virtual memory, what hardware component caches page table lookups to accelerate virtual-to-physical translation?",
      options: ["Translation Lookaside Buffer (TLB)", "Instruction Register", "ALU Cache", "Disk Buffer"],
      correctAnswer: "Translation Lookaside Buffer (TLB)",
      explanation: "The TLB is a dedicated MMU cache for page table mappings.",
      difficulty: "EASY",
      topic: "Virtual Memory",
      type: "MCQ",
      orderIndex: 2,
    },
  });

  const q4 = await prisma.question.upsert({
    where: { id: "demo-q-004" },
    update: {},
    create: {
      id: "demo-q-004",
      quizId: quiz.id,
      question: "Which page replacement algorithm suffers from Belady's Anomaly?",
      options: ["FIFO", "LRU", "Optimal", "Clock Algorithm"],
      correctAnswer: "FIFO",
      explanation: "First-In-First-Out (FIFO) can produce more page faults when allocated more physical frames.",
      difficulty: "HARD",
      topic: "Virtual Memory",
      type: "MCQ",
      orderIndex: 3,
    },
  });

  // 5. Create historical attempt with realistic diagnostic breakdown (Weak in Process Synchronization)
  const attempt = await prisma.attempt.upsert({
    where: { id: "demo-attempt-001" },
    update: {},
    create: {
      id: "demo-attempt-001",
      userId: user.id,
      quizId: quiz.id,
      score: 3,
      totalQuestions: 4,
      percentage: 75.0,
      timeSpentSeconds: 142,
      mode: "PRACTICE",
      completedAt: new Date(),
    },
  });

  // Record answers
  await prisma.answer.createMany({
    data: [
      { attemptId: attempt.id, questionId: q1.id, selectedAnswer: "Preemptive Scheduling", isCorrect: true },
      { attemptId: attempt.id, questionId: q2.id, selectedAnswer: "1", isCorrect: false }, // Missed Process Synchronization
      { attemptId: attempt.id, questionId: q3.id, selectedAnswer: "Translation Lookaside Buffer (TLB)", isCorrect: true },
      { attemptId: attempt.id, questionId: q4.id, selectedAnswer: "FIFO", isCorrect: true },
    ],
    skipDuplicates: true,
  });

  // 6. Create Flashcard deck with active SM-2 repetition schedules
  const deck = await prisma.flashcardDeck.upsert({
    where: { id: "demo-deck-001" },
    update: {},
    create: {
      id: "demo-deck-001",
      documentId: doc.id,
      title: "Operating Systems — Core Flashcards",
      cardCount: 3,
      shareCode: "FD-OS01",
    },
  });

  const card1 = await prisma.flashcard.upsert({
    where: { id: "demo-card-001" },
    update: {},
    create: {
      id: "demo-card-001",
      deckId: deck.id,
      front: "What is the primary difference between a Mutex and a Binary Semaphore?",
      back: "A Mutex has ownership semantics (only the thread that locked it can unlock it). A Semaphore can be signaled by any thread.",
    },
  });

  const card2 = await prisma.flashcard.upsert({
    where: { id: "demo-card-002" },
    update: {},
    create: {
      id: "demo-card-002",
      deckId: deck.id,
      front: "What is Belady's Anomaly in Virtual Memory?",
      back: "A phenomenon in FIFO page replacement where increasing physical memory page frames increases the number of page faults.",
    },
  });

  // Seed active SM-2 progress
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 6);

  await prisma.flashcardProgress.upsert({
    where: { userId_cardId: { userId: user.id, cardId: card1.id } },
    update: {},
    create: {
      userId: user.id,
      cardId: card1.id,
      interval: 1,
      repetitions: 1,
      easeFactor: 2.5,
      nextReview: tomorrow,
    },
  });

  await prisma.flashcardProgress.upsert({
    where: { userId_cardId: { userId: user.id, cardId: card2.id } },
    update: {},
    create: {
      userId: user.id,
      cardId: card2.id,
      interval: 6,
      repetitions: 2,
      easeFactor: 2.6,
      nextReview: nextWeek,
    },
  });

  console.log("🎉 Seeding complete! Pre-populated documents, quizzes, diagnostic stats, and SM-2 flashcards.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
