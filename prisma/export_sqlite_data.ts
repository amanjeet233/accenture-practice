import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db",
    },
  },
});

async function main() {
  console.log('Exporting data from SQLite dev.db...');

  const data = {
    roles: await prisma.role.findMany(),
    users: await prisma.user.findMany(),
    topics: await prisma.topic.findMany(),
    companies: await prisma.company.findMany(),
    tags: await prisma.tag.findMany(),
    sourceDocuments: await prisma.sourceDocument.findMany(),
    questions: await prisma.question.findMany(),
    questionExamples: await prisma.questionExample.findMany(),
    questionTestCases: await prisma.questionTestCase.findMany(),
    questionHints: await prisma.questionHint.findMany(),
    questionSolutions: await prisma.questionSolution.findMany(),
    questionTopics: await prisma.questionTopic.findMany(),
    questionCompanies: await prisma.questionCompany.findMany(),
    questionTags: await prisma.questionTag.findMany(),
    questionSources: await prisma.questionSource.findMany(),
    mockTests: await prisma.mockTest.findMany(),
    mockTestQuestions: await prisma.mockTestQuestion.findMany(),
    submissions: await prisma.submission.findMany(),
    userProgress: await prisma.userProgress.findMany(),
    bookmarks: await prisma.bookmark.findMany(),
    revisionItems: await prisma.revisionItem.findMany(),
    testAttempts: await prisma.testAttempt.findMany(),
    testAttemptQuestions: await prisma.testAttemptQuestion.findMany(),
  };

  const outputPath = path.join(__dirname, 'exported_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`Successfully exported data to ${outputPath}`);
  console.log({
    roles: data.roles.length,
    users: data.users.length,
    topics: data.topics.length,
    companies: data.companies.length,
    tags: data.tags.length,
    sourceDocuments: data.sourceDocuments.length,
    questions: data.questions.length,
    questionExamples: data.questionExamples.length,
    questionTestCases: data.questionTestCases.length,
    questionHints: data.questionHints.length,
    questionSolutions: data.questionSolutions.length,
    questionTopics: data.questionTopics.length,
    questionCompanies: data.questionCompanies.length,
    questionTags: data.questionTags.length,
    questionSources: data.questionSources.length,
    mockTests: data.mockTests.length,
    mockTestQuestions: data.mockTestQuestions.length,
    submissions: data.submissions.length,
    userProgress: data.userProgress.length,
    bookmarks: data.bookmarks.length,
    revisionItems: data.revisionItems.length,
    testAttempts: data.testAttempts.length,
    testAttemptQuestions: data.testAttemptQuestions.length,
  });
}

main()
  .catch((e) => {
    console.error('Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
