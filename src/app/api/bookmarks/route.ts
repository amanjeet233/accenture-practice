import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBookmarkSchema } from "@/lib/validations/bookmark";
import { apiSuccess, apiError } from "@/lib/dto";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return apiSuccess([]);
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            importance: true,
            topics: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const dtos = bookmarks.map((b) => ({
      id: b.id,
      questionId: b.questionId,
      questionTitle: b.question.title,
      questionSlug: b.question.slug,
      difficulty: b.question.difficulty,
      importance: b.question.importance,
      folderName: b.folderName,
      note: b.note,
      createdAt: b.createdAt,
    }));

    return apiSuccess(dtos);
  } catch (error: any) {
    console.error("GET /api/bookmarks error:", error);
    return apiError("Failed to fetch bookmarks", 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return apiError("Authentication required to bookmark questions. Please log in.", 401);
    }

    const body = await request.json();
    const parseResult = createBookmarkSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError("Validation failed", 422, parseResult.error.flatten());
    }

    const { questionId, folderName, note } = parseResult.data;

    const question = await prisma.question.findFirst({
      where: { OR: [{ id: questionId }, { slug: questionId }] },
    });

    if (!question) {
      return apiError("Question not found", 404);
    }

    // Toggle or upsert bookmark
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: question.id,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return apiSuccess({ bookmarked: false, id: existing.id });
    } else {
      const created = await prisma.bookmark.create({
        data: {
          userId: user.id,
          questionId: question.id,
          folderName,
          note,
        },
      });
      return apiSuccess({
        bookmarked: true,
        id: created.id,
        folderName: created.folderName,
        note: created.note,
      });
    }
  } catch (error: any) {
    console.error("POST /api/bookmarks error:", error);
    return apiError("Failed to toggle bookmark", 500, error.message);
  }
}
