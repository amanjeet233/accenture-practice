import { z } from "zod";

export const createBookmarkSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  folderName: z.string().min(1).max(50).default("General"),
  note: z.string().max(500).optional(),
});
