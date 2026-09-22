const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const data = JSON.parse(fs.readFileSync('prisma/exported_data.json', 'utf8'));

async function main() {
  const nonMcqQuestions = data.questions.filter((q) => q.questionType !== 'MCQ');
  const nonMcqIds = new Set(nonMcqQuestions.map((q) => q.id));

  // Check companies
  const companyIds = new Set();
  (data.questionCompanies || []).forEach((qc) => {
    if (nonMcqIds.has(qc.questionId)) companyIds.add(qc.companyId);
  });
  console.log('Needed company IDs count:', companyIds.size);

  // Check topics
  const topicIds = new Set();
  (data.questionTopics || []).forEach((qt) => {
    if (nonMcqIds.has(qt.questionId)) topicIds.add(qt.topicId);
  });
  console.log('Needed topic IDs count:', topicIds.size);

  const existingCompanies = await prisma.company.findMany({
    where: { id: { in: Array.from(companyIds) } },
  });
  console.log('Existing matching companies in DB:', existingCompanies.length);

  const existingTopics = await prisma.topic.findMany({
    where: { id: { in: Array.from(topicIds) } },
  });
  console.log('Existing matching topics in DB:', existingTopics.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
