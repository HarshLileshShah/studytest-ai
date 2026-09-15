import { describe, it } from "node:test";
import assert from "node:assert/strict";

function checkDemoLimits(userId: string, currentDocs: number, currentQuizzes: number) {
  const isDemo = userId.startsWith("demo_");
  if (!isDemo) {
    return { canUpload: true, canGenerateQuiz: true };
  }
  return {
    isDemo: true,
    canUpload: currentDocs < 1,
    canGenerateQuiz: currentQuizzes < 1,
    docLimitReached: currentDocs >= 1,
    quizLimitReached: currentQuizzes >= 1,
  };
}

describe("Demo Account Limit Validation Engine", () => {
  it("should permit regular registered users unlimited uploads and quizzes", () => {
    const regUser = checkDemoLimits("usr_regular_12345", 5, 12);
    assert.equal(regUser.canUpload, true);
    assert.equal(regUser.canGenerateQuiz, true);
  });

  it("should permit a fresh demo user their first document and first test", () => {
    const freshDemo = checkDemoLimits("demo_17263849_abc", 0, 0);
    assert.equal(freshDemo.isDemo, true);
    assert.equal(freshDemo.canUpload, true);
    assert.equal(freshDemo.canGenerateQuiz, true);
    assert.equal(freshDemo.docLimitReached, false);
    assert.equal(freshDemo.quizLimitReached, false);
  });

  it("should block second document upload for demo users", () => {
    const demoWithOneDoc = checkDemoLimits("demo_17263849_abc", 1, 0);
    assert.equal(demoWithOneDoc.canUpload, false);
    assert.equal(demoWithOneDoc.docLimitReached, true);
    assert.equal(demoWithOneDoc.canGenerateQuiz, true);
  });

  it("should block second test generation for demo users", () => {
    const demoWithOneQuiz = checkDemoLimits("demo_17263849_abc", 1, 1);
    assert.equal(demoWithOneQuiz.canUpload, false);
    assert.equal(demoWithOneQuiz.canGenerateQuiz, false);
    assert.equal(demoWithOneQuiz.quizLimitReached, true);
  });
});
