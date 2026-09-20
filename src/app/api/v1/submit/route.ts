import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeJavascriptCode } from "@/lib/executor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, questionId } = body;

    if (!code || !questionId) {
      return NextResponse.json(
        { success: false, error: "Question ID and code are required" },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Default user (in production, populated from auth session)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "student@accenture-prep.local",
          name: "Engineer Candidate",
        },
      });
    }

    const allTestCases = question.testCases ? JSON.parse(question.testCases) : [];
    const evaluation = executeJavascriptCode(code, allTestCases, 3000);

    let mappedStatus = "ACCEPTED";
    if (evaluation.verdict === "ACCEPTED") mappedStatus = "ACCEPTED";
    else if (evaluation.verdict === "WRONG_ANSWER") mappedStatus = "WRONG_ANSWER";
    else if ((evaluation.verdict as string) === "TIME_LIMIT" || (evaluation.verdict as string) === "TIME_LIMIT_EXCEEDED") mappedStatus = "TIME_LIMIT";
    else mappedStatus = "RUNTIME_ERROR";

    // Record submission
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        questionId: question.id,
        sourceCode: code,
        language: language || "javascript",
        status: mappedStatus,
        runtime: evaluation.runtimeMs,
        memory: evaluation.memoryKb,
      },
    });

    // Update progress
    const isAccepted = evaluation.verdict === "ACCEPTED";
    await prisma.userProgress.upsert({
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

    return NextResponse.json({
      success: true,
      data: {
        submissionId: submission.id,
        verdict: evaluation.verdict,
        runtimeMs: evaluation.runtimeMs,
        memoryKb: evaluation.memoryKb,
        failedTestIdx: evaluation.failedTestIdx,
        passedCases: evaluation.testResults.filter((r: any) => r.passed).length,
        totalCases: allTestCases.length,
      },
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit solution" },
      { status: 500 }
    );
  }
}
