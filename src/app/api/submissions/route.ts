import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSubmissionSchema, submissionFilterSchema } from "@/lib/validations/submission";
import { executeSandboxedCode, ExecutionVerdict } from "@/lib/executor";
import { apiSuccess, apiError, toSubmissionDTO } from "@/lib/dto";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryObj = Object.fromEntries(url.searchParams.entries());

    const parseResult = submissionFilterSchema.safeParse(queryObj);
    if (!parseResult.success) {
      return apiError("Invalid query parameters", 400, parseResult.error.flatten());
    }

    const { questionId, status, page, size } = parseResult.data;

    const sessionUser = await getSessionUser(request);
    const where: any = {};
    if (sessionUser) where.userId = sessionUser.id;
    if (questionId) where.questionId = questionId;
    if (status) where.status = status;

    const [total, submissions] = await Promise.all([
      prisma.submission.count({ where }),
      prisma.submission.findMany({
        where,
        include: {
          question: {
            select: { title: true, slug: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    const dtos = submissions.map(toSubmissionDTO);

    return apiSuccess(dtos, { page, size, total });
  } catch (error: any) {
    console.error("GET /api/submissions error:", error);
    return apiError("Failed to fetch submissions", 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = createSubmissionSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError("Validation failed", 422, parseResult.error.flatten());
    }

    const { questionId, language, sourceCode, isTestRun, customInput, customExpectedOutput, testCaseIndex } = parseResult.data;

    const question = await prisma.question.findFirst({
      where: { OR: [{ id: questionId }, { slug: questionId }] },
      include: {
        testCasesList: { orderBy: { orderIndex: "asc" } },
      },
    });

    if (!question) {
      return apiError("Question not found", 404);
    }

    // Authenticate user for real submissions
    const sessionUser = await getSessionUser(request);
    if (!isTestRun && !sessionUser) {
      return apiError("Authentication required to submit solution. Please log in.", 401);
    }
    const user = sessionUser || { id: "guest", name: "Guest", email: "guest@codertrack.local" };

    // Prepare all test cases
    let allTestCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }> = [];
    if (question.testCasesList.length > 0) {
      allTestCases = question.testCasesList.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));
    } else if (question.testCases) {
      allTestCases = JSON.parse(question.testCases);
    }

    // Determine cases to run:
    // If isTestRun and customInput is set: run solely on customInput
    // If isTestRun and testCaseIndex is specified: run that single selected testcase (LeetCode RUN behavior)
    // If isTestRun otherwise: run all non-hidden sample testcases
    // If Submit: run against ALL testcases (including hidden judge testcases)
    let targetCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }> = [];
    if (isTestRun) {
      if (customInput !== undefined) {
        targetCases = [];
      } else if (testCaseIndex !== undefined && allTestCases[testCaseIndex]) {
        targetCases = [allTestCases[testCaseIndex]];
      } else {
        targetCases = allTestCases.filter((tc) => !tc.isHidden);
      }
    } else {
      targetCases = allTestCases;
    }

    // Execute through sandbox with CPU, timeout, and memory isolation
    const evaluation = executeSandboxedCode({
      language,
      code: sourceCode,
      testCases: targetCases.length > 0 ? targetCases : [{ input: "", expectedOutput: "" }],
      customInput,
      customExpectedOutput,
      timeLimitMs: 3000,
      memoryLimitMb: 64,
      sqlSchemaSql: question.sqlSchemaSql,
      sqlSeedData: question.sqlSeedData,
      sqlExpectedQuery: question.sqlExpectedQuery,
    });

    const passedCount = evaluation.testResults.filter((r) => r.passed).length;
    const firstResult = evaluation.testResults[0];

    // Structured verdict payload conforming to Part 18
    const responsePayload = {
      isTestRun: Boolean(isTestRun),
      status: evaluation.verdict,
      actualOutput: evaluation.output ?? firstResult?.actual ?? "",
      expectedOutput: evaluation.expectedOutput ?? firstResult?.expected ?? "",
      runtimeMs: evaluation.runtimeMs,
      runtime: evaluation.runtimeMs,
      memoryKb: evaluation.memoryKb,
      memory: evaluation.memoryKb,
      passedCases: passedCount,
      totalCases: customInput !== undefined ? 1 : targetCases.length,
      testResults: evaluation.testResults,
      customResult: evaluation.customResult,
      compileError: evaluation.verdict === "COMPILATION_ERROR" || evaluation.verdict === "INVALID_CODE" ? (evaluation.error || "Compilation error") : null,
      runtimeError: evaluation.verdict === "RUNTIME_ERROR" || evaluation.verdict === "TIME_LIMIT" ? (evaluation.error || "Runtime error") : null,
      error: evaluation.error,
    };

    // If this was just a Test Run (Run Code), don't store permanent submission
    if (isTestRun) {
      return apiSuccess(responsePayload);
    }

    // Permanent submission evaluation
    const mappedStatus: ExecutionVerdict = evaluation.verdict;

    const isAccepted = mappedStatus === "ACCEPTED";

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          userId: user.id,
          questionId: question.id,
          language,
          sourceCode,
          status: mappedStatus,
          runtime: evaluation.runtimeMs,
          memory: evaluation.memoryKb,
        },
        include: {
          question: { select: { title: true, slug: true } },
        },
      });

      await tx.userProgress.upsert({
        where: {
          userId_questionId: {
            userId: user.id,
            questionId: question.id,
          },
        },
        update: {
          attemptsCount: { increment: 1 },
          isSolved: isAccepted ? true : undefined,
          solvedAt: isAccepted ? new Date() : undefined,
          lastAttemptedAt: new Date(),
        },
        create: {
          userId: user.id,
          questionId: question.id,
          isSolved: isAccepted,
          attemptsCount: 1,
          solvedAt: isAccepted ? new Date() : null,
        },
      });

      return sub;
    });

    const dto = toSubmissionDTO(submission);

    return apiSuccess({
      ...dto,
      passedCases: evaluation.testResults.filter((r) => r.passed).length,
      totalCases: allTestCases.length,
      failedTestIndex: evaluation.failedTestIdx,
      testResults: evaluation.testResults.map((r, i) => ({
        index: r.index,
        passed: r.passed,
        runtimeMs: r.runtimeMs,
        // Hide internal input/expected if it's a hidden testcase
        input: allTestCases[i]?.isHidden ? "(Hidden Test Case)" : r.input,
        expected: allTestCases[i]?.isHidden ? "(Hidden Test Case)" : r.expected,
        actual: allTestCases[i]?.isHidden ? (r.passed ? "(Passed)" : "(Hidden Output Mismatch)") : r.actual,
      })),
      error: evaluation.error,
    });
  } catch (error: any) {
    console.error("POST /api/submissions error:", error);
    return apiError("Failed to process submission", 500, error.message);
  }
}
