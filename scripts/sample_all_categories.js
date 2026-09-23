const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    'MS Office',
    'Cloud Computing',
    'Networking',
    'Pseudocode',
    'Computer Fundamentals',
    'DevOps',
    'DBMS',
    'Java / OOP',
    'Cybersecurity',
    'SQL'
  ];

  for (const cat of categories) {
    console.log(`\n================== ${cat} ==================`);
    const qs = await prisma.question.findMany({
      where: { questionType: 'MCQ', category: cat },
      select: { id: true, title: true, solution: true, starterCode: true, explanation: true },
      take: 6
    });
    for (const q of qs) {
      let opts = [];
      let ansText = '';
      if (q.starterCode) {
        try {
          const p = JSON.parse(q.starterCode);
          opts = p.options || [];
          ansText = p.correctAnswerText || '';
        } catch {}
      }
      console.log(`[${q.id}] ${q.title}`);
      console.log(`  Ans: ${q.solution} -> "${ansText}"`);
      console.log(`  Current Exp: ${q.explanation ? q.explanation.substring(0, 100) + '...' : 'NONE'}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
