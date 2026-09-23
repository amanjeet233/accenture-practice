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

  console.log('Category, Total, MarkdownBulky, GenericOptionX, Other');
  for (const cat of categories) {
    const total = await prisma.question.count({
      where: { questionType: 'MCQ', category: cat }
    });
    const bulky = await prisma.question.count({
      where: {
        questionType: 'MCQ',
        category: cat,
        OR: [
          { explanation: { contains: '###' } },
          { explanation: { contains: 'Detailed' } },
          { explanation: { contains: 'Analysis of' } }
        ]
      }
    });
    const generic = await prisma.question.count({
      where: {
        questionType: 'MCQ',
        category: cat,
        explanation: { startsWith: 'The correct answer is Option' }
      }
    });
    const other = total - bulky - generic;
    console.log(`${cat}: Total=${total}, BulkyMarkdown=${bulky}, GenericOptionX=${generic}, Other=${other}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
