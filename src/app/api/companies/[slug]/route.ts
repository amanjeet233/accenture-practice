import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, toQuestionSummaryDTO } from "@/lib/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const company = await prisma.company.findFirst({
      where: {
        OR: [{ slug: slug.toLowerCase() }, { id: slug }],
      },
      include: {
        questionCompanies: {
          include: {
            question: {
              include: {
                questionTopics: { include: { topic: true } },
                questionCompanies: { include: { company: true } },
                questionSources: { include: { sourceDocument: true } },
              },
            },
          },
        },
        sourceDocuments: true,
        mockTests: true,
      },
    });

    if (!company) {
      return apiError("Company not found", 404);
    }

    const questions = company.questionCompanies.map((qc) =>
      toQuestionSummaryDTO(qc.question)
    );

    const dto = {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo: company.logo,
      description: company.description,
      totalQuestions: questions.length,
      questions,
      sourceDocuments: company.sourceDocuments.map((doc) => ({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        sourceDate: doc.sourceDate,
        description: doc.description,
        totalPages: doc.totalPages,
        verificationStatus: doc.verificationStatus,
      })),
      mockTests: company.mockTests.map((m) => ({
        id: m.id,
        title: m.title,
        slug: m.slug,
        durationMins: m.durationMins,
        totalMarks: m.totalMarks,
      })),
    };

    return apiSuccess(dto);
  } catch (error: any) {
    console.error("GET /api/companies/[slug] error:", error);
    return apiError("Failed to fetch company details", 500, error.message);
  }
}
