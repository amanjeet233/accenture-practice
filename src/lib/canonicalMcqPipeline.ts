/**
 * CANONICAL ACCENTURE MCQ PIPELINE
 * Strictly implements rules from Master Bug-Fix Prompt:
 * 1. Normalized Canonical Structure
 * 2. 100% verification that options[correctOptionId].text === correctAnswerText
 * 3. Safe shuffling with stable internal option identities
 * 4. Question & answer isolation
 * 5. CBT session state generation & backend scoring
 */

export type OptionLetter = "A" | "B" | "C" | "D";

export interface CanonicalOption {
  id: OptionLetter;
  text: string;
}

export interface InternalOption {
  internalId: string; // stable identifier e.g. "opt_1"
  text: string;
  isCorrect: boolean;
}

export type CanonicalMCQ = {
  id: string;
  section: string;
  topic: string;
  subtopic?: string;
  question: string;
  options: CanonicalOption[];
  correctOptionId: OptionLetter;
  correctAnswerText: string;
  sourceAnswerText?: string;
  sourceAnswerOption?: string;
  explanation?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceType:
    | "SOURCE_DOCUMENT"
    | "REPORTED_PYQ"
    | "ACCENTURE_PATTERN"
    | "GENERAL_PRACTICE";
  verificationStatus:
    | "VERIFIED"
    | "SOURCE_ANSWER_CONFLICT"
    | "NEEDS_REVIEW"
    | "UNVERIFIED";
  sourceFile?: string;
  sourcePage?: number;
  tags?: string[];
  isActive: boolean;
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate a question against all canonical integrity constraints.
 * Fails if:
 * - not exactly 4 options
 * - empty option text
 * - duplicate option IDs or texts
 * - correctOptionId does not point to correctAnswerText
 */
export function validateQuestion(q: CanonicalMCQ): ValidationResult {
  const errors: string[] = [];

  if (!q.id || !q.question?.trim()) {
    errors.push(`Question ID or stem is missing: ${q.id}`);
  }

  if (!q.options || q.options.length !== 4) {
    errors.push(`Question ${q.id} must have exactly 4 options, found ${q.options?.length}`);
    return { isValid: false, errors };
  }

  const ids = new Set<string>();
  const texts = new Set<string>();

  for (const opt of q.options) {
    if (!["A", "B", "C", "D"].includes(opt.id)) {
      errors.push(`Question ${q.id} has invalid option ID: ${opt.id}`);
    }
    if (!opt.text || opt.text.trim().length === 0) {
      errors.push(`Question ${q.id} has empty option text for Option ${opt.id}`);
    }
    const cleanLower = opt.text.trim().toLowerCase();
    if (texts.has(cleanLower)) {
      errors.push(`Question ${q.id} has duplicate option text: "${opt.text}"`);
    }
    ids.add(opt.id);
    texts.add(cleanLower);
  }

  if (ids.size !== 4) {
    errors.push(`Question ${q.id} option IDs are not unique`);
  }

  // Check correctOptionId
  if (!["A", "B", "C", "D"].includes(q.correctOptionId)) {
    errors.push(`Question ${q.id} invalid correctOptionId: ${q.correctOptionId}`);
  }

  // Authoritative check: options[correctOptionId].text === correctAnswerText
  const matchedOpt = q.options.find((o) => o.id === q.correctOptionId);
  if (!matchedOpt) {
    errors.push(`Question ${q.id} correctOptionId ${q.correctOptionId} not found in options`);
  } else if (matchedOpt.text.trim() !== q.correctAnswerText.trim()) {
    errors.push(
      `Question ${q.id} MISMATCH: options[${q.correctOptionId}].text ("${matchedOpt.text}") !== correctAnswerText ("${q.correctAnswerText}")`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Safe Option Shuffling Engine:
 * Converts question options into stable internal identities,
 * shuffles them, generates visible labels A/B/C/D,
 * and recalculates correctOptionId so options[correctOptionId].text === correctAnswerText is preserved!
 */
export function shuffleQuestionOptions(
  question: CanonicalMCQ,
  randomFn: () => number = Math.random
): {
  shuffledQuestion: CanonicalMCQ;
  displayToInternalMap: Record<OptionLetter, string>;
} {
  // 1. Convert to stable internal options
  const internalOpts: InternalOption[] = question.options.map((opt, idx) => ({
    internalId: `opt_${idx + 1}`,
    text: opt.text,
    isCorrect: opt.id === question.correctOptionId,
  }));

  // 2. Fisher-Yates shuffle
  const shuffled = [...internalOpts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 3. Assign display labels A, B, C, D
  const letters: OptionLetter[] = ["A", "B", "C", "D"];
  const displayOptions: CanonicalOption[] = [];
  const displayToInternalMap: Record<OptionLetter, string> = {} as any;
  let newCorrectOptionId: OptionLetter = "A";

  shuffled.forEach((item, idx) => {
    const letter = letters[idx];
    displayOptions.push({
      id: letter,
      text: item.text,
    });
    displayToInternalMap[letter] = item.internalId;
    if (item.isCorrect) {
      newCorrectOptionId = letter;
    }
  });

  const updated: CanonicalMCQ = {
    ...question,
    options: displayOptions,
    correctOptionId: newCorrectOptionId,
    correctAnswerText: question.correctAnswerText, // remains unchanged
  };

  // Immediate validation check
  const val = validateQuestion(updated);
  if (!val.isValid) {
    throw new Error(`Shuffle corrupted question ${question.id}: ${val.errors.join(", ")}`);
  }

  return {
    shuffledQuestion: updated,
    displayToInternalMap,
  };
}

/**
 * Public Safe Question for CBT client payload.
 * Strictly hides correctOptionId, correctAnswerText, sourceAnswerText, and explanation!
 */
export interface SafeCbtQuestion {
  id: string;
  questionNumber: number;
  section: string;
  topic: string;
  question: string;
  options: CanonicalOption[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceType: string;
}

export function toSafeCbtQuestion(q: CanonicalMCQ, questionNumber: number): SafeCbtQuestion {
  return {
    id: q.id,
    questionNumber,
    section: q.section,
    topic: q.topic,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
    sourceType: q.sourceType,
  };
}

/**
 * CBT Session Definition
 */
export interface CbtSessionState {
  sessionId: string;
  title: string;
  durationSeconds: number;
  questionOrder: string[]; // question IDs
  optionMappings: Record<string, Record<OptionLetter, string>>; // questionId -> display letter to internal ID
  clientQuestions: SafeCbtQuestion[];
  createdAt: number;
}
