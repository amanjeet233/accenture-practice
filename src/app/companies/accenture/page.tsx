import React from "react";
import { prisma } from "@/lib/prisma";
import { toQuestionSummaryDTO } from "@/lib/dto";
import { AccentureDashboardClient } from "./AccentureDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accenture Preparation Dashboard | Technical Coding & PYQ Engine",
  description:
    "Comprehensive preparation hub for Accenture on-campus and off-campus technical rounds. Covers DSA coding, SQL assessments, frontend challenges, and full-length mock tests.",
};

export default async function AccentureCompanyDashboardPage() {
  // Fetch all questions associated with Accenture
  const rawQuestions = await prisma.question.findMany({
    where: {
      OR: [
        { companies: { contains: "accenture" } },
        { questionCompanies: { some: { company: { slug: "accenture" } } } },
      ],
    },
    include: {
      questionTopics: { include: { topic: true } },
      questionCompanies: { include: { company: true } },
      questionSources: { include: { sourceDocument: true } },
      bookmarks: true,
      progress: true,
    },
    orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
  });

  const formattedQuestions = rawQuestions.map(toQuestionSummaryDTO);

  // Fetch mock tests for Accenture
  const rawMockTests = await prisma.mockTest.findMany({
    where: {
      OR: [
        { company: { contains: "Accenture" } },
        { companyRef: { slug: "accenture" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const mockTests = rawMockTests.map((mt) => ({
    id: mt.id,
    title: mt.title,
    slug: mt.slug,
    description: mt.description,
    company: mt.company,
    durationMins: mt.durationMins,
    totalMarks: mt.totalMarks,
    passingMarks: mt.passingMarks,
    isLive: mt.isLive,
  }));

  // Fetch topics for filter options
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true, category: true },
  });

  return (
    <AccentureDashboardClient
      initialQuestions={formattedQuestions}
      mockTests={mockTests}
      allTopics={topics}
    />
  );
}
