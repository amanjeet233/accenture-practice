import { Difficulty, Importance, QuestionType, SourceType, VerificationStatus } from "@/types";

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  EASY: {
    label: "Easy",
    textClass: "text-[#3FB950]",
    bgClass: "bg-[#3FB950]/10",
    borderClass: "border-[#3FB950]/25",
  },
  MEDIUM: {
    label: "Medium",
    textClass: "text-[#D29922]",
    bgClass: "bg-[#D29922]/10",
    borderClass: "border-[#D29922]/25",
  },
  HARD: {
    label: "Hard",
    textClass: "text-[#F85149]",
    bgClass: "bg-[#F85149]/10",
    borderClass: "border-[#F85149]/25",
  },
};

export const IMPORTANCE_CONFIG: Record<
  Importance,
  { label: string; textClass: string; bgClass: string; borderClass: string; description: string }
> = {
  MUST_DO: {
    label: "Must Do",
    textClass: "text-[#D29922]",
    bgClass: "bg-[#D29922]/10",
    borderClass: "border-[#D29922]/30",
    description: "Crucial question with repeated occurrences across assessment slots",
  },
  HIGH: {
    label: "High",
    textClass: "text-[#58A6FF]",
    bgClass: "bg-[#58A6FF]/10",
    borderClass: "border-[#58A6FF]/25",
    description: "Consistently tested pattern in company assessments",
  },
  MEDIUM: {
    label: "Medium",
    textClass: "text-[#8B949E]",
    bgClass: "bg-[#21262D]",
    borderClass: "border-[#30363D]",
    description: "Standard foundational interview preparation question",
  },
  LOW: {
    label: "Low",
    textClass: "text-[#6E7681]",
    bgClass: "bg-[#161B22]",
    borderClass: "border-[#30363D]/60",
    description: "Supplemental practice to broaden conceptual coverage",
  },
};

export const SOURCE_TYPE_CONFIG: Record<
  SourceType,
  { label: string; badgeClass: string; tooltip: string; icon: string }
> = {
  REPORTED_PYQ: {
    label: "PYQ",
    badgeClass: "bg-[#161B22] text-[#3FB950] border-[#30363D]",
    tooltip: "Authentic question directly reported from actual hiring drive papers",
    icon: "•",
  },
  SHIFT_REPORTED: {
    label: "Shift Reported",
    badgeClass: "bg-[#161B22] text-[#D29922] border-[#30363D]",
    tooltip: "Reported from specific exam slots and shifts",
    icon: "•",
  },
  CANDIDATE_REPORTED: {
    label: "Candidate Memory",
    badgeClass: "bg-[#161B22] text-[#8B949E] border-[#30363D]",
    tooltip: "Reconstructed from student debriefs post-assessment",
    icon: "•",
  },
  COMPANY_PATTERN: {
    label: "Pattern",
    badgeClass: "bg-[#161B22] text-[#58A6FF] border-[#30363D]",
    tooltip: "Tailored to emulate identical assessment patterns and constraints",
    icon: "•",
  },
  PRACTICE: {
    label: "Practice",
    badgeClass: "bg-[#161B22] text-[#8B949E] border-[#30363D]",
    tooltip: "General skill-building problem (not claimed as an actual PYQ)",
    icon: "•",
  },
  GENERAL_INTERVIEW: {
    label: "Interview",
    badgeClass: "bg-[#161B22] text-[#8B949E] border-[#30363D]",
    tooltip: "Common industry-wide technical question (not company-specific)",
    icon: "•",
  },
};

export const VERIFICATION_CONFIG: Record<
  VerificationStatus,
  { label: string; textClass: string; icon: string }
> = {
  HIGH_CONFIDENCE: {
    label: "High Confidence",
    textClass: "text-[#3FB950]",
    icon: "ShieldCheck",
  },
  OFFICIALLY_VERIFIED: {
    label: "Verified",
    textClass: "text-[#58A6FF]",
    icon: "BadgeCheck",
  },
  COMMUNITY_VERIFIED: {
    label: "Corroborated",
    textClass: "text-[#8B949E]",
    icon: "Users",
  },
  UNVERIFIED: {
    label: "Unverified",
    textClass: "text-[#6E7681]",
    icon: "HelpCircle",
  },
};

export const TOPIC_LIST = [
  "Arrays",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Hash Tables",
  "Bit Manipulation",
  "Recursion & Backtracking",
  "Sorting & Searching",
  "Stack & Queue",
  "Linked List",
  "Trees & Binary Trees",
  "Binary Search Trees",
  "Dynamic Programming",
  "Graphs",
  "Greedy Algorithms",
  "Math & Number Theory",
  "SQL Queries",
  "SQL Joins & Aggregations",
  "Frontend DOM",
  "JavaScript Async",
];

export const COMPANY_LIST = [
  {
    id: "accenture",
    name: "Accenture",
    tagline: "Cognitive, Technical & Coding Assessment (Associate Software Engineer / Advanced ASE)",
    rounds: [
      { name: "Round 1: Cognitive & Technical Assessment", duration: "90 mins", questions: 90 },
      { name: "Round 2: Coding Assessment (Mandatory)", duration: "45 mins", questions: 2 },
      { name: "Round 3: Communication Assessment", duration: "45 mins", questions: "Automated AI speech" },
      { name: "Round 4: Technical & HR Interview", duration: "30 mins", questions: "One-on-One" },
    ],
    commonPatterns: [
      "String manipulation & ASCII transformations",
      "Bitwise operators & parity puzzles",
      "Array contiguous subarray sums",
      "Matrix coordinate calculations",
      "Math & base conversion rules",
    ],
  },
  {
    id: "tcs",
    name: "TCS",
    tagline: "National Qualifier Test (NQT) - Ninja & Digital Tracks",
    rounds: [
      { name: "Foundation Section", duration: "75 mins", questions: 65 },
      { name: "Advanced Section (Coding)", duration: "90 mins", questions: "1 Easy + 1 Hard" },
    ],
    commonPatterns: ["Number theory", "String parsing", "Matrix rotation", "DP basics"],
  },
  {
    id: "infosys",
    name: "Infosys",
    tagline: "Specialist Programmer (SP) & Digital Specialist Engineer (DSE)",
    rounds: [
      { name: "Certification Coding Round", duration: "180 mins", questions: 3 },
    ],
    commonPatterns: ["Dynamic programming", "Graph traversal", "Greedy algorithms"],
  },
  {
    id: "amazon",
    name: "Amazon",
    tagline: "SDE-1 Online Assessment (OA) & Bar Raiser Rounds",
    rounds: [
      { name: "OA1: Coding & Work Simulation", duration: "90 mins", questions: 2 },
    ],
    commonPatterns: ["Two pointers", "Heap / Priority Queue", "Monotonic stack", "Trees/Graphs"],
  },
];
