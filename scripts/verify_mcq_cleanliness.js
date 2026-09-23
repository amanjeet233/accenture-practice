const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bad = await prisma.question.count({
    where: {
      questionType: 'MCQ',
      OR: [
        { explanation: { contains: '###' } },
        { explanation: { contains: '**' } },
        { explanation: { contains: 'Option Review' } },
        { explanation: { contains: 'Option A (' } },
        { explanation: { contains: 'Option B (' } },
        { explanation: { contains: 'Option C (' } },
        { explanation: { contains: 'Option D (' } }
      ]
    }
  });
  console.log('Total MCQs with forbidden tokens in explanation:', bad);
}

main().catch(console.error).finally(() => prisma.$disconnect());
