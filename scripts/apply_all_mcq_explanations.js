const { PrismaClient } = require('@prisma/client');
const { resolveQuestionExplanation } = require('./enhanced_mcq_resolver');

const prisma = new PrismaClient();

const CATEGORIES = [
  'Networking',
  'Cloud Computing',
  'Cybersecurity',
  'Pseudocode',
  'Computer Fundamentals',
  'DevOps',
  'DBMS',
  'SQL',
  'Java / OOP',
  'MS Office'
];

async function processCategoryBatch(category, batchNumber, totalScope, runningProcessed, resultsTracker) {
  console.log(`\n============================================================`);
  console.log(`[BATCH ${batchNumber}/10] PROCESSING TOPIC: ${category}`);
  console.log(`============================================================`);

  const questions = await prisma.question.findMany({
    where: { questionType: 'MCQ', category },
    select: {
      id: true,
      category: true,
      title: true,
      description: true,
      starterCode: true,
      solution: true,
      explanation: true
    }
  });

  const batchTotal = questions.length;
  let rewritten = 0;
  let alreadyGood = 0;
  let flagged = 0;
  const samples = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const res = resolveQuestionExplanation(q);

    // Forbidden artifacts verification check
    const hasHeader = /^###+\s+/m.test(res.text);
    const hasBold = /\*\*.*?\*\*/.test(res.text);
    const hasFiller = res.text.includes('duty') && res.text.includes('Option');

    if (hasHeader || hasBold || hasFiller) {
      flagged++;
      console.warn(`  [FLAGGED] ${q.id}: ${res.text}`);
      continue;
    }

    if (res.type === 'ALREADY_GOOD') {
      alreadyGood++;
    } else {
      rewritten++;
    }

    // Update in database with clean plain-text explanation
    await prisma.question.update({
      where: { id: q.id },
      data: {
        explanation: res.text,
        verificationStatus: 'VERIFIED'
      }
    });

    if (samples.length < 5) {
      samples.push({
        id: q.id,
        title: q.title,
        solution: q.solution,
        type: res.type,
        explanation: res.text
      });
    }

    if ((i + 1) % 50 === 0 || i === questions.length - 1) {
      console.log(`  Processed ${i + 1}/${batchTotal} questions in ${category}...`);
    }
  }

  // Self-verification
  const finished = rewritten + alreadyGood + flagged;
  if (finished !== batchTotal) {
    throw new Error(`Self-verification failed for ${category}: expected ${batchTotal}, finished ${finished}`);
  }

  const currentProcessed = runningProcessed + finished;
  const currentRemaining = totalScope - currentProcessed;

  console.log(`---> Batch ${batchNumber} (${category}) Completed & Verified!`);
  console.log(`---> Batch Summary: Total: ${batchTotal} | Rewritten: ${rewritten} | Already-Good: ${alreadyGood} | Flagged: ${flagged}`);
  console.log(`---> Running Tally: Total Scope: ${totalScope} | Total Processed: ${currentProcessed} | Total Remaining: ${currentRemaining}`);

  resultsTracker.push({
    batchNumber,
    topic: category,
    total: batchTotal,
    rewritten,
    alreadyGood,
    flagged,
    samples
  });

  return currentProcessed;
}

async function main() {
  const TOTAL_SCOPE = 2610;
  let runningProcessed = 0;
  const resultsTracker = [];

  console.log(`Starting MCQ Explanations Rewriting Pipeline with Strict Loop Discipline`);
  console.log(`Total Scope: ${TOTAL_SCOPE} questions across ${CATEGORIES.length} topics.\n`);

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    runningProcessed = await processCategoryBatch(cat, i + 1, TOTAL_SCOPE, runningProcessed, resultsTracker);
  }

  console.log(`\n============================================================`);
  console.log(`STEP 5: RUNNING FINAL FULL PASS RECOUNT ACROSS ALL TOPICS`);
  console.log(`============================================================`);

  const allMcqs = await prisma.question.findMany({
    where: { questionType: 'MCQ' },
    select: {
      id: true,
      category: true,
      explanation: true
    }
  });

  const finalTotal = allMcqs.length;
  let finalClean = 0;
  let finalCorrupted = 0;

  for (const q of allMcqs) {
    const hasHeader = /^###+\s+/m.test(q.explanation || "");
    const hasBold = /\*\*.*?\*\*/.test(q.explanation || "");
    const hasBullets = /^[-*•]\s+/m.test(q.explanation || "");
    const hasFiller = (q.explanation || "").includes("duty") && (q.explanation || "").includes("Option");

    if (hasHeader || hasBold || hasBullets || hasFiller || !q.explanation || q.explanation.length < 10) {
      finalCorrupted++;
      console.error(`Invalid explanation on recount: ${q.id} (${q.category}): ${q.explanation}`);
    } else {
      finalClean++;
    }
  }

  console.log(`\nFINAL RECOUNT AUDIT:`);
  console.log(`- Total in scope: ${finalTotal}`);
  console.log(`- Total clean & verified: ${finalClean}`);
  console.log(`- Total corrupted / invalid: ${finalCorrupted}`);
  console.log(`- Total remaining: ${finalTotal - finalClean - finalCorrupted}`);

  if (finalCorrupted > 0 || finalClean !== TOTAL_SCOPE) {
    console.error(`FAILED: Final recount did not reconcile to 0 remaining!`);
    process.exit(1);
  } else {
    console.log(`\nSUCCESS: 100% of all ${finalClean} MCQ questions are cleanly rewritten, verified, and reconciled!`);
    require('fs').writeFileSync('scripts/mcq_rewrite_results.json', JSON.stringify(resultsTracker, null, 2));
  }
}

main()
  .catch((err) => {
    console.error("Execution error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
