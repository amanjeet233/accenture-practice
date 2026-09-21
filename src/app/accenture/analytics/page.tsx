import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getAccentureTestAnalytics } from "@/lib/testAnalyticsService";
import { AccentureTestAnalyticsView } from "@/components/analytics/AccentureTestAnalyticsView";
import { BarChart3, ArrowLeft, Timer, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accenture Test Analytics & Performance | CodeTrack",
  description:
    "Real database analytics from completed Accenture mock test attempts, tracking score over time, accuracy, category mastery, and question-level performance.",
};

export default async function AccentureAnalyticsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/accenture/analytics");
  }

  const analyticsData = await getAccentureTestAnalytics(user.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-xs">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
        <Link href="/home/accenture" className="hover:text-[#F0F6FC] transition-colors">
          CODERTRACK
        </Link>
        <span>/</span>
        <Link href="/home/accenture" className="hover:text-[#F0F6FC] transition-colors">
          ACCENTURE
        </Link>
        <span>/</span>
        <span className="text-[#58A6FF] font-semibold uppercase">TEST ANALYTICS</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2.5 font-mono">
            <BarChart3 className="w-5 h-5 text-[#58A6FF]" />
            <span>Accenture Test Analytics & Insights</span>
          </h1>
          <p className="text-xs text-[#8B949E] max-w-2xl">
            Real performance telemetry derived from completed mock test attempts. Track score trajectory, accuracy consistency, domain readiness, and question-level weaknesses.
          </p>
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

      {/* Main Analytics View */}
      <AccentureTestAnalyticsView data={analyticsData} />
    </div>
  );
}
