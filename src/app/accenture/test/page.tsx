import React from "react";
import { Metadata } from "next";
import { getSafeMockTestQuestions } from "@/lib/mockTestService";
import { AccentureMockTestInterface } from "@/components/mcq/AccentureMockTestInterface";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import { resolveCanonicalTopic } from "@/lib/canonicalTopics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accenture Full Mock Test | Timed Assessment | CodeTrack",
  description:
    "Simulate the actual Accenture Online Assessment with a timed exam environment, strict server-side evaluation, live countdown timer, and comprehensive scorecard.",
};

export default async function AccentureTimedMockTestPage({
  searchParams,
}: {
  searchParams: Promise<{
    count?: string;
    duration?: string;
    category?: string;
    topic?: string;
    title?: string;
  }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/accenture/test");
  }

  const { count, duration, category, topic, title } = await searchParams;
  const topicFilter = topic || category;
  const canonical = resolveCanonicalTopic(topicFilter);

  // A direct "All Mock Tests" launch should not silently fall back to the
  // old 30-question demo. Dedicated links can still request 100/200/300.
  const questionCount = count ? Math.min(300, Math.max(5, parseInt(count, 10))) : 100;
  const durationMins = duration ? Math.min(360, Math.max(5, parseInt(duration, 10))) : 90;
  const testTitle =
    title ||
    (canonical
      ? `Accenture ${canonical.name} Mock Test`
      : "Accenture Full Assessment Simulation (Cognitive & Technical)");

  // Server-side: Fetch safe questions with NO solutions or explanations strictly for this topic
  const safeQuestions = await getSafeMockTestQuestions(
    questionCount,
    canonical ? canonical.id : topicFilter
  );

  return (
    <AccentureMockTestInterface
      questions={safeQuestions}
      testTitle={testTitle}
      durationMins={durationMins}
      testId={`accenture-cbt-${canonical ? canonical.slug : category || "full"}`}
      // Every test exits to the Accenture workspace, rather than the global
      // dashboard or a legacy module route.
      returnUrl="/home/accenture"
    />
  );
}
