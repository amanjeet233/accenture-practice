"use client";

import React from "react";
import Link from "next/link";
import { SubmissionHistoryItem } from "@/lib/analytics";
import { DifficultyBadge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle, Clock, Terminal, ChevronRight, History } from "lucide-react";

interface SubmissionHistoryTableProps {
  history: SubmissionHistoryItem[];
}

export function SubmissionHistoryTable({ history }: SubmissionHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Accepted
          </span>
        );
      case "WRONG_ANSWER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Wrong Answer
          </span>
        );
      case "COMPILE_ERROR":
      case "COMPILATION_ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">
            Compile Error
          </span>
        );
      case "TIME_LIMIT_EXCEEDED":
      case "TIME_LIMIT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Time Limit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white font-mono">
            Recent Submission History
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">
          Last {history.length} evaluation runs recorded
        </span>
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-zinc-500">
          No submissions recorded yet. Launch a question or mock test to generate history.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-950/50">
                <th className="py-2.5 px-3">Question</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Runtime</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {history.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-850/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/questions/${sub.questionSlug}`}
                        className="font-semibold text-zinc-100 hover:text-indigo-300 transition-colors truncate max-w-xs block"
                      >
                        {sub.questionTitle}
                      </Link>
                      <DifficultyBadge difficulty={sub.difficulty as any} className="text-[9px] py-0 px-1" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                    {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 uppercase">
                      {sub.language}
                    </span>
                  </td>
                  <td className="py-3 px-3">{getStatusBadge(sub.status)}</td>
                  <td className="py-3 px-3 text-zinc-300 whitespace-nowrap text-[11px]">
                    {sub.runtime !== null ? `${sub.runtime} ms` : "—"}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/questions/${sub.questionSlug}`}
                      className="text-zinc-400 hover:text-indigo-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 inline" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
