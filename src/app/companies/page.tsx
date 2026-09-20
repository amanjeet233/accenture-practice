import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COMPANY_LIST } from "@/lib/constants";
import { Building2, ChevronRight, FileCheck2, Code2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const allQuestions = await prisma.question.findMany({
    select: {
      companies: true,
      difficulty: true,
      sourceType: true,
    },
  });

  const companiesWithCounts = COMPANY_LIST.map((comp) => {
    const matching = allQuestions.filter((q) => {
      try {
        const comps = JSON.parse(q.companies || "[]");
        return comps.includes(comp.id);
      } catch {
        return false;
      }
    });

    const pyqCount = matching.filter((q) =>
      ["REPORTED_PYQ", "SHIFT_REPORTED", "CANDIDATE_REPORTED"].includes(q.sourceType)
    ).length;

    return {
      ...comp,
      total: matching.length,
      pyqCount,
      easy: matching.filter((q) => q.difficulty === "EASY").length,
      medium: matching.filter((q) => q.difficulty === "MEDIUM").length,
      hard: matching.filter((q) => q.difficulty === "HARD").length,
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          Company-Specific Preparation Tracks
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Hiring patterns, assessment structures, and authentic past-year questions for top recruitment drives.
        </p>
      </div>

      {/* Grid of Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {companiesWithCounts.map((company) => (
          <div
            key={company.id}
            className={`p-5 rounded-lg border transition-all ${
              company.id === "accenture"
                ? "bg-gradient-to-br from-purple-950/20 via-zinc-900/60 to-zinc-900/80 border-purple-800/60 shadow-sm shadow-purple-950/20"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {company.name}
                  </h2>
                  {company.id === "accenture" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-900/60 text-purple-300 border border-purple-700/50 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" /> Primary Focus
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {company.tagline}
                </p>
              </div>

              <Link
                href={`/companies/${company.id}`}
                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 flex items-center gap-1 shrink-0"
              >
                <span>Track</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Assessment Rounds Summary */}
            <div className="mt-4 space-y-2 border-t border-zinc-800/80 pt-3">
              <h3 className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                Assessment Architecture:
              </h3>
              <div className="grid grid-cols-1 gap-1.5 text-xs text-zinc-300">
                {company.rounds.slice(0, 2).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-zinc-950/50 border border-zinc-800/60 text-[11px] font-mono"
                  >
                    <span>{r.name}</span>
                    <span className="text-zinc-500">{r.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions count footer */}
            <div className="mt-4 flex items-center justify-between text-xs font-mono pt-3 border-t border-zinc-800/80 text-zinc-400">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{company.total} Questions</span>
                <span className="text-zinc-600">·</span>
                <span className="text-emerald-400">{company.easy}E</span>
                <span className="text-amber-400">{company.medium}M</span>
                <span className="text-rose-400">{company.hard}H</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-400">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{company.pyqCount} Verified PYQ</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
