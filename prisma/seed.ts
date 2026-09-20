import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting full normalized database seed for Step 2...");

  // 1. ROLES
  const roles = [
    { name: "STUDENT", description: "Standard candidate preparing for campus & off-campus hiring drives" },
    { name: "ADMIN", description: "Platform administrator with full question & audit controls" },
    { name: "VERIFIER", description: "Question paper curator and PYQ verification officer" },
    { name: "CURATOR", description: "Content author and solution writer" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  const studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });

  // 2. DEFAULT USER
  const user = await prisma.user.upsert({
    where: { email: "engineer@accenture-prep.local" },
    update: {},
    create: {
      email: "engineer@accenture-prep.local",
      name: "Amanjeet Singh",
      roleId: studentRole?.id,
    },
  });

  // 3. TOPICS (DSA, SQL, Frontend)
  const topicData = [
    // DSA
    { name: "Arrays", slug: "arrays", category: "DSA" },
    { name: "Strings", slug: "strings", category: "DSA" },
    { name: "HashMap", slug: "hashmap", category: "DSA" },
    { name: "Math", slug: "math", category: "DSA" },
    { name: "Sorting", slug: "sorting", category: "DSA" },
    { name: "Searching", slug: "searching", category: "DSA" },
    { name: "Binary Search", slug: "binary-search", category: "DSA" },
    { name: "Two Pointers", slug: "two-pointers", category: "DSA" },
    { name: "Sliding Window", slug: "sliding-window", category: "DSA" },
    { name: "Stack", slug: "stack", category: "DSA" },
    { name: "Queue", slug: "queue", category: "DSA" },
    { name: "Linked List", slug: "linked-list", category: "DSA" },
    { name: "Tree", slug: "tree", category: "DSA" },
    { name: "Graph", slug: "graph", category: "DSA" },
    { name: "DP", slug: "dp", category: "DSA" },
    { name: "Greedy", slug: "greedy", category: "DSA" },
    { name: "Recursion", slug: "recursion", category: "DSA" },
    { name: "Backtracking", slug: "backtracking", category: "DSA" },

    // SQL
    { name: "SELECT", slug: "sql-select", category: "SQL" },
    { name: "WHERE", slug: "sql-where", category: "SQL" },
    { name: "JOIN", slug: "sql-join", category: "SQL" },
    { name: "GROUP BY", slug: "sql-group-by", category: "SQL" },
    { name: "HAVING", slug: "sql-having", category: "SQL" },
    { name: "Subquery", slug: "sql-subquery", category: "SQL" },
    { name: "CTE", slug: "sql-cte", category: "SQL" },
    { name: "Window Functions", slug: "sql-window-functions", category: "SQL" },
    { name: "Aggregation", slug: "sql-aggregation", category: "SQL" },
    { name: "String Functions", slug: "sql-string-functions", category: "SQL" },
    { name: "Date Functions", slug: "sql-date-functions", category: "SQL" },

    // Frontend
    { name: "HTML", slug: "frontend-html", category: "FRONTEND" },
    { name: "CSS", slug: "frontend-css", category: "FRONTEND" },
    { name: "JavaScript", slug: "frontend-javascript", category: "FRONTEND" },
    { name: "DOM", slug: "frontend-dom", category: "FRONTEND" },
    { name: "Events", slug: "frontend-events", category: "FRONTEND" },
    { name: "Arrays", slug: "frontend-arrays", category: "FRONTEND" },
    { name: "Objects", slug: "frontend-objects", category: "FRONTEND" },
    { name: "Fetch API", slug: "frontend-fetch-api", category: "FRONTEND" },
    { name: "Local Storage", slug: "frontend-local-storage", category: "FRONTEND" },
  ];

  const topicMap = new Map<string, string>();
  for (const t of topicData) {
    const created = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { category: t.category },
      create: t,
    });
    topicMap.set(t.slug, created.id);
  }

  // 4. COMPANIES
  const companyData = [
    {
      name: "Accenture",
      slug: "accenture",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop",
      description: "Accenture Associate Software Engineer (ASE) & Advanced ASE Recruitment Assessment",
    },
    {
      name: "TCS",
      slug: "tcs",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop",
      description: "Tata Consultancy Services National Qualifier Test (TCS NQT) Ninja & Digital",
    },
    {
      name: "Cognizant",
      slug: "cognizant",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop",
      description: "Cognizant GenC & GenC Elevate Assessment Track",
    },
    {
      name: "Capgemini",
      slug: "capgemini",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop",
      description: "Capgemini Exceller On-Campus & Off-Campus Hiring Drive",
    },
    {
      name: "HCL",
      slug: "hcl",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop",
      description: "HCLTech First Careers & Graduate Engineer Trainee Assessment",
    },
    {
      name: "Tech Mahindra",
      slug: "tech-mahindra",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop",
      description: "Tech Mahindra Associate Software Engineer Technical & Coding Evaluation",
    },
  ];

  const companyMap = new Map<string, string>();
  for (const c of companyData) {
    const created = await prisma.company.upsert({
      where: { slug: c.slug },
      update: { description: c.description },
      create: c,
    });
    companyMap.set(c.slug, created.id);
  }

  // 5. SOURCE DOCUMENTS
  const docAccenture = await prisma.sourceDocument.create({
    data: {
      title: "Accenture ASE 2024 On-Campus Drive Official Paper Compilation",
      fileName: "accenture_ase_slot_compilation_2024.pdf",
      company: "Accenture",
      companyId: companyMap.get("accenture"),
      sourceDate: new Date("2024-08-22"),
      description: "Verified questions collated from national campus assessment slots (Slot 1 & Slot 2).",
      totalPages: 18,
      verificationStatus: "OFFICIALLY_VERIFIED",
    },
  });

  const docTcs = await prisma.sourceDocument.create({
    data: {
      title: "TCS NQT Advanced Coding Section Papers 2024",
      fileName: "tcs_nqt_advanced_coding_2024.pdf",
      company: "TCS",
      companyId: companyMap.get("tcs"),
      sourceDate: new Date("2024-09-02"),
      description: "Advanced section questions covering algorithmic thinking and number theory.",
      totalPages: 12,
      verificationStatus: "HIGH_CONFIDENCE",
    },
  });

  // 6. AUTHENTIC QUESTIONS (Normalized)

  // Question 1: Binary String Operations Evaluator (Accenture PYQ)
  const q1 = await prisma.question.create({
    data: {
      title: "Binary String Operations Evaluator",
      slug: "binary-string-operations-evaluator",
      description:
        "The binary string operations evaluator accepts a non-empty string consisting of digits '0' and '1' interleaved with uppercase operation characters:\n\n- 'A' represents the bitwise AND operation.\n- 'B' represents the bitwise OR operation.\n- 'C' represents the bitwise XOR operation.\n\nYou must scan the string strictly from left to right, evaluating the running result from the first binary digit with subsequent operators and digits.\n\n### Return\nReturn the integer result (0 or 1). If the string is null or empty, return -1.",
      inputFormat: "A single string containing 0, 1, 'A', 'B', 'C'.",
      outputFormat: "An integer 0 or 1, or -1 if invalid.",
      constraints: "1 <= length(str) <= 10^5\nThe first character is always '0' or '1'.\nEvery operator is followed by a digit.",
      difficulty: "EASY",
      questionType: "CODING",
      sourceType: "REPORTED_PYQ",
      importance: "MUST_DO",
      importanceReason: "Reported in 6 consecutive Accenture campus assessment slots nationwide in 2024.",
      verificationStatus: "OFFICIALLY_VERIFIED",
      frequency: 6,
      similarityHash: "sha256_binary_str_eval_acc",
      starterCode: JSON.stringify({
        javascript: `function evaluateBinaryString(str) {\n  // Write your code here\n  return 0;\n}`,
        python: `def evaluate_binary_string(s: str) -> int:\n    # Write your code here\n    pass`,
        java: `class Solution {\n    public static int evaluateBinaryString(String s) {\n        return 0;\n    }\n}`,
      }),
      solution: `function evaluateBinaryString(str) {\n  if (!str || str.length === 0) return -1;\n  let res = parseInt(str[0], 10);\n  for (let i = 1; i < str.length; i += 2) {\n    const op = str[i];\n    const val = parseInt(str[i + 1], 10);\n    if (op === 'A') res = res & val;\n    else if (op === 'B') res = res | val;\n    else if (op === 'C') res = res ^ val;\n  }\n  return res;\n}`,
      explanation: "Single pass linear scan in O(N) time complexity and O(1) auxiliary space.",
      examples: JSON.stringify([
        { input: "1C0C1C1A0B1", output: "1", explanation: "1 XOR 0 = 1; 1 XOR 1 = 0; 0 XOR 1 = 1; 1 AND 0 = 0; 0 OR 1 = 1." },
      ]),
      testCases: JSON.stringify([
        { input: "1C0C1C1A0B1", expectedOutput: "1", isHidden: false },
        { input: "0A1B1C1", expectedOutput: "0", isHidden: false },
        { input: "1A1A1A1", expectedOutput: "1", isHidden: true },
      ]),
      topics: JSON.stringify(["Strings", "Bit Manipulation"]),
      companies: JSON.stringify(["accenture"]),
      languages: JSON.stringify(["javascript", "python", "java", "cpp"]),
      sourceDocument: docAccenture.title,
      sourceDate: new Date("2024-08-22"),
      sourceShift: "Morning Slot (10:00 AM)",

      // Normalized Relations
      examplesList: {
        create: [
          {
            input: "1C0C1C1A0B1",
            output: "1",
            explanation: "1 XOR 0 = 1; 1 XOR 1 = 0; 0 XOR 1 = 1; 1 AND 0 = 0; 0 OR 1 = 1.",
            orderIndex: 0,
          },
          {
            input: "0A1B1C1",
            output: "0",
            explanation: "0 AND 1 = 0; 0 OR 1 = 1; 1 XOR 1 = 0.",
            orderIndex: 1,
          },
        ],
      },
      testCasesList: {
        create: [
          { input: "1C0C1C1A0B1", expectedOutput: "1", isHidden: false, orderIndex: 0 },
          { input: "0A1B1C1", expectedOutput: "0", isHidden: false, orderIndex: 1 },
          { input: "1A1A1A1", expectedOutput: "1", isHidden: true, orderIndex: 2 },
          { input: "1B0A0", expectedOutput: "0", isHidden: true, orderIndex: 3 },
        ],
      },
      hintsList: {
        create: [
          { content: "Iterate step by step jumping by 2 indices.", orderIndex: 0 },
          { content: "Bitwise operations: 'A' -> &, 'B' -> |, 'C' -> ^.", orderIndex: 1 },
        ],
      },
      solutionsList: {
        create: [
          {
            language: "javascript",
            code: `function evaluateBinaryString(str) {\n  if (!str || str.length === 0) return -1;\n  let res = parseInt(str[0], 10);\n  for (let i = 1; i < str.length; i += 2) {\n    const op = str[i];\n    const val = parseInt(str[i + 1], 10);\n    if (op === 'A') res = res & val;\n    else if (op === 'B') res = res | val;\n    else if (op === 'C') res = res ^ val;\n  }\n  return res;\n}`,
            approach: "Linear Left-to-Right Scan",
            timeComplexity: "O(N)",
            spaceComplexity: "O(1)",
          },
        ],
      },
      questionTopics: {
        create: [
          { topicId: topicMap.get("strings")! },
          { topicId: topicMap.get("math")! },
        ],
      },
      questionCompanies: {
        create: [{ companyId: companyMap.get("accenture")! }],
      },
      questionSources: {
        create: [
          {
            sourceDocumentId: docAccenture.id,
            page: 4,
            shift: "Slot 1 (10:00 AM)",
            date: new Date("2024-08-22"),
            section: "Round 2 Coding Assessment",
            evidenceType: "OFFICIAL_MEMO",
            notes: "Direct candidate interview debrief confirmed same problem on day 2.",
          },
        ],
      },
    },
  });

  // Question 2: Rat Food Distribution Sufficiency (Accenture Shift Reported)
  const q2 = await prisma.question.create({
    data: {
      title: "Rat Food Distribution Sufficiency",
      slug: "rat-food-distribution-sufficiency",
      description:
        "The function accepts two positive integers `r` and `unit` and an integer array `arr` of size `n`.\n\n- `r` represents the number of rats present in an area.\n- `unit` is the amount of food each rat consumes.\n- Each element `arr[i]` represents the amount of food available in house `i`.\n\nYou need to find the minimum number of houses required to be visited from index 0 to collect sufficient food for all rats. If total food is insufficient, return 0. If empty, return -1.",
      inputFormat: "First line r, second line unit, third line array elements.",
      outputFormat: "Minimum integer index count or 0 if insufficient, -1 if empty.",
      constraints: "1 <= r, unit <= 10^4\n1 <= arr[i] <= 10^4\n1 <= n <= 10^5",
      difficulty: "EASY",
      questionType: "CODING",
      sourceType: "SHIFT_REPORTED",
      importance: "MUST_DO",
      importanceReason: "Classic Accenture staple coding question testing prefix accumulation logic.",
      verificationStatus: "HIGH_CONFIDENCE",
      frequency: 8,
      similarityHash: "sha256_rat_food_dist_acc",
      starterCode: JSON.stringify({
        javascript: `function minHousesForRats(r, unit, arr) {\n  // Write your code here\n  return 0;\n}`,
      }),
      solution: `function minHousesForRats(r, unit, arr) {\n  if (!arr || arr.length === 0) return -1;\n  const totalNeeded = r * unit;\n  let accumulated = 0;\n  for (let i = 0; i < arr.length; i++) {\n    accumulated += arr[i];\n    if (accumulated >= totalNeeded) return i + 1;\n  }\n  return 0;\n}`,
      topics: JSON.stringify(["Arrays", "Greedy"]),
      companies: JSON.stringify(["accenture", "cognizant"]),
      sourceDocument: docAccenture.title,
      sourceDate: new Date("2024-09-04"),
      sourceShift: "Slot 2 (2:00 PM)",

      examplesList: {
        create: [
          {
            input: "r = 7, unit = 2, arr = [2, 8, 3, 5, 7, 4, 1, 2]",
            output: "4",
            explanation: "Total food required = 7 * 2 = 14. First 4 houses provide 2 + 8 + 3 + 5 = 18 >= 14.",
            orderIndex: 0,
          },
        ],
      },
      testCasesList: {
        create: [
          { input: "7\n2\n2 8 3 5 7 4 1 2", expectedOutput: "4", isHidden: false, orderIndex: 0 },
          { input: "3\n5\n10 2 3", expectedOutput: "3", isHidden: false, orderIndex: 1 },
          { input: "10\n10\n1 2 3", expectedOutput: "0", isHidden: true, orderIndex: 2 },
        ],
      },
      questionTopics: {
        create: [
          { topicId: topicMap.get("arrays")! },
          { topicId: topicMap.get("greedy")! },
        ],
      },
      questionCompanies: {
        create: [
          { companyId: companyMap.get("accenture")! },
          { companyId: companyMap.get("cognizant")! },
        ],
      },
      questionSources: {
        create: [
          {
            sourceDocumentId: docAccenture.id,
            page: 8,
            shift: "Slot 2 (2:00 PM)",
            date: new Date("2024-09-04"),
            section: "Mandatory Coding Round",
            evidenceType: "MEMORY_DEBRIEF",
          },
        ],
      },
    },
  });

  // Question 3: Superior Elements in an Array (Company Pattern)
  const q3 = await prisma.question.create({
    data: {
      title: "Superior Elements in an Array",
      slug: "superior-elements-in-an-array",
      description:
        "An element is considered **Superior** (or a Leader) if it is strictly greater than all the elements to its right side. The rightmost element is always superior by definition.\n\nReturn the count of superior elements present in the array.",
      inputFormat: "Array of integers.",
      outputFormat: "Count of superior elements.",
      constraints: "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
      difficulty: "MEDIUM",
      questionType: "CODING",
      sourceType: "COMPANY_PATTERN",
      importance: "HIGH",
      importanceReason: "Commonly adapted problem tested in both Accenture and TCS advanced rounds.",
      verificationStatus: "COMMUNITY_VERIFIED",
      frequency: 5,
      starterCode: JSON.stringify({
        javascript: `function countSuperiorElements(arr) {\n  return 0;\n}`,
      }),
      solution: `function countSuperiorElements(arr) {\n  if (!arr || arr.length === 0) return 0;\n  let count = 0;\n  let maxFromRight = -Infinity;\n  for (let i = arr.length - 1; i >= 0; i--) {\n    if (arr[i] > maxFromRight) {\n      count++;\n      maxFromRight = arr[i];\n    }\n  }\n  return count;\n}`,
      topics: JSON.stringify(["Arrays", "Two Pointers"]),
      companies: JSON.stringify(["accenture", "tcs"]),
      testCasesList: {
        create: [
          { input: "7 9 5 2 8 7", expectedOutput: "3", isHidden: false, orderIndex: 0 },
          { input: "1 2 3 4 5", expectedOutput: "1", isHidden: false, orderIndex: 1 },
          { input: "5 4 3 2 1", expectedOutput: "5", isHidden: true, orderIndex: 2 },
        ],
      },
      questionTopics: {
        create: [
          { topicId: topicMap.get("arrays")! },
          { topicId: topicMap.get("two-pointers")! },
        ],
      },
      questionCompanies: {
        create: [
          { companyId: companyMap.get("accenture")! },
          { companyId: companyMap.get("tcs")! },
        ],
      },
    },
  });

  // Question 4: SQL Second Highest Salary with Ties (Reported PYQ)
  const q4 = await prisma.question.create({
    data: {
      title: "Second Highest Salary with Ties",
      slug: "second-highest-salary-with-ties",
      description:
        "Write a SQL query to report the second highest distinct salary from the `Employee` table. If there is no second highest salary, query should report null.\n\n### Table: Employee\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| salary | int |\n| department_id | int |",
      difficulty: "MEDIUM",
      questionType: "SQL",
      sourceType: "REPORTED_PYQ",
      importance: "MUST_DO",
      importanceReason: "Core database competency question asked in Accenture technical interviews.",
      verificationStatus: "OFFICIALLY_VERIFIED",
      frequency: 7,
      sqlSchemaSql: "CREATE TABLE Employee (id INT PRIMARY KEY, salary INT, department_id INT);",
      sqlSeedData: "INSERT INTO Employee VALUES (1, 100, 1), (2, 200, 1), (3, 300, 2), (4, 300, 2);",
      sqlExpectedQuery: "SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);",
      starterCode: JSON.stringify({
        sql: `SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);`,
      }),
      solution: `SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);`,
      topics: JSON.stringify(["SELECT", "Subquery", "Aggregation"]),
      companies: JSON.stringify(["accenture"]),
      sourceDate: new Date("2024-08-30"),
      sourceShift: "Slot 3",
      questionTopics: {
        create: [
          { topicId: topicMap.get("sql-select")! },
          { topicId: topicMap.get("sql-subquery")! },
          { topicId: topicMap.get("sql-aggregation")! },
        ],
      },
      questionCompanies: {
        create: [{ companyId: companyMap.get("accenture")! }],
      },
    },
  });

  // Question 5: Frontend Interactive Counter
  const q5 = await prisma.question.create({
    data: {
      title: "Interactive Counter with Step Control",
      slug: "interactive-counter-with-step-control",
      description:
        "Build an interactive counter widget supporting increment, decrement (bounded at 0), and reset with dynamic step input.",
      difficulty: "EASY",
      questionType: "HTML_CSS_JS",
      sourceType: "COMPANY_PATTERN",
      importance: "MEDIUM",
      importanceReason: "Common frontend screening evaluation for Web Developers.",
      verificationStatus: "HIGH_CONFIDENCE",
      frequency: 3,
      htmlTemplate: `<div class="counter-card">\n  <div id="counter-value">0</div>\n  <div class="controls">\n    <input id="step-input" type="number" value="1" min="1" />\n    <button id="btn-increment">+ Increment</button>\n    <button id="btn-decrement">- Decrement</button>\n    <button id="btn-reset">Reset</button>\n  </div>\n</div>`,
      cssTemplate: `.counter-card { font-family: sans-serif; padding: 20px; border: 1px solid #333; }`,
      jsTemplate: `// Implement DOM listeners\n`,
      topics: JSON.stringify(["HTML", "CSS", "JavaScript", "DOM", "Events"]),
      companies: JSON.stringify(["accenture"]),
      questionTopics: {
        create: [
          { topicId: topicMap.get("frontend-html")! },
          { topicId: topicMap.get("frontend-css")! },
          { topicId: topicMap.get("frontend-javascript")! },
          { topicId: topicMap.get("frontend-dom")! },
          { topicId: topicMap.get("frontend-events")! },
        ],
      },
      questionCompanies: {
        create: [{ companyId: companyMap.get("accenture")! }],
      },
    },
  });

  // 7. MOCK TESTS
  const mockTest = await prisma.mockTest.create({
    data: {
      title: "Accenture ASE National Assessment 2024 Simulation",
      slug: "accenture-ase-national-assessment-2024",
      description: "Full simulation based on authentic Accenture hiring patterns: 2 core coding problems plus technical assessment questions.",
      company: "Accenture",
      companyId: companyMap.get("accenture"),
      durationMins: 45,
      totalMarks: 50,
      passingMarks: 35,
      isLive: true,
      questions: {
        create: [
          { questionId: q1.id, marks: 20, orderIdx: 1 },
          { questionId: q2.id, marks: 30, orderIdx: 2 },
        ],
      },
    },
  });

  // 8. USER PROGRESS & BOOKMARKS
  await prisma.userProgress.create({
    data: {
      userId: user.id,
      questionId: q1.id,
      isSolved: true,
      attemptsCount: 2,
      solvedAt: new Date(),
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: user.id,
      questionId: q2.id,
      folderName: "Accenture High Priority",
      note: "Need to re-check the empty array return specification (-1 vs 0).",
    },
  });

  await prisma.submission.create({
    data: {
      userId: user.id,
      questionId: q1.id,
      language: "javascript",
      sourceCode: `function evaluateBinaryString(str) { return 1; }`,
      status: "ACCEPTED",
      runtime: 42,
      memory: 14200,
    },
  });

  await prisma.revisionItem.create({
    data: {
      userId: user.id,
      questionId: q1.id,
      bucket: "BOX_2",
      nextReviewAt: new Date(Date.now() + 86400000 * 3),
      repetitions: 1,
    },
  });

  console.log("Database seeded successfully with normalized models, topics, companies, and authentic questions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
