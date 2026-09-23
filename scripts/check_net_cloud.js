const { PrismaClient } = require('@prisma/client');
const { resolveQuestionExplanation } = require('./enhanced_mcq_resolver');
const prisma = new PrismaClient();

async function check() {
  for (const cat of ['Networking', 'Cloud Computing']) {
    console.log(`=== ${cat} ===`);
    const qs = await prisma.question.findMany({
      where: { category: cat, questionType: 'MCQ' },
      select: { id: true, title: true, starterCode: true, solution: true, explanation: true },
      take: 6
    });
    for (const q of qs) {
      const res = resolveQuestionExplanation(q);
      console.log(`[${q.id}] ${q.title}`);
      console.log(`  Ans: ${q.solution}`);
      console.log(`  Exp: ${res.text}\n`);
    }
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
