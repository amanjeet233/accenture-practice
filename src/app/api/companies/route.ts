import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/dto";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { questionCompanies: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const dtos = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logo: c.logo,
      description: c.description,
      totalQuestions: c._count.questionCompanies,
    }));

    return apiSuccess(dtos);
  } catch (error: any) {
    console.error("GET /api/companies error:", error);
    return apiError("Failed to fetch companies", 500, error.message);
  }
}
