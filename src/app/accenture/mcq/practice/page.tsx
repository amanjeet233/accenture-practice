import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAccentureMcqPracticeList } from "@/lib/mcqService";
import { McqPracticeWorkspace } from "@/components/mcq/McqPracticeWorkspace";
import {
  CANONICAL_TOPIC_LIST,
  resolveCanonicalTopic,
} from "@/lib/canonicalTopics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accenture MCQ Practice Mode | CodeTrack",
  description:
    "Interactive fullscreen practice workspace for Accenture MCQs with instant feedback, option evaluation, technical explanations, and question navigator.",
};

export default async function AccentureMcqPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; module?: string; topic?: string }>;
}) {
  const { category, module, topic } = await searchParams;
  const topicParam = topic || module || category;

  let canonicalTopicId: string | undefined = undefined;
  let selectedTopicSlug = "all";
  let returnUrl = "/accenture/mcq";

  if (topicParam && topicParam !== "all") {
    const canonical = resolveCanonicalTopic(topicParam);
    if (!canonical) {
      // Invalid topic parameter: do NOT fall back to all questions
      notFound();
    }
    canonicalTopicId = canonical.id;
    selectedTopicSlug = canonical.slug;
    returnUrl = `/accenture/${canonical.slug}`;
  }

  // Fetch strictly filtered questions for this canonical topic
  const questions = await getAccentureMcqPracticeList(canonicalTopicId);

  // Available topics for the selector dropdown
  const topicOptions = CANONICAL_TOPIC_LIST.filter(
    (t) => t.questionType === "MCQ" || t.questionType === "ANY"
  ).map((t) => ({
    slug: t.slug,
    name: t.name,
    id: t.id,
  }));

  return (
    <McqPracticeWorkspace
      initialQuestions={questions}
      allCategories={topicOptions.map((t) => t.slug)}
      topicOptions={topicOptions}
      selectedCategory={selectedTopicSlug}
      returnUrl={returnUrl}
    />
  );
}
