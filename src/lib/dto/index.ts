import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  pagination?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export function apiSuccess<T>(
  data: T,
  pagination?: { page: number; size: number; total: number }
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(pagination && {
      pagination: {
        page: pagination.page,
        size: pagination.size,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.size),
      },
    }),
  });
}

export function apiError(
  message: string,
  statusCode: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status: statusCode }
  );
}

// -----------------------------------------------------------------------------
// DTO TRANSFORMERS
// -----------------------------------------------------------------------------

export function toQuestionSummaryDTO(question: any) {
  // Extract topics from relation or JSON cache
  const topics = question.questionTopics && question.questionTopics.length > 0
    ? question.questionTopics.map((qt: any) => qt.topic?.name || qt.topic?.slug)
    : JSON.parse(question.topics || "[]");

  // Extract companies from relation or JSON cache
  const companies = question.questionCompanies && question.questionCompanies.length > 0
    ? question.questionCompanies.map((qc: any) => qc.company?.name || qc.company?.slug)
    : JSON.parse(question.companies || "[]");

  // Extract source provenance
  const source = question.questionSources?.[0];
  const dateObj = source?.date || question.sourceDate;
  const year = dateObj ? new Date(dateObj).getFullYear() : null;
  const shift = source?.shift || question.sourceShift || null;

  const sources = question.questionSources && question.questionSources.length > 0
    ? question.questionSources.map((qs: any) => ({
        id: qs.id,
        sourceDocument: qs.sourceDocument?.title || question.sourceDocument || "Reported Paper Archive",
        fileName: qs.sourceDocument?.fileName || null,
        page: qs.page ?? question.sourcePage ?? null,
        shift: qs.shift ?? question.sourceShift ?? null,
        date: qs.date ?? question.sourceDate ?? null,
        section: qs.section ?? null,
        evidenceType: qs.evidenceType ?? "PAPER_SCAN",
        notes: qs.notes ?? null,
      }))
    : (question.sourceDocument ? [{
        id: "source-default",
        sourceDocument: question.sourceDocument,
        fileName: null,
        page: question.sourcePage,
        shift: question.sourceShift,
        date: question.sourceDate,
        section: null,
        evidenceType: "PAPER_SCAN",
        notes: null,
      }] : []);

  const isSolved = question.progress && question.progress.length > 0
    ? question.progress.some((p: any) => p.isSolved)
    : false;

  const isBookmarked = question.bookmarks && question.bookmarks.length > 0;

  return {
    id: question.id,
    title: question.title,
    slug: question.slug,
    description: question.description,
    difficulty: question.difficulty,
    questionType: question.questionType,
    sourceType: question.sourceType,
    category: question.category,
    importance: question.importance,
    importanceReason: question.importanceReason,
    verificationStatus: question.verificationStatus,
    frequency: question.frequency,
    isRepeated: question.frequency > 1,
    year,
    shift,
    topics,
    companies,
    sourceDocument: source?.sourceDocument?.title || question.sourceDocument || null,
    sourceDate: source?.date || question.sourceDate || null,
    sourceShift: shift,
    sources,
    isSolved,
    isBookmarked,
    createdAt: question.createdAt,
  };
}

export function toQuestionDetailDTO(question: any, options: { isAdmin?: boolean } = {}) {
  const summary = toQuestionSummaryDTO(question);

  // Examples
  const examples =
    question.examplesList && question.examplesList.length > 0
      ? question.examplesList.map((ex: any) => ({
          input: ex.input,
          output: ex.output,
          explanation: ex.explanation,
        }))
      : JSON.parse(question.examples || "[]");

  // Hints
  const hints =
    question.hintsList && question.hintsList.length > 0
      ? question.hintsList.map((h: any) => h.content)
      : JSON.parse(question.hints || "[]");

  // Solutions
  const solutions =
    question.solutionsList && question.solutionsList.length > 0
      ? question.solutionsList.map((s: any) => ({
          language: s.language,
          code: s.code,
          approach: s.approach,
          timeComplexity: s.timeComplexity,
          spaceComplexity: s.spaceComplexity,
        }))
      : question.solution
      ? [{ language: "javascript", code: question.solution }]
      : [];

  // Test cases: strip hidden cases for non-admins
  let testCases: any[] = [];
  if (question.testCasesList && question.testCasesList.length > 0) {
    testCases = question.testCasesList
      .filter((tc: any) => options.isAdmin || !tc.isHidden)
      .map((tc: any) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));
  } else if (question.testCases) {
    const raw = JSON.parse(question.testCases || "[]");
    testCases = options.isAdmin ? raw : raw.filter((tc: any) => !tc.isHidden);
  }

  // Starter code
  const starterCode = question.starterCode
    ? JSON.parse(question.starterCode)
    : {};

  return {
    ...summary,
    inputFormat: question.inputFormat,
    outputFormat: question.outputFormat,
    constraints: question.constraints,
    examples,
    hints,
    solutions,
    testCases,
    starterCode,
    explanation: question.explanation,
    
    // Domain specifics
    javaSolution: question.javaSolution,
    sqlSolution: question.sqlSolution,
    approach: question.approach,
    commonMistakes: question.commonMistakes,
    hintsList: question.hintsList,
    sqlSchemaSql: question.sqlSchemaSql,
    sqlSeedData: question.sqlSeedData,
    sqlExpectedQuery: question.sqlExpectedQuery,
    htmlTemplate: question.htmlTemplate,
    cssTemplate: question.cssTemplate,
    jsTemplate: question.jsTemplate,
    frontendTestSpec: question.frontendTestSpec,
  };
}

export function toCompanyDTO(company: any) {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logo: company.logo,
    description: company.description,
    totalQuestions: company._count?.questionCompanies ?? 0,
  };
}

export function toTopicDTO(topic: any) {
  return {
    id: topic.id,
    name: topic.name,
    slug: topic.slug,
    category: topic.category,
    description: topic.description,
    totalQuestions: topic._count?.questionTopics ?? 0,
  };
}

export function toSubmissionDTO(submission: any) {
  return {
    id: submission.id,
    questionId: submission.questionId,
    questionTitle: submission.question?.title,
    questionSlug: submission.question?.slug,
    language: submission.language,
    sourceCode: submission.sourceCode,
    status: submission.status,
    runtime: submission.runtime,
    memory: submission.memory,
    submittedAt: submission.submittedAt,
  };
}
