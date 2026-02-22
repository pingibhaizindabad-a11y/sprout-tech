/** Single source of truth for questionnaire: 5 pillars, 28 questions. */

export type QuestionType = "single" | "multi" | "scale";
export type ScaleRange = { min: number; max: number };

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  pillar: number;
  pillarName: string;
  type: QuestionType;
  label: string;
  options?: QuestionOption[];
  scale?: ScaleRange;
}

export const PILLARS = [
  "Skills / Role",
  "Experience Level",
  "Availability",
  "Work Style",
  "Motivation & Intent",
] as const;

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    pillar: 1,
    pillarName: PILLARS[0],
    type: "single",
    label: "Which best describes your primary skill set?",
    options: [
      { value: "technical", label: "Technical (Engineering/Dev)" },
      { value: "business", label: "Business (Sales/Ops/Strategy)" },
      { value: "design", label: "Design (UI/UX/Branding)" },
      { value: "marketing", label: "Marketing (Growth/Content)" },
      { value: "finance", label: "Finance/Analytics" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "q2",
    pillar: 1,
    pillarName: PILLARS[0],
    type: "multi",
    label: "Select all skills you can contribute to a team.",
    options: [
      { value: "frontend", label: "Frontend Dev" },
      { value: "backend", label: "Backend Dev" },
      { value: "mobile", label: "Mobile Dev" },
      { value: "uiux", label: "UI/UX Design" },
      { value: "graphic", label: "Graphic Design" },
      { value: "marketing", label: "Marketing" },
      { value: "content", label: "Content Creation" },
      { value: "bizdev", label: "Business Development" },
      { value: "finance", label: "Finance" },
      { value: "operations", label: "Operations" },
      { value: "data", label: "Data/Analytics" },
      { value: "research", label: "Research" },
    ],
  },
  {
    id: "q3",
    pillar: 1,
    pillarName: PILLARS[0],
    type: "single",
    label: "What role do you naturally take in a team?",
    options: [
      { value: "builder", label: "Builder (I make things)" },
      { value: "strategist", label: "Strategist (I plan things)" },
      { value: "connector", label: "Connector (I talk to people)" },
      { value: "analyst", label: "Analyst (I research and measure)" },
      { value: "generalist", label: "Generalist (I do whatever's needed)" },
    ],
  },
  { id: "q4", pillar: 1, pillarName: PILLARS[0], type: "scale", label: "Rate your confidence executing tasks independently.", scale: { min: 1, max: 5 } },
  { id: "q5", pillar: 1, pillarName: PILLARS[0], type: "scale", label: "Rate your confidence in strategic thinking and planning.", scale: { min: 1, max: 5 } },
  {
    id: "q6",
    pillar: 1,
    pillarName: PILLARS[0],
    type: "single",
    label: "What would you rather NOT do in a team?",
    options: [
      { value: "technical", label: "Technical work" },
      { value: "sales", label: "Sales/outreach" },
      { value: "design", label: "Design work" },
      { value: "admin", label: "Admin/operations" },
      { value: "presenting", label: "Presenting/pitching" },
    ],
  },
  {
    id: "q7",
    pillar: 1,
    pillarName: PILLARS[0],
    type: "single",
    label: "How specialized are you in your primary skill?",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
      { value: "expert", label: "Expert" },
    ],
  },
  {
    id: "q8",
    pillar: 2,
    pillarName: PILLARS[1],
    type: "single",
    label: "How many projects have you completed end-to-end?",
    options: [
      { value: "0", label: "0" },
      { value: "1-2", label: "1–2" },
      { value: "3-5", label: "3–5" },
      { value: "6+", label: "6+" },
    ],
  },
  {
    id: "q9",
    pillar: 2,
    pillarName: PILLARS[1],
    type: "single",
    label: "Have you participated in a hackathon or startup competition?",
    options: [
      { value: "never", label: "Never" },
      { value: "once", label: "Once" },
      { value: "2-3", label: "2–3 times" },
      { value: "3+", label: "More than 3 times" },
    ],
  },
  {
    id: "q10",
    pillar: 2,
    pillarName: PILLARS[1],
    type: "single",
    label: "Have you held a leadership role in a team before?",
    options: [
      { value: "no", label: "No" },
      { value: "informally", label: "Informally" },
      { value: "small", label: "Yes — small team" },
      { value: "large", label: "Yes — large team" },
    ],
  },
  {
    id: "q11",
    pillar: 2,
    pillarName: PILLARS[1],
    type: "single",
    label: "How would you describe your overall experience level?",
    options: [
      { value: "starting", label: "Just starting out" },
      { value: "some", label: "Some experience" },
      { value: "fairly", label: "Fairly experienced" },
      { value: "very", label: "Very experienced" },
    ],
  },
  {
    id: "q12",
    pillar: 2,
    pillarName: PILLARS[1],
    type: "single",
    label: "Have you ever launched something publicly?",
    options: [
      { value: "no", label: "No" },
      { value: "in_progress", label: "In progress" },
      { value: "small", label: "Yes — small scale" },
      { value: "significant", label: "Yes — significant traction" },
    ],
  },
  {
    id: "q13",
    pillar: 3,
    pillarName: PILLARS[2],
    type: "single",
    label: "How many hours per week can you commit?",
    options: [
      { value: "lt5", label: "Less than 5 hrs" },
      { value: "5-10", label: "5–10 hrs" },
      { value: "10-20", label: "10–20 hrs" },
      { value: "20+", label: "20+ hrs" },
    ],
  },
  {
    id: "q14",
    pillar: 3,
    pillarName: PILLARS[2],
    type: "single",
    label: "How long are you looking to work on this?",
    options: [
      { value: "sprint", label: "Just this event/sprint" },
      { value: "1-3", label: "1–3 months" },
      { value: "3-6", label: "3–6 months" },
      { value: "6+", label: "Long term (6 months+)" },
    ],
  },
  {
    id: "q15",
    pillar: 3,
    pillarName: PILLARS[2],
    type: "single",
    label: "How often would you want to sync with your team?",
    options: [
      { value: "daily", label: "Daily" },
      { value: "few_days", label: "Every few days" },
      { value: "weekly", label: "Weekly" },
      { value: "as_needed", label: "As needed" },
    ],
  },
  { id: "q16", pillar: 3, pillarName: PILLARS[2], type: "scale", label: "How consistent is your availability week to week? (1 = very inconsistent, 5 = very consistent)", scale: { min: 1, max: 5 } },
  {
    id: "q17",
    pillar: 3,
    pillarName: PILLARS[2],
    type: "single",
    label: "What is your primary time zone or working region?",
    options: [
      { value: "na_east", label: "North America (East)" },
      { value: "na_west", label: "North America (West)" },
      { value: "europe", label: "Europe" },
      { value: "south_asia", label: "South Asia" },
      { value: "east_asia", label: "East Asia" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "q18",
    pillar: 4,
    pillarName: PILLARS[3],
    type: "single",
    label: "How do you prefer to work?",
    options: [
      { value: "highly_structured", label: "Highly structured with clear plans" },
      { value: "mostly_structured", label: "Mostly structured but flexible" },
      { value: "mostly_flexible", label: "Mostly flexible" },
      { value: "spontaneous", label: "Completely spontaneous" },
    ],
  },
  { id: "q19", pillar: 4, pillarName: PILLARS[3], type: "scale", label: "Are you more of a planner or an executor? (1 = pure planner, 5 = pure executor)", scale: { min: 1, max: 5 } },
  {
    id: "q20",
    pillar: 4,
    pillarName: PILLARS[3],
    type: "single",
    label: "How do you handle disagreements in a team?",
    options: [
      { value: "avoid", label: "Avoid conflict" },
      { value: "privately", label: "Address it privately" },
      { value: "openly", label: "Discuss openly and directly" },
      { value: "defer", label: "Defer to the majority" },
      { value: "push", label: "Push for my view until resolved" },
    ],
  },
  {
    id: "q21",
    pillar: 4,
    pillarName: PILLARS[3],
    type: "single",
    label: "How do you prefer to communicate?",
    options: [
      { value: "async", label: "Mostly async (messages/docs)" },
      { value: "mix", label: "Mix of async and calls" },
      { value: "live", label: "Mostly live calls" },
    ],
  },
  { id: "q22", pillar: 4, pillarName: PILLARS[3], type: "scale", label: "How strict are you about deadlines? (1 = very flexible, 5 = very strict)", scale: { min: 1, max: 5 } },
  {
    id: "q23",
    pillar: 4,
    pillarName: PILLARS[3],
    type: "single",
    label: "How do you feel about ambiguity in a project?",
    options: [
      { value: "clear", label: "I need clear direction" },
      { value: "some", label: "I can handle some ambiguity" },
      { value: "thrive", label: "I thrive in ambiguous environments" },
    ],
  },
  {
    id: "q24",
    pillar: 5,
    pillarName: PILLARS[4],
    type: "multi",
    label: "Why are you joining this program/event?",
    options: [
      { value: "build", label: "Build something real" },
      { value: "learn", label: "Learn new skills" },
      { value: "meet", label: "Meet people" },
      { value: "win", label: "Win/compete" },
      { value: "resume", label: "Get experience for resume" },
      { value: "explore", label: "Explore entrepreneurship" },
    ],
  },
  {
    id: "q25",
    pillar: 5,
    pillarName: PILLARS[4],
    type: "single",
    label: "What matters more to you right now?",
    options: [
      { value: "winning", label: "Winning/results" },
      { value: "learning", label: "Learning/growth" },
      { value: "both", label: "Both equally" },
    ],
  },
  {
    id: "q26",
    pillar: 5,
    pillarName: PILLARS[4],
    type: "single",
    label: "How do you approach risk?",
    options: [
      { value: "averse", label: "Very risk-averse" },
      { value: "cautious", label: "Somewhat cautious" },
      { value: "comfortable", label: "Comfortable with risk" },
      { value: "big_bets", label: "Love taking big bets" },
    ],
  },
  { id: "q27", pillar: 5, pillarName: PILLARS[4], type: "scale", label: "How competitive are you? (1 = purely collaborative, 5 = highly competitive)", scale: { min: 1, max: 5 } },
  {
    id: "q28",
    pillar: 5,
    pillarName: PILLARS[4],
    type: "single",
    label: "How committed are you to seeing this through?",
    options: [
      { value: "might_drop", label: "I might drop off if things get hard" },
      { value: "try_best", label: "I'll try my best but life happens" },
      { value: "fully", label: "I'm fully committed" },
      { value: "whatever", label: "I'll do whatever it takes" },
    ],
  },
];

export const HOURS_MAP: Record<string, number> = {
  lt5: 2.5,
  "5-10": 7.5,
  "10-20": 15,
  "20+": 25,
};
