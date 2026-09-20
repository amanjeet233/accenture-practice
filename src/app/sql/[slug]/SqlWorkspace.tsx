"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  HelpCircle,
  Code2,
  BrainCircuit,
  Columns,
  Layers,
  Sparkles,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  FileCheck2,
  ChevronDown,
  ChevronUp,
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
      <div className="flex items-center justify-center h-full text-xs font-mono text-zinc-500 bg-[#1e1e1e]">
        Loading Monaco SQL Editor...
      </div>
    ),
  }
);

interface SqlWorkspaceProps {
  question: any;
  schemaMetadata: SqlTableMetadata[];
}

export function SqlWorkspace({ question, schemaMetadata }: SqlWorkspaceProps) {
  const defaultSql =
    question.starterCode?.sql ||
    (question.sqlExpectedQuery
      ? `-- Write your SQL query here\nSELECT `
      : `-- Write your SQL solution here\nSELECT * FROM ...;`);

  const [query, setQuery] = useState<string>(defaultSql);
  const [fontSize, setFontSize] = useState<number>(14);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state
  const [resultColumns, setResultColumns] = useState<string[]>([]);
  const [resultRows, setResultRows] = useState<Record<string, any>[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<"ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Expected output
  const [expectedColumns, setExpectedColumns] = useState<string[]>([]);
  const [expectedRows, setExpectedRows] = useState<Record<string, any>[]>([]);
  const [explainPlan, setExplainPlan] = useState<string[]>([]);

  // Active tabs
  const [activeLeftTab, setActiveLeftTab] = useState<"problem" | "hints" | "editorial">("problem");
  const [activeRightTableIdx, setActiveRightTableIdx] = useState<number>(0);
  const [activeBottomTab, setActiveBottomTab] = useState<"actual" | "expected" | "explain">("actual");
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  // Strict Source Classification mapping:
  // General SQL, Accenture Reported, Company Pattern, Practice
  const getSourceClassification = () => {
    const st = question.sourceType;
    if (st === "GENERAL_INTERVIEW") {
      return {
        label: "General SQL",
        icon: "⚪",
        className: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
        tooltip: "General industry technical interview query",
      };
    }
    if (st === "REPORTED_PYQ" || st === "SHIFT_REPORTED") {
      return {
        label: "Accenture Reported",
        icon: "🟢",
        className: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
        tooltip: "Authentic question reported from Accenture hiring assessments",
      };
    }
    if (st === "COMPANY_PATTERN") {
      return {
        label: "Company Pattern",
        icon: "🔵",
        className: "bg-sky-950/70 text-sky-300 border-sky-700/60",
        tooltip: "Emulates company assessment requirements and patterns",
      };
    }
    return {
      label: "Practice",
      icon: "🟣",
      className: "bg-purple-950/70 text-purple-300 border-purple-700/60",
      tooltip: "General database practice problem",
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
      setIsConsoleOpen(true);

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

        const data = await res.json();

        if (data.success) {
          const payload = data.data;
          setResultColumns(payload.columns || []);
          setResultRows(payload.rows || []);
          setRowCount(payload.rowCount || 0);
          setExecutionTimeMs(payload.executionTimeMs || 1);
          setExpectedColumns(payload.expectedColumns || []);
          setExpectedRows(payload.expectedRows || []);
          setExplainPlan(payload.explainPlan || []);

          if (action === "explain") {
            setActiveBottomTab("explain");
            setStatusMessage("Query execution plan successfully analyzed.");
          } else if (action === "submit") {
            if (payload.isCorrect) {
              setVerdict("ACCEPTED");
              setStatusMessage("Accepted! Query results match expected output.");
            } else {
              setVerdict("WRONG_ANSWER");
              setStatusMessage("Wrong Answer: Query result set does not match expected output.");
            }
            setActiveBottomTab("actual");
          } else {
            // "run"
            setVerdict(payload.isCorrect ? "ACCEPTED" : "WRONG_ANSWER");
            setStatusMessage(`Query executed successfully in ${payload.executionTimeMs} ms.`);
            setActiveBottomTab("actual");
          }
        } else {
          setVerdict("RUNTIME_ERROR");
          setErrorMessage(data.error || "Query execution failed");
          setStatusMessage("Execution Error");
        }
      } catch (err: any) {
        setVerdict("RUNTIME_ERROR");
        setErrorMessage(err.message || "Network communication error");
        setStatusMessage("Network Error");
      } finally {
        setIsRunning(false);
        setIsSubmitting(false);
      }
    },
    [isRunning, isSubmitting, question.id, query]
  );

  // Reset database & query
  const handleReset = () => {
    setQuery(defaultSql);
    setResultColumns([]);
    setResultRows([]);
    setRowCount(0);
    setExecutionTimeMs(null);
    setVerdict(null);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  // Keyboard shortcut: Ctrl + Enter = Run Query
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleExecuteSql("run");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExecuteSql]);

  const activeTable = schemaMetadata[activeRightTableIdx] || null;

  return (
    <div className="flex flex-col h-[calc(100vh-2.75rem)] bg-[#0D1117] text-[#F0F6FC] overflow-hidden font-sans select-none">
      {/* ============================================================ */}
      {/* TOP SQL WORKSPACE TOOLBAR                                    */}
      {/* ============================================================ */}
      <header className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363D] bg-[#161B22] text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Link
            href="/sql"
            className="flex items-center gap-1 text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>SQL</span>
          </Link>
          <span className="text-[#30363D]">/</span>
          <span className="font-semibold text-[#F0F6FC] truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#58A6FF]" />
            {question.title}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
          
          {/* Strict Source Classification Badge */}
          <span
            title={sourceConfig.tooltip}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border font-medium leading-none",
              sourceConfig.className
            )}
          >
            <span>{sourceConfig.label}</span>
          </span>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            title="Reset query and database"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] font-mono text-[11px] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {/* Explain Button */}
          <button
            onClick={() => handleExecuteSql("explain")}
            disabled={isRunning || isSubmitting}
            title="Explain query plan"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] font-mono text-[11px] transition-colors disabled:opacity-50"
          >
            <BrainCircuit className="w-3 h-3 text-[#58A6FF]" />
            <span>Explain</span>
          </button>

          {/* Run Query Button */}
          <button
            onClick={() => handleExecuteSql("run")}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-[#3FB950] text-[#3FB950]" />
            <span>{isRunning ? "Executing..." : "Run"}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={() => handleExecuteSql("submit")}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0D1117] font-mono text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmitting ? "Validating..." : "Submit"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3-COLUMN PLAYGROUND LAYOUT                                   */}
      {/* LEFT (Question) | MIDDLE (SQL Editor) | RIGHT (Schema)       */}
      {/* ============================================================ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 overflow-hidden">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: Question Details, Constraints, Hints          */}
        {/* ========================================================== */}
        <section className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* Left Tabs */}
          <div className="flex items-center border-b border-zinc-800 px-3 bg-zinc-900/50 text-xs font-mono shrink-0">
            <button
              onClick={() => setActiveLeftTab("problem")}
              className={cn(
                "py-2 px-3 border-b-2 font-medium transition-colors",
                activeLeftTab === "problem"
                  ? "border-[#58A6FF] text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab("editorial")}
              className={cn(
                "py-2 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5",
                activeLeftTab === "editorial"
                  ? "border-[#58A6FF] text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Hints & Solution</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Step-by-step
              </span>
            </button>
          </div>

          {/* Left Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-zinc-300 text-xs leading-relaxed select-text">
            {activeLeftTab === "problem" && (
              <div className="space-y-4">
                <div className="space-y-1.5 border-b border-zinc-800/80 pb-3">
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    {question.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                    <DifficultyBadge difficulty={question.difficulty} />
                    {evidence.isMustDo ? <MustDoBadge /> : <ImportanceBadge importance={question.importance} />}
                    <span className={cn("px-2 py-0.5 rounded text-xs font-mono border font-medium", sourceConfig.className)}>
                      {sourceConfig.icon} {sourceConfig.label}
                    </span>
                    {evidence.isRepeatedPattern && (
                      <RepeatedPatternBadge
                        sources={evidence.corroboratedSources}
                        frequency={question.frequency}
                      />
                    )}
                  </div>
                </div>

                {/* Evidence Intelligence: Why this question is important */}
                <WhyImportantCard question={question} />

                {/* Problem Statement */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Task Specification
                  </h2>
                  <div className="whitespace-pre-line text-zinc-200 text-sm leading-relaxed font-sans">
                    {question.description}
                  </div>
                </div>

                {/* Constraints */}
                {question.constraints && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      Constraints & Evaluation
                    </h3>
                    <pre className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {question.constraints}
                    </pre>
                  </div>
                )}

                {/* Examples */}
                {question.examples && question.examples.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      Sample Data Demonstration
                    </h3>
                    {question.examples.map((ex: any, i: number) => (
                      <div key={i} className="p-3 rounded bg-zinc-900/70 border border-zinc-800 font-mono text-xs space-y-1.5">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Input Scenario:</div>
                        <pre className="text-zinc-300 whitespace-pre-wrap">{ex.input}</pre>
                        <div className="text-[10px] text-emerald-400 uppercase font-bold pt-1">Expected Output:</div>
                        <pre className="text-emerald-400 whitespace-pre-wrap">{ex.output}</pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progressive Hint & Solution Section (Hidden by Default) */}
                <div className="pt-4 border-t border-zinc-800/80">
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

            {activeLeftTab === "editorial" && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Step-by-Step Progressive Guidance
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Hints and solutions are hidden by default to preserve independent practice.
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
          </div>
        </section>

        {/* ========================================================== */}
        {/* MIDDLE COLUMN: Monaco SQL Editor                           */}
        {/* ========================================================== */}
        <section className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-[#1e1e1e]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-900/80 text-xs font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>SQL Query Editor</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFontSize((f) => Math.max(f - 1, 11))}
                title="Decrease font size"
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-500 font-mono px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize((f) => Math.min(f + 1, 20))}
                title="Increase font size"
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco SQL Editor Instance */}
          <div className="flex-1 relative overflow-hidden">
            <MonacoCodeEditor
              language="sql"
              code={query}
              onChange={setQuery}
              fontSize={fontSize}
              onRun={() => handleExecuteSql("run")}
              onSubmit={() => handleExecuteSql("submit")}
            />
          </div>
        </section>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: Schema Viewer (Tables, Columns, Sample Data) */}
        {/* ========================================================== */}
        <section className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* Schema Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/80 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>SCHEMA VIEWER</span>
            </div>
            <span className="text-[10px] text-zinc-500">
              {schemaMetadata.length} table(s) registered
            </span>
          </div>

          {/* Tables Selector Bar */}
          <div className="flex items-center border-b border-zinc-800 px-3 bg-zinc-900/40 text-xs font-mono shrink-0 overflow-x-auto scrollbar-thin">
            {schemaMetadata.map((tbl, i) => (
              <button
                key={tbl.tableName}
                onClick={() => setActiveRightTableIdx(i)}
                className={cn(
                  "py-2 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 shrink-0",
                  activeRightTableIdx === i
                    ? "border-amber-500 text-white bg-zinc-900/60"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                )}
              >
                <TableIcon className="w-3 h-3 text-amber-400" />
                <span>{tbl.tableName}</span>
              </button>
            ))}
          </div>

          {/* Table Details & Sample Data */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono select-text">
            {activeTable ? (
              <div className="space-y-4">
                {/* Columns Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase">
                    <span>Columns ({activeTable.columns.length})</span>
                    <span>Total: {activeTable.totalRows} row(s)</span>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/80">
                    {activeTable.columns.map((col) => (
                      <div
                        key={col.name}
                        className="px-3 py-1.5 flex items-center justify-between hover:bg-zinc-800/40"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-200 font-semibold">{col.name}</span>
                          {col.isPrimaryKey && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-700/60 text-[9px] font-bold">
                              PK
                            </span>
                          )}
                        </div>
                        <span className="text-zinc-500 text-[10px] uppercase">
                          {col.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Data Table */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">
                    Sample Data in "{activeTable.tableName}"
                  </span>

                  <div className="rounded-lg border border-zinc-800 overflow-x-auto bg-zinc-900/50">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase font-bold">
                          {activeTable.columns.map((col) => (
                            <th key={col.name} className="px-3 py-2 border-r border-zinc-800 last:border-0">
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {activeTable.sampleRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-zinc-800/30">
                            {activeTable.columns.map((col) => (
                              <td
                                key={col.name}
                                className="px-3 py-1.5 text-zinc-300 font-mono text-[11px] border-r border-zinc-800/60 last:border-0 truncate max-w-[120px]"
                              >
                                {row[col.name] !== null ? String(row[col.name]) : "NULL"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 font-mono text-center p-6">
                No tables defined for this schema.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM CONSOLE & RESULT PANEL                                */}
      {/* ============================================================ */}
      <footer
        className={cn(
          "border-t border-zinc-800 bg-zinc-900/95 transition-all duration-200 flex flex-col shrink-0",
          isConsoleOpen ? "h-52 sm:h-60" : "h-9"
        )}
      >
        {/* Bottom Console Header */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConsoleOpen((prev) => !prev)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              {isConsoleOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span className="font-semibold text-zinc-200">Query Results & Validation</span>
            </button>

            {/* Verdict Badge */}
            {verdict && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-bold border",
                  verdict === "ACCEPTED"
                    ? "text-emerald-400 bg-emerald-950/60 border-emerald-800/60"
                    : "text-rose-400 bg-rose-950/60 border-rose-800/60"
                )}
              >
                {verdict === "ACCEPTED" ? "Accepted" : verdict === "WRONG_ANSWER" ? "Wrong Answer" : "Execution Error"}
              </span>
            )}
          </div>

          {/* Tabs: Actual Output | Expected Output | Execution Plan */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveBottomTab("actual")}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors",
                activeBottomTab === "actual"
                  ? "bg-zinc-800 text-white font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Actual Output ({rowCount})
            </button>

            {expectedRows.length > 0 && (
              <button
                onClick={() => setActiveBottomTab("expected")}
                className={cn(
                  "px-2.5 py-1 rounded text-xs transition-colors",
                  activeBottomTab === "expected"
                    ? "bg-zinc-800 text-emerald-400 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Expected Output ({expectedRows.length})
              </button>
            )}

            {explainPlan.length > 0 && (
              <button
                onClick={() => setActiveBottomTab("explain")}
                className={cn(
                  "px-2.5 py-1 rounded text-xs transition-colors",
                  activeBottomTab === "explain"
                    ? "bg-zinc-800 text-purple-300 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Query Plan (Explain)
              </button>
            )}

            {/* Telemetry metrics */}
            {executionTimeMs !== null && (
              <span className="text-zinc-400 text-[11px] flex items-center gap-1 pl-2 border-l border-zinc-700">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{executionTimeMs} ms</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Console Body */}
        {isConsoleOpen && (
          <div className="flex-1 overflow-y-auto p-3 text-xs font-mono select-text">
            {errorMessage ? (
              <div className="p-3 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="whitespace-pre-wrap leading-relaxed">{errorMessage}</div>
              </div>
            ) : activeBottomTab === "explain" ? (
              /* Explain Query Plan View */
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase text-purple-400">
                  SQLite Query Execution Plan
                </div>
                <div className="p-3 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                  {explainPlan.map((step, idx) => (
                    <div key={idx} className="text-zinc-300 font-mono text-xs flex items-center gap-2">
                      <span className="text-zinc-600">[{idx + 1}]</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeBottomTab === "expected" ? (
              /* Expected Output Table */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-emerald-400">
                    Target Reference Result Set ({expectedRows.length} rows)
                  </span>
                </div>
                <div className="rounded border border-zinc-800 overflow-x-auto bg-zinc-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                        {expectedColumns.map((col) => (
                          <th key={col} className="px-3 py-1.5 border-r border-zinc-800 last:border-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {expectedRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-zinc-900/40">
                          {expectedColumns.map((col) => (
                            <td key={col} className="px-3 py-1 text-emerald-300 border-r border-zinc-800/60 last:border-0">
                              {row[col] !== null ? String(row[col]) : "NULL"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : resultRows.length > 0 ? (
              /* Actual Query Output Table */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-zinc-300">
                    Query Results ({resultRows.length} rows, {resultColumns.length} columns)
                  </span>
                  {statusMessage && (
                    <span className={cn(
                      "text-[11px] font-semibold",
                      verdict === "ACCEPTED" ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {statusMessage}
                    </span>
                  )}
                </div>

                <div className="rounded border border-zinc-800 overflow-x-auto bg-zinc-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                        {resultColumns.map((col) => (
                          <th key={col} className="px-3 py-1.5 border-r border-zinc-800 last:border-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {resultRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-zinc-900/40">
                          {resultColumns.map((col) => (
                            <td key={col} className="px-3 py-1 text-zinc-200 border-r border-zinc-800/60 last:border-0">
                              {row[col] !== null ? String(row[col]) : "NULL"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 flex items-center gap-2 h-full">
                <Database className="w-4 h-4 text-amber-500" />
                <span>Ready. Write a SQL query and click "Run Query" (Ctrl+Enter) or "Submit".</span>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
