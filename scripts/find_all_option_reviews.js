const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.question.groupBy({
    by: ['category'],
    where: {
      questionType: 'MCQ',
      OR: [
        { explanation: { contains: 'Option Review' } },
        { explanation: { contains: 'Analysis of All Options' } },
        { explanation: { contains: 'Multi-Cloud Cross-Comparison' } },
        { explanation: { contains: 'Analysis of OSI Layers' } },
        { explanation: { contains: 'Analysis of Options' } },
        { explanation: { contains: 'Does not satisfy' } },
        { explanation: { contains: 'Does not provide' } },
        { explanation: { contains: 'Does not represent' } }
      ]
    },
    _count: { _all: true }
  });
  console.log('Categories with option breakdown explanations:', cats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
