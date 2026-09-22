const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const data = JSON.parse(fs.readFileSync('prisma/exported_data.json', 'utf8'));

async function main() {
  console.log('--- RESTORING NON-MCQ QUESTIONS & RELATIONS ---');

  const nonMcqQuestions = data.questions.filter((q) => q.questionType !== 'MCQ');
  const nonMcqIds = new Set(nonMcqQuestions.map((q) => q.id));
  console.log(`Found ${nonMcqQuestions.length} non-MCQ questions to restore.`);

  // 1. Insert Questions
  // Convert date strings to Date objects if needed
  const questionsToInsert = nonMcqQuestions.map((q) => {
    const copy = { ...q };
    if (copy.createdAt) copy.createdAt = new Date(copy.createdAt);
    if (copy.updatedAt) copy.updatedAt = new Date(copy.updatedAt);
    if (copy.sourceDate) copy.sourceDate = new Date(copy.sourceDate);
    return copy;
  });

  const resQuestions = await prisma.question.createMany({
    data: questionsToInsert,
    skipDuplicates: true,
  });
  console.log(`Questions inserted: ${resQuestions.count}`);

  // 2. Insert QuestionTopics
  const relatedTopics = (data.questionTopics || []).filter((qt) => nonMcqIds.has(qt.questionId)).map((qt) => {
    const c = { ...qt };
    if (c.createdAt) c.createdAt = new Date(c.createdAt);
    return c;
  });
  const resTopics = await prisma.questionTopic.createMany({
    data: relatedTopics,
    skipDuplicates: true,
  });
  console.log(`QuestionTopics inserted: ${resTopics.count}`);

  // 3. Insert QuestionCompanies
  const relatedCompanies = (data.questionCompanies || []).filter((qc) => nonMcqIds.has(qc.questionId)).map((qc) => {
    const c = { ...qc };
    if (c.createdAt) c.createdAt = new Date(c.createdAt);
    return c;
  });
  const resCompanies = await prisma.questionCompany.createMany({
    data: relatedCompanies,
    skipDuplicates: true,
  });
  console.log(`QuestionCompanies inserted: ${resCompanies.count}`);

  // 4. Insert QuestionExamples
  const relatedExamples = (data.questionExamples || []).filter((qe) => nonMcqIds.has(qe.questionId)).map((qe) => {
    const c = { ...qe };
    if (c.createdAt) c.createdAt = new Date(c.createdAt);
    return c;
  });
  const resExamples = await prisma.questionExample.createMany({
    data: relatedExamples,
    skipDuplicates: true,
  });
  console.log(`QuestionExamples inserted: ${resExamples.count}`);

  // 5. Insert QuestionTestCases
  const relatedTestCases = (data.questionTestCases || []).filter((qtc) => nonMcqIds.has(qtc.questionId)).map((qtc) => {
    const c = { ...qtc };
    if (c.createdAt) c.createdAt = new Date(c.createdAt);
    return c;
  });
  const resTestCases = await prisma.questionTestCase.createMany({
    data: relatedTestCases,
    skipDuplicates: true,
  });
  console.log(`QuestionTestCases inserted: ${resTestCases.count}`);

  // 6. Insert QuestionHints
  const relatedHints = (data.questionHints || []).filter((qh) => nonMcqIds.has(qh.questionId)).map((qh) => {
    const c = { ...qh };
    if (c.createdAt) c.createdAt = new Date(c.createdAt);
    return c;
  });
  const resHints = await prisma.questionHint.createMany({
    data: relatedHints,
    skipDuplicates: true,
  });
  console.log(`QuestionHints inserted: ${resHints.count}`);

  // 7. Insert QuestionSolutions
  const relatedSolutions = (data.questionSolutions || []).filter((qs) => nonMcqIds.has(qs.questionId)).map((qs) => {
    const c = { ...qs };
    if (c.createdAt) c.createdAt = new Date(c.createdAt);
    return c;
  });
  const resSolutions = await prisma.questionSolution.createMany({
    data: relatedSolutions,
    skipDuplicates: true,
  });
  console.log(`QuestionSolutions inserted: ${resSolutions.count}`);

  // 8. MockTests
  if (data.mockTests && data.mockTests.length > 0) {
    const mockTestsToInsert = data.mockTests.map((mt) => {
      const c = { ...mt };
      if (c.createdAt) c.createdAt = new Date(c.createdAt);
      if (c.updatedAt) c.updatedAt = new Date(c.updatedAt);
      return c;
    });
    const resMocks = await prisma.mockTest.createMany({
      data: mockTestsToInsert,
      skipDuplicates: true,
    });
    console.log(`MockTests inserted: ${resMocks.count}`);
  }

  // 9. MockTestQuestions
  if (data.mockTestQuestions && data.mockTestQuestions.length > 0) {
    const mtqToInsert = data.mockTestQuestions.map((mtq) => {
      const c = { ...mtq };
      if (c.createdAt) c.createdAt = new Date(c.createdAt);
      return c;
    });
    const resMtq = await prisma.mockTestQuestion.createMany({
      data: mtqToInsert,
      skipDuplicates: true,
    });
    console.log(`MockTestQuestions inserted: ${resMtq.count}`);
  }

  // Final count verification
  const totalQuestions = await prisma.question.count();
  const byType = await prisma.question.groupBy({
    by: ['questionType'],
    _count: true,
  });

  console.log(`\nVerification: Total questions in DB: ${totalQuestions}`);
  console.log('Breakdown by questionType:');
  console.table(byType);

  const accentureCount = await prisma.question.count({
    where: {
      OR: [
        { companies: { contains: 'accenture' } },
        { questionCompanies: { some: { company: { slug: 'accenture' } } } },
      ],
    },
  });
  console.log(`\nAccenture questions visible to /companies/accenture: ${accentureCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
