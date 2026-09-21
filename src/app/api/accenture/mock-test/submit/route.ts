import { NextRequest, NextResponse } from "next/server";
import { evaluateMockTestSubmission } from "@/lib/mockTestService";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to submit test. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { questionIds, userAnswers, timeUsedSeconds, testId, startedAt, markedQuestionIds } = body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty question list." },
        { status: 400 }
      );
    }

    const evaluation = await evaluateMockTestSubmission(
      questionIds,
      userAnswers || {},
      typeof timeUsedSeconds === "number" ? timeUsedSeconds : 0,
      {
        testId,
        startedAt,
        markedQuestionIds,
        userId: user.id, // Strictly authoritative from session
      }
    );

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("Mock test evaluation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during evaluation." },
      { status: 500 }
    );
  }
}
