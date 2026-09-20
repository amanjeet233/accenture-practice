import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const distinctCategories = await prisma.question.groupBy({
    by: ['category'],
    _count: true
  });
  console.log("Distinct categories:", distinctCategories);

  const distinctSourceTypes = await prisma.question.groupBy({
    by: ['sourceType'],
    _count: true
  });
  console.log("Distinct sourceTypes:", distinctSourceTypes);

  const distinctQuestionTypes = await prisma.question.groupBy({
    by: ['questionType'],
    _count: true
  });
  console.log("Distinct questionTypes:", distinctQuestionTypes);

  const distinctStatuses = await prisma.question.groupBy({
    by: ['verificationStatus'],
    _count: true
  });
  console.log("Distinct verificationStatus:", distinctStatuses);

  // Check company 'Accenture'
  const accenture = await prisma.company.findFirst({ where: { slug: "accenture" } });
  console.log("Accenture company record:", accenture);
}

main().catch(console.error).finally(() => prisma.$disconnect());
