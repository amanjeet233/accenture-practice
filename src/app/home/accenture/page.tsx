import React from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  getAccentureHeaderStats,
  getAccentureModuleCounts,
} from "@/lib/accentureModules";
import { toQuestionSummaryDTO } from "@/lib/dto";
import {
  AccentureUnifiedHubClient,
  HubTab,
} from "./AccentureUnifiedHubClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accenture Unified Assessment & Practice Hub | CodeTrack",
  description:
    "Unified Accenture preparation hub. Covers 2,610+ verified MCQs, topic-wise DSA coding with OpenJDK 21 execution, SQL sandboxing with SQLite schemas, and interactive Frontend challenges.",
};

export default async function AccentureHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await getSessionUser();
  const resolvedParams = searchParams ? await searchParams : {};
  const requestedTab = (resolvedParams.tab?.toUpperCase() as HubTab) || "OVERVIEW";

  // Fetch all non-MCQ questions (Coding, SQL, Frontend) and any linked Accenture questions
  const [moduleCounts, headerStats, rawQuestions, rawMockTests, topics] =
    await Promise.all([
      getAccentureModuleCounts(user?.id),
      getAccentureHeaderStats(user?.id),
      prisma.question.findMany({
        where: {
          OR: [
            { companies: { contains: "accenture" } },
            { questionCompanies: { some: { company: { slug: "accenture" } } } },
            { questionType: { not: "MCQ" } },
          ],
        },
        include: {
          questionTopics: { include: { topic: true } },
          questionCompanies: { include: { company: true } },
          questionSources: { include: { sourceDocument: true } },
          bookmarks: user?.id ? { where: { userId: user.id } } : false,
          progress: user?.id ? { where: { userId: user.id } } : false,
        },
        orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
      }),
      prisma.mockTest.findMany({
        where: {
          OR: [
            { company: { contains: "Accenture" } },
            { companyRef: { slug: "accenture" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.topic.findMany({
        orderBy: { name: "asc" },
        select: { name: true, slug: true, category: true },
      }),
    ]);

  const formattedQuestions = rawQuestions.map(toQuestionSummaryDTO);

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

  return (
    <AccentureUnifiedHubClient
      initialQuestions={formattedQuestions}
      mockTests={mockTests}
      allTopics={topics}
      moduleCounts={moduleCounts as any}
      headerStats={headerStats}
      initialTab={requestedTab}
    />
  );
}
