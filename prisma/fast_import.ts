import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

function sanitize(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/\0/g, "");
}

function slugify(text: string): string {
  return sanitize(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 45);
}

async function main() {
  console.log("=== FAST PARALLEL IMPORT & AUDIT (WITH NULL-BYTE CLEANING) ===");

  const inventoryPath = "C:\\Users\\amanj\\.gemini\\antigravity-ide\\brain\\9c9576ac-0d08-4e8a-bfa8-b02c5f372869\\scratch\\question_inventory.json";
  const rawInventory: any[] = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));
  console.log(`Inventory questions: ${rawInventory.length}`);

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

  const docFileName = "Accenture MOCK OA -1-merged---.md";
  let sourceDoc = await prisma.sourceDocument.findFirst({
    where: { fileName: docFileName },
  });
  if (!sourceDoc) {
    sourceDoc = await prisma.sourceDocument.create({
      data: {
        title: "Accenture MOCK OA - 1 Merged Question Bank",
        fileName: docFileName,
        company: "Accenture",
        companyId: accentureCompany.id,
        totalPages: 10188,
        verificationStatus: "UNVERIFIED",
        description: "Complete question bank audited from Accenture MOCK OA -1-merged---.md",
      },
    });
  }

  // Pre-calculate duplicate frequencies
  const stemCounts = new Map<string, number>();
  for (const q of rawInventory) {
    const norm = sanitize(q.question_text).toLowerCase().replace(/[^\w\s]/g, "").trim();
    stemCounts.set(norm, (stemCounts.get(norm) || 0) + 1);
  }

  // Find existing questions for this source
  const existingQuestions = await prisma.question.findMany({
    where: { sourceDocument: docFileName },
    select: { id: true, slug: true },
  });
  const existingSlugs = new Map(existingQuestions.map((eq) => [eq.slug, eq.id]));
  console.log(`Already imported questions in DB: ${existingSlugs.size}`);

  const CONCURRENCY = 15;
  const missingFields: Array<{ id: string; missing: string[] }> = [];

  // Filter questions needing import
  const toImport: any[] = [];
  for (const q of rawInventory) {
    const qTextClean = sanitize(q.question_text);
    const cleanTitle = (qTextClean.slice(0, 90).replace(/^\[(.*?)\]/, "$1").replace(/[`]/g, "").trim() || "Question").slice(0, 87);
    const baseSlug = slugify(cleanTitle) || "question";
    const uniqueSlug = `mockoa1-${q.id.toLowerCase().replace(/_/g, "-")}-${baseSlug}`;

    // Check missing fields
    const missing: string[] = [];
    if (!qTextClean || qTextClean.trim() === "") missing.push("question_text");
    if (!q.category) missing.push("category");
    if (!q.subcategory) missing.push("subcategory");
    if (q.line === undefined || q.line === null) missing.push("line");
    if (missing.length > 0) missingFields.push({ id: q.id, missing });

    if (!existingSlugs.has(uniqueSlug)) {
      toImport.push({ q, uniqueSlug, cleanTitle, qTextClean });
    }
  }

  console.log(`Remaining to import: ${toImport.length}`);

  // Process in concurrent chunks
  for (let i = 0; i < toImport.length; i += CONCURRENCY) {
    const chunk = toImport.slice(i, i + CONCURRENCY);
    process.stdout.write(`Importing chunk ${Math.floor(i / CONCURRENCY) + 1} / ${Math.ceil(toImport.length / CONCURRENCY)} (items ${i + 1}-${i + chunk.length})...\r`);

    await Promise.all(
      chunk.map(async ({ q, uniqueSlug, cleanTitle, qTextClean }) => {
        try {
          let sourceType = "PDF_SOURCE";
          if (q.section.includes("5C: Accenture Coding Questions and Solution 2024")) {
            sourceType = "CANDIDATE_REPORTED";
          } else if (
            q.section.includes("Section 4: Accenture Advanced Coding Questions") ||
            q.section.includes("Section 5B: Accenture Technical Round") ||
            q.section.includes("Section 3: Accenture 2025 Shift Coding Sheet") ||
            q.section.includes("Section 7: Most asked DP, Graph and Grid Problems")
          ) {
            sourceType = "ACCENTURE_PATTERN";
          } else if (
            q.section.includes("Section 5A: Accenture Coding Round Cheatsheet") ||
            q.section.includes("Section 6: Cloud Cheat Sheet Situations")
          ) {
            sourceType = "GENERAL_PRACTICE";
          } else if (q.questionable) {
            sourceType = "UNVERIFIED";
          } else {
            sourceType = "PDF_SOURCE";
          }

          let questionType = "MCQ";
          if (q.category === "Coding & Problem Solving") {
            questionType = "CODING";
          } else if (q.category === "Pseudocode") {
            questionType = Object.keys(q.options || {}).length > 0 ? "MCQ" : "CODING";
          } else {
            questionType = "MCQ";
          }

          let difficulty = "MEDIUM";
          if (q.category === "Common Applications & MS Office") {
            difficulty = "EASY";
          } else if (q.category === "Coding & Problem Solving") {
            if (q.subcategory.includes("Advanced") || q.subcategory.includes("Dynamic Programming") || q.subcategory.includes("Graph")) {
              difficulty = "HARD";
            } else {
              difficulty = "MEDIUM";
            }
          }

          let fullDescription = qTextClean;
          const optionsKeys = Object.keys(q.options || {});
          if (optionsKeys.length > 0) {
            fullDescription += "\n\n### Options\n";
            for (const k of ["A", "B", "C", "D", "E"]) {
              if (q.options[k]) {
                fullDescription += `- **${k})** ${sanitize(q.options[k])}\n`;
              }
            }
          }

          const normStem = qTextClean.toLowerCase().replace(/[^\w\s]/g, "").trim();
          const freq = stemCounts.get(normStem) || 1;

          const createdQuestion = await prisma.question.create({
            data: {
              title: sanitize(cleanTitle),
              slug: uniqueSlug,
              description: sanitize(fullDescription),
              difficulty,
              questionType,
              sourceType,
              category: q.category,
              verificationStatus: "UNVERIFIED",
              frequency: freq,
              solution: sanitize(q.answer) || null,
              explanation: sanitize(q.explanation) || null,
              topics: JSON.stringify([q.subcategory, q.category]),
              companies: JSON.stringify(["Accenture"]),
              examples: optionsKeys.length > 0 ? JSON.stringify(q.options) : null,
              sourceDocument: docFileName,
              sourcePage: q.line,
              sourceShift: q.section,
              importance: q.section.includes("Advanced") || q.section.includes("Technical Round") ? "HIGH" : "MEDIUM",
              importanceReason: q.questionable ? "Questionable source answer/options" : "Imported from Accenture MOCK OA - 1 Merged Question Bank",
            },
          });

          await prisma.questionCompany.create({
            data: {
              questionId: createdQuestion.id,
              companyId: accentureCompany.id,
            },
          });

          await prisma.questionSource.create({
            data: {
              questionId: createdQuestion.id,
              sourceDocumentId: sourceDoc.id,
              page: q.line,
              section: q.section,
              notes: sanitize(q.source) || "Mock OA 1 Merged",
              evidenceType: "PAPER_SCAN",
            },
          });

          existingSlugs.set(uniqueSlug, createdQuestion.id);
        } catch (err: any) {
          console.error(`Error importing ${q.id}:`, err?.message || err);
        }
      })
    );
  }

  console.log("\nAll items processed. Verifying complete database mapping...");

  // FULL VERIFICATION AUDIT
  const allDbQuestions = await prisma.question.findMany({
    where: { sourceDocument: docFileName },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      questionType: true,
      sourceType: true,
      sourcePage: true,
      solution: true,
      explanation: true,
      examples: true,
      topics: true,
    },
  });

  console.log(`Verified questions in DB for this source: ${allDbQuestions.length}`);

  // Map every source question to DB
  const finalMapping: any[] = [];
  const unmappedSourceIds: string[] = [];

  for (const q of rawInventory) {
    const qTextClean = sanitize(q.question_text);
    const cleanTitle = (qTextClean.slice(0, 90).replace(/^\[(.*?)\]/, "$1").replace(/[`]/g, "").trim() || "Question").slice(0, 87);
    const baseSlug = slugify(cleanTitle) || "question";
    const uniqueSlug = `mockoa1-${q.id.toLowerCase().replace(/_/g, "-")}-${baseSlug}`;

    const dbQ = allDbQuestions.find((dq) => dq.slug === uniqueSlug);
    if (dbQ) {
      finalMapping.push({
        sourceId: q.id,
        dbId: dbQ.id,
        slug: dbQ.slug,
        title: dbQ.title,
        sourceLine: q.line,
        category: dbQ.category,
        questionType: dbQ.questionType,
        sourceType: dbQ.sourceType,
        hasAnswer: Boolean(dbQ.solution),
        hasExplanation: Boolean(dbQ.explanation),
        hasOptions: Boolean(dbQ.examples),
      });
    } else {
      unmappedSourceIds.push(q.id);
    }
  }

  const auditReport = {
    totalRawFound: rawInventory.length,
    successfullyImported: finalMapping.length,
    failedImports: unmappedSourceIds.length,
    unmappedQuestions: unmappedSourceIds,
    missingFieldsCount: missingFields.length,
    missingFieldsDetails: missingFields,
  };

  const auditPath = "C:\\Users\\amanj\\.gemini\\antigravity-ide\\brain\\9c9576ac-0d08-4e8a-bfa8-b02c5f372869\\scratch\\step2_import_audit.json";
  fs.writeFileSync(auditPath, JSON.stringify(auditReport, null, 2), "utf-8");

  const fullMappingPath = "C:\\Users\\amanj\\.gemini\\antigravity-ide\\brain\\9c9576ac-0d08-4e8a-bfa8-b02c5f372869\\scratch\\source_to_db_mapping.json";
  fs.writeFileSync(fullMappingPath, JSON.stringify(finalMapping, null, 2), "utf-8");

  console.log("\n=== IMPORT AUDIT SUMMARY ===");
  console.log(`Raw questions found: ${auditReport.totalRawFound}`);
  console.log(`Successfully imported & verified in DB: ${auditReport.successfullyImported}`);
  console.log(`Failed imports: ${auditReport.failedImports}`);
  console.log(`Questions not imported: ${unmappedSourceIds.length}`);
}

main()
  .catch((e) => {
    console.error("FATAL ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
