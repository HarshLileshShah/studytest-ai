import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateSM2 } from "../services/flashcard.service";

describe("SuperMemo-2 (SM-2) Spaced Repetition Algorithm", () => {
  it("should initialize first repetition with interval = 1 on quality >= 3", () => {
    const result = calculateSM2(4, 0, 0, 2.5);
    assert.equal(result.repetitions, 1);
    assert.equal(result.interval, 1);
    assert.equal(Math.round(result.easeFactor * 100) / 100, 2.5);
  });

  it("should advance to interval = 6 on second successful repetition (rep = 1)", () => {
    const result = calculateSM2(5, 1, 1, 2.5);
    assert.equal(result.repetitions, 2);
    assert.equal(result.interval, 6);
    assert.ok(result.easeFactor > 2.5, "Ease factor should increase on perfect recall");
  });

  it("should multiply interval by ease factor on third and subsequent repetitions", () => {
    const result = calculateSM2(4, 2, 6, 2.6);
    assert.equal(result.repetitions, 3);
    assert.equal(result.interval, Math.round(6 * 2.6)); // 16 days
  });

  it("should reset repetitions to 0 and interval to 1 on failure (quality < 3)", () => {
    const result = calculateSM2(2, 5, 45, 2.4);
    assert.equal(result.repetitions, 0);
    assert.equal(result.interval, 1);
    assert.ok(result.easeFactor < 2.4, "Ease factor should decrease on recall failure");
  });

  it("should clamp ease factor to minimum 1.3 to avoid interval collapse", () => {
    let ef = 1.4;
    for (let i = 0; i < 5; i++) {
      const res = calculateSM2(0, 0, 1, ef);
      ef = res.easeFactor;
    }
    assert.ok(Math.abs(ef - 1.3) < 0.0001, `EF should clamp to ~1.3, got ${ef}`);
  });

  it("should clamp quality inputs within 0 to 5 bounds safely", () => {
    const underflow = calculateSM2(-10, 0, 0, 2.5);
    assert.equal(underflow.repetitions, 0); // Treated as quality 0 (failure)

    const overflow = calculateSM2(100, 0, 0, 2.5);
    assert.equal(overflow.repetitions, 1); // Treated as quality 5 (perfect)
  });
});
