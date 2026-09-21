import React from "react";
import { Metadata } from "next";
import { getSafeMockTestQuestions } from "@/lib/mockTestService";
import { CbtExamInterface } from "@/components/mcq/CbtExamInterface";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    title?: string;
  }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/accenture/test");
  }

  const { count, duration, category, title } = await searchParams;

  const questionCount = count ? Math.min(60, Math.max(5, parseInt(count, 10))) : 30;
  const durationMins = duration ? Math.min(120, Math.max(5, parseInt(duration, 10))) : 30;
  const testTitle = title || "Accenture Full Assessment Simulation (Cognitive & Technical)";

  // Server-side: Fetch safe questions with NO solutions or explanations
  const safeQuestions = await getSafeMockTestQuestions(questionCount, category);

  return (
    <CbtExamInterface
      questions={safeQuestions}
      testTitle={testTitle}
      durationMins={durationMins}
      testId={`accenture-cbt-${category || "full"}`}
      returnUrl="/accenture"
    />
  );
}
