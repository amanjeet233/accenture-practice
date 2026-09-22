const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.question.count({
    where: {
      OR: [
        { companies: { contains: 'accenture' } },
        { questionCompanies: { some: { company: { slug: 'accenture' } } } },
      ],
    },
  });
  console.log('Total accenture questions in DB:', count);

  const byType = await prisma.question.groupBy({
    by: ['questionType'],
    _count: true,
  });
  console.log('By questionType:', byType);

  const nonMcqCount = await prisma.question.count({
    where: {
      questionType: { not: 'MCQ' },
    },
  });
  console.log('Non-MCQ count in DB:', nonMcqCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
