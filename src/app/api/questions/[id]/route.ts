import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateQuestionSchema } from "@/lib/validations/question";
import { apiSuccess, apiError, toQuestionDetailDTO } from "@/lib/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const question = await prisma.question.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        questionTopics: { include: { topic: true } },
        questionCompanies: { include: { company: true } },
        questionSources: { include: { sourceDocument: true } },
        examplesList: { orderBy: { orderIndex: "asc" } },
        testCasesList: { orderBy: { orderIndex: "asc" } },
        hintsList: { orderBy: { orderIndex: "asc" } },
        solutionsList: true,
      },
    });

    if (!question) {
      return apiError("Question not found", 404);
    }

    const dto = toQuestionDetailDTO(question, { isAdmin: false });
    return apiSuccess(dto);
  } catch (error: any) {
    console.error("GET /api/questions/[id] error:", error);
    return apiError("Failed to fetch question", 500, error.message);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = updateQuestionSchema.safeParse(body);
    if (!parseResult.success) {
      return apiError("Validation failed", 422, parseResult.error.flatten());
    }

    const data = parseResult.data;

    // Check if question exists
    const existing = await prisma.question.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!existing) {
      return apiError("Question not found", 404);
    }

    const updated = await prisma.question.update({
      where: { id: existing.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.inputFormat !== undefined && { inputFormat: data.inputFormat }),
        ...(data.outputFormat !== undefined && { outputFormat: data.outputFormat }),
        ...(data.constraints !== undefined && { constraints: data.constraints }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.questionType && { questionType: data.questionType }),
        ...(data.sourceType && { sourceType: data.sourceType }),
        ...(data.importance && { importance: data.importance }),
        ...(data.importanceReason !== undefined && { importanceReason: data.importanceReason }),
        ...(data.verificationStatus && { verificationStatus: data.verificationStatus }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
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

    return apiSuccess(toQuestionDetailDTO(updated, { isAdmin: true }));
  } catch (error: any) {
    console.error("PUT /api/questions/[id] error:", error);
    return apiError("Failed to update question", 500, error.message);
  }
}
