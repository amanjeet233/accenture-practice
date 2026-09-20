import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Helper to sanitize slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 45);
}

async function main() {
  console.log("=== STEP 2: IMPORT COMPLETE QUESTION BANK ===");

  // 1. Read the Step 1 question inventory
  const inventoryPath = "C:\\Users\\amanj\\.gemini\\antigravity-ide\\brain\\9c9576ac-0d08-4e8a-bfa8-b02c5f372869\\scratch\\question_inventory.json";
  if (!fs.existsSync(inventoryPath)) {
    throw new Error(`Inventory file not found at: ${inventoryPath}`);
  }

  const rawInventory = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));
  console.log(`Loaded ${rawInventory.length} questions from inventory.`);

  if (rawInventory.length !== 602) {
    console.warn(`WARNING: Inventory has ${rawInventory.length} questions (expected 602).`);
  }

  // 2. Fetch or create Company "Accenture"
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
  console.log(`Company Accenture ID: ${accentureCompany.id}`);

  // 3. Create or find SourceDocument for "Accenture MOCK OA -1-merged---.md"
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
        description:
          "Complete question bank audited from Accenture MOCK OA -1-merged---.md containing 602 raw questions across Common Applications, Networking, Security, Cloud, Pseudocode, and Coding.",
      },
    });
    console.log(`Created SourceDocument: ${sourceDoc.id}`);
  } else {
    console.log(`Found existing SourceDocument: ${sourceDoc.id}`);
  }

  // 4. Calculate frequency of duplicate question stems
  const stemCounts = new Map<string, number>();
  for (const q of rawInventory) {
    const norm = q.question_text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();
    stemCounts.set(norm, (stemCounts.get(norm) || 0) + 1);
  }

  // 5. Prepare questions for import
  const importResults = {
    rawCount: rawInventory.length,
    successCount: 0,
    failedCount: 0,
    missingFields: [] as Array<{ id: string; missing: string[] }>,
    createdIds: [] as string[],
    failedIds: [] as Array<{ id: string; error: string }>,
    mapping: [] as Array<{
      inventoryId: string;
      dbId: string;
      slug: string;
      title: string;
      sourceType: string;
      category: string;
      questionType: string;
      hasAnswer: boolean;
      sourceLine: number;
    }>,
  };

  // Perform import in batches to ensure transaction safety and performance
  const BATCH_SIZE = 50;
  for (let i = 0; i < rawInventory.length; i += BATCH_SIZE) {
    const batch = rawInventory.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(rawInventory.length / BATCH_SIZE)} (items ${i + 1} to ${i + batch.length})...`);

    for (const q of batch) {
      try {
        // Missing fields check
        const missing: string[] = [];
        if (!q.question_text || q.question_text.trim() === "") missing.push("question_text");
        if (!q.category) missing.push("category");
        if (!q.subcategory) missing.push("subcategory");
        if (q.line === undefined || q.line === null) missing.push("line");

        if (missing.length > 0) {
          importResults.missingFields.push({ id: q.id, missing });
        }

        // Determine source classification:
        // PDF_SOURCE, ACCENTURE_PATTERN, GENERAL_PRACTICE, USER_REPORTED, CANDIDATE_REPORTED, UNVERIFIED
        let sourceType = "PDF_SOURCE";
        if (q.section.includes("5C: Accenture Coding Questions and Solution 2024")) {
          sourceType = "CANDIDATE_REPORTED"; // explicitly cites: (Asked in Accenture OnCampus 10 Aug 2022, Slot 2/3)
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

        // Determine question type: MCQ, CODING, PSEUDOCODE
        let questionType = "MCQ";
        if (q.category === "Coding & Problem Solving") {
          questionType = "CODING";
        } else if (q.category === "Pseudocode") {
          questionType = Object.keys(q.options || {}).length > 0 ? "MCQ" : "CODING";
        } else {
          questionType = "MCQ";
        }

        // Determine difficulty
        let difficulty = "MEDIUM";
        if (q.category === "Common Applications & MS Office") {
          difficulty = "EASY";
        } else if (q.category === "Coding & Problem Solving") {
          if (q.subcategory.includes("Advanced") || q.subcategory.includes("Dynamic Programming") || q.subcategory.includes("Graph")) {
            difficulty = "HARD";
          } else {
            difficulty = "MEDIUM";
          }
        } else if (q.category === "Pseudocode") {
          difficulty = "MEDIUM";
        }

        // Generate clean title
        let cleanTitle = q.question_text.slice(0, 90).trim();
        if (cleanTitle.startsWith("[")) {
          const match = cleanTitle.match(/^\[(.*?)\]/);
          if (match) cleanTitle = match[1];
        }
        // Remove code block backticks from title
        cleanTitle = cleanTitle.replace(/[`]/g, "").trim();
        if (cleanTitle.length > 90) cleanTitle = cleanTitle.slice(0, 87) + "...";

        // Generate guaranteed unique slug
        const baseSlug = slugify(cleanTitle) || "question";
        const uniqueSlug = `mockoa1-${q.id.toLowerCase().replace(/_/g, "-")}-${baseSlug}`;

        // Format description
        let fullDescription = q.question_text;
        const optionsKeys = Object.keys(q.options || {});
        if (optionsKeys.length > 0) {
          fullDescription += "\n\n### Options\n";
          for (const k of ["A", "B", "C", "D", "E"]) {
            if (q.options[k]) {
              fullDescription += `- **${k})** ${q.options[k]}\n`;
            }
          }
        }

        // Frequency of duplicate
        const normStem = q.question_text.toLowerCase().replace(/[^\w\s]/g, "").trim();
        const freq = stemCounts.get(normStem) || 1;

        // Upsert into Question table using slug
        const createdQuestion = await prisma.question.upsert({
          where: { slug: uniqueSlug },
          update: {
            title: cleanTitle,
            description: fullDescription,
            difficulty,
            questionType,
            sourceType,
            category: q.category,
            verificationStatus: "UNVERIFIED",
            frequency: freq,
            solution: q.answer || null,
            explanation: q.explanation || null,
            topics: JSON.stringify([q.subcategory, q.category]),
            companies: JSON.stringify(["Accenture"]),
            examples: optionsKeys.length > 0 ? JSON.stringify(q.options) : null,
            sourceDocument: docFileName,
            sourcePage: q.line,
            sourceShift: q.section,
            importance: q.section.includes("Advanced") || q.section.includes("Technical Round") ? "HIGH" : "MEDIUM",
            importanceReason: q.questionable ? "Questionable source answer/options" : "Imported from Accenture MOCK OA - 1 Merged Question Bank",
          },
          create: {
            title: cleanTitle,
            slug: uniqueSlug,
            description: fullDescription,
            difficulty,
            questionType,
            sourceType,
            category: q.category,
            verificationStatus: "UNVERIFIED",
            frequency: freq,
            solution: q.answer || null,
            explanation: q.explanation || null,
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

        // Link to QuestionCompany (Accenture)
        await prisma.questionCompany.upsert({
          where: {
            questionId_companyId: {
              questionId: createdQuestion.id,
              companyId: accentureCompany.id,
            },
          },
          update: {},
          create: {
            questionId: createdQuestion.id,
            companyId: accentureCompany.id,
          },
        });

        // Link to QuestionSource (SourceDocument)
        const existingSource = await prisma.questionSource.findFirst({
          where: {
            questionId: createdQuestion.id,
            sourceDocumentId: sourceDoc.id,
          },
        });

        if (!existingSource) {
          await prisma.questionSource.create({
            data: {
              questionId: createdQuestion.id,
              sourceDocumentId: sourceDoc.id,
              page: q.line,
              section: q.section,
              notes: q.source || "Mock OA 1 Merged",
              evidenceType: "PAPER_SCAN",
            },
          });
        }

        importResults.successCount++;
        importResults.createdIds.push(createdQuestion.id);
        importResults.mapping.push({
          inventoryId: q.id,
          dbId: createdQuestion.id,
          slug: createdQuestion.slug,
          title: cleanTitle,
          sourceType,
          category: q.category,
          questionType,
          hasAnswer: Boolean(q.answer),
          sourceLine: q.line,
        });
      } catch (err: any) {
        importResults.failedCount++;
        importResults.failedIds.push({ id: q.id, error: err?.message || String(err) });
        console.error(`Failed to import question ${q.id}:`, err);
      }
    }
  }

  // 6. Save mapping & audit output
  const auditPath = "C:\\Users\\amanj\\.gemini\\antigravity-ide\\brain\\9c9576ac-0d08-4e8a-bfa8-b02c5f372869\\scratch\\import_audit_results.json";
  fs.writeFileSync(auditPath, JSON.stringify(importResults, null, 2), "utf-8");
  console.log(`\nImport completed! Audit log saved to: ${auditPath}`);
  console.log(`Raw questions found: ${importResults.rawCount}`);
  console.log(`Successfully imported: ${importResults.successCount}`);
  console.log(`Failed imports: ${importResults.failedCount}`);
  console.log(`Missing required fields: ${importResults.missingFields.length}`);
}

main()
  .catch((e) => {
    console.error("FATAL ERROR IN IMPORT:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
