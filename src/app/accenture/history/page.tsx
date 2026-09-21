import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getAccentureTestAnalytics } from "@/lib/testAnalyticsService";
import { History, ArrowLeft, Timer, BarChart3 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accenture Mock Test History | CodeTrack",
  description: "Complete log of past Accenture mock test sessions and scores.",
};

export default async function AccentureHistoryPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/accenture/history");
  }

  const analyticsData = await getAccentureTestAnalytics(user.id);

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
        <span className="text-[#58A6FF] font-semibold uppercase">TEST HISTORY</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2.5 font-mono">
            <History className="w-5 h-5 text-[#58A6FF]" />
            <span>Accenture Mock Test History</span>
          </h1>
          <p className="text-xs text-[#8B949E] max-w-2xl">
            Detailed chronological record of every completed Accenture assessment attempt.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <Link
            href="/accenture/analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] text-xs font-medium transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>View Analytics</span>
          </Link>
          <Link
            href="/accenture/test"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold transition-colors"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Take Test</span>
          </Link>
        </div>
      </div>

      {/* History Table or Zero State */}
      {!analyticsData.hasHistory || analyticsData.historyList.length === 0 ? (
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-12 text-center space-y-3 max-w-md mx-auto">
          <History className="w-10 h-10 text-[#8B949E] mx-auto opacity-50" />
          <h3 className="font-mono font-bold text-sm text-[#F0F6FC]">
            No test attempts yet.
          </h3>
          <p className="text-xs text-[#8B949E]">
            Completed test attempts will appear here with detailed scorecards and timestamps.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] text-[11px]">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Assessment Title</th>
                  <th className="py-2.5 px-4 text-center">Duration</th>
                  <th className="py-2.5 px-4 text-center">Score</th>
                  <th className="py-2.5 px-4 text-center">Accuracy</th>
                  <th className="py-2.5 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/60">
                {analyticsData.historyList.map((h) => (
                  <tr key={h.id} className="hover:bg-[#21262D]/40 transition-colors">
                    <td className="py-2.5 px-4 text-[#8B949E] whitespace-nowrap">{h.date}</td>
                    <td className="py-2.5 px-4 text-[#F0F6FC] font-medium">{h.testTitle}</td>
                    <td className="py-2.5 px-4 text-center text-[#8B949E] whitespace-nowrap">
                      {h.durationFormatted}
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-[#F0F6FC]">
                      {h.score} / {h.totalQuestions} ({h.percentage}%)
                    </td>
                    <td className="py-2.5 px-4 text-center text-[#58A6FF] font-semibold">
                      {h.accuracy}%
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border inline-block font-semibold ${
                          h.isPassed
                            ? "bg-[#238636]/15 text-[#3FB950] border-[#3FB950]/40"
                            : "bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/40"
                        }`}
                      >
                        {h.isPassed ? "PASSED" : "NEEDS PRACTICE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
