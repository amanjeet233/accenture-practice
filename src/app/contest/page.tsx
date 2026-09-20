import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Trophy, Calendar, Users, ArrowRight, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  const mockTests = await prisma.mockTest.findMany({
    include: {
      questions: true,
      attempts: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Timed Contests & Hiring Sprints
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Compete under strict time constraints to build speed, accuracy, and edge-case resilience.
        </p>
      </div>

      {mockTests.length === 0 ? (
        <div className="p-12 rounded-lg border border-zinc-800 bg-zinc-900/30 text-center space-y-3">
          <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No active hiring sprints scheduled</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            All active timed assessments are available on-demand in the Mock Test module.
          </p>
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono transition-colors"
          >
            <span>Browse Mock Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockTests.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold border bg-indigo-950/60 text-indigo-300 border-indigo-800">
                    AVAILABLE
                  </span>
                  <h2 className="text-base font-bold text-white font-mono">
                    {t.title}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" /> {t.durationMins} mins
                  </span>
                  <span>·</span>
                  <span>{t.questions.length} Problems</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-500" /> {t.attempts.length} Completed
                  </span>
                </div>
              </div>

              <Link
                href={`/mock-tests/${t.id}`}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 flex items-center gap-1 shrink-0 self-start sm:self-auto transition-colors"
              >
                <span>Launch Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
