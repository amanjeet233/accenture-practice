import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { History, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Submission History | CodeTrack",
  description: "Evaluation history, runtime logs, and test verdicts across your practice attempts.",
};

export default async function SubmissionsPage() {
  const submissions = await prisma.submission.findMany({
    include: {
      question: {
        select: { title: true, slug: true, difficulty: true },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/dashboard" className="hover:text-[#F0F6FC]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">History</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2">
            <History className="w-4 h-4 text-[#58A6FF]" />
            Submission History & Evaluation Log
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Evaluation records, runtime profiles, and test verdicts across your practice attempts.
          </p>
        </div>
        <div className="text-xs font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded">
          {submissions.length} submissions
        </div>
      </div>

      {/* Submissions Dense Table */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] text-[11px]">
                <th className="py-2 px-3 w-28">Status</th>
                <th className="py-2 px-3">Problem Title</th>
                <th className="py-2 px-3 w-24">Language</th>
                <th className="py-2 px-3 w-20">Runtime</th>
                <th className="py-2 px-3 w-20">Memory</th>
                <th className="py-2 px-3 text-right w-36">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8B949E] font-mono text-xs">
                    No submissions recorded yet. Run and submit questions to see evaluation history.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => {
                  const isAccepted = s.status === "ACCEPTED";
                  return (
                    <tr key={s.id} className="hover:bg-[#21262D]/40 transition-colors">
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold text-[11px] ${
                            isAccepted ? "text-[#3FB950]" : "text-[#F85149]"
                          }`}
                        >
                          {isAccepted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <Link
                          href={`/questions/${s.question.slug}`}
                          className="text-[#F0F6FC] hover:text-[#58A6FF] transition-colors font-medium"
                        >
                          {s.question.title}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-[#8B949E] uppercase text-[10px]">
                        {s.language}
                      </td>
                      <td className="py-2 px-3 text-[#8B949E] text-[11px]">
                        {s.runtime !== null ? `${s.runtime}ms` : "—"}
                      </td>
                      <td className="py-2 px-3 text-[#8B949E] text-[11px]">
                        {s.memory !== null ? `${Math.round(s.memory / 1024)}MB` : "—"}
                      </td>
                      <td className="py-2 px-3 text-right text-[#8B949E] text-[10px]">
                        {formatDate(s.submittedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
