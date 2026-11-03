/**
 * Spaced Repetition (Leitner / Exponential) Interval Engine for MindBloom
 */

export const STAGE_INTERVALS = [
  1,   // Stage 0: 1 day
  2,   // Stage 1: 2 days
  4,   // Stage 2: 4 days
  7,   // Stage 3: 7 days
  14,  // Stage 4: 14 days
  21,  // Stage 5: 21 days
  30,  // Stage 6: 30 days
  45,  // Stage 7: 45 days
  60,  // Stage 8: 60 days
  90,  // Stage 9: 90 days
  120, // Stage 10: 120 days (Mastered)
];

/**
 * Calculates the next stage, interval in days, and next review date.
 *
 * @param {number} currentStage - Current review stage (0-10)
 * @param {"forgot" | "partial" | "remembered"} result - User rating
 * @returns {{ newStage: number, intervalDays: number, nextReviewAt: Date, freshnessScore: number }}
 */
export function calculateNextReview(currentStage = 0, result = "remembered") {
  const safeStage = Math.max(0, Math.min(10, Number(currentStage) || 0));
  let newStage = safeStage;
  let intervalDays = 1;
  let freshnessScore = 100;

  switch (result) {
    case "forgot":
      // Reset back to stage 0
      newStage = 0;
      intervalDays = 1;
      freshnessScore = 40;
      break;

    case "partial":
      // Stay at current stage
      newStage = safeStage;
      intervalDays = Math.max(1, Math.round(STAGE_INTERVALS[safeStage] * 0.6));
      freshnessScore = 75;
      break;

    case "remembered":
    default:
      // Advance to next stage up to 10
      newStage = Math.min(10, safeStage + 1);
      intervalDays = STAGE_INTERVALS[newStage];
      freshnessScore = 100;
      break;
  }

  const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    newStage,
    intervalDays,
    nextReviewAt,
    freshnessScore,
  };
}

/**
 * Computes dynamic freshness score (0-100) based on time elapsed vs next review date.
 *
 * @param {Date | string} nextReviewAt - Scheduled next review date
 * @param {Date | string} lastReviewedAt - Last reviewed date or created date
 * @returns {number} Freshness score between 0 and 100
 */
export function computeDynamicFreshness(nextReviewAt, lastReviewedAt) {
  if (!nextReviewAt) return 100;

  const now = Date.now();
  const nextTime = new Date(nextReviewAt).getTime();
  const baseTime = lastReviewedAt
    ? new Date(lastReviewedAt).getTime()
    : nextTime - 2 * 24 * 60 * 60 * 1000;

  // If overdue
  if (now >= nextTime) {
    const daysOverdue = (now - nextTime) / (24 * 60 * 60 * 1000);
    // Drops from 50 down to 0 over 10 days overdue
    const decayedScore = Math.max(0, Math.round(50 - daysOverdue * 5));
    return decayedScore;
  }

  // Not yet due: score is between 50 and 100 based on remaining time fraction
  const totalDuration = Math.max(1, nextTime - baseTime);
  const remainingTime = nextTime - now;
  const ratio = Math.min(1, Math.max(0, remainingTime / totalDuration));

  return Math.round(50 + ratio * 50);
}

