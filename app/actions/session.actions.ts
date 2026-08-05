"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAIClient } from "@/services/ai.service";

interface SlideInput {
  type: "INFO" | "MULTIPLE_CHOICE" | "WORD_CLOUD" | "LEADERBOARD" | "Q_A" | "POLL";
  title: string;
  content?: string;
  options?: string[];
  correctAnswer?: string;
}

async function getUniqueSessionCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (true) {
    let code = "LIVE-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await prisma.interactiveSession.findUnique({
      where: { shareCode: code },
    });
    if (!existing) {
      return code;
    }
  }
}

/**
 * Server Action: Start a new live presentation from a study document.
 */
export async function createSessionAction(documentId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return { success: false, error: "Document not found." };
    }

    let slidesData: SlideInput[] = [];

    try {
      const { client: aiClient, model: aiModel } = await getAIClient();
      const textSnippet = (doc.extractedText || "").slice(0, 5000);

      const aiPrompt = `You are an expert slides designer. Create a structured presentation slideshow for a classroom live interactive session based on this text.
Return a JSON object containing a "slides" array.
Each slide has:
- type: one of "INFO" (content slide), "MULTIPLE_CHOICE" (interactive quiz question), "WORD_CLOUD" (tag input)
- title: concise slide header (max 50 chars)
- content: (string) bullet-point notes or outline content for the slide. (Set to null or empty for word_cloud if irrelevant). Keep bullets clear and concise (max 3 bullets, each under 80 characters).
- options: (array of strings, optional) only for MULTIPLE_CHOICE slide (exactly 4 options).
- correctAnswer: (string, optional) only for MULTIPLE_CHOICE slide (must match one of the options).

Create exactly these 7 slides in this order:
1. Welcome Slide (type: INFO, title: "Welcome to Live Study Session!", content: "Join using the code on screen. Get ready to interact!")
2. Overview (type: INFO, title: "Overview of Topic", content: "Summarize general overview of content from: ${doc.title.slice(0, 30)}")
3. Key Concept A (type: INFO, title: "First Core Concept", content: "Key outline points")
4. Key Concept B (type: INFO, title: "Second Core Concept", content: "Key outline points")
5. Interactive Poll (type: WORD_CLOUD, title: "Share Your Thoughts", content: "In 1-2 words, what is the most important takeaway so far?")
6. MCQ Quiz 1 (type: MULTIPLE_CHOICE, title: "Quiz Challenge 1", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "correct one")
7. MCQ Quiz 2 (type: MULTIPLE_CHOICE, title: "Quiz Challenge 2", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "correct one")

Reference text for slides content generation:
---
${textSnippet}
---

Make sure the output matches JSON format exactly.`;

      const response = await aiClient.chat.completions.create({
        model: aiModel,
        messages: [
          { role: "system", content: "You are a dynamic presentation builder returning strictly raw JSON format." },
          { role: "user", content: aiPrompt },
        ],
        temperature: 0.3,
      });

      const rawContent = response.choices[0]?.message?.content || "";
      const cleanJson = rawContent.replace(/```json\s*|```/gi, "").trim();
      const data = JSON.parse(cleanJson);
      slidesData = data.slides || [];
    } catch (aiError) {
      console.warn("AI slides generation failed, falling back to static presentation slides:", aiError);
      slidesData = [
        {
          type: "INFO",
          title: "Welcome to Live Study Session!",
          content: "Join using the code on screen. Get ready to interact!"
        },
        {
          type: "INFO",
          title: `Overview: ${doc.title.slice(0, 30)}`,
          content: `Let's study the material from ${doc.title}. Presenter will guide you through the key concepts.`
        },
        {
          type: "INFO",
          title: "First Core Concept",
          content: "Review key points, diagrams, and formulas in the document."
        },
        {
          type: "WORD_CLOUD",
          title: "Share Your Thoughts",
          content: "In 1-2 words, what is the most important takeaway so far?"
        },
        {
          type: "MULTIPLE_CHOICE",
          title: "Quiz Challenge 1",
          options: ["Option A (Correct)", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A (Correct)"
        }
      ];
    }

    // Manually append Q&A and final Leaderboard slides
    slidesData.push({
      type: "Q_A",
      title: "Audience Q&A",
      content: "Submit questions you have to the presenter!",
    });

    slidesData.push({
      type: "LEADERBOARD",
      title: "Class Leaderboard Podium",
      content: "Here is the final score standing!",
    });

    const shareCode = await getUniqueSessionCode();

    const activeSession = await prisma.interactiveSession.create({
      data: {
        documentId,
        hostId: userId,
        shareCode,
        status: "LOBBY",
        slides: {
          create: slidesData.map((s, idx) => ({
            slideIndex: idx,
            type: s.type,
            title: s.title,
            content: s.content || null,
            options: s.options || undefined,
            correctAnswer: s.correctAnswer || null,
          })),
        },
      },
      include: {
        slides: true,
      },
    });

    return { success: true, sessionId: activeSession.id };
  } catch (error) {
    console.error("Failed to create live presentation session:", error);
    return { success: false, error: "Failed to build presentation slide deck." };
  }
}

