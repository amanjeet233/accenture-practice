import { PrismaClient } from "@prisma/client";
import { parseAccentureMcqBank } from "./parse_bank";
import { formatMcqQuestion, getAccentureMcqPracticeList } from "../src/lib/mcqService";
import { CANONICAL_TOPIC_LIST, resolveCanonicalTopic } from "../src/lib/canonicalTopics";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("=============================================================");
  console.log("=== COMPREHENSIVE POST-IMPORT SPOT-CHECK & VERIFICATION ===");
  console.log("=============================================================\n");

  const sourceFile = path.resolve(process.cwd(), "Accenture_MCQ_Bank.md");
  const parsed = parseAccentureMcqBank(sourceFile);
  const parsedMap = new Map(parsed.map((q) => [q.id, q]));

  const topics = [
    "MS Office",
    "Networking",
    "Cybersecurity",
    "Cloud Computing",
    "Pseudocode",
    "DevOps",
    "DBMS",
    "SQL",
    "Java / OOP",
    "Computer Fundamentals",
  ];

  let totalSpotChecked = 0;
  let totalMatches = 0;
  let mismatches = 0;

  console.log("--- PART 1: 10 SPOT-CHECKS PER TOPIC (100 TOTAL) ---");

  for (const topic of topics) {
    console.log(`\nChecking Topic: ${topic}...`);
    const topicQuestions = parsed.filter((q) => q.section === topic);

    // Pick 10 representative questions spread evenly (or first/middle/last)
    const indices = [
      0,
      1,
      Math.floor(topicQuestions.length * 0.1),
      Math.floor(topicQuestions.length * 0.25),
      Math.floor(topicQuestions.length * 0.4),
      Math.floor(topicQuestions.length * 0.5),
      Math.floor(topicQuestions.length * 0.65),
      Math.floor(topicQuestions.length * 0.8),
      Math.floor(topicQuestions.length * 0.9),
      topicQuestions.length - 1,
    ];
    const picked = Array.from(new Set(indices)).map((idx) => topicQuestions[idx]);

    for (const expected of picked) {
      totalSpotChecked++;
      const dbRow = await prisma.question.findUnique({
        where: { id: expected.id },
      });

      if (!dbRow) {
        console.error(`❌ FAIL: Question ${expected.id} not found in DB!`);
        mismatches++;
        continue;
      }

      // Format using app's mcqService formatter
      const rendered = formatMcqQuestion(dbRow, 1);

      // Verify fields
      const stemMatch = rendered.stem === expected.stem;
      const optAMatch = rendered.options.A === expected.options.A;
      const optBMatch = rendered.options.B === expected.options.B;
      const optCMatch = rendered.options.C === expected.options.C;
      const optDMatch = rendered.options.D === expected.options.D;
      const keyMatch = rendered.correctKey === expected.answerKey;
      const codeMatch = (rendered.codeBlock || null) === (expected.codeBlock || null);

      if (stemMatch && optAMatch && optBMatch && optCMatch && optDMatch && keyMatch && codeMatch) {
        totalMatches++;
        console.log(`  ✓ ${expected.id}: exact match (Answer: ${rendered.correctKey})`);
      } else {
        mismatches++;
        console.error(`  ❌ MISMATCH in ${expected.id}:`);
        if (!stemMatch) console.error(`    Stem expected: "${expected.stem}" vs got: "${rendered.stem}"`);
        if (!optAMatch) console.error(`    Opt A expected: "${expected.options.A}" vs got: "${rendered.options.A}"`);
        if (!optBMatch) console.error(`    Opt B expected: "${expected.options.B}" vs got: "${rendered.options.B}"`);
        if (!optCMatch) console.error(`    Opt C expected: "${expected.options.C}" vs got: "${rendered.options.C}"`);
        if (!optDMatch) console.error(`    Opt D expected: "${expected.options.D}" vs got: "${rendered.options.D}"`);
        if (!keyMatch) console.error(`    Key expected: "${expected.answerKey}" vs got: "${rendered.correctKey}"`);
        if (!codeMatch) console.error(`    Code expected: "${expected.codeBlock}" vs got: "${rendered.codeBlock}"`);
      }
    }
  }

  console.log(`\nSpot-check summary: ${totalMatches} / ${totalSpotChecked} matched exactly. Mismatches: ${mismatches}`);

  // Part 2: Verify CYB-S001 specifically
  console.log("\n--- PART 2: VERIFY CYB-S001 (PREVIOUS KNOWN CORRUPTED QUESTION) ---");
  const cyb = await prisma.question.findUnique({ where: { id: "CYB-S001" } });
  if (cyb) {
    const formatted = formatMcqQuestion(cyb, 1);
    console.log("CYB-S001 in DB:");
    console.log("  Stem:", formatted.stem);
    console.log("  Options:", formatted.options);
    console.log("  Correct Key:", formatted.correctKey);
    console.log("  Correct Answer Text:", formatted.correctAnswerText);
    if (formatted.correctKey === "C" && formatted.correctAnswerText === "HTTPS") {
      console.log("  ✓ CYB-S001 verified: Answer is HTTPS (Option C), NOT HTTP!");
    } else {
      console.error("  ❌ CYB-S001 FAILED!");
    }
  } else {
    console.error("  ❌ CYB-S001 not found!");
  }

  // Part 3: Verify Practice Navigation & Topic Filters
  console.log("\n--- PART 3: VERIFY PRACTICE NAVIGATION & COUNTERS ---");
  const canonicalMcqTopics = CANONICAL_TOPIC_LIST.filter(
    (t) => t.questionType === "MCQ" || t.questionType === "ANY"
  );

  for (const topicDef of canonicalMcqTopics) {
    // Only check topics that exist in MCQ bank
    const res = await getAccentureMcqPracticeList(topicDef.id, 1, 5000);
    const expectedCount = parsed.filter((q) => {
      const match = topicDef.dbCategories.some(
        (cat) => cat.toLowerCase() === q.section.toLowerCase()
      );
      return match;
    }).length;

    console.log(
      `Topic: ${topicDef.name} (${topicDef.slug}) -> Expected: ${expectedCount}, Actual: ${res.totalCount}`
    );
    if (expectedCount > 0 && res.totalCount !== expectedCount) {
      console.error(`  ❌ Count mismatch for ${topicDef.id}! Expected ${expectedCount}, got ${res.totalCount}`);
    } else if (expectedCount > 0) {
      console.log(`  ✓ Topic count matches exactly (${res.totalCount} questions).`);
    }
  }

  // All MCQs total count
  const allRes = await getAccentureMcqPracticeList(undefined, 1, 5000);
  console.log(`\nAll Practice MCQs Total: Expected 2610, Actual: ${allRes.totalCount}`);
  if (allRes.totalCount === 2610) {
    console.log("✓ Total practice list count is exactly 2,610!");
  } else {
    console.error(`❌ Total practice list count mismatch: ${allRes.totalCount}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
