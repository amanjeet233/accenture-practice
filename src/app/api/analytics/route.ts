import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/dto";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    const userFilter = sessionUser ? { userId: sessionUser.id } : { userId: "none" };

    const [submissions, questions, progress, testAttempts] = await Promise.all([
      prisma.submission.findMany({
        where: userFilter,
        select: { status: true, runtime: true, language: true, submittedAt: true },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.question.findMany({
        select: { difficulty: true, questionType: true },
      }),
      prisma.userProgress.findMany({
        where: { ...userFilter, isSolved: true },
      }),
      prisma.testAttempt.findMany({
        where: userFilter,
        select: { score: true, accuracy: true, duration: true },
      }),
    ]);

    const totalSubmissions = submissions.length;
    const acceptedCount = submissions.filter((s) => s.status === "ACCEPTED").length;
    const acceptanceRate =
      totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

    const runtimes = submissions
      .filter((s) => s.runtime !== null && s.runtime > 0)
      .map((s) => s.runtime as number);
    const avgRuntime =
      runtimes.length > 0
        ? Math.round(runtimes.reduce((a, b) => a + b, 0) / runtimes.length)
        : 0;

    // Language distribution
    const languageStats: Record<string, number> = {};
    submissions.forEach((s) => {
      languageStats[s.language] = (languageStats[s.language] || 0) + 1;
    });

    return apiSuccess({
      totalSubmissions,
      acceptedCount,
      acceptanceRate,
      avgRuntime,
      totalSolved: progress.length,
      totalQuestions: questions.length,
      mockAttemptsCount: testAttempts.length,
      languageStats,
    });
  } catch (error: any) {
    console.error("GET /api/analytics error:", error);
    return apiError("Failed to fetch analytics", 500, error.message);
  }
}
