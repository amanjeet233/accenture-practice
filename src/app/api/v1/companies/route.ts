import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY_LIST } from "@/lib/constants";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      select: {
        companies: true,
        difficulty: true,
        sourceType: true,
      },
    });

    const companyStats = COMPANY_LIST.map((comp) => {
      const matching = questions.filter((q) => {
        try {
          const comps = JSON.parse(q.companies || "[]");
          return comps.includes(comp.id);
        } catch {
          return false;
        }
      });

      return {
        ...comp,
        totalQuestions: matching.length,
        pyqCount: matching.filter((q) =>
          ["REPORTED_PYQ", "SHIFT_REPORTED", "CANDIDATE_REPORTED"].includes(
            q.sourceType
          )
        ).length,
        easyCount: matching.filter((q) => q.difficulty === "EASY").length,
        mediumCount: matching.filter((q) => q.difficulty === "MEDIUM").length,
        hardCount: matching.filter((q) => q.difficulty === "HARD").length,
      };
    });

    return NextResponse.json({
      success: true,
      data: companyStats,
    });
  } catch (error: any) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
