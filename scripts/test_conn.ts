import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const c = await prisma.question.count();
    console.log("prisma default question count:", c);
  } catch (e: any) {
    console.error("prisma failed:", e);
  }
}

main();
