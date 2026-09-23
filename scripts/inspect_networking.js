const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.question.count({
    where: { category: 'Networking', questionType: 'MCQ' }
  });
  console.log(`Total Networking MCQ questions: ${total}`);

  const sample = await prisma.question.findMany({
    where: { category: 'Networking', questionType: 'MCQ' },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      solution: true,
      explanation: true,
      hints: true,
      examplesList: true,
      testCasesList: true
    }
  });

  console.log("Sample 3 questions:", JSON.stringify(sample, null, 2));

  // Let's also check if options are stored in description, hints, or another table
  const withAnyOptions = await prisma.question.findFirst({
    where: { category: 'Networking', questionType: 'MCQ' },
    include: {
      testCasesList: true,
      examplesList: true,
      hintsList: true,
      solutionsList: true
    }
  });
  console.log("Deep relation sample:", JSON.stringify(withAnyOptions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
