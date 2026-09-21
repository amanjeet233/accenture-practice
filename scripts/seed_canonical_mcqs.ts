import { prisma } from "../src/lib/prisma";
import canonicalBank from "../src/data/canonical_mcq_bank.json";

async function main() {
  console.log(`Starting canonical seed with ${canonicalBank.length} questions...`);

  // 1. Delete all old MCQs (any starting with acc- or questionType MCQ that was generated)
  console.log("Purging old synthetic looped questions...");
  const deleteResult = await prisma.question.deleteMany({
    where: {
      OR: [
        { slug: { startsWith: "acc-gen-" } },
        { slug: { startsWith: "acc-can-" } },
        { slug: { startsWith: "acc-src-" } },
        { slug: { startsWith: "acc-pat-" } },
      ],
    },
  });
  console.log(`Deleted ${deleteResult.count} old questions.`);

  // 2. Prepare records for bulk insert
  const records = canonicalBank.map((q: any) => {
    const optionsMap: Record<string, string> = {};
    for (const opt of q.options) {
      optionsMap[opt.id] = opt.text;
    }

    const description = `${q.question}

### Options
- **A)** ${optionsMap["A"] || ""}
- **B)** ${optionsMap["B"] || ""}
- **C)** ${optionsMap["C"] || ""}
- **D)** ${optionsMap["D"] || ""}`;

    const starterPayload = JSON.stringify({
      canonicalId: q.id,
      options: q.options,
      correctOptionId: q.correctOptionId,
      correctAnswerText: q.correctAnswerText,
      sourceAnswerText: q.sourceAnswerText,
      sourceAnswerOption: q.sourceAnswerOption,
      verificationStatus: q.verificationStatus,
    });

    const title = q.question.split("\n")[0].slice(0, 80);

    return {
      slug: q.id,
      title,
      description,
      difficulty: q.difficulty,
      questionType: "MCQ",
      sourceType: q.sourceType,
      category: q.section,
      importance: q.sourceType === "SOURCE_DOCUMENT" ? "MUST_DO" : "HIGH",
      importanceReason:
        q.sourceType === "SOURCE_DOCUMENT"
          ? "Authentic question extracted directly from verified Accenture assessment source documents."
          : "Core question modeled after verified Accenture technical patterns.",
      verificationStatus: q.verificationStatus,
      solution: q.correctOptionId,
      explanation: q.explanation,
      starterCode: starterPayload,
      companies: JSON.stringify(["accenture"]),
      sourceDocument: q.sourceFile || null,
      sourcePage: q.sourcePage || null,
    };
  });

  console.log(`Executing bulk createMany for ${records.length} records...`);
  const result = await prisma.question.createMany({
    data: records,
    skipDuplicates: true,
  });
  console.log(`Successfully bulk-inserted ${result.count} canonical MCQs!`);

  // Verify counts
  const total = await prisma.question.count();
  const mcqs = await prisma.question.count({ where: { questionType: "MCQ" } });
  console.log(`Final Database State: Total = ${total}, MCQs = ${mcqs}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding canonical MCQs:", err);
  process.exit(1);
});
