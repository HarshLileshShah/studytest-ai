"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const AI_MODEL = "llama-3.3-70b-versatile";

interface OralMessage {
  role: "tutor" | "student";
  text: string;
}

/**
 * Server Action: Generate the first oral exam question to start the session.
 */
export async function startOralExamAction(documentId: string, mode: "standard" | "viva" = "standard") {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { extractedText: true },
    });

    if (!doc || !doc.extractedText) {
      return { success: false, error: "Document content not found." };
    }

    const persona = mode === "viva"
      ? "You are a strict, formal university viva-voce examiner or a technical interviewer. You test the student rigorously, requesting precise technical terms, challenging assumptions, and maintaining a high academic standard. Keep your questions challenging but professional."
      : "You are an encouraging, friendly oral study tutor examiner who helps the student practice and feel comfortable speaking about the material.";

    const systemPrompt = `${persona}
You are testing the student on this material:
---
${doc.extractedText.slice(0, 4000)}
---
Ask a single initial question based on the document material to start the oral exam.
Keep it conversational, natural, and short (1-2 sentences), suitable for reading aloud.
Do not use bullet points, symbols, markdown, or bold tags.

FORMAT:
Return a JSON object with:
- "question": "The first question to ask."`;

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const rawJSON = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(rawJSON);

    return {
      success: true,
      question: data.question || "Let's begin. Can you summarize the core concept of this document?",
    };
  } catch (error) {
    console.error("Failed to start oral exam:", error);
    return { success: false, error: "Failed to generate first question." };
  }
}

/**
 * Server Action: Evaluate the student's verbal response and generate the next oral question.
 */
export async function evaluateOralResponseAction(
  documentId: string,
  currentQuestion: string,
  userAnswer: string,
  history: OralMessage[],
  mode: "standard" | "viva" = "standard"
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    // 1. Fetch document text
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { extractedText: true },
    });

    if (!doc || !doc.extractedText) {
      return { success: false, error: "Document content not found." };
    }

    const persona = mode === "viva"
      ? "You are a strict, formal university viva-voce examiner or a technical interviewer. Renders evaluations focusing heavily on technical correctness, completeness, precise terminology, and confidence. Be direct, point out any flaws or gaps in their response, and ask a demanding follow-up question."
      : "You are an encouraging, friendly oral tutor. Provide positive reinforcement, summarize what they got right, correct any errors gently, and ask a friendly next question.";

    // 2. Build AI prompt
    const systemPrompt = `${persona}
You are testing the student on the following material:
---
${doc.extractedText.slice(0, 4000)}
---

Your role:
1. Review the student's answer to your last question: "${currentQuestion}".
2. Evaluate their answer: state if they are correct, partially correct, or incorrect, and provide a BRIEF (1-2 sentences) explanation of why.
3. Ask a single follow-up question related to the document material to keep the exam going.
4. Keep your responses short, natural, and conversational, since they will be read aloud by Text-to-Speech! Avoid bullet points, symbols, markdown styling, or bold tags.

FORMAT REQUIREMENT:
Return a JSON object with:
- "evaluation": "A short verbal assessment of their answer." (e.g., "That's exactly right. Microservices indeed scale independently.")
- "nextQuestion": "The next single question to ask the student." (e.g., "Now, can you explain what a load balancer is?")`;

    const userPrompt = `Here is the conversation history:
${history.map((h) => `${h.role === "tutor" ? "Tutor" : "Student"}: ${h.text}`).join("\n")}

Student's new answer: "${userAnswer}"

Evaluate their answer and ask the next question in JSON format.`;

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const rawJSON = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(rawJSON);

    return {
      success: true,
      evaluation: data.evaluation || "I see. Let's move on.",
      nextQuestion: data.nextQuestion || "Can you tell me more about the core concepts of this document?",
    };
  } catch (error) {
    console.error("Oral exam evaluation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Oral exam evaluation failed",
    };
  }
}

/**
 * Server Action: Grade the overall session at completion and summarize performance.
 */
export async function gradeOralSessionAction(
  history: OralMessage[],
  mode: "standard" | "viva" = "standard"
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const isViva = mode === "viva";
    const systemPrompt = isViva
      ? `You are a strict technical viva voce examiner panel.
Evaluate the student's performance from the oral exam history.
You must grade the student rigorously out of 100 on three metrics:
1. Technical Accuracy (correctness, precision)
2. Clarity & Spoken Confidence (avoiding stutter, direct answers)
3. Domain Vocabulary (using correct terminology)

OUTPUT FORMAT:
Return a JSON object containing:
- "summary": "A formal, objective final summary assessment of their performance."
- "accuracyScore": Integer score (0-100)
- "confidenceScore": Integer score (0-100)
- "vocabularyScore": Integer score (0-100)
- "strengths": ["Strong concept 1", "Strong concept 2"]
- "weaknesses": ["Weak concept 1", "Weak concept 2"]`
      : `You are a study tutor reviewing an oral exam session.
Evaluate the student's performance based on the conversation history.
Summarize:
1. What concepts they understood well (Strengths).
2. What concepts they struggled with or answered incorrectly (Weaknesses/Gaps).
3. A final encouragement.

FORMAT:
Return a JSON object with:
- "summary": "The verbal summary explanation."`;

    const userPrompt = `Here is the full conversation history:
${history.map((h) => `${h.role === "tutor" ? "Tutor" : "Student"}: ${h.text}`).join("\n")}`;

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const rawJSON = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(rawJSON);

    if (isViva) {
      return {
        success: true,
        isViva: true,
        summary: data.summary || "Viva session review complete.",
        accuracyScore: data.accuracyScore || 70,
        confidenceScore: data.confidenceScore || 75,
        vocabularyScore: data.vocabularyScore || 70,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
      };
    }

    return {
      success: true,
      isViva: false,
      summary: data.summary || "Oral practice session complete.",
    };
  } catch (error) {
    console.error("Oral exam grading session failed:", error);
    return { success: false, error: "Grading session failed." };
  }
}
