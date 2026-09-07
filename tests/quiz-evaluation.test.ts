import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Pure evaluation function matching the business logic in evaluation.service.ts
export function evaluateMCQAnswer(selected: string, correct: string): boolean {
  return selected.trim().toLowerCase() === correct.trim().toLowerCase();
}

export function calculateQuizScore(
  answers: { selectedAnswer: string; correctAnswer: string }[]
): { score: number; totalQuestions: number; percentage: number } {
  let score = 0;
  for (const a of answers) {
    if (evaluateMCQAnswer(a.selectedAnswer, a.correctAnswer)) {
      score++;
    }
  }
  const totalQuestions = answers.length;
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  return { score, totalQuestions, percentage };
}

describe("Quiz Evaluation Engine", () => {
  it("should accurately grade correct MCQ answers regardless of casing or whitespace", () => {
    assert.equal(evaluateMCQAnswer("Photosynthesis", "photosynthesis"), true);
    assert.equal(evaluateMCQAnswer("  Mitochondria  ", "mitochondria"), true);
    assert.equal(evaluateMCQAnswer("Option A", "Option B"), false);
  });

  it("should calculate 100% percentage on all correct answers", () => {
    const questions = [
      { selectedAnswer: "A", correctAnswer: "a" },
      { selectedAnswer: "B", correctAnswer: "B" },
    ];
    const result = calculateQuizScore(questions);
    assert.equal(result.score, 2);
    assert.equal(result.totalQuestions, 2);
    assert.equal(result.percentage, 100);
  });

  it("should calculate partial percentages correctly", () => {
    const questions = [
      { selectedAnswer: "A", correctAnswer: "A" },
      { selectedAnswer: "B", correctAnswer: "C" },
      { selectedAnswer: "D", correctAnswer: "D" },
      { selectedAnswer: "A", correctAnswer: "B" },
    ];
    const result = calculateQuizScore(questions);
    assert.equal(result.score, 2);
    assert.equal(result.totalQuestions, 4);
    assert.equal(result.percentage, 50);
  });

  it("should handle empty question arrays without division by zero errors", () => {
    const result = calculateQuizScore([]);
    assert.equal(result.score, 0);
    assert.equal(result.totalQuestions, 0);
    assert.equal(result.percentage, 0);
  });
});
