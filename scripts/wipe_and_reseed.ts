import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parseAccentureMcqBank } from "./parse_bank";

const prisma = new PrismaClient();

async function main() {
  console.log("=============================================================");
  console.log("=== WIPE & RE-SEED ACCENTURE MCQ QUESTION BANK ===");
  console.log("=============================================================\n");

  const sourceFile = path.resolve(process.cwd(), "Accenture_MCQ_Bank.md");
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file not found at ${sourceFile}`);
  }

  console.log(`1. Parsing verified source file: ${sourceFile}...`);
  const parsed = parseAccentureMcqBank(sourceFile);
  console.log(`Parsed total: ${parsed.length} questions from source file.\n`);

  if (parsed.length !== 2610) {
    throw new Error(`Expected 2610 questions, but parsed ${parsed.length}! Aborting.`);
  }

  // Count per topic
  const perTopic: Record<string, { source: number; practice: number; total: number }> = {};
  for (const q of parsed) {
    if (!perTopic[q.section]) {
      perTopic[q.section] = { source: 0, practice: 0, total: 0 };
    }
    perTopic[q.section].total++;
    if (q.kind === "Source") perTopic[q.section].source++;
    else perTopic[q.section].practice++;
  }

  console.log("Parsed topic breakdown:");
  console.table(perTopic);

  // 2. Update canonical_mcq_bank.json
  const jsonPath = path.resolve(process.cwd(), "src/data/canonical_mcq_bank.json");
  console.log(`2. Updating canonical JSON file at: ${jsonPath}...`);
  const canonicalJsonData = parsed.map((q) => {
    let fullQuestion = q.stem;
    if (q.codeBlock) {
      fullQuestion += `\n\n\`\`\`${q.codeLanguage || ""}\n${q.codeBlock}\n\`\`\``;
    }
    return {
      id: `mcq-${q.id.toLowerCase()}`,
      sourceId: q.id,
      section: q.section,
      topic: q.section,
      subtopic: q.section,
      question: fullQuestion,
      stem: q.stem,
      codeBlock: q.codeBlock,
      codeLanguage: q.codeLanguage,
      options: [
        { id: "A", text: q.options.A },
        { id: "B", text: q.options.B },
        { id: "C", text: q.options.C },
        { id: "D", text: q.options.D },
      ],
      correctOptionId: q.answerKey,
      correctAnswerText: q.answerText,
      sourceAnswerText: q.answerText,
      sourceAnswerOption: q.answerKey,
      explanation: q.explanation,
      difficulty: q.difficulty,
      sourceType: q.sourceType,
      verificationStatus: "VERIFIED",
      sourceFile: "Accenture_MCQ_Bank.md",
      tags: ["Accenture", q.section],
      isActive: true,
      note: q.note,
      sourceCheck: q.sourceCheck,
    };
  });

  fs.writeFileSync(jsonPath, JSON.stringify(canonicalJsonData, null, 2), "utf-8");
  console.log(`Written ${canonicalJsonData.length} records to ${jsonPath}.\n`);

  // 3. WIPE existing question records from database
  console.log("3. Wiping existing question and dependent records from database...");

  // Delete test attempts and questions
  const deletedTestQuestions = await prisma.testAttemptQuestion.deleteMany({});
  console.log(`Deleted TestAttemptQuestion records: ${deletedTestQuestions.count}`);

  const deletedAttempts = await prisma.testAttempt.deleteMany({});
  console.log(`Deleted TestAttempt records: ${deletedAttempts.count}`);

  const deletedBookmarks = await prisma.bookmark.deleteMany({});
  console.log(`Deleted Bookmark records: ${deletedBookmarks.count}`);

  const deletedProgress = await prisma.userProgress.deleteMany({});
  console.log(`Deleted UserProgress records: ${deletedProgress.count}`);

  const deletedMockTestQuestions = await prisma.mockTestQuestion.deleteMany({});
  console.log(`Deleted MockTestQuestion records: ${deletedMockTestQuestions.count}`);

  const deletedQuestions = await prisma.question.deleteMany({});
  console.log(`Deleted Question records: ${deletedQuestions.count}\n`);

  // 4. Ensure Company and SourceDocument exist
  console.log("4. Ensuring Company and SourceDocument exist...");
  let accentureCompany = await prisma.company.findFirst({
    where: { slug: "accenture" },
  });
  if (!accentureCompany) {
    accentureCompany = await prisma.company.create({
      data: {
        name: "Accenture",
        slug: "accenture",
        description: "Accenture Recruitment Assessment Question Bank",
      },
    });
  }

  const docFileName = "Accenture_MCQ_Bank.md";
  let sourceDoc = await prisma.sourceDocument.findFirst({
    where: { fileName: docFileName },
  });
  if (!sourceDoc) {
    sourceDoc = await prisma.sourceDocument.create({
      data: {
        title: "Accenture MCQ Bank",
        fileName: docFileName,
        company: "Accenture",
        companyId: accentureCompany.id,
        totalPages: 100,
        verificationStatus: "OFFICIALLY_VERIFIED",
        description: "Complete 2,610 Accenture MCQ Question Bank across 10 topics",
      },
    });
  }

  // 5. Insert all 2,610 questions using batch createMany
  console.log("5. Seeding all 2,610 questions to database...");

  const questionRecords = parsed.map((q) => {
    const payload = {
      stem: q.stem,
      codeBlock: q.codeBlock,
      codeLanguage: q.codeLanguage,
      options: [
        { id: "A", text: q.options.A },
        { id: "B", text: q.options.B },
        { id: "C", text: q.options.C },
        { id: "D", text: q.options.D },
      ],
      correctOptionId: q.answerKey,
      correctAnswerText: q.answerText,
      verificationStatus: "VERIFIED",
      note: q.note,
      sourceCheck: q.sourceCheck,
    };
    const starterCode = JSON.stringify(payload);

    let fullDescription = q.stem;
    if (q.codeBlock) {
      fullDescription += `\n\n\`\`\`${q.codeLanguage || ""}\n${q.codeBlock}\n\`\`\``;
    }
    fullDescription += "\n\n### Options\n";
    for (const k of ["A", "B", "C", "D"] as const) {
      if (q.options[k]) {
        fullDescription += `- **${k})** ${q.options[k]}\n`;
      }
    }

    const title = `[${q.id}] ${q.stem.slice(0, 80).replace(/\r?\n/g, " ")}`;

    return {
      id: q.id,
      slug: q.id.toLowerCase(),
      title: title,
      description: fullDescription,
      difficulty: q.difficulty,
      questionType: "MCQ",
      sourceType: q.sourceType,
      category: q.section,
      importance: q.sourceType === "REPORTED_PYQ" ? "HIGH" : "MEDIUM",
      importanceReason: q.sourceCheck || (q.kind === "Source" ? "Official Accenture reported question" : "Practice question"),
      verificationStatus: "VERIFIED",
      starterCode: starterCode,
      solution: q.answerKey,
      explanation: q.explanation,
      sourceDocument: docFileName,
      companies: JSON.stringify(["accenture"]),
    };
  });

  const BATCH_SIZE = 500;
  for (let i = 0; i < questionRecords.length; i += BATCH_SIZE) {
    const chunk = questionRecords.slice(i, i + BATCH_SIZE);
    const res = await prisma.question.createMany({
      data: chunk,
      skipDuplicates: false,
    });
    console.log(`Inserted batch: ${res.count} questions (total progress: ${Math.min(i + BATCH_SIZE, questionRecords.length)} / ${questionRecords.length})...`);
  }

  // 6. Post-import verification
  console.log("\n6. Running post-import verification...");
  const totalCount = await prisma.question.count();
  const mcqCount = await prisma.question.count({ where: { questionType: "MCQ" } });
  console.log(`Total questions in DB: ${totalCount}`);
  console.log(`MCQ questions in DB: ${mcqCount}`);

  const dbTopics = await prisma.question.groupBy({
    by: ["category"],
    _count: true,
  });

  console.log("\nDatabase category counts:");
  console.table(dbTopics);

  console.log("\n🎉 WIPE AND RE-SEED COMPLETED SUCCESSFULLY!");
}

main()
  .catch((err) => {
    console.error("FATAL ERROR during wipe & re-seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
