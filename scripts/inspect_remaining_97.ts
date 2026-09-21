import { prisma } from "../src/lib/prisma";
import canonicalBank from "../src/data/canonical_mcq_bank.json";
import * as fs from "fs";

async function main() {
  const nullQs = await prisma.question.findMany({
    where: { questionType: "MCQ", solution: null },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      verificationStatus: true,
      importanceReason: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const matchedIds = new Set<string>();
  for (const n of nullQs) {
    const nText = (n.title + " " + n.description).toLowerCase().replace(/[^a-z0-9]/g, "");
    const found = canonicalBank.find((c) => {
      const cText = c.question.toLowerCase().replace(/[^a-z0-9]/g, "");
      return nText.includes(cText) || cText.includes(nText.slice(0, 50));
    });
    if (found) {
      matchedIds.add(n.id);
    }
  }

  const remaining = nullQs.filter((q) => !matchedIds.has(q.id));
  console.log(`Remaining unmatched null-solution questions: ${remaining.length}`);

  const dump = remaining.map((q) => {
    const lines = q.description.split("\n");
    const options: Record<string, string> = {};
    for (const line of lines) {
      const m = line.match(/^[-*•]\s*(?:\*\*)?([A-D])[\)\.]\s*(?:\*\*)?\s*(.*)/i);
      if (m) {
        options[m[1].toUpperCase()] = m[2].trim();
      }
    }
    return {
      id: q.id,
      slug: q.slug,
      title: q.title,
      category: q.category,
      options,
      status: q.verificationStatus,
      reason: q.importanceReason,
    };
  });

  fs.writeFileSync("scripts/remaining_97_dump.json", JSON.stringify(dump, null, 2));
  console.log("Saved to scripts/remaining_97_dump.json");
}

main().catch(console.error);
