import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return basePrisma.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        try {
          return await query(args);
        } catch (error: any) {
          const isConnError =
            error?.code === "P1001" ||
            error?.message?.includes("Can't reach database server") ||
            error?.message?.includes("Connection pool timeout") ||
            error?.message?.includes("connection closed");

          if (isConnError) {
            console.warn(
              `[Prisma] Stale connection pool socket detected on ${model || "query"}.${operation}. Reconnecting and retrying...`
            );
            await basePrisma.$disconnect().catch(() => {});
            await new Promise((resolve) => setTimeout(resolve, 150));
            return await query(args);
          }
          throw error;
        }
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

