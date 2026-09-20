import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company");
    const shift = searchParams.get("shift");
    const verification = searchParams.get("verification");

    const where: any = {
      sourceType: {
        in: ["REPORTED_PYQ", "SHIFT_REPORTED", "CANDIDATE_REPORTED"],
      },
    };

    if (company) where.companies = { contains: company.toLowerCase() };
    if (shift) where.sourceShift = { contains: shift };
    if (verification) where.verificationStatus = verification;

    const pyqs = await prisma.question.findMany({
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
        sourcePage: true,
        sourceDate: true,
        sourceShift: true,
        verificationStatus: true,
        frequency: true,
      },
      orderBy: [{ sourceDate: "desc" }, { frequency: "desc" }],
    });

    const formatted = pyqs.map((q) => ({
      ...q,
      topics: JSON.parse(q.topics || "[]"),
      companies: JSON.parse(q.companies || "[]"),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Failed to fetch verified PYQs:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
