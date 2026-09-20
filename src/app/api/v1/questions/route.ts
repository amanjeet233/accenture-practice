import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const questionType = searchParams.get("questionType");
    const sourceType = searchParams.get("sourceType");
    const importance = searchParams.get("importance");
    const topic = searchParams.get("topic");
    const company = searchParams.get("company");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: any = {};

    if (difficulty) where.difficulty = difficulty;
    if (questionType) where.questionType = questionType;
    if (sourceType) where.sourceType = sourceType;
    if (importance) where.importance = importance;
    if (topic) where.topics = { contains: topic };
    if (company) where.companies = { contains: company.toLowerCase() };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { topics: { contains: search } },
      ];
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          questionType: true,
          topics: true,
          companies: true,
          importance: true,
          importanceReason: true,
          sourceType: true,
          sourceDocument: true,
          sourceDate: true,
          sourceShift: true,
          verificationStatus: true,
          frequency: true,
          createdAt: true,
        },
        orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedQuestions = questions.map((q) => ({
      ...q,
      topics: JSON.parse(q.topics || "[]"),
      companies: JSON.parse(q.companies || "[]"),
    }));

    return NextResponse.json({
      success: true,
      data: formattedQuestions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
