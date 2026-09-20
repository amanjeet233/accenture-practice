export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type Importance = "MUST_DO" | "HIGH" | "MEDIUM" | "LOW";

export type QuestionType =
  | "CODING"
  | "SQL"
  | "HTML_CSS_JS"
  | "DEBUGGING"
  | "MCQ"
  | "MOCK_TEST";

export type SourceType =
  | "REPORTED_PYQ"
  | "SHIFT_REPORTED"
  | "CANDIDATE_REPORTED"
  | "COMPANY_PATTERN"
  | "PRACTICE"
  | "GENERAL_INTERVIEW";

export type VerificationStatus =
  | "UNVERIFIED"
  | "COMMUNITY_VERIFIED"
  | "OFFICIALLY_VERIFIED"
  | "HIGH_CONFIDENCE";

export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR";

export type RevisionBucket = "BOX_1" | "BOX_2" | "BOX_3" | "BOX_4" | "MASTERED";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface QuestionSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  topics: string[];
  companies: string[];
  importance: Importance;
  importanceReason?: string | null;
  sourceType: SourceType;
  sourceDocument?: string | null;
  sourceDate?: string | Date | null;
  sourceShift?: string | null;
  verificationStatus: VerificationStatus;
  frequency: number;
  isSolved?: boolean;
  isBookmarked?: boolean;
}

export interface QuestionDetail extends QuestionSummary {
  description: string;
  inputFormat?: string | null;
  outputFormat?: string | null;
  constraints?: string | null;
  examples: Example[];
  testCases?: TestCase[];
  starterCode: Record<string, string>;
  solution?: string | null;
  explanation?: string | null;
  hints?: string[];
  languages: string[];
  
  // SQL specific
  sqlSchemaSql?: string | null;
  sqlSeedData?: string | null;
  sqlExpectedQuery?: string | null;

  // Frontend specific
  htmlTemplate?: string | null;
  cssTemplate?: string | null;
  jsTemplate?: string | null;
  frontendTestSpec?: string | null;
}

export interface FilterOptions {
  difficulty?: Difficulty;
  questionType?: QuestionType;
  sourceType?: SourceType;
  importance?: Importance;
  topic?: string;
  company?: string;
  search?: string;
  onlyBookmarked?: boolean;
  onlyUnsolved?: boolean;
  page?: number;
  limit?: number;
}
