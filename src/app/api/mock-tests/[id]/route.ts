import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeSandboxedCode } from "@/lib/executor";
import { executeSandboxedSql } from "@/lib/sqlEngine";
import { evaluateFrontendCode } from "@/lib/frontendEvaluator";
import { apiSuccess, apiError } from "@/lib/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const mockTest = await prisma.mockTest.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        companyRef: true,
        questions: {
          include: {
            question: {
              include: {
                examplesList: { orderBy: { orderIndex: "asc" } },
                hintsList: { orderBy: { orderIndex: "asc" } },
                questionTopics: { include: { topic: true } },
                testCasesList: {
                  where: { isHidden: false },
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
          orderBy: { orderIdx: "asc" },
        },
      },
    });

    if (!mockTest) {
      return apiError("Mock test not found", 404);
    }

    const dto = {
      id: mockTest.id,
      title: mockTest.title,
      slug: mockTest.slug,
      description: mockTest.description,
      company: mockTest.company,
      mockType: mockTest.mockType,
      durationMins: mockTest.durationMins,
      totalMarks: mockTest.totalMarks,
      passingMarks: mockTest.passingMarks,
      isLive: mockTest.isLive,
      questions: mockTest.questions.map((mq) => {
        const topics = mq.question.questionTopics.map((qt) => qt.topic.name);
        return {
          id: mq.id,
          questionId: mq.question.id,
          title: mq.question.title,
          slug: mq.question.slug,
          description: mq.question.description,
          inputFormat: mq.question.inputFormat,
          outputFormat: mq.question.outputFormat,
          constraints: mq.question.constraints,
          difficulty: mq.question.difficulty,
          questionType: mq.question.questionType,
          marks: mq.marks,
          orderIdx: mq.orderIdx,
          topics,
          sqlSchemaSql: mq.question.sqlSchemaSql,
          sqlSeedData: mq.question.sqlSeedData,
          sqlExpectedQuery: mq.question.sqlExpectedQuery,
          htmlTemplate: mq.question.htmlTemplate,
          cssTemplate: mq.question.cssTemplate,
          jsTemplate: mq.question.jsTemplate,
          starterCode: mq.question.starterCode ? JSON.parse(mq.question.starterCode) : {},
          examples: mq.question.examplesList.map((ex) => ({
            input: ex.input,
            output: ex.output,
            explanation: ex.explanation,
          })),
          sampleTestCases: mq.question.testCasesList.map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
        };
      }),
    };

    return apiSuccess(dto);
  } catch (error: any) {
    console.error("GET /api/mock-tests/[id] error:", error);
    return apiError("Failed to fetch mock test", 500, error.message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { answers = {}, durationSeconds = 0 } = body;

    const mockTest = await prisma.mockTest.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        questions: {
          include: {
            question: {
              include: {
                testCasesList: true,
                questionTopics: { include: { topic: true } },
              },
            },
          },
          orderBy: { orderIdx: "asc" },
        },
      },
    });

    if (!mockTest) {
      return apiError("Mock test not found", 404);
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "candidate@accenture-prep.local", name: "Candidate Engineer" },
      });
    }

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    // Trackers for Result Analysis breakdowns
    const typeStats: Record<string, { total: number; correct: number }> = {
      CODING: { total: 0, correct: 0 },
      SQL: { total: 0, correct: 0 },
      FRONTEND: { total: 0, correct: 0 },
    };

    const diffStats: Record<string, { total: number; correct: number }> = {
      EASY: { total: 0, correct: 0 },
      MEDIUM: { total: 0, correct: 0 },
      HARD: { total: 0, correct: 0 },
    };

    const topicStats: Record<string, { total: number; correct: number }> = {};

    const evaluatedQuestions: Array<{
      questionId: string;
      title: string;
      slug: string;
      questionType: string;
      difficulty: string;
      marks: number;
      marksAwarded: number;
      isCorrect: boolean;
      isAttempted: boolean;
      status: string;
      timeSpentSec: number;
      topics: string[];
      evaluationMessage?: string;
    }> = [];

    // Evaluate each question in the mock
    for (const mq of mockTest.questions) {
      const q = mq.question;
      const userAns = answers[q.id] || answers[q.slug];
      const userCode = userAns?.code || "";
      const language = userAns?.language || (q.questionType === "SQL" ? "sql" : "javascript");
      const userStatus = userAns?.status || "NOT_VISITED";
      const timeSpentSec = userAns?.timeSpentSec || 0;

      // Group question topics
      const topics = q.questionTopics.map((qt) => qt.topic.name);
      topics.forEach((t) => {
        if (!topicStats[t]) topicStats[t] = { total: 0, correct: 0 };
        topicStats[t].total++;
      });

      // Track difficulty & question type totals
      const normalizedType =
        q.questionType === "HTML_CSS_JS" || q.questionType === "FRONTEND"
          ? "FRONTEND"
          : q.questionType === "SQL"
          ? "SQL"
          : "CODING";

      if (typeStats[normalizedType]) typeStats[normalizedType].total++;
      if (diffStats[q.difficulty]) diffStats[q.difficulty].total++;

      // Check if code was attempted
      const trimmed = userCode.trim();
      const defaultPlaceholders = [
        "// Write your solution here",
        "-- Write your SQL query here",
        "-- Write your SQL query here\nSELECT",
        "// Implement listener",
        "// Implement filter logic",
        "// Implement DOM listeners",
        "// Write your JavaScript DOM logic here",
        "function solution() {\n  \n}",
      ];

      let isPlaceholder = !trimmed;
      if (!isPlaceholder) {
        isPlaceholder = defaultPlaceholders.some(
          (p) => trimmed === p.trim() || (trimmed.startsWith(p.trim()) && trimmed.length < p.trim().length + 5)
        );
      }
      if (!isPlaceholder && q.starterCode) {
        try {
          const parsed = JSON.parse(q.starterCode);
          const langCode = parsed[language] || parsed.javascript || "";
          if (trimmed === langCode.trim()) isPlaceholder = true;
        } catch {}
      }

      const hasAttempted = userStatus !== "NOT_VISITED" && !isPlaceholder && trimmed.length > 5;

      let isCorrect = false;
      let marksAwarded = 0;
      let evalMessage = "";

      if (!hasAttempted) {
        unattemptedCount++;
        evalMessage = "Question was not attempted.";
      } else {
        if (normalizedType === "FRONTEND") {
          const feRes = evaluateFrontendCode(q.slug, userCode, q.htmlTemplate);
          isCorrect = feRes.isCorrect;
          evalMessage = feRes.message;
        } else if (normalizedType === "SQL") {
          const sqlRes = executeSandboxedSql({
            schemaSql: q.sqlSchemaSql,
            seedSql: q.sqlSeedData,
            userQuery: userCode,
            expectedQuery: q.sqlExpectedQuery,
            checkCorrectness: true,
          });
          isCorrect = Boolean(sqlRes.isCorrect);
          evalMessage = sqlRes.isCorrect ? "SQL query returned matching rows." : (sqlRes.error || "Query result mismatch.");
        } else {
          const allTestCases = q.testCasesList.length > 0
            ? q.testCasesList.map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
            : JSON.parse(q.testCases || "[]");

          const evalRes = executeSandboxedCode({
            language,
            code: userCode,
            testCases: allTestCases,
            timeLimitMs: 2500,
          });
          isCorrect = evalRes.verdict === "ACCEPTED";
          evalMessage = evalRes.verdict === "ACCEPTED"
            ? "All test cases passed."
            : `${evalRes.verdict}: ${evalRes.error || "Test case assertion failed."}`;
        }

        if (isCorrect) {
          correctCount++;
          marksAwarded = mq.marks;
          totalScore += marksAwarded;
          if (typeStats[normalizedType]) typeStats[normalizedType].correct++;
          if (diffStats[q.difficulty]) diffStats[q.difficulty].correct++;
          topics.forEach((t) => topicStats[t].correct++);
        } else {
          incorrectCount++;
        }
      }

      evaluatedQuestions.push({
        questionId: q.id,
        title: q.title,
        slug: q.slug,
        questionType: normalizedType,
        difficulty: q.difficulty,
        marks: mq.marks,
        marksAwarded,
        isCorrect,
        isAttempted: hasAttempted,
        status: userStatus,
        timeSpentSec,
        topics,
        evaluationMessage: evalMessage,
      });
    }

    const totalQuestions = mockTest.questions.length;
    const attemptedQuestions = correctCount + incorrectCount;
    const accuracy = attemptedQuestions > 0 ? (correctCount / attemptedQuestions) * 100 : 0;

    // Create DB Attempt Record
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: user.id,
        mockTestId: mockTest.id,
        submittedAt: new Date(),
        duration: durationSeconds,
        score: totalScore,
        totalQuestions,
        correctAnswers: correctCount,
        accuracy: Math.round(accuracy * 10) / 10,
        questions: {
          create: evaluatedQuestions.map((eq) => ({
            questionId: eq.questionId,
            userCode: answers[eq.questionId]?.code || "",
            language: answers[eq.questionId]?.language || "javascript",
            status: eq.status,
            isCorrect: eq.isCorrect,
            marksAwarded: eq.marksAwarded,
            timeSpentSec: eq.timeSpentSec,
          })),
        },
      },
    });

    // Breakdown metrics calculation
    const calcAccuracy = (correct: number, total: number) =>
      total > 0 ? Math.round((correct / total) * 100) : 0;

    const codingAccuracy = calcAccuracy(typeStats.CODING.correct, typeStats.CODING.total);
    const sqlAccuracy = calcAccuracy(typeStats.SQL.correct, typeStats.SQL.total);
    const frontendAccuracy = calcAccuracy(typeStats.FRONTEND.correct, typeStats.FRONTEND.total);

    const easyAccuracy = calcAccuracy(diffStats.EASY.correct, diffStats.EASY.total);
    const mediumAccuracy = calcAccuracy(diffStats.MEDIUM.correct, diffStats.MEDIUM.total);
    const hardAccuracy = calcAccuracy(diffStats.HARD.correct, diffStats.HARD.total);

    // Topic Performance & Weak Topics (<60% accuracy)
    const topicPerformance = Object.entries(topicStats).map(([topic, stats]) => {
      const topicAcc = calcAccuracy(stats.correct, stats.total);
      return {
        topic,
        total: stats.total,
        correct: stats.correct,
        accuracy: topicAcc,
        isWeak: topicAcc < 60,
      };
    });

    const weakTopics = topicPerformance
      .filter((t) => t.isWeak)
      .map((t) => t.topic);

    const solvedQuestions = evaluatedQuestions.filter((q) => q.isCorrect);
    const incorrectQuestions = evaluatedQuestions.filter((q) => q.isAttempted && !q.isCorrect);
    const unattemptedQuestions = evaluatedQuestions.filter((q) => !q.isAttempted);

    return apiSuccess({
      attemptId: attempt.id,
      mockTestId: mockTest.id,
      mockTitle: mockTest.title,
      mockType: mockTest.mockType,
      score: totalScore,
      totalMarks: mockTest.totalMarks,
      passingMarks: mockTest.passingMarks,
      isPassed: totalScore >= mockTest.passingMarks,
      accuracy: Math.round(accuracy * 10) / 10,
      correct: correctCount,
      incorrect: incorrectCount,
      unattempted: unattemptedCount,
      totalQuestions,
      timeTakenSeconds: durationSeconds,
      
      // Type breakdown
      codingAccuracy,
      sqlAccuracy,
      frontendAccuracy,

      // Difficulty breakdown
      easyAccuracy,
      mediumAccuracy,
      hardAccuracy,

      // Topics
      topicPerformance,
      weakTopics,

      // Question lists
      solvedQuestions,
      incorrectQuestions,
      unattemptedQuestions,
      allQuestions: evaluatedQuestions,
    });
  } catch (error: any) {
    console.error("POST /api/mock-tests/[id] evaluation error:", error);
    return apiError("Failed to evaluate mock test submission", 500, error.message);
  }
}
