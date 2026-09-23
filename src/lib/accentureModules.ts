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

import {
  ACCENTURE_MODULES,
  ACCENTURE_COMPANY_FILTER,
  type AccentureModuleConfig,
} from "@/lib/accentureModuleDefs";

export {
  ACCENTURE_MODULES,
  ACCENTURE_COMPANY_FILTER,
  type AccentureModuleConfig,
};

// In-memory caches with TTL (10 minutes)
let globalTopicCountsCache: { data: Record<string, number>; expiresAt: number } | null = null;
let moduleCountsCache: { data: Record<string, number>; expiresAt: number; userId?: string } | null = null;
let headerStatsCache: { data: any; expiresAt: number; userId?: string } | null = null;

const CACHE_TTL_MS = 600_000; // 10 minutes

/**
 * Fetch real database counts for all modules with high-performance caching
 */
export async function getAccentureModuleCounts(userId?: string): Promise<Record<string, number>> {
  const now = Date.now();
  if (
    moduleCountsCache &&
    moduleCountsCache.expiresAt > now &&
    moduleCountsCache.userId === (userId || undefined)
  ) {
    return moduleCountsCache.data;
  }

  // 1. Get or compute global topic counts (shared across all users)
  let baseCounts: Record<string, number> = {};
  if (globalTopicCountsCache && globalTopicCountsCache.expiresAt > now) {
    baseCounts = { ...globalTopicCountsCache.data };
  } else {
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
        baseCounts[mod.slug] = cnt;
      } else if (mod.type !== "PROGRESS") {
        const cnt = await prisma.question.count({
          where: {
            AND: [ACCENTURE_COMPANY_FILTER, mod.queryFilter],
          },
        });
        baseCounts[mod.slug] = cnt;
      }
    });

    await Promise.all(questionPromises);

    globalTopicCountsCache = {
      data: baseCounts,
      expiresAt: now + CACHE_TTL_MS,
    };
  }

  // 2. Fetch user solved progress count
  const progressCount = await prisma.userProgress.count({
    where: {
      isSolved: true,
      ...(userId ? { userId } : { userId: "none" }),
    },
  });

  const finalCounts = {
    ...baseCounts,
    progress: progressCount,
  };

  moduleCountsCache = {
    data: finalCounts,
    expiresAt: now + CACHE_TTL_MS,
    userId: userId || undefined,
  };

  return finalCounts;
}

/**
 * Fetch real database stats for Accenture header (strictly user-scoped for attempts & accuracy)
 */
export async function getAccentureHeaderStats(userId?: string) {
  const now = Date.now();
  if (
    headerStatsCache &&
    headerStatsCache.expiresAt > now &&
    headerStatsCache.userId === (userId || undefined)
  ) {
    return headerStatsCache.data;
  }

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

  const result = {
    totalQuestions,
    totalMockTests,
    totalAttempts,
    accuracy,
  };

  headerStatsCache = {
    data: result,
    expiresAt: now + CACHE_TTL_MS,
    userId: userId || undefined,
  };

  return result;
}

let moduleQuestionsCache: Record<string, { data: any[]; totalCount: number; expiresAt: number }> = {};
let userSolvedCache: { data: Set<string>; expiresAt: number; userId?: string } | null = null;

export interface PaginatedModuleResult {
  questions: any[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAccentureModuleQuestions(
  slug: string,
  queryFilter: any,
  page: number = 1,
  limit: number = 25
): Promise<PaginatedModuleResult> {
  const cacheKey = `${slug}_p${page}_l${limit}`;
  const now = Date.now();

  if (moduleQuestionsCache[cacheKey] && moduleQuestionsCache[cacheKey].expiresAt > now) {
    const cached = moduleQuestionsCache[cacheKey];
    return {
      questions: cached.data,
      totalCount: cached.totalCount,
      page,
      limit,
      totalPages: Math.ceil(cached.totalCount / limit),
    };
  }

  const whereClause = {
    AND: [ACCENTURE_COMPANY_FILTER, queryFilter],
  };

  const [questions, totalCount] = await Promise.all([
    prisma.question.findMany({
      where: whereClause,
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
      },
      orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.question.count({ where: whereClause }),
  ]);

  moduleQuestionsCache[cacheKey] = {
    data: questions,
    totalCount,
    expiresAt: now + CACHE_TTL_MS,
  };

  return {
    questions,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}

/**
 * Batch lookup solved status for a specific set of questionIds.
 * Falls back to querying all solved IDs if no specific set given.
 */
export async function getAccentureSolvedQuestionIds(
  userId?: string,
  questionIds?: string[]
): Promise<Set<string>> {
  const effectiveUserId = userId || "none";

  // If specific IDs requested, do a targeted batch query (no cache)
  if (questionIds && questionIds.length > 0) {
    const userProgress = await prisma.userProgress.findMany({
      where: {
        isSolved: true,
        userId: effectiveUserId,
        questionId: { in: questionIds },
      },
      select: { questionId: true },
    });
    return new Set(userProgress.map((p) => p.questionId));
  }

  const now = Date.now();
  if (
    userSolvedCache &&
    userSolvedCache.expiresAt > now &&
    userSolvedCache.userId === effectiveUserId
  ) {
    return userSolvedCache.data;
  }

  const userProgress = await prisma.userProgress.findMany({
    where: { isSolved: true, userId: effectiveUserId },
    select: { questionId: true },
    take: 500,
  });

  const set = new Set(userProgress.map((p) => p.questionId));
  userSolvedCache = {
    data: set,
    expiresAt: now + 60000,
    userId: effectiveUserId,
  };
  return set;
}

