/**
 * Pure SuperMemo-2 (SM-2) spaced repetition interval and ease factor calculation.
 * Safe for both Client Components and Server Actions.
 */
export interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
}

export function calculateSM2(
  quality: number,
  currentRepetitions: number = 0,
  currentInterval: number = 0,
  currentEaseFactor: number = 2.5
): SM2Result {
  // Validate quality bounds (0 to 5)
  const q = Math.max(0, Math.min(5, quality));

  let repetitions = currentRepetitions;
  let interval = currentInterval;
  let easeFactor = currentEaseFactor;

  if (q >= 3) {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Failed recall: reset repetitions and interval back to day 1
    repetitions = 0;
    interval = 1;
  }

  // Adjust Ease Factor (EF) according to standard SM-2 formula
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Lower bound clamping: EF must not drop below 1.3 to avoid retention collapse
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return { interval, repetitions, easeFactor };
}
