const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    'MS Office', 'Networking', 'Cybersecurity', 'Cloud Computing',
    'Pseudocode', 'DevOps', 'DBMS', 'SQL', 'Java / OOP', 'Computer Fundamentals'
  ];
  for (const cat of categories) {
    const samples = await prisma.question.findMany({
      where: { questionType: 'MCQ', category: cat },
      select: { id: true, category: true, title: true, explanation: true, solution: true },
      take: 2
    });
    console.log(`=== ${cat} ===`);
    samples.forEach(s => {
      console.log(`ID: ${s.id}`);
      console.log(`Title: ${s.title}`);
      console.log(`Ans: ${s.solution}`);
      console.log(`Explanation: ${s.explanation}`);
      console.log('---');
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
