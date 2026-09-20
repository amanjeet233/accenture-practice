import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeSandboxedSql } from "@/lib/sqlEngine";
import { apiSuccess, apiError } from "@/lib/dto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, query, action = "run" } = body;

    if (!questionId) {
      return apiError("Question ID is required", 400);
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return apiError("SQL query cannot be empty.", 400);
    }

    const question = await prisma.question.findFirst({
      where: {
        OR: [{ id: questionId }, { slug: questionId }],
      },
    });

    if (!question) {
      return apiError("SQL Question not found", 404);
    }

    const checkCorrectness = action === "submit" || action === "run";

    // Run sandboxed SQL evaluation
    const result = executeSandboxedSql({
      schemaSql: question.sqlSchemaSql,
      seedSql: question.sqlSeedData,
      userQuery: query,
      expectedQuery: question.sqlExpectedQuery,
      checkCorrectness,
    });

    // If submit action and valid query execution, record submission
    if (action === "submit") {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: { email: "candidate@accenture-prep.local", name: "Candidate Engineer" },
        });
      }

      const isAccepted = Boolean(result.isCorrect);
      const verdict = isAccepted
        ? "ACCEPTED"
        : result.success
        ? "WRONG_ANSWER"
        : "RUNTIME_ERROR";

      await prisma.$transaction(async (tx) => {
        await tx.submission.create({
          data: {
            userId: user.id,
            questionId: question.id,
            language: "sql",
            sourceCode: query,
            status: verdict,
            runtime: result.executionTimeMs,
            memory: 12400,
          },
        });

        if (isAccepted) {
          await tx.userProgress.upsert({
            where: {
              userId_questionId: {
                userId: user.id,
                questionId: question.id,
              },
            },
            update: {
              isSolved: true,
              solvedAt: new Date(),
              attemptsCount: { increment: 1 },
              lastAttemptedAt: new Date(),
            },
            create: {
              userId: user.id,
              questionId: question.id,
              isSolved: true,
              attemptsCount: 1,
              solvedAt: new Date(),
            },
          });
        }
      });
    }

    return apiSuccess({
      ...result,
      action,
    });
  } catch (error: any) {
    console.error("POST /api/sql/execute error:", error);
    return apiError("SQL execution internal error", 500, error.message);
  }
}
