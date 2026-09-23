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
    const total = await prisma.question.count({ where: { questionType: 'MCQ', category: cat } });
    console.log(`\n================== ${cat} (Total: ${total}) ==================`);
    const samples = await prisma.question.findMany({
      where: { questionType: 'MCQ', category: cat },
      select: { id: true, title: true, starterCode: true, solution: true },
      take: 3
    });
    for (const s of samples) {
      console.log(`- [${s.id}] Title: ${s.title}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
