/** Configurable thresholds for matching — single source of truth. */

export const PILLAR_WEIGHTS = {
  skills: 0.35,
  availability: 0.25,
  workStyle: 0.2,
  motivation: 0.15,
  experience: 0.05,
} as const;

/** Minimum trio overall score to form a trio. */
export const TRIO_MIN_SCORE_THRESHOLD = 70;

/** Minimum pairwise score between at least 2 members in a trio. */
export const TRIO_PAIR_SCORE_THRESHOLD = 65;

/** Hours per week gap above which we penalize heavily (availability). */
export const AVAILABILITY_HOURS_GAP_PENALTY = 10;
