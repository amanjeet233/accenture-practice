const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.question.groupBy({
    by: ['category'],
    where: { questionType: 'MCQ' },
    _count: { id: true }
  });

  console.log("=== MCQ CATEGORIES & COUNTS ===");
  console.log(categories);

  // Sample some questions
  const sample = await prisma.question.findFirst({
    where: { questionType: 'MCQ' },
    select: {
      id: true,
      title: true,
      category: true,
      topics: true,
      explanation: true,
      solution: true,
      verificationStatus: true
    }
  });
  console.log("\n=== SAMPLE MCQ ===");
  console.log(sample);
}

main().catch(console.error).finally(() => prisma.$disconnect());
