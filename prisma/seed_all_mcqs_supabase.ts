import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("=== SEEDING ALL 2,610 MCQs TO SUPABASE POSTGRESQL ===");

  const jsonPath = path.join(__dirname, "../src/data/canonical_mcq_bank.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File not found: ${jsonPath}`);
  }

  const mcqs: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${mcqs.length} MCQs from canonical_mcq_bank.json`);

  // Ensure Accenture company exists
  let accentureCompany = await prisma.company.findFirst({
    where: { slug: "accenture" },
  });
  if (!accentureCompany) {
    accentureCompany = await prisma.company.create({
      data: {
        name: "Accenture",
        slug: "accenture",
        description: "Accenture Recruitment Assessment Question Bank",
      },
    });
  }

  // Ensure Source Document exists
  const docFileName = "Accenture_MCQ_Bank.md";
  let sourceDoc = await prisma.sourceDocument.findFirst({
    where: { fileName: docFileName },
  });
  if (!sourceDoc) {
    sourceDoc = await prisma.sourceDocument.create({
      data: {
        title: "Accenture MCQ Bank",
        fileName: docFileName,
        company: "Accenture",
        companyId: accentureCompany.id,
        totalPages: 100,
        verificationStatus: "OFFICIALLY_VERIFIED",
        description: "Complete 2,610 Accenture MCQ Question Bank across 10 topics",
      },
    });
  }

  console.log("Upserting 2,610 MCQs into Supabase in sequential batches...");

  const BATCH_SIZE = 5;
  for (let i = 0; i < mcqs.length; i += BATCH_SIZE) {
    const chunk = mcqs.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map(async (q) => {
        const payload = {
          options: q.options,
          correctOptionId: q.correctOptionId,
          correctAnswerText: q.correctAnswerText,
          verificationStatus: q.verificationStatus || "VERIFIED",
        };
        const starterCode = JSON.stringify(payload);

        const cleanTitle = q.question.split("\n")[0].replace(/^[*#\s]+/, "").slice(0, 85);
        const slug = q.id;

        await prisma.question.upsert({
          where: { id: q.id },
          update: {
            title: `${q.id.toUpperCase()}: ${cleanTitle}`,
            slug: slug,
            description: q.question,
            difficulty: q.difficulty || "MEDIUM",
            questionType: "MCQ",
            sourceType: q.sourceType || "PRACTICE",
            category: q.section || "General",
            importance: q.sourceType === "REPORTED_PYQ" ? "HIGH" : "MEDIUM",
            verificationStatus: q.verificationStatus || "VERIFIED",
            starterCode: starterCode,
            solution: q.correctOptionId,
            explanation: q.explanation,
            sourceDocument: docFileName,
          },
          create: {
            id: q.id,
            title: `${q.id.toUpperCase()}: ${cleanTitle}`,
            slug: slug,
            description: q.question,
            difficulty: q.difficulty || "MEDIUM",
            questionType: "MCQ",
            sourceType: q.sourceType || "PRACTICE",
            category: q.section || "General",
            importance: q.sourceType === "REPORTED_PYQ" ? "HIGH" : "MEDIUM",
            verificationStatus: q.verificationStatus || "VERIFIED",
            starterCode: starterCode,
            solution: q.correctOptionId,
            explanation: q.explanation,
            sourceDocument: docFileName,
          },
        });
      })
    );
    console.log(`Processed ${Math.min(i + BATCH_SIZE, mcqs.length)} / ${mcqs.length} MCQs...`);
  }

  const finalCount = await prisma.question.count({
    where: { questionType: "MCQ" },
  });
  console.log(`🎉 SUCCESS! Supabase PostgreSQL now has ${finalCount} MCQs.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
