import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COMPANY_LIST } from "@/lib/constants";
import { DifficultyBadge, ImportanceBadge, SourceBadge } from "@/components/ui/Badge";
import {
  Building2,
  ChevronLeft,
  Timer,
  CheckCircle2,
  Code2,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companyId } = await params;
  const company = COMPANY_LIST.find((c) => c.id.toLowerCase() === companyId.toLowerCase());

  if (!company) {
    notFound();
  }

  const questions = await prisma.question.findMany({
    where: {
      companies: { contains: company.id },
    },
    orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/companies" className="hover:text-white flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span>All Companies</span>
        </Link>
        <span>/</span>
        <span className="text-zinc-200 uppercase font-mono">{company.name}</span>
      </div>

      {/* Company Header */}
      <div className="p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-400" />
              {company.name} Technical Preparation Hub
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              {company.tagline}
            </p>
          </div>
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shrink-0"
          >
            <Timer className="w-4 h-4" />
            <span>Launch Mock Simulation</span>
          </Link>
        </div>
      </div>

      {/* Round-by-Round Breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold font-mono uppercase tracking-wider text-zinc-400">
          Assessment Structure & Eligibility Gates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {company.rounds.map((round, i) => (
            <div
              key={i}
              className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800 space-y-1.5"
            >
              <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                Stage {i + 1}
              </div>
              <div className="text-xs font-semibold text-zinc-200">{round.name}</div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                <span>Duration: {round.duration}</span>
                <span>{round.questions} Qs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Exam Patterns */}
      <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 space-y-2">
        <h3 className="text-xs font-semibold font-mono uppercase text-zinc-300 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          High-Frequency Pattern Archetypes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
          {company.commonPatterns.map((pat, i) => (
            <div
              key={i}
              className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 font-mono flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{pat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Bank for Company */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            Curated Questions ({questions.length})
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            Sorted by exam frequency & provenance
          </span>
        </div>

        <div className="divide-y divide-zinc-800/70 border border-zinc-800 rounded-lg bg-zinc-900/20 overflow-hidden">
          {questions.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-zinc-500">
              No questions found under this company yet.
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/questions/${q.slug}`}
                      className="font-semibold text-xs text-zinc-200 hover:text-indigo-400 font-mono"
                    >
                      {q.title}
                    </Link>
                    <DifficultyBadge difficulty={q.difficulty as any} />
                    <ImportanceBadge importance={q.importance as any} />
                  </div>
                  {q.importanceReason && (
                    <p className="text-[11px] text-zinc-400 line-clamp-1 font-mono">
                      {q.importanceReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <SourceBadge
                    sourceType={q.sourceType as any}
                    sourceShift={q.sourceShift}
                  />
                  <Link
                    href={`/questions/${q.slug}`}
                    className="px-3 py-1 rounded bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-200 text-xs font-mono border border-zinc-700 transition-colors flex items-center gap-1"
                  >
                    <span>Solve</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
