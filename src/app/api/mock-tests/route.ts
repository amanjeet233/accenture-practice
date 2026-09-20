import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/dto";

export async function GET() {
  try {
    const mockTests = await prisma.mockTest.findMany({
      include: {
        companyRef: {
          select: { name: true, slug: true, logo: true },
        },
        questions: {
          include: {
            question: {
              select: { id: true, title: true, slug: true, difficulty: true },
            },
          },
          orderBy: { orderIdx: "asc" },
        },
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const dtos = mockTests.map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      description: m.description,
      company: m.company,
      companyDetails: m.companyRef,
      durationMins: m.durationMins,
      totalMarks: m.totalMarks,
      passingMarks: m.passingMarks,
      isLive: m.isLive,
      totalQuestions: m.questions.length,
      totalAttempts: m._count.attempts,
      questions: m.questions.map((mq) => ({
        id: mq.id,
        questionId: mq.questionId,
        title: mq.question.title,
        slug: mq.question.slug,
        difficulty: mq.question.difficulty,
        marks: mq.marks,
        orderIdx: mq.orderIdx,
      })),
    }));

    return apiSuccess(dtos);
  } catch (error: any) {
    console.error("GET /api/mock-tests error:", error);
    return apiError("Failed to fetch mock tests", 500, error.message);
  }
}
