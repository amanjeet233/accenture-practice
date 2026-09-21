import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ACCENTURE_MODULES,
  getAccentureModuleCounts,
  getAccentureHeaderStats,
} from "@/lib/accentureModules";
import {
  ArrowRight,
  Sparkles,
  Timer,
  Play,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accenture Assessment Preparation Hub | CodeTrack",
  description:
    "Prepare for Accenture assessments with MCQs, pseudocode, technical topics, coding, SQL, frontend, communication, interview preparation and mock tests.",
};

export default async function AccentureHubPage() {
  const user = await getSessionUser();
  const userId = user?.id;

  const [stats, moduleCounts, recentAttempts] = await Promise.all([
    getAccentureHeaderStats(userId),
    getAccentureModuleCounts(userId),
    prisma.testAttempt.findMany({
      where: {
        ...(userId ? { userId } : { userId: "none" }),
        mockTest: {
          OR: [
            { company: { contains: "Accenture" } },
            { companyRef: { slug: "accenture" } },
          ],
        },
      },
      include: { mockTest: true },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-xs">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
        <Link href="/dashboard" className="hover:text-[#F0F6FC] transition-colors">
          CODERTRACK
        </Link>
        <span>/</span>
        <span className="text-[#F0F6FC] font-semibold tracking-wider">ACCENTURE</span>
      </div>

      {/* Header Box */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#58A6FF] uppercase tracking-wider font-semibold">
            <span>Assessment Preparation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F0F6FC] font-mono">
            ACCENTURE
          </h1>
          <p className="text-xs text-[#8B949E] max-w-3xl leading-relaxed">
            Prepare for Accenture assessments with MCQs, pseudocode, technical topics,
            coding, SQL, frontend, communication, interview preparation and mock tests.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#30363D]/60 font-mono text-xs">
          <Link
            href="/accenture/mcq/practice"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262D] text-[#F0F6FC] hover:bg-[#30363D] hover:text-[#58A6FF] border border-[#30363D] transition-colors font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Practice MCQs</span>
          </Link>
          <Link
            href="/accenture/test"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262D] text-[#F0F6FC] hover:bg-[#30363D] hover:text-[#3FB950] border border-[#30363D] transition-colors font-medium"
          >
            <Timer className="w-3.5 h-3.5 text-[#3FB950]" />
            <span>Start Mock Test</span>
          </Link>
          <Link
            href="/accenture/coding"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262D] text-[#F0F6FC] hover:bg-[#30363D] hover:text-[#D29922] border border-[#30363D] transition-colors font-medium"
          >
            <Play className="w-3.5 h-3.5 text-[#D29922]" />
            <span>Continue Practice</span>
          </Link>
        </div>
      </div>

      {/* Real Database Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]/80">
          <div className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">
            Questions
          </div>
          <div className="text-xl font-bold font-mono text-[#F0F6FC] mt-1">
            {stats.totalQuestions}
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">Accenture problem bank</div>
        </div>

        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]/80">
          <div className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">
            Mock Tests
          </div>
          <div className="text-xl font-bold font-mono text-[#F0F6FC] mt-1">
            {stats.totalMockTests}
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">Simulated test suites</div>
        </div>

        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]/80">
          <div className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">
            Attempted
          </div>
          <div className="text-xl font-bold font-mono text-[#F0F6FC] mt-1">
            {stats.totalAttempts}
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">User test sessions</div>
        </div>

        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]/80">
          <div className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">
            Accuracy
          </div>
          <div className="text-xl font-bold font-mono text-[#3FB950] mt-1">
            {stats.accuracy}%
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">Overall pass rating</div>
        </div>
      </div>

      {/* Modules Area Header */}
      <div className="space-y-1 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold font-mono tracking-wide text-[#F0F6FC] uppercase">
            Assessment Modules
          </h2>
          <span className="text-[11px] font-mono text-[#8B949E]">
            14 Preparation Domains
          </span>
        </div>
        <p className="text-xs text-[#8B949E]">
          Explore individual topics, question formats, mock tests, and progress tracking.
        </p>
      </div>

      {/* Modules Navigation Cards/Rows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {ACCENTURE_MODULES.map((mod) => {
          const Icon = mod.icon;
          const count = moduleCounts[mod.slug] ?? 0;
          const countLabel =
            mod.type === "MOCK_TESTS"
              ? `${count} Mock Tests`
              : mod.type === "PROGRESS"
              ? `${count} Solved`
              : `${count} Questions`;

          return (
            <Link
              key={mod.slug}
              href={`/accenture/${mod.slug}`}
              className="group p-3.5 rounded border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] hover:border-[#58A6FF]/40 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded bg-[#0D1117] border border-[#30363D] text-[#58A6FF] group-hover:text-[#F0F6FC] transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#F0F6FC] group-hover:text-[#58A6FF] transition-colors truncate">
                      {mod.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#8B949E] bg-[#0D1117] px-1.5 py-0.5 rounded border border-[#30363D]">
                      {countLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] mt-1 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#58A6FF] group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Activity & Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        {/* Recent Activity */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2">
            <h3 className="text-xs font-semibold font-mono tracking-wide text-[#F0F6FC] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#58A6FF]" />
              Recent Activity
            </h3>
            <span className="text-[10px] font-mono text-[#8B949E]">
              {recentAttempts.length} logged
            </span>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="py-8 text-center text-[#8B949E] font-mono text-xs space-y-2">
              <p>No activity yet.</p>
              <p className="text-[10px] text-[#6E7681]">
                Complete questions or start a mock test to track your attempts here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((att) => {
                const title = att.mockTest?.title || "Accenture Assessment";
                const totalMarks = att.mockTest?.totalMarks || att.totalQuestions || 30;
                const passingMarks = att.mockTest?.passingMarks || Math.round(totalMarks * 0.65);
                const isPassed = att.score >= passingMarks;
                return (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded bg-[#0D1117] border border-[#30363D]/60 text-xs font-mono"
                  >
                    <div className="truncate pr-2">
                      <span className="text-[#F0F6FC] font-medium">
                        {title}
                      </span>
                      <div className="text-[10px] text-[#8B949E]">
                        Score: {att.score}/{totalMarks} ({Math.round(att.accuracy)}%)
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        isPassed
                          ? "text-[#3FB950] border-[#3FB950]/30 bg-[#3FB950]/10"
                          : "text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10"
                      }`}
                    >
                      {isPassed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress Summary */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2">
            <h3 className="text-xs font-semibold font-mono tracking-wide text-[#F0F6FC] flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#3FB950]" />
              Progress Summary
            </h3>
            <Link
              href="/accenture/progress"
              className="text-[10px] font-mono text-[#58A6FF] hover:underline flex items-center gap-1"
            >
              Detailed Analytics <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8B949E]">Total Question Bank</span>
                <span className="text-[#F0F6FC]">{stats.totalQuestions} Questions</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#21262D] overflow-hidden">
                <div
                  className="h-full bg-[#58A6FF] rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalQuestions > 0
                        ? Math.min(100, Math.round((stats.totalAttempts / stats.totalQuestions) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]/60">
                <div className="text-[#8B949E] text-[10px]">Active Tests</div>
                <div className="text-[#F0F6FC] font-bold text-sm mt-0.5">
                  {stats.totalMockTests}
                </div>
              </div>
              <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]/60">
                <div className="text-[#8B949E] text-[10px]">Mastery Status</div>
                <div className="text-[#3FB950] font-bold text-sm mt-0.5">
                  {stats.totalAttempts > 0 ? "IN PROGRESS" : "NOT STARTED"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