/**
 * Server Action: Join an active presentation session.
 */
export async function joinSessionAction(shareCode: string, name: string) {
  const session = await auth();
  const userId = session?.user?.id || `anon-${Math.random().toString(36).substr(2, 9)}`;
  const userName = name.trim() || session?.user?.name || "Anonymous Learner";

  try {
    const activeSession = await prisma.interactiveSession.findFirst({
      where: {
        shareCode: shareCode.toUpperCase().trim(),
        status: { in: ["LOBBY", "ACTIVE"] },
      },
    });

    if (!activeSession) {
      return { success: false, error: "Active session code not found." };
    }

    // Register player
    const participant = await prisma.sessionParticipant.upsert({
      where: {
        sessionId_userId: {
          sessionId: activeSession.id,
          userId,
        },
      },
      update: {
        userName,
      },
      create: {
        sessionId: activeSession.id,
        userId,
        userName,
      },
    });

    return { success: true, sessionId: activeSession.id, userId: participant.userId };
  } catch (error) {
    console.error("Failed to join live session:", error);
    return { success: false, error: "Failed to join live session." };
  }
}

/**
 * Server Action: Get state for the Presenter page.
 */
export async function getPresenterSessionState(sessionId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const activeSession = await prisma.interactiveSession.findUnique({
      where: { id: sessionId },
      include: {
        slides: {
          orderBy: { slideIndex: "asc" },
          include: {
            responses: true,
          },
        },
        participants: {
          orderBy: { score: "desc" },
        },
        qaQuestions: {
          orderBy: [{ isAnswered: "asc" }, { likes: "desc" }],
        },
      },
    });

    if (!activeSession) {
      return { success: false, error: "Session not found." };
    }

    if (activeSession.hostId !== userId) {
      return { success: false, error: "Unauthorized host view." };
    }

    return {
      success: true,
      status: activeSession.status,
      shareCode: activeSession.shareCode,
      currentSlideIndex: activeSession.currentSlideIndex,
      slides: activeSession.slides,
      participants: activeSession.participants,
      qaQuestions: activeSession.qaQuestions,
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch session state." };
  }
}

/**
 * Server Action: Get state for the Student/Participant client.
 */
export async function getParticipantSessionState(sessionId: string, participantUserId: string) {
  try {
    const activeSession = await prisma.interactiveSession.findUnique({
      where: { id: sessionId },
      include: {
        slides: {
          orderBy: { slideIndex: "asc" },
        },
        participants: true,
      },
    });

    if (!activeSession) {
      return { success: false, error: "Session not found." };
    }

    const currentSlide = activeSession.slides.find(
      (s) => s.slideIndex === activeSession.currentSlideIndex
    );

    if (!currentSlide) {
      return { success: false, error: "Slide not found." };
    }

    // Check if participant has already answered this slide
    const myResponse = await prisma.sessionResponse.findUnique({
      where: {
        slideId_userId: {
          slideId: currentSlide.id,
          userId: participantUserId,
        },
      },
    });

    // Check upvoteable Q&As for this session
    const qaQuestions = await prisma.sessionQA.findMany({
      where: { sessionId },
      orderBy: [{ isAnswered: "asc" }, { likes: "desc" }],
    });

    return {
      success: true,
      status: activeSession.status,
      currentSlideIndex: activeSession.currentSlideIndex,
      currentSlide: {
        id: currentSlide.id,
        type: currentSlide.type,
        title: currentSlide.title,
        content: currentSlide.content,
        options: currentSlide.options ? (currentSlide.options as string[]) : null,
      },
      hasSubmitted: !!myResponse,
      myResponse: myResponse ? myResponse.value : null,
      qaQuestions,
    };
  } catch (error) {
    return { success: false, error: "Failed to synchronize session." };
  }
}

/**
 * Server Action: Advance slides (Presenter only).
 */
