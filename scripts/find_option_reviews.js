const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    where: {
      category: 'Networking',
      questionType: 'MCQ',
      explanation: { contains: 'Option Review' }
    },
    select: { id: true, title: true, starterCode: true, solution: true }
  });
  console.log(`Questions with Option Review in Networking: ${qs.length}`);
  qs.slice(0, 10).forEach(q => console.log(`  [${q.id}] ${q.title}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
