"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TestAnalyticsData } from "@/lib/testAnalyticsService";
import { DifficultyBadge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Timer,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BarChart3,
  Flame,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  History,
} from "lucide-react";

interface AccentureTestAnalyticsViewProps {
  data: TestAnalyticsData;
}

export function AccentureTestAnalyticsView({ data }: AccentureTestAnalyticsViewProps) {
  // Question table search & filter state
  const [questionFilter, setQuestionFilter] = useState<"all" | "NEEDS_PRACTICE" | "MASTERED">("all");

  // =========================================================================
  // ZERO STATE: No Test Attempts Yet (Strictly adhere to requirement)
  // =========================================================================
  if (!data.hasHistory || data.totalAttempts === 0) {
    return (
      <div className="rounded-md border border-[#30363D] bg-[#161B22] p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-[#21262D] border border-[#30363D] flex items-center justify-center mx-auto text-[#8B949E]">
          <History className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-mono font-bold text-[#F0F6FC]">
            No test attempts yet.
          </h2>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Take your first Accenture Timed Mock Test to generate real analytics, performance graphs, category breakdowns, and question-level insights.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/accenture/test"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-mono text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Launch Timed Mock Test</span>
          </Link>
        </div>
      </div>
    );
  }

  const filteredQuestions = data.questionLevelPerformance.filter((q) => {
    if (questionFilter === "all") return true;
    return q.status === questionFilter;
  });

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* ===================================================================== */}
      {/* TOP SUMMARY METRICS CARDS */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
          <div className="text-[11px] text-[#8B949E]">Completed Tests</div>
          <div className="text-2xl font-bold text-[#F0F6FC] mt-1">
            {data.totalAttempts}
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">Recorded attempts</div>
        </div>

        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
          <div className="text-[11px] text-[#8B949E]">Average Score</div>
          <div className="text-2xl font-bold text-[#58A6FF] mt-1">
            {data.averageScore}%
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">
            Best: <strong className="text-[#3FB950]">{data.bestScore}%</strong>
          </div>
        </div>

        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
          <div className="text-[11px] text-[#8B949E]">Average Accuracy</div>
          <div className="text-2xl font-bold text-[#3FB950] mt-1">
            {data.averageAccuracy}%
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">Correct / Attempted</div>
        </div>

        <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
          <div className="text-[11px] text-[#8B949E]">Questions Solved</div>
          <div className="text-2xl font-bold text-[#F0F6FC] mt-1">
            {data.totalQuestionsSolved}
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">Cumulative correct</div>
        </div>

        <div className="p-4 rounded border border-[#30363D] bg-[#161B22] col-span-2 sm:col-span-1">
          <div className="text-[11px] text-[#8B949E]">Total Exam Time</div>
          <div className="text-2xl font-bold text-[#E3B341] mt-1">
            {data.totalTimeSpentFormatted}
          </div>
          <div className="text-[10px] text-[#6E7681] mt-0.5">Time in test mode</div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 7 REQUIRED REAL ANALYTICS GRAPHS */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ----------------------------------------------------------------- */}
        {/* GRAPH 1: Score Over Time */}
        {/* ----------------------------------------------------------------- */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-3 font-mono">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#58A6FF]" />
                <span>1. Score Over Time</span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Test score percentage progression across completed attempts
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
              {data.scoreOverTime.length} Tests
            </span>
          </div>

          <div className="h-44 w-full flex items-end gap-2 pt-4 pb-2 px-2 bg-[#0D1117]/60 rounded border border-[#30363D]/50">
            {data.scoreOverTime.map((pt) => {
              const heightPct = Math.max(8, Math.min(100, pt.percentage));
              const isPassing = pt.percentage >= 65;
              return (
                <div key={pt.attemptNumber} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#21262D] border border-[#30363D] text-[10px] font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    Test #{pt.attemptNumber}: {pt.score}/{pt.totalQuestions} ({pt.percentage}%)
                  </div>

                  <div className="text-[10px] font-mono text-[#8B949E] group-hover:text-[#F0F6FC]">
                    {pt.percentage}%
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[32px] rounded-t transition-all ${
                      isPassing ? "bg-[#3FB950] hover:bg-[#2ea043]" : "bg-[#58A6FF] hover:bg-[#79b8ff]"
                    }`}
                  />
                  <div className="text-[9px] font-mono text-[#6E7681]">
                    T{pt.attemptNumber}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#6E7681]">
            <span>Benchmark: 65% Qualifying</span>
            <span>Target: 80%+ Competitive</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GRAPH 2: Accuracy Over Time */}
        {/* ----------------------------------------------------------------- */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-3 font-mono">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>2. Accuracy Over Time</span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Precision trajectory (Correct / Attempted)
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#3FB950]/10 text-[#3FB950] border border-[#3FB950]/30">
              Avg: {data.averageAccuracy}%
            </span>
          </div>

          <div className="h-44 w-full flex items-end gap-2 pt-4 pb-2 px-2 bg-[#0D1117]/60 rounded border border-[#30363D]/50">
            {data.accuracyOverTime.map((pt) => {
              const heightPct = Math.max(8, Math.min(100, pt.accuracy));
              return (
                <div key={pt.attemptNumber} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#21262D] border border-[#30363D] text-[10px] font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    Test #{pt.attemptNumber}: {pt.accuracy}% accuracy ({pt.attempted} attempted)
                  </div>

                  <div className="text-[10px] font-mono text-[#8B949E] group-hover:text-[#3FB950]">
                    {pt.accuracy}%
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[32px] rounded-t bg-[#3FB950] hover:bg-[#2ea043] transition-all"
                  />
                  <div className="text-[9px] font-mono text-[#6E7681]">
                    T{pt.attemptNumber}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#6E7681]">
            <span>Lower variance indicates consistent preparation</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GRAPH 3: Category Performance */}
        {/* ----------------------------------------------------------------- */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-3 font-mono">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#58A6FF]" />
                <span>3. Category Performance</span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Accuracy and question coverage by Accenture module
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
              {data.categoryPerformance.length} Categories
            </span>
          </div>

          <div className="space-y-3 font-mono">
            {data.categoryPerformance.slice(0, 6).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#F0F6FC] font-medium truncate max-w-[200px]">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6E7681] text-[10px]">
                      {cat.correct}/{cat.attempted}
                    </span>
                    <span
                      className={`font-semibold ${
                        cat.accuracy >= 70
                          ? "text-[#3FB950]"
                          : cat.accuracy >= 40
                          ? "text-[#E3B341]"
                          : "text-[#F85149]"
                      }`}
                    >
                      {cat.accuracy}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#21262D] overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(4, cat.accuracy))}%` }}
                    className={`h-full rounded-full transition-all ${
                      cat.accuracy >= 70
                        ? "bg-[#3FB950]"
                        : cat.accuracy >= 40
                        ? "bg-[#E3B341]"
                        : "bg-[#F85149]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GRAPH 4: Correct vs Incorrect (Cumulative Volume) */}
        {/* ----------------------------------------------------------------- */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-3 font-mono">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>4. Correct vs Incorrect</span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Cumulative breakdown of all test questions faced
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#8B949E]">
              {data.correctVsIncorrect.totalQuestions} Total
            </span>
          </div>

          <div className="space-y-4">
            {/* Segmented Bar */}
            <div className="w-full h-4 rounded bg-[#21262D] overflow-hidden flex">
              <div
                style={{ width: `${data.correctVsIncorrect.correctPct}%` }}
                className="bg-[#238636] h-full"
                title={`Correct: ${data.correctVsIncorrect.correct} (${data.correctVsIncorrect.correctPct}%)`}
              />
              <div
                style={{ width: `${data.correctVsIncorrect.incorrectPct}%` }}
                className="bg-[#DA3633] h-full"
                title={`Incorrect: ${data.correctVsIncorrect.incorrect} (${data.correctVsIncorrect.incorrectPct}%)`}
              />
              <div
                style={{ width: `${data.correctVsIncorrect.unattemptedPct}%` }}
                className="bg-[#30363D] h-full"
                title={`Unattempted: ${data.correctVsIncorrect.unattempted} (${data.correctVsIncorrect.unattemptedPct}%)`}
              />
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded bg-[#0D1117] border border-[#3FB950]/30">
                <div className="text-[10px] text-[#3FB950]">Correct</div>
                <div className="text-lg font-bold text-[#3FB950] mt-0.5">
                  {data.correctVsIncorrect.correct}
                </div>
                <div className="text-[9px] text-[#8B949E]">
                  {data.correctVsIncorrect.correctPct}%
                </div>
              </div>

              <div className="p-3 rounded bg-[#0D1117] border border-[#F85149]/30">
                <div className="text-[10px] text-[#F85149]">Incorrect</div>
                <div className="text-lg font-bold text-[#F85149] mt-0.5">
                  {data.correctVsIncorrect.incorrect}
                </div>
                <div className="text-[9px] text-[#8B949E]">
                  {data.correctVsIncorrect.incorrectPct}%
                </div>
              </div>

              <div className="p-3 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[10px] text-[#8B949E]">Unattempted</div>
                <div className="text-lg font-bold text-[#8B949E] mt-0.5">
                  {data.correctVsIncorrect.unattempted}
                </div>
                <div className="text-[9px] text-[#6E7681]">
                  {data.correctVsIncorrect.unattemptedPct}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GRAPH 5: Difficulty Performance */}
        {/* ----------------------------------------------------------------- */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-3 font-mono">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#E3B341]" />
                <span>5. Difficulty Performance</span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Accuracy comparison by problem difficulty level
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            {data.difficultyPerformance.map((item) => (
              <div
                key={item.difficulty}
                className="p-3 rounded border border-[#30363D] bg-[#0D1117] flex flex-col justify-between"
              >
                <div>
                  <DifficultyBadge difficulty={item.difficulty} />
                  <div className="text-xl font-bold text-[#F0F6FC] mt-2">
                    {item.accuracy}%
                  </div>
                  <div className="text-[10px] text-[#8B949E]">Accuracy</div>
                </div>
                <div className="pt-2 mt-2 border-t border-[#30363D]/50 text-[10px] text-[#6E7681]">
                  {item.correct} / {item.attempted} correct
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GRAPH 6: Time Spent Per Test */}
        {/* ----------------------------------------------------------------- */}
        <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-3 font-mono">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#58A6FF]" />
                <span>6. Time Spent Per Test</span>
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Duration taken and average pacing per question
              </p>
            </div>
          </div>

          <div className="space-y-2.5 font-mono">
            {data.timeSpentPerTest.slice(-4).map((pt) => (
              <div
                key={pt.attemptNumber}
                className="p-2.5 rounded bg-[#0D1117] border border-[#30363D] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#21262D] flex items-center justify-center text-[10px] text-[#8B949E]">
                    #{pt.attemptNumber}
                  </span>
                  <div>
                    <div className="text-xs text-[#F0F6FC] font-semibold">
                      {pt.durationFormatted}
                    </div>
                    <div className="text-[9px] text-[#6E7681]">{pt.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#58A6FF]">
                    {pt.avgSecondsPerQuestion}s / Q
                  </div>
                  <div className="text-[9px] text-[#6E7681]">Average Pace</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* GRAPH 7: Question-Level Performance Table */}
      {/* ===================================================================== */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>7. Question-Level Performance</span>
            </h3>
            <p className="text-[11px] text-[#8B949E]">
              Specific question accuracy across test attempts — prioritize items needing practice
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setQuestionFilter("all")}
              className={`px-2 py-1 rounded transition-colors ${
                questionFilter === "all"
                  ? "bg-[#21262D] text-[#58A6FF] border border-[#30363D] font-semibold"
                  : "text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              All ({data.questionLevelPerformance.length})
            </button>
            <button
              onClick={() => setQuestionFilter("NEEDS_PRACTICE")}
              className={`px-2 py-1 rounded transition-colors ${
                questionFilter === "NEEDS_PRACTICE"
                  ? "bg-[#DA3633]/20 text-[#F85149] border border-[#DA3633]/40 font-semibold"
                  : "text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              Needs Practice
            </button>
            <button
              onClick={() => setQuestionFilter("MASTERED")}
              className={`px-2 py-1 rounded transition-colors ${
                questionFilter === "MASTERED"
                  ? "bg-[#238636]/20 text-[#3FB950] border border-[#238636]/40 font-semibold"
                  : "text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              Mastered
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117]/60 text-[#8B949E] text-[11px]">
                <th className="py-2.5 px-3">Question</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Difficulty</th>
                <th className="py-2.5 px-3 text-center">Attempts</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60">
              {filteredQuestions.slice(0, 10).map((q) => (
                <tr key={q.questionId} className="hover:bg-[#21262D]/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-[#F0F6FC] block max-w-sm truncate">
                      {q.title}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#8B949E]">{q.category}</td>
                  <td className="py-2.5 px-3">
                    <DifficultyBadge difficulty={q.difficulty as any} />
                  </td>
                  <td className="py-2.5 px-3 text-center text-[#8B949E]">
                    {q.timesCorrect} / {q.timesAttempted}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`font-semibold ${
                        q.accuracy >= 80
                          ? "text-[#3FB950]"
                          : q.accuracy >= 50
                          ? "text-[#E3B341]"
                          : "text-[#F85149]"
                      }`}
                    >
                      {q.accuracy}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href={`/accenture/mcq/practice?category=${encodeURIComponent(q.category)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] border border-[#30363D] text-[11px] transition-colors font-medium"
                    >
                      <span>Practice</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TEST ATTEMPT HISTORY LOG */}
      {/* ===================================================================== */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
          <h3 className="font-bold text-xs text-[#F0F6FC] flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Complete Test Attempt History</span>
          </h3>
          <span className="text-xs text-[#8B949E]">{data.historyList.length} Sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#30363D] text-[#8B949E] text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Test Title</th>
                <th className="py-2.5 px-3 text-center">Duration</th>
                <th className="py-2.5 px-3 text-center">Score</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]/60">
              {data.historyList.map((h) => (
                <tr key={h.id} className="hover:bg-[#21262D]/40 transition-colors">
                  <td className="py-2.5 px-3 text-[#8B949E] whitespace-nowrap">{h.date}</td>
                  <td className="py-2.5 px-3 text-[#F0F6FC] font-medium">{h.testTitle}</td>
                  <td className="py-2.5 px-3 text-center text-[#8B949E] whitespace-nowrap">
                    {h.durationFormatted}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-[#F0F6FC]">
                    {h.score} / {h.totalQuestions} ({h.percentage}%)
                  </td>
                  <td className="py-2.5 px-3 text-center text-[#58A6FF] font-semibold">
                    {h.accuracy}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border inline-block font-semibold ${
                        h.isPassed
                          ? "bg-[#238636]/15 text-[#3FB950] border-[#3FB950]/40"
                          : "bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/40"
                      }`}
                    >
                      {h.isPassed ? "PASSED" : "NEEDS PRACTICE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
