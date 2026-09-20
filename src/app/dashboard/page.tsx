import React from "react";
import Link from "next/link";
import { getDashboardAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { DifficultyBadge, MustDoBadge, SourceBadge } from "@/components/ui/Badge";
import {
  Code2,
  Database,
  Globe,
  Flame,
  Timer,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { analyzeQuestionEvidence } from "@/lib/importance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate Preparation Dashboard | CodeTrack",
  description:
    "Production coding preparation platform with verified company PYQs, progressive hint reveals, and native OpenJDK 21 execution.",
};

export default async function PreparationDashboardPage() {
  const [analytics, practiceQuestions] = await Promise.all([
    getDashboardAnalytics(),
    prisma.question.findMany({
      take: 10,
      orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
      include: {
        questionTopics: { include: { topic: true } },
        questionSources: { include: { sourceDocument: true } },
      },
    }),
  ]);

  const { metrics, topicAnalysis, weakAreas, history } = analytics;
  const isZeroData = metrics.totalSubmissions === 0 && metrics.totalSolved === 0;

  // Curated topics for the compact Topic Progress section
  const dsaHighlights = topicAnalysis.dsa.slice(0, 5);
  const sqlHighlights = topicAnalysis.sql.slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. Welcome & Preparation Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#58A6FF] font-medium uppercase tracking-wider">
              Preparation Track
            </span>
            <span className="text-[#30363D]">•</span>
            <span className="text-[11px] font-mono text-[#8B949E]">Accenture Technical Hiring</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC]">
            Preparation Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/questions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#F0F6FC] text-xs font-mono font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Problem Bank</span>
          </Link>
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0D1117] text-xs font-mono font-semibold transition-colors"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Take Mock Test</span>
          </Link>
        </div>
      </div>

      {/* 2. Preparation Overview: 4 Compact Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {/* Solved */}
        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-1">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px]">
            <span>SOLVED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
          </div>
          <div className="text-xl font-bold text-[#F0F6FC]">
            {metrics.totalSolved}{" "}
            <span className="text-[11px] font-normal text-[#8B949E]">/ {metrics.totalQuestions}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#8B949E]">
            <span>{metrics.codingSolved} DSA</span>
            <span>•</span>
            <span>{metrics.sqlSolved} SQL</span>
            <span>•</span>
            <span>{metrics.frontendSolved} FE</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-1">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px]">
            <span>ACCURACY</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#58A6FF]" />
          </div>
          <div className="text-xl font-bold text-[#58A6FF]">
            {metrics.accuracy}%
          </div>
          <div className="text-[10px] text-[#8B949E] truncate">
            {metrics.acceptedSubmissions}/{metrics.totalSubmissions} submissions passed
          </div>
        </div>

        {/* Streak */}
        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-1">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px]">
            <span>STREAK</span>
            <Flame className="w-3.5 h-3.5 text-[#D29922]" />
          </div>
          <div className="text-xl font-bold text-[#D29922]">
            {metrics.currentStreak} <span className="text-[11px] font-normal text-[#8B949E]">Days</span>
          </div>
          <div className="text-[10px] text-[#8B949E]">
            Best: {metrics.longestStreak} days
          </div>
        </div>

        {/* Mock Tests */}
        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-1">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px]">
            <span>MOCK TESTS</span>
            <Award className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>
          <div className="text-xl font-bold text-[#F0F6FC]">
            {metrics.mockTestsCompleted}
          </div>
          <div className="text-[10px] text-[#8B949E]">
            Avg: {metrics.averageMockScore} Pts
          </div>
        </div>
      </div>

      {/* 3. ZERO-DATA STATE (Section 7) */}
      {isZeroData ? (
        <div className="p-6 rounded-md bg-[#161B22] border border-[#30363D] space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#F0F6FC]">
              Start solving your first problem.
            </h2>
            <p className="text-xs text-[#8B949E]">
              Your preparation progress, topic mastery, and weak-area diagnostics will appear here once you begin practicing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/questions"
              className="p-3.5 rounded-md bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#F0F6FC] group-hover:text-[#58A6FF]">
                <span>Solve a Problem</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#58A6FF] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-[#8B949E] leading-relaxed">
                Explore 106 curated technical questions across DSA, String parsing, and Arrays.
              </p>
            </Link>

            <Link
              href="/companies/accenture"
              className="p-3.5 rounded-md bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#F0F6FC] group-hover:text-[#58A6FF]">
                <span>Explore Accenture PYQs</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#58A6FF] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-[#8B949E] leading-relaxed">
                Practice 50 official reported problems and recurring assessment patterns.
              </p>
            </Link>

            <Link
              href="/sql"
              className="p-3.5 rounded-md bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#F0F6FC] group-hover:text-[#58A6FF]">
                <span>Practice SQL</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#58A6FF] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-[#8B949E] leading-relaxed">
                Execute queries against sandboxed database schemas with instant diff validation.
              </p>
            </Link>

            <Link
              href="/mock-tests"
              className="p-3.5 rounded-md bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#F0F6FC] group-hover:text-[#58A6FF]">
                <span>Take a Mock Test</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#58A6FF] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-[#8B949E] leading-relaxed">
                Experience full-length timed assessments calibrated to the 60-minute ASE format.
              </p>
            </Link>
          </div>
        </div>
      ) : null}

      {/* 4. Topic Progress & Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Topic Progress */}
        <div className="p-4 rounded-md bg-[#161B22] border border-[#30363D] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px] font-semibold uppercase tracking-wider">
            <span>Topic Progress</span>
            <Link href="/progress" className="text-[#58A6FF] hover:underline font-normal">
              View All Topics
            </Link>
          </div>

          <div className="space-y-2.5">
            {dsaHighlights.concat(sqlHighlights).slice(0, 6).map((topic) => {
              const solvedRatio = topic.totalQuestions ? (topic.solvedCount / topic.totalQuestions) * 100 : 0;
              return (
                <div key={topic.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#F0F6FC]">{topic.name}</span>
                    <span className="text-[#8B949E]">
                      {topic.solvedCount}/{topic.totalQuestions} ({Math.round(solvedRatio)}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#21262D] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#58A6FF] h-full rounded-full transition-all"
                      style={{ width: `${solvedRatio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Weak Areas */}
        <div className="p-4 rounded-md bg-[#161B22] border border-[#30363D] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px] font-semibold uppercase tracking-wider">
            <span>Weak Areas Diagnostic</span>
            <span className="text-[10px] text-[#6E7681]">Ground truth data</span>
          </div>

          {weakAreas.length > 0 ? (
            <div className="space-y-2">
              {weakAreas.slice(0, 4).map((w) => (
                <div
                  key={w.name}
                  className="p-2.5 rounded bg-[#0D1117] border border-[#30363D] flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-[#F0F6FC]">{w.name}</div>
                    <div className="text-[10px] text-[#8B949E]">
                      {w.acceptedSubmissions}/{w.totalSubmissions} attempts passed
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F85149]/10 text-[#F85149] border border-[#F85149]/30">
                    {w.accuracy}% Acc
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] text-xs">
              {isZeroData
                ? "No weak areas detected. Solve problems to populate diagnostic feedback."
                : "All attempted topics have demonstrated proficiency."}
            </div>
          )}
        </div>
      </div>

      {/* 5. Continue Practicing: Dense Problem Table */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden">
        <div className="p-3 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F0F6FC]">
              Continue Practicing
            </h2>
            <span className="text-[11px] font-mono text-[#8B949E]">
              (High Frequency Questions)
            </span>
          </div>
          <Link
            href="/questions"
            className="text-xs font-mono text-[#58A6FF] hover:underline"
          >
            View All ({metrics.totalQuestions})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117]/60 text-[#8B949E] font-mono text-[11px]">
                <th className="py-2 px-3 w-10 text-center">Status</th>
                <th className="py-2 px-3">Problem</th>
                <th className="py-2 px-3 w-20">Difficulty</th>
                <th className="py-2 px-3 w-28">Source</th>
                <th className="py-2 px-3 w-24">Priority</th>
                <th className="py-2 px-3 w-16 text-center">Freq</th>
                <th className="py-2 px-3 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60 font-mono">
              {practiceQuestions.map((q) => {
                const topics = JSON.parse(q.topics || "[]");
                const evidence = analyzeQuestionEvidence({
                  ...q,
                  topics,
                  companies: JSON.parse(q.companies || "[]"),
                });

                return (
                  <tr
                    key={q.id}
                    className="hover:bg-[#21262D]/50 transition-colors"
                  >
                    <td className="py-2 px-3 text-center">
                      <Circle className="w-3.5 h-3.5 text-[#30363D] inline-block" />
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/questions/${q.slug}`}
                        className="font-medium text-[#F0F6FC] hover:text-[#58A6FF] transition-colors"
                      >
                        {q.title}
                      </Link>
                      <div className="text-[10px] text-[#8B949E] truncate">
                        {topics.slice(0, 3).join(" · ")}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <DifficultyBadge difficulty={q.difficulty as any} />
                    </td>
                    <td className="py-2 px-3">
                      <SourceBadge sourceType={q.sourceType as any} sourceShift={q.sourceShift} />
                    </td>
                    <td className="py-2 px-3">
                      {evidence.isMustDo ? (
                        <MustDoBadge />
                      ) : (
                        <span className="text-[10px] text-[#8B949E] font-mono">{q.importance}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center text-[#8B949E]">
                      {q.frequency > 1 ? `${q.frequency}x` : "-"}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Link
                        href={`/questions/${q.slug}`}
                        className="px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] text-[11px] transition-colors"
                      >
                        Solve
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Recent Activity Log */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-[#8B949E] text-[11px] font-semibold uppercase tracking-wider">
          <span>Recent Activity</span>
          <Link href="/submissions" className="text-[#58A6FF] hover:underline font-normal">
            Full History
          </Link>
        </div>

        {history && history.length > 0 ? (
          <div className="divide-y divide-[#30363D]/60">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="py-2 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === "ACCEPTED" ? "bg-[#3FB950]" : "bg-[#F85149]"
                    }`}
                  />
                  <Link
                    href={`/questions/${item.questionSlug}`}
                    className="text-[#F0F6FC] hover:text-[#58A6FF]"
                  >
                    {item.questionTitle}
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-[#8B949E] text-[11px]">
                  <span>{item.language}</span>
                  {item.runtime && <span>{item.runtime}ms</span>}
                  <span
                    className={
                      item.status === "ACCEPTED" ? "text-[#3FB950]" : "text-[#F85149]"
                    }
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-[#8B949E] text-xs">
            No submissions recorded yet. Attempt a question to start your activity log.
          </div>
        )}
      </div>
    </div>
  );
}
