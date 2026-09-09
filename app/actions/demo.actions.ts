"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Load rich sample demo data for the current logged-in user with 1 click.
 */
export async function loadSampleDemoDataAction() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Create or ensure user profile has initial streak and gamification
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: Math.max(3, (await prisma.user.findUnique({ where: { id: userId } }))?.streakCount || 0),
        xp: { increment: 250 },
        gold: { increment: 50 },
        level: 2,
        activeTitle: "Concurrency Master",
      },
    });

    // 2. Create sample study document
    const doc = await prisma.document.create({
      data: {
        userId,
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
    const quiz = await prisma.generatedQuiz.create({
      data: {
        documentId: doc.id,
        title: "OS Concurrency & Memory Mastery Test",
        questionCount: 4,
        shareCode: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
        format: "MCQ",
        timeLimit: 300,
        questions: {
          create: [
            {
              question: "Which of the following is NOT one of Coffman's four conditions for deadlock?",
              options: ["Mutual Exclusion", "Hold and Wait", "Preemptive Scheduling", "Circular Wait"],
              correctAnswer: "Preemptive Scheduling",
              explanation: "Coffman's conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
              difficulty: "MEDIUM",
              topic: "Deadlock Avoidance",
              type: "MCQ",
              orderIndex: 0,
            },
            {
              question: "A counting semaphore initialized to 3 allows at most how many threads into the critical section concurrently?",
              options: ["1", "2", "3", "Unlimited"],
              correctAnswer: "3",
              explanation: "A counting semaphore initialized to N permits N concurrent accesses before blocking.",
              difficulty: "EASY",
              topic: "Process Synchronization",
              type: "MCQ",
              orderIndex: 1,
            },
            {
              question: "In virtual memory, what hardware component caches page table lookups to accelerate virtual-to-physical translation?",
              options: ["Translation Lookaside Buffer (TLB)", "Instruction Register", "ALU Cache", "Disk Buffer"],
              correctAnswer: "Translation Lookaside Buffer (TLB)",
              explanation: "The TLB is a dedicated MMU cache for page table mappings.",
              difficulty: "EASY",
              topic: "Virtual Memory",
              type: "MCQ",
              orderIndex: 2,
            },
            {
              question: "Which page replacement algorithm suffers from Belady's Anomaly?",
              options: ["FIFO", "LRU", "Optimal", "Clock Algorithm"],
              correctAnswer: "FIFO",
              explanation: "First-In-First-Out (FIFO) can produce more page faults when allocated more physical frames.",
              difficulty: "HARD",
              topic: "Virtual Memory",
              type: "MCQ",
              orderIndex: 3,
            },
          ],
        },
      },
      include: {
        questions: true,
      },
    });

    // 4. Create historical attempt with realistic topic accuracy scores
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        quizId: quiz.id,
        score: 3,
        totalQuestions: 4,
        percentage: 75.0,
        timeSpentSeconds: 142,
        mode: "PRACTICE",
        completedAt: new Date(),
        answers: {
          create: [
            { questionId: quiz.questions[0].id, selectedAnswer: "Preemptive Scheduling", isCorrect: true },
            { questionId: quiz.questions[1].id, selectedAnswer: "1", isCorrect: false }, // Missed Process Synchronization -> triggers diagnostic heatmap
            { questionId: quiz.questions[2].id, selectedAnswer: "Translation Lookaside Buffer (TLB)", isCorrect: true },
            { questionId: quiz.questions[3].id, selectedAnswer: "FIFO", isCorrect: true },
          ],
        },
      },
    });

    // 5. Create sample Flashcards with SM-2 spaced repetition state
    const deck = await prisma.flashcardDeck.create({
      data: {
        documentId: doc.id,
        title: "Operating Systems — Core Flashcards",
        cardCount: 2,
        shareCode: `FD-${Math.floor(1000 + Math.random() * 9000)}`,
        flashcards: {
          create: [
            {
              front: "What is the primary difference between a Mutex and a Binary Semaphore?",
              back: "A Mutex has ownership semantics (only the thread that locked it can unlock it). A Semaphore can be signaled by any thread.",
            },
            {
              front: "What is Belady's Anomaly in Virtual Memory?",
              back: "A phenomenon in FIFO page replacement where increasing physical memory page frames increases the number of page faults.",
            },
          ],
        },
      },
      include: {
        flashcards: true,
      },
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 6);

    await prisma.flashcardProgress.createMany({
      data: [
        {
          userId,
          cardId: deck.flashcards[0].id,
          interval: 1,
          repetitions: 1,
          easeFactor: 2.5,
          nextReview: tomorrow,
        },
        {
          userId,
          cardId: deck.flashcards[1].id,
          interval: 6,
          repetitions: 2,
          easeFactor: 2.6,
          nextReview: nextWeek,
        },
      ],
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to load sample demo data:", error);
    return { success: false, error: "Failed to load sample course data" };
  }
}
