import { prisma } from "@/lib/prisma";
import {
  FileCode2,
  Cpu,
  Layers,
  Network,
  ShieldCheck,
  Cloud,
  TerminalSquare,
  Code2,
  Database,
  MonitorCheck,
  MessageSquare,
  Users,
  Timer,
  TrendingUp,
} from "lucide-react";

import {
  CANONICAL_TOPICS,
  CANONICAL_TOPIC_LIST,
  getTopicPrismaFilter,
  resolveCanonicalTopic,
  CanonicalTopicId,
} from "@/lib/canonicalTopics";

export interface AccentureModuleConfig {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
  type: "QUESTIONS" | "MOCK_TESTS" | "PROGRESS";
  queryFilter?: any;
  canonicalTopicId?: CanonicalTopicId;
}

export const ACCENTURE_MODULES: AccentureModuleConfig[] = [
  {
    slug: "mcq",
    name: "MCQ Practice",
    shortName: "MCQ",
    description: "Practice Accenture-style technical MCQs across all engineering domains.",
    icon: FileCode2,
    type: "QUESTIONS",
    queryFilter: { questionType: "MCQ" },
  },
  {
    slug: "networking",
    name: CANONICAL_TOPICS.NETWORKING.name,
    shortName: CANONICAL_TOPICS.NETWORKING.shortName,
    description: CANONICAL_TOPICS.NETWORKING.description,
    icon: Network,
    type: "QUESTIONS",
    canonicalTopicId: "NETWORKING",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.NETWORKING),
  },
  {
    slug: "cybersecurity",
    name: CANONICAL_TOPICS.CYBERSECURITY.name,
    shortName: CANONICAL_TOPICS.CYBERSECURITY.shortName,
    description: CANONICAL_TOPICS.CYBERSECURITY.description,
    icon: ShieldCheck,
    type: "QUESTIONS",
    canonicalTopicId: "CYBERSECURITY",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.CYBERSECURITY),
  },
  {
    slug: "cloud",
    name: CANONICAL_TOPICS.CLOUD.name,
    shortName: CANONICAL_TOPICS.CLOUD.shortName,
    description: CANONICAL_TOPICS.CLOUD.description,
    icon: Cloud,
    type: "QUESTIONS",
    canonicalTopicId: "CLOUD",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.CLOUD),
  },
  {
    slug: "ms-office",
    name: CANONICAL_TOPICS.MS_OFFICE.name,
    shortName: CANONICAL_TOPICS.MS_OFFICE.shortName,
    description: CANONICAL_TOPICS.MS_OFFICE.description,
    icon: Layers,
    type: "QUESTIONS",
    canonicalTopicId: "MS_OFFICE",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.MS_OFFICE),
  },
  {
    slug: "pseudocode",
    name: CANONICAL_TOPICS.PSEUDOCODE.name,
    shortName: CANONICAL_TOPICS.PSEUDOCODE.shortName,
    description: CANONICAL_TOPICS.PSEUDOCODE.description,
    icon: Cpu,
    type: "QUESTIONS",
    canonicalTopicId: "PSEUDOCODE",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.PSEUDOCODE),
  },
  {
    slug: "devops",
    name: CANONICAL_TOPICS.DEVOPS.name,
    shortName: CANONICAL_TOPICS.DEVOPS.shortName,
    description: CANONICAL_TOPICS.DEVOPS.description,
    icon: TerminalSquare,
    type: "QUESTIONS",
    canonicalTopicId: "DEVOPS",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.DEVOPS),
  },
  {
    slug: "dbms",
    name: CANONICAL_TOPICS.DBMS.name,
    shortName: CANONICAL_TOPICS.DBMS.shortName,
    description: CANONICAL_TOPICS.DBMS.description,
    icon: Database,
    type: "QUESTIONS",
    canonicalTopicId: "DBMS",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.DBMS),
  },
  {
    slug: "sql",
    name: CANONICAL_TOPICS.SQL.name,
    shortName: CANONICAL_TOPICS.SQL.shortName,
    description: CANONICAL_TOPICS.SQL.description,
    icon: Database,
    type: "QUESTIONS",
    canonicalTopicId: "SQL",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.SQL),
  },
  {
    slug: "java-oop",
    name: CANONICAL_TOPICS.JAVA_OOP.name,
    shortName: CANONICAL_TOPICS.JAVA_OOP.shortName,
    description: CANONICAL_TOPICS.JAVA_OOP.description,
    icon: Code2,
    type: "QUESTIONS",
    canonicalTopicId: "JAVA_OOP",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.JAVA_OOP),
  },
  {
    slug: "coding",
    name: CANONICAL_TOPICS.CODING.name,
    shortName: CANONICAL_TOPICS.CODING.shortName,
    description: CANONICAL_TOPICS.CODING.description,
    icon: Code2,
    type: "QUESTIONS",
    canonicalTopicId: "CODING",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.CODING),
  },
  {
    slug: "frontend",
    name: CANONICAL_TOPICS.FRONTEND.name,
    shortName: CANONICAL_TOPICS.FRONTEND.shortName,
    description: CANONICAL_TOPICS.FRONTEND.description,
    icon: MonitorCheck,
    type: "QUESTIONS",
    canonicalTopicId: "FRONTEND",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.FRONTEND),
  },
  {
    slug: "communication",
    name: CANONICAL_TOPICS.COMMUNICATION.name,
    shortName: CANONICAL_TOPICS.COMMUNICATION.shortName,
    description: CANONICAL_TOPICS.COMMUNICATION.description,
    icon: MessageSquare,
    type: "QUESTIONS",
    canonicalTopicId: "COMMUNICATION",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.COMMUNICATION),
  },
  {
    slug: "interview",
    name: CANONICAL_TOPICS.INTERVIEW.name,
    shortName: CANONICAL_TOPICS.INTERVIEW.shortName,
    description: CANONICAL_TOPICS.INTERVIEW.description,
    icon: Users,
    type: "QUESTIONS",
    canonicalTopicId: "INTERVIEW",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.INTERVIEW),
  },
  {
    slug: "computer-fundamentals",
    name: CANONICAL_TOPICS.COMPUTER_FUNDAMENTALS.name,
    shortName: CANONICAL_TOPICS.COMPUTER_FUNDAMENTALS.shortName,
    description: CANONICAL_TOPICS.COMPUTER_FUNDAMENTALS.description,
    icon: Cpu,
    type: "QUESTIONS",
    canonicalTopicId: "COMPUTER_FUNDAMENTALS",
    queryFilter: getTopicPrismaFilter(CANONICAL_TOPICS.COMPUTER_FUNDAMENTALS),
  },
  {
    slug: "mock-tests",
    name: "Mock Tests",
    shortName: "Mocks",
    description: "Full-length timed assessment simulations mirroring actual Accenture test pattern.",
    icon: Timer,
    type: "MOCK_TESTS",
  },
  {
    slug: "progress",
    name: "Progress",
    shortName: "Progress",
    description: "Detailed performance tracking, domain mastery breakdown, and accuracy analysis.",
    icon: TrendingUp,
    type: "PROGRESS",
  },
];

