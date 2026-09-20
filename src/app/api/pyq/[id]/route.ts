import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, toQuestionDetailDTO } from "@/lib/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const question = await prisma.question.findFirst({
      where: {
        AND: [
          { OR: [{ id }, { slug: id }] },
          {
            sourceType: {
              in: ["REPORTED_PYQ", "SHIFT_REPORTED", "CANDIDATE_REPORTED"],
            },
          },
        ],
      },
      include: {
        questionTopics: { include: { topic: true } },
        questionCompanies: { include: { company: true } },
        questionSources: { include: { sourceDocument: true } },
        examplesList: true,
        testCasesList: true,
        hintsList: true,
        solutionsList: true,
      },
    });

    if (!question) {
      return apiError("Verified PYQ not found", 404);
    }

    const detail = toQuestionDetailDTO(question, { isAdmin: false });
    const provenanceSources = question.questionSources.map((qs) => ({
      id: qs.id,
      page: qs.page,
      shift: qs.shift,
      date: qs.date,
      section: qs.section,
      evidenceType: qs.evidenceType,
      notes: qs.notes,
      sourceDocument: qs.sourceDocument
        ? {
            id: qs.sourceDocument.id,
            title: qs.sourceDocument.title,
            fileName: qs.sourceDocument.fileName,
            totalPages: qs.sourceDocument.totalPages,
            verificationStatus: qs.sourceDocument.verificationStatus,
          }
        : null,
    }));

    return apiSuccess({
      ...detail,
      provenanceSources,
    });
  } catch (error: any) {
    console.error("GET /api/pyq/[id] error:", error);
    return apiError("Failed to fetch PYQ details", 500, error.message);
  }
}
