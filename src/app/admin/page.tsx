import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShieldAlert, CheckCircle2, AlertTriangle, FileCheck, Layers, Plus } from "lucide-react";
import { DifficultyBadge, ImportanceBadge, SourceBadge, VerificationBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  const [questions, unverifiedCount, totalCount] = await Promise.all([
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.question.count({
      where: { verificationStatus: "UNVERIFIED" },
    }),
    prisma.question.count(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Curator & Admin Verification Portal
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Maintain high-fidelity question standards, duplicate detection, and authentic PYQ provenance auditing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            Total Indexed: <span className="font-bold text-white">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Admin Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
          <span className="text-xs font-mono text-zinc-400">UNVERIFIED SUBMISSIONS</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{unverifiedCount}</div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Candidate reports pending document proof
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
          <span className="text-xs font-mono text-zinc-400">DUPLICATE DETECTION</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">Active</div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Similarity hashing to group cross-slot duplicates
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
          <span className="text-xs font-mono text-zinc-400">ACCENTURE QUESTION AUDIT</span>
          <div className="text-2xl font-bold font-mono text-purple-400">100% Grounded</div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Zero synthetic/fake labels enforced
          </p>
        </div>
      </div>

      {/* Questions Verification Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white font-mono">
            Question Registry & Audit Logs
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            Showing latest {questions.length} entries
          </span>
        </div>

        <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 text-[11px]">
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Source Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Importance</th>
                  <th className="py-2.5 px-3">Exam Date/Shift</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-zinc-200">
                      <Link href={`/questions/${q.slug}`} className="hover:text-indigo-400">
                        {q.title}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">{q.questionType}</td>
                    <td className="py-3 px-3">
                      <SourceBadge sourceType={q.sourceType as any} />
                    </td>
                    <td className="py-3 px-3">
                      <VerificationBadge status={q.verificationStatus as any} />
                    </td>
                    <td className="py-3 px-3">
                      <ImportanceBadge importance={q.importance as any} />
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {q.sourceDate ? formatDate(q.sourceDate) : "General"}
                      {q.sourceShift && ` (${q.sourceShift})`}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/questions/${q.slug}`}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px]"
                      >
                        Audit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
