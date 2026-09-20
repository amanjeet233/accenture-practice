import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MockTestInterface } from "./MockTestInterface";

export const dynamic = "force-dynamic";

export default async function MockTestAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const mockTest = await prisma.mockTest.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      questions: {
        orderBy: { orderIdx: "asc" },
        include: {
          question: {
            include: {
              examplesList: { orderBy: { orderIndex: "asc" } },
              questionTopics: { include: { topic: true } },
              testCasesList: {
                where: { isHidden: false },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!mockTest) {
    notFound();
  }

  return <MockTestInterface mockTest={mockTest} />;
}
