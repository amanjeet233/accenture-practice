import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Timer, ArrowRight, Clock, ShieldCheck, Sparkles, BrainCircuit, Layers } from "lucide-react";
import { MockTestCatalogClient } from "./MockTestCatalogClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Timed Mock Tests & Hiring Drive Simulations | Prep Platform",
  description:
    "Timed multi-section online assessments calibrated to authentic hiring drive standards. Experience real auto-submit timers, navigation palettes, and comprehensive result analysis.",
};

export default async function MockTestsCatalogPage() {
  const rawMockTests = await prisma.mockTest.findMany({
    include: {
      questions: {
        include: {
          question: {
            select: {
              title: true,
              slug: true,
              difficulty: true,
              questionType: true,
            },
          },
        },
        orderBy: { orderIdx: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedMocks = rawMockTests.map((mock) => ({
    id: mock.id,
    title: mock.title,
    slug: mock.slug,
    description: mock.description,
    company: mock.company,
    mockType: mock.mockType as "SOURCE_BASED" | "PATTERN_BASED",
    durationMins: mock.durationMins,
    totalMarks: mock.totalMarks,
    passingMarks: mock.passingMarks,
    questions: mock.questions.map((mq) => ({
      id: mq.id,
      title: mq.question.title,
      slug: mq.question.slug,
      difficulty: mq.question.difficulty,
      questionType: mq.question.questionType,
      marks: mq.marks,
    })),
  }));

  return <MockTestCatalogClient mockTests={formattedMocks} />;
}
