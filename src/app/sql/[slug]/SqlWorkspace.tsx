"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DifficultyBadge,
  ImportanceBadge,
  MustDoBadge,
  RepeatedPatternBadge,
} from "@/components/ui/Badge";
import { SqlTableMetadata } from "@/lib/sqlEngine";
import { analyzeQuestionEvidence } from "@/lib/importance";
import { WhyImportantCard } from "@/components/questions/WhyImportantCard";
import { ProgressiveHintSolution } from "@/components/questions/ProgressiveHintSolution";
import {
  Database,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  Table as TableIcon,
  Code2,
  BrainCircuit,
  Layers,
  Sparkles,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Bookmark,
  AlignLeft,
  Check,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamically import Monaco Editor to prevent SSR issues
const MonacoCodeEditor = dynamic(
  () =>
    import("@/components/editor/MonacoCodeEditor").then(
      (mod) => mod.MonacoCodeEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-xs font-mono text-[#8B949E] bg-[#0D1117]">
        Loading Monaco SQL Editor...
      </div>
    ),
  }
);

interface SqlWorkspaceProps {
  question: any;
  schemaMetadata: SqlTableMetadata[];
  initialExpectedOutput?: {
    columns: string[];
    rows: Record<string, any>[];
  } | null;
}

// Lightweight SQL keyword capitalizer & formatter
function formatSqlQuery(sql: string): string {
  const keywords = [
    "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY",
    "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN",
    "ON", "AS", "AND", "OR", "NOT", "IN", "IS NULL", "IS NOT NULL",
    "COUNT", "SUM", "AVG", "MAX", "MIN", "DISTINCT", "LIMIT",
    "OFFSET", "UNION", "UNION ALL", "INTERSECT", "EXCEPT",
    "CASE", "WHEN", "THEN", "ELSE", "END", "WITH", "LIKE", "BETWEEN",
    "ASC", "DESC"
  ];
  let formatted = sql;
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    formatted = formatted.replace(regex, kw);
  });
  return formatted;
}

