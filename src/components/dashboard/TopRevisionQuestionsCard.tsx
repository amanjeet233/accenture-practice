"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { DifficultyBadge, MustDoBadge, RepeatedPatternBadge } from "@/components/ui/Badge";
import { analyzeQuestionEvidence, QuestionEvidenceInput } from "@/lib/importance";

interface TopRevisionQuestionsCardProps {
  questions: any[];
  className?: string;
}

export function TopRevisionQuestionsCard({
  questions,
  className,
}: TopRevisionQuestionsCardProps) {
  // Analyze each question's stored evidence
  const prioritized = questions
    .map((q) => {
      const evidence = analyzeQuestionEvidence(q);
      return {
        ...q,
        evidence,
      };
    })
    // Sort by evidence factor count descending (qualitative prioritization without exposing numerical scores)
    .sort((a, b) => b.evidence.factorCount - a.evidence.factorCount)
    .slice(0, 6);

  return (
    <div
      className={`p-6 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/90 shadow-xl space-y-5 font-mono text-xs ${
        className || ""
      }`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-1.5">
              <span>🔥</span> Top Revision Questions
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Evidence-based revision priority
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Prioritized strictly through documented paper provenance, verified shift debriefs, and recurring concept frequency.{" "}
            <span className="text-zinc-400 font-medium">
              (Evidence-based revision priority — not questions guaranteed to appear).
            </span>
          </p>
        </div>

        <Link
          href="/questions?filter=MUST_DO"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-mono font-medium transition-colors shrink-0"
        >
          <span>View All Must-Do</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Questions Grid */}
      {prioritized.length === 0 ? (
        <div className="p-8 text-center rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-500 font-mono">
          No priority revision questions currently available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prioritized.map((q) => {
          const evidence = q.evidence;
          const displayReasons = evidence.evidenceReasons.slice(0, 2);

          return (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between gap-3.5 group"
            >
              <div className="space-y-2.5">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <DifficultyBadge difficulty={q.difficulty} className="text-[10px] py-0 px-1.5" />
                    {evidence.isMustDo && <MustDoBadge />}
                    {evidence.isRepeatedPattern && (
                      <RepeatedPatternBadge
                        sources={evidence.corroboratedSources}
                        frequency={q.frequency}
                      />
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 uppercase">
                    {q.questionType}
                  </span>
                </div>

                {/* Title */}
                <Link
                  href={`/questions/${q.slug}`}
                  className="font-bold text-white group-hover:text-indigo-300 transition-colors text-sm font-mono line-clamp-1 block"
                >
                  {q.title}
                </Link>

                {/* Stored Evidence Reasons */}
                <ul className="space-y-1 text-zinc-400 font-sans text-xs">
                  {displayReasons.map((reason: string, rIdx: number) => (
                    <li key={rIdx} className="flex items-start gap-1.5 leading-tight">
                      <span className="text-amber-400 shrink-0 text-xs">•</span>
                      <span className="line-clamp-1">{reason}</span>
                    </li>
                  ))}
                </ul>

                {/* Multi-Source Attribution if repeated */}
                {evidence.isRepeatedPattern && evidence.corroboratedSources.length > 1 && (
                  <div className="pt-1 text-[10px] text-purple-300 font-mono flex items-center gap-1">
                    <span className="text-purple-400">Reported in:</span>
                    <span className="truncate max-w-[200px] text-zinc-400">
                      {evidence.corroboratedSources.map((s: any) => s.documentTitle).slice(0, 2).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 font-mono text-[11px]">
                <span className="text-zinc-400">
                  {q.frequency > 1 ? `${q.frequency}x Documented` : "Verified PYQ"}
                </span>

                <Link
                  href={`/questions/${q.slug}`}
                  className="inline-flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 font-semibold"
                >
                  <span>Solve Problem</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Integrity Disclaimer */}
      <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>Prioritization is strictly calculated from historical exam archive presence. No simulated cutoff or arbitrary numerical ranking is generated.</span>
      </div>
    </div>
  );
}
