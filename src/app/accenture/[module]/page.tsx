import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ACCENTURE_MODULES,
  ACCENTURE_COMPANY_FILTER,
} from "@/lib/accentureModules";
import { DifficultyBadge, SourceBadge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  Circle,
  ArrowLeft,
  Timer,
  ExternalLink,
  Code2,
  TrendingUp,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { getAccentureTestAnalytics } from "@/lib/testAnalyticsService";
import { AccentureTestAnalyticsView } from "@/components/analytics/AccentureTestAnalyticsView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const mod = ACCENTURE_MODULES.find((m) => m.slug === module);
  if (!mod) return { title: "Not Found | CodeTrack" };

  return {
    title: `${mod.name} | Accenture Assessment Preparation | CodeTrack`,
    description: mod.description,
  };
}

export default async function AccentureModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const mod = ACCENTURE_MODULES.find((m) => m.slug === module);

  if (!mod) {
    notFound();
  }

  const Icon = mod.icon;

  // Render Mock Tests
  if (mod.type === "MOCK_TESTS") {
    const mockTests = await prisma.mockTest.findMany({
      where: {
        OR: [
          { company: { contains: "Accenture" } },
          { companyRef: { slug: "accenture" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-xs">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
          <Link href="/dashboard" className="hover:text-[#F0F6FC] transition-colors">
            CODERTRACK
          </Link>
          <span>/</span>
          <Link href="/accenture" className="hover:text-[#F0F6FC] transition-colors">
            ACCENTURE
          </Link>
          <span>/</span>
          <span className="text-[#58A6FF] font-semibold uppercase">{mod.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2.5 font-mono">
              <Icon className="w-5 h-5 text-[#58A6FF]" />
              {mod.name}
            </h1>
            <p className="text-xs text-[#8B949E] max-w-2xl">{mod.description}</p>
          </div>
          <div className="text-xs font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded shrink-0">
            {mockTests.length} Mock Tests
          </div>
        </div>

        {/* Full Timed Mock Test Feature Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-md border border-[#D29922]/40 bg-[#161B22] shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-[#D29922]/15 border border-[#D29922]/30 flex items-center justify-center text-[#E3B341] shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-sm text-[#F0F6FC]">
                  Accenture Full Assessment Simulation
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 font-mono font-semibold">
                  TIMED EXAM
                </span>
              </div>
              <p className="text-xs text-[#8B949E]">
                30 Questions • 30 Minutes • Strict exam conditions with countdown timer, server-side evaluation, and detailed scorecard review.
              </p>
            </div>
          </div>
          <Link
            href="/accenture/test"
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-mono text-xs font-semibold shrink-0 transition-colors"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Launch Timed Mock Test</span>
          </Link>
        </div>

        {/* Mock Test Cards Grid */}
        {mockTests.length === 0 ? (
          <div className="rounded-md border border-[#30363D] bg-[#161B22] p-12 text-center text-[#8B949E] font-mono text-xs">
            0 Mock Tests available currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockTests.map((mt) => (
              <div
                key={mt.id}
                className="p-4 rounded border border-[#30363D] bg-[#161B22] hover:border-[#58A6FF]/40 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262D] text-[#58A6FF] border border-[#30363D]">
                      {mt.durationMins} MINS
                    </span>
                    <span className="text-[10px] font-mono text-[#8B949E]">
                      Pass: {mt.passingMarks}/{mt.totalMarks}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#F0F6FC]">{mt.title}</h3>
                  <p className="text-[11px] text-[#8B949E] leading-relaxed line-clamp-2">
                    {mt.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#30363D]/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6E7681]">
                    Accenture Pattern
                  </span>
                  <Link
                    href={`/mock-tests/${mt.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262D] text-[#F0F6FC] hover:bg-[#30363D] hover:text-[#3FB950] border border-[#30363D] text-xs font-mono font-medium transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Start Test</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Progress Dashboard
  if (mod.type === "PROGRESS") {
    const [solvedQuestions, totalQuestions, analyticsData] = await Promise.all([
      prisma.userProgress.findMany({
        where: { isSolved: true },
        select: { questionId: true },
      }),
      prisma.question.count({ where: ACCENTURE_COMPANY_FILTER }),
      getAccentureTestAnalytics(),
    ]);

    const solvedCount = solvedQuestions.length;
    const progressPct =
      totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-xs">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
          <Link href="/dashboard" className="hover:text-[#F0F6FC] transition-colors">
            CODERTRACK
          </Link>
          <span>/</span>
          <Link href="/accenture" className="hover:text-[#F0F6FC] transition-colors">
            ACCENTURE
          </Link>
          <span>/</span>
          <span className="text-[#58A6FF] font-semibold uppercase">{mod.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2.5 font-mono">
              <Icon className="w-5 h-5 text-[#3FB950]" />
              {mod.name}
            </h1>
            <p className="text-xs text-[#8B949E] max-w-2xl">{mod.description}</p>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Link
              href="/accenture/test"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold transition-colors"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Take Mock Test</span>
            </Link>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
            <div className="text-[10px] text-[#8B949E] uppercase">Solved Questions</div>
            <div className="text-xl font-bold text-[#F0F6FC] mt-1">{solvedCount}</div>
            <div className="text-[10px] text-[#6E7681] mt-0.5">
              Out of {totalQuestions} total
            </div>
          </div>
          <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
            <div className="text-[10px] text-[#8B949E] uppercase">Completion Rate</div>
            <div className="text-xl font-bold text-[#3FB950] mt-1">{progressPct}%</div>
            <div className="text-[10px] text-[#6E7681] mt-0.5">Accenture curriculum</div>
          </div>
          <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
            <div className="text-[10px] text-[#8B949E] uppercase">Readiness Assessment</div>
            <div className="text-xl font-bold text-[#58A6FF] mt-1">
              {progressPct >= 70 ? "HIGH" : progressPct >= 30 ? "MODERATE" : "EARLY"}
            </div>
            <div className="text-[10px] text-[#6E7681] mt-0.5">
              Based on completed questions
            </div>
          </div>
        </div>

        {/* Full Analytics Component */}
        <div className="pt-2">
          <AccentureTestAnalyticsView data={analyticsData} />
        </div>
      </div>
    );
  }

  // Render Questions Module Table
  const [questions, userProgress] = await Promise.all([
    prisma.question.findMany({
      where: {
        AND: [ACCENTURE_COMPANY_FILTER, mod.queryFilter],
      },
      orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
    }),
    prisma.userProgress.findMany({
      where: { isSolved: true },
      select: { questionId: true },
    }),
  ]);

  const solvedSet = new Set(userProgress.map((p) => p.questionId));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans text-xs">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
        <Link href="/dashboard" className="hover:text-[#F0F6FC] transition-colors">
          CODERTRACK
        </Link>
        <span>/</span>
        <Link href="/accenture" className="hover:text-[#F0F6FC] transition-colors">
          ACCENTURE
        </Link>
        <span>/</span>
        <span className="text-[#58A6FF] font-semibold uppercase">{mod.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2.5 font-mono">
            <Icon className="w-5 h-5 text-[#58A6FF]" />
            {mod.name}
          </h1>
          <p className="text-xs text-[#8B949E] max-w-2xl">{mod.description}</p>
        </div>
      </div>

      {/* Practice Mode Quick Action Banner */}
      {questions.some((q) => q.questionType === "MCQ") && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-md border border-[#58A6FF]/30 bg-[#161B22] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#58A6FF]/15 border border-[#58A6FF]/30 flex items-center justify-center text-[#58A6FF] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono font-semibold text-xs text-[#F0F6FC] flex items-center gap-2">
                <span>Accenture MCQ Practice Mode</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 font-mono">
                  Instant Feedback
                </span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Fullscreen interactive workspace with instant evaluation, 4 options, explanations, and question navigator.
              </p>
            </div>
          </div>
          <Link
            href={`/accenture/mcq/practice?module=${mod.slug}`}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-mono text-xs font-semibold shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Practice Mode</span>
          </Link>
        </div>
      )}

      {/* Question Table / Zero State */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden">
        {questions.length === 0 ? (
          <div className="p-12 text-center text-[#8B949E] font-mono text-xs space-y-2">
            <p className="text-[#F0F6FC] font-semibold">0 Questions</p>
            <p className="text-[11px] text-[#6E7681]">
              No questions currently in database for this category.
            </p>
            <div className="pt-2">
              <Link
                href="/accenture"
                className="inline-flex items-center gap-1.5 text-[#58A6FF] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Browse other Accenture modules</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] font-mono text-[11px]">
                  <th className="py-2 px-3 w-10 text-center">Status</th>
                  <th className="py-2 px-3">Problem</th>
                  <th className="py-2 px-3 w-20">Difficulty</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 w-36">Classification</th>
                  <th className="py-2 px-3 w-16 text-center">Freq</th>
                  <th className="py-2 px-3 w-20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/60 font-mono">
                {questions.map((q) => {
                  const isSolved = solvedSet.has(q.id);

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-[#21262D]/40 transition-colors"
                    >
                      {/* Solved Status */}
                      <td className="py-2 px-3 text-center">
                        {isSolved ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] inline-block" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#30363D] inline-block" />
                        )}
                      </td>

                      {/* Problem Title */}
                      <td className="py-2 px-3">
                        <Link
                          href={`/questions/${q.slug}`}
                          className="font-medium text-[#F0F6FC] hover:text-[#58A6FF] transition-colors"
                        >
                          {q.title}
                        </Link>
                        {q.importanceReason && (
                          <div className="text-[10px] text-[#6E7681] truncate max-w-lg mt-0.5">
                            {q.importanceReason}
                          </div>
                        )}
                      </td>

                      {/* Difficulty */}
                      <td className="py-2 px-3">
                        <DifficultyBadge difficulty={q.difficulty as any} />
                      </td>

                      {/* Category */}
                      <td className="py-2 px-3">
                        <span className="text-[11px] text-[#8B949E] truncate block max-w-xs">
                          {q.category || "General"}
                        </span>
                      </td>

                      {/* Source Classification */}
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border inline-block ${
                            q.sourceType === "ACCENTURE_SHIFT_REPORTED"
                              ? "text-[#3FB950] border-[#3FB950]/30 bg-[#3FB950]/10"
                              : q.sourceType === "ACCENTURE_PATTERN"
                              ? "text-[#58A6FF] border-[#58A6FF]/30 bg-[#58A6FF]/10"
                              : q.sourceType === "SOURCE_INCONSISTENT"
                              ? "text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10"
                              : "text-[#8B949E] border-[#30363D] bg-[#21262D]"
                          }`}
                        >
                          {q.sourceType}
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="py-2 px-3 text-center text-[#8B949E]">
                        {q.frequency > 1 ? `${q.frequency}x` : "1x"}
                      </td>

                      {/* Action */}
                      <td className="py-2 px-3 text-right">
                        {q.questionType === "MCQ" ? (
                          <Link
                            href={`/accenture/mcq/practice?category=${encodeURIComponent(q.category || "")}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] hover:text-[#58A6FF] border border-[#30363D] text-[11px] transition-colors font-medium"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#58A6FF]" />
                            <span>Practice</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/questions/${q.slug}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] hover:text-[#58A6FF] border border-[#30363D] text-[11px] transition-colors"
                          >
                            <span>Solve</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
