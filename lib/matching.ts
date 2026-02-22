/**
 * Matching algorithm: strictly per-group. Deterministic, no randomness.
 * Uses pillar weights and configurable thresholds from lib/matching-constants.
 * WEIGHTS: skills 0.35, availability 0.25, workStyle 0.20, motivation 0.15, experience 0.05.
 * THRESHOLDS: minTrioScore 70, minTrioPairScore 65.
 */
import {
  PILLAR_WEIGHTS,
  TRIO_MIN_SCORE_THRESHOLD,
  TRIO_PAIR_SCORE_THRESHOLD,
  AVAILABILITY_HOURS_GAP_PENALTY,
} from "./matching-constants";
import { HOURS_MAP } from "./questionnaire-data";
import type { MatchExplanation } from "@/types/database";

type Answers = Record<string, string | string[] | number>;

/** Skill complement matrix: technical→business:100, marketing:100, design:90, finance:70, technical:40; etc. */
const SKILL_MATRIX: Record<string, Record<string, number>> = {
  technical: { technical: 40, business: 100, marketing: 100, design: 90, finance: 70, other: 70 },
  business: { technical: 100, business: 40, marketing: 80, design: 90, finance: 80, other: 80 },
  marketing: { technical: 100, business: 80, marketing: 40, design: 90, finance: 70, other: 80 },
  design: { technical: 90, business: 90, marketing: 90, design: 40, finance: 70, other: 85 },
  finance: { technical: 70, business: 80, marketing: 70, finance: 40, other: 65 },
  other: { technical: 70, business: 80, marketing: 80, design: 85, finance: 65, other: 50 },
};

/** Returns 0–100 score for skill fit between two primary skills (q1). */
function skillsScore(a: Answers, b: Answers): number {
  const p1 = ((a.q1 as string) || "other").toLowerCase();
  const p2 = ((b.q1 as string) || "other").toLowerCase();
  return SKILL_MATRIX[p1]?.[p2] ?? 50;
}

/** scoreAvailability: penalize if hours/week gap > 10 (score drops by 30 per bracket gap). */
function availabilityScore(a: Answers, b: Answers): number {
  const h1 = HOURS_MAP[(a.q13 as string) || ""] ?? 0;
  const h2 = HOURS_MAP[(b.q13 as string) || ""] ?? 0;
  const gap = Math.abs(h1 - h2);
  const bracketGaps = gap > AVAILABILITY_HOURS_GAP_PENALTY ? Math.ceil((gap - AVAILABILITY_HOURS_GAP_PENALTY) / 10) : 0;
  let score = 100 - Math.min(100, gap * 4 + bracketGaps * 30);
  const tz1 = (a.q17 as string) || "";
  const tz2 = (b.q17 as string) || "";
  if (tz1 !== tz2) score *= 0.7;
  return Math.max(0, Math.min(100, score));
}

/** scoreWorkStyle: average similarity across structure(q13), comms(q15), deadlines(q16), ambiguity(q17). */
function workStyleScore(a: Answers, b: Answers): number {
  const single = (key: string) => (a[key] === b[key] ? 100 : 50) as number;
  const scale = (key: string) => {
    const x = Number(a[key]) || 0;
    const y = Number(b[key]) || 0;
    return Math.max(0, 100 - Math.abs(x - y) * 25);
  };
  return (single("q18") + scale("q19") + single("q21") + scale("q22") + single("q23")) / 5;
}

/** scoreMotivation: (shared motivation options / total unique options) * 100. */
function motivationScore(a: Answers, b: Answers): number {
  const arr1 = (Array.isArray(a.q24) ? a.q24 : [a.q24].filter(Boolean)) as string[];
  const arr2 = (Array.isArray(b.q24) ? b.q24 : [b.q24].filter(Boolean)) as string[];
  if (arr1.length === 0 && arr2.length === 0) return 70;
  const set2 = new Set(arr2);
  const overlap = arr1.filter((x) => set2.has(x)).length;
  const total = new Set([...arr1, ...arr2]).size;
  return total ? (overlap / total) * 100 : 70;
}

/** scoreExperience: abs(expLevel_a - expLevel_b) mapped to score (0 diff=100, 1=75, 2=50, 3+=25). */
function experienceScore(a: Answers, b: Answers): number {
  const levels = ["0", "1-2", "3-5", "6+"];
  const ia8 = levels.indexOf((a.q8 as string) || "");
  const ib8 = levels.indexOf((b.q8 as string) || "");
  const ia11 = levels.indexOf((a.q11 as string) || "");
  const ib11 = levels.indexOf((b.q11 as string) || "");
  const d = Math.max(Math.abs(ia8 - ib8), Math.abs(ia11 - ib11));
  const scoreMap: Record<number, number> = { 0: 100, 1: 75, 2: 50 };
  return d >= 3 ? 25 : (scoreMap[d as 0 | 1 | 2] ?? 50);
}

/** Weighted total 0–100. */
export function computePairScore(a: Answers, b: Answers): number {
  const s = PILLAR_WEIGHTS.skills * skillsScore(a, b);
  const av = PILLAR_WEIGHTS.availability * availabilityScore(a, b);
  const w = PILLAR_WEIGHTS.workStyle * workStyleScore(a, b);
  const m = PILLAR_WEIGHTS.motivation * motivationScore(a, b);
  const e = PILLAR_WEIGHTS.experience * experienceScore(a, b);
  return Math.round((s + av + w + m + e) * 100) / 100;
}

