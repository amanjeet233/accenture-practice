import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== Seeding 8 Timed Mock Tests with Full Question Mix ===");

  const accentureCompany = await prisma.company.findFirst({
    where: { slug: "accenture" },
  });

  // Ensure Hard Coding Question exists
  const hardCodingSlug = "minimum-coins-for-target-amount";
  const dpTopic = await prisma.topic.findFirst({ where: { slug: "dp" } });
  const arraysTopic = await prisma.topic.findFirst({ where: { slug: "arrays" } });

  const hardQ = await prisma.question.upsert({
    where: { slug: hardCodingSlug },
    update: {
      title: "Minimum Coins for Target Amount (Dynamic Programming)",
      difficulty: "HARD",
      questionType: "CODING",
      sourceType: "COMPANY_PATTERN",
      importance: "MUST_DO",
      importanceReason: "High-frequency Accenture FSE / Advanced ASE round 2 dynamic programming test pattern.",
      description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.

### Input Format
- First line contains two integers \`n\` (number of coin types) and \`amount\` (target value).
- Second line contains \`n\` space-separated integers representing the coin denominations.

### Output Format
- Print a single integer representing the minimum coins required, or \`-1\` if impossible.`,
      inputFormat: "First line: n and amount. Second line: n space-separated integers.",
      outputFormat: "Single integer representing minimum coins or -1.",
      constraints: "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
      starterCode: JSON.stringify({
        javascript: `function solution(input) {
  const lines = input.trim().split("\\n");
  if (!lines[0]) return -1;
  const [n, amount] = lines[0].trim().split(/\\s+/).map(Number);
  if (amount === 0) return 0;
  if (!lines[1]) return -1;
  const coins = lines[1].trim().split(/\\s+/).map(Number);
  
  // Write your dynamic programming solution here
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let i = c; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        python: `def solution(raw_input):
    lines = raw_input.strip().split('\\n')
    if not lines or not lines[0].strip():
        return -1
    parts = list(map(int, lines[0].strip().split()))
    if len(parts) < 2:
        return -1
    n, amount = parts[0], parts[1]
    if amount == 0:
        return 0
    if len(lines) < 2:
        return -1
    coins = list(map(int, lines[1].strip().split()))
    
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for c in coins:
        for i in range(c, amount + 1):
            dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1
`,
        java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) {
            System.out.println(-1);
            return;
        }
        int n = sc.nextInt();
        int amount = sc.nextInt();
        if (amount == 0) {
            System.out.println(0);
            return;
        }
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) {
            coins[i] = sc.nextInt();
        }
        
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int c : coins) {
            for (int i = c; i <= amount; i++) {
                dp[i] = Math.min(dp[i], dp[i - c] + 1);
            }
        }
        System.out.println(dp[amount] > amount ? -1 : dp[amount]);
    }
}`,
      }),
      testCases: JSON.stringify([
        { input: "3 11\n1 2 5", expectedOutput: "3" },
        { input: "1 3\n2", expectedOutput: "-1" },
        { input: "1 0\n1", expectedOutput: "0" },
        { input: "4 6249\n186 419 83 408", expectedOutput: "20" },
      ]),
    },
    create: {
      title: "Minimum Coins for Target Amount (Dynamic Programming)",
      slug: hardCodingSlug,
      difficulty: "HARD",
      questionType: "CODING",
      sourceType: "COMPANY_PATTERN",
      importance: "MUST_DO",
      importanceReason: "High-frequency Accenture FSE / Advanced ASE round 2 dynamic programming test pattern.",
      description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.

### Input Format
- First line contains two integers \`n\` (number of coin types) and \`amount\` (target value).
- Second line contains \`n\` space-separated integers representing the coin denominations.

### Output Format
- Print a single integer representing the minimum coins required, or \`-1\` if impossible.`,
      inputFormat: "First line: n and amount. Second line: n space-separated integers.",
      outputFormat: "Single integer representing minimum coins or -1.",
      constraints: "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
      starterCode: JSON.stringify({
        javascript: `function solution(input) {
  const lines = input.trim().split("\\n");
  if (!lines[0]) return -1;
  const [n, amount] = lines[0].trim().split(/\\s+/).map(Number);
  if (amount === 0) return 0;
  if (!lines[1]) return -1;
  const coins = lines[1].trim().split(/\\s+/).map(Number);
  
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let i = c; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      }),
      testCases: JSON.stringify([
        { input: "3 11\n1 2 5", expectedOutput: "3" },
        { input: "1 3\n2", expectedOutput: "-1" },
        { input: "1 0\n1", expectedOutput: "0" },
        { input: "4 6249\n186 419 83 408", expectedOutput: "20" },
      ]),
    },
  });

  // Ensure test cases list
  await prisma.questionTestCase.deleteMany({ where: { questionId: hardQ.id } });
  await prisma.questionTestCase.createMany({
    data: [
      { questionId: hardQ.id, input: "3 11\n1 2 5", expectedOutput: "3", orderIndex: 0 },
      { questionId: hardQ.id, input: "1 3\n2", expectedOutput: "-1", orderIndex: 1 },
      { questionId: hardQ.id, input: "1 0\n1", expectedOutput: "0", orderIndex: 2 },
      { questionId: hardQ.id, input: "4 6249\n186 419 83 408", expectedOutput: "20", orderIndex: 3, isHidden: true },
    ],
  });

  // Link topics
  if (dpTopic) {
    await prisma.questionTopic.upsert({
      where: { questionId_topicId: { questionId: hardQ.id, topicId: dpTopic.id } },
      update: {},
      create: { questionId: hardQ.id, topicId: dpTopic.id },
    });
  }
  if (arraysTopic) {
    await prisma.questionTopic.upsert({
      where: { questionId_topicId: { questionId: hardQ.id, topicId: arraysTopic.id } },
      update: {},
      create: { questionId: hardQ.id, topicId: arraysTopic.id },
    });
  }

  // Refresh all questions
  const allQuestions = await prisma.question.findMany();
  const qMap = new Map(allQuestions.map((q) => [q.slug, q.id]));

  const getQId = (slug: string) => {
    const id = qMap.get(slug);
    if (!id) console.warn(`Warning: Question slug "${slug}" not found in DB`);
    return id;
  };

  const mockConfigs = [
    {
      title: "Accenture Easy Warm-Up",
      slug: "accenture-easy-warm-up",
      description: "Foundational exam warm-up featuring verified easy questions directly from authentic Accenture papers.",
      mockType: "SOURCE_BASED",
      durationMins: 30,
      totalMarks: 40,
      passingMarks: 25,
      questions: [
        { slug: "smallest-number-in-an-array", marks: 20 },
        { slug: "binary-string-operations-evaluator", marks: 20 },
      ],
    },
    {
      title: "Accenture Medium Challenge",
      slug: "accenture-medium-challenge",
      description: "Core standard technical difficulty assessment matching Accenture on-campus round 2.",
      mockType: "SOURCE_BASED",
      durationMins: 45,
      totalMarks: 60,
      passingMarks: 40,
      questions: [
        { slug: "difference-of-sums-in-range", marks: 20 },
        { slug: "large-small-sum", marks: 20 },
        { slug: "second-highest-salary-with-ties", marks: 20 },
      ],
    },
    {
      title: "Accenture SQL Mock",
      slug: "accenture-sql-mock",
      description: "Dedicated database assessment covering SLA metrics, streaming queries, joins, and aggregations across Easy, Medium, and Hard difficulty.",
      mockType: "SOURCE_BASED",
      durationMins: 40,
      totalMarks: 60,
      passingMarks: 40,
      questions: [
        { slug: "find-duplicate-emails-or-records", marks: 20 },
        { slug: "support-ticket-sla-resolution-metrics", marks: 20 },
        { slug: "heavy-watch-time-streaming-titles", marks: 20 },
      ],
    },
    {
      title: "Accenture Frontend Mock",
      slug: "accenture-frontend-mock",
      description: "Real-world web engineering and DOM manipulation assessment based on Accenture on-campus exam tasks.",
      mockType: "SOURCE_BASED",
      durationMins: 45,
      totalMarks: 60,
      passingMarks: 40,
      questions: [
        { slug: "interactive-counter-with-step-control", marks: 20 },
        { slug: "interactive-textarea-counter-limit", marks: 20 },
        { slug: "product-search-filter-data-attributes", marks: 20 },
      ],
    },
    {
      title: "Accenture Shift Coding Mock",
      slug: "accenture-shift-coding-mock",
      description: "Shift-reported algorithmic test featuring formulaic transforms and prefix summations from recent national slots.",
      mockType: "SOURCE_BASED",
      durationMins: 45,
      totalMarks: 60,
      passingMarks: 45,
      questions: [
        { slug: "array-formulaic-transformation-sum", marks: 20 },
        { slug: "prefix-number-summation-eqsum", marks: 20 },
        { slug: "rat-food-distribution-sufficiency", marks: 20 },
      ],
    },
    {
      title: "Accenture Mixed Mock",
      slug: "accenture-mixed-mock",
      description: "Full multi-disciplinary assessment spanning DSA string manipulation, database aggregations, and frontend logic.",
      mockType: "SOURCE_BASED",
      durationMins: 60,
      totalMarks: 75,
      passingMarks: 50,
      questions: [
        { slug: "first-last-character-inward-combination", marks: 25 },
        { slug: "support-ticket-sla-resolution-metrics", marks: 25 },
        { slug: "interactive-textarea-counter-limit", marks: 25 },
      ],
    },
    {
      title: "Accenture 60-Minute Reported Pattern Mock",
      slug: "accenture-60-minute-reported-pattern-mock",
      description: "Standard 60-minute recurring pattern simulation calibrated to Accenture technical evaluation benchmarks.",
      mockType: "PATTERN_BASED",
      durationMins: 60,
      totalMarks: 70,
      passingMarks: 45,
      questions: [
        { slug: "binary-string-operations-evaluator", marks: 20 },
        { slug: "superior-elements-in-an-array", marks: 25 },
        { slug: "action-movie-high-rating-watchers-over-25", marks: 25 },
      ],
    },
    {
      title: "Accenture Hard Practice Mock",
      slug: "accenture-hard-practice-mock",
      description: "Advanced algorithmic & SQL problem-solving mock for FSE/high-band packages with stringent constraints and hard problems.",
      mockType: "PATTERN_BASED",
      durationMins: 60,
      totalMarks: 80,
      passingMarks: 50,
      questions: [
        { slug: "minimum-coins-for-target-amount", marks: 30 },
        { slug: "heavy-watch-time-streaming-titles", marks: 30 },
        { slug: "prefix-number-summation-eqsum", marks: 20 },
      ],
    },
  ];

  for (const m of mockConfigs) {
    const createdMock = await prisma.mockTest.upsert({
      where: { slug: m.slug },
      update: {
        title: m.title,
        description: m.description,
        company: "Accenture",
        companyId: accentureCompany?.id || null,
        mockType: m.mockType,
        durationMins: m.durationMins,
        totalMarks: m.totalMarks,
        passingMarks: m.passingMarks,
        isLive: true,
      },
      create: {
        title: m.title,
        slug: m.slug,
        description: m.description,
        company: "Accenture",
        companyId: accentureCompany?.id || null,
        mockType: m.mockType,
        durationMins: m.durationMins,
        totalMarks: m.totalMarks,
        passingMarks: m.passingMarks,
        isLive: true,
      },
    });

    // Remove existing question associations
    await prisma.mockTestQuestion.deleteMany({
      where: { mockTestId: createdMock.id },
    });

    // Associate questions
    let orderIdx = 0;
    for (const qItem of m.questions) {
      const qId = getQId(qItem.slug);
      if (qId) {
        await prisma.mockTestQuestion.create({
          data: {
            mockTestId: createdMock.id,
            questionId: qId,
            marks: qItem.marks,
            orderIdx: orderIdx++,
          },
        });
      }
    }

    console.log(`- Created [${m.mockType}] ${m.title} (${m.questions.length} questions, ${m.durationMins} mins)`);
  }

  console.log("=== All 8 Mock Tests Successfully Seeded with Strict Segregation ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
