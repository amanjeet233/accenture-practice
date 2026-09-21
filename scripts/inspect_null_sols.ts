import { prisma } from "../src/lib/prisma";

async function main() {
  const qs = await prisma.question.findMany({
    where: { questionType: "MCQ", solution: null },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      verificationStatus: true,
      sourceDocument: true,
      sourcePage: true,
    },
  });

  console.log(`Total questions with null solution: ${qs.length}`);
  for (let i = 0; i < Math.min(20, qs.length); i++) {
    const q = qs[i];
    console.log(`\n--- [${i + 1}] ID: ${q.id} | Status: ${q.verificationStatus} ---`);
    console.log(`Title: ${q.title}`);
    console.log(`Category: ${q.category} | SourceDoc: ${q.sourceDocument}`);
    console.log(`Description:\n${q.description}`);
  }
}

main().catch(console.error);
