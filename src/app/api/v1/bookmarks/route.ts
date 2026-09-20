import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
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
            sourceType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookmarks.map((b) => ({
      ...b,
      question: {
        ...b.question,
        topics: JSON.parse(b.question.topics || "[]"),
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { questionId, folderName, note } = await request.json();
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "student@accenture-prep.local", name: "Engineer Candidate" },
      });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    });

    if (existing) {
      // Toggle off
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      // Toggle on
      const created = await prisma.bookmark.create({
        data: {
          userId: user.id,
          questionId,
          folderName: folderName || "General",
          note,
        },
      });
      return NextResponse.json({ success: true, bookmarked: true, data: created });
    }
  } catch (error: any) {
    console.error("Failed to toggle bookmark:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update bookmark" },
      { status: 500 }
    );
  }
}
