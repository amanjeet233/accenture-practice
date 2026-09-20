import React from "react";
import { Metadata } from "next";
import { getAccentureMcqPracticeList } from "@/lib/mcqService";
import { McqPracticeWorkspace } from "@/components/mcq/McqPracticeWorkspace";
import { prisma } from "@/lib/prisma";
import { ACCENTURE_COMPANY_FILTER } from "@/lib/accentureModules";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accenture MCQ Practice Mode | CodeTrack",
  description:
    "Interactive fullscreen practice workspace for Accenture MCQs with instant feedback, option evaluation, technical explanations, and question navigator.",
};

export default async function AccentureMcqPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; module?: string }>;
}) {
  const { category, module } = await searchParams;

  const [questions, distinctCategories] = await Promise.all([
    getAccentureMcqPracticeList(category),
    prisma.question.findMany({
      where: {
        AND: [ACCENTURE_COMPANY_FILTER, { questionType: "MCQ" }],
      },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const allCategories = distinctCategories
    .map((c) => c.category)
    .filter(Boolean) as string[];

  const returnUrl = module ? `/accenture/${module}` : "/accenture/mcq";

  return (
    <McqPracticeWorkspace
      initialQuestions={questions}
      allCategories={allCategories}
      selectedCategory={category || "all"}
      returnUrl={returnUrl}
    />
  );
}
