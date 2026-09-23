"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { QuestionCard, QuestionCardData } from "@/components/questions/QuestionCard";
import {
  Search,
  Timer,
  CheckCircle2,
  Code2,
  Database,
  MonitorCheck,
  ClipboardList,
  Sparkles,
  Layers,
  Play,
  ArrowRight,
  BarChart3,
  History,
  TrendingUp,
  Flame,
  Bookmark as BookmarkIcon,
  Circle,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENTURE_MODULES } from "@/lib/accentureModuleDefs";

export type HubTab = "OVERVIEW" | "MCQ" | "CODING" | "SQL" | "FRONTEND" | "MOCK_TEST";

// The 10 canonical assessment modules for Accenture (clean, no duplicates, no empty)
const CANONICAL_MCQ_SLUGS = [
  "networking",
  "cybersecurity",
  "cloud",
  "ms-office",
  "pseudocode",
  "devops",
  "dbms",
  "sql",
  "java-oop",
  "computer-fundamentals",
];

interface MockTestData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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

interface ModuleCounts {
  [key: string]: number;
}

interface AccentureUnifiedHubClientProps {
  initialQuestions: QuestionCardData[];
  mockTests: MockTestData[];
  allTopics: TopicOption[];
  moduleCounts: ModuleCounts;
  headerStats: {
    totalAttempts: number;
    accuracy: number;
    totalQuestions: number;
  };
  initialTab?: HubTab;
}

