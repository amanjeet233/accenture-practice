"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Timer,
  FileText,
  BrainCircuit,
  ArrowRight,
  Clock,
  Code2,
  Database,
  CheckCircle2,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/Badge";

interface QuestionSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  questionType: string;
  marks: number;
}

interface MockTestSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  company: string;
  mockType: "SOURCE_BASED" | "PATTERN_BASED";
  durationMins: number;
  totalMarks: number;
  passingMarks: number;
  questions: QuestionSummary[];
}

interface MockTestCatalogClientProps {
  mockTests: MockTestSummary[];
}

export function MockTestCatalogClient({ mockTests }: MockTestCatalogClientProps) {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"ALL" | "SOURCE_BASED" | "PATTERN_BASED">("ALL");
  const [selectedMock, setSelectedMock] = useState<MockTestSummary>(mockTests[0] || null);

  const filteredMocks = mockTests.filter((m) => {
    if (selectedTypeFilter !== "ALL" && m.mockType !== selectedTypeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/dashboard" className="hover:text-[#F0F6FC]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">Mock Tests</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC]">
            Mock Assessments
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Timed assessment engine calibrated to official 60-minute hiring rounds with auto-submit timers and automatic test evaluation.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setSelectedTypeFilter("ALL")}
            className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
              selectedTypeFilter === "ALL"
                ? "bg-[#21262D] text-[#F0F6FC] font-semibold border-[#58A6FF]"
                : "text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC] hover:bg-[#21262D]/60"
            }`}
          >
            All ({mockTests.length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter("SOURCE_BASED")}
            className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
              selectedTypeFilter === "SOURCE_BASED"
                ? "bg-[#21262D] text-[#F0F6FC] font-semibold border-[#58A6FF]"
                : "text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC] hover:bg-[#21262D]/60"
            }`}
          >
            Reported Papers
          </button>
          <button
            onClick={() => setSelectedTypeFilter("PATTERN_BASED")}
            className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
              selectedTypeFilter === "PATTERN_BASED"
                ? "bg-[#21262D] text-[#F0F6FC] font-semibold border-[#58A6FF]"
                : "text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC] hover:bg-[#21262D]/60"
            }`}
          >
            Pattern Sets
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Compact Assessment Table + Side Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Compact Assessment Table (8 cols on lg) */}
        <div className="lg:col-span-7 rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden self-start">
          <div className="p-3 border-b border-[#30363D] flex items-center justify-between font-mono text-[11px] text-[#8B949E]">
            <span className="font-semibold uppercase tracking-wider text-[#F0F6FC]">
              Available Assessments
            </span>
            <span>{filteredMocks.length} Tests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363D] bg-[#0D1117]/80 text-[#8B949E] font-mono text-[11px]">
                  <th className="py-2 px-3">Mock Test</th>
                  <th className="py-2 px-3 w-20 text-center">Questions</th>
                  <th className="py-2 px-3 w-16 text-center">Time</th>
                  <th className="py-2 px-3 w-24">Type</th>
                  <th className="py-2 px-3 w-20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/60 font-mono">
                {filteredMocks.map((mock) => {
                  const isSelected = selectedMock?.id === mock.id;
                  const isSourceBased = mock.mockType === "SOURCE_BASED";

                  return (
                    <tr
                      key={mock.id}
                      onClick={() => setSelectedMock(mock)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#21262D] text-[#F0F6FC]"
                          : "hover:bg-[#21262D]/40 text-[#8B949E]"
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#F0F6FC]">{mock.title}</div>
                        <div className="text-[10px] text-[#8B949E] truncate max-w-xs">
                          {mock.company}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#F0F6FC]">
                        {mock.questions.length}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#F0F6FC]">
                        {mock.durationMins}m
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border leading-none ${
                            isSourceBased
                              ? "bg-[#3FB950]/10 text-[#3FB950] border-[#3FB950]/30"
                              : "bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/30"
                          }`}
                        >
                          {isSourceBased ? "Reported" : "Pattern"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/mock-tests/${mock.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0D1117] text-[11px] font-semibold transition-colors"
                        >
                          <span>Start</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Mock Detail Inspection Panel (5 cols on lg) */}
        <div className="lg:col-span-5">
          {selectedMock ? (
            <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4 space-y-4 font-mono text-xs">
              {/* Header */}
              <div className="border-b border-[#30363D] pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-[#58A6FF] tracking-wider">
                    Selected Assessment
                  </span>
                  <span className="text-[10px] text-[#8B949E]">
                    {selectedMock.mockType === "SOURCE_BASED" ? "Reported Paper" : "Pattern Set"}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-[#F0F6FC]">
                  {selectedMock.title}
                </h2>
                <p className="text-[11px] text-[#8B949E] font-sans leading-relaxed">
                  {selectedMock.description}
                </p>
              </div>

              {/* Assessment Meta Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                  <div className="text-[10px] text-[#8B949E] uppercase">Duration</div>
                  <div className="font-bold text-[#F0F6FC]">{selectedMock.durationMins} Mins</div>
                </div>
                <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                  <div className="text-[10px] text-[#8B949E] uppercase">Questions</div>
                  <div className="font-bold text-[#F0F6FC]">{selectedMock.questions.length}</div>
                </div>
                <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                  <div className="text-[10px] text-[#8B949E] uppercase">Pass Mark</div>
                  <div className="font-bold text-[#3FB950]">{selectedMock.passingMarks} / {selectedMock.totalMarks}</div>
                </div>
              </div>

              {/* Section Questions Breakdown */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-semibold text-[#8B949E] tracking-wider">
                  Included Questions ({selectedMock.questions.length})
                </div>
                <div className="space-y-1 divide-y divide-[#30363D]/40">
                  {selectedMock.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="pt-1.5 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#8B949E]">{idx + 1}.</span>
                        <span className="text-[#F0F6FC] truncate">{q.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <DifficultyBadge difficulty={q.difficulty as any} />
                        <span className="text-[10px] text-[#8B949E]">{q.marks} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-2.5 rounded bg-[#0D1117] border border-[#30363D] space-y-1 text-[11px] font-sans text-[#8B949E]">
                <div className="font-semibold font-mono text-[#F0F6FC] text-[10px] uppercase">
                  Assessment Instructions
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                  <li>Assessment timer will run continuously once launched.</li>
                  <li>All code is executed using OpenJDK 21 LTS with timeout guards.</li>
                  <li>Auto-submission occurs when timer reaches 00:00:00.</li>
                </ul>
              </div>

              {/* Primary Launch Action */}
              <Link
                href={`/mock-tests/${selectedMock.slug}`}
                className="w-full py-2 px-3 rounded bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0D1117] font-semibold flex items-center justify-center gap-2 transition-colors text-xs font-mono"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="rounded-md border border-[#30363D] bg-[#161B22] p-8 text-center text-[#8B949E] font-mono">
              Select a mock assessment from the table to preview details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
