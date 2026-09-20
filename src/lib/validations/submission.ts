import { z } from "zod";

export const createSubmissionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  language: z.enum(["javascript", "python", "java", "cpp", "sql"]).default("javascript"),
  sourceCode: z.string().refine((val) => val.trim().length > 0, {
    message: "Code cannot be empty.",
  }),
  isTestRun: z.boolean().optional().default(false),
  testCaseIndex: z.number().int().min(0).optional(),
  customInput: z.string().optional(),
  customExpectedOutput: z.string().optional(),
});

export const submissionFilterSchema = z.object({
  questionId: z.string().optional(),
  status: z.enum(["ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT", "RUNTIME_ERROR", "COMPILE_ERROR"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(50).default(10),
});
