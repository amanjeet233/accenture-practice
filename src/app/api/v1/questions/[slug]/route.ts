import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const question = await prisma.question.findUnique({
      where: { slug },
      include: {
        progress: {
          select: { isSolved: true, attemptsCount: true, lastAttemptedAt: true },
        },
        bookmarks: {
          select: { id: true, folderName: true, note: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const testCasesParsed = question.testCases ? JSON.parse(question.testCases) : [];
    // Only return public test cases to client for practice
    const publicTestCases = testCasesParsed.filter((tc: any) => !tc.isHidden);

    const formatted = {
      ...question,
      topics: JSON.parse(question.topics || "[]"),
      companies: JSON.parse(question.companies || "[]"),
      languages: JSON.parse(question.languages || "[]"),
      examples: JSON.parse(question.examples || "[]"),
      testCases: publicTestCases,
      starterCode: question.starterCode ? JSON.parse(question.starterCode) : {},
      hints: question.hints ? JSON.parse(question.hints) : [],
      isSolved: question.progress.some((p) => p.isSolved),
      isBookmarked: question.bookmarks.length > 0,
    };

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Failed to fetch question by slug:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
