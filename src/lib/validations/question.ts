import { z } from "zod";

export const QuestionDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

export const QuestionTypeEnum = z.enum([
  "CODING",
  "SQL",
  "HTML_CSS_JS",
  "DEBUGGING",
  "MCQ",
  "MOCK_TEST",
]);

export const SourceTypeEnum = z.enum([
  "REPORTED_PYQ",
  "SHIFT_REPORTED",
  "CANDIDATE_REPORTED",
  "COMPANY_PATTERN",
  "PRACTICE",
  "GENERAL_INTERVIEW",
]);

export const ImportanceEnum = z.enum(["MUST_DO", "HIGH", "MEDIUM", "LOW"]);

export const VerificationStatusEnum = z.enum([
  "UNVERIFIED",
  "COMMUNITY_VERIFIED",
  "OFFICIALLY_VERIFIED",
  "HIGH_CONFIDENCE",
]);

export const MasterCategoryEnum = z.enum([
  "ACCENTURE_PYQ",
  "ACCENTURE_REPORTED",
  "ACCENTURE_PATTERN",
  "GENERAL_DSA",
  "GENERAL_SQL",
  "GENERAL_FRONTEND",
]);

export const questionFilterSchema = z.object({
  filter: z.string().trim().optional(),
  difficulty: QuestionDifficultyEnum.optional(),
  questionType: QuestionTypeEnum.optional(),
  sourceType: SourceTypeEnum.optional(),
  category: MasterCategoryEnum.optional(),
  importance: ImportanceEnum.optional(),
  topic: z.string().trim().optional(),
  company: z.string().trim().optional(),
  year: z.coerce.number().int().optional(),
  shift: z.string().trim().optional(),
  repeated: z.string().trim().optional(),
  status: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(["newest", "frequency", "difficulty", "importance"]).default("frequency"),
});

export const createExampleSchema = z.object({
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
  explanation: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

export const createTestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

export const createHintSchema = z.object({
  content: z.string().min(1, "Hint content required"),
  orderIndex: z.number().int().default(0),
});

export const createSolutionSchema = z.object({
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Solution code is required"),
  approach: z.string().optional(),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
});

export const createQuestionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  inputFormat: z.string().optional(),
  outputFormat: z.string().optional(),
  constraints: z.string().optional(),
  difficulty: QuestionDifficultyEnum.default("MEDIUM"),
  questionType: QuestionTypeEnum.default("CODING"),
  sourceType: SourceTypeEnum.default("PRACTICE"),
  importance: ImportanceEnum.default("MEDIUM"),
  importanceReason: z.string().optional(),
  verificationStatus: VerificationStatusEnum.default("UNVERIFIED"),
  frequency: z.number().int().min(1).default(1),
  
  // Normalized relation inputs
  topics: z.array(z.string()).default([]), // Topic names or slugs
  companies: z.array(z.string()).default([]), // Company slugs or names
  tags: z.array(z.string()).default([]),
  
  examples: z.array(createExampleSchema).default([]),
  testCases: z.array(createTestCaseSchema).default([]),
  hints: z.array(createHintSchema).default([]),
  solutions: z.array(createSolutionSchema).default([]),
  
  // Provenance source document details
  sourceDocumentId: z.string().optional(),
  sourcePage: z.number().int().optional(),
  sourceShift: z.string().optional(),
  sourceDate: z.string().datetime().optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();
