const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^mcq-[a-z0-9-]+:\s*/i, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  console.log("=== COMPREHENSIVE DB AUDIT VS ACCENTURE_MCQ_BANK.MD ===");

  const allDbMcqs = await prisma.question.findMany({
    where: { questionType: 'MCQ' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      solution: true,
      starterCode: true,
      explanation: true,
      createdAt: true
    }
  });
  console.log(`Total DB MCQs: ${allDbMcqs.length}`);

  const canonicalMcqs = allDbMcqs.filter(q => q.id.startsWith('mcq-'));
  const legacyMcqs = allDbMcqs.filter(q => !q.id.startsWith('mcq-'));
  console.log(`Canonical (mcq-*): ${canonicalMcqs.length}`);
  console.log(`Legacy (cuid): ${legacyMcqs.length}`);

  const canonicalJson = JSON.parse(fs.readFileSync('src/data/canonical_mcq_bank.json', 'utf8'));
  console.log(`Canonical JSON records: ${canonicalJson.length}`);

  // Map canonical questions
  const canonicalByNorm = new Map();
  const canonicalById = new Map();
  for (const c of canonicalMcqs) {
    canonicalById.set(c.id, c);
    const norm = normalize(c.title);
    canonicalByNorm.set(norm, c);
  }

  // 1. Audit canonical questions against canonicalJson (and Accenture_MCQ_Bank.md)
  let canonicalMismatches = 0;
  for (const cJson of canonicalJson) {
    const dbQ = canonicalById.get(cJson.id);
    if (!dbQ) {
      console.error(`MISSING IN DB: ${cJson.id}`);
      continue;
    }
    // Verify answer
    let dbAns = '';
    try {
      const sc = JSON.parse(dbQ.starterCode || '{}');
      dbAns = sc.correctAnswerText || '';
    } catch(e) {}
    if (normalize(dbAns) !== normalize(cJson.correctAnswerText)) {
      canonicalMismatches++;
      console.warn(`Mismatch in canonical ${cJson.id}: DB=${dbAns} vs JSON=${cJson.correctAnswerText}`);
    }
  }
  console.log(`Canonical DB vs Source JSON mismatches: ${canonicalMismatches} (0 is perfect)`);

  // 2. Classify legacy MCQs
  const matchedLegacy = [];
  const unmatchedLegacy = [];
  const conflictingAnswers = [];

  for (const leg of legacyMcqs) {
    const normTitle = normalize(leg.title);
    let matched = canonicalByNorm.get(normTitle);

    if (!matched && leg.description) {
      const descLine = normalize(leg.description.split('\n')[0]);
      matched = canonicalByNorm.get(descLine);
    }

    if (!matched) {
      // Try substring matching
      for (const [normC, c] of canonicalByNorm.entries()) {
        if (normTitle.length > 25 && normC.length > 25) {
          if (normTitle.includes(normC.slice(0, 30)) || normC.includes(normTitle.slice(0, 30))) {
            matched = c;
            break;
          }
        }
      }
    }

    let legAns = '';
    try {
      const sc = JSON.parse(leg.starterCode || '{}');
      legAns = sc.correctAnswerText || '';
    } catch(e) {}

    if (matched) {
      let canAns = '';
      try {
        const sc = JSON.parse(matched.starterCode || '{}');
        canAns = sc.correctAnswerText || '';
      } catch(e) {}

      const isConflict = legAns && canAns && normalize(legAns) !== normalize(canAns);
      if (isConflict) {
        conflictingAnswers.push({
          topic: matched.category,
          legacyId: leg.id,
          legacySlug: leg.slug,
          canonicalId: matched.id,
          question: leg.title,
          legacyAnswer: legAns,
          canonicalAnswer: canAns
        });
      }

      matchedLegacy.push({
        topic: matched.category,
        legacyId: leg.id,
        legacyTitle: leg.title,
        canonicalId: matched.id,
        canonicalTitle: matched.title,
        isConflict,
        legacyAnswer: legAns,
        canonicalAnswer: canAns
      });
    } else {
      unmatchedLegacy.push({
        id: leg.id,
        slug: leg.slug,
        title: leg.title,
        category: leg.category,
        answer: legAns
      });
    }
  }

  console.log(`\nLegacy questions breakdown:`);
  console.log(`- Matched to canonical bank (duplicates of canonicals): ${matchedLegacy.length}`);
  console.log(`  - Of which have conflicting (wrong legacy) answers: ${conflictingAnswers.length}`);
  console.log(`- Unmatched legacy (NOT_IN_SOURCE questions): ${unmatchedLegacy.length}`);

  const auditReport = {
    canonicalCount: canonicalMcqs.length,
    canonicalMismatches,
    legacyCount: legacyMcqs.length,
    matchedLegacyDuplicates: matchedLegacy.length,
    conflictingAnswersCount: conflictingAnswers.length,
    conflictingAnswers,
    unmatchedLegacyCount: unmatchedLegacy.length,
    unmatchedLegacy
  };

  fs.writeFileSync('scripts/audit_result.json', JSON.stringify(auditReport, null, 2));
  console.log('Saved audit report to scripts/audit_result.json');
}

run().catch(console.error).finally(() => prisma.$disconnect());
