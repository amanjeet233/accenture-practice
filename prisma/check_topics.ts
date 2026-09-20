import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const topics = await prisma.topic.findMany({ select: { id: true, name: true, slug: true, category: true } });
  console.log("Existing topics count:", topics.length);
  console.log("Sample topics:", topics.slice(0, 15));
}

main().catch(console.error).finally(() => prisma.$disconnect());
