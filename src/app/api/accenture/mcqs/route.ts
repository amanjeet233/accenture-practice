import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CANONICAL_TOPICS,
  CANONICAL_TOPIC_LIST,
  resolveCanonicalTopic,
  getTopicPrismaFilter,
  CanonicalTopicId,
} from "@/lib/canonicalTopics";
import { formatMcqQuestion } from "@/lib/mcqService";
import { createStreamResponse } from "@/lib/streaming-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicParam = searchParams.get("topic") || searchParams.get("category");
    const searchQuery = searchParams.get("q") || searchParams.get("search");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const isRandom = searchParams.get("random") === "true" || searchParams.get("random") === "1";

    // 1. Topic is strictly required and must be canonical
    if (!topicParam) {
      return NextResponse.json(
        {
          error: "Topic query parameter is strictly required.",
          validTopics: Object.keys(CANONICAL_TOPICS),
          validSlugs: CANONICAL_TOPIC_LIST.map((t) => t.slug),
        },
        { status: 400 }
      );
    }

    const canonical = resolveCanonicalTopic(topicParam);
    if (!canonical) {
      return NextResponse.json(
        {
          error: `Invalid topic: '${topicParam}'. Invalid topics will not return default/all questions.`,
          validTopics: Object.keys(CANONICAL_TOPICS),
          validSlugs: CANONICAL_TOPIC_LIST.map((t) => t.slug),
        },
        { status: 400 }
      );
    }

    // 2. Build strict database filter isolated to this canonical topic
    const topicFilter = getTopicPrismaFilter(canonical);

    const andConditions: any[] = [topicFilter, { questionType: "MCQ" }];

    // Search within topic only
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { explanation: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const whereClause = {
      AND: andConditions,
    };

    // 3. Count total matching questions strictly within this topic
    const total = await prisma.question.count({
      where: whereClause,
    });

    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 20 : limitParam));
    const totalPages = Math.ceil(total / limit);

    // 4. Query questions with pagination applied BEFORE retrieval
    let questionsRaw: any[] = [];

    if (isRandom && total > 0) {
      // Fetch within topic using random skip offset or sample
      const randomSkip = total > limit ? Math.floor(Math.random() * (total - limit + 1)) : 0;
      questionsRaw = await prisma.question.findMany({
        where: whereClause,
        skip: randomSkip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          category: true,
          difficulty: true,
          sourceType: true,
          solution: true,
          explanation: true,
          importanceReason: true,
          starterCode: true,
          frequency: true,
          createdAt: true,
        },
      });
    } else {
      const skip = (page - 1) * limit;
      questionsRaw = await prisma.question.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          category: true,
          difficulty: true,
          sourceType: true,
          solution: true,
          explanation: true,
          importanceReason: true,
          starterCode: true,
          frequency: true,
          createdAt: true,
        },
        orderBy: [{ frequency: "desc" }, { createdAt: "asc" }],
      });
    }

    // 5. Format questions
    const offset = (page - 1) * limit;
    const formatted = questionsRaw.map((q, idx) => formatMcqQuestion(q, offset + idx + 1));

    return createStreamResponse(
      {
        topic: canonical.id,
        topicName: canonical.name,
        slug: canonical.slug,
        page,
        limit,
        total,
        totalPages,
        questions: formatted,
      },
      200
    );
  } catch (error: any) {
    console.error("Error fetching Accenture topic MCQs:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}
