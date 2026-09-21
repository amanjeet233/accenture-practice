import React from "react";
import { Metadata } from "next";
import { getAccentureMcqPracticeList, getAccentureDistinctCategories } from "@/lib/mcqService";
import { McqPracticeWorkspace } from "@/components/mcq/McqPracticeWorkspace";

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

  const [questions, allCategories] = await Promise.all([
    getAccentureMcqPracticeList(category),
    getAccentureDistinctCategories(),
  ]);

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
