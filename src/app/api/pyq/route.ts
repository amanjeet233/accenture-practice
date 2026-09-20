import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, toQuestionSummaryDTO } from "@/lib/dto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company");
    const shift = searchParams.get("shift");
    const verification = searchParams.get("verification");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "20", 10);

    const where: any = {
      sourceType: {
        in: ["REPORTED_PYQ", "SHIFT_REPORTED", "CANDIDATE_REPORTED"],
      },
    };

    if (verification) where.verificationStatus = verification;

    if (company) {
      where.OR = [
        { companies: { contains: company.toLowerCase() } },
        { questionCompanies: { some: { company: { slug: company.toLowerCase() } } } },
      ];
    }

    if (shift) {
      where.OR = [
        ...(where.OR || []),
        { sourceShift: { contains: shift } },
        { questionSources: { some: { shift: { contains: shift } } } },
      ];
    }

    const [total, pyqs] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: {
          questionTopics: { include: { topic: true } },
          questionCompanies: { include: { company: true } },
          questionSources: { include: { sourceDocument: true } },
        },
        orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    const dtos = pyqs.map(toQuestionSummaryDTO);

    return apiSuccess(dtos, { page, size, total });
  } catch (error: any) {
    console.error("GET /api/pyq error:", error);
    return apiError("Failed to fetch verified PYQs", 500, error.message);
  }
}