export const ACCENTURE_COMPANY_FILTER = {
  OR: [
    { companies: { contains: "accenture" } },
    { questionCompanies: { some: { company: { slug: "accenture" } } } },
  ],
};

// In-memory caches with 60-second TTL
let moduleCountsCache: { data: Record<string, number>; expiresAt: number } | null = null;
let headerStatsCache: { data: any; expiresAt: number } | null = null;

/**
 * Fetch real database counts for all modules in parallel
 */
export async function getAccentureModuleCounts(userId?: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  const questionPromises = ACCENTURE_MODULES.map(async (mod) => {
    if (mod.type === "MOCK_TESTS") {
      const cnt = await prisma.mockTest.count({
        where: {
          OR: [
            { company: { contains: "Accenture" } },
            { companyRef: { slug: "accenture" } },
          ],
        },
      });
      counts[mod.slug] = cnt;
    } else if (mod.type === "PROGRESS") {
      const cnt = await prisma.userProgress.count({
        where: {
          isSolved: true,
          ...(userId ? { userId } : { userId: "none" }),
        },
      });
      counts[mod.slug] = cnt;
    } else {
      const cnt = await prisma.question.count({
        where: {
          AND: [ACCENTURE_COMPANY_FILTER, mod.queryFilter],
        },
      });
      counts[mod.slug] = cnt;
    }
  });

  await Promise.all(questionPromises);
  return counts;
}

/**
 * Fetch real database stats for Accenture header (strictly user-scoped for attempts & accuracy)
 */
export async function getAccentureHeaderStats(userId?: string) {
  const attemptFilter = userId ? { userId } : { userId: "none" };

  const [totalQuestions, totalMockTests, totalAttempts] = await Promise.all([
    prisma.question.count({ where: ACCENTURE_COMPANY_FILTER }),
    prisma.mockTest.count({
      where: {
        OR: [
          { company: { contains: "Accenture" } },
          { companyRef: { slug: "accenture" } },
        ],
      },
    }),
    prisma.testAttempt.count({ where: attemptFilter }),
  ]);

  let accuracy = 0;
  if (totalAttempts > 0) {
    const agg = await prisma.testAttempt.aggregate({
      where: attemptFilter,
      _avg: { accuracy: true },
    });
    accuracy = Math.round(agg._avg.accuracy || 0);
  }

  return {
    totalQuestions,
    totalMockTests,
    totalAttempts,
    accuracy,
  };
}

let moduleQuestionsCache: Record<string, { data: any[]; expiresAt: number }> = {};
let userSolvedCache: { data: Set<string>; expiresAt: number } | null = null;

export async function getAccentureModuleQuestions(slug: string, queryFilter: any) {
  const now = Date.now();
  if (moduleQuestionsCache[slug] && moduleQuestionsCache[slug].expiresAt > now) {
    return moduleQuestionsCache[slug].data;
  }

  const questions = await prisma.question.findMany({
    where: {
      AND: [ACCENTURE_COMPANY_FILTER, queryFilter],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      questionType: true,
      sourceType: true,
      category: true,
      frequency: true,
      importance: true,
      importanceReason: true,
      sourceDocument: true,
      sourcePage: true,
    },
    orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  moduleQuestionsCache[slug] = {
    data: questions,
    expiresAt: Date.now() + 60000,
  };

  return questions;
}

export async function getAccentureSolvedQuestionIds(): Promise<Set<string>> {
  const now = Date.now();
  if (userSolvedCache && userSolvedCache.expiresAt > now) {
    return userSolvedCache.data;
  }

  const userProgress = await prisma.userProgress.findMany({
    where: { isSolved: true },
    select: { questionId: true },
    take: 500,
  });

  const set = new Set(userProgress.map((p) => p.questionId));
  userSolvedCache = {
    data: set,
    expiresAt: Date.now() + 30000,
  };
  return set;
}

