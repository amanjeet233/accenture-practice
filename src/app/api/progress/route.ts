import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/dto";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return apiSuccess({
        totalQuestions: 0,
        solvedCount: 0,
        totalEasy: 0,
        totalMedium: 0,
        totalHard: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        submissionsCount: 0,
        dueRevisions: 0,
        topicMastery: [],
      });
    }

    const [questions, userProgress, submissionsCount, dueRevisions, topics] =
      await Promise.all([
        prisma.question.findMany({
          select: {
            id: true,
            difficulty: true,
            questionTopics: { select: { topic: { select: { id: true, name: true, slug: true } } } },
          },
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
        prisma.topic.findMany({
          include: {
            questionTopics: { select: { questionId: true } },
          },
        }),
      ]);

    const solvedSet = new Set(
      userProgress.filter((p) => p.isSolved).map((p) => p.questionId)
    );

    const totalEasy = questions.filter((q) => q.difficulty === "EASY").length;
    const totalMedium = questions.filter((q) => q.difficulty === "MEDIUM").length;
    const totalHard = questions.filter((q) => q.difficulty === "HARD").length;

    const easySolved = questions.filter(
      (q) => q.difficulty === "EASY" && solvedSet.has(q.id)
    ).length;
    const mediumSolved = questions.filter(
      (q) => q.difficulty === "MEDIUM" && solvedSet.has(q.id)
    ).length;
    const hardSolved = questions.filter(
      (q) => q.difficulty === "HARD" && solvedSet.has(q.id)
    ).length;

    // Topic mastery calculation
    const topicMastery = topics
      .filter((t) => t.questionTopics.length > 0)
      .map((t) => {
        const total = t.questionTopics.length;
        const solved = t.questionTopics.filter((qt) =>
          solvedSet.has(qt.questionId)
        ).length;
        return {
          topicId: t.id,
          name: t.name,
          slug: t.slug,
          total,
          solved,
          percentage: total > 0 ? Math.round((solved / total) * 100) : 0,
        };
      });

    return apiSuccess({
      totalQuestions: questions.length,
      solvedCount: solvedSet.size,
      totalEasy,
      totalMedium,
      totalHard,
      easySolved,
      mediumSolved,
      hardSolved,
      submissionsCount,
      dueRevisions,
      topicMastery,
    });
  } catch (error: any) {
    console.error("GET /api/progress error:", error);
    return apiError("Failed to fetch user progress", 500, error.message);
  }
}
