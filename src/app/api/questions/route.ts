import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { questionFilterSchema, createQuestionSchema } from "@/lib/validations/question";
import { apiSuccess, apiError, toQuestionSummaryDTO, toQuestionDetailDTO } from "@/lib/dto";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryObj = Object.fromEntries(url.searchParams.entries());

    // Validate filters and pagination
    const parseResult = questionFilterSchema.safeParse(queryObj);
    if (!parseResult.success) {
      return apiError("Invalid query parameters", 400, parseResult.error.flatten());
    }

    const {
      filter,
      difficulty,
      questionType,
      sourceType,
      category,
      importance,
      topic,
      company,
      year,
      shift,
      repeated,
      status,
      search,
      page,
      size,
      sort,
    } = parseResult.data;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (filter === "MUST_DO") {
      where.OR = [
        { importance: "MUST_DO" },
        { frequency: { gte: 2 } },
        { importanceReason: { contains: "Must Do" } },
      ];
    } else if (filter === "REPEATED") {
      where.frequency = { gt: 1 };
    } else if (filter === "RECENT") {
      where.OR = [
        { sourceDate: { gte: new Date("2024-01-01") } },
        { description: { contains: "2024" } },
        { description: { contains: "2025" } },
        { importanceReason: { contains: "2024" } },
        { importanceReason: { contains: "2025" } },
      ];
    } else if (filter === "SHIFT") {
      where.OR = [
        { sourceType: "SHIFT_REPORTED" },
        { sourceShift: { not: null } },
        { importanceReason: { contains: "Shift" } },
      ];
    } else if (filter === "PYQ") {
      where.sourceType = "REPORTED_PYQ";
    } else if (filter === "MEDIUM") {
      where.difficulty = "MEDIUM";
    } else if (filter === "HARD") {
      where.difficulty = "HARD";
    }

    if (difficulty && !filter) where.difficulty = difficulty;
    if (questionType) where.questionType = questionType;
    if (sourceType && !filter) where.sourceType = sourceType;
    if (importance && !filter) where.importance = importance;

    if (company) {
      where.OR = [
        { companies: { contains: company.toLowerCase() } },
        { questionCompanies: { some: { company: { slug: company.toLowerCase() } } } },
        { questionCompanies: { some: { company: { name: { contains: company } } } } },
      ];
    }

    if (topic) {
      where.OR = [
        ...(where.OR || []),
        { topics: { contains: topic } },
        { questionTopics: { some: { topic: { slug: topic.toLowerCase() } } } },
        { questionTopics: { some: { topic: { name: { contains: topic } } } } },
      ];
    }

    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      where.OR = [
        ...(where.OR || []),
        { sourceDate: { gte: startOfYear, lte: endOfYear } },
        { questionSources: { some: { date: { gte: startOfYear, lte: endOfYear } } } },
      ];
    }

    if (shift) {
      where.OR = [
        ...(where.OR || []),
        { sourceShift: { contains: shift } },
        { questionSources: { some: { shift: { contains: shift } } } },
      ];
    }

    if (repeated === "true") {
      where.frequency = { gt: 1 };
    }

    if (status === "solved") {
      where.progress = { some: { isSolved: true } };
    } else if (status === "unsolved") {
      where.progress = { none: { isSolved: true } };
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { topics: { contains: search } },
          ],
        },
      ];
    }

    let orderBy: any = [{ frequency: "desc" }, { createdAt: "desc" }];
    if (sort === "newest") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sort === "difficulty") {
      orderBy = [{ difficulty: "asc" }];
    } else if (sort === "importance") {
      orderBy = [{ importance: "asc" }];
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: {
          questionTopics: { include: { topic: true } },
          questionCompanies: { include: { company: true } },
          questionSources: { include: { sourceDocument: true } },
          bookmarks: true,
          progress: true,
        },
        orderBy,
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    const dtos = questions.map(toQuestionSummaryDTO);

    return apiSuccess(dtos, { page, size, total });
  } catch (error: any) {
    console.error("GET /api/questions error:", error);
    return apiError("Failed to fetch questions", 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = createQuestionSchema.safeParse(body);

    if (!parseResult.success) {
      return apiError("Validation failed", 422, parseResult.error.flatten());
    }

    const data = parseResult.data;

    // Check slug uniqueness
    const existing = await prisma.question.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return apiError("Question with this slug already exists", 409);
    }

    // Resolve topics
    const topicConnect = await Promise.all(
      data.topics.map(async (slugOrName) => {
        const found = await prisma.topic.findFirst({
          where: {
            OR: [{ slug: slugOrName.toLowerCase() }, { name: slugOrName }],
          },
        });
        return found ? { topicId: found.id } : null;
      })
    );
    const validTopicConnect = topicConnect.filter(Boolean) as { topicId: string }[];

    // Resolve companies
    const companyConnect = await Promise.all(
      data.companies.map(async (slugOrName) => {
        const found = await prisma.company.findFirst({
          where: {
            OR: [{ slug: slugOrName.toLowerCase() }, { name: slugOrName }],
          },
        });
        return found ? { companyId: found.id } : null;
      })
    );
    const validCompanyConnect = companyConnect.filter(Boolean) as { companyId: string }[];

    const created = await prisma.question.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        inputFormat: data.inputFormat,
        outputFormat: data.outputFormat,
        constraints: data.constraints,
        difficulty: data.difficulty,
        questionType: data.questionType,
        sourceType: data.sourceType,
        importance: data.importance,
        importanceReason: data.importanceReason,
        verificationStatus: data.verificationStatus,
        frequency: data.frequency,
        topics: JSON.stringify(data.topics),
        companies: JSON.stringify(data.companies),

        examplesList: {
          create: data.examples.map((ex, i) => ({
            input: ex.input,
            output: ex.output,
            explanation: ex.explanation,
            orderIndex: ex.orderIndex ?? i,
          })),
        },
        testCasesList: {
          create: data.testCases.map((tc, i) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            orderIndex: tc.orderIndex ?? i,
          })),
        },
        hintsList: {
          create: data.hints.map((h, i) => ({
            content: h.content,
            orderIndex: h.orderIndex ?? i,
          })),
        },
        solutionsList: {
          create: data.solutions.map((s) => ({
            language: s.language,
            code: s.code,
            approach: s.approach,
            timeComplexity: s.timeComplexity,
            spaceComplexity: s.spaceComplexity,
          })),
        },
        questionTopics: {
          create: validTopicConnect,
        },
        questionCompanies: {
          create: validCompanyConnect,
        },
        ...(data.sourceDocumentId && {
          questionSources: {
            create: [
              {
                sourceDocumentId: data.sourceDocumentId,
                page: data.sourcePage,
                shift: data.sourceShift,
                date: data.sourceDate ? new Date(data.sourceDate) : null,
                evidenceType: "OFFICIAL_MEMO",
              },
            ],
          },
        }),
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

    return apiSuccess(toQuestionDetailDTO(created, { isAdmin: true }), undefined);
  } catch (error: any) {
    console.error("POST /api/questions error:", error);
    return apiError("Failed to create question", 500, error.message);
  }
}
