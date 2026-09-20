"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { QuestionCard, QuestionCardData } from "@/components/questions/QuestionCard";
import {
  Building2,
  ChevronLeft,
  Search,
  Timer,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SectionTab = "ALL" | "MUST_DO" | "PYQ" | "SHIFT" | "CODING" | "SQL" | "FRONTEND" | "MOCK_TEST";

interface MockTestData {
  id: string;
  title: string;
  slug: string;
  description: string;
  company: string;
  durationMins: number;
  totalMarks: number;
  passingMarks: number;
  isLive: boolean;
}

interface TopicOption {
  name: string;
  slug: string;
  category: string;
}

interface AccentureDashboardClientProps {
  initialQuestions: QuestionCardData[];
  mockTests: MockTestData[];
  allTopics: TopicOption[];
}

export function AccentureDashboardClient({
  initialQuestions,
  mockTests,
  allTopics,
}: AccentureDashboardClientProps) {
  const [activeSection, setActiveSection] = useState<SectionTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [importanceFilter, setImportanceFilter] = useState("ALL");
  const [repeatedFilter, setRepeatedFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [questions, setQuestions] = useState<QuestionCardData[]>(initialQuestions);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    questions.forEach((q) => {
      if (q.year) years.add(q.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [questions]);

  const availableShifts = useMemo(() => {
    const shifts = new Set<string>();
    questions.forEach((q) => {
      if (q.shift) shifts.add(q.shift);
    });
    return Array.from(shifts).sort();
  }, [questions]);

  const handleBookmarkToggle = (id: string, nextBookmarked: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isBookmarked: nextBookmarked } : q))
    );
  };

  const stats = useMemo(() => {
    const total = questions.length;
    const mustDo = questions.filter((q) => q.importance === "MUST_DO").length;
    const pyqs = questions.filter((q) => q.sourceType === "REPORTED_PYQ" || q.sourceType === "CANDIDATE_REPORTED").length;
    const shifts = questions.filter(
      (q) => q.sourceType === "SHIFT_REPORTED" || Boolean(q.shift)
    ).length;
    const coding = questions.filter((q) => q.questionType === "CODING").length;
    const sql = questions.filter((q) => q.questionType === "SQL").length;
    const frontend = questions.filter(
      (q) => q.questionType === "HTML_CSS_JS" || q.questionType === "FRONTEND"
    ).length;
    const solved = questions.filter((q) => q.isSolved).length;
    const repeated = questions.filter((q) => q.isRepeated || (q.frequency && q.frequency > 1)).length;

    return { total, mustDo, pyqs, shifts, coding, sql, frontend, solved, repeated };
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (activeSection === "MUST_DO" && q.importance !== "MUST_DO") return false;
      if (activeSection === "PYQ" && q.sourceType !== "REPORTED_PYQ" && q.sourceType !== "CANDIDATE_REPORTED") return false;
      if (
        activeSection === "SHIFT" &&
        q.sourceType !== "SHIFT_REPORTED" &&
        !q.shift
      )
        return false;
      if (activeSection === "CODING" && q.questionType !== "CODING") return false;
      if (activeSection === "SQL" && q.questionType !== "SQL") return false;
      if (
        activeSection === "FRONTEND" &&
        q.questionType !== "HTML_CSS_JS" &&
        q.questionType !== "FRONTEND"
      )
        return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesDesc = (q.description || "").toLowerCase().includes(query);
        const matchesTopic = (q.topics || []).some((t) =>
          t.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesDesc && !matchesTopic) return false;
      }

      if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) {
        return false;
      }

      if (topicFilter !== "ALL") {
        const hasTopic = (q.topics || []).some(
          (t) => t.toLowerCase() === topicFilter.toLowerCase()
        );
        if (!hasTopic) return false;
      }

      if (typeFilter !== "ALL") {
        if (typeFilter === "CODING" && q.questionType !== "CODING") return false;
        if (typeFilter === "SQL" && q.questionType !== "SQL") return false;
        if (
          typeFilter === "FRONTEND" &&
          q.questionType !== "HTML_CSS_JS" &&
          q.questionType !== "FRONTEND"
        )
          return false;
      }

      if (yearFilter !== "ALL" && String(q.year) !== yearFilter) {
        return false;
      }

      if (shiftFilter !== "ALL" && q.shift !== shiftFilter) {
        return false;
      }

      if (sourceFilter !== "ALL" && q.sourceType !== sourceFilter) {
        return false;
      }

      if (importanceFilter !== "ALL" && q.importance !== importanceFilter) {
        return false;
      }

      if (repeatedFilter === "REPEATED_ONLY") {
        const isRep = q.isRepeated || (q.frequency && q.frequency > 1);
        if (!isRep) return false;
      }

      if (statusFilter === "SOLVED" && !q.isSolved) return false;
      if (statusFilter === "UNSOLVED" && q.isSolved) return false;

      return true;
    });
  }, [
    questions,
    activeSection,
    searchQuery,
    difficultyFilter,
    topicFilter,
    typeFilter,
    yearFilter,
    shiftFilter,
    sourceFilter,
    importanceFilter,
    repeatedFilter,
    statusFilter,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("ALL");
    setTopicFilter("ALL");
    setTypeFilter("ALL");
    setYearFilter("ALL");
    setShiftFilter("ALL");
    setSourceFilter("ALL");
    setImportanceFilter("ALL");
    setRepeatedFilter("ALL");
    setStatusFilter("ALL");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/questions" className="hover:text-[#F0F6FC]">
              Problems
            </Link>
            <span>/</span>
            <span className="text-[#58A6FF] font-semibold">Accenture</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC]">
            Accenture PYQs & Practice Track
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0D1117] font-mono text-xs font-semibold transition-colors"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Launch Mock Test</span>
          </Link>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 font-mono text-xs">
        <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
          <div className="text-[10px] text-[#8B949E] uppercase">Total</div>
          <div className="text-base font-bold text-[#F0F6FC]">{stats.total}</div>
        </div>
        <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
          <div className="text-[10px] text-[#D29922] uppercase">Must Do</div>
          <div className="text-base font-bold text-[#D29922]">{stats.mustDo}</div>
        </div>
        <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
          <div className="text-[10px] text-[#3FB950] uppercase">Reported PYQs</div>
          <div className="text-base font-bold text-[#3FB950]">{stats.pyqs}</div>
        </div>
        <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
          <div className="text-[10px] text-[#58A6FF] uppercase">DSA Coding</div>
          <div className="text-base font-bold text-[#58A6FF]">{stats.coding}</div>
        </div>
        <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
          <div className="text-[10px] text-[#8B949E] uppercase">SQL Queries</div>
          <div className="text-base font-bold text-[#F0F6FC]">{stats.sql}</div>
        </div>
        <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
          <div className="text-[10px] text-[#3FB950] uppercase">Solved</div>
          <div className="text-base font-bold text-[#3FB950]">{stats.solved} / {stats.total}</div>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: "ALL", label: "All Questions", count: stats.total },
          { id: "MUST_DO", label: "Must Do", count: stats.mustDo },
          { id: "PYQ", label: "Reported PYQs", count: stats.pyqs },
          { id: "SHIFT", label: "Shift Reports", count: stats.shifts },
          { id: "CODING", label: "DSA", count: stats.coding },
          { id: "SQL", label: "SQL", count: stats.sql },
          { id: "FRONTEND", label: "Frontend", count: stats.frontend },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as SectionTab)}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-mono border transition-colors shrink-0",
              activeSection === tab.id
                ? "bg-[#21262D] text-[#F0F6FC] font-semibold border-[#58A6FF]"
                : "text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC] hover:bg-[#21262D]/60"
            )}
          >
            <span>{tab.label}</span>
            <span className="ml-1 text-[10px] text-[#6E7681]">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="p-2.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-2 font-mono">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Accenture questions..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363D] rounded text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[11px]">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
          >
            <option value="ALL">All Topics</option>
            {allTopics.map((t) => (
              <option key={t.slug} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
          >
            <option value="ALL">All Types</option>
            <option value="CODING">DSA Coding</option>
            <option value="SQL">SQL</option>
            <option value="FRONTEND">Frontend</option>
          </select>

          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(e.target.value)}
            className="px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
          >
            <option value="ALL">All Priorities</option>
            <option value="MUST_DO">Must Do</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
          >
            <option value="ALL">All Status</option>
            <option value="SOLVED">Solved</option>
            <option value="UNSOLVED">Unsolved</option>
          </select>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Questions Dense Rows List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#8B949E]">
          <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center rounded-md bg-[#161B22] border border-[#30363D] text-[#8B949E] font-mono">
            No questions match your criteria.
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
