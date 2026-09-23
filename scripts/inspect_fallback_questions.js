const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fulfills = await prisma.question.findMany({
    where: {
      questionType: 'MCQ',
      explanation: { contains: 'directly fulfills' }
    },
    select: {
      id: true,
      category: true,
      title: true,
      starterCode: true,
      solution: true,
      explanation: true
    }
  });

  const byCat = {};
  for (const q of fulfills) {
    if (!byCat[q.category]) byCat[q.category] = [];
    byCat[q.category].push(q);
  }

  for (const cat of Object.keys(byCat)) {
    console.log(`=== ${cat} (${byCat[cat].length} items) ===`);
    for (let i = 0; i < Math.min(3, byCat[cat].length); i++) {
      const q = byCat[cat][i];
      let p = {};
      try { p = JSON.parse(q.starterCode); } catch {}
      console.log(`[${q.id}] Q: ${p.stem || q.title}`);
      console.log(`Ans: ${p.correctAnswerText || q.solution}`);
      console.log('---');
    }
  }
}

main().finally(() => prisma.$disconnect());
