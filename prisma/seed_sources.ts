import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("STEP 3: SOURCE DOCUMENT INGESTION PIPELINE");
  console.log("==================================================");

  let duplicatesDetected = 0;
  let reviewRequiredCount = 0;

  // Cache topics & companies
  const allTopics = await prisma.topic.findMany();
  const topicMap = new Map(allTopics.map((t) => [t.slug, t.id]));

  const allCompanies = await prisma.company.findMany();
  const companyMap = new Map(allCompanies.map((c) => [c.slug, c.id]));

  // Helper to upsert canonical question with deduplication
  async function upsertCanonicalQuestion(qData: {
    title: string;
    slug: string;
    description: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionType: "CODING" | "SQL" | "HTML_CSS_JS";
    sourceType: "REPORTED_PYQ" | "SHIFT_REPORTED" | "CANDIDATE_REPORTED" | "COMPANY_PATTERN" | "PRACTICE" | "GENERAL_INTERVIEW";
    importance: "MUST_DO" | "HIGH" | "MEDIUM" | "LOW";
    importanceReason?: string;
    verificationStatus: "UNVERIFIED" | "COMMUNITY_VERIFIED" | "OFFICIALLY_VERIFIED" | "HIGH_CONFIDENCE";
    frequency?: number;
    starterCode?: Record<string, string>;
    solution?: string;
    explanation?: string;
    topicSlugs: string[];
    companySlugs: string[];
    examples?: Array<{ input: string; output: string; explanation?: string }>;
    testCases?: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
    hints?: string[];
    // Domain specifics
    sqlSchemaSql?: string;
    sqlSeedData?: string;
    sqlExpectedQuery?: string;
    htmlTemplate?: string;
    cssTemplate?: string;
    jsTemplate?: string;
    // Source Metadata to attach
    sourceDocId?: string;
    page?: number;
    shift?: string;
    date?: Date;
    section?: string;
    evidenceType?: string;
    notes?: string;
  }) {
    // Check if canonical question exists
    let existing = await prisma.question.findUnique({
      where: { slug: qData.slug },
      include: { questionSources: true },
    });

    if (existing) {
      duplicatesDetected++;
      console.log(`[DEDUPLICATION] Found existing canonical question: "${existing.title}". Adding new source provenance.`);
      
      // Update frequency
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          frequency: { increment: 1 },
        },
      });

      // Attach new QuestionSource
      if (qData.sourceDocId || qData.notes || qData.shift) {
        await prisma.questionSource.create({
          data: {
            questionId: existing.id,
            sourceDocumentId: qData.sourceDocId,
            page: qData.page,
            shift: qData.shift,
            date: qData.date,
            section: qData.section,
            evidenceType: qData.evidenceType || "PAPER_SCAN",
            notes: qData.notes,
          },
        });
      }
      return existing;
    }

    if (qData.verificationStatus === "UNVERIFIED") {
      reviewRequiredCount++;
    }

    // Connect topics
    const topicConnect = qData.topicSlugs
      .map((slug) => topicMap.get(slug))
      .filter(Boolean)
      .map((id) => ({ topicId: id! }));

    // Connect companies
    const companyConnect = qData.companySlugs
      .map((slug) => companyMap.get(slug))
      .filter(Boolean)
      .map((id) => ({ companyId: id! }));

    const created = await prisma.question.create({
      data: {
        title: qData.title,
        slug: qData.slug,
        description: qData.description,
        inputFormat: qData.inputFormat,
        outputFormat: qData.outputFormat,
        constraints: qData.constraints,
        difficulty: qData.difficulty,
        questionType: qData.questionType,
        sourceType: qData.sourceType,
        importance: qData.importance,
        importanceReason: qData.importanceReason,
        verificationStatus: qData.verificationStatus,
        frequency: qData.frequency || 1,
        topics: JSON.stringify(qData.topicSlugs),
        companies: JSON.stringify(qData.companySlugs),
        starterCode: qData.starterCode ? JSON.stringify(qData.starterCode) : null,
        solution: qData.solution,
        explanation: qData.explanation,
        hints: qData.hints ? JSON.stringify(qData.hints) : null,
        examples: qData.examples ? JSON.stringify(qData.examples) : null,
        testCases: qData.testCases ? JSON.stringify(qData.testCases) : null,
        sqlSchemaSql: qData.sqlSchemaSql,
        sqlSeedData: qData.sqlSeedData,
        sqlExpectedQuery: qData.sqlExpectedQuery,
        htmlTemplate: qData.htmlTemplate,
        cssTemplate: qData.cssTemplate,
        jsTemplate: qData.jsTemplate,

        examplesList: {
          create: (qData.examples || []).map((ex, idx) => ({
            input: ex.input,
            output: ex.output,
            explanation: ex.explanation,
            orderIndex: idx,
          })),
        },
        testCasesList: {
          create: (qData.testCases || []).map((tc, idx) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden || false,
            orderIndex: idx,
          })),
        },
        hintsList: {
          create: (qData.hints || []).map((h, idx) => ({
            content: h,
            orderIndex: idx,
          })),
        },
        solutionsList: qData.solution
          ? {
              create: [
                {
                  language: "javascript",
                  code: qData.solution,
                  approach: "Optimal Reference Implementation",
                },
              ],
            }
          : undefined,
        questionTopics: { create: topicConnect },
        questionCompanies: { create: companyConnect },
        ...(qData.sourceDocId || qData.notes || qData.shift
          ? {
              questionSources: {
                create: [
                  {
                    sourceDocumentId: qData.sourceDocId,
                    page: qData.page,
                    shift: qData.shift,
                    date: qData.date,
                    section: qData.section,
                    evidenceType: qData.evidenceType || "PAPER_SCAN",
                    notes: qData.notes,
                  },
                ],
              },
            }
          : {}),
      },
    });

    console.log(`[INGESTED] Canonical question: "${created.title}" (${created.slug})`);
    return created;
  }

  // =========================================================================
  // SOURCE 1: ALL MNC CODING Collection (367 Pages - Accenture Section)
  // =========================================================================
  console.log("\n--- Ingesting Source 1: ALL MNC CODING Collection (Accenture Section) ---");
  const docMnc = await prisma.sourceDocument.create({
    data: {
      title: "ALL MNC CODING Collection Questions (367-Page Archive)",
      fileName: "all_mnc_coding_collection_367p.pdf",
      company: "Accenture",
      companyId: companyMap.get("accenture"),
      sourceDate: new Date("2022-06-15"),
      description: "Comprehensive multi-MNC coding question bank featuring HirePro assessment slots.",
      totalPages: 367,
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  // Question 1: Smallest Number in Given Array (HirePro 2022)
  const smallestNumQ = await upsertCanonicalQuestion({
    title: "Smallest Number in an Array",
    slug: "smallest-number-in-an-array",
    description:
      "Write a program to find the smallest number in a given array of integers.\n\nGiven an integer array `arr` of size `n`, return the element with the minimum numerical value.",
    inputFormat: "First line contains integer n. Second line contains n space-separated integers.",
    outputFormat: "A single integer representing the minimum element.",
    constraints: "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
    difficulty: "EASY",
    questionType: "CODING",
    sourceType: "REPORTED_PYQ",
    importance: "MUST_DO",
    importanceReason: "2022 HirePro Accenture official assessment question reported nationwide.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 9,
    topicSlugs: ["arrays", "searching"],
    companySlugs: ["accenture"],
    starterCode: {
      javascript: `function findSmallest(arr) {\n  // Write your code here\n  return 0;\n}`,
      python: `def find_smallest(arr: list[int]) -> int:\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public static int findSmallest(int[] arr) {\n        return 0;\n    }\n}`,
    },
    solution: `function findSmallest(arr) {\n  if (!arr || arr.length === 0) return 0;\n  let min = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] < min) min = arr[i];\n  }\n  return min;\n}`,
    explanation: "Linear scan through the array maintaining current minimum in O(N) time and O(1) auxiliary space.",
    examples: [
      { input: "5\n4 2 8 1 6", output: "1", explanation: "1 is the smallest value in [4, 2, 8, 1, 6]." },
      { input: "3\n-5 -2 -9", output: "-9", explanation: "-9 is the smallest value." },
    ],
    testCases: [
      { input: "4 2 8 1 6", expectedOutput: "1", isHidden: false },
      { input: "-5 -2 -9", expectedOutput: "-9", isHidden: false },
      { input: "100", expectedOutput: "100", isHidden: true },
    ],
    hints: ["Initialize min with arr[0] and compare sequentially."],
    sourceDocId: docMnc.id,
    page: 14,
    section: "Accenture HirePro 2022 Section",
    evidenceType: "OFFICIAL_MEMO",
    notes: "2022 HirePro Assessment. Re-reported across multiple campus drive shifts.",
  });

  // Deduplication simulation on Smallest Number in Array: Add secondary candidate report
  await upsertCanonicalQuestion({
    title: "Smallest Number in an Array",
    slug: "smallest-number-in-an-array",
    description: "",
    difficulty: "EASY",
    questionType: "CODING",
    sourceType: "REPORTED_PYQ",
    importance: "MUST_DO",
    verificationStatus: "OFFICIALLY_VERIFIED",
    topicSlugs: ["arrays"],
    companySlugs: ["accenture"],
    sourceDocId: docMnc.id,
    page: 28,
    shift: "Slot 2",
    notes: "Candidate memory debrief corroboration from 2023 drive.",
  });

  // Question 2: Difference of Sum (n, m)
  await upsertCanonicalQuestion({
    title: "Difference of Sums in Range",
    slug: "difference-of-sums-in-range",
    description:
      "The function accepts two integers `n` and `m`.\n\nCalculate the difference between:\n1. Sum of all integers in range [1, m] that are NOT divisible by `n`.\n2. Sum of all integers in range [1, m] that ARE divisible by `n`.\n\nReturn (Sum of non-divisible) - (Sum of divisible).",
    inputFormat: "Two positive integers n and m.",
    outputFormat: "Integer difference.",
    constraints: "1 <= n <= 1000\n1 <= m <= 10000",
    difficulty: "EASY",
    questionType: "CODING",
    sourceType: "REPORTED_PYQ",
    importance: "MUST_DO",
    importanceReason: "Extremely common Accenture HirePro and CoCubes mathematical test pattern.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 11,
    topicSlugs: ["math"],
    companySlugs: ["accenture"],
    starterCode: {
      javascript: `function differenceOfSum(n, m) {\n  // Write your code here\n  return 0;\n}`,
    },
    solution: `function differenceOfSum(n, m) {\n  let sumDiv = 0, sumNonDiv = 0;\n  for (let i = 1; i <= m; i++) {\n    if (i % n === 0) sumDiv += i;\n    else sumNonDiv += i;\n  }\n  return sumNonDiv - sumDiv;\n}`,
    examples: [
      { input: "n = 4, m = 20", output: "90", explanation: "Divisible by 4 in [1, 20]: 4+8+12+16+20 = 60. Non-divisible: 150. Difference: 150 - 60 = 90." },
    ],
    testCases: [
      { input: "4 20", expectedOutput: "90", isHidden: false },
      { input: "3 10", expectedOutput: "19", isHidden: false },
    ],
    sourceDocId: docMnc.id,
    page: 22,
    section: "Accenture Aptitude & Coding",
    notes: "Reported in both on-campus and off-campus ASE patterns.",
  });

  // Question 3: Large Small Sum
  await upsertCanonicalQuestion({
    title: "Large Small Sum",
    slug: "large-small-sum",
    description:
      "The function accepts an integer array `arr` of size `n`.\n\n1. Find the second largest element among elements at EVEN index positions.\n2. Find the second smallest element among elements at ODD index positions.\n3. Return the sum of these two elements.\n\nIf array length is 0 or less than or equal to 3, return 0.",
    inputFormat: "Array of integers.",
    outputFormat: "Sum of second largest even and second smallest odd.",
    constraints: "4 <= n <= 10^5\n-10^5 <= arr[i] <= 10^5",
    difficulty: "MEDIUM",
    questionType: "CODING",
    sourceType: "REPORTED_PYQ",
    importance: "HIGH",
    importanceReason: "Accenture assessment classic testing parity index separation and partial sorting.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 7,
    topicSlugs: ["arrays", "sorting"],
    companySlugs: ["accenture"],
    starterCode: {
      javascript: `function largeSmallSum(arr) {\n  // Write your code here\n  return 0;\n}`,
    },
    solution: `function largeSmallSum(arr) {\n  if (!arr || arr.length <= 3) return 0;\n  const even = [], odd = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (i % 2 === 0) even.push(arr[i]);\n    else odd.push(arr[i]);\n  }\n  even.sort((a, b) => a - b);\n  odd.sort((a, b) => a - b);\n  const secondLargestEven = even[even.length - 2];\n  const secondSmallestOdd = odd[1];\n  return secondLargestEven + secondSmallestOdd;\n}`,
    examples: [
      { input: "arr = [3, 2, 1, 7, 5, 4]", output: "7", explanation: "Even: [3, 1, 5] -> 2nd largest is 3. Odd: [2, 7, 4] -> 2nd smallest is 4. Sum = 3 + 4 = 7." },
    ],
    testCases: [
      { input: "3 2 1 7 5 4", expectedOutput: "7", isHidden: false },
      { input: "1 8 0 2 3 5 6", expectedOutput: "8", isHidden: false },
    ],
    sourceDocId: docMnc.id,
    page: 35,
    section: "Accenture Section",
  });

  // =========================================================================
  // SOURCE 2: SQL Tutorials / Top 50 SQL Queries (GENERAL_INTERVIEW)
  // =========================================================================
  console.log("\n--- Ingesting Source 2: Top 50 SQL Queries for Interviews ---");
  const docSql = await prisma.sourceDocument.create({
    data: {
      title: "Top 50 SQL Queries for Technical Interviews",
      fileName: "top_50_sql_interview_tutorials.pdf",
      company: "Industry Standard",
      sourceDate: new Date("2024-01-10"),
      description: "Core SQL interview query bank covering window functions, self joins, aggregations, and subqueries.",
      totalPages: 48,
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  const commonSqlSchema = `
CREATE TABLE Employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  salary INT,
  department_id INT,
  manager_id INT
);
CREATE TABLE Departments (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);
`;

  const commonSqlSeed = `
INSERT INTO Departments VALUES (1, 'IT'), (2, 'HR'), (3, 'Finance');
INSERT INTO Employees VALUES 
(1, 'Alice', 90000, 1, NULL),
(2, 'Bob', 80000, 1, 1),
(3, 'Charlie', 70000, 1, 1),
(4, 'Diana', 95000, 2, NULL),
(5, 'Evan', 60000, 2, 4),
(6, 'Fiona', 90000, 1, 1);
`;

  // SQL 1: Duplicate Records / Emails
  await upsertCanonicalQuestion({
    title: "Find Duplicate Emails or Records",
    slug: "find-duplicate-emails-or-records",
    description: "Write a SQL query to identify all duplicate names or records appearing more than once in the table.",
    difficulty: "EASY",
    questionType: "SQL",
    sourceType: "GENERAL_INTERVIEW",
    importance: "HIGH",
    importanceReason: "Fundamental SQL proficiency question asked across almost all technical interviews.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 14,
    topicSlugs: ["sql-group-by", "sql-having", "sql-aggregation"],
    companySlugs: ["accenture", "tcs", "cognizant"],
    sqlSchemaSql: commonSqlSchema,
    sqlSeedData: commonSqlSeed,
    sqlExpectedQuery: `SELECT name, COUNT(*) as occurrence_count FROM Employees GROUP BY name HAVING COUNT(*) > 1;`,
    solution: `SELECT name, COUNT(*) as occurrence_count FROM Employees GROUP BY name HAVING COUNT(*) > 1;`,
    sourceDocId: docSql.id,
    page: 3,
    section: "Aggregation & Grouping",
  });

  // SQL 2: Employees Earning More Than Their Immediate Managers
  await upsertCanonicalQuestion({
    title: "Employees Earning More Than Their Managers",
    slug: "employees-earning-more-than-managers",
    description: "Write a SQL query to find all employees who earn strictly more than their immediate manager.",
    difficulty: "MEDIUM",
    questionType: "SQL",
    sourceType: "GENERAL_INTERVIEW",
    importance: "MUST_DO",
    importanceReason: "Classic interview question testing Self-Join proficiency.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 12,
    topicSlugs: ["sql-join", "sql-where"],
    companySlugs: ["accenture", "capgemini"],
    sqlSchemaSql: commonSqlSchema,
    sqlSeedData: commonSqlSeed,
    sqlExpectedQuery: `SELECT e.name AS Employee FROM Employees e JOIN Employees m ON e.manager_id = m.id WHERE e.salary > m.salary;`,
    solution: `SELECT e.name AS Employee FROM Employees e JOIN Employees m ON e.manager_id = m.id WHERE e.salary > m.salary;`,
    sourceDocId: docSql.id,
    page: 9,
    section: "Self Joins",
  });

  // SQL 3: Customers Who Never Order
  await upsertCanonicalQuestion({
    title: "Customers Who Never Order",
    slug: "customers-who-never-order",
    description: "Write a SQL query to report all customers who have never placed an order.",
    difficulty: "EASY",
    questionType: "SQL",
    sourceType: "GENERAL_INTERVIEW",
    importance: "MEDIUM",
    importanceReason: "Standard evaluation of LEFT JOIN and NULL checks.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 8,
    topicSlugs: ["sql-join", "sql-where"],
    companySlugs: ["tech-mahindra", "hcl"],
    sqlSchemaSql: `CREATE TABLE Customers (id INT PRIMARY KEY, name VARCHAR(50)); CREATE TABLE Orders (id INT PRIMARY KEY, customer_id INT);`,
    sqlSeedData: `INSERT INTO Customers VALUES (1, 'Joe'), (2, 'Henry'), (3, 'Sam'), (4, 'Max'); INSERT INTO Orders VALUES (1, 3), (2, 1);`,
    sqlExpectedQuery: `SELECT c.name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customer_id WHERE o.id IS NULL;`,
    solution: `SELECT c.name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customer_id WHERE o.id IS NULL;`,
    sourceDocId: docSql.id,
    page: 15,
  });

  // =========================================================================
  // SOURCE 3: 8 September Shift 1
  // =========================================================================
  console.log("\n--- Ingesting Source 3: 8 September Shift 1 ---");
  const docSeptShift1 = await prisma.sourceDocument.create({
    data: {
      title: "Accenture National Assessment - 8 September Shift 1 Debrief",
      fileName: "accenture_8_sep_shift_1.pdf",
      company: "Accenture",
      companyId: companyMap.get("accenture"),
      sourceDate: new Date("2024-09-08"),
      description: "Official slot shift debrief with exact mathematical array transformation rules.",
      totalPages: 4,
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  await upsertCanonicalQuestion({
    title: "Array Formulaic Transformation Sum",
    slug: "array-formulaic-transformation-sum",
    description:
      "Given an integer array `nums` of size `n`, transform each element using the following rules:\n\n1. `val = nums[i] - ((i % 7) * 3)`\n2. If the original value `nums[i]` is divisible by 11:\n   `val = val + (nums[i] / 11)`\n\nReturn the total sum of all transformed values `val` across the array.",
    inputFormat: "First line integer n. Second line n integers.",
    outputFormat: "Total integer sum after transformation.",
    constraints: "1 <= n <= 10^5\n-10^6 <= nums[i] <= 10^6",
    difficulty: "EASY",
    questionType: "CODING",
    sourceType: "SHIFT_REPORTED",
    importance: "MUST_DO",
    importanceReason: "Authentic reported question from 8 September Shift 1 drive.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 3,
    topicSlugs: ["arrays", "math"],
    companySlugs: ["accenture"],
    starterCode: {
      javascript: `function transformSum(nums) {\n  // Write your code here\n  return 0;\n}`,
      python: `def transform_sum(nums: list[int]) -> int:\n    # Write your code here\n    pass`,
    },
    solution: `function transformSum(nums) {\n  let totalSum = 0;\n  for (let i = 0; i < nums.length; i++) {\n    let val = nums[i] - ((i % 7) * 3);\n    if (nums[i] % 11 === 0) {\n      val += Math.floor(nums[i] / 11);\n    }\n    totalSum += val;\n  }\n  return totalSum;\n}`,
    examples: [
      { input: "nums = [22, 10, 5]", output: "33", explanation: "i=0: 22 - (0*3) = 22, div by 11 (+2) = 24. i=1: 10 - (1*3) = 7. i=2: 5 - (2*3) = -1. Sum = 24 + 7 - 1 = 30." },
    ],
    testCases: [
      { input: "22 10 5", expectedOutput: "30", isHidden: false },
      { input: "11 0", expectedOutput: "12", isHidden: false },
    ],
    sourceDocId: docSeptShift1.id,
    page: 1,
    shift: "Shift 1",
    date: new Date("2024-09-08"),
    section: "Round 2 Coding",
    evidenceType: "MEMORY_DEBRIEF",
    notes: "Reported in Morning Shift. Exact math rule verified.",
  });

  // =========================================================================
  // SOURCE 4: 8 September Shift 2
  // =========================================================================
  console.log("\n--- Ingesting Source 4: 8 September Shift 2 ---");
  const docSeptShift2 = await prisma.sourceDocument.create({
    data: {
      title: "Accenture National Assessment - 8 September Shift 2 Debrief",
      fileName: "accenture_8_sep_shift_2.pdf",
      company: "Accenture",
      companyId: companyMap.get("accenture"),
      sourceDate: new Date("2024-09-08"),
      description: "Afternoon slot coding problem: Prefix Number Summation (EqSum).",
      totalPages: 3,
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  await upsertCanonicalQuestion({
    title: "Prefix Number Summation (EqSum)",
    slug: "prefix-number-summation-eqsum",
    description:
      "Define `EqSum(X)` as the sum of every numeric prefix of positive integer `X`.\n\n### Example:\nFor `X = 112`:\n- Prefix 1 digit: `1`\n- Prefix 2 digits: `11`\n- Prefix 3 digits: `112`\n- `EqSum(112) = 1 + 11 + 112 = 124`.\n\nGiven an integer `N`, find the smallest integer `X` such that:\n`1 <= X < N` AND `EqSum(X) > N`.\nIf no such `X` exists, return -1.",
    inputFormat: "A single integer N.",
    outputFormat: "The smallest integer X satisfying the condition, or -1.",
    constraints: "1 <= N <= 10^9",
    difficulty: "MEDIUM",
    questionType: "CODING",
    sourceType: "SHIFT_REPORTED",
    importance: "MUST_DO",
    importanceReason: "Authentic reported question from 8 September Shift 2.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 4,
    topicSlugs: ["math", "binary-search"],
    companySlugs: ["accenture"],
    starterCode: {
      javascript: `function eqSum(x) {\n  // Helper or solve directly\n}\n\nfunction findEqSumX(n) {\n  // Write your code here\n  return -1;\n}`,
    },
    solution: `function calculateEqSum(x) {\n  const s = String(x);\n  let sum = 0;\n  for (let i = 1; i <= s.length; i++) {\n    sum += parseInt(s.slice(0, i), 10);\n  }\n  return sum;\n}\n\nfunction findEqSumX(n) {\n  for (let x = 1; x < n; x++) {\n    if (calculateEqSum(x) > n) return x;\n  }\n  return -1;\n}`,
    examples: [
      { input: "100", output: "89", explanation: "EqSum(89) = 8 + 89 = 97 <= 100. EqSum(90) = 9 + 90 = 99 <= 100. EqSum(91) = 9 + 91 = 100 <= 100. EqSum(92) = 9 + 92 = 101 > 100." },
    ],
    testCases: [
      { input: "100", expectedOutput: "92", isHidden: false },
      { input: "10", expectedOutput: "10", isHidden: false },
    ],
    sourceDocId: docSeptShift2.id,
    page: 2,
    shift: "Shift 2",
    date: new Date("2024-09-08"),
    section: "Mandatory Coding Slot 2",
    evidenceType: "MEMORY_DEBRIEF",
  });

  // =========================================================================
  // SOURCE 5: Accenture 11 October 2025 On-Campus Exam
  // =========================================================================
  console.log("\n--- Ingesting Source 5: Accenture 11 October 2025 On-Campus Exam ---");
  const docOct11 = await prisma.sourceDocument.create({
    data: {
      title: "Accenture 11 October 2025 On-Campus Exam Questions",
      fileName: "accenture_11_oct_2025_oncampus.pdf",
      company: "Accenture",
      companyId: companyMap.get("accenture"),
      sourceDate: new Date("2025-10-11"),
      description: "On-campus placement drive featuring Frontend Textarea task, SQL ticket tracking, and Character Combination.",
      totalPages: 6,
      verificationStatus: "HIGH_CONFIDENCE",
    },
  });

  // Task 1: JavaScript textarea task
  await upsertCanonicalQuestion({
    title: "Interactive Textarea Character and Word Counter",
    slug: "interactive-textarea-counter-limit",
    description:
      "Build a real-time textarea character and word counter component:\n\n1. Element `<textarea id='user-feedback'>`.\n2. Element `<span id='char-count'>`: Displays current character count.\n3. Element `<span id='word-count'>`: Displays current word count.\n4. Warning state: If characters exceed 200, add class `.limit-warning` to char-count.\n5. Truncate/prevent input past 250 characters.",
    difficulty: "EASY",
    questionType: "HTML_CSS_JS",
    sourceType: "REPORTED_PYQ",
    importance: "HIGH",
    importanceReason: "Accenture 11 October 2025 on-campus frontend assessment.",
    verificationStatus: "HIGH_CONFIDENCE",
    frequency: 3,
    topicSlugs: ["frontend-dom", "frontend-events", "frontend-javascript"],
    companySlugs: ["accenture"],
    htmlTemplate: `<div class="box">\n  <textarea id="user-feedback" maxlength="250" placeholder="Type here..."></textarea>\n  <div class="stats">\n    Chars: <span id="char-count">0</span> / 250 | Words: <span id="word-count">0</span>\n  </div>\n</div>`,
    cssTemplate: `.box { padding: 20px; font-family: sans-serif; }\ntextarea { width: 100%; height: 100px; padding: 8px; }\n.limit-warning { color: #f43f5e; font-weight: bold; }`,
    jsTemplate: `// Implement listener\n`,
    solution: `const ta = document.getElementById('user-feedback');\nconst cc = document.getElementById('char-count');\nconst wc = document.getElementById('word-count');\n\nta.addEventListener('input', () => {\n  const text = ta.value;\n  cc.innerText = text.length;\n  if (text.length > 200) cc.classList.add('limit-warning');\n  else cc.classList.remove('limit-warning');\n  const words = text.trim().length > 0 ? text.trim().split(/\\s+/).length : 0;\n  wc.innerText = words;\n});`,
    sourceDocId: docOct11.id,
    page: 1,
    date: new Date("2025-10-11"),
    section: "Web Technology Track",
  });

  // Task 2: SQL users/support task
  await upsertCanonicalQuestion({
    title: "Support Ticket SLA Resolution Metrics",
    slug: "support-ticket-sla-resolution-metrics",
    description:
      "Write a SQL query to calculate the total tickets resolved and the average resolution time in hours for each support agent in the `SupportTickets` table for the month of September 2025.\n\nOnly include agents who resolved at least 5 tickets.",
    difficulty: "MEDIUM",
    questionType: "SQL",
    sourceType: "REPORTED_PYQ",
    importance: "MUST_DO",
    importanceReason: "Accenture 11 October 2025 on-campus database section.",
    verificationStatus: "HIGH_CONFIDENCE",
    frequency: 4,
    topicSlugs: ["sql-group-by", "sql-having", "sql-aggregation"],
    companySlugs: ["accenture"],
    sqlSchemaSql: `CREATE TABLE SupportTickets (id INT PRIMARY KEY, agent_id INT, status VARCHAR(20), resolution_hours INT, created_at DATE);`,
    sqlSeedData: `INSERT INTO SupportTickets VALUES (1, 101, 'RESOLVED', 4, '2025-09-02'), (2, 101, 'RESOLVED', 6, '2025-09-05'), (3, 101, 'RESOLVED', 2, '2025-09-10'), (4, 101, 'RESOLVED', 3, '2025-09-15'), (5, 101, 'RESOLVED', 5, '2025-09-20'), (6, 102, 'RESOLVED', 8, '2025-09-03');`,
    sqlExpectedQuery: `SELECT agent_id, COUNT(*) as tickets_resolved, AVG(resolution_hours) as avg_resolution_hours FROM SupportTickets WHERE status = 'RESOLVED' GROUP BY agent_id HAVING COUNT(*) >= 5;`,
    solution: `SELECT agent_id, COUNT(*) as tickets_resolved, AVG(resolution_hours) as avg_resolution_hours FROM SupportTickets WHERE status = 'RESOLVED' GROUP BY agent_id HAVING COUNT(*) >= 5;`,
    sourceDocId: docOct11.id,
    page: 3,
    date: new Date("2025-10-11"),
  });

  // Task 3: First+last character combination coding task
  await upsertCanonicalQuestion({
    title: "First and Last Character Inward Combination",
    slug: "first-last-character-inward-combination",
    description:
      "Given a string `s`, form a new string by picking characters alternatively from the start and the end, moving inwards.\n\n### Example:\nFor `s = 'abcdef'`:\n- 1st: `a` (from start)\n- 2nd: `f` (from end)\n- 3rd: `b` (from start)\n- 4th: `e` (from end)\n- 5th: `c` (from start)\n- 6th: `d` (from end)\n- Result: `'afbecd'`.",
    inputFormat: "A single string s.",
    outputFormat: "The combined string.",
    constraints: "1 <= length(s) <= 10^5",
    difficulty: "EASY",
    questionType: "CODING",
    sourceType: "REPORTED_PYQ",
    importance: "HIGH",
    importanceReason: "Accenture 11 October 2025 on-campus coding problem.",
    verificationStatus: "HIGH_CONFIDENCE",
    frequency: 5,
    topicSlugs: ["strings", "two-pointers"],
    companySlugs: ["accenture"],
    starterCode: {
      javascript: `function combineFirstLast(s) {\n  // Write your code here\n  return "";\n}`,
    },
    solution: `function combineFirstLast(s) {\n  let left = 0, right = s.length - 1;\n  let res = "";\n  while (left <= right) {\n    if (left === right) {\n      res += s[left];\n    } else {\n      res += s[left] + s[right];\n    }\n    left++;\n    right--;\n  }\n  return res;\n}`,
    examples: [
      { input: "abcdef", output: "afbecd" },
      { input: "hello", output: "holel" },
    ],
    testCases: [
      { input: "abcdef", expectedOutput: "afbecd", isHidden: false },
      { input: "hello", expectedOutput: "holel", isHidden: false },
      { input: "a", expectedOutput: "a", isHidden: true },
    ],
    sourceDocId: docOct11.id,
    page: 5,
    date: new Date("2025-10-11"),
  });

  // =========================================================================
  // SOURCE 6: Frontend Product Search Filter
  // =========================================================================
  console.log("\n--- Ingesting Source 6: Frontend Product Search Filter ---");
  const docFrontend = await prisma.sourceDocument.create({
    data: {
      title: "Frontend Technical Benchmark - Product Search Filter",
      fileName: "frontend_product_search_spec.pdf",
      company: "General Interview",
      sourceDate: new Date("2024-05-18"),
      description: "Frontend challenge testing data attributes, DOM styling, and real-time substring filtering.",
      totalPages: 2,
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  await upsertCanonicalQuestion({
    title: "Product Search Filter with Data Attributes",
    slug: "product-search-filter-data-attributes",
    description:
      "Implement a product search filter with the following exact specifications:\n\n1. Input field `<input id='search-input' value='nana' />` with initial search value `'nana'`.\n2. A list `<ul id='product-list'>` containing exactly 5 `<li>` elements, each styled with `font-size: 25px` and possessing a `data-name` attribute:\n   - Banana (`data-name='banana'`)\n   - Apple (`data-name='apple'`)\n   - Pineapple (`data-name='pineapple'`)\n   - Orange (`data-name='orange'`)\n   - Mango (`data-name='mango'`)\n3. Real-time filtering on input event: If product name contains the query (case-insensitive), display it (`display: list-item`); otherwise hide it (`display: none`).\n4. On initial load, items matching the default value `'nana'` must be filtered immediately.",
    difficulty: "EASY",
    questionType: "HTML_CSS_JS",
    sourceType: "COMPANY_PATTERN",
    importance: "MUST_DO",
    importanceReason: "Commonly adapted DOM screening task assessing DOM attributes, initial load filtering, and input events.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 6,
    topicSlugs: ["frontend-dom", "frontend-events", "frontend-javascript"],
    companySlugs: ["accenture", "cognizant"],
    htmlTemplate: `<input type="text" id="search-input" value="nana" />\n<ul id="product-list">\n  <li data-name="banana" style="font-size: 25px;">Banana</li>\n  <li data-name="apple" style="font-size: 25px;">Apple</li>\n  <li data-name="pineapple" style="font-size: 25px;">Pineapple</li>\n  <li data-name="orange" style="font-size: 25px;">Orange</li>\n  <li data-name="mango" style="font-size: 25px;">Mango</li>\n</ul>`,
    cssTemplate: `#product-list { list-style: none; padding: 0; }\n#product-list li { margin: 8px 0; font-size: 25px; }\n#search-input { padding: 8px; font-size: 16px; margin-bottom: 12px; }`,
    jsTemplate: `// Implement filter logic\n`,
    solution: `const input = document.getElementById('search-input');\nconst items = document.querySelectorAll('#product-list li');\n\nfunction filterList(query) {\n  const q = query.toLowerCase();\n  items.forEach(item => {\n    const name = (item.getAttribute('data-name') || '').toLowerCase();\n    if (name.includes(q)) {\n      item.style.display = '';\n    } else {\n      item.style.display = 'none';\n    }\n  });\n}\n\ninput.addEventListener('input', (e) => filterList(e.target.value));\n// Filter initially on load with default value 'nana'\nfilterList(input.value);`,
    sourceDocId: docFrontend.id,
    page: 1,
    notes: "Requires exact 5 elements, data-name attributes, font-size 25px, initial value 'nana'.",
  });

  // =========================================================================
  // SOURCE 7: Movie Streaming SQL
  // =========================================================================
  console.log("\n--- Ingesting Source 7: Movie Streaming Platform SQL ---");
  const docMovie = await prisma.sourceDocument.create({
    data: {
      title: "Movie Streaming Service Database Assessment",
      fileName: "movie_streaming_sql_challenge.pdf",
      company: "Accenture",
      companyId: companyMap.get("accenture"),
      sourceDate: new Date("2024-07-20"),
      description: "Two-tier complex SQL assessment modeling users, movies, and streaming watch telemetry.",
      totalPages: 5,
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  const movieStreamingSchema = `
CREATE TABLE Users (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  age INT
);
CREATE TABLE Movies (
  id INT PRIMARY KEY,
  title VARCHAR(100),
  genre VARCHAR(30),
  rating DECIMAL(3,1)
);
CREATE TABLE WatchHistory (
  id INT PRIMARY KEY,
  user_id INT,
  movie_id INT,
  watch_time_minutes INT,
  watch_date DATE
);
`;

  const movieStreamingSeed = `
INSERT INTO Users VALUES (1, 'Alex', 28), (2, 'Brian', 22), (3, 'Chloe', 35), (4, 'Dan', 40);
INSERT INTO Movies VALUES 
(1, 'Inception', 'Action', 4.8),
(2, 'The Dark Knight', 'Action', 4.9),
(3, 'Interstellar', 'Sci-Fi', 4.7),
(4, 'Shutter Island', 'Thriller', 4.2),
(5, 'Extraction', 'Action', 3.8);
INSERT INTO WatchHistory VALUES 
(1, 1, 1, 95, '2024-06-01'),
(2, 1, 2, 120, '2024-06-02'),
(3, 2, 1, 110, '2024-06-03'),
(4, 3, 4, 80, '2024-06-04'),
(5, 4, 2, 75, '2024-06-05');
`;

  // Question 1: Action movies, user age > 25, rating >= 4, watch > 60 minutes
  await upsertCanonicalQuestion({
    title: "Action Movie High Rating Watchers Over 25",
    slug: "action-movie-high-rating-watchers-over-25",
    description:
      "Write a SQL query to report distinct user names and movie titles satisfying the following conditions:\n\n1. Movie genre is `'Action'`.\n2. User `age > 25`.\n3. Movie `rating >= 4.0`.\n4. Streaming `watch_time_minutes > 60`.\n\nOrder results alphabetically by user name.",
    difficulty: "MEDIUM",
    questionType: "SQL",
    sourceType: "REPORTED_PYQ",
    importance: "MUST_DO",
    importanceReason: "Accenture technical assessment SQL slot question.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 5,
    topicSlugs: ["sql-join", "sql-where"],
    companySlugs: ["accenture"],
    sqlSchemaSql: movieStreamingSchema,
    sqlSeedData: movieStreamingSeed,
    sqlExpectedQuery: `SELECT DISTINCT u.name as user_name, m.title as movie_title FROM WatchHistory w JOIN Users u ON w.user_id = u.id JOIN Movies m ON w.movie_id = m.id WHERE m.genre = 'Action' AND u.age > 25 AND m.rating >= 4.0 AND w.watch_time_minutes > 60 ORDER BY u.name;`,
    solution: `SELECT DISTINCT u.name as user_name, m.title as movie_title\nFROM WatchHistory w\nJOIN Users u ON w.user_id = u.id\nJOIN Movies m ON w.movie_id = m.id\nWHERE m.genre = 'Action'\n  AND u.age > 25\n  AND m.rating >= 4.0\n  AND w.watch_time_minutes > 60\nORDER BY u.name;`,
    sourceDocId: docMovie.id,
    page: 2,
    section: "Streaming Analytics Part 1",
  });

  // Question 2: Action or Thriller, more than 5 watches, more than 500 minutes
  await upsertCanonicalQuestion({
    title: "Heavy Watch Time Streaming Titles",
    slug: "heavy-watch-time-streaming-titles",
    description:
      "Write a SQL query to report all movie titles in genre `'Action'` or `'Thriller'` that have:\n\n1. More than 5 total watch sessions (`COUNT(id) > 5`).\n2. More than 500 total accumulated minutes watched (`SUM(watch_time_minutes) > 500`).\n\nReturn movie title, genre, and total minutes watched.",
    difficulty: "HARD",
    questionType: "SQL",
    sourceType: "REPORTED_PYQ",
    importance: "HIGH",
    importanceReason: "Advanced aggregation query tested in Accenture technical interview round.",
    verificationStatus: "OFFICIALLY_VERIFIED",
    frequency: 4,
    topicSlugs: ["sql-group-by", "sql-having", "sql-aggregation", "sql-join"],
    companySlugs: ["accenture"],
    sqlSchemaSql: movieStreamingSchema,
    sqlSeedData: movieStreamingSeed,
    sqlExpectedQuery: `SELECT m.title, m.genre, SUM(w.watch_time_minutes) as total_minutes FROM Movies m JOIN WatchHistory w ON m.id = w.movie_id WHERE m.genre IN ('Action', 'Thriller') GROUP BY m.id, m.title, m.genre HAVING COUNT(w.id) > 5 AND SUM(w.watch_time_minutes) > 500;`,
    solution: `SELECT m.title, m.genre, SUM(w.watch_time_minutes) as total_minutes\nFROM Movies m\nJOIN WatchHistory w ON m.id = w.movie_id\nWHERE m.genre IN ('Action', 'Thriller')\nGROUP BY m.id, m.title, m.genre\nHAVING COUNT(w.id) > 5 AND SUM(w.watch_time_minutes) > 500;`,
    sourceDocId: docMovie.id,
    page: 4,
    section: "Streaming Analytics Part 2",
  });

  // =========================================================================
  // AUDIT & VALIDATION METRICS REPORT
  // =========================================================================
  const [
    totalSourceDocs,
    totalQuestions,
    accentureQuestions,
    sqlQuestions,
    frontendQuestions,
    shiftQuestions,
  ] = await Promise.all([
    prisma.sourceDocument.count(),
    prisma.question.count(),
    prisma.question.count({
      where: {
        questionCompanies: { some: { company: { slug: "accenture" } } },
      },
    }),
    prisma.question.count({ where: { questionType: "SQL" } }),
    prisma.question.count({ where: { questionType: "HTML_CSS_JS" } }),
    prisma.question.count({ where: { sourceType: "SHIFT_REPORTED" } }),
  ]);

  console.log("\n==================================================");
  console.log("STEP 3: INGESTION VALIDATION AUDIT REPORT");
  console.log("==================================================");
  console.log(`Total Source Documents:        ${totalSourceDocs}`);
  console.log(`Total Questions:               ${totalQuestions}`);
  console.log(`Accenture Questions:           ${accentureQuestions}`);
  console.log(`SQL Questions:                 ${sqlQuestions}`);
  console.log(`Frontend Questions:            ${frontendQuestions}`);
  console.log(`Shift Questions:               ${shiftQuestions}`);
  console.log(`Duplicates Detected (Merged):  ${duplicatesDetected}`);
  console.log(`Questions Requiring Review:    ${reviewRequiredCount}`);
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
