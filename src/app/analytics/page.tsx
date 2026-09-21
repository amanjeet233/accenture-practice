import React from "react";
import { getDashboardAnalytics } from "@/lib/analytics";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";
import { TopicAnalysisCard } from "@/components/dashboard/TopicAnalysisCard";
import { SubmissionHistoryTable } from "@/components/dashboard/SubmissionHistoryTable";
import { BarChart3, Clock, Target, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate Performance Analytics & Metrics | CodeTrack",
  description: "Objective evaluation diagnostics, topic precision, and submission latency records.",
};

export default async function AnalyticsPage() {
  const analytics = await getDashboardAnalytics();
  const { metrics, topicAnalysis, weakAreas, heatmap, history } = analytics;

  const runtimes = (history || [])
    .filter((s: any) => s.runtime !== null && s.runtime > 0)
    .map((s: any) => s.runtime as number);

  const avgRuntime =
    runtimes.length > 0 ? Math.round(runtimes.reduce((a: number, b: number) => a + b, 0) / runtimes.length) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Candidate Performance Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Objective algorithmic latency, acceptance precision, and concept mastery diagnostics derived from active sandbox evaluation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
          >
            Preparation Dashboard
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>ACCEPTANCE RATE</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.accuracy}%</div>
          <p className="text-[11px] text-zinc-500">
            {metrics.acceptedSubmissions} accepted / {metrics.totalSubmissions} submissions
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>AVERAGE LATENCY</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgRuntime} ms</div>
          <p className="text-[11px] text-zinc-500">
            Measured execution across all test suites
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>PROBLEMS SOLVED</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalSolved}</div>
          <p className="text-[11px] text-zinc-500">
            Out of {metrics.totalQuestions} repository problems
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>CURRENT STREAK</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {metrics.currentStreak} Day{metrics.currentStreak === 1 ? "" : "s"}
          </div>
          <p className="text-[11px] text-zinc-500">
            Continuous active preparation streak
          </p>
        </div>
      </div>

      {/* Heatmap Section */}
      <ContributionHeatmap
        days={heatmap.days}
        currentStreak={heatmap.currentStreak}
        longestStreak={heatmap.longestStreak}
        totalActiveDays={heatmap.totalActiveDays}
      />

      {/* Topic Accuracy Matrix & Weak Areas */}
      <TopicAnalysisCard
        dsaTopics={topicAnalysis.dsa}
        sqlTopics={topicAnalysis.sql}
        frontendTopics={topicAnalysis.frontend}
        weakAreas={weakAreas}
      />

      {/* History */}
      <SubmissionHistoryTable history={history} />
    </div>
  );
}
