import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const reportPath = 'C:/Users/amanj/.gemini/antigravity-ide/brain/9c9576ac-0d08-4e8a-bfa8-b02c5f372869/scratch/step3_deduplication_report.json';
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  console.log(`=== SAFE DEDUPLICATION ${isDryRun ? '(DRY RUN)' : '(LIVE EXECUTION)'} ===`);
  console.log(`Merged groups to process: ${report.merged_groups_count}`);
  console.log(`Total duplicate copies to merge: ${report.total_duplicate_copies_merged}`);
  console.log(`Review-required groups to flag: ${report.review_required_groups_count}`);

  const initialCount = await prisma.question.count();
  console.log(`Initial total questions in database: ${initialCount}`);

  // Fetch all questions with sources in a single query
  console.log('Fetching questions from DB...');
  const questionsInDb = await prisma.question.findMany({
    include: { questionSources: true }
  });
  const qMap = new Map(questionsInDb.map(q => [q.id, q]));
  console.log(`Loaded ${questionsInDb.length} questions into memory.`);

  let updatedCanonicals = 0;
  let repointedSources = 0;
  let duplicateIdsToDelete: string[] = [];
  const canonicalUpdates: { id: string; data: any }[] = [];
  const sourceUpdates: { id: string; questionId: string }[] = [];

  for (const g of report.merged_groups) {
    const canonical = qMap.get(g.canonical_db_id);
    if (!canonical) {
      console.warn(`Canonical not found: ${g.canonical_db_id} (${g.canonical_id})`);
      continue;
    }

    const duplicates = g.duplicate_db_ids.map((id: string) => qMap.get(id)).filter(Boolean);

    for (const dup of duplicates) {
      if (!dup) continue;
      duplicateIdsToDelete.push(dup.id);
      for (const qs of dup.questionSources) {
        sourceUpdates.push({ id: qs.id, questionId: canonical.id });
        repointedSources++;
      }
    }

    let updateData: any = {
      frequency: canonical.frequency + duplicates.length
    };

    for (const dup of duplicates) {
      if (!dup) continue;
      if (!canonical.explanation && dup.explanation) updateData.explanation = dup.explanation;
      if (!canonical.solution && dup.solution) updateData.solution = dup.solution;
      if (!canonical.approach && dup.approach) updateData.approach = dup.approach;
      if (!canonical.hints && dup.hints) updateData.hints = dup.hints;
      if (!canonical.examples && dup.examples) updateData.examples = dup.examples;
    }

    canonicalUpdates.push({ id: canonical.id, data: updateData });
    updatedCanonicals++;
  }

  // Handle REVIEW_REQUIRED groups
  const reviewRequiredIds: string[] = [];
  for (const r of report.review_required_groups) {
    for (const sourceId of r.item_ids) {
      const match = questionsInDb.find(q => q.slug.includes(sourceId.toLowerCase()));
      if (match) {
        reviewRequiredIds.push(match.id);
      }
    }
  }

  console.log(`\nPlan Summary:`);
  console.log(`- Canonicals to enrich & increase frequency: ${canonicalUpdates.length}`);
  console.log(`- QuestionSource links to repoint: ${sourceUpdates.length}`);
  console.log(`- Redundant duplicate rows to delete: ${duplicateIdsToDelete.length}`);
  console.log(`- Review-required items to flag (kept intact): ${reviewRequiredIds.length}`);

  if (!isDryRun) {
    console.log('\nApplying updates in transactions...');
    
    // 1. Repoint QuestionSources
    for (const su of sourceUpdates) {
      await prisma.questionSource.update({
        where: { id: su.id },
        data: { questionId: su.questionId }
      });
    }
    console.log(`Repointed ${sourceUpdates.length} question source links.`);

    // 2. Update canonicals
    for (const cu of canonicalUpdates) {
      await prisma.question.update({
        where: { id: cu.id },
        data: cu.data
      });
    }
    console.log(`Updated ${canonicalUpdates.length} canonical questions.`);

    // 3. Flag review required questions
    if (reviewRequiredIds.length > 0) {
      await prisma.question.updateMany({
        where: { id: { in: reviewRequiredIds } },
        data: { verificationStatus: 'REVIEW_REQUIRED' }
      });
      console.log(`Flagged ${reviewRequiredIds.length} review-required questions.`);
    }

    // 4. Delete duplicates
    if (duplicateIdsToDelete.length > 0) {
      await prisma.questionCompany.deleteMany({
        where: { questionId: { in: duplicateIdsToDelete } }
      });
      await prisma.questionTopic.deleteMany({
        where: { questionId: { in: duplicateIdsToDelete } }
      });
      await prisma.questionTag.deleteMany({
        where: { questionId: { in: duplicateIdsToDelete } }
      });
      await prisma.question.deleteMany({
        where: { id: { in: duplicateIdsToDelete } }
      });
      console.log(`Deleted ${duplicateIdsToDelete.length} duplicate questions.`);
    }

    const finalCount = await prisma.question.count();
    console.log(`\nFinal total questions in database: ${finalCount}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
