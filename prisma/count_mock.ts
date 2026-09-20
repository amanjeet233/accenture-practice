import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.question.count();
  const mockImported = await prisma.question.count({
    where: { sourceDocument: "Accenture MOCK OA -1-merged---.md" },
  });
  console.log(`TOTAL_IN_DB: ${total} | MOCK_IMPORTED: ${mockImported} / 602`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
