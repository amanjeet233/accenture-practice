import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DifficultyBadge, ImportanceBadge, SourceBadge, VerificationBadge } from "@/components/ui/Badge";
import { FileCheck2, ShieldCheck, Calendar, Filter, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VerifiedPyqPage() {
  const pyqs = await prisma.question.findMany({
    where: {
      sourceType: {
        in: ["REPORTED_PYQ", "SHIFT_REPORTED", "CANDIDATE_REPORTED"],
      },
    },
    orderBy: [{ sourceDate: "desc" }, { frequency: "desc" }],
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Authenticity Disclaimer */}
      <div className="border-b border-zinc-800 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
              Authentic Past-Year Question Archive (PYQ)
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Strictly verified questions from actual placement papers, campus hiring drives, and slot debriefs.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Zero-Fake-PYQ Standard Active</span>
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
          <span className="text-zinc-200 font-semibold">Provenance Policy: </span>
          Questions cataloged here carry documented source evidence, slot shift details, or candidate debrief corroboration. Practice or conceptual questions are never deceptively tagged as PYQs.
        </div>
      </div>

      {/* Verified Papers List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>{pyqs.length} Documented Assessment Problems</span>
        </div>

        <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
          {pyqs.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500">
              No verified past-year questions currently indexed.
            </div>
          ) : (
            pyqs.map((q) => {
              const topics = JSON.parse(q.topics || "[]");
              const companies = JSON.parse(q.companies || "[]");

              return (
                <div
                  key={q.id}
                  className="p-4 hover:bg-zinc-800/30 transition-colors space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/questions/${q.slug}`}
                          className="font-bold text-sm text-zinc-100 hover:text-cyan-400 transition-colors font-mono"
                        >
                          {q.title}
                        </Link>
                        <DifficultyBadge difficulty={q.difficulty as any} />
                        <ImportanceBadge importance={q.importance as any} />
                        <SourceBadge
                          sourceType={q.sourceType as any}
                          sourceShift={q.sourceShift}
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <VerificationBadge status={q.verificationStatus as any} />
                        <span className="text-zinc-600">·</span>
                        {q.sourceDocument && (
                          <span className="text-zinc-400 font-mono text-[11px]">
                            Doc: <span className="text-zinc-300">{q.sourceDocument}</span>
                            {q.sourcePage && ` (Pg. ${q.sourcePage})`}
                          </span>
                        )}
                        {q.sourceDate && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              {formatDate(q.sourceDate)}
                            </span>
                          </>
                        )}
                      </div>

                      {q.importanceReason && (
                        <p className="text-[11px] text-purple-300 font-mono">
                          Evidence: {q.importanceReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        href={`/questions/${q.slug}`}
                        className="px-3 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono border border-cyan-800/80 transition-colors flex items-center gap-1"
                      >
                        <span>Solve Problem</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-zinc-800/40">
                    {companies.map((c: string) => (
                      <span
                        key={c}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 uppercase"
                      >
                        {c}
                      </span>
                    ))}
                    {topics.map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/60 text-zinc-400 border border-zinc-700/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
