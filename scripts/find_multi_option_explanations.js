const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bad = await prisma.question.findMany({
    where: {
      questionType: 'MCQ',
      OR: [
        { explanation: { contains: 'Option A' } },
        { explanation: { contains: 'Option B' } },
        { explanation: { contains: 'Option C' } },
        { explanation: { contains: 'Option D' } },
        { explanation: { contains: 'Analysis of' } },
        { explanation: { contains: 'Does not' } },
        { explanation: { contains: 'Incorrect' } }
      ]
    },
    select: { id: true, category: true, title: true, explanation: true },
    take: 10
  });
  console.log(`Found ${bad.length} sample items with option breakdowns:`);
  for (const b of bad) {
    console.log(`[${b.id}] (${b.category}): ${b.explanation.substring(0, 150)}...\n`);
  }

  const totalBad = await prisma.question.count({
    where: {
      questionType: 'MCQ',
      OR: [
        { explanation: { contains: 'Option A' } },
        { explanation: { contains: 'Option B' } },
        { explanation: { contains: 'Option C' } },
        { explanation: { contains: 'Option D' } },
        { explanation: { contains: 'Analysis of' } },
        { explanation: { contains: 'Does not' } },
        { explanation: { contains: 'Incorrect' } }
      ]
    }
  });
  console.log(`Total items in DB with option mentions: ${totalBad}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