export async function advanceSlideAction(sessionId: string, direction: "next" | "prev" | "start") {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const activeSession = await prisma.interactiveSession.findUnique({
      where: { id: sessionId },
      include: { slides: true },
    });

    if (!activeSession || activeSession.hostId !== userId) {
      return { success: false, error: "Unauthorized." };
    }

    let nextIndex = activeSession.currentSlideIndex;
    let nextStatus = activeSession.status;

    if (direction === "start") {
      nextStatus = "ACTIVE";
      nextIndex = 0;
    } else if (direction === "next") {
      if (nextIndex < activeSession.slides.length - 1) {
        nextIndex += 1;
      } else {
        nextStatus = "FINISHED";
      }
    } else if (direction === "prev") {
      if (nextIndex > 0) {
        nextIndex -= 1;
      }
    }

    await prisma.interactiveSession.update({
      where: { id: sessionId },
      data: {
        currentSlideIndex: nextIndex,
        status: nextStatus,
      },
    });

    revalidatePath(`/documents/present/${sessionId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update slides." };
  }
}

/**
 * Server Action: Submit slides response/votes.
 */
export async function submitSlideResponseAction(slideId: string, value: string, participantUserId: string) {
  try {
    const slide = await prisma.sessionSlide.findUnique({
      where: { id: slideId },
      include: { session: true },
    });

    if (!slide) {
      return { success: false, error: "Slide not found." };
    }

    const participant = await prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: slide.sessionId,
          userId: participantUserId,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "Participant not registered in this session." };
    }

    // Determine scoring for MCQ slides
    let scoreEarned = 0;
    if (slide.type === "MULTIPLE_CHOICE") {
      // Direct exact match validation
      const isCorrect = slide.correctAnswer && value.trim().toLowerCase() === slide.correctAnswer.trim().toLowerCase();
      if (isCorrect) {
        // Correct answer gets 100 points
        scoreEarned = 100;
      }
    }

    const response = await prisma.sessionResponse.upsert({
      where: {
        slideId_userId: {
          slideId,
          userId: participantUserId,
        },
      },
      update: {
        value: value.trim(),
        scoreEarned,
      },
      create: {
        slideId,
        userId: participantUserId,
        userName: participant.userName,
        value: value.trim(),
        scoreEarned,
      },
    });

    // Update participant total score if correct answer
    if (scoreEarned > 0) {
      await prisma.sessionParticipant.update({
        where: {
          sessionId_userId: {
            sessionId: slide.sessionId,
            userId: participantUserId,
          },
        },
        data: {
          score: {
            increment: scoreEarned,
          },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit response:", error);
    return { success: false, error: "Failed to submit response." };
  }
}

/**
 * Server Action: Submit question to Audience Q&A list.
 */
export async function submitSessionQAAction(sessionId: string, text: string, participantUserId: string) {
  try {
    const participant = await prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: participantUserId,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "Participant not registered." };
    }

    await prisma.sessionQA.create({
      data: {
        sessionId,
        userId: participantUserId,
        userName: participant.userName,
        questionText: text.trim(),
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to post question." };
  }
}

/**
 * Server Action: Upvote a Q&A question.
 */
export async function upvoteQAAction(qaId: string) {
  try {
    await prisma.sessionQA.update({
      where: { id: qaId },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to upvote." };
  }
}

/**
 * Server Action: Flag a Q&A question as answered (Presenter only).
 */
export async function markQAAnsweredAction(qaId: string) {
  try {
    await prisma.sessionQA.update({
      where: { id: qaId },
      data: {
        isAnswered: true,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to flag answered question." };
  }
}

/**
 * Server Action: Update presentation slides (Host only, during LOBBY status).
 */
export async function updateSessionSlidesAction(
  sessionId: string,
  slides: Array<{
    type: "INFO" | "MULTIPLE_CHOICE" | "WORD_CLOUD" | "LEADERBOARD" | "Q_A";
    title: string;
    content?: string | null;
    options?: string[] | null;
    correctAnswer?: string | null;
  }>
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const activeSession = await prisma.interactiveSession.findUnique({
      where: { id: sessionId },
    });

    if (!activeSession || activeSession.hostId !== userId) {
      return { success: false, error: "Unauthorized." };
    }

    if (activeSession.status !== "LOBBY") {
      return { success: false, error: "Slides can only be edited while in lobby." };
    }

    // Delete existing slides safely
    await prisma.sessionSlide.deleteMany({
      where: { sessionId },
    });

    // Create the updated slide collection
    await prisma.sessionSlide.createMany({
      data: slides.map((s, idx) => ({
        sessionId,
        slideIndex: idx,
        type: s.type,
        title: s.title,
        content: s.content || null,
        options: s.options || undefined,
        correctAnswer: s.correctAnswer || null,
      })),
    });

    revalidatePath(`/documents/present/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update slides:", error);
    return { success: false, error: "Failed to update slides." };
  }
}
