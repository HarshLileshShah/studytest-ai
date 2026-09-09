import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

// Schema definitions matching production schemas in services/ai.service.ts
const questionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()),
  correctAnswer: z.string().min(1),
  explanation: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  topic: z.string(),
});

const questionsResponseSchema = z.object({
  questions: z.array(questionSchema),
});

/**
 * Defensive parser helper extracting raw JSON from LLM outputs
 * handles code fences, conversational preambles, and whitespace.
 */
export function extractAndParseJSON<T>(rawLLMOutput: string): T {
  let cleaned = rawLLMOutput.trim();

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  // If the LLM included conversational preamble, locate the first '{' or '['
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const startIndex =
    firstBrace !== -1 && firstBracket !== -1
      ? Math.min(firstBrace, firstBracket)
      : firstBrace !== -1
      ? firstBrace
      : firstBracket;

  if (startIndex > 0) {
    const lastBrace = cleaned.lastIndexOf("}");
    const lastBracket = cleaned.lastIndexOf("]");
    const endIndex = Math.max(lastBrace, lastBracket);
    if (endIndex > startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
  }

  return JSON.parse(cleaned);
}

/**
 * Production business validation: Ensures correctAnswer exists within options for MCQs.
 */
export function validateAndFilterQuestions(
  parsedData: unknown,
  format: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" = "MCQ"
) {
  const validated = questionsResponseSchema.parse(parsedData);

  return validated.questions.filter((q) => {
    if (format === "SHORT_ANSWER") {
      return true; // Short answers don't require fixed options
    }
    // Strict invariant: correctAnswer MUST be one of the choices presented to the student
    return q.options.includes(q.correctAnswer);
  });
}

describe("Defensive JSON Parser & Schema Validation Engine", () => {
  it("should parse clean JSON without alteration", () => {
    const raw = JSON.stringify({
      questions: [
        {
          question: "What is 2+2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          explanation: "Basic arithmetic",
          difficulty: "EASY",
          topic: "Math",
        },
      ],
    });

    const parsed = extractAndParseJSON<{ questions: unknown[] }>(raw);
    assert.equal(parsed.questions.length, 1);
  });

  it("should strip markdown ```json ... ``` code fences from LLM responses", () => {
    const rawWithFences = "```json\n{\n  \"questions\": []\n}\n```";
    const parsed = extractAndParseJSON<{ questions: unknown[] }>(rawWithFences);
    assert.deepEqual(parsed, { questions: [] });
  });

  it("should extract JSON embedded within conversational preambles and footers", () => {
    const messyOutput = `Certainly! Here is the practice quiz generated from your lecture slides:

{
  "questions": [
    {
      "question": "Which organelle generates ATP?",
      "options": ["Ribosome", "Mitochondria", "Nucleus", "Golgi"],
      "correctAnswer": "Mitochondria",
      "explanation": "Mitochondria are the primary site of cellular ATP synthesis.",
      "difficulty": "EASY",
      "topic": "Cell Biology"
    }
  ]
}

I hope this helps your exam preparation!`;

    const parsed = extractAndParseJSON<{ questions: unknown[] }>(messyOutput);
    assert.equal(parsed.questions.length, 1);
  });

  it("should reject schemas with missing required fields via Zod validation", () => {
    const invalidPayload = {
      questions: [
        {
          question: "Incomplete question",
          // Missing options and correctAnswer
          difficulty: "EASY",
        },
      ],
    };

    assert.throws(() => {
      validateAndFilterQuestions(invalidPayload);
    }, z.ZodError);
  });

  it("should reject schemas with invalid enum values (e.g. difficulty: 'SUPER_HARD')", () => {
    const invalidDifficulty = {
      questions: [
        {
          question: "What is quantum tunneling?",
          options: ["A", "B", "C", "D"],
          correctAnswer: "A",
          explanation: "Physics",
          difficulty: "SUPER_HARD", // Invalid enum
          topic: "Physics",
        },
      ],
    };

    assert.throws(() => {
      validateAndFilterQuestions(invalidDifficulty);
    }, z.ZodError);
  });

  it("should filter out hallucinated questions where correctAnswer is not in options array", () => {
    const payloadWithHallucination = {
      questions: [
        {
          question: "Valid Question",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option B",
          explanation: "Valid",
          difficulty: "MEDIUM",
          topic: "General",
        },
        {
          question: "Hallucinated Question",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option Z (Not in options!)", // Hallucinated by LLM
          explanation: "Invalid",
          difficulty: "MEDIUM",
          topic: "General",
        },
      ],
    };

    const validQuestions = validateAndFilterQuestions(payloadWithHallucination, "MCQ");
    assert.equal(validQuestions.length, 1);
    assert.equal(validQuestions[0].question, "Valid Question");
  });

  it("should allow SHORT_ANSWER questions with empty options arrays", () => {
    const shortAnswerPayload = {
      questions: [
        {
          question: "Explain the purpose of the virtual DOM in React.",
          options: [],
          correctAnswer: "The virtual DOM enables efficient diffing and minimal real DOM mutations.",
          explanation: "Core React concept",
          difficulty: "MEDIUM",
          topic: "Web Development",
        },
      ],
    };

    const validQuestions = validateAndFilterQuestions(shortAnswerPayload, "SHORT_ANSWER");
    assert.equal(validQuestions.length, 1);
    assert.equal(validQuestions[0].options.length, 0);
  });
});
