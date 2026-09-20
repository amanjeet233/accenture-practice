import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseDate(val: any): Date | null | undefined {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const jsonPath = path.join(__dirname, 'exported_data.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error('exported_data.json not found!');
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  console.log('Starting migration to Supabase PostgreSQL...');

  // 1. Roles
  if (data.roles?.length) {
    console.log(`Migrating ${data.roles.length} roles...`);
    for (const r of data.roles) {
      await prisma.role.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          name: r.name,
          description: r.description,
          createdAt: parseDate(r.createdAt) || new Date(),
        },
      });
    }
  }

  // 2. Users
  if (data.users?.length) {
    console.log(`Migrating ${data.users.length} users...`);
    for (const u of data.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          roleId: u.roleId,
          avatarUrl: u.avatarUrl,
          createdAt: parseDate(u.createdAt) || new Date(),
          updatedAt: parseDate(u.updatedAt) || new Date(),
        },
      });
    }
  }

  // 3. Topics
  if (data.topics?.length) {
    console.log(`Migrating ${data.topics.length} topics...`);
    for (const t of data.topics) {
      await prisma.topic.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          name: t.name,
          slug: t.slug,
          category: t.category,
          description: t.description,
          createdAt: parseDate(t.createdAt) || new Date(),
        },
      });
    }
  }

  // 4. Companies
  if (data.companies?.length) {
    console.log(`Migrating ${data.companies.length} companies...`);
    for (const c of data.companies) {
      await prisma.company.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          logo: c.logo,
          description: c.description,
          createdAt: parseDate(c.createdAt) || new Date(),
        },
      });
    }
  }

  // 5. Tags
  if (data.tags?.length) {
    console.log(`Migrating ${data.tags.length} tags...`);
    for (const tg of data.tags) {
      await prisma.tag.upsert({
        where: { id: tg.id },
        update: {},
        create: {
          id: tg.id,
          name: tg.name,
          slug: tg.slug,
        },
      });
    }
  }

  // 6. SourceDocuments
  if (data.sourceDocuments?.length) {
    console.log(`Migrating ${data.sourceDocuments.length} source documents...`);
    for (const sd of data.sourceDocuments) {
      await prisma.sourceDocument.upsert({
        where: { id: sd.id },
        update: {},
        create: {
          id: sd.id,
          title: sd.title,
          fileName: sd.fileName,
          company: sd.company,
          companyId: sd.companyId,
          sourceDate: parseDate(sd.sourceDate),
          description: sd.description,
          totalPages: sd.totalPages ?? 1,
          verificationStatus: sd.verificationStatus ?? 'OFFICIALLY_VERIFIED',
          createdAt: parseDate(sd.createdAt) || new Date(),
        },
      });
    }
  }

  // 7. Questions
  if (data.questions?.length) {
    console.log(`Migrating ${data.questions.length} questions...`);
    for (const q of data.questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {},
        create: {
          id: q.id,
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
          frequency: q.frequency ?? 1,
          similarityHash: q.similarityHash,
          starterCode: q.starterCode,
          solution: q.solution,
          explanation: q.explanation,
          hints: q.hints,
          examples: q.examples,
          testCases: q.testCases,
          topics: q.topics,
          companies: q.companies,
          languages: q.languages,
          sourceDocument: q.sourceDocument,
          sourcePage: q.sourcePage,
          sourceDate: parseDate(q.sourceDate),
          sourceShift: q.sourceShift,
          javaSolution: q.javaSolution,
          sqlSolution: q.sqlSolution,
          approach: q.approach,
          commonMistakes: q.commonMistakes,
          sqlSchemaSql: q.sqlSchemaSql,
          sqlSeedData: q.sqlSeedData,
          sqlExpectedQuery: q.sqlExpectedQuery,
          htmlTemplate: q.htmlTemplate,
          cssTemplate: q.cssTemplate,
          jsTemplate: q.jsTemplate,
          frontendTestSpec: q.frontendTestSpec,
          createdAt: parseDate(q.createdAt) || new Date(),
          updatedAt: parseDate(q.updatedAt) || new Date(),
        },
      });
    }
  }

  // 8. QuestionExamples
  if (data.questionExamples?.length) {
    console.log(`Migrating ${data.questionExamples.length} question examples...`);
    for (const qe of data.questionExamples) {
      await prisma.questionExample.upsert({
        where: { id: qe.id },
        update: {},
        create: {
          id: qe.id,
          questionId: qe.questionId,
          input: qe.input,
          output: qe.output,
          explanation: qe.explanation,
          orderIndex: qe.orderIndex ?? 0,
        },
      });
    }
  }

  // 9. QuestionTestCases
  if (data.questionTestCases?.length) {
    console.log(`Migrating ${data.questionTestCases.length} question test cases...`);
    for (const tc of data.questionTestCases) {
      await prisma.questionTestCase.upsert({
        where: { id: tc.id },
        update: {},
        create: {
          id: tc.id,
          questionId: tc.questionId,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden ?? false,
          orderIndex: tc.orderIndex ?? 0,
        },
      });
    }
  }

  // 10. QuestionHints
  if (data.questionHints?.length) {
    console.log(`Migrating ${data.questionHints.length} question hints...`);
    for (const qh of data.questionHints) {
      await prisma.questionHint.upsert({
        where: { id: qh.id },
        update: {},
        create: {
          id: qh.id,
          questionId: qh.questionId,
          content: qh.content,
          orderIndex: qh.orderIndex ?? 0,
        },
      });
    }
  }

  // 11. QuestionSolutions
  if (data.questionSolutions?.length) {
    console.log(`Migrating ${data.questionSolutions.length} question solutions...`);
    for (const qs of data.questionSolutions) {
      await prisma.questionSolution.upsert({
        where: { id: qs.id },
        update: {},
        create: {
          id: qs.id,
          questionId: qs.questionId,
          language: qs.language,
          code: qs.code,
          approach: qs.approach,
          timeComplexity: qs.timeComplexity,
          spaceComplexity: qs.spaceComplexity,
          createdAt: parseDate(qs.createdAt) || new Date(),
        },
      });
    }
  }

  // 12. QuestionTopics
  if (data.questionTopics?.length) {
    console.log(`Migrating ${data.questionTopics.length} question topics...`);
    for (const qt of data.questionTopics) {
      await prisma.questionTopic.upsert({
        where: {
          questionId_topicId: {
            questionId: qt.questionId,
            topicId: qt.topicId,
          },
        },
        update: {},
        create: {
          id: qt.id,
          questionId: qt.questionId,
          topicId: qt.topicId,
        },
      });
    }
  }

  // 13. QuestionCompanies
  if (data.questionCompanies?.length) {
    console.log(`Migrating ${data.questionCompanies.length} question companies...`);
    for (const qc of data.questionCompanies) {
      await prisma.questionCompany.upsert({
        where: {
          questionId_companyId: {
            questionId: qc.questionId,
            companyId: qc.companyId,
          },
        },
        update: {},
        create: {
          id: qc.id,
          questionId: qc.questionId,
          companyId: qc.companyId,
        },
      });
    }
  }

  // 14. QuestionTags
  if (data.questionTags?.length) {
    console.log(`Migrating ${data.questionTags.length} question tags...`);
    for (const qtag of data.questionTags) {
      await prisma.questionTag.upsert({
        where: {
          questionId_tagId: {
            questionId: qtag.questionId,
            tagId: qtag.tagId,
          },
        },
        update: {},
        create: {
          id: qtag.id,
          questionId: qtag.questionId,
          tagId: qtag.tagId,
        },
      });
    }
  }

  // 15. QuestionSources
  if (data.questionSources?.length) {
    console.log(`Migrating ${data.questionSources.length} question sources...`);
    for (const qs of data.questionSources) {
      await prisma.questionSource.upsert({
        where: { id: qs.id },
        update: {},
        create: {
          id: qs.id,
          questionId: qs.questionId,
          sourceDocumentId: qs.sourceDocumentId,
          page: qs.page,
          shift: qs.shift,
          date: parseDate(qs.date),
          section: qs.section,
          evidenceType: qs.evidenceType,
          notes: qs.notes,
        },
      });
    }
  }

  // 16. MockTests
  if (data.mockTests?.length) {
    console.log(`Migrating ${data.mockTests.length} mock tests...`);
    for (const mt of data.mockTests) {
      await prisma.mockTest.upsert({
        where: { id: mt.id },
        update: {},
        create: {
          id: mt.id,
          title: mt.title,
          slug: mt.slug,
          description: mt.description,
          company: mt.company,
          companyId: mt.companyId,
          mockType: mt.mockType,
          durationMins: mt.durationMins ?? 90,
          totalMarks: mt.totalMarks ?? 100,
          passingMarks: mt.passingMarks ?? 60,
          isLive: mt.isLive ?? true,
          createdAt: parseDate(mt.createdAt) || new Date(),
        },
      });
    }
  }

  // 17. MockTestQuestions
  if (data.mockTestQuestions?.length) {
    console.log(`Migrating ${data.mockTestQuestions.length} mock test questions...`);
    for (const mtq of data.mockTestQuestions) {
      await prisma.mockTestQuestion.upsert({
        where: { id: mtq.id },
        update: {},
        create: {
          id: mtq.id,
          mockTestId: mtq.mockTestId,
          questionId: mtq.questionId,
          marks: mtq.marks ?? 10,
          orderIdx: mtq.orderIdx ?? 0,
        },
      });
    }
  }

  console.log('--- ALL DATA IMPORTED SUCCESSFULLY TO SUPABASE POSTGRESQL ---');
  const count = await prisma.question.count();
  console.log(`Live Question Count in Supabase: ${count}`);
}

main()
  .catch((e) => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
