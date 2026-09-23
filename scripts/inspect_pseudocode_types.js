const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    where: { questionType: 'MCQ', category: 'Pseudocode' },
    select: { id: true, title: true, starterCode: true, solution: true },
    skip: 20,
    take: 10
  });
  for (const q of qs) {
    if (q.starterCode) {
      try {
        const p = JSON.parse(q.starterCode);
        console.log(`[${q.id}] ans=${p.correctAnswerText}`);
        console.log(p.codeBlock);
        console.log('---');
      } catch {}
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
