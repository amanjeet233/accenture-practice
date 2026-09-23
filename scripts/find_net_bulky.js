const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    where: {
      category: 'Networking',
      questionType: 'MCQ',
      OR: [
        { explanation: { contains: 'Option A' } },
        { explanation: { contains: 'Option B' } },
        { explanation: { contains: 'Option C' } },
        { explanation: { contains: 'Option D' } },
        { explanation: { contains: '###' } }
      ]
    },
    select: { id: true, title: true, explanation: true },
    take: 5
  });
  console.log(`Found ${qs.length} with Option/### in Networking:`);
  for (const q of qs) {
    console.log(`[${q.id}] ${q.title}`);
    console.log(q.explanation);
    console.log('---');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
