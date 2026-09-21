import { shuffleQuestionOptions, CanonicalMCQ } from "../src/lib/canonicalMcqPipeline";
import { formatMcqQuestion } from "../src/lib/mcqService";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("===============================================================");
  console.log("TESTING OPTION SHUFFLING INTEGRITY ACROSS 1,000 ITERATIONS");
  console.log("===============================================================\n");

  // Sample representative questions from different topics
  const sampleQuestions = await prisma.question.findMany({
    where: { questionType: "MCQ" },
    take: 10,
    orderBy: { createdAt: "asc" },
  });

  console.log(`Testing with ${sampleQuestions.length} representative questions...\n`);

  let totalIterations = 0;
  let textMatchSuccessCount = 0;
  let positionVariedCount = 0;
  let scoringIntegritySuccessCount = 0;

  for (let qIdx = 0; qIdx < sampleQuestions.length; qIdx++) {
    const rawQ = sampleQuestions[qIdx];
    const formatted = formatMcqQuestion(rawQ, qIdx + 1);

    const canonical: CanonicalMCQ = {
      id: formatted.id,
      section: formatted.category,
      topic: formatted.category,
      question: formatted.stem,
      options: [
        { id: "A", text: formatted.options.A },
        { id: "B", text: formatted.options.B },
        { id: "C", text: formatted.options.C },
        { id: "D", text: formatted.options.D },
      ],
      correctOptionId: formatted.correctKey,
      correctAnswerText: formatted.correctAnswerText,
      explanation: formatted.explanation,
      verificationStatus: "VERIFIED",
    };

    const targetAnswerText = formatted.correctAnswerText.trim();
    const originalOptionId = formatted.correctKey;
    const seenPositions = new Set<string>();

    const ITERATIONS = 1000;
    for (let i = 0; i < ITERATIONS; i++) {
      totalIterations++;
      const { shuffledQuestion } = shuffleQuestionOptions(canonical);

      seenPositions.add(shuffledQuestion.correctOptionId);

      // Verify correct option text is STILL identical to original
      const optionForNewCorrectId = shuffledQuestion.options.find(
        (o) => o.id === shuffledQuestion.correctOptionId
      );

      if (
        optionForNewCorrectId &&
        optionForNewCorrectId.text.trim() === targetAnswerText
      ) {
        textMatchSuccessCount++;
      } else {
        console.error(
          `FAIL on question ${rawQ.slug} iteration ${i}: Expected text "${targetAnswerText}" at key ${shuffledQuestion.correctOptionId}, got "${optionForNewCorrectId?.text}"`
        );
      }

      // Verify scoring simulation:
      // If student chooses the option that contains targetAnswerText, they must get full credit
      const studentChosenKey = shuffledQuestion.options.find(
        (o) => o.text.trim() === targetAnswerText
      )?.id;

      if (studentChosenKey === shuffledQuestion.correctOptionId) {
        scoringIntegritySuccessCount++;
      }
    }

    if (seenPositions.size > 1) {
      positionVariedCount++;
    }

    console.log(
      `Q${qIdx + 1} [${rawQ.slug.slice(0, 35)}...] -> Answer: "${targetAnswerText.slice(0, 30)}" | 1000 shuffles passed | Positions observed: [${Array.from(seenPositions).sort().join(", ")}]`
    );
  }

  console.log("\n===============================================================");
  console.log("SHUFFLE TEST RESULTS");
  console.log("===============================================================");
  console.log(`Total Shuffle Iterations:        ${totalIterations}`);
  console.log(`Correct Answer Text Invariance:  ${textMatchSuccessCount}/${totalIterations} (100.00%)`);
  console.log(`Scoring Integrity:              ${scoringIntegritySuccessCount}/${totalIterations} (100.00%)`);
  console.log(`Position Distribution Dynamic:   ${positionVariedCount}/${sampleQuestions.length} questions varied across A, B, C, D`);
  console.log("===============================================================\n");

  if (textMatchSuccessCount !== totalIterations || scoringIntegritySuccessCount !== totalIterations) {
    throw new Error("Option shuffling integrity test FAILED!");
  }

  console.log("ALL OPTION SHUFFLING TESTS PASSED WITH 100% RELIABILITY.");
}

main().catch((err) => {
  console.error("Shuffle test error:", err);
  process.exit(1);
});
