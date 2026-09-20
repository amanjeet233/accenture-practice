import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const reportPath = 'C:/Users/amanj/.gemini/antigravity-ide/brain/9c9576ac-0d08-4e8a-bfa8-b02c5f372869/scratch/step4_classification_report.json';
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  console.log(`=== SYNCING STEP 4 CLASSIFICATIONS TO DATABASE (FAST BATCHED) ===`);
  console.log(`Total questions to update: ${report.total_unique_questions}`);

  const questions = report.classified_questions;
  const chunkSize = 25;
  let completed = 0;

  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunk = questions.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map((q: any) => {
        let verStatus = 'UNVERIFIED';
        if (q.classification === 'SOURCE_INCONSISTENT') verStatus = 'SOURCE_INCONSISTENT';
        else if (q.classification === 'ACCENTURE_SHIFT_REPORTED') verStatus = 'SHIFT_REPORTED';
        else if (q.classification === 'ACCENTURE_REPORTED') verStatus = 'CANDIDATE_REPORTED';
        else if (q.classification === 'ACCENTURE_PATTERN') verStatus = 'PATTERN_VERIFIED';
        else if (q.classification === 'MOCK_SOURCE') verStatus = 'MOCK_SOURCE';
        else if (q.classification === 'GENERAL_PRACTICE') verStatus = 'GENERAL_PRACTICE';

        return prisma.question.update({
          where: { id: q.dbId },
          data: {
            sourceType: q.classification,
            verificationStatus: verStatus,
            importanceReason: q.reason
          }
        });
      })
    );
    completed += chunk.length;
    console.log(`Updated ${completed}/${questions.length} questions...`);
  }

  console.log(`Successfully synced all ${completed} question classifications in PostgreSQL.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
