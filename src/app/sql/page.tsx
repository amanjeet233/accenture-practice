import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DifficultyBadge, MustDoBadge, SourceBadge } from "@/components/ui/Badge";
import { Database, CheckCircle2, Circle } from "lucide-react";
import { analyzeQuestionEvidence } from "@/lib/importance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SQL Practice & Query Sandbox | CodeTrack",
  description:
    "Real database query sandbox with SQLite in-memory execution, schema inspection, and result diff verification.",
};

export default async function SqlQuestionsPage() {
  const [sqlQuestions, progress] = await Promise.all([
    prisma.question.findMany({
      where: { questionType: "SQL" },
      orderBy: [{ frequency: "desc" }, { createdAt: "desc" }],
    }),
    prisma.userProgress.findMany({
      where: { isSolved: true },
      select: { questionId: true },
    }),
  ]);

  const solvedSet = new Set(progress.map((p) => p.questionId));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/questions" className="hover:text-[#F0F6FC]">
              Problems
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">SQL</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#58A6FF]" />
            SQL Query Sandbox
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            41 verified database query problems with interactive schemas, sample rows, and sandbox execution.
          </p>
        </div>
        <div className="text-xs font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded">
          {sqlQuestions.length} queries
        </div>
      </div>

      {/* Dense Table */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] font-mono text-[11px]">
                <th className="py-2 px-3 w-10 text-center">Status</th>
                <th className="py-2 px-3">Query Problem</th>
                <th className="py-2 px-3 w-20">Difficulty</th>
                <th className="py-2 px-3 w-32">Source</th>
                <th className="py-2 px-3 w-24">Priority</th>
                <th className="py-2 px-3 w-16 text-center">Freq</th>
                <th className="py-2 px-3 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60 font-mono">
              {sqlQuestions.map((q) => {
                const isSolved = solvedSet.has(q.id);
                const topics = JSON.parse(q.topics || "[]");
                const evidence = analyzeQuestionEvidence({
                  ...q,
                  topics,
                  companies: JSON.parse(q.companies || "[]"),
                });

                return (
                  <tr
                    key={q.id}
                    className="hover:bg-[#21262D]/40 transition-colors"
                  >
                    <td className="py-2 px-3 text-center">
                      {isSolved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] inline-block" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#30363D] inline-block" />
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/sql/${q.slug}`}
                        className="font-medium text-[#F0F6FC] hover:text-[#58A6FF] transition-colors"
                      >
                        {q.title}
                      </Link>
                      <div className="text-[10px] text-[#8B949E] truncate">
                        {topics.join(" · ") || "SQL"}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <DifficultyBadge difficulty={q.difficulty as any} />
                    </td>
                    <td className="py-2 px-3">
                      <SourceBadge
                        sourceType={q.sourceType as any}
                        sourceShift={q.sourceShift}
                      />
                    </td>
                    <td className="py-2 px-3">
                      {evidence.isMustDo ? (
                        <MustDoBadge />
                      ) : (
                        <span className="text-[10px] text-[#8B949E]">{q.importance}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center text-[#8B949E]">
                      {q.frequency > 1 ? `${q.frequency}x` : "-"}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Link
                        href={`/sql/${q.slug}`}
                        className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] text-[11px] font-medium transition-colors"
                      >
                        Write Query
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