/** Build match explanation for a pair. */
export function buildPairExplanation(a: Answers, b: Answers, score: number): MatchExplanation {
  const primary = (a.q1 as string) || "";
  const primaryB = (b.q1 as string) || "";
  const complement: Record<string, string> = {
    technical: "Technical",
    business: "Business",
    design: "Design",
    marketing: "Marketing",
    finance: "Finance",
    other: "Other",
  };
  const complementary_strength =
    primary !== primaryB ? `${complement[primary] || primary} + ${complement[primaryB] || primaryB}` : undefined;
  const shared_trait = (a.q21 === b.q21 && "Both prefer " + (a.q21 === "async" ? "async communication" : a.q21 === "live" ? "live calls" : "mix of async and calls")) || undefined;
  const h1 = (a.q13 as string) || "";
  const h2 = (b.q13 as string) || "";
  const availability_insight = h1 && h2 ? `Both in ${h1 === h2 ? h1 : `${h1} / ${h2}`} commitment range` : undefined;
  return { complementary_strength, shared_trait, availability_insight };
}

export interface PairCandidate {
  userIds: [string, string];
  score: number;
  explanation: MatchExplanation;
}

export interface TrioCandidate {
  userIds: [string, string, string];
  score: number;
  explanation: MatchExplanation;
}

export interface MatchingInput {
  userIds: string[];
  answersByUser: Map<string, Answers>;
}

export interface MatchResult {
  pairMatches: Array<{ user_ids: string[]; compatibility_score: number; match_explanation: MatchExplanation }>;
  trioMatches: Array<{ user_ids: string[]; compatibility_score: number; match_explanation: MatchExplanation }>;
  unmatchedUserIds: string[];
}

/** Average of three pairwise scores for trio. */
function trioScore(ids: [string, string, string], answersByUser: Map<string, Answers>): number {
  const [i, j, k] = ids;
  const a = (computePairScore(answersByUser.get(i)!, answersByUser.get(j)!) + computePairScore(answersByUser.get(i)!, answersByUser.get(k)!) + computePairScore(answersByUser.get(j)!, answersByUser.get(k)!)) / 3;
  return Math.round(a * 100) / 100;
}

/** Greedy pair matching then trios for leftovers. */
export function runMatching(input: MatchingInput): MatchResult {
  const { userIds, answersByUser } = input;
  const used = new Set<string>();
  const pairMatches: MatchResult["pairMatches"] = [];
  const allPairs: PairCandidate[] = [];

  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const u1 = userIds[i];
      const u2 = userIds[j];
      const ans1 = answersByUser.get(u1);
      const ans2 = answersByUser.get(u2);
      if (!ans1 || !ans2) continue;
      const score = computePairScore(ans1, ans2);
      const explanation = buildPairExplanation(ans1, ans2, score);
      allPairs.push({ userIds: [u1, u2], score, explanation });
    }
  }
  allPairs.sort((a, b) => b.score - a.score);

  for (const p of allPairs) {
    if (used.has(p.userIds[0]) || used.has(p.userIds[1])) continue;
    used.add(p.userIds[0]);
    used.add(p.userIds[1]);
    pairMatches.push({
      user_ids: p.userIds,
      compatibility_score: p.score,
      match_explanation: p.explanation,
    });
  }

  const leftover = userIds.filter((id) => !used.has(id));
  const trioMatches: MatchResult["trioMatches"] = [];

  if (leftover.length >= 3) {
    const trios: TrioCandidate[] = [];
    for (let i = 0; i < leftover.length; i++) {
      for (let j = i + 1; j < leftover.length; j++) {
        for (let k = j + 1; k < leftover.length; k++) {
          const ids: [string, string, string] = [leftover[i], leftover[j], leftover[k]];
          const score = trioScore(ids, answersByUser);
          const p1 = computePairScore(answersByUser.get(ids[0])!, answersByUser.get(ids[1])!);
          const p2 = computePairScore(answersByUser.get(ids[0])!, answersByUser.get(ids[2])!);
          const p3 = computePairScore(answersByUser.get(ids[1])!, answersByUser.get(ids[2])!);
          const strongPairs = [p1, p2, p3].filter((s) => s > TRIO_PAIR_SCORE_THRESHOLD).length;
          if (score >= TRIO_MIN_SCORE_THRESHOLD && strongPairs >= 2) {
            const expl: MatchExplanation = {
              ...buildPairExplanation(answersByUser.get(ids[0])!, answersByUser.get(ids[1])!, p1),
              trio_balance: "Third member adds skill diversity",
            };
            trios.push({ userIds: ids, score, explanation: expl });
          }
        }
      }
    }
    trios.sort((a, b) => b.score - a.score);
    for (const t of trios) {
      if (t.userIds.every((id) => !used.has(id))) {
        t.userIds.forEach((id) => used.add(id));
        trioMatches.push({
          user_ids: t.userIds,
          compatibility_score: t.score,
          match_explanation: t.explanation,
        });
      }
    }
  }

  const unmatchedUserIds = userIds.filter((id) => !used.has(id));
  return { pairMatches, trioMatches, unmatchedUserIds };
}
