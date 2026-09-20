import { prisma } from "@/lib/prisma";

export interface DashboardMetrics {
  totalSolved: number;
  codingSolved: number;
  sqlSolved: number;
  frontendSolved: number;
  totalQuestions: number;
  accuracy: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  currentStreak: number;
  longestStreak: number;
  mockTestsCompleted: number;
  averageMockScore: number;
  totalBookmarks: number;
  mustDoCompleted: number;
  totalMustDo: number;
}

export interface TopicAccuracy {
  name: string;
  category: "DSA" | "SQL" | "FRONTEND";
  totalSubmissions: number;
  acceptedSubmissions: number;
  accuracy: number | null; // null if unattempted
  solvedCount: number;
  totalQuestions: number;
  isWeak: boolean;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface SubmissionHistoryItem {
  id: string;
  questionId: string;
  questionTitle: string;
  questionSlug: string;
  difficulty: string;
  questionType: string;
  language: string;
  status: string;
  runtime: number | null;
  memory: number | null;
  submittedAt: Date;
}

export async function getDashboardAnalytics(userId?: string) {
  // If no userId provided, select the primary user
  let user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "engineer@accenture-prep.local",
        name: "Candidate Engineer",
      },
    });
  }

  // 1. Fetch User Progress, Submissions, Attempts, Bookmarks, and Revision Items
  const [
    allQuestions,
    userProgressList,
    submissionsList,
    mockAttemptsList,
    bookmarksList,
    revisionItemsList,
  ] = await Promise.all([
    prisma.question.findMany({
      include: {
        questionTopics: { include: { topic: true } },
      },
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id },
      include: { question: true },
    }),
    prisma.submission.findMany({
      where: { userId: user.id },
      include: {
        question: {
          include: {
            questionTopics: { include: { topic: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.testAttempt.findMany({
      where: { userId: user.id },
      include: { mockTest: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.bookmark.findMany({
      where: { userId: user.id },
      include: { question: true },
    }),
    prisma.revisionItem.findMany({
      where: { userId: user.id },
      include: { question: true },
    }),
  ]);

  // 2. Compute Solved Metrics by Domain
  const solvedProgress = userProgressList.filter((p) => p.isSolved);
  const solvedQIds = new Set(solvedProgress.map((p) => p.questionId));

  const totalSolved = solvedQIds.size;
  let codingSolved = 0;
  let sqlSolved = 0;
  let frontendSolved = 0;

  solvedProgress.forEach((p) => {
    const qt = p.question.questionType;
    if (qt === "SQL") sqlSolved++;
    else if (qt === "HTML_CSS_JS" || qt === "FRONTEND") frontendSolved++;
    else codingSolved++;
  });

  // 3. Compute Accuracy from Submissions
  const totalSubmissions = submissionsList.length;
  const acceptedSubmissions = submissionsList.filter((s) => s.status === "ACCEPTED").length;
  const accuracy =
    totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

  // 4. Must-Do Analytics
  const mustDoQuestions = allQuestions.filter((q) => q.importance === "MUST_DO");
  const mustDoCompleted = mustDoQuestions.filter((q) => solvedQIds.has(q.id)).length;

  // 5. Mock Test Metrics
  const mockTestsCompleted = mockAttemptsList.length;
  const totalMockScore = mockAttemptsList.reduce((acc, a) => acc + a.score, 0);
  const averageMockScore =
    mockTestsCompleted > 0 ? Math.round((totalMockScore / mockTestsCompleted) * 10) / 10 : 0;

  // 6. Streaks & Heatmap Calculation (365 days)
  const activityDates = new Set<string>();
  const dailySolveCount: Record<string, number> = {};

  submissionsList.forEach((s) => {
    const dStr = new Date(s.submittedAt).toISOString().split("T")[0];
    activityDates.add(dStr);
    if (s.status === "ACCEPTED") {
      dailySolveCount[dStr] = (dailySolveCount[dStr] || 0) + 1;
    }
  });

  mockAttemptsList.forEach((a) => {
    const timestamp = a.submittedAt || a.startedAt;
    if (timestamp) {
      const dStr = new Date(timestamp).toISOString().split("T")[0];
      activityDates.add(dStr);
    }
  });

  // Compute Current Streak leading up to today
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const now = new Date();
  const checkDate = new Date(now);

  // Check if active today or yesterday for streak continuation
  const todayStr = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const hasActivityRecent = activityDates.has(todayStr) || activityDates.has(yesterdayStr);

  if (hasActivityRecent) {
    let pointer = activityDates.has(todayStr) ? now : yesterday;
    while (true) {
      const pStr = pointer.toISOString().split("T")[0];
      if (activityDates.has(pStr)) {
        currentStreak++;
        pointer = new Date(pointer.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Compute 365 Days Heatmap Grid
  const heatmapDays: HeatmapDay[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = d.toISOString().split("T")[0];
    const count = dailySolveCount[dStr] || 0;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 4) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    heatmapDays.push({ date: dStr, count, level });
  }

  // Calculate true longest streak from authentic recorded activity dates
  const sortedDates = Array.from(activityDates).sort();
  longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const curDate = new Date(dStr + "T00:00:00Z");
    if (prevDate) {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    } else {
      runningStreak = 1;
    }
    prevDate = curDate;
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // 7. Topic Analysis
  // Required Canonical Topics:
  const canonicalDsaTopics = [
    "Arrays",
    "Strings",
    "HashMap",
    "Math",
    "Sorting",
    "Searching",
    "Binary Search",
    "Sliding Window",
    "Stack",
    "Queue",
    "Linked List",
    "Tree",
    "Graph",
    "DP",
  ];

  const canonicalSqlTopics = [
    "JOIN",
    "GROUP BY",
    "HAVING",
    "Subquery",
    "CTE",
    "Window Functions",
  ];

  const canonicalFrontendTopics = [
    "HTML",
    "CSS",
    "JavaScript",
    "DOM",
    "Events",
  ];

  const normalize = (s: string) =>
    s.toLowerCase().replace(/^(sql|frontend)-/, "").replace(/[-_\s]/g, "");

  const evaluateTopic = (
    topicName: string,
    category: "DSA" | "SQL" | "FRONTEND"
  ): TopicAccuracy => {
    const targetNorm = normalize(topicName);

    // Find all questions associated with this topic
    const matchedQuestions = allQuestions.filter((q) => {
      const qTopicNames = q.questionTopics.map((qt) => normalize(qt.topic.name));
      const qTopicSlugs = q.questionTopics.map((qt) => normalize(qt.topic.slug));
      let jsonTopics: string[] = [];
      try {
        jsonTopics = JSON.parse(q.topics || "[]").map((t: string) => normalize(t));
      } catch {
        jsonTopics = [];
      }

      const allNorms = [...qTopicNames, ...qTopicSlugs, ...jsonTopics];

      // Exact normalized match
      if (allNorms.includes(targetNorm)) return true;

      // Handle common domain aliases
      if (targetNorm === "hashmap" && (allNorms.includes("hashtable") || allNorms.includes("hash"))) return true;
      if (targetNorm === "dp" && (allNorms.includes("dynamicprogramming") || allNorms.includes("dp"))) return true;
      if (targetNorm === "arrays" && (allNorms.includes("array") || allNorms.includes("arrays"))) return true;
      if (targetNorm === "strings" && (allNorms.includes("string") || allNorms.includes("strings"))) return true;
      if (targetNorm === "windowfunctions" && (allNorms.includes("windowfunction") || allNorms.includes("windowfunctions"))) return true;
      if (targetNorm === "events" && (allNorms.includes("event") || allNorms.includes("events"))) return true;

      return false;
    });

    const questionIds = new Set(matchedQuestions.map((q) => q.id));

    // Submissions for this topic
    const topicSubmissions = submissionsList.filter((s) => questionIds.has(s.questionId));
    const totalSub = topicSubmissions.length;
    const acceptedSub = topicSubmissions.filter((s) => s.status === "ACCEPTED").length;

    const topicAccuracy = totalSub > 0 ? Math.round((acceptedSub / totalSub) * 100) : null;
    const solvedCount = matchedQuestions.filter((q) => solvedQIds.has(q.id)).length;

    // Weak threshold: attempted with accuracy < 60%
    const isWeak = topicAccuracy !== null && topicAccuracy < 60;

    return {
      name: topicName,
      category,
      totalSubmissions: totalSub,
      acceptedSubmissions: acceptedSub,
      accuracy: topicAccuracy,
      solvedCount,
      totalQuestions: matchedQuestions.length,
      isWeak,
    };
  };

  const dsaTopicAnalytics = canonicalDsaTopics.map((t) => evaluateTopic(t, "DSA"));
  const sqlTopicAnalytics = canonicalSqlTopics.map((t) => evaluateTopic(t, "SQL"));
  const frontendTopicAnalytics = canonicalFrontendTopics.map((t) => evaluateTopic(t, "FRONTEND"));
  const allTopicAnalytics = [
    ...dsaTopicAnalytics,
    ...sqlTopicAnalytics,
    ...frontendTopicAnalytics,
  ];

  // 8. Weak Areas (Calculated strictly from actual submission data)
  const weakAreas = allTopicAnalytics.filter((t) => t.isWeak);

  // 9. Revision System Lists
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Today: Due in Leitner revision or solved today
  const todayRevisionItems = revisionItemsList
    .filter((r) => r.nextReviewAt <= endOfToday)
    .map((r) => r.question);

  // This Week: activity in last 7 days
  const thisWeekQIds = new Set(
    submissionsList
      .filter((s) => new Date(s.submittedAt) >= weekAgo)
      .map((s) => s.questionId)
  );
  const thisWeekQuestions = allQuestions.filter((q) => thisWeekQIds.has(q.id));

  // Needs Revision: questions in weak topics
  const weakTopicNames = new Set(weakAreas.map((w) => w.name.toLowerCase()));
  const needsRevisionQuestions = allQuestions.filter((q) => {
    const qTopics = q.questionTopics.map((qt) => qt.topic.name.toLowerCase());
    return qTopics.some((t) => weakTopicNames.has(t));
  });

  // Incorrect: questions with failed submissions
  const incorrectQIds = new Set(
    submissionsList
      .filter((s) => s.status !== "ACCEPTED")
      .map((s) => s.questionId)
  );
  const incorrectQuestions = allQuestions.filter((q) => incorrectQIds.has(q.id));

  // Bookmarked
  const bookmarkedQuestions = bookmarksList.map((b) => b.question);

  // Must Do remaining
  const mustDoRemainingQuestions = mustDoQuestions.filter((q) => !solvedQIds.has(q.id));

  // 10. History List
  const submissionHistory: SubmissionHistoryItem[] = submissionsList.slice(0, 20).map((s) => ({
    id: s.id,
    questionId: s.questionId,
    questionTitle: s.question.title,
    questionSlug: s.question.slug,
    difficulty: s.question.difficulty,
    questionType: s.question.questionType,
    language: s.language,
    status: s.status,
    runtime: s.runtime,
    memory: s.memory,
    submittedAt: s.submittedAt,
  }));

  const metrics: DashboardMetrics = {
    totalSolved,
    codingSolved,
    sqlSolved,
    frontendSolved,
    totalQuestions: allQuestions.length,
    accuracy,
    totalSubmissions,
    acceptedSubmissions,
    currentStreak,
    longestStreak,
    mockTestsCompleted,
    averageMockScore,
    totalBookmarks: bookmarksList.length,
    mustDoCompleted,
    totalMustDo: mustDoQuestions.length,
  };

  return {
    user,
    metrics,
    topicAnalysis: {
      dsa: dsaTopicAnalytics,
      sql: sqlTopicAnalytics,
      frontend: frontendTopicAnalytics,
      all: allTopicAnalytics,
    },
    weakAreas,
    revision: {
      today: todayRevisionItems,
      thisWeek: thisWeekQuestions,
      needsRevision: needsRevisionQuestions,
      incorrect: incorrectQuestions,
      bookmarked: bookmarkedQuestions,
      mustDo: mustDoRemainingQuestions,
    },
    heatmap: {
      days: heatmapDays,
      totalActiveDays: activityDates.size,
      currentStreak,
      longestStreak,
    },
    history: submissionHistory,
  };
}
