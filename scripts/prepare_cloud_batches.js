const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const allCloud = await prisma.question.findMany({
    where: { category: 'Cloud Computing', questionType: 'MCQ' },
    orderBy: { id: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      solution: true,
      explanation: true,
      starterCode: true
    }
  });

  console.log(`Found ${allCloud.length} Cloud Computing questions in database.`);

  const batch1 = allCloud.slice(0, 100);
  const batch2 = allCloud.slice(100, 200);
  const batch3 = allCloud.slice(200);

  console.log(`Batch 1: ${batch1.length} questions (${batch1[0].id} to ${batch1[batch1.length - 1].id})`);
  console.log(`Batch 2: ${batch2.length} questions (${batch2[0].id} to ${batch2[batch2.length - 1].id})`);
  console.log(`Batch 3: ${batch3.length} questions (${batch3[0].id} to ${batch3[batch3.length - 1].id})`);

  fs.writeFileSync('scripts/cloud_raw_questions.json', JSON.stringify(allCloud, null, 2));
  console.log("Saved raw questions to scripts/cloud_raw_questions.json");
}

main().catch(console.error).finally(() => prisma.$disconnect());