export function AccentureUnifiedHubClient({
  initialQuestions,
  mockTests,
  allTopics,
  moduleCounts,
  headerStats,
  initialTab = "OVERVIEW",
}: AccentureUnifiedHubClientProps) {
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [quickFilter, setQuickFilter] = useState<"ALL" | "MUST_DO" | "SOLVED" | "UNSOLVED" | "BOOKMARKED" | "PYQ">("ALL");

  // Deduplicate questions by slug and normalized title
  const deduplicatedQuestions = useMemo(() => {
    const seen = new Set<string>();
    const result: QuestionCardData[] = [];
    for (const q of initialQuestions) {
      const key = (q.slug || q.id).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(q);
      }
    }
    return result;
  }, [initialQuestions]);

  const [questions, setQuestions] = useState<QuestionCardData[]>(deduplicatedQuestions);

  const handleBookmarkToggle = (id: string, nextBookmarked: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isBookmarked: nextBookmarked } : q))
    );
  };

  // High-level statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const coding = questions.filter((q) => q.questionType === "CODING").length;
    const sql = questions.filter((q) => q.questionType === "SQL").length;
    const frontend = questions.filter(
      (q) => q.questionType === "HTML_CSS_JS" || q.questionType === "FRONTEND"
    ).length;
    const mcq = moduleCounts.mcq || 2610;
    const pyqs = questions.filter(
      (q) => q.sourceType === "REPORTED_PYQ" || q.sourceType === "CANDIDATE_REPORTED"
    ).length;
    const solved = questions.filter((q) => q.isSolved).length;
    const mustDo = questions.filter((q) => q.importance === "MUST_DO").length;

    return { total, coding, sql, frontend, mcq, pyqs, solved, mustDo };
  }, [questions, moduleCounts]);

  // Tab filtering
  const currentTabQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (activeTab === "CODING" && q.questionType !== "CODING") return false;
      if (activeTab === "SQL" && q.questionType !== "SQL") return false;
      if (
        activeTab === "FRONTEND" &&
        q.questionType !== "HTML_CSS_JS" &&
        q.questionType !== "FRONTEND"
      )
        return false;
      return true;
    });
  }, [questions, activeTab]);

  // Sub-filtering (search, difficulty, topic, quickFilter)
  const filteredQuestions = useMemo(() => {
    return currentTabQuestions.filter((q) => {
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

      if (selectedTopic !== "ALL") {
        const hasTopic = (q.topics || []).some(
          (t) => t.toLowerCase() === selectedTopic.toLowerCase()
        );
        if (!hasTopic) return false;
      }

      if (quickFilter === "MUST_DO" && q.importance !== "MUST_DO") return false;
      if (quickFilter === "SOLVED" && !q.isSolved) return false;
      if (quickFilter === "UNSOLVED" && q.isSolved) return false;
      if (quickFilter === "BOOKMARKED" && !q.isBookmarked) return false;
      if (
        quickFilter === "PYQ" &&
        q.sourceType !== "REPORTED_PYQ" &&
        q.sourceType !== "CANDIDATE_REPORTED"
      )
        return false;

      return true;
    });
  }, [currentTabQuestions, searchQuery, difficultyFilter, selectedTopic, quickFilter]);

  // 10 Canonical Modules for Grid & Sidebar
  const canonicalModules = useMemo(() => {
    return ACCENTURE_MODULES.filter((m) => CANONICAL_MCQ_SLUGS.includes(m.slug));
  }, []);

  // Frontend Live Sandbox State
  const [sandboxTab, setSandboxTab] = useState<"html" | "css" | "js">("html");
  const [sandboxHtml, setSandboxHtml] = useState<string>(
    `<div class="counter-card">\n  <h2>Interactive Counter</h2>\n  <div id="counter-value">0</div>\n  <div class="controls">\n    <button id="btn-dec">- Decrement</button>\n    <button id="btn-inc">+ Increment</button>\n    <button id="btn-rst">Reset</button>\n  </div>\n</div>`
  );
  const [sandboxCss, setSandboxCss] = useState<string>(
    `.counter-card {\n  font-family: system-ui, sans-serif;\n  background: #161B22;\n  color: #F0F6FC;\n  padding: 24px;\n  border-radius: 8px;\n  border: 1px solid #30363D;\n  text-align: center;\n  max-width: 320px;\n  margin: 30px auto;\n}\n#counter-value {\n  font-size: 3rem;\n  font-weight: 700;\n  margin: 16px 0;\n  color: #58A6FF;\n}\nbutton {\n  background: #21262D;\n  color: #F0F6FC;\n  border: 1px solid #30363D;\n  padding: 8px 12px;\n  margin: 0 4px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 12px;\n  transition: all 0.2s;\n}\nbutton:hover {\n  background: #30363D;\n}`
  );
  const [sandboxJs, setSandboxJs] = useState<string>(
    `let count = 0;\nconst valEl = document.getElementById('counter-value');\n\ndocument.getElementById('btn-inc').addEventListener('click', () => {\n  count++;\n  valEl.innerText = count;\n});\n\ndocument.getElementById('btn-dec').addEventListener('click', () => {\n  count = Math.max(0, count - 1);\n  valEl.innerText = count;\n});\n\ndocument.getElementById('btn-rst').addEventListener('click', () => {\n  count = 0;\n  valEl.innerText = count;\n});`
  );
  const [previewSrc, setPreviewSrc] = useState<string>(
    `<!DOCTYPE html><html><head><style>${sandboxCss}</style></head><body>${sandboxHtml}<script>${sandboxJs}<\/script></body></html>`
  );

  const updatePreview = () => {
    setPreviewSrc(
      `<!DOCTYPE html><html><head><style>${sandboxCss}</style></head><body>${sandboxHtml}<script>${sandboxJs}<\/script></body></html>`
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("ALL");
    setSelectedTopic("ALL");
    setQuickFilter("ALL");
  };

  return (
    <div className="flex h-full min-h-0 font-sans text-xs">
      {/* ─── LEFT SIDEBAR (CLEAN, NO CLUTTERED NUMBERS) ─── */}
      <aside className="hidden h-full w-60 shrink-0 overflow-y-auto border-r border-[#30363D] bg-[#0D1117] p-4 lg:block scrollbar-thin scrollbar-thumb-[#30363D]">
        <div className="mb-4 border-b border-[#30363D] pb-3.5">
          <Link
            href="/home/accenture"
            className="font-mono text-sm font-bold tracking-wider text-[#F0F6FC] flex items-center gap-2"
          >
            <Layers className="h-4 w-4 text-[#58A6FF]" />
            <span>ACCENTURE</span>
          </Link>
          <p className="mt-0.5 text-[10px] text-[#6E7681]">Assessment workspace</p>
        </div>

        <nav aria-label="Accenture modules" className="space-y-1">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={cn(
              "w-full flex items-center justify-between rounded-md px-3 py-2 font-mono text-[11px] font-semibold transition-all text-left",
              activeTab === "OVERVIEW"
                ? "border-l-2 border-[#58A6FF] bg-[#21262D] text-[#58A6FF]"
                : "text-[#8B949E] hover:bg-[#161B22] hover:text-[#F0F6FC]"
            )}
          >
            <span>Overview</span>
            <span className="text-[9px] uppercase text-[#6E7681]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("MCQ")}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-semibold transition-all text-left",
              activeTab === "MCQ"
                ? "border-l-2 border-[#58A6FF] bg-[#21262D] text-[#58A6FF]"
                : "text-[#8B949E] hover:bg-[#161B22] hover:text-[#F0F6FC]"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-[#3FB950]" />
            <span>MCQ Practice</span>
          </button>

          <button
            onClick={() => setActiveTab("CODING")}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-semibold transition-all text-left",
              activeTab === "CODING"
                ? "border-l-2 border-[#58A6FF] bg-[#21262D] text-[#58A6FF]"
                : "text-[#8B949E] hover:bg-[#161B22] hover:text-[#F0F6FC]"
            )}
          >
            <Code2 className="h-3.5 w-3.5 text-[#58A6FF]" />
            <span>DSA & Coding PYQ</span>
          </button>

          <button
            onClick={() => setActiveTab("SQL")}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-semibold transition-all text-left",
              activeTab === "SQL"
                ? "border-l-2 border-[#58A6FF] bg-[#21262D] text-[#58A6FF]"
                : "text-[#8B949E] hover:bg-[#161B22] hover:text-[#F0F6FC]"
            )}
          >
            <Database className="h-3.5 w-3.5 text-[#A371F7]" />
            <span>SQL Queries</span>
          </button>

          <button
            onClick={() => setActiveTab("FRONTEND")}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-semibold transition-all text-left",
              activeTab === "FRONTEND"
                ? "border-l-2 border-[#58A6FF] bg-[#21262D] text-[#58A6FF]"
                : "text-[#8B949E] hover:bg-[#161B22] hover:text-[#F0F6FC]"
            )}
          >
            <MonitorCheck className="h-3.5 w-3.5 text-[#D29922]" />
            <span>Frontend Lab</span>
          </button>

          <button
            onClick={() => setActiveTab("MOCK_TEST")}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-semibold transition-all text-left",
              activeTab === "MOCK_TEST"
                ? "border-l-2 border-[#58A6FF] bg-[#21262D] text-[#58A6FF]"
                : "text-[#8B949E] hover:bg-[#161B22] hover:text-[#F0F6FC]"
            )}
          >
            <Timer className="h-3.5 w-3.5 text-[#E3B341]" />
            <span>Mock Tests</span>
          </button>

          <div className="px-3 pb-1 pt-4 font-mono text-[9px] font-bold uppercase tracking-wider text-[#6E7681]">
            10 Assessment Modules
          </div>
          {canonicalModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={`side-module-${module.slug}`}
                href={`/accenture/mcq/practice?module=${module.slug}`}
                title={module.name}
                className="group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[#8B949E] transition-all hover:bg-[#161B22] hover:text-[#F0F6FC] border border-transparent hover:border-[#58A6FF]/20"
              >
                <Icon className="h-3 w-3 shrink-0 text-[#58A6FF] group-hover:scale-110 transition-transform" />
                <span className="truncate text-[11px]">{module.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="mx-auto min-w-0 max-w-7xl flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-[#30363D]">
        {/* Top Breadcrumb & Clean Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B949E]">
            <Link href="/home/accenture" className="hover:text-[#F0F6FC] transition-colors">
              ACCENTURE
            </Link>
            <span>/</span>
            <span className="font-semibold tracking-wider text-[#58A6FF] uppercase">
              {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/accenture/test"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] font-mono text-xs font-semibold border border-[#30363D] transition-colors"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Full Mock Exam</span>
            </Link>
          </div>
        </div>

        {/* ─── TAB 1: OVERVIEW (RESTORED EXACTLY AS USER REQUESTED) ─── */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            {/* Hero Header */}
            <section className="relative overflow-hidden rounded-xl border border-[#30363D] bg-gradient-to-r from-[#161B22] via-[#0D1117] to-[#161B22] p-6 sm:p-7 shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#3FB950]" />

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#58A6FF]">
                    <Sparkles className="h-3 w-3 text-[#58A6FF]" />
                    <span>ACCENTURE RECRUITMENT ASSESSMENT BANK</span>
                  </div>
                  <h1 className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F6FC]">
                    ACCENTURE PREPARATION
                  </h1>
                  <p className="max-w-2xl text-xs text-[#8B949E] leading-relaxed">
                    Build assessment readiness with focused technical practice, coding rounds,
                    mock tests, and progress tracking.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 border border-[#30363D] bg-[#0D1117]/90 px-3.5 py-2 rounded-lg font-mono text-xs text-[#8B949E] shadow-inner">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FB950] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3FB950]"></span>
                  </span>
                  <span className="font-bold text-[#F0F6FC]">{moduleCounts.mcq ?? 2610}</span>
                  <span className="text-[#6E7681]">MCQs Live</span>
                </div>
              </div>
            </section>

            {/* Your Preparation Progress */}
            <section aria-labelledby="progress-heading" className="rounded-xl border border-[#30363D] bg-[#161B22]/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#30363D]/80 pb-3">
                <div className="space-y-0.5">
                  <h2 id="progress-heading" className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#58A6FF]" />
                    <span>Your Preparation Progress</span>
                  </h2>
                  <p className="text-[11px] text-[#8B949E]">Real-time performance metrics and question coverage status.</p>
                </div>
                <span className="rounded-full border border-[#3FB950]/30 bg-[#3FB950]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#3FB950]">
                  LIVE SUMMARY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#3FB950]/50 hover:shadow-[0_0_15px_rgba(63,185,80,0.1)]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                    <span>MCQs Solved</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3FB950]" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-black text-[#3FB950] tracking-tight">{moduleCounts.progress ?? 0}</div>
                </div>

                <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#E3B341]/50 hover:shadow-[0_0_15px_rgba(227,179,65,0.1)]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                    <span>Mock Attempts</span>
                    <Timer className="h-3.5 w-3.5 text-[#E3B341]" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-black text-[#F0F6FC] tracking-tight">{headerStats.totalAttempts}</div>
                </div>

                <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#58A6FF]/50 hover:shadow-[0_0_15px_rgba(88,166,255,0.1)]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                    <span>Average Accuracy</span>
                    <BarChart3 className="h-3.5 w-3.5 text-[#58A6FF]" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-black text-[#58A6FF] tracking-tight">{headerStats.accuracy}%</div>
                </div>

                <div className="group rounded-lg border border-[#30363D] bg-[#0D1117] p-3.5 transition-all hover:border-[#A371F7]/50 hover:shadow-[0_0_15px_rgba(163,113,247,0.1)]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#6E7681]">
                    <span>Question Bank</span>
                    <ClipboardList className="h-3.5 w-3.5 text-[#A371F7]" />
                  </div>
                  <div className="mt-2 font-mono text-2xl font-black text-[#F0F6FC] tracking-tight">{headerStats.totalQuestions}</div>
                </div>
              </div>
            </section>

            {/* Quick Action Navigation: Analytics, Test History, Mock Tests */}
            <section className="grid grid-cols-1 gap-5 border-t border-[#30363D] pt-5 lg:grid-cols-2">
              <div className="space-y-3">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#D29922]" />
                  <span>Mock Tests</span>
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    ["All Mock Tests", "/accenture/test", Timer],
                    ["100 Questions · Mixed", "/accenture/test?count=100&duration=90", ClipboardList],
                    ["200 Questions · Mixed", "/accenture/test?count=200&duration=150", ClipboardList],
                    ["300 Questions · Mixed", "/accenture/test?count=300&duration=240", ClipboardList],
                  ].map(([label, href, Icon]) => (
                    <Link
                      key={label as string}
                      href={href as string}
                      className="group flex items-center gap-2.5 rounded-lg border border-[#30363D] bg-[#161B22] p-3 text-[#8B949E] transition-all hover:border-[#D29922]/60 hover:bg-[#21262D]/60 hover:text-[#F0F6FC]"
                    >
                      <div className="p-1.5 rounded bg-[#D29922]/10 text-[#D29922] group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="truncate font-mono text-xs font-medium">{label as string}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#58A6FF]" />
                  <span>Analytics & Progress History</span>
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    ["Progress Chart", "/accenture/progress", BarChart3],
                    ["Analytics Dashboard", "/accenture/analytics", TrendingUp],
                    ["Test History", "/accenture/history", History],
                    ["MCQ Practice", "/accenture/mcq/practice", CheckCircle2],
                  ].map(([label, href, Icon]) => (
                    <Link
                      key={label as string}
                      href={href as string}
                      className="group flex items-center gap-2.5 rounded-lg border border-[#30363D] bg-[#161B22] p-3 text-[#8B949E] transition-all hover:border-[#58A6FF]/60 hover:bg-[#21262D]/60 hover:text-[#F0F6FC]"
                    >
                      <div className="p-1.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="truncate font-mono text-xs font-medium">{label as string}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Detailed Assessment Readiness & Domain Progress */}
            <section className="space-y-4 border-t border-[#30363D] pt-5">
              <div className="flex items-center justify-between pb-1">
                <div className="space-y-0.5">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#3FB950]" />
                    <span>Assessment Readiness & Domain Mastery</span>
                  </h3>
                  <p className="text-[11px] text-[#8B949E]">
                    Track your preparation across the 4 key stages of the Accenture recruitment process.
                  </p>
                </div>
                <Link
                  href="/accenture/progress"
                  className="font-mono text-[11px] text-[#58A6FF] hover:underline flex items-center gap-1"
                >
                  <span>Detailed Progress Report</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Domain 1: MCQs */}
                <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#F0F6FC] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
                      Technical MCQs
                    </span>
                    <span className="text-[10px] font-mono text-[#3FB950]">
                      {moduleCounts.progress ?? 0} / {stats.mcq}
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3FB950] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round(((moduleCounts.progress ?? 0) / (stats.mcq || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono">
                    <span>Target: 80%</span>
                    <Link href="/accenture/mcq/practice" className="text-[#58A6FF] hover:underline">
                      Practice →
                    </Link>
                  </div>
                </div>

                {/* Domain 2: DSA Coding */}
                <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#F0F6FC] flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#58A6FF]" />
                      DSA Coding
                    </span>
                    <span className="text-[10px] font-mono text-[#58A6FF]">
                      {questions.filter((q) => q.questionType === "CODING" && q.isSolved).length} / {stats.coding}
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#58A6FF] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((questions.filter((q) => q.questionType === "CODING" && q.isSolved).length / (stats.coding || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono">
                    <span>Target: 75%</span>
                    <button onClick={() => setActiveTab("CODING")} className="text-[#58A6FF] hover:underline">
                      Solve →
                    </button>
                  </div>
                </div>

                {/* Domain 3: SQL */}
                <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#F0F6FC] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#A371F7]" />
                      SQL Assessment
                    </span>
                    <span className="text-[10px] font-mono text-[#A371F7]">
                      {questions.filter((q) => q.questionType === "SQL" && q.isSolved).length} / {stats.sql}
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#A371F7] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((questions.filter((q) => q.questionType === "SQL" && q.isSolved).length / (stats.sql || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono">
                    <span>Target: 70%</span>
                    <button onClick={() => setActiveTab("SQL")} className="text-[#A371F7] hover:underline">
                      Solve →
                    </button>
                  </div>
                </div>

                {/* Domain 4: Frontend */}
                <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#F0F6FC] flex items-center gap-1.5">
                      <MonitorCheck className="w-3.5 h-3.5 text-[#D29922]" />
                      Frontend Lab
                    </span>
                    <span className="text-[10px] font-mono text-[#D29922]">
                      {questions.filter((q) => (q.questionType === "HTML_CSS_JS" || q.questionType === "FRONTEND") && q.isSolved).length} / {stats.frontend}
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#D29922] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((questions.filter((q) => (q.questionType === "HTML_CSS_JS" || q.questionType === "FRONTEND") && q.isSolved).length / (stats.frontend || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono">
                    <span>Target: 70%</span>
                    <button onClick={() => setActiveTab("FRONTEND")} className="text-[#D29922] hover:underline">
                      Solve →
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* High-Yield Must-Do Questions */}
            <section className="space-y-3 border-t border-[#30363D] pt-5">
              <div className="flex items-center justify-between pb-1">
                <div className="space-y-0.5">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center gap-2">
                    <Flame className="h-4 w-4 text-[#D29922]" />
                    <span>High-Yield Must-Do Questions (Reported in Recent Drives)</span>
                  </h3>
                  <p className="text-[11px] text-[#8B949E]">
                    Questions identified as high-yield patterns across verified Accenture exam drives.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("CODING");
                    setQuickFilter("MUST_DO");
                  }}
                  className="font-mono text-[11px] text-[#58A6FF] hover:underline flex items-center gap-1"
                >
                  <span>View All Must-Do</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {questions
                  .filter((q) => q.importance === "MUST_DO")
                  .slice(0, 5)
                  .map((q) => (
                    <QuestionCard
                      key={`overview-mustdo-${q.id}`}
                      question={q}
                      onBookmarkToggle={handleBookmarkToggle}
                    />
                  ))}
              </div>
            </section>
          </div>
        )}

        {/* ─── TAB 2: MCQ PRACTICE HUB ─── */}
        {activeTab === "MCQ" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
              <div>
                <h2 className="font-mono text-base font-bold text-[#F0F6FC]">
                  10 Canonical Technical MCQ Modules
                </h2>
                <p className="text-[11px] text-[#8B949E]">
                  Verified question bank with checked answers and direct test simulation.
                </p>
              </div>
              <Link
                href="/accenture/mcq/practice"
                className="inline-flex items-center gap-2 rounded bg-[#58A6FF] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#0D1117] transition-all hover:bg-[#58A6FF]/90"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch All Modules (2,610 Qs)</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {canonicalModules.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={`mcq-grid-${m.slug}`}
                    className="flex flex-col justify-between rounded-xl border border-[#30363D] bg-[#161B22] p-5 space-y-4 hover:border-[#58A6FF]/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#58A6FF]/10 text-[#58A6FF]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-mono text-sm font-bold text-[#F0F6FC]">
                            {m.name}
                          </h3>
                          <span className="text-[10px] text-[#6E7681] font-mono">
                            Canonical Module
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#8B949E] leading-relaxed">
                        {m.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#30363D] flex items-center justify-between">
                      <Link
                        href={`/accenture/mcq/practice?module=${m.slug}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#58A6FF] hover:underline"
                      >
                        <span>Start Practice</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/accenture/test?module=${m.slug}`}
                        className="font-mono text-[11px] text-[#8B949E] hover:text-[#F0F6FC]"
                      >
                        Take Test
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB 3 & 4: CODING & SQL QUESTIONS (CLEAN FLAT LIST LIKE SQL & FRONTEND, NO ACCORDIONS) ─── */}
        {(activeTab === "CODING" || activeTab === "SQL") && (
          <div className="space-y-4">
            {/* Filter Controls Bar */}
            <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2.5 font-mono text-xs">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab === "CODING" ? "DSA coding" : "SQL"} problems by title, topic, or description...`}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0D1117] border border-[#30363D] rounded text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF]"
                  />
                </div>

                {/* Difficulty Filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] text-[11px]"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                {/* Topic Selector */}
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] text-[11px]"
                >
                  <option value="ALL">All Topics</option>
                  {allTopics.map((t) => (
                    <option key={t.slug} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Status & Importance Filter Pills (Important, Progress, Done, etc.) */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#30363D]/60 text-[11px]">
                <span className="text-[#6E7681] text-[10px] mr-1 uppercase">Filter:</span>
                {[
                  { id: "ALL", label: "All" },
                  { id: "MUST_DO", label: "Important / Must Do", icon: Flame, color: "text-[#D29922]" },
                  { id: "SOLVED", label: "Done / Solved", icon: CheckCircle2, color: "text-[#3FB950]" },
                  { id: "UNSOLVED", label: "In Progress / Unsolved", icon: Circle, color: "text-[#8B949E]" },
                  { id: "BOOKMARKED", label: "Bookmarked", icon: BookmarkIcon, color: "text-[#E3B341]" },
                  { id: "PYQ", label: "Reported PYQs", color: "text-[#58A6FF]" },
                ].map((pill) => {
                  const Icon = (pill as any).icon;
                  const isSelected = quickFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setQuickFilter(pill.id as any)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono border transition-colors",
                        isSelected
                          ? "bg-[#21262D] text-[#F0F6FC] border-[#58A6FF] font-semibold"
                          : "text-[#8B949E] border-[#30363D] hover:bg-[#21262D]/60 hover:text-[#F0F6FC]"
                      )}
                    >
                      {Icon && <Icon className={cn("w-3 h-3", (pill as any).color)} />}
                      <span>{pill.label}</span>
                    </button>
                  );
                })}

                {(searchQuery || difficultyFilter !== "ALL" || selectedTopic !== "ALL" || quickFilter !== "ALL") && (
                  <button
                    onClick={handleResetFilters}
                    className="ml-auto text-[10px] text-[#58A6FF] hover:underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Questions Result Count */}
            <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#8B949E]">
              <span>
                Showing {filteredQuestions.length} of {currentTabQuestions.length} questions
              </span>
              <span>Deduplicated & Clean List</span>
            </div>

            {/* DIRECT FLAT LIST RENDERING (NO ACCORDIONS, EXACTLY AS USER REQUESTED) */}
            {filteredQuestions.length === 0 ? (
              <div className="p-10 text-center rounded-xl bg-[#161B22] border border-[#30363D] text-[#8B949E] font-mono space-y-2">
                <p>No questions matched your search and filter criteria.</p>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#58A6FF] hover:underline"
                >
                  Reset all filters
                </button>
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
        )}

        {/* ─── TAB 5: FRONTEND LAB & SANDBOX ─── */}
        {activeTab === "FRONTEND" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
              <div>
                <h2 className="font-mono text-base font-bold text-[#F0F6FC] flex items-center gap-2">
                  <MonitorCheck className="w-5 h-5 text-[#D29922]" />
                  <span>Frontend Technical Challenges & Live Sandbox</span>
                </h2>
                <p className="text-[11px] text-[#8B949E]">
                  Accenture reported frontend DOM manipulation questions with an integrated live
                  preview editor.
                </p>
              </div>
            </div>

            {/* Frontend Question List */}
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                Reported Frontend Problems
              </h3>
              <div className="space-y-1.5">
                {currentTabQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
            </div>

            {/* Embedded Live Sandbox */}
            <div className="rounded-xl border border-[#30363D] bg-[#161B22] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363D] bg-[#0D1117] text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#F0F6FC] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[#58A6FF]" />
                    Interactive Sandbox Editor
                  </span>
                  <div className="flex items-center gap-1 bg-[#161B22] border border-[#30363D] rounded p-0.5">
                    {(["html", "css", "js"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSandboxTab(tab)}
                        className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] uppercase font-bold transition-colors",
                          sandboxTab === tab
                            ? "bg-[#21262D] text-[#58A6FF]"
                            : "text-[#8B949E] hover:text-[#F0F6FC]"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={updatePreview}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0D1117] font-mono font-semibold text-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run / Update Preview</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#30363D] h-[340px]">
                {/* Code Editor */}
                <div className="flex flex-col h-full bg-[#0D1117]">
                  {sandboxTab === "html" && (
                    <textarea
                      value={sandboxHtml}
                      onChange={(e) => setSandboxHtml(e.target.value)}
                      className="w-full h-full p-3 font-mono text-xs text-[#F0F6FC] bg-transparent resize-none focus:outline-none"
                      placeholder="Write HTML..."
                      spellCheck={false}
                    />
                  )}
                  {sandboxTab === "css" && (
                    <textarea
                      value={sandboxCss}
                      onChange={(e) => setSandboxCss(e.target.value)}
                      className="w-full h-full p-3 font-mono text-xs text-[#F0F6FC] bg-transparent resize-none focus:outline-none"
                      placeholder="Write CSS..."
                      spellCheck={false}
                    />
                  )}
                  {sandboxTab === "js" && (
                    <textarea
                      value={sandboxJs}
                      onChange={(e) => setSandboxJs(e.target.value)}
                      className="w-full h-full p-3 font-mono text-xs text-[#F0F6FC] bg-transparent resize-none focus:outline-none"
                      placeholder="Write JavaScript..."
                      spellCheck={false}
                    />
                  )}
                </div>

                {/* Live Preview Iframe */}
                <div className="h-full bg-[#0D1117] flex flex-col">
                  <div className="px-3 py-1 bg-[#161B22] border-b border-[#30363D] text-[10px] font-mono text-[#8B949E] uppercase">
                    Live Output Preview
                  </div>
                  <iframe
                    srcDoc={previewSrc}
                    title="Live Preview"
                    sandbox="allow-scripts"
                    className="w-full flex-1 border-0 bg-zinc-950"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 6: MOCK TESTS ─── */}
        {activeTab === "MOCK_TEST" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
              <div>
                <h2 className="font-mono text-base font-bold text-[#F0F6FC]">
                  Accenture Assessment Simulations & Mock Tests
                </h2>
                <p className="text-[11px] text-[#8B949E]">
                  Full-length assessments matching Accenture's test duration, format, and passing
                  criteria.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTests.map((mt) => (
                <div
                  key={mt.id}
                  className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col justify-between space-y-4 hover:border-[#58A6FF]/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20 px-2 py-0.5 font-mono text-[10px]">
                        {mt.company}
                      </span>
                      {mt.isLive && (
                        <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#3FB950]">
                          <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <h3 className="font-mono text-sm font-bold text-[#F0F6FC]">{mt.title}</h3>
                    {mt.description && (
                      <p className="text-xs text-[#8B949E] line-clamp-2">{mt.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#30363D] flex items-center justify-between text-xs font-mono">
                    <div className="text-[11px] text-[#8B949E] flex items-center gap-2">
                      <Timer className="w-3.5 h-3.5 text-[#E3B341]" />
                      <span>{mt.durationMins} mins</span>
                    </div>
                    <Link
                      href={`/mock-tests/${mt.slug}`}
                      className="px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] font-semibold border border-[#30363D] transition-colors"
                    >
                      Attempt Test →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
