import { PrismaClient } from "@prisma/client";
import { accenture2021_2022Questions } from "../scratch/master_inventory/accenture_2021_2022";
import { accentureHireproMncQuestions } from "../scratch/master_inventory/accenture_hirepro_mnc";
import { accentureShiftsAndCampusQuestions } from "../scratch/master_inventory/accenture_shifts_and_campus";
import { generalSqlQuestions } from "../scratch/master_inventory/general_sql_inventory";
import { generalDsaAndFrontendQuestions } from "../scratch/master_inventory/general_dsa_and_frontend";
import { MasterQuestionData } from "../scratch/master_inventory/types";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("MASTER QUESTION BANK INGESTION PIPELINE");
  console.log("==================================================");

  // 1. Topic & Company caches
  const allTopics = await prisma.topic.findMany();
  const topicMap = new Map(allTopics.map((t) => [t.slug, t.id]));

  const allCompanies = await prisma.company.findMany();
  const companyMap = new Map(allCompanies.map((c) => [c.slug, c.id]));

  // Ensure default SourceDocuments exist
  const sourceDocCache = new Map<string, string>();
  const existingDocs = await prisma.sourceDocument.findMany();
  for (const d of existingDocs) {
    if (d.fileName) sourceDocCache.set(d.fileName, d.id);
  }

  async function getOrCreateSourceDoc(fileName: string, title: string): Promise<string> {
    if (sourceDocCache.has(fileName)) return sourceDocCache.get(fileName)!;
    const doc = await prisma.sourceDocument.create({
      data: {
        title,
        fileName,
        company: "Accenture",
        verificationStatus: "OFFICIALLY_VERIFIED",
        description: `Source archive document: ${title}`,
      },
    });
    sourceDocCache.set(fileName, doc.id);
    return doc.id;
  }

  let totalProcessed = 0;
  let duplicatesMerged = 0;
  let newlyCreated = 0;

  // 2. Ingest Question Helper
  async function ingestQuestion(q: MasterQuestionData) {
    totalProcessed++;
    const existing = await prisma.question.findUnique({
      where: { slug: q.slug },
      include: { questionSources: true, questionTopics: true, questionCompanies: true },
    });

    let sourceDocId: string | undefined = undefined;
    if (q.sourceDocFileName) {
      sourceDocId = await getOrCreateSourceDoc(q.sourceDocFileName, q.sourceDocTitle || q.sourceDocFileName);
    }

    if (existing) {
      duplicatesMerged++;
      console.log(`[MERGING DUPLICATE] Existing: "${existing.title}" (${existing.slug}) -> Updating provenance and canonical fields.`);
      
      // Update canonical fields
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          category: q.category,
          verificationStatus: q.verificationStatus,
          importance: q.importance,
          importanceReason: q.importanceReason || existing.importanceReason,
          javaSolution: q.javaSolution || existing.javaSolution,
          sqlSolution: q.sqlSolution || existing.sqlSolution,
          approach: q.approach || existing.approach,
          commonMistakes: q.commonMistakes || existing.commonMistakes,
          frequency: { increment: 1 },
          ...(q.sqlExpectedQuery ? { sqlExpectedQuery: q.sqlExpectedQuery } : {}),
          ...(q.sqlSchemaSql ? { sqlSchemaSql: q.sqlSchemaSql } : {}),
          ...(q.sqlSeedData ? { sqlSeedData: q.sqlSeedData } : {}),
        },
      });

      // Add source record if doc exists
      if (sourceDocId) {
        const hasSource = existing.questionSources.some((s) => s.sourceDocumentId === sourceDocId);
        if (!hasSource) {
          await prisma.questionSource.create({
            data: {
              questionId: existing.id,
              sourceDocumentId: sourceDocId,
              page: q.sourcePage,
              shift: q.sourceShift,
              date: q.sourceDate ? new Date(q.sourceDate) : undefined,
              section: q.sourceSection,
              evidenceType: "SOURCE_DOCUMENT",
              notes: q.sourceNotes,
            },
          });
        }
      }
      return;
    }

    // Connect topics
    const topicConnect = q.topicSlugs
      .map((slug) => topicMap.get(slug))
      .filter(Boolean)
      .map((id) => ({ topicId: id! }));

    // Connect companies
    const companyConnect = q.companySlugs
      .map((slug) => companyMap.get(slug))
      .filter(Boolean)
      .map((id) => ({ companyId: id! }));

    // Default starter code
    const defaultStarterCode: Record<string, string> = {};
    if (q.questionType === "CODING") {
      defaultStarterCode["java"] = `public class Solution {\n    // Implement your solution here\n}`;
      defaultStarterCode["javascript"] = `function solution() {\n  // Write your code here\n}`;
      defaultStarterCode["python"] = `def solution():\n    pass`;
    }

    const created = await prisma.question.create({
      data: {
        title: q.title,
        slug: q.slug,
        description: q.description,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        constraints: q.constraints,
        difficulty: q.difficulty,
        questionType: q.questionType,
        sourceType: q.sourceType,
        category: q.category,
        importance: q.importance,
        importanceReason: q.importanceReason,
        verificationStatus: q.verificationStatus,
        frequency: q.frequency || 1,
        topics: JSON.stringify(q.topicSlugs),
        companies: JSON.stringify(q.companySlugs),
        starterCode: JSON.stringify(defaultStarterCode),
        solution: q.javaSolution || q.sqlSolution,
        javaSolution: q.javaSolution,
        sqlSolution: q.sqlSolution,
        approach: q.approach,
        commonMistakes: q.commonMistakes,
        explanation: q.approach,
        hints: JSON.stringify(q.hints),
        examples: JSON.stringify(q.examples),
        testCases: JSON.stringify(q.testCases),
        sqlSchemaSql: q.sqlSchemaSql,
        sqlSeedData: q.sqlSeedData,
        sqlExpectedQuery: q.sqlExpectedQuery,
        htmlTemplate: q.htmlTemplate,
        cssTemplate: q.cssTemplate,
        jsTemplate: q.jsTemplate,

        examplesList: {
          create: q.examples.map((ex, idx) => ({
            input: ex.input,
            output: ex.output,
            explanation: ex.explanation,
            orderIndex: idx,
          })),
        },
        testCasesList: {
          create: q.testCases.map((tc, idx) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden || false,
            orderIndex: idx,
          })),
        },
        hintsList: {
          create: q.hints.map((h, idx) => ({
            content: h,
            orderIndex: idx,
          })),
        },
        solutionsList: q.javaSolution
          ? {
              create: [
                {
                  language: "java",
                  code: q.javaSolution,
                  approach: "Optimal Java 21 Solution",
                },
              ],
            }
          : q.sqlSolution
          ? {
              create: [
                {
                  language: "sql",
                  code: q.sqlSolution,
                  approach: "Validated SQL Solution",
                },
              ],
            }
          : undefined,
        questionTopics: { create: topicConnect },
        questionCompanies: { create: companyConnect },
        ...(sourceDocId
          ? {
              questionSources: {
                create: [
                  {
                    sourceDocumentId: sourceDocId,
                    page: q.sourcePage,
                    shift: q.sourceShift,
                    date: q.sourceDate ? new Date(q.sourceDate) : undefined,
                    section: q.sourceSection,
                    evidenceType: "SOURCE_DOCUMENT",
                    notes: q.sourceNotes,
                  },
                ],
              },
            }
          : {}),
      },
    });

    newlyCreated++;
    console.log(`[CREATED] (${q.category}) "${created.title}" [${created.slug}]`);
  }

  // 3. Ingest All Question Groups
  console.log("\n--- Group 1 & 2: Accenture 2021 & 2022 Reported Questions ---");
  for (const q of accenture2021_2022Questions) await ingestQuestion(q);

  console.log("\n--- Group 3: Accenture HirePro Section (Pages 3-54) ---");
  for (const q of accentureHireproMncQuestions) await ingestQuestion(q);

  console.log("\n--- Group 4, 5, 6, 7: Accenture Shifts, Campus & Patterns ---");
  for (const q of accentureShiftsAndCampusQuestions) await ingestQuestion(q);

  console.log("\n--- Group 8 & 9: General SQL (Schema & Employee Collection) ---");
  for (const q of generalSqlQuestions) await ingestQuestion(q);

  console.log("\n--- Group 10 & 11: General Frontend & General DSA ---");
  for (const q of generalDsaAndFrontendQuestions) await ingestQuestion(q);

  // 4. Update the remaining 20 original questions with their exact canonical category
  console.log("\n--- Canonicalizing Categories for Original 20 Questions ---");
  const categoryFixes: Record<string, string> = {
    "binary-string-operations-evaluator": "ACCENTURE_REPORTED",
    "rat-food-distribution-sufficiency": "ACCENTURE_REPORTED",
    "superior-elements-in-an-array": "ACCENTURE_PATTERN",
    "second-highest-salary-with-ties": "GENERAL_SQL",
    "interactive-counter-with-step-control": "GENERAL_FRONTEND",
    "smallest-number-in-an-array": "ACCENTURE_REPORTED",
    "difference-of-sums-in-range": "ACCENTURE_REPORTED",
    "large-small-sum": "ACCENTURE_REPORTED",
    "find-duplicate-emails-or-records": "GENERAL_SQL",
    "employees-earning-more-than-managers": "GENERAL_SQL",
    "customers-who-never-order": "GENERAL_SQL",
    "array-formulaic-transformation-sum": "ACCENTURE_REPORTED",
    "prefix-number-summation-eqsum": "ACCENTURE_REPORTED",
    "interactive-textarea-counter-limit": "ACCENTURE_REPORTED",
    "support-ticket-sla-resolution-metrics": "ACCENTURE_REPORTED",
    "first-last-character-inward-combination": "ACCENTURE_REPORTED",
    "product-search-filter-data-attributes": "GENERAL_FRONTEND",
    "action-movie-high-rating-watchers-over-25": "GENERAL_SQL",
    "heavy-watch-time-streaming-titles": "GENERAL_SQL",
    "minimum-coins-for-target-amount": "ACCENTURE_PATTERN",
  };

  for (const [slug, cat] of Object.entries(categoryFixes)) {
    await prisma.question.updateMany({
      where: { slug },
      data: { category: cat },
    });
  }

  // 5. Final Database Audit Counts
  const [
    totalCount,
    pyqCount,
    reportedCount,
    patternCount,
    generalDsaCount,
    generalSqlCount,
    generalFrontendCount,
    sourcesCount,
  ] = await Promise.all([
    prisma.question.count(),
    prisma.question.count({ where: { category: "ACCENTURE_PYQ" } }),
    prisma.question.count({ where: { category: "ACCENTURE_REPORTED" } }),
    prisma.question.count({ where: { category: "ACCENTURE_PATTERN" } }),
    prisma.question.count({ where: { category: "GENERAL_DSA" } }),
    prisma.question.count({ where: { category: "GENERAL_SQL" } }),
    prisma.question.count({ where: { category: "GENERAL_FRONTEND" } }),
    prisma.questionSource.count(),
  ]);

  console.log("\n==================================================");
  console.log("FINAL INGESTION DATABASE AUDIT REPORT");
  console.log("==================================================");
  console.log(`Total Unique Questions:     ${totalCount}`);
  console.log(`Accenture PYQ:             ${pyqCount}`);
  console.log(`Accenture Reported:        ${reportedCount}`);
  console.log(`Accenture Pattern:         ${patternCount}`);
  console.log(`General DSA:               ${generalDsaCount}`);
  console.log(`General SQL:               ${generalSqlCount}`);
  console.log(`General Frontend:          ${generalFrontendCount}`);
  console.log(`Total Source References:   ${sourcesCount}`);
  console.log(`Duplicates Merged:         ${duplicatesMerged}`);
  console.log(`Newly Created:             ${newlyCreated}`);
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
