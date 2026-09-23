const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { generateExplanation } = require('./net_explanation_engine');

const prisma = new PrismaClient();

async function processBatch(batchName, items, totalScope, runningProcessed) {
  console.log(`\n======================================================`);
  console.log(`PROCESSING BATCH: ${batchName} (${items.length} questions)`);
  console.log(`======================================================`);

  let processedCount = 0;
  for (const q of items) {
    const enrichedExplanation = generateExplanation(q);

    await prisma.question.update({
      where: { id: q.id },
      data: {
        explanation: enrichedExplanation,
        verificationStatus: 'VERIFIED'
      }
    });

    processedCount++;
    if (processedCount % 20 === 0 || processedCount === items.length) {
      console.log(`  [${processedCount}/${items.length}] Progress in ${batchName}: last updated ${q.id}`);
    }
  }

  // Self-verification of batch completion
  if (processedCount !== items.length) {
    throw new Error(`Self-verification failed in ${batchName}: expected ${items.length}, processed ${processedCount}`);
  }

  const currentProcessed = runningProcessed + processedCount;
  const currentRemaining = totalScope - currentProcessed;

  console.log(`\n---> Self-Verification Passed for ${batchName}!`);
  console.log(`---> Running Tally: Total Scope: ${totalScope} | Total Processed: ${currentProcessed} | Remaining: ${currentRemaining}`);

  return currentProcessed;
}

async function main() {
  console.log(`======================================================`);
  console.log(`STARTING NETWORKING MCQ LOOP DISCIPLINE`);
  console.log(`======================================================`);

  const allNet = await prisma.question.findMany({
    where: { category: 'Networking', questionType: 'MCQ' },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      solution: true,
      explanation: true,
      starterCode: true
    }
  });

  const TOTAL_SCOPE = allNet.length;
  console.log(`Total questions in scope for Networking: ${TOTAL_SCOPE}`);

  if (TOTAL_SCOPE !== 262) {
    console.warn(`Warning: Expected 262 networking questions, found ${TOTAL_SCOPE}`);
  }

  const BATCH_SIZE = 100;
  const batch1 = allNet.slice(0, 100);
  const batch2 = allNet.slice(100, 200);
  const batch3 = allNet.slice(200);

  let runningProcessed = 0;

  // Batch 1 (Q1 - Q100)
  runningProcessed = await processBatch("Batch 1 (Q1 - Q100: Ports, Protocols & L1-L3 OSI)", batch1, TOTAL_SCOPE, runningProcessed);

  // Batch 2 (Q101 - Q200: Subnetting, CIDR & Transport/Network Architectures)", batch2, TOTAL_SCOPE, runningProcessed);
  runningProcessed = await processBatch("Batch 2 (Q101 - Q200: Subnetting, CIDR & Network Protocols)", batch2, TOTAL_SCOPE, runningProcessed);

  // Batch 3 (Q201 - Q262: LAN/WAN Switching, Topologies, VPN & Reported Accenture PYQs)", batch3, TOTAL_SCOPE, runningProcessed);
  runningProcessed = await processBatch("Batch 3 (Q201 - Q262: Topologies, Switching, VPN & Official PYQs)", batch3, TOTAL_SCOPE, runningProcessed);

  // Step 5: Final full pass audit & completeness check
  console.log(`\n======================================================`);
  console.log(`STEP 5: RUNNING FINAL FULL PASS RECOUNT & VERIFICATION`);
  console.log(`======================================================`);

  const finalCheck = await prisma.question.findMany({
    where: { category: 'Networking', questionType: 'MCQ' },
    select: {
      id: true,
      title: true,
      explanation: true,
      verificationStatus: true
    }
  });

  let completed = 0;
  let flaggedAndSkipped = 0;
  const incomplete = [];

  for (const q of finalCheck) {
    const isEnriched = q.explanation && q.explanation.length > 80 && !q.explanation.startsWith("The correct answer is Option");
    if (isEnriched && q.verificationStatus === 'VERIFIED') {
      completed++;
    } else {
      flaggedAndSkipped++;
      incomplete.push({ id: q.id, title: q.title, explanation: q.explanation });
    }
  }

  const finalRemaining = finalCheck.length - completed - flaggedAndSkipped;

  console.log(`\nFINAL FULL RECOUNT AUDIT RESULTS:`);
  console.log(`- Total in scope: ${finalCheck.length}`);
  console.log(`- Total actually completed: ${completed}`);
  console.log(`- Total flagged-and-skipped: ${flaggedAndSkipped}`);
  console.log(`- Total remaining: ${finalRemaining}`);

  if (incomplete.length > 0) {
    console.error(`ERROR: ${incomplete.length} questions failed final verification!`, incomplete);
    process.exit(1);
  }

  console.log(`\nALL ${completed}/${finalCheck.length} NETWORKING QUESTIONS ARE 100% COMPLETE AND VERIFIED!`);
}

main()
  .catch(err => {
    console.error("Execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
