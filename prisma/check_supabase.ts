import { PrismaClient } from "@prisma/client";

const connStr = "postgresql://postgres.oaiffpwuznfslnwjhhbj:Amanjeet@4321.@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connStr,
    },
  },
});

async function main() {
  const oldFilterCount = await prisma.question.count({
    where: {
      AND: [
        {
          OR: [
            { companies: { contains: "accenture" } },
            { questionCompanies: { some: { company: { slug: "accenture" } } } },
          ],
        },
        { questionType: "MCQ" },
      ],
    },
  });

  const updatedFilterCount = await prisma.question.count({
    where: {
      AND: [
        {
          OR: [
            { companies: { contains: "accenture" } },
            { sourceDocument: { contains: "Accenture" } },
            { questionCompanies: { some: { company: { slug: "accenture" } } } },
          ],
        },
        { questionType: "MCQ" },
      ],
    },
  });

  console.log(`Old ACCENTURE_COMPANY_FILTER MCQ Count: ${oldFilterCount}`);
  console.log(`Updated ACCENTURE_COMPANY_FILTER MCQ Count: ${updatedFilterCount}`);
}

main()
  .catch((e) => console.error("Filter test failed:", e))
  .finally(() => prisma.$disconnect());
