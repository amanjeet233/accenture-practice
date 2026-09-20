import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  DifficultyBadge,
  MustDoBadge,
  SourceBadge,
} from "@/components/ui/Badge";
import { CheckCircle2, Circle, Search } from "lucide-react";
import { analyzeQuestionEvidence } from "@/lib/importance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Problems Bank | CodeTrack",
  description:
    "Dense, searchable problem bank with verified company provenance, canonical frequency ratings, and native OpenJDK 21 execution.",
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const filter = resolvedParams.filter;
  const difficulty = resolvedParams.difficulty;
  const importance = resolvedParams.importance;
  const sourceType = resolvedParams.sourceType;
  const topic = resolvedParams.topic;
  const company = resolvedParams.company;
  const category = resolvedParams.category;
  const type = resolvedParams.type;
  const search = resolvedParams.search;

  const where: any = {};

  if (category) where.category = category;

  if (type === "SQL") {
    where.questionType = "SQL";
  } else if (type === "FRONTEND") {
    where.OR = [
      { questionType: "FRONTEND" },
      { questionType: "HTML_CSS_JS" },
      { category: "GENERAL_FRONTEND" },
    ];
  } else if (type === "CODING") {
    where.questionType = "CODING";
  }

  if (filter === "MUST_DO" || importance === "MUST_DO") {
    where.OR = [
      { importance: "MUST_DO" },
      { frequency: { gte: 2 } },
      { importanceReason: { contains: "Must Do" } },
    ];
  } else if (filter === "REPEATED") {
    where.frequency = { gt: 1 };
  } else if (filter === "PYQ" || sourceType === "REPORTED_PYQ") {
    where.sourceType = "REPORTED_PYQ";
  } else if (filter === "REPORTED") {
    where.OR = [
      { sourceType: "REPORTED_PYQ" },
      { sourceType: "SHIFT_REPORTED" },
      { sourceType: "CANDIDATE_REPORTED" },
      { category: "ACCENTURE_REPORTED" },
    ];
  } else if (filter === "EASY" || difficulty === "EASY") {
    where.difficulty = "EASY";
  } else if (filter === "MEDIUM" || difficulty === "MEDIUM") {
    where.difficulty = "MEDIUM";
  } else if (filter === "HARD" || difficulty === "HARD") {
    where.difficulty = "HARD";
  }

  if (topic) where.topics = { contains: topic };
  if (company) where.companies = { contains: company.toLowerCase() };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { topics: { contains: search } },
    ];
  }

  const [questions, progress] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        questionSources: {
          include: { sourceDocument: true },
        },
      },
      orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
    }),
    prisma.userProgress.findMany({
      select: { questionId: true, isSolved: true },
    }),
  ]);

  const solvedSet = new Set(progress.filter((p) => p.isSolved).map((p) => p.questionId));

  const activeFilter = filter || (importance === "MUST_DO" ? "MUST_DO" : difficulty || sourceType || (company ? "ACCENTURE" : type));

  const FILTER_PILLS = [
    { label: "All", href: "/questions", active: !activeFilter && !search && !topic },
    { label: "Accenture", href: "/questions?company=accenture", active: company === "accenture" || activeFilter === "ACCENTURE" },
    { label: "PYQ", href: "/questions?filter=PYQ", active: activeFilter === "PYQ" },
    { label: "Reported", href: "/questions?filter=REPORTED", active: activeFilter === "REPORTED" },
    { label: "Must Do", href: "/questions?filter=MUST_DO", active: activeFilter === "MUST_DO" },
    { label: "Repeated", href: "/questions?filter=REPEATED", active: activeFilter === "REPEATED" },
    { label: "Easy", href: "/questions?filter=EASY", active: activeFilter === "EASY" },
    { label: "Medium", href: "/questions?filter=MEDIUM", active: activeFilter === "MEDIUM" },
    { label: "Hard", href: "/questions?filter=HARD", active: activeFilter === "HARD" },
    { label: "SQL", href: "/questions?type=SQL", active: type === "SQL" },
    { label: "Frontend", href: "/questions?type=FRONTEND", active: type === "FRONTEND" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC]">
            Problems
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            106 verified technical questions calibrated to company assessment standards.
          </p>
        </div>
        <div className="text-xs font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded">
          {questions.length} questions
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-2.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-2.5">
        <form method="GET" className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search questions by title, algorithm, or topic..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363D] rounded text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF] font-mono"
          />
        </form>

        {/* Dense Filter Bar (All, Accenture, PYQ, Reported, Must Do, Repeated, Easy, Medium, Hard, SQL, Frontend) */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {FILTER_PILLS.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                pill.active
                  ? "bg-[#21262D] text-[#F0F6FC] font-semibold border-[#58A6FF]"
                  : "text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC] hover:bg-[#21262D]/60"
              }`}
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Dense Problem Table */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] font-mono text-[11px]">
                <th className="py-2 px-3 w-10 text-center">Status</th>
                <th className="py-2 px-3">Problem</th>
                <th className="py-2 px-3 w-20">Difficulty</th>
                <th className="py-2 px-3">Topics</th>
                <th className="py-2 px-3 w-32">Source</th>
                <th className="py-2 px-3 w-24">Priority</th>
                <th className="py-2 px-3 w-16 text-center">Freq</th>
                <th className="py-2 px-3 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60 font-mono">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8B949E] font-mono text-xs">
                    No questions match the selected criteria.
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const isSolved = solvedSet.has(q.id);
                  const topics = JSON.parse(q.topics || "[]");
                  const companies = JSON.parse(q.companies || "[]");
                  const evidence = analyzeQuestionEvidence({
                    ...q,
                    topics,
                    companies,
                  });

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-[#21262D]/40 transition-colors"
                    >
                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        {isSolved ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] inline-block" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#30363D] inline-block" />
                        )}
                      </td>

                      {/* Problem Title & Category Subtext */}
                      <td className="py-2 px-3">
                        <Link
                          href={`/questions/${q.slug}`}
                          className="font-medium text-[#F0F6FC] hover:text-[#58A6FF] transition-colors"
                        >
                          {q.title}
                        </Link>
                        {q.importanceReason && (
                          <div className="text-[10px] text-[#6E7681] truncate max-w-md">
                            {q.importanceReason}
                          </div>
                        )}
                      </td>

                      {/* Difficulty */}
                      <td className="py-2 px-3">
                        <DifficultyBadge difficulty={q.difficulty as any} />
                      </td>

                      {/* Topics */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {topics.slice(0, 2).map((t: string) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-[#0D1117] text-[#8B949E] border border-[#30363D]"
                            >
                              {t}
                            </span>
                          ))}
                          {topics.length > 2 && (
                            <span className="text-[10px] text-[#6E7681]">
                              +{topics.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-2 px-3">
                        <SourceBadge
                          sourceType={q.sourceType as any}
                          sourceShift={q.sourceShift}
                        />
                      </td>

                      {/* Priority */}
                      <td className="py-2 px-3">
                        {evidence.isMustDo ? (
                          <MustDoBadge />
                        ) : (
                          <span className="text-[10px] text-[#8B949E]">
                            {q.importance}
                          </span>
                        )}
                      </td>

                      {/* Frequency */}
                      <td className="py-2 px-3 text-center text-[#8B949E]">
                        {q.frequency > 1 ? `${q.frequency}x` : "-"}
                      </td>

                      {/* Action */}
                      <td className="py-2 px-3 text-right">
                        <Link
                          href={`/questions/${q.slug}`}
                          className="px-2 py-0.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] text-[11px] transition-colors"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
