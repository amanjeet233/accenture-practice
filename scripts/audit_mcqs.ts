import { prisma } from "../src/lib/prisma";
import { formatMcqQuestion } from "../src/lib/mcqService";
import * as fs from "fs";

interface AuditResult {
  id: string;
  slug: string;
  title: string;
  category: string;
  sourceType: string;
  options: Record<string, string>;
  correctKey: string;
  correctAnswerText: string;
  status: "VERIFIED" | "NEEDS_VERIFICATION" | "SOURCE_CONFLICT" | "INVALID";
  issues: string[];
  rawStarterCode?: any;
  solution?: string | null;
  provenance?: any;
}

async function main() {
  console.log("Starting comprehensive audit of all MCQs in the database...\n");

  const mcqs = await prisma.question.findMany({
    where: { questionType: "MCQ" },
    include: {
      questionSources: {
        include: { sourceDocument: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Retrieved ${mcqs.length} MCQs from database.`);

  const results: AuditResult[] = [];
  const questionTextMap = new Map<string, { id: string; correctKey: string; correctAnswerText: string; title: string }[]>();

  let missingQuestionCount = 0;
  let missingOptionsCount = 0;
  let duplicateOptionsCount = 0;
  let invalidCorrectKeyCount = 0;
  let answerMismatchCount = 0;
  let missingAnswerCount = 0;
  let duplicateConflictCount = 0;

  for (let i = 0; i < mcqs.length; i++) {
    const q = mcqs[i];
    const issues: string[] = [];
    let status: "VERIFIED" | "NEEDS_VERIFICATION" | "SOURCE_CONFLICT" | "INVALID" = "VERIFIED";

    // 1. Parse using authoritative formatter
    const formatted = formatMcqQuestion(q, i + 1);

    // 2. Check A: Question text
    const cleanTitle = (formatted.stem || formatted.title || "").trim();
    if (!cleanTitle || cleanTitle.length < 5 || cleanTitle.toLowerCase() === "question" || cleanTitle.toLowerCase().includes("lorem ipsum")) {
      issues.push("Empty, placeholder, or invalid question text");
      missingQuestionCount++;
      status = "INVALID";
    }

    // 3. Check B: Options exist
    const opts = formatted.options;
    const optKeys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    const missingKeys = optKeys.filter((k) => !opts[k] || opts[k].trim().length === 0);
    if (missingKeys.length > 0) {
      issues.push(`Missing option(s): ${missingKeys.join(", ")}`);
      missingOptionsCount++;
      status = "INVALID";
    }

    // 4. Check C: Options uniqueness
    const seenTexts = new Map<string, string>();
    for (const k of optKeys) {
      const text = (opts[k] || "").trim().toLowerCase();
      if (text) {
        if (seenTexts.has(text)) {
          issues.push(`Duplicate option text between ${seenTexts.get(text)} and ${k}: "${opts[k]}"`);
          duplicateOptionsCount++;
          status = "INVALID";
        } else {
          seenTexts.set(text, k);
        }
      }
    }

    // 5. Check D: Correct Option Key
    const validKeys = ["A", "B", "C", "D"];
    if (!validKeys.includes(formatted.correctKey)) {
      issues.push(`Invalid correctKey: '${formatted.correctKey}'`);
      invalidCorrectKeyCount++;
      status = "INVALID";
    }

    // 6. Check E: Correct Answer Text matches Option text
    const expectedText = opts[formatted.correctKey as "A" | "B" | "C" | "D"] || "";
    const actualText = formatted.correctAnswerText || "";

    if (!expectedText) {
      issues.push(`Correct key ${formatted.correctKey} has empty option text`);
      missingAnswerCount++;
      status = "INVALID";
    } else if (
      expectedText.trim().toLowerCase() !== actualText.trim().toLowerCase() &&
      !expectedText.trim().toLowerCase().includes(actualText.trim().toLowerCase()) &&
      !actualText.trim().toLowerCase().includes(expectedText.trim().toLowerCase())
    ) {
      issues.push(`Answer text mismatch: Option ${formatted.correctKey} is "${expectedText}" but correctAnswerText is "${actualText}"`);
      answerMismatchCount++;
      status = "INVALID";
    }

    // 7. Check F: StarterCode validation & Source consistency
    let starter: any = null;
    if (q.starterCode) {
      try {
        starter = JSON.parse(q.starterCode);
        if (starter.verificationStatus === "SOURCE_CONFLICT") {
          status = "SOURCE_CONFLICT";
          issues.push("Flagged in source as SOURCE_CONFLICT");
        } else if (starter.verificationStatus === "NEEDS_VERIFICATION") {
          if (status !== "INVALID") status = "NEEDS_VERIFICATION";
        }
      } catch (e) {
        issues.push("Corrupted starterCode JSON");
        status = "INVALID";
      }
    } else {
      if (status !== "INVALID") {
        status = "NEEDS_VERIFICATION";
      }
    }

    // 8. Duplicate Question Tracking
    const normStem = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
    if (!questionTextMap.has(normStem)) {
      questionTextMap.set(normStem, []);
    }
    questionTextMap.get(normStem)!.push({
      id: q.id,
      correctKey: formatted.correctKey,
      correctAnswerText: formatted.correctAnswerText,
      title: cleanTitle,
    });

    results.push({
      id: q.id,
      slug: q.slug,
      title: cleanTitle,
      category: q.category || "General",
      sourceType: q.sourceType,
      options: opts,
      correctKey: formatted.correctKey,
      correctAnswerText: formatted.correctAnswerText,
      status,
      issues,
      rawStarterCode: starter,
      solution: q.solution,
      provenance: q.questionSources,
    });
  }

  // Check duplicate conflicts
  const duplicateConflicts: any[] = [];
  for (const [stem, list] of questionTextMap.entries()) {
    if (list.length > 1) {
      // Check if different answers
      const uniqueAnswers = new Set(list.map((item) => item.correctAnswerText.toLowerCase().trim()));
      if (uniqueAnswers.size > 1) {
        duplicateConflictCount++;
        duplicateConflicts.push({
          stem,
          questions: list,
        });
        for (const item of list) {
          const res = results.find((r) => r.id === item.id);
          if (res) {
            res.issues.push(`Duplicate stem conflict: multiple questions with conflicting correct answers (${Array.from(uniqueAnswers).join(" vs ")})`);
            res.status = "SOURCE_CONFLICT";
          }
        }
      }
    }
  }

  // Answer distribution analysis
  const keyDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, OTHER: 0 };
  for (const r of results) {
    if (keyDist[r.correctKey] !== undefined) {
      keyDist[r.correctKey]++;
    } else {
      keyDist.OTHER++;
    }
  }

  // Status breakdown
  const statusCounts = {
    VERIFIED: results.filter((r) => r.status === "VERIFIED").length,
    NEEDS_VERIFICATION: results.filter((r) => r.status === "NEEDS_VERIFICATION").length,
    SOURCE_CONFLICT: results.filter((r) => r.status === "SOURCE_CONFLICT").length,
    INVALID: results.filter((r) => r.status === "INVALID").length,
  };

  console.log("\n===============================================================");
  console.log("INITIAL MCQ DATABASE AUDIT SUMMARY");
  console.log("===============================================================");
  console.log(`Total MCQs Audited:          ${mcqs.length}`);
  console.log(`- Verified:                  ${statusCounts.VERIFIED}`);
  console.log(`- Needs Verification:        ${statusCounts.NEEDS_VERIFICATION}`);
  console.log(`- Source Conflict:           ${statusCounts.SOURCE_CONFLICT}`);
  console.log(`- Invalid:                   ${statusCounts.INVALID}`);
  console.log("---------------------------------------------------------------");
  console.log(`Answer Distribution:         A: ${keyDist.A} (${Math.round((keyDist.A / mcqs.length) * 100)}%), B: ${keyDist.B} (${Math.round((keyDist.B / mcqs.length) * 100)}%), C: ${keyDist.C} (${Math.round((keyDist.C / mcqs.length) * 100)}%), D: ${keyDist.D} (${Math.round((keyDist.D / mcqs.length) * 100)}%)`);
  console.log("---------------------------------------------------------------");
  console.log(`Missing/Empty Questions:     ${missingQuestionCount}`);
  console.log(`Missing Options:             ${missingOptionsCount}`);
  console.log(`Duplicate Options:           ${duplicateOptionsCount}`);
  console.log(`Invalid Correct Key:         ${invalidCorrectKeyCount}`);
  console.log(`Answer Text Mismatches:      ${answerMismatchCount}`);
  console.log(`Missing Answer:              ${missingAnswerCount}`);
  console.log(`Duplicate Answer Conflicts:  ${duplicateConflictCount}`);
  console.log("===============================================================\n");

  const problematic = results.filter((r) => r.issues.length > 0);
  console.log(`Total questions with issues: ${problematic.length}`);
  if (problematic.length > 0) {
    console.log("\nSample of problematic questions (up to 15):");
    problematic.slice(0, 15).forEach((p, idx) => {
      console.log(`\n[${idx + 1}] ID: ${p.id} | Slug: ${p.slug}`);
      console.log(`    Title: ${p.title.slice(0, 80)}...`);
      console.log(`    Category: ${p.category} | Key: ${p.correctKey} | Answer: "${p.correctAnswerText}"`);
      console.log(`    Options: A="${p.options.A}" | B="${p.options.B}" | C="${p.options.C}" | D="${p.options.D}"`);
      console.log(`    Issues: ${p.issues.join("; ")}`);
    });
  }

  // Save audit data for detailed reporting
  fs.writeFileSync("scripts/mcq_audit_results.json", JSON.stringify({ summary: statusCounts, keyDist, problematic, allCount: results.length }, null, 2));
  console.log("\nSaved detailed audit dump to scripts/mcq_audit_results.json");
}

main().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
