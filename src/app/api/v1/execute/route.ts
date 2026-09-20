import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeSandboxedCode } from "@/lib/executor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language = "javascript", questionId, customInput } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Code content cannot be empty." },
        { status: 400 }
      );
    }

    let testCases: Array<{ input: string; expectedOutput: string }> = [];

    if (customInput) {
      testCases = [{ input: customInput, expectedOutput: "" }];
    } else if (questionId) {
      const question = await prisma.question.findFirst({
        where: { OR: [{ id: questionId }, { slug: questionId }] },
        include: { testCasesList: true },
      });
      if (question?.testCasesList && question.testCasesList.length > 0) {
        testCases = question.testCasesList
          .filter((tc) => !tc.isHidden)
          .map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput }));
      } else if (question?.testCases) {
        const allCases = JSON.parse(question.testCases);
        testCases = allCases.filter((tc: any) => !tc.isHidden);
      }
    }

    if (testCases.length === 0) {
      testCases = [{ input: "", expectedOutput: "" }];
    }

    const result = executeSandboxedCode({
      language,
      code,
      testCases,
      customInput,
      timeLimitMs: 3000,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Execution error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute code" },
      { status: 500 }
    );
  }
}
