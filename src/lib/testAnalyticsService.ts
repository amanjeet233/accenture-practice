import { prisma } from "@/lib/prisma";

export interface ScoreOverTimePoint {
  attemptNumber: number;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

export interface AccuracyOverTimePoint {
  attemptNumber: number;
  date: string;
  accuracy: number;
  attempted: number;
}

export interface CategoryPerformanceItem {
  category: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface CorrectVsIncorrectData {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  correctPct: number;
  incorrectPct: number;
  unattemptedPct: number;
}

export interface DifficultyPerformanceItem {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface TimeSpentPoint {
  attemptNumber: number;
  date: string;
  durationSeconds: number;
  durationMinutes: number;
  durationFormatted: string;
  avgSecondsPerQuestion: number;
}

export interface QuestionLevelPerformanceItem {
  questionId: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  timesAppeared: number;
  timesAttempted: number;
  timesCorrect: number;
  accuracy: number;
  status: "MASTERED" | "GOOD" | "NEEDS_PRACTICE" | "UNATTEMPTED";
}

export interface TestAnalyticsData {
  hasHistory: boolean;
  totalAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  bestScore: number;
  totalQuestionsSolved: number;
  totalTimeSpentFormatted: string;
  latestAttemptDate?: string;
  // 7 Required Graphs
  scoreOverTime: ScoreOverTimePoint[];
  accuracyOverTime: AccuracyOverTimePoint[];
  categoryPerformance: CategoryPerformanceItem[];
  correctVsIncorrect: CorrectVsIncorrectData;
  difficultyPerformance: DifficultyPerformanceItem[];
  timeSpentPerTest: TimeSpentPoint[];
  questionLevelPerformance: QuestionLevelPerformanceItem[];
  // History table
  historyList: Array<{
    id: string;
    testTitle: string;
    date: string;
    durationFormatted: string;
    score: number;
    totalQuestions: number;
    accuracy: number;
    percentage: number;
    isPassed: boolean;
  }>;
}

export async function getAccentureTestAnalytics(userId?: string): Promise<TestAnalyticsData> {
  const whereClause: any = {
    submittedAt: { not: null },
    OR: [
      { testId: { contains: "accenture" } },
      { mockTest: { company: { contains: "Accenture", mode: "insensitive" } } },
    ],
  };

  if (userId) {
    whereClause.userId = userId;
  }

  const [attempts, totalAttemptCount] = await Promise.all([
    prisma.testAttempt.findMany({
      where: whereClause,
      include: {
        mockTest: true,
        questions: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                difficulty: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 100,
    }),
    prisma.testAttempt.count({ where: whereClause }),
  ]);

  // Keep chart and question-level work bounded while preserving the newest history.
  attempts.reverse();

  // Strict check: If there is no history, return hasHistory: false
  if (attempts.length === 0) {
    return {
      hasHistory: false,
      totalAttempts: 0,
      averageScore: 0,
      averageAccuracy: 0,
      bestScore: 0,
      totalQuestionsSolved: 0,
      totalTimeSpentFormatted: "0m",
      scoreOverTime: [],
      accuracyOverTime: [],
      categoryPerformance: [],
      correctVsIncorrect: {
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        correctPct: 0,
        incorrectPct: 0,
        unattemptedPct: 0,
      },
      difficultyPerformance: [],
      timeSpentPerTest: [],
      questionLevelPerformance: [],
      historyList: [],
    };
  }

  // 1. Score over time
  const scoreOverTime: ScoreOverTimePoint[] = attempts.map((a, idx) => {
    const d = a.submittedAt || a.startedAt;
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const pct = a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0;
    return {
      attemptNumber: idx + 1,
      date: dateFormatted,
      score: a.score,
      totalQuestions: a.totalQuestions,
      percentage: pct,
    };
  });

  // 2. Accuracy over time
  const accuracyOverTime: AccuracyOverTimePoint[] = attempts.map((a, idx) => {
    const d = a.submittedAt || a.startedAt;
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      attemptNumber: idx + 1,
      date: dateFormatted,
      accuracy: Math.round(a.accuracy),
      attempted: a.attempted,
    };
  });

  // 3. Category performance
  const catMap: Record<
    string,
    { total: number; attempted: number; correct: number; incorrect: number }
  > = {};

  // 4. Correct vs Incorrect Aggregate
  let sumTotalQuestions = 0;
  let sumAttempted = 0;
  let sumCorrect = 0;
  let sumIncorrect = 0;
  let sumUnattempted = 0;
  let totalDurationSec = 0;

  // 5. Difficulty performance
  const diffMap: Record<
    "EASY" | "MEDIUM" | "HARD",
    { total: number; attempted: number; correct: number }
  > = {
    EASY: { total: 0, attempted: 0, correct: 0 },
    MEDIUM: { total: 0, attempted: 0, correct: 0 },
    HARD: { total: 0, attempted: 0, correct: 0 },
  };

  // 7. Question-level performance
  const questionPerfMap: Record<
    string,
    {
      questionId: string;
      title: string;
      slug: string;
      category: string;
      difficulty: string;
      timesAppeared: number;
      timesAttempted: number;
      timesCorrect: number;
    }
  > = {};

  for (const a of attempts) {
    sumTotalQuestions += a.totalQuestions;
    sumAttempted += a.attempted;
    sumCorrect += a.correct || a.correctAnswers;
    sumIncorrect += a.incorrect;
    sumUnattempted += a.unattempted;
    totalDurationSec += a.duration;

    for (const aq of a.questions) {
      const q = aq.question;
      if (!q) continue;

      const cat = q.category || "General Technical";
      if (!catMap[cat]) {
        catMap[cat] = { total: 0, attempted: 0, correct: 0, incorrect: 0 };
      }
      catMap[cat].total++;
      const isAtt = !!aq.selectedOption || aq.status === "ANSWERED";
      if (isAtt) {
        catMap[cat].attempted++;
        if (aq.isCorrect) catMap[cat].correct++;
        else catMap[cat].incorrect++;
      }

      const diff = (q.difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD") || "MEDIUM";
      if (diffMap[diff]) {
        diffMap[diff].total++;
        if (isAtt) {
          diffMap[diff].attempted++;
          if (aq.isCorrect) diffMap[diff].correct++;
        }
      }

      if (!questionPerfMap[q.id]) {
        questionPerfMap[q.id] = {
          questionId: q.id,
          title: q.title,
          slug: q.slug,
          category: cat,
          difficulty: q.difficulty,
          timesAppeared: 0,
          timesAttempted: 0,
          timesCorrect: 0,
        };
      }
      questionPerfMap[q.id].timesAppeared++;
      if (isAtt) {
        questionPerfMap[q.id].timesAttempted++;
        if (aq.isCorrect) questionPerfMap[q.id].timesCorrect++;
      }
    }
  }

  const categoryPerformance: CategoryPerformanceItem[] = Object.entries(catMap)
    .map(([category, s]) => ({
      category,
      total: s.total,
      attempted: s.attempted,
      correct: s.correct,
      incorrect: s.incorrect,
      accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const correctVsIncorrect: CorrectVsIncorrectData = {
    totalQuestions: sumTotalQuestions,
    attempted: sumAttempted,
    correct: sumCorrect,
    incorrect: sumIncorrect,
    unattempted: sumUnattempted,
    correctPct: sumTotalQuestions > 0 ? Math.round((sumCorrect / sumTotalQuestions) * 100) : 0,
    incorrectPct: sumTotalQuestions > 0 ? Math.round((sumIncorrect / sumTotalQuestions) * 100) : 0,
    unattemptedPct: sumTotalQuestions > 0 ? Math.round((sumUnattempted / sumTotalQuestions) * 100) : 0,
  };

  const difficultyPerformance: DifficultyPerformanceItem[] = (
    ["EASY", "MEDIUM", "HARD"] as const
  ).map((diff) => {
    const s = diffMap[diff];
    return {
      difficulty: diff,
      total: s.total,
      attempted: s.attempted,
      correct: s.correct,
      accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
    };
  });

  // 6. Time spent per test
  const timeSpentPerTest: TimeSpentPoint[] = attempts.map((a, idx) => {
    const d = a.submittedAt || a.startedAt;
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const mins = Math.floor(a.duration / 60);
    const secs = a.duration % 60;
    return {
      attemptNumber: idx + 1,
      date: dateFormatted,
      durationSeconds: a.duration,
      durationMinutes: Math.round((a.duration / 60) * 10) / 10,
      durationFormatted: `${mins}m ${secs.toString().padStart(2, "0")}s`,
      avgSecondsPerQuestion: a.attempted > 0 ? Math.round(a.duration / a.attempted) : 0,
    };
  });

  // 7. Question-level performance
  const questionLevelPerformance: QuestionLevelPerformanceItem[] = Object.values(
    questionPerfMap
  )
    .map((q) => {
      const accuracy =
        q.timesAttempted > 0 ? Math.round((q.timesCorrect / q.timesAttempted) * 100) : 0;
      let status: "MASTERED" | "GOOD" | "NEEDS_PRACTICE" | "UNATTEMPTED" = "NEEDS_PRACTICE";
      if (q.timesAttempted === 0) status = "UNATTEMPTED";
      else if (accuracy >= 80) status = "MASTERED";
      else if (accuracy >= 50) status = "GOOD";

      return {
        ...q,
        accuracy,
        status,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy); // Ascending accuracy to show weak spots first

  // Summary Metrics
  const totalAttempts = totalAttemptCount;
  const analyzedAttempts = attempts.length;
  const averageScore = Math.round(
    attempts.reduce((acc, a) => acc + (a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0), 0) /
      analyzedAttempts
  );
  const averageAccuracy = Math.round(
    attempts.reduce((acc, a) => acc + a.accuracy, 0) / analyzedAttempts
  );
  const bestScore = Math.max(
    ...attempts.map((a) => (a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0))
  );

  const totalHours = Math.floor(totalDurationSec / 3600);
  const totalMins = Math.floor((totalDurationSec % 3600) / 60);
  const totalTimeSpentFormatted =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  const latest = attempts[attempts.length - 1];
  const latestAttemptDate = latest.submittedAt
    ? latest.submittedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

  // History List
  const historyList = [...attempts].reverse().map((a) => {
    const d = a.submittedAt || a.startedAt;
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const mins = Math.floor(a.duration / 60);
    const secs = a.duration % 60;
    const pct = a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0;
    return {
      id: a.id,
      testTitle: a.mockTest?.title || "Accenture Full Mock Test",
      date: dateFormatted,
      durationFormatted: `${mins}m ${secs.toString().padStart(2, "0")}s`,
      score: a.score,
      totalQuestions: a.totalQuestions,
      accuracy: Math.round(a.accuracy),
      percentage: pct,
      isPassed: pct >= 65,
    };
  });

  return {
    hasHistory: true,
    totalAttempts,
    averageScore,
    averageAccuracy,
    bestScore,
    totalQuestionsSolved: sumCorrect,
    totalTimeSpentFormatted,
    latestAttemptDate,
    scoreOverTime,
    accuracyOverTime,
    categoryPerformance,
    correctVsIncorrect,
    difficultyPerformance,
    timeSpentPerTest,
    questionLevelPerformance,
    historyList,
  };
}
