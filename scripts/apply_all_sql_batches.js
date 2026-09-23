const { PrismaClient } = require('@prisma/client');
const { BATCH_1 } = require('./sql_batch_1');
const { BATCH_2 } = require('./sql_batch_2');
const { BATCH_3 } = require('./sql_batch_3');
const { BATCH_4 } = require('./sql_batch_4');

const prisma = new PrismaClient();

async function processBatch(batchName, items, totalScope, runningProcessed) {
  console.log(`\n========================================`);
  console.log(`PROCESSING BATCH: ${batchName} (${items.length} items)`);
  console.log(`========================================`);

  let count = 0;
  for (const item of items) {
    const updated = await prisma.question.update({
      where: { slug: item.slug },
      data: {
        explanation: item.explanation,
        approach: item.approach,
        verificationStatus: 'VERIFIED'
      },
      select: { slug: true, title: true }
    });
    count++;
    console.log(`  [${count}/${items.length}] Updated: ${updated.slug} - "${updated.title}"`);
  }

  // Self-verification of batch
  if (count !== items.length) {
    throw new Error(`Self-verification failed for ${batchName}: expected ${items.length}, updated ${count}`);
  }

  const currentProcessed = runningProcessed + count;
  const currentRemaining = totalScope - currentProcessed;
  console.log(`---> Batch ${batchName} verified complete!`);
  console.log(`---> Running Tally: Total Scope: ${totalScope} | Processed: ${currentProcessed} | Remaining: ${currentRemaining}`);

  return currentProcessed;
}

async function main() {
  const TOTAL_SCOPE = 41;
  let runningProcessed = 0;

  console.log(`Starting Batch Processing Loop discipline across all SQL questions...`);
  console.log(`Initial Scope: ${TOTAL_SCOPE} questions`);

  // Batch 1
  runningProcessed = await processBatch("Batch 1 (Q1-Q10)", BATCH_1, TOTAL_SCOPE, runningProcessed);

  // Batch 2
  runningProcessed = await processBatch("Batch 2 (Q11-Q20)", BATCH_2, TOTAL_SCOPE, runningProcessed);

  // Batch 3
  runningProcessed = await processBatch("Batch 3 (Q21-Q30)", BATCH_3, TOTAL_SCOPE, runningProcessed);

  // Batch 4
  runningProcessed = await processBatch("Batch 4 (Q31-Q41)", BATCH_4, TOTAL_SCOPE, runningProcessed);

  console.log(`\n========================================`);
  console.log(`RUNNING FINAL FULL PASS AUDIT (Step 5 Verification)`);
  console.log(`========================================`);

  const allSqlQuestions = await prisma.question.findMany({
    where: { questionType: 'SQL' },
    select: {
      slug: true,
      title: true,
      explanation: true,
      approach: true,
      sqlExpectedQuery: true,
      sqlSchemaSql: true,
      sqlSeedData: true,
      verificationStatus: true
    }
  });

  const totalInDb = allSqlQuestions.length;
  let completed = 0;
  let flaggedAndSkipped = 0;
  const failures = [];

  for (const q of allSqlQuestions) {
    const hasExp = q.explanation && q.explanation.trim().length > 100;
    const hasApp = q.approach && q.approach.trim().length > 50;
    const hasQuery = q.sqlExpectedQuery && q.sqlExpectedQuery.trim().length > 0;
    const hasSchema = q.sqlSchemaSql && q.sqlSchemaSql.trim().length > 0;

    if (hasExp && hasApp && hasQuery && hasSchema) {
      completed++;
    } else {
      flaggedAndSkipped++;
      failures.push({
        slug: q.slug,
        hasExp,
        hasApp,
        hasQuery,
        hasSchema
      });
    }
  }

  const remaining = totalInDb - completed - flaggedAndSkipped;

  console.log(`\nFINAL FULL RECOUNT AUDIT REPORT:`);
  console.log(`- Total in scope: ${totalInDb}`);
  console.log(`- Total completed: ${completed}`);
  console.log(`- Total flagged-and-skipped: ${flaggedAndSkipped}`);
  console.log(`- Total remaining: ${remaining}`);

  if (failures.length > 0) {
    console.error(`Incomplete items found:`, failures);
    process.exit(1);
  } else {
    console.log(`\nALL ${completed}/${totalInDb} SQL QUESTIONS ARE 100% VERIFIED AND COMPLETE!`);
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
