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
  Layers,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { analyzeQuestionEvidence } from "@/lib/importance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate Preparation Dashboard | CodeTrack",
  description:
    "Production coding preparation platform with verified company PYQs, progressive hint reveals, and native OpenJDK 21 execution.",
};

export default async function PreparationDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [analytics, practiceQuestions] = await Promise.all([
    getDashboardAnalytics(user.id),
    prisma.question.findMany({
      take: 10,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        questionType: true,
        sourceType: true,
        sourceShift: true,
        topics: true,
        companies: true,
        importance: true,
        frequency: true,
        questionTopics: { select: { topic: { select: { name: true } } } },
        questionSources: { select: { page: true, shift: true, sourceDocument: { select: { title: true, company: true } } } },
      },
      orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
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
      <div className="relative overflow-hidden rounded-xl border border-[#30363D] bg-gradient-to-r from-[#161B22] via-[#0D1117] to-[#161B22] p-5 sm:p-6 shadow-md">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#3FB950]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded border border-[#58A6FF]/20 uppercase tracking-wider">
                PREPARATION TRACK
              </span>
              <span className="text-[#30363D]">•</span>
              <span className="text-[11px] font-mono text-[#8B949E]">Accenture Technical Hiring</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F0F6FC]">
              Welcome, {user.name}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/questions"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#F0F6FC] text-xs font-mono font-medium transition-all hover:border-[#58A6FF]/40"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>Problem Bank</span>
            </Link>
            <Link
              href="/mock-tests"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0D1117] text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(88,166,255,0.25)]"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Take Mock Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Preparation Overview: 4 Glowing Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {/* Solved */}
        <div className="group p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5 transition-all hover:border-[#3FB950]/50 hover:shadow-[0_0_15px_rgba(63,185,80,0.1)]">
          <div className="flex items-center justify-between text-[#8B949E] text-[10px] uppercase font-bold tracking-wider">
            <span>SOLVED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
          </div>
          <div className="text-2xl font-black text-[#3FB950] tracking-tight">
            {metrics.totalSolved}{" "}
            <span className="text-[11px] font-normal text-[#6E7681]">/ {metrics.totalQuestions}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#8B949E]">
            <span className="text-[#3FB950] font-semibold">{metrics.codingSolved} DSA</span>
            <span>•</span>
            <span>{metrics.sqlSolved} SQL</span>
            <span>•</span>
            <span>{metrics.frontendSolved} FE</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="group p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5 transition-all hover:border-[#58A6FF]/50 hover:shadow-[0_0_15px_rgba(88,166,255,0.1)]">
          <div className="flex items-center justify-between text-[#8B949E] text-[10px] uppercase font-bold tracking-wider">
            <span>ACCURACY</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#58A6FF]" />
          </div>
          <div className="text-2xl font-black text-[#58A6FF] tracking-tight">
            {metrics.accuracy}%
          </div>
          <div className="text-[10px] text-[#8B949E] truncate">
            {metrics.acceptedSubmissions}/{metrics.totalSubmissions} passed
          </div>
        </div>

        {/* Streak */}
        <div className="group p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5 transition-all hover:border-[#D29922]/50 hover:shadow-[0_0_15px_rgba(210,153,34,0.1)]">
          <div className="flex items-center justify-between text-[#8B949E] text-[10px] uppercase font-bold tracking-wider">
            <span>STREAK</span>
            <Flame className="w-3.5 h-3.5 text-[#D29922]" />
          </div>
          <div className="text-2xl font-black text-[#D29922] tracking-tight">
            {metrics.currentStreak} <span className="text-[11px] font-normal text-[#6E7681]">Days</span>
          </div>
          <div className="text-[10px] text-[#8B949E]">
            Best: {metrics.longestStreak} days
          </div>
        </div>

        {/* Mock Tests */}
        <div className="group p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5 transition-all hover:border-[#A371F7]/50 hover:shadow-[0_0_15px_rgba(163,113,247,0.1)]">
          <div className="flex items-center justify-between text-[#8B949E] text-[10px] uppercase font-bold tracking-wider">
            <span>MOCK TESTS</span>
            <Award className="w-3.5 h-3.5 text-[#A371F7]" />
          </div>
          <div className="text-2xl font-black text-[#F0F6FC] tracking-tight">
            {metrics.mockTestsCompleted}
          </div>
          <div className="text-[10px] text-[#8B949E]">
            Avg: {metrics.averageMockScore} Pts
          </div>
        </div>
      </div>

      {/* 3. ZERO-DATA STATE (Section 7) */}
      {isZeroData ? (
        <div className="p-6 rounded-xl bg-[#161B22] border border-[#30363D] space-y-5">
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
              className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#F0F6FC] group-hover:text-[#58A6FF]">
                <span>Solve a Problem</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#58A6FF] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-[#8B949E] leading-relaxed">
                Explore curated technical questions across DSA, String parsing, and Arrays.
              </p>
            </Link>

            <Link
              href="/companies/accenture"
              className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#F0F6FC] group-hover:text-[#58A6FF]">
                <span>Explore Accenture PYQs</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-[#58A6FF] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-[#8B949E] leading-relaxed">
                Practice official reported problems and recurring assessment patterns.
              </p>
            </Link>

            <Link
              href="/sql"
              className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
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
              className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF]/60 transition-colors group space-y-2"
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
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px] font-semibold uppercase tracking-wider">
            <span>Topic Progress</span>
            <Link href="/progress" className="text-[#58A6FF] hover:underline font-normal">
              View All Topics
            </Link>
          </div>

          <div className="space-y-3">
            {dsaHighlights.concat(sqlHighlights).slice(0, 6).map((topic: any) => {
              const solvedRatio = topic.totalQuestions ? (topic.solvedCount / topic.totalQuestions) * 100 : 0;
              return (
                <div key={topic.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#F0F6FC] font-medium">{topic.name}</span>
                    <span className="text-[#8B949E]">
                      {topic.solvedCount}/{topic.totalQuestions} ({Math.round(solvedRatio)}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden border border-[#30363D]/50">
                    <div
                      className="bg-gradient-to-r from-[#58A6FF] to-[#3FB950] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, solvedRatio)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Weak Areas */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px] font-semibold uppercase tracking-wider">
            <span>Weak Areas Diagnostic</span>
            <span className="text-[10px] text-[#6E7681]">Ground truth data</span>
          </div>

          {weakAreas.length > 0 ? (
            <div className="space-y-2">
              {weakAreas.slice(0, 4).map((w: any) => (
                <div
                  key={w.name}
                  className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between hover:border-[#F85149]/40 transition-colors"
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
            <div className="p-4 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#8B949E] text-xs">
              {isZeroData
                ? "No weak areas detected. Solve problems to populate diagnostic feedback."
                : "All attempted topics have demonstrated proficiency."}
            </div>
          )}
        </div>
      </div>

      {/* 5. Continue Practicing: Dense Problem Table */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] overflow-hidden">
        <div className="p-4 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F0F6FC]">
              Continue Practicing
            </h2>
            <span className="text-[11px] font-mono text-[#8B949E]">
              (High Frequency Questions)
            </span>
          </div>
          <Link
            href="/questions"
            className="text-xs font-mono text-[#58A6FF] hover:underline font-semibold"
          >
            View All ({metrics.totalQuestions})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] font-mono text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">Status</th>
                <th className="py-2.5 px-3">Problem</th>
                <th className="py-2.5 px-3 w-20">Difficulty</th>
                <th className="py-2.5 px-3 w-28">Source</th>
                <th className="py-2.5 px-3 w-24">Priority</th>
                <th className="py-2.5 px-3 w-16 text-center">Freq</th>
                <th className="py-2.5 px-3 w-20 text-right">Action</th>
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
                    className="hover:bg-[#21262D]/60 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center">
                      <Circle className="w-3.5 h-3.5 text-[#30363D] inline-block" />
                    </td>
                    <td className="py-2.5 px-3">
                      <Link
                        href={`/questions/${q.slug}`}
                        className="font-semibold text-[#F0F6FC] hover:text-[#58A6FF] transition-colors"
                      >
                        {q.title}
                      </Link>
                      <div className="text-[10px] text-[#8B949E] truncate">
                        {topics.slice(0, 3).join(" · ")}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <DifficultyBadge difficulty={q.difficulty as any} />
                    </td>
                    <td className="py-2.5 px-3">
                      <SourceBadge sourceType={q.sourceType as any} sourceShift={q.sourceShift} />
                    </td>
                    <td className="py-2.5 px-3">
                      {evidence.isMustDo ? (
                        <MustDoBadge />
                      ) : (
                        <span className="text-[10px] text-[#8B949E] font-mono">{q.importance}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#8B949E]">
                      {q.frequency > 1 ? `${q.frequency}x` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/questions/${q.slug}`}
                        className="px-3 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-[11px] transition-colors"
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
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-[#8B949E] text-[11px] font-semibold uppercase tracking-wider">
          <span>Recent Activity</span>
          <Link href="/submissions" className="text-[#58A6FF] hover:underline font-normal">
            Full History
          </Link>
        </div>

        {history && history.length > 0 ? (
          <div className="divide-y divide-[#30363D]/60">
            {history.slice(0, 5).map((item: any) => (
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
