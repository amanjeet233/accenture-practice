const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.question.findMany({ where: { questionType: 'MCQ' } });
  
  const fulfills = all.filter(q => q.explanation && q.explanation.includes('directly fulfills'));
  const represents = all.filter(q => q.explanation && q.explanation.includes('represents the direct cloud'));
  const official = all.filter(q => q.explanation && q.explanation.includes('is an official cloud offering'));
  
  console.log('Total MCQs:', all.length);
  console.log('MCQs with "directly fulfills":', fulfills.length);
  console.log('MCQs with "represents the direct cloud":', represents.length);
  console.log('MCQs with "is an official cloud offering":', official.length);

  const byCat = {};
  fulfills.forEach(q => {
    byCat[q.category] = (byCat[q.category] || 0) + 1;
  });
  console.log('\n"directly fulfills" by Category:', JSON.stringify(byCat, null, 2));

  console.log('\nSamples of "directly fulfills":');
  for (let i = 0; i < Math.min(10, fulfills.length); i++) {
    console.log(`[${fulfills[i].id}] (${fulfills[i].category})`);
    console.log('Q:', fulfills[i].title);
    console.log('Exp:', fulfills[i].explanation);
    console.log('---');
  }
}

main().finally(() => prisma.$disconnect());
