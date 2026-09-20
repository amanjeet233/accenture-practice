import React from "react";
import Link from "next/link";
import { getDashboardAnalytics } from "@/lib/analytics";
import { RevisionTabsCard } from "@/components/dashboard/RevisionTabsCard";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";
import { TopicAnalysisCard } from "@/components/dashboard/TopicAnalysisCard";
import { TrendingUp, CheckCircle2, Flame, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Progress & Topic Mastery | CodeTrack",
  description: "Live database-grounded preparation analytics, topic mastery matrix, and spaced repetition revision queues.",
};

export default async function ProgressPage() {
  const analytics = await getDashboardAnalytics();
  const { metrics, topicAnalysis, weakAreas, revision, heatmap } = analytics;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/dashboard" className="hover:text-[#F0F6FC]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">Progress</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#58A6FF]" />
            Preparation Progress & Analytics
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Real submission metrics, topic mastery diagnostics, and active recall queues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-[11px] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* 3 Compact Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px]">
            <span>TOTAL PROBLEMS SOLVED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
          </div>
          <div className="text-xl font-bold text-[#F0F6FC]">
            {metrics.totalSolved} <span className="text-[11px] font-normal text-[#8B949E]">/ {metrics.totalQuestions}</span>
          </div>
          <div className="w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden border border-[#30363D]/40">
            <div
              className="bg-[#3FB950] h-full rounded-full transition-all"
              style={{
                width: `${metrics.totalQuestions ? (metrics.totalSolved / metrics.totalQuestions) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px]">
            <span>CURRENT ACTIVE STREAK</span>
            <Flame className="w-3.5 h-3.5 text-[#D29922]" />
          </div>
          <div className="text-xl font-bold text-[#D29922]">
            {metrics.currentStreak} Day{metrics.currentStreak === 1 ? "" : "s"}
          </div>
          <p className="text-[10px] text-[#8B949E]">
            Longest recorded: {metrics.longestStreak} days
          </p>
        </div>

        <div className="p-3.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between text-[#8B949E] text-[11px]">
            <span>MUST-DO COMPLETED</span>
            <Award className="w-3.5 h-3.5 text-[#58A6FF]" />
          </div>
          <div className="text-xl font-bold text-[#58A6FF]">
            {metrics.mustDoCompleted} <span className="text-[11px] font-normal text-[#8B949E]">/ {metrics.totalMustDo}</span>
          </div>
          <div className="w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden border border-[#30363D]/40">
            <div
              className="bg-[#58A6FF] h-full rounded-full transition-all"
              style={{
                width: `${metrics.totalMustDo ? (metrics.mustDoCompleted / metrics.totalMustDo) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Revision System */}
      <RevisionTabsCard
        today={revision.today}
        thisWeek={revision.thisWeek}
        needsRevision={revision.needsRevision}
        incorrect={revision.incorrect}
        bookmarked={revision.bookmarked}
        mustDo={revision.mustDo}
      />

      {/* Activity Heatmap */}
      <ContributionHeatmap
        days={heatmap.days}
        currentStreak={heatmap.currentStreak}
        longestStreak={heatmap.longestStreak}
        totalActiveDays={heatmap.totalActiveDays}
      />

      {/* Topic Diagnostics */}
      <TopicAnalysisCard
        dsaTopics={topicAnalysis.dsa}
        sqlTopics={topicAnalysis.sql}
        frontendTopics={topicAnalysis.frontend}
        weakAreas={weakAreas}
      />
    </div>
  );
}
