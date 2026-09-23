const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    where: {
      category: 'Networking',
      questionType: 'MCQ',
      explanation: { contains: 'Option Review' }
    },
    select: { id: true, title: true, starterCode: true, solution: true }
  });

  const types = {};
  for (const q of qs) {
    let p = null;
    try { p = JSON.parse(q.starterCode); } catch {}
    const stem = p?.stem || q.title;

    if (stem.includes("subnet mask")) types["subnet_mask"] = (types["subnet_mask"] || 0) + 1;
    else if (stem.includes("network address")) types["network_address"] = (types["network_address"] || 0) + 1;
    else if (stem.includes("broadcast address")) types["broadcast_address"] = (types["broadcast_address"] || 0) + 1;
    else if (stem.includes("usable host")) types["usable_host"] = (types["usable_host"] || 0) + 1;
    else if (stem.includes("OSI layer") || stem.includes("operate or belong")) types["osi_operate"] = (types["osi_operate"] || 0) + 1;
    else if (stem.includes("topology")) types["topology"] = (types["topology"] || 0) + 1;
    else types[stem.substring(0, 30)] = (types[stem.substring(0, 30)] || 0) + 1;
  }
  console.log('Types in the 160 questions:', types);
}

main().catch(console.error).finally(() => prisma.$disconnect());
