import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.question.count();
  console.log("Current question count in DB:", count);
  const sample = await prisma.question.findFirst({
    select: {
      id: true,
      title: true,
      slug: true,
      questionType: true,
      sourceType: true,
      category: true,
      verificationStatus: true,
      sourceDocument: true,
    },
  });
  console.log("Sample question:", sample);

  // Check SourceDocument table
  const docCount = await prisma.sourceDocument.count();
  console.log("SourceDocument count:", docCount);
  const docs = await prisma.sourceDocument.findMany({
    select: { id: true, title: true, fileName: true, company: true },
  });
  console.log("SourceDocuments in DB:", docs);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
