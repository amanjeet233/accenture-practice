import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/dto";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: { questionTopics: true },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const dtos = topics.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      category: t.category,
      description: t.description,
      totalQuestions: t._count.questionTopics,
    }));

    return apiSuccess(dtos);
  } catch (error: any) {
    console.error("GET /api/topics error:", error);
    return apiError("Failed to fetch topics", 500, error.message);
  }
}
