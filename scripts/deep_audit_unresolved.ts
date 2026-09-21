import { prisma } from "../src/lib/prisma";
import * as fs from "fs";

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
      sourceType: true,
      sourceDocument: true,
      sourcePage: true,
      importanceReason: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${qs.length} MCQs with null solution.`);

  const list: any[] = [];
  for (const q of qs) {
    const lines = q.description.split("\n");
    const options: Record<string, string> = {};
    let stem = q.description.split(/### Options/i)[0].trim();
    if (stem.length < 15 && q.title && q.title.length > stem.length) {
      stem = q.title;
    }

    for (const line of lines) {
      const m = line.match(/^[-*•]\s*(?:\*\*)?([A-D])[\)\.]\s*(?:\*\*)?\s*(.*)/i);
      if (m) {
        options[m[1].toUpperCase()] = m[2].trim();
      }
    }

    list.push({
      id: q.id,
      slug: q.slug,
      stem,
      category: q.category,
      options,
      verificationStatus: q.verificationStatus,
      importanceReason: q.importanceReason,
    });
  }

  fs.writeFileSync("scripts/null_solutions_dump.json", JSON.stringify(list, null, 2));
  console.log("Dumped to scripts/null_solutions_dump.json");
}

main().catch(console.error);
