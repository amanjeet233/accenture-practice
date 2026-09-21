import { evaluateMockTestSubmission, getMockTestQuestions } from "../src/lib/mockTestService";
import { formatMcqQuestion } from "../src/lib/mcqService";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("===============================================================");
  console.log("TESTING BACKEND SCORING & REVIEW INTEGRITY");
  console.log("===============================================================\n");

  const sampleQuestions = await prisma.question.findMany({
    where: { questionType: "MCQ" },
    take: 5,
    orderBy: { createdAt: "asc" },
  });

  const questionIds = sampleQuestions.map((q) => q.id);
  const formattedQuestions = sampleQuestions.map((q, idx) => formatMcqQuestion(q, idx + 1));

  // Test 1: Select correct answers for all 5 questions
  const allCorrectAnswers: Record<string, "A" | "B" | "C" | "D"> = {};
  formattedQuestions.forEach((q) => {
    allCorrectAnswers[q.id] = q.correctKey;
  });

  const res1 = await evaluateMockTestSubmission(questionIds, allCorrectAnswers, 120);
  console.log(`Test 1 (All Correct Answers): Marks = ${res1.score}/${res1.totalQuestions} (${res1.percentage}%) -> Expected: 5/5 (100%)`);
  if (res1.percentage !== 100 || res1.correct !== 5) {
    throw new Error(`Test 1 Failed: Expected percentage 100%, got ${res1.percentage}%`);
  }

  // Test 2: Select incorrect answers for all 5 questions
  const allWrongAnswers: Record<string, "A" | "B" | "C" | "D"> = {};
  formattedQuestions.forEach((q) => {
    const wrongKey = q.correctKey === "A" ? "B" : "A";
    allWrongAnswers[q.id] = wrongKey;
  });

  const res2 = await evaluateMockTestSubmission(questionIds, allWrongAnswers, 120);
  console.log(`Test 2 (All Wrong Answers): Marks = ${res2.score}/${res2.totalQuestions} (${res2.percentage}%) -> Expected: 0/5 (0%)`);
  if (res2.percentage !== 0 || res2.correct !== 0) {
    throw new Error(`Test 2 Failed: Expected percentage 0%, got ${res2.percentage}%`);
  }

  // Test 3: Do not answer (unanswered questions)
  const emptyAnswers: Record<string, "A" | "B" | "C" | "D"> = {};
  const res3 = await evaluateMockTestSubmission(questionIds, emptyAnswers, 120);
  console.log(`Test 3 (Unanswered): Unattempted = ${res3.unattempted}/${res3.totalQuestions}, Marks = ${res3.score} -> Expected: 5/5 unattempted`);
  if (res3.unattempted !== 5 || res3.score !== 0) {
    throw new Error(`Test 3 Failed: Expected 5 unattempted, got ${res3.unattempted}`);
  }

  // Test 4 & 5: Review page data source consistency
  // Verifying review questions contain authoritative database correct answers
  for (const reviewItem of res1.reviewQuestions) {
    const originalFormatted = formattedQuestions.find((f) => f.id === reviewItem.id);
    if (!originalFormatted) throw new Error(`Missing question in review: ${reviewItem.id}`);

    if (reviewItem.correctKey !== originalFormatted.correctKey) {
      throw new Error(`Review key mismatch on ${reviewItem.id}: Review=${reviewItem.correctKey} DB=${originalFormatted.correctKey}`);
    }
    if (reviewItem.correctAnswerText !== originalFormatted.correctAnswerText) {
      throw new Error(`Review answer text mismatch on ${reviewItem.id}`);
    }
  }

  console.log("Test 4 & 5 (Authoritative Review Alignment): Verified review answers originate from authoritative database records.\n");
  console.log("ALL SCORING AND REVIEW TESTS PASSED SUCCESSFULLY.");
}

main().catch((err) => {
  console.error("Scoring test error:", err);
  process.exit(1);
});
