const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    where: { category: 'Networking', questionType: 'MCQ' },
    select: { id: true, title: true, starterCode: true, solution: true, explanation: true },
    skip: 45,
    take: 12
  });
  for (const q of qs) {
    let p = null;
    try { p = JSON.parse(q.starterCode); } catch {}
    console.log(`[${q.id}] ${q.title}`);
    console.log(`  Ans: ${p?.correctAnswerText || q.solution}`);
    console.log(`  Current Exp: ${q.explanation.substring(0, 120)}...\n`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
