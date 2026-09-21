import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to access history." },
        { status: 401 }
      );
    }

    const [testAttempts, submissions] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { userId: user.id },
        include: {
          mockTest: {
            select: { title: true, slug: true, durationMins: true, totalMarks: true },
          },
        },
        orderBy: { startedAt: "desc" },
        take: 50,
      }),
      prisma.submission.findMany({
        where: { userId: user.id },
        include: {
          question: {
            select: { title: true, slug: true, category: true, difficulty: true },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      success: true,
      userId: user.id,
      testAttempts,
      submissions,
    });
  } catch (error: any) {
    console.error("GET /api/user/history error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching history." },
      { status: 500 }
    );
  }
}
