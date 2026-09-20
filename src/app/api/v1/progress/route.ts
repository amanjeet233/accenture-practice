import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          totalQuestions: 0,
          solvedCount: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalEasy: 0,
          totalMedium: 0,
          totalHard: 0,
          submissionsCount: 0,
          dueRevisions: 0,
        },
      });
    }

    const [totalQuestions, questions, progress, submissions, dueRevisions] =
      await Promise.all([
        prisma.question.count(),
        prisma.question.findMany({
          select: { id: true, difficulty: true, topics: true },
        }),
        prisma.userProgress.findMany({
          where: { userId: user.id },
        }),
        prisma.submission.count({
          where: { userId: user.id },
        }),
        prisma.revisionItem.count({
          where: {
            userId: user.id,
            nextReviewAt: { lte: new Date() },
          },
        }),
      ]);

    const solvedQuestionIds = new Set(
      progress.filter((p) => p.isSolved).map((p) => p.questionId)
    );

    const totalEasy = questions.filter((q) => q.difficulty === "EASY").length;
    const totalMedium = questions.filter((q) => q.difficulty === "MEDIUM").length;
    const totalHard = questions.filter((q) => q.difficulty === "HARD").length;

    const easySolved = questions.filter(
      (q) => q.difficulty === "EASY" && solvedQuestionIds.has(q.id)
    ).length;
    const mediumSolved = questions.filter(
      (q) => q.difficulty === "MEDIUM" && solvedQuestionIds.has(q.id)
    ).length;
    const hardSolved = questions.filter(
      (q) => q.difficulty === "HARD" && solvedQuestionIds.has(q.id)
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions,
        solvedCount: solvedQuestionIds.size,
        totalEasy,
        totalMedium,
        totalHard,
        easySolved,
        mediumSolved,
        hardSolved,
        submissionsCount: submissions,
        dueRevisions,
      },
    });
  } catch (error: any) {
    console.error("Failed to compute user progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
