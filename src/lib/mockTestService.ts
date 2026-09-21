import { prisma } from "@/lib/prisma";
import { ACCENTURE_COMPANY_FILTER } from "@/lib/accentureModules";
import { formatMcqQuestion } from "@/lib/mcqService";
import { resolveCanonicalTopic, getTopicPrismaFilter } from "@/lib/canonicalTopics";

export interface SafeMockQuestion {
  id: string;
  slug: string;
  questionNumber: number;
  title: string;
  stem: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceType: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface ReviewQuestionItem extends SafeMockQuestion {
  userSelectedKey: "A" | "B" | "C" | "D" | null;
  correctKey: "A" | "B" | "C" | "D";
  correctAnswerText: string;
  isCorrect: boolean;
  isAttempted: boolean;
  explanation: string;
}

export interface MockTestEvaluationResult {
  attemptId?: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  accuracy: number;
  timeUsedSeconds: number;
  timeUsedFormatted: string;
  percentage: number;
  isPassed: boolean;
  categoryBreakdown: Record<
    string,
    { total: number; attempted: number; correct: number; accuracy: number }
  >;
  reviewQuestions: ReviewQuestionItem[];
}

/**
 * Server-Side: Fetch questions for active timed test mode.
 * CRITICAL SECURITY REQUIREMENT:
 * Strips correctKey, solution, and explanation completely so answers remain strictly server-side.
 */
export async function getSafeMockTestQuestions(
  limit: number = 30,
  categoryFilter?: string
): Promise<SafeMockQuestion[]> {
  const canonical = resolveCanonicalTopic(categoryFilter);

  const whereClause: any = {
    AND: [ACCENTURE_COMPANY_FILTER, { questionType: "MCQ" }],
  };

  if (canonical) {
    whereClause.AND.push(getTopicPrismaFilter(canonical));
  } else if (categoryFilter && categoryFilter !== "all") {
    whereClause.AND.push({
      category: { equals: categoryFilter, mode: "insensitive" },
    });
  }

  // Fetch candidate pool strictly from this topic
  const rawQuestions = await prisma.question.findMany({
    where: whereClause,
    orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
    take: 120, // Take pool to sample from
  });

  // If topic-specific, take up to limit from raw questions directly
  if (canonical || (categoryFilter && categoryFilter !== "all")) {
    return rawQuestions.slice(0, limit).map((q, idx) => {
      const formatted = formatMcqQuestion(q, idx + 1);
      return {
        id: formatted.id,
        slug: formatted.slug,
        questionNumber: idx + 1,
        title: formatted.title,
        stem: formatted.stem,
        category: formatted.category,
        difficulty: formatted.difficulty,
        sourceType: formatted.sourceType,
        options: formatted.options,
      };
    });
  }

  // Otherwise, ensure diversity across topics for general test simulation
  const categoriesMap: Record<string, any[]> = {};
  for (const q of rawQuestions) {
    const cat = q.category || "General";
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(q);
  }

  const selectedQuestions: any[] = [];
  const catKeys = Object.keys(categoriesMap);
  let round = 0;

  while (selectedQuestions.length < limit && selectedQuestions.length < rawQuestions.length) {
    let addedAny = false;
    for (const cat of catKeys) {
      if (selectedQuestions.length >= limit) break;
      const catList = categoriesMap[cat];
      if (round < catList.length) {
        selectedQuestions.push(catList[round]);
        addedAny = true;
      }
    }
    if (!addedAny) break;
    round++;
  }

  // Format and strip answers completely
  return selectedQuestions.map((q, idx) => {
    const formatted = formatMcqQuestion(q, idx + 1);
    return {
      id: formatted.id,
      slug: formatted.slug,
      questionNumber: idx + 1,
      title: formatted.title,
      stem: formatted.stem,
      category: formatted.category,
      difficulty: formatted.difficulty,
      sourceType: formatted.sourceType,
      options: formatted.options,
      // Note: correctKey, correctAnswerText, and explanation are NOT included here!
    };
  });
}

/**
 * Server-Side: Evaluate submission against true answers.
 */
export async function evaluateMockTestSubmission(
  questionIds: string[],
  userAnswers: Record<string, "A" | "B" | "C" | "D">,
  timeUsedSeconds: number,
  options?: {
    testId?: string;
    startedAt?: string;
    markedQuestionIds?: string[];
    userId?: string;
  }
): Promise<MockTestEvaluationResult> {
  const rawQuestions = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
    },
  });

  // Maintain question order
  const questionMap = new Map(rawQuestions.map((q) => [q.id, q]));
  const orderedRawQuestions = questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean) as any[];

  let correctCount = 0;
  let attemptedCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const categoryBreakdown: Record<
    string,
    { total: number; attempted: number; correct: number; accuracy: number }
  > = {};

  const reviewQuestions: ReviewQuestionItem[] = orderedRawQuestions.map(
    (q, idx) => {
      const formatted = formatMcqQuestion(q, idx + 1);
      const userSelected = userAnswers[q.id] || null;
      const isAttempted = !!userSelected;
      const isCorrect = isAttempted && userSelected === formatted.correctKey;

      if (isAttempted) {
        attemptedCount++;
        if (isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        unattemptedCount++;
      }

      // Track by category
      const cat = formatted.category || "General";
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { total: 0, attempted: 0, correct: 0, accuracy: 0 };
      }
      categoryBreakdown[cat].total++;
      if (isAttempted) categoryBreakdown[cat].attempted++;
      if (isCorrect) categoryBreakdown[cat].correct++;

      return {
        id: formatted.id,
        slug: formatted.slug,
        questionNumber: idx + 1,
        title: formatted.title,
        stem: formatted.stem,
        category: formatted.category,
        difficulty: formatted.difficulty,
        sourceType: formatted.sourceType,
        options: formatted.options,
        userSelectedKey: userSelected,
        correctKey: formatted.correctKey,
        correctAnswerText: formatted.correctAnswerText,
        isCorrect,
        isAttempted,
        explanation: formatted.explanation,
      };
    }
  );

  // Compute category accuracy
  for (const cat of Object.keys(categoryBreakdown)) {
    const item = categoryBreakdown[cat];
    item.accuracy =
      item.attempted > 0 ? Math.round((item.correct / item.attempted) * 100) : 0;
  }

  const totalQuestions = orderedRawQuestions.length;
  const accuracy =
    attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = percentage >= 65; // Accenture standard passing benchmark

  const mins = Math.floor(timeUsedSeconds / 60);
  const secs = timeUsedSeconds % 60;
  const timeUsedFormatted = `${mins}m ${secs.toString().padStart(2, "0")}s`;

  // --------------------------------------------------------------------------
  // STEP 9 REQUIREMENT: Store every completed test attempt in Database
  // --------------------------------------------------------------------------
  let attemptId: string | undefined;
  try {
    let user = options?.userId
      ? await prisma.user.findUnique({ where: { id: options.userId } })
      : await prisma.user.findFirst();

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "candidate@accenture-prep.local",
          name: "Accenture Candidate",
        },
      });
    }

    const testId = options?.testId || "accenture-full-mock-test";

    // Ensure mockTest record exists
    let mockTest = await prisma.mockTest.findFirst({
      where: {
        OR: [{ slug: testId }, { company: "Accenture" }],
      },
    });

    if (!mockTest) {
      mockTest = await prisma.mockTest.create({
        data: {
          title: "Accenture Full Mock Test",
          slug: "accenture-full-mock-test",
          description: "Timed Accenture Online Assessment Simulation",
          company: "Accenture",
          durationMins: 30,
          totalMarks: totalQuestions,
          passingMarks: Math.round(totalQuestions * 0.65),
        },
      });
    }

    const startedAt = options?.startedAt
      ? new Date(options.startedAt)
      : new Date(Date.now() - timeUsedSeconds * 1000);
    const submittedAt = new Date();

    const markedSet = new Set(options?.markedQuestionIds || []);
    const avgTimePerQuestion = attemptedCount > 0 ? Math.round(timeUsedSeconds / attemptedCount) : 0;

    const savedAttempt = await prisma.testAttempt.create({
      data: {
        userId: user.id,
        testId: testId,
        mockTestId: mockTest.id,
        startedAt,
        submittedAt,
        duration: timeUsedSeconds,
        totalQuestions,
        attempted: attemptedCount,
        correct: correctCount,
        incorrect: incorrectCount,
        unattempted: unattemptedCount,
        score: correctCount,
        correctAnswers: correctCount,
        accuracy,
        questions: {
          create: reviewQuestions.map((rq) => ({
            questionId: rq.id,
            selectedOption: rq.userSelectedKey,
            correctOption: rq.correctKey,
            isCorrect: rq.isCorrect,
            timeSpentSeconds: rq.isAttempted ? avgTimePerQuestion : 0,
            markedForReview: markedSet.has(rq.id),
            answeredAt: rq.isAttempted ? submittedAt : null,
            status: rq.isAttempted ? "ANSWERED" : "NOT_VISITED",
            marksAwarded: rq.isCorrect ? 1 : 0,
          })),
        },
      },
    });

    attemptId = savedAttempt.id;

    // Update userProgress for attempted questions
    for (const rq of reviewQuestions) {
      if (rq.isAttempted) {
        await prisma.userProgress.upsert({
          where: {
            userId_questionId: {
              userId: user.id,
              questionId: rq.id,
            },
          },
          update: {
            isSolved: rq.isCorrect ? true : undefined,
            attemptsCount: { increment: 1 },
            lastAttemptedAt: submittedAt,
            solvedAt: rq.isCorrect ? submittedAt : undefined,
          },
          create: {
            userId: user.id,
            questionId: rq.id,
            isSolved: rq.isCorrect,
            attemptsCount: 1,
            lastAttemptedAt: submittedAt,
            solvedAt: rq.isCorrect ? submittedAt : null,
          },
        });
      }
    }
  } catch (dbErr) {
    console.error("Failed to store test attempt in database:", dbErr);
  }

  return {
    attemptId,
    totalQuestions,
    attempted: attemptedCount,
    correct: correctCount,
    incorrect: incorrectCount,
    unattempted: unattemptedCount,
    score: correctCount,
    accuracy,
    timeUsedSeconds,
    timeUsedFormatted,
    percentage,
    isPassed,
    categoryBreakdown,
    reviewQuestions,
  };
}