export function SqlWorkspace({
  question,
  schemaMetadata,
  initialExpectedOutput,
}: SqlWorkspaceProps) {
  const defaultSql =
    question.starterCode?.sql ||
    (question.sqlExpectedQuery
      ? `-- Write your SQL solution below\nSELECT `
      : `-- Write your SQL solution below\nSELECT * FROM ...;`);

  const [query, setQuery] = useState<string>(defaultSql);
  const [fontSize, setFontSize] = useState<number>(14);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Results state
  const [resultColumns, setResultColumns] = useState<string[]>([]);
  const [resultRows, setResultRows] = useState<Record<string, any>[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<
    "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "SYNTAX_ERROR" | null
  >(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Expected output
  const [expectedColumns, setExpectedColumns] = useState<string[]>(
    initialExpectedOutput?.columns || []
  );
  const [expectedRows, setExpectedRows] = useState<Record<string, any>[]>(
    initialExpectedOutput?.rows || []
  );
  const [explainPlan, setExplainPlan] = useState<string[]>([]);

  // Navigation & View tabs
  const [activeLeftTab, setActiveLeftTab] = useState<
    "problem" | "hints" | "schema"
  >("problem");
  const [activeConsoleTab, setActiveConsoleTab] = useState<
    "testcase" | "result" | "expected" | "explain"
  >("testcase");
  const [activeTestcaseTableIdx, setActiveTestcaseTableIdx] = useState<number>(0);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  // Check initial bookmark
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`bookmark_${question.id}`);
      if (stored === "true") setIsBookmarked(true);
    } catch {}
  }, [question.id]);

  const handleBookmarkToggle = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      localStorage.setItem(`bookmark_${question.id}`, String(next));
    } catch {}
  };

  // Source classification
  const getSourceClassification = () => {
    const st = question.sourceType;
    if (st === "REPORTED_PYQ" || st === "SHIFT_REPORTED") {
      return {
        label: "Accenture Reported",
        className: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
      };
    }
    if (st === "COMPANY_PATTERN") {
      return {
        label: "Company Pattern",
        className: "bg-sky-950/70 text-sky-300 border-sky-700/60",
      };
    }
    return {
      label: "General SQL",
      className: "bg-[#21262D] text-[#8B949E] border-[#30363D]",
    };
  };

  const sourceConfig = getSourceClassification();
  const evidence = analyzeQuestionEvidence(question);

  // Execute SQL Query Handler
  const handleExecuteSql = useCallback(
    async (action: "run" | "submit" | "explain") => {
      if (isRunning || isSubmitting) return;

      if (action === "submit") setIsSubmitting(true);
      else setIsRunning(true);

      setErrorMessage(null);
      setIsConsoleCollapsed(false);
      setActiveConsoleTab(action === "explain" ? "explain" : "result");

      try {
        const res = await fetch("/api/sql/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            query,
            action,
          }),
        });

        const json = await res.json();

        if (json.success && json.data) {
          const data = json.data;

          if (data.verdict === "SYNTAX_ERROR" || data.verdict === "RUNTIME_ERROR") {
            setVerdict(data.verdict);
            setErrorMessage(data.error || "Query execution error.");
            setResultColumns([]);
            setResultRows([]);
            setRowCount(0);
          } else {
            setResultColumns(data.columns || []);
            setResultRows(data.rows || []);
            setRowCount(data.rowCount || (data.rows ? data.rows.length : 0));
            setExecutionTimeMs(data.executionTimeMs || null);
            setVerdict(data.verdict || "ACCEPTED");

            if (data.expectedColumns && data.expectedColumns.length > 0) {
              setExpectedColumns(data.expectedColumns);
            }
            if (data.expectedRows && data.expectedRows.length > 0) {
              setExpectedRows(data.expectedRows);
            }
            if (data.explainPlan && data.explainPlan.length > 0) {
              setExplainPlan(data.explainPlan);
            }

            if (data.verdict === "ACCEPTED") {
              setStatusMessage(
                action === "submit"
                  ? "Accepted! All test criteria passed successfully."
                  : "Query executed successfully! Output matches expected target."
              );
            } else {
              setStatusMessage("Output differs from expected reference result.");
            }
          }
        } else {
          setVerdict("RUNTIME_ERROR");
          setErrorMessage(json.error?.message || "Failed to execute query.");
        }
      } catch (err: any) {
        setVerdict("RUNTIME_ERROR");
        setErrorMessage(err.message || "Network error executing query.");
      } finally {
        setIsRunning(false);
        setIsSubmitting(false);
      }
    },
    [isRunning, isSubmitting, question.id, query]
  );

  const handleReset = () => {
    setQuery(defaultSql);
    setVerdict(null);
    setErrorMessage(null);
    setStatusMessage(null);
    setResultColumns([]);
    setResultRows([]);
    setRowCount(0);
    setActiveConsoleTab("testcase");
  };

  const handleFormat = () => {
    setQuery((prev) => formatSqlQuery(prev));
  };

  const activeTestTable = schemaMetadata[activeTestcaseTableIdx] || schemaMetadata[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D1117] text-[#F0F6FC] overflow-hidden font-sans select-none">
      {/* ============================================================ */}
      {/* TOP WORKSPACE TOOLBAR                                        */}
      {/* ============================================================ */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[#30363D] bg-[#161B22] text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Link
            href="/home/accenture?tab=SQL"
            className="flex items-center gap-1 text-[#8B949E] hover:text-[#F0F6FC] px-1.5 py-1 rounded hover:bg-[#21262D] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Accenture SQL</span>
          </Link>
          <span className="text-[#30363D]">/</span>
          <span className="font-semibold text-[#F0F6FC] truncate max-w-[140px] sm:max-w-xs md:max-w-md">
            {question.title}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
          {evidence.isMustDo ? (
            <MustDoBadge />
          ) : (
            <ImportanceBadge importance={question.importance} />
          )}
          <span
            className={cn(
              "hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono border font-medium leading-none",
              sourceConfig.className
            )}
          >
            {sourceConfig.label}
          </span>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bookmark */}
          <button
            onClick={handleBookmarkToggle}
            title={isBookmarked ? "Bookmarked" : "Bookmark this problem"}
            className={cn(
              "p-1.5 rounded-lg border transition-colors",
              isBookmarked
                ? "bg-[#D29922]/10 text-[#D29922] border-[#D29922]/30"
                : "text-[#8B949E] border-[#30363D] hover:bg-[#21262D] hover:text-[#F0F6FC]"
            )}
          >
            <Bookmark
              className={cn("w-3.5 h-3.5", isBookmarked && "fill-[#D29922] text-[#D29922]")}
            />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset code to starter template"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] font-mono text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Run Query Button */}
          <button
            onClick={() => handleExecuteSql("run")}
            disabled={isRunning || isSubmitting}
            title="Execute query (Ctrl + Enter)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-[#3FB950] text-[#3FB950]" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={() => handleExecuteSql("submit")}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2EA043] text-white font-mono text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Validating..." : "Submit"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2-COLUMN LEETCODE WORKSPACE LAYOUT                           */}
      {/* LEFT (45%): Problem Statement, Schema, Explanation, Hints     */}
      {/* RIGHT (55%): Monaco SQL Editor & Interactive Test Console     */}
      {/* ============================================================ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#30363D] overflow-hidden">
        {/* ========================================================== */}
        {/* LEFT COLUMN: Problem Details, Schema, Example & Solution   */}
        {/* ========================================================== */}
        <section className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-[#0D1117]">
          {/* Top Tabs */}
          <div className="flex items-center border-b border-[#30363D] px-3 bg-[#161B22] text-xs font-mono shrink-0">
            <button
              onClick={() => setActiveLeftTab("problem")}
              className={cn(
                "py-2.5 px-3.5 border-b-2 font-medium transition-colors",
                activeLeftTab === "problem"
                  ? "border-[#58A6FF] text-[#F0F6FC]"
                  : "border-transparent text-[#8B949E] hover:text-[#F0F6FC]"
              )}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab("hints")}
              className={cn(
                "py-2.5 px-3.5 border-b-2 font-medium transition-colors flex items-center gap-1.5",
                activeLeftTab === "hints"
                  ? "border-[#58A6FF] text-[#F0F6FC]"
                  : "border-transparent text-[#8B949E] hover:text-[#F0F6FC]"
              )}
            >
              <span>Editorial & Hints</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                Step-by-step
              </span>
            </button>
            <button
              onClick={() => setActiveLeftTab("schema")}
              className={cn(
                "py-2.5 px-3.5 border-b-2 font-medium transition-colors flex items-center gap-1.5",
                activeLeftTab === "schema"
                  ? "border-[#58A6FF] text-[#F0F6FC]"
                  : "border-transparent text-[#8B949E] hover:text-[#F0F6FC]"
              )}
            >
              <Layers className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>Schema ({schemaMetadata.length})</span>
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-[#F0F6FC] text-xs leading-relaxed select-text">
            {activeLeftTab === "problem" && (
              <div className="space-y-6">
                {/* Title & Metadata */}
                <div className="space-y-2 border-b border-[#30363D] pb-4">
                  <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight">
                    {question.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono pt-1">
                    <DifficultyBadge difficulty={question.difficulty} />
                    {evidence.isMustDo && <MustDoBadge />}
                    {evidence.isRepeatedPattern && (
                      <RepeatedPatternBadge
                        sources={evidence.corroboratedSources}
                        frequency={question.frequency}
                      />
                    )}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-mono border font-medium",
                        sourceConfig.className
                      )}
                    >
                      {sourceConfig.label}
                    </span>
                  </div>
                </div>

                {/* Evidence Intelligence */}
                <WhyImportantCard question={question} />

                {/* Table Schema Specifications (LeetCode Style) */}
                <div className="space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] font-mono flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span>Database Schema</span>
                  </h2>

                  {schemaMetadata.map((table) => (
                    <div
                      key={table.tableName}
                      className="rounded-lg border border-[#30363D] bg-[#161B22] p-3 space-y-2 font-mono"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[#F0F6FC]">
                        <span className="text-[#58A6FF]">Table: {table.tableName}</span>
                        <span className="text-[10px] text-[#8B949E]">
                          {table.totalRows} row(s)
                        </span>
                      </div>

                      <div className="rounded border border-[#30363D] overflow-x-auto bg-[#0D1117]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#161B22] border-b border-[#30363D] text-[10px] text-[#8B949E] uppercase">
                              <th className="px-3 py-1.5 border-r border-[#30363D]">Column Name</th>
                              <th className="px-3 py-1.5 border-r border-[#30363D]">Type</th>
                              <th className="px-3 py-1.5">Constraints</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#21262D]">
                            {table.columns.map((col) => (
                              <tr key={col.name} className="hover:bg-[#161B22]/50">
                                <td className="px-3 py-1 text-[#F0F6FC] font-semibold border-r border-[#30363D]">
                                  {col.name}
                                </td>
                                <td className="px-3 py-1 text-[#8B949E] border-r border-[#30363D]">
                                  {col.type}
                                </td>
                                <td className="px-3 py-1 text-[#D29922]">
                                  {col.isPrimaryKey ? "PRIMARY KEY" : col.notNull ? "NOT NULL" : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Problem Statement */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] font-mono">
                    Problem Description
                  </h2>
                  <div className="whitespace-pre-line text-[#F0F6FC] text-sm leading-relaxed font-sans bg-[#161B22] border border-[#30363D] p-3.5 rounded-lg">
                    {question.description}
                  </div>
                </div>

                {/* Example Demonstration with Input & Expected Output (LeetCode Style) */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] font-mono">
                    Example 1
                  </h2>

                  <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-4 space-y-4 font-mono text-xs">
                    {/* Input Tables */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">
                        Input:
                      </div>
                      {schemaMetadata.map((tbl) => (
                        <div key={tbl.tableName} className="space-y-1.5 pl-2">
                          <div className="text-[11px] text-[#58A6FF] font-semibold">
                            {tbl.tableName} table:
                          </div>
                          <div className="rounded border border-[#30363D] overflow-x-auto bg-[#0D1117]">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-[#161B22] border-b border-[#30363D] text-[10px] text-[#8B949E]">
                                  {tbl.columns.map((col) => (
                                    <th key={col.name} className="px-2.5 py-1 border-r border-[#30363D] last:border-0">
                                      {col.name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#21262D]">
                                {tbl.sampleRows.slice(0, 5).map((r, rIdx) => (
                                  <tr key={rIdx}>
                                    {tbl.columns.map((c) => (
                                      <td key={c.name} className="px-2.5 py-1 text-[#C9D1D9] border-r border-[#21262D] last:border-0">
                                        {r[c.name] !== null ? String(r[c.name]) : "null"}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expected Output */}
                    {expectedRows.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#30363D]">
                        <div className="text-[11px] font-bold text-[#3FB950] uppercase tracking-wider">
                          Output:
                        </div>
                        <div className="pl-2">
                          <div className="rounded border border-[#30363D] overflow-x-auto bg-[#0D1117]">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-[#161B22] border-b border-[#30363D] text-[10px] text-[#3FB950] font-bold">
                                  {expectedColumns.map((col) => (
                                    <th key={col} className="px-2.5 py-1 border-r border-[#30363D] last:border-0">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#21262D]">
                                {expectedRows.map((r, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-[#161B22]/40">
                                    {expectedColumns.map((c) => (
                                      <td key={c} className="px-2.5 py-1 text-[#3FB950] font-semibold border-r border-[#21262D] last:border-0">
                                        {r[c] !== null ? String(r[c]) : "null"}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step by Step Explanation */}
                    <div className="space-y-1.5 pt-2 border-t border-[#30363D]">
                      <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">
                        Explanation:
                      </div>
                      <p className="text-[#C9D1D9] font-sans leading-relaxed text-xs">
                        {question.explanation || question.approach ? (
                          <span>
                            Evaluate each record based on query filter criteria, groupings, and aggregate constraints.
                            Rows satisfying all evaluation rules are included in the result set.
                          </span>
                        ) : (
                          <span>
                            The query inspects the dataset according to the problem constraints and returns the matching rows shown above.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Constraints */}
                {question.constraints && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] font-mono">
                      Constraints
                    </h3>
                    <pre className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] text-[11px] text-[#C9D1D9] font-mono whitespace-pre-wrap leading-relaxed">
                      {question.constraints}
                    </pre>
                  </div>
                )}

                {/* Progressive Hint & Solution Toggle */}
                <div className="pt-2">
                  <ProgressiveHintSolution
                    hints={question.hints || []}
                    approach={question.approach || question.explanation}
                    sqlSolution={question.sqlSolution || question.sqlExpectedQuery}
                    commonMistakes={question.commonMistakes}
                    questionType="SQL"
                    onApplyCode={(code) => setQuery(code)}
                  />
                </div>
              </div>
            )}

            {activeLeftTab === "hints" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-[#30363D]">
                  <h2 className="text-base font-bold text-[#F0F6FC] font-mono">
                    Step-by-Step Technical Editorial
                  </h2>
                  <p className="text-xs text-[#8B949E] mt-1 font-sans">
                    Read the progressive hints sequentially to solve the problem independently before revealing the reference SQL query.
                  </p>
                </div>
                <ProgressiveHintSolution
                  hints={question.hints || []}
                  approach={question.approach || question.explanation}
                  sqlSolution={question.sqlSolution || question.sqlExpectedQuery}
                  commonMistakes={question.commonMistakes}
                  questionType="SQL"
                  onApplyCode={(code) => setQuery(code)}
                />
              </div>
            )}

            {activeLeftTab === "schema" && (
              <div className="space-y-4 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
                  <h3 className="text-sm font-bold text-[#F0F6FC]">
                    Interactive Database Tables
                  </h3>
                  <span className="text-xs text-[#8B949E]">
                    {schemaMetadata.length} table(s) registered
                  </span>
                </div>

                {schemaMetadata.map((table) => (
                  <div
                    key={table.tableName}
                    className="rounded-lg border border-[#30363D] bg-[#161B22] overflow-hidden space-y-3 p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-[#58A6FF]" />
                        <span className="font-bold text-[#F0F6FC]">{table.tableName}</span>
                      </div>
                      <span className="text-[10px] text-[#8B949E]">
                        Total: {table.totalRows} row(s)
                      </span>
                    </div>

                    {/* Columns */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#8B949E] uppercase font-bold">Columns:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {table.columns.map((c) => (
                          <span
                            key={c.name}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[11px]"
                          >
                            <span className="text-[#F0F6FC]">{c.name}</span>
                            <span className="text-[#8B949E] text-[10px]">{c.type}</span>
                            {c.isPrimaryKey && (
                              <span className="text-[9px] px-1 bg-[#D29922]/20 text-[#D29922] rounded font-bold">
                                PK
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sample Table Data */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#8B949E] uppercase font-bold">Data Preview:</div>
                      <div className="rounded border border-[#30363D] overflow-x-auto bg-[#0D1117]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#161B22] border-b border-[#30363D] text-[10px] text-[#8B949E]">
                              {table.columns.map((col) => (
                                <th key={col.name} className="px-3 py-1.5 border-r border-[#30363D] last:border-0">
                                  {col.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#21262D]">
                            {table.sampleRows.map((r, rIdx) => (
                              <tr key={rIdx} className="hover:bg-[#161B22]/50">
                                {table.columns.map((c) => (
                                  <td key={c.name} className="px-3 py-1 text-[#C9D1D9] border-r border-[#21262D] last:border-0">
                                    {r[c.name] !== null ? String(r[c.name]) : "null"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: Monaco SQL Editor & LeetCode Test Console   */}
        {/* ========================================================== */}
        <section className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-[#0D1117]">
          {/* Top: Editor Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363D] bg-[#161B22] text-xs font-mono shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#58A6FF]" />
              <span className="font-semibold text-[#F0F6FC]">SQL (SQLite Engine)</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Format Button */}
              <button
                onClick={handleFormat}
                title="Format SQL query keywords"
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors text-[11px]"
              >
                <AlignLeft className="w-3 h-3 text-[#58A6FF]" />
                <span>Format</span>
              </button>

              {/* Explain Plan Button */}
              <button
                onClick={() => handleExecuteSql("explain")}
                disabled={isRunning || isSubmitting}
                title="Explain query plan"
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors text-[11px] disabled:opacity-50"
              >
                <BrainCircuit className="w-3 h-3 text-[#D29922]" />
                <span>Explain</span>
              </button>

              <div className="h-3 w-[1px] bg-[#30363D]" />

              {/* Font Size Selector */}
              <div className="flex items-center gap-1 text-[#8B949E]">
                <button
                  onClick={() => setFontSize((f) => Math.max(f - 1, 11))}
                  title="Decrease font size"
                  className="p-1 rounded hover:bg-[#21262D] hover:text-[#F0F6FC] transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono w-6 text-center">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((f) => Math.min(f + 1, 20))}
                  title="Increase font size"
                  className="p-1 rounded hover:bg-[#21262D] hover:text-[#F0F6FC] transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Monaco SQL Editor */}
          <div className="flex-1 relative overflow-hidden min-h-[220px]">
            <MonacoCodeEditor
              language="sql"
              code={query}
              onChange={setQuery}
              fontSize={fontSize}
              onRun={() => handleExecuteSql("run")}
              onSubmit={() => handleExecuteSql("submit")}
            />
          </div>

          {/* ======================================================== */}
          {/* LEETCODE TESTCASE & RESULTS CONSOLE                      */}
          {/* ======================================================== */}
          <div
            className={cn(
              "border-t border-[#30363D] bg-[#161B22] flex flex-col transition-all duration-200 shrink-0",
              isConsoleCollapsed ? "h-9" : "h-64 sm:h-72"
            )}
          >
            {/* Console Header Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363D] bg-[#161B22] text-xs font-mono shrink-0">
              <div className="flex items-center gap-2">
                {/* Testcase Tab */}
                <button
                  onClick={() => {
                    setIsConsoleCollapsed(false);
                    setActiveConsoleTab("testcase");
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1.5",
                    activeConsoleTab === "testcase"
                      ? "bg-[#21262D] text-[#F0F6FC] border border-[#30363D]"
                      : "text-[#8B949E] hover:text-[#F0F6FC]"
                  )}
                >
                  <TableIcon className="w-3.5 h-3.5 text-[#58A6FF]" />
                  <span>Testcase</span>
                </button>

                {/* Test Result Tab */}
                <button
                  onClick={() => {
                    setIsConsoleCollapsed(false);
                    setActiveConsoleTab("result");
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1.5",
                    activeConsoleTab === "result"
                      ? "bg-[#21262D] text-[#F0F6FC] border border-[#30363D]"
                      : "text-[#8B949E] hover:text-[#F0F6FC]"
                  )}
                >
                  <Terminal className="w-3.5 h-3.5 text-[#3FB950]" />
                  <span>Test Result</span>
                  {verdict && (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        verdict === "ACCEPTED"
                          ? "bg-[#3FB950]"
                          : verdict === "WRONG_ANSWER"
                          ? "bg-[#F85149]"
                          : "bg-[#D29922]"
                      )}
                    />
                  )}
                </button>

                {/* Expected Output Tab */}
                {expectedRows.length > 0 && (
                  <button
                    onClick={() => {
                      setIsConsoleCollapsed(false);
                      setActiveConsoleTab("expected");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1.5",
                      activeConsoleTab === "expected"
                        ? "bg-[#21262D] text-[#3FB950] border border-[#30363D]"
                        : "text-[#8B949E] hover:text-[#F0F6FC]"
                    )}
                  >
                    <span>Expected Output</span>
                  </button>
                )}

                {/* Explain Plan Tab */}
                {explainPlan.length > 0 && (
                  <button
                    onClick={() => {
                      setIsConsoleCollapsed(false);
                      setActiveConsoleTab("explain");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1.5",
                      activeConsoleTab === "explain"
                        ? "bg-[#21262D] text-[#D29922] border border-[#30363D]"
                        : "text-[#8B949E] hover:text-[#F0F6FC]"
                    )}
                  >
                    <span>Explain Plan</span>
                  </button>
                )}
              </div>

              {/* Console Toggle */}
              <div className="flex items-center gap-2">
                {executionTimeMs !== null && (
                  <span className="text-[11px] text-[#8B949E] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-[#8B949E]" />
                    <span>{executionTimeMs} ms</span>
                  </span>
                )}
                <button
                  onClick={() => setIsConsoleCollapsed((prev) => !prev)}
                  title={isConsoleCollapsed ? "Expand console" : "Collapse console"}
                  className="p-1 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
                >
                  {isConsoleCollapsed ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Console Body */}
            {!isConsoleCollapsed && (
              <div className="flex-1 overflow-y-auto p-3.5 text-xs font-mono select-text bg-[#0D1117]">
                {/* 1. TESTCASE TAB: Shows input tables and rows */}
                {activeConsoleTab === "testcase" && (
                  <div className="space-y-3 h-full flex flex-col">
                    {/* Table Selectors */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
                      {schemaMetadata.map((table, idx) => (
                        <button
                          key={table.tableName}
                          onClick={() => setActiveTestcaseTableIdx(idx)}
                          className={cn(
                            "px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 border",
                            activeTestcaseTableIdx === idx
                              ? "bg-[#21262D] text-[#58A6FF] border-[#58A6FF]/40"
                              : "bg-[#161B22] text-[#8B949E] border-[#30363D] hover:text-[#F0F6FC]"
                          )}
                        >
                          <TableIcon className="w-3 h-3 text-[#58A6FF]" />
                          <span>{table.tableName}</span>
                          <span className="text-[10px] text-[#8B949E]">
                            ({table.sampleRows.length})
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Active Table Data Grid */}
                    {activeTestTable && (
                      <div className="flex-1 overflow-auto rounded-lg border border-[#30363D] bg-[#161B22]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#21262D] border-b border-[#30363D] text-[11px] text-[#8B949E] uppercase font-bold sticky top-0">
                              {activeTestTable.columns.map((col) => (
                                <th key={col.name} className="px-3 py-2 border-r border-[#30363D] last:border-0">
                                  {col.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#30363D]/60">
                            {activeTestTable.sampleRows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-[#21262D]/40">
                                {activeTestTable.columns.map((col) => (
                                  <td
                                    key={col.name}
                                    className="px-3 py-1.5 text-[#C9D1D9] border-r border-[#30363D]/40 last:border-0"
                                  >
                                    {row[col.name] !== null ? String(row[col.name]) : "null"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TEST RESULT TAB: Query evaluation output */}
                {activeConsoleTab === "result" && (
                  <div className="space-y-4">
                    {errorMessage ? (
                      /* Error Message */
                      <div className="p-3.5 rounded-lg bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs uppercase tracking-wider mb-1">
                            {verdict === "SYNTAX_ERROR" ? "Syntax Error" : "Runtime Execution Error"}
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed text-[11px]">
                            {errorMessage}
                          </div>
                        </div>
                      </div>
                    ) : verdict ? (
                      /* Evaluation Verdict */
                      <div className="space-y-3">
                        {/* Status Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {verdict === "ACCEPTED" ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Accepted</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30 font-bold text-xs">
                                <XCircle className="w-4 h-4" />
                                <span>Wrong Answer</span>
                              </div>
                            )}

                            {statusMessage && (
                              <span className="text-xs text-[#8B949E]">{statusMessage}</span>
                            )}
                          </div>

                          <div className="text-[11px] text-[#8B949E] font-mono">
                            Rows returned: {rowCount}
                          </div>
                        </div>

                        {/* Side by side or tabbed output comparison */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* Your Output */}
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-[#F0F6FC] uppercase">
                              Your Output ({resultRows.length} rows):
                            </div>
                            <div className="rounded-lg border border-[#30363D] overflow-x-auto bg-[#161B22] max-h-40">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-[#21262D] border-b border-[#30363D] text-[10px] text-[#8B949E] sticky top-0">
                                    {resultColumns.map((col) => (
                                      <th key={col} className="px-2.5 py-1.5 border-r border-[#30363D] last:border-0">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#30363D]/60">
                                  {resultRows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-[#21262D]/40">
                                      {resultColumns.map((col) => (
                                        <td key={col} className="px-2.5 py-1 text-[#C9D1D9] border-r border-[#30363D]/40 last:border-0">
                                          {row[col] !== null ? String(row[col]) : "null"}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Expected Output */}
                          {expectedRows.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[11px] font-bold text-[#3FB950] uppercase">
                                Expected Output ({expectedRows.length} rows):
                              </div>
                              <div className="rounded-lg border border-[#30363D] overflow-x-auto bg-[#161B22] max-h-40">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-[#21262D] border-b border-[#30363D] text-[10px] text-[#3FB950] font-bold sticky top-0">
                                      {expectedColumns.map((col) => (
                                        <th key={col} className="px-2.5 py-1.5 border-r border-[#30363D] last:border-0">
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#30363D]/60">
                                    {expectedRows.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-[#21262D]/40">
                                        {expectedColumns.map((col) => (
                                          <td key={col} className="px-2.5 py-1 text-[#3FB950] border-r border-[#30363D]/40 last:border-0">
                                            {row[col] !== null ? String(row[col]) : "null"}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Idle state */
                      <div className="flex flex-col items-center justify-center h-44 text-[#8B949E] space-y-2">
                        <Terminal className="w-8 h-8 text-[#58A6FF]/60 stroke-1" />
                        <span className="text-xs">
                          Click <span className="text-[#3FB950] font-bold">Run</span> (Ctrl+Enter) or{" "}
                          <span className="text-[#58A6FF] font-bold">Submit</span> to execute your SQL query.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. EXPECTED OUTPUT TAB */}
                {activeConsoleTab === "expected" && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-[#3FB950] uppercase">
                      Target Reference Result Set ({expectedRows.length} rows):
                    </div>
                    <div className="rounded-lg border border-[#30363D] overflow-x-auto bg-[#161B22]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#21262D] border-b border-[#30363D] text-[10px] text-[#3FB950] font-bold">
                            {expectedColumns.map((col) => (
                              <th key={col} className="px-3 py-2 border-r border-[#30363D] last:border-0">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363D]/60">
                          {expectedRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#21262D]/40">
                              {expectedColumns.map((col) => (
                                <td key={col} className="px-3 py-1.5 text-[#3FB950] border-r border-[#30363D]/40 last:border-0">
                                  {row[col] !== null ? String(row[col]) : "null"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. EXPLAIN PLAN TAB */}
                {activeConsoleTab === "explain" && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-[#D29922] uppercase">
                      SQLite Execution Plan
                    </div>
                    <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3 space-y-1 font-mono text-xs">
                      {explainPlan.length > 0 ? (
                        explainPlan.map((step, idx) => (
                          <div key={idx} className="text-[#C9D1D9] flex items-center gap-2">
                            <span className="text-[#8B949E]">[{idx + 1}]</span>
                            <span>{step}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[#8B949E]">
                          No query plan available. Click "Explain" in the editor toolbar.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
