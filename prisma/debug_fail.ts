import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const inventoryPath = "C:\\Users\\amanj\\.gemini\\antigravity-ide\\brain\\9c9576ac-0d08-4e8a-bfa8-b02c5f372869\\scratch\\question_inventory.json";
  const rawInventory: any[] = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));
  
  const target = rawInventory.find((q) => q.id === "SEC3-SHIFT-CODE-001");
  const cleanDescription = target.question_text.replace(/\0/g, "");

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 45);
  }

  const cleanTitle = (cleanDescription.slice(0, 90).replace(/^\[(.*?)\]/, "$1").replace(/[`]/g, "").trim() || "Question").slice(0, 87);
  const baseSlug = slugify(cleanTitle) || "question";
  const uniqueSlug = `mockoa1-${target.id.toLowerCase().replace(/_/g, "-")}-${baseSlug}`;

  try {
    const res = await prisma.question.create({
      data: {
        title: cleanTitle,
        slug: uniqueSlug,
        description: cleanDescription,
        difficulty: "MEDIUM",
        questionType: "CODING",
        sourceType: "ACCENTURE_PATTERN",
        category: target.category,
        verificationStatus: "UNVERIFIED",
        sourceDocument: "Accenture MOCK OA -1-merged---.md",
        sourcePage: target.line,
        sourceShift: target.section,
      },
    });
    console.log("Success with null byte stripped! ID:", res.id);
  } catch (err: any) {
    console.error("ERROR DETAIL:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
