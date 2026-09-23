"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DifficultyBadge,
  ImportanceBadge,
  SourceBadge,
  MustDoBadge,
  RepeatedPatternBadge,
} from "@/components/ui/Badge";
import { generateStarterCode } from "@/lib/codeTemplates";
import { analyzeQuestionEvidence } from "@/lib/importance";
import { WhyImportantCard } from "@/components/questions/WhyImportantCard";
import { ProgressiveHintSolution } from "@/components/questions/ProgressiveHintSolution";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Bookmark,
  ChevronLeft,
  Terminal,
  FileCheck2,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Code2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoCodeEditor = dynamic(
  () =>
    import("@/components/editor/MonacoCodeEditor").then(
      (mod) => mod.MonacoCodeEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-xs font-mono text-zinc-500 bg-[#1e1e1e]">
        Loading Monaco Code Editor...
      </div>
    ),
  }
);

interface ProblemWorkspaceProps {
  question: any;
}

export function ProblemWorkspace({ question }: ProblemWorkspaceProps) {
  // Panel Selection in Bottom-Right: "testcase" | "result"
  const [activeBottomTab, setActiveBottomTab] = useState<"testcase" | "result">("testcase");
  
  // Selected Test Case Index: number | "custom"
  const [activeTestCaseTab, setActiveTestCaseTab] = useState<number | "custom">(0);
  const [customInputText, setCustomInputText] = useState("9\n-2 1 -3 4 -1 2 1 -5 4");
  const [customExpectedText, setCustomExpectedText] = useState("6");
  
  // Resizing and Collapsible states: "collapsed" | "normal" | "maximized"
  const [testcasePanelMode, setTestcasePanelMode] = useState<"collapsed" | "normal" | "maximized">("normal");
  const [isConsoleDrawerOpen, setIsConsoleDrawerOpen] = useState(false);

  // Language & Editor Configuration
  const defaultLang = question.questionType === "SQL" ? "sql" : "java";
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLang);
  const [fontSize, setFontSize] = useState<number>(14);

  // Starter code initialized via code template generator
  const [code, setCode] = useState<string>(() =>
    generateStarterCode(question, defaultLang)
  );

  // Maintain fresh reference to code to eliminate stale closures on keybindings
  const codeRef = useRef<string>(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Test Cases & Execution State
  const [testCases] = useState<any[]>(question.testCases || []);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  // Provenance & Bookmarking State
  const [isBookmarked, setIsBookmarked] = useState(question.isBookmarked || false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Language switcher handler
  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    const newStarter = generateStarterCode(question, newLang);
    setCode(newStarter);
    codeRef.current = newStarter;
    setExecutionResult(null);
    setActiveBottomTab("testcase");
  };

  // Reset code handler
  const handleResetCode = () => {
    const freshStarter = generateStarterCode(question, selectedLanguage);
    setCode(freshStarter);
    codeRef.current = freshStarter;
    setExecutionResult(null);
    setActiveBottomTab("testcase");
  };

  // Bookmark toggle
  const handleBookmarkToggle = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id }),
      });
      const data = await res.json();
      if (!data.success) {
        setIsBookmarked(!nextState);
      }
    } catch {
      setIsBookmarked(!nextState);
    }
  };

  // RUN: Executes ONLY the currently selected testcase using CURRENT editor content
  const handleRunCode = useCallback(async () => {
    if (isRunning || isSubmitting) return;

    const currentCode = codeRef.current ?? "";

    // Immediate validation: Empty code must NEVER pass
    if (!currentCode || currentCode.trim().length === 0) {
      const errorMsg = selectedLanguage === "sql" ? "SQL query cannot be empty." : "Code cannot be empty.";
      setExecutionResult({
        isTestRun: true,
        verdict: "INVALID_CODE",
        status: "INVALID_CODE",
        runtimeMs: 0,
        memoryKb: 0,
        passedCases: 0,
        totalCases: 1,
        testResults: [],
        error: errorMsg,
      });
      setActiveBottomTab("result");
      if (testcasePanelMode === "collapsed") setTestcasePanelMode("normal");
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);
    setActiveBottomTab("result");
    if (testcasePanelMode === "collapsed") setTestcasePanelMode("normal");

    const isCustom = activeTestCaseTab === "custom";

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          language: selectedLanguage,
          sourceCode: currentCode,
          isTestRun: true,
          testCaseIndex: isCustom ? undefined : (typeof activeTestCaseTab === "number" ? activeTestCaseTab : 0),
          customInput: isCustom ? customInputText : undefined,
          customExpectedOutput: isCustom && customExpectedText ? customExpectedText : undefined,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        setExecutionResult({
          isTestRun: true,
          verdict: d.status,
          status: d.status,
          runtimeMs: d.runtimeMs ?? d.runtime ?? 0,
          memoryKb: d.memoryKb ?? d.memory ?? 0,
          passedCases: d.passedCases ?? 0,
          totalCases: d.totalCases ?? 1,
          testResults: d.testResults || [],
          customResult: d.customResult,
          actualOutput: d.actualOutput,
          expectedOutput: d.expectedOutput,
          compileError: d.compileError,
          runtimeError: d.runtimeError,
          error: d.error,
        });
      } else {
        setExecutionResult({
          isTestRun: true,
          verdict: "RUNTIME_ERROR",
          status: "RUNTIME_ERROR",
          runtimeMs: 0,
          memoryKb: 0,
          passedCases: 0,
          totalCases: 1,
          testResults: [],
          error: json.error || "Execution failed.",
        });
      }
    } catch (err: any) {
      setExecutionResult({
        isTestRun: true,
        verdict: "RUNTIME_ERROR",
        status: "RUNTIME_ERROR",
        runtimeMs: 0,
        memoryKb: 0,
        passedCases: 0,
        totalCases: 1,
        testResults: [],
        error: err.message || "Network communication error",
      });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, isSubmitting, activeTestCaseTab, customInputText, customExpectedText, question.id, selectedLanguage]);

  // SUBMIT: Evaluates against ALL test cases (including hidden judge cases)
  const handleSubmit = useCallback(async () => {
    if (isRunning || isSubmitting) return;

    const currentCode = codeRef.current ?? "";

    // Immediate validation: Empty code must NEVER pass
    if (!currentCode || currentCode.trim().length === 0) {
      const errorMsg = selectedLanguage === "sql" ? "SQL query cannot be empty." : "Code cannot be empty.";
      setExecutionResult({
        isTestRun: false,
        verdict: "INVALID_CODE",
        status: "INVALID_CODE",
        runtimeMs: 0,
        memoryKb: 0,
        passedCases: 0,
        totalCases: 1,
        testResults: [],
        error: errorMsg,
      });
      setActiveBottomTab("result");
      if (testcasePanelMode === "collapsed") setTestcasePanelMode("normal");
      return;
    }

    setIsSubmitting(true);
    setExecutionResult(null);
    setActiveBottomTab("result");
    if (testcasePanelMode === "collapsed") setTestcasePanelMode("normal");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          language: selectedLanguage,
          sourceCode: currentCode,
          isTestRun: false,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        setExecutionResult({
          isTestRun: false,
          verdict: d.status,
          status: d.status,
          runtimeMs: d.runtimeMs ?? d.runtime ?? 0,
          memoryKb: d.memoryKb ?? d.memory ?? 0,
          passedCases: d.passedCases ?? 0,
          totalCases: d.totalCases ?? 1,
          testResults: d.testResults || [],
          compileError: d.compileError,
          runtimeError: d.runtimeError,
          error: d.error,
        });
      } else {
        setExecutionResult({
          isTestRun: false,
          verdict: "RUNTIME_ERROR",
          status: "RUNTIME_ERROR",
          runtimeMs: 0,
          memoryKb: 0,
          passedCases: 0,
          totalCases: 1,
          testResults: [],
          error: json.error || "Evaluation failed.",
        });
      }
    } catch (err: any) {
      setExecutionResult({
        isTestRun: false,
        verdict: "RUNTIME_ERROR",
        status: "RUNTIME_ERROR",
        runtimeMs: 0,
        memoryKb: 0,
        passedCases: 0,
        totalCases: 1,
        testResults: [],
        error: err.message || "Network communication error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isRunning, isSubmitting, question.id, selectedLanguage]);

  // Global Keyboard Shortcuts: Ctrl+Enter = Run, Ctrl+Shift+Enter = Submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRunCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleSubmit]);

  const evidence = analyzeQuestionEvidence(question);
  const isRepeated = evidence.isRepeatedPattern;

  // Render Verdict Details
  const renderVerdictBanner = () => {
    if (!executionResult) return null;
    const v = executionResult.verdict || executionResult.status;

    switch (v) {
      case "ACCEPTED":
        return (
          <div className="flex items-center justify-between p-3 rounded-md bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm">
                {executionResult.isTestRun ? "Test Passed" : "Accepted"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{executionResult.runtimeMs} ms</span>
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                <span>{(executionResult.memoryKb / 1024).toFixed(1)} MB</span>
              </span>
            </div>
          </div>
        );
      case "WRONG_ANSWER":
        return (
          <div className="flex items-center justify-between p-3 rounded-md bg-rose-950/40 border border-rose-800/60 text-rose-400">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-sm">Wrong Answer</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {executionResult.passedCases} / {executionResult.totalCases} testcases passed
            </span>
          </div>
        );
      case "COMPILATION_ERROR":
      case "INVALID_CODE":
        return (
          <div className="flex items-center justify-between p-3 rounded-md bg-amber-950/40 border border-amber-800/60 text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm">
                {v === "INVALID_CODE" ? "Invalid Code" : "Compilation Error"}
              </span>
            </div>
          </div>
        );
      case "TIME_LIMIT":
      case "TIME_LIMIT_EXCEEDED":
        return (
          <div className="flex items-center justify-between p-3 rounded-md bg-amber-950/40 border border-amber-800/60 text-amber-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm">Time Limit Exceeded</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Quota: 3000ms</span>
          </div>
        );
      case "RUNTIME_ERROR":
      default:
        return (
          <div className="flex items-center justify-between p-3 rounded-md bg-rose-950/40 border border-rose-800/60 text-rose-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-sm">Runtime Error</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Exit status non-zero</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D1117] text-[#F0F6FC] overflow-hidden font-sans select-none">
      {/* ============================================================ */}
      {/* TOP WORKSPACE TOOLBAR                                        */}
      {/* ============================================================ */}
      <header className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363D] bg-[#161B22] text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Link
            href="/home/accenture?tab=CODING"
            className="flex items-center gap-1 text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Accenture DSA</span>
          </Link>
          <span className="text-[#30363D]">/</span>
          <span className="font-semibold text-[#F0F6FC] truncate max-w-xs sm:max-w-md">
            {question.title}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
          {evidence.isMustDo ? <MustDoBadge /> : <ImportanceBadge importance={question.importance} />}
          <SourceBadge sourceType={question.sourceType} sourceShift={question.shift} />
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bookmark */}
          <button
            onClick={handleBookmarkToggle}
            title={isBookmarked ? "Bookmarked" : "Bookmark this problem"}
            className={cn(
              "p-1.5 rounded border transition-colors",
              isBookmarked
                ? "bg-[#D29922]/10 text-[#D29922] border-[#D29922]/30"
                : "text-[#8B949E] border-[#30363D] hover:bg-[#21262D] hover:text-[#F0F6FC]"
            )}
          >
            <Bookmark
              className={cn("w-3.5 h-3.5", isBookmarked && "fill-[#D29922] text-[#D29922]")}
            />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2-COLUMN LEETCODE WORKSPACE LAYOUT                           */}
      {/* LEFT (45%): Problem Statement, Examples, Hints, Provenance   */}
      {/* RIGHT (55%): Language Selector, Editor, Testcase/Result     */}
      {/* ============================================================ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#30363D] overflow-hidden">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: Problem Details, Hints & Solutions            */}
        {/* ========================================================== */}
        <section className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-[#0D1117]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-[#F0F6FC] text-xs leading-relaxed select-text">
            
            {/* Title & Metadata */}
            <div className="space-y-2 border-b border-[#30363D] pb-3">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {question.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs font-mono pt-1">
                <DifficultyBadge difficulty={question.difficulty} />
                {evidence.isMustDo && <MustDoBadge />}
                {isRepeated && (
                  <RepeatedPatternBadge
                    sources={evidence.corroboratedSources}
                    frequency={question.frequency}
                  />
                )}
                <button
                  onClick={() => setIsSourceModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] text-[11px] font-mono transition-colors"
                >
                  <FileCheck2 className="w-3 h-3 text-[#3FB950]" />
                  <span>Source & Evidence</span>
                </button>
              </div>
            </div>

            {/* Why Important Intelligence */}
            <WhyImportantCard question={question} />

            {/* Problem Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] font-mono">
                Description
              </h2>
              <div className="whitespace-pre-line text-[#F0F6FC] text-sm leading-relaxed font-sans">
                {question.description}
              </div>
            </div>

            {/* Input & Output Format */}
            {question.inputFormat && (
              <div className="space-y-1 p-3 rounded-lg bg-[#161B22] border border-[#30363D]">
                <div className="text-[11px] font-bold uppercase font-mono text-[#58A6FF]">
                  Input Format
                </div>
                <div className="text-xs text-[#F0F6FC] font-mono whitespace-pre-wrap">
                  {question.inputFormat}
                </div>
              </div>
            )}

            {question.outputFormat && (
              <div className="space-y-1 p-3 rounded-lg bg-[#161B22] border border-[#30363D]">
                <div className="text-[11px] font-bold uppercase font-mono text-[#3FB950]">
                  Output Format
                </div>
                <div className="text-xs text-[#F0F6FC] font-mono whitespace-pre-wrap">
                  {question.outputFormat}
                </div>
              </div>
            )}

            {/* Constraints */}
            {question.constraints && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] font-mono">
                  Constraints
                </h3>
                <pre className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] text-[11px] text-[#F0F6FC] font-mono whitespace-pre-wrap leading-relaxed">
                  {question.constraints}
                </pre>
              </div>
            )}

            {/* Examples */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] font-mono">
                Examples
              </h3>
              {question.examples && question.examples.length > 0 ? (
                question.examples.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden font-mono text-xs"
                  >
                    <div className="px-3 py-1.5 bg-[#21262D]/60 border-b border-[#30363D] text-[11px] text-[#8B949E] font-semibold">
                      Example {idx + 1}
                    </div>
                    <div className="p-3 space-y-2">
                      <div>
                        <span className="text-[#8B949E]">Input: </span>
                        <span className="text-[#F0F6FC]">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-[#8B949E]">Output: </span>
                        <span className="text-[#3FB950] font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-[#8B949E]">Explanation: </span>
                          <span className="text-[#8B949E] font-sans">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic text-xs">No sample examples recorded.</div>
              )}
            </div>

            {/* Progressive Hints & Solution System (Hidden by default) */}
            <div className="pt-4 border-t border-[#30363D]">
              <ProgressiveHintSolution
                questionType={question.questionType}
                hints={question.hintsList || question.hints}
                approach={question.approach || question.explanation}
                javaSolution={question.javaSolution || question.solutions?.[0]?.code}
                sqlSolution={question.sqlSolution}
                commonMistakes={question.commonMistakes}
                onApplyCode={(solutionText) => {
                  setCode(solutionText);
                  codeRef.current = solutionText;
                }}
              />
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: Code Editor + LeetCode Testcase/Result Panel */}
        {/* ========================================================== */}
        <section className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-[#0D1117]">
          
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363D] bg-[#161B22] text-xs font-mono shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] font-mono text-xs focus:outline-none focus:border-[#58A6FF]"
              >
                {question.questionType === "SQL" ? (
                  <option value="sql">SQL (SQLite / PostgreSQL)</option>
                ) : (
                  <>
                    <option value="java">Java 21 (OpenJDK)</option>
                    <option value="python">Python 3.12</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="cpp">C++ 20 (GCC)</option>
                  </>
                )}
              </select>

              {/* Reset Code */}
              <button
                onClick={handleResetCode}
                title="Reset to template"
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Right Side: Font Controls + Run & Submit Buttons */}
            <div className="flex items-center gap-3">
              {/* Font Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontSize((f) => Math.max(f - 1, 11))}
                  title="Decrease font size"
                  className="p-1 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-[#8B949E] font-mono px-0.5">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((f) => Math.min(f + 1, 20))}
                  title="Increase font size"
                  className="p-1 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Authoritative Single Run & Submit Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  title="Run code against selected testcase (Ctrl+Enter)"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Play className="w-3 h-3 text-[#3FB950] fill-[#3FB950]" />
                  <span>{isRunning ? "Running..." : "Run"}</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                  title="Submit solution to judge (Ctrl+Shift+Enter)"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-mono text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSubmitting ? "Evaluating..." : "Submit"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor Container (Resizes automatically with bottom panel) */}
          <div className="flex-1 relative overflow-hidden min-h-[220px]">
            <MonacoCodeEditor
              language={selectedLanguage}
              code={code}
              onChange={(val) => {
                setCode(val);
                codeRef.current = val;
              }}
              fontSize={fontSize}
              onRun={handleRunCode}
              onSubmit={handleSubmit}
            />
          </div>

          {/* ======================================================== */}
          {/* LEETCODE-STYLE TESTCASE & TEST RESULT PANEL              */}
          {/* Positioned strictly BELOW editor; NEVER overlaps         */}
          {/* ======================================================== */}
          <div
            className={cn(
              "border-t border-[#30363D] bg-[#0D1117] flex flex-col shrink-0 transition-all duration-150 overflow-hidden",
              testcasePanelMode === "collapsed"
                ? "h-10"
                : testcasePanelMode === "maximized"
                ? "h-[580px] sm:h-[640px]"
                : "h-[400px] sm:h-[440px]"
            )}
          >
            {/* Primary Panel Tabs: Testcase vs Test Result */}
            <div className="flex items-center justify-between border-b border-[#30363D] px-3 bg-[#161B22] text-xs font-mono shrink-0 select-none">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setActiveBottomTab("testcase");
                    if (testcasePanelMode === "collapsed") setTestcasePanelMode("normal");
                  }}
                  className={cn(
                    "py-2 font-semibold transition-colors border-b-2",
                    activeBottomTab === "testcase"
                      ? "border-[#58A6FF] text-[#F0F6FC]"
                      : "border-transparent text-[#8B949E] hover:text-[#F0F6FC]"
                  )}
                >
                  Testcase
                </button>

                <button
                  onClick={() => {
                    setActiveBottomTab("result");
                    if (testcasePanelMode === "collapsed") setTestcasePanelMode("normal");
                  }}
                  className={cn(
                    "py-2 font-semibold transition-colors border-b-2 flex items-center gap-1.5",
                    activeBottomTab === "result"
                      ? "border-[#58A6FF] text-[#F0F6FC]"
                      : "border-transparent text-[#8B949E] hover:text-[#F0F6FC]"
                  )}
                >
                  <span>Test Result</span>
                  {executionResult?.verdict && (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        executionResult.verdict === "ACCEPTED" ? "bg-[#3FB950]" : "bg-[#F85149]"
                      )}
                    />
                  )}
                </button>
              </div>

              {/* Panel Expand / Collapse / Maximize Controls (Placed on the RIGHT SIDE) */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setTestcasePanelMode((m) =>
                      m === "collapsed" ? "normal" : "collapsed"
                    )
                  }
                  title={
                    testcasePanelMode === "collapsed"
                      ? "Expand testcase panel"
                      : "Collapse testcase panel"
                  }
                  className="p-1 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
                >
                  {testcasePanelMode === "collapsed" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() =>
                    setTestcasePanelMode((m) =>
                      m === "maximized" ? "normal" : "maximized"
                    )
                  }
                  title={
                    testcasePanelMode === "maximized"
                      ? "Restore height"
                      : "Maximize testcase panel"
                  }
                  className="p-1 rounded text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
                >
                  {testcasePanelMode === "maximized" ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Panel Body (Rendered when expanded) */}
            {testcasePanelMode !== "collapsed" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* ---------------------------------------------------- */}
                {/* TAB 1: TESTCASE SPECIFICATION                        */}
                {/* ---------------------------------------------------- */}
                {activeBottomTab === "testcase" && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Testcase Sub-tabs: Case 1, Case 2, ... + Custom Input */}
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#0D1117] border-b border-[#30363D] text-xs font-mono overflow-x-auto shrink-0">
                      {testCases.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTestCaseTab(idx)}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium transition-colors shrink-0",
                            activeTestCaseTab === idx
                              ? "bg-[#21262D] text-[#F0F6FC] font-semibold border border-[#30363D]"
                              : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
                          )}
                        >
                          Case {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setActiveTestCaseTab("custom")}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-medium transition-colors shrink-0",
                          activeTestCaseTab === "custom"
                            ? "bg-[#21262D] text-[#F0F6FC] font-semibold border border-[#30363D]"
                            : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
                        )}
                      >
                        + Custom Input
                      </button>
                    </div>

                    {/* Testcase Tab Details */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-mono select-text">
                      {activeTestCaseTab === "custom" ? (
                        /* Custom Input View */
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                              Input:
                            </span>
                            <textarea
                              value={customInputText}
                              onChange={(e) => setCustomInputText(e.target.value)}
                              placeholder="Enter custom stdin input..."
                              rows={3}
                              className="w-full p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#F0F6FC] font-mono text-xs resize-none focus:outline-none focus:border-[#58A6FF]"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                              Expected Output (Optional):
                            </span>
                            <input
                              type="text"
                              value={customExpectedText}
                              onChange={(e) => setCustomExpectedText(e.target.value)}
                              placeholder="Optional reference output for verification..."
                              className="w-full p-2 rounded bg-[#161B22] border border-[#30363D] text-[#F0F6FC] font-mono text-xs focus:outline-none focus:border-[#58A6FF]"
                            />
                          </div>

                          <button
                            onClick={handleRunCode}
                            disabled={isRunning || isSubmitting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-semibold transition-colors"
                          >
                            <Play className="w-3 h-3 text-[#3FB950] fill-[#3FB950]" />
                            <span>{isRunning ? "Running..." : "Run on Custom Input"}</span>
                          </button>
                        </div>
                      ) : (
                        /* Standard Test Case View */
                        testCases[activeTestCaseTab as number] && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                Input:
                              </span>
                              <pre className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#F0F6FC] text-xs font-mono whitespace-pre-wrap">
                                {testCases[activeTestCaseTab as number].input || "(no input)"}
                              </pre>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                Expected Output:
                              </span>
                              <pre className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#3FB950] text-xs font-mono whitespace-pre-wrap font-bold">
                                {testCases[activeTestCaseTab as number].expectedOutput}
                              </pre>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB 2: TEST RESULT (LEETCODE PATTERN)                */}
                {/* ---------------------------------------------------- */}
                {activeBottomTab === "result" && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Pre-Execution State */}
                    {!executionResult ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none text-[#8B949E]">
                        <Code2 className="w-7 h-7 text-[#8B949E]/60 mb-2" />
                        <p className="font-semibold text-xs text-[#C9D1D9]">
                          You must run your code first
                        </p>
                        <p className="text-[11px] text-[#8B949E] mt-0.5">
                          Press "Run" to test against the selected case, or "Submit" for all testcases.
                        </p>
                      </div>
                    ) : (
                      /* Post-Execution State */
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Status Banner */}
                        <div className="px-4 py-2 bg-[#161B22] border-b border-[#30363D] shrink-0">
                          {renderVerdictBanner()}
                        </div>

                        {/* Result Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-mono select-text">
                          {/* Compilation or Runtime Error Display */}
                          {executionResult.error && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-[#F85149] uppercase">
                                {executionResult.verdict === "COMPILATION_ERROR"
                                  ? "Compiler Output:"
                                  : "Error Message:"}
                              </span>
                              <pre className="p-3 rounded bg-[#161B22] border border-[#F85149]/30 text-[#F85149] text-xs font-mono whitespace-pre-wrap leading-relaxed">
                                {executionResult.error}
                              </pre>
                            </div>
                          )}

                          {/* Evaluated Cases Details */}
                          {executionResult.testResults && executionResult.testResults.length > 0 && (
                            <div className="space-y-3">
                              {/* Subtabs for multi-case results */}
                              {executionResult.testResults.length > 1 && (
                                <div className="flex items-center gap-1 pb-2 border-b border-[#30363D]">
                                  {executionResult.testResults.map((tr: any, idx: number) => (
                                    <button
                                      key={idx}
                                      onClick={() => setActiveTestCaseTab(idx)}
                                      className={cn(
                                        "px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors",
                                        activeTestCaseTab === idx
                                          ? "bg-[#21262D] text-white border border-[#30363D]"
                                          : "text-[#8B949E] hover:text-white"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          tr.passed ? "bg-[#3FB950]" : "bg-[#F85149]"
                                        )}
                                      />
                                      <span>Case {idx + 1}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Selected Case Actual vs Expected */}
                              {(() => {
                                const caseIdx = typeof activeTestCaseTab === "number" ? activeTestCaseTab : 0;
                                const tr = executionResult.testResults[caseIdx] || executionResult.testResults[0];
                                if (!tr) return null;

                                return (
                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                        Input:
                                      </span>
                                      <pre className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#F0F6FC] text-xs font-mono whitespace-pre-wrap">
                                        {tr.input || "(no input)"}
                                      </pre>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                        Expected Output:
                                      </span>
                                      <pre className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#3FB950] text-xs font-mono whitespace-pre-wrap font-bold">
                                        {tr.expected || "(empty)"}
                                      </pre>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                        Actual Output:
                                      </span>
                                      <pre
                                        className={cn(
                                          "p-2.5 rounded border text-xs font-mono whitespace-pre-wrap font-bold",
                                          tr.passed
                                            ? "bg-[#161B22] border-[#30363D] text-[#3FB950]"
                                            : "bg-rose-950/20 border-rose-800/40 text-rose-400"
                                        )}
                                      >
                                        {tr.actual || "(no output)"}
                                      </pre>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Custom Result Details */}
                          {executionResult.customResult && (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                  Input:
                                </span>
                                <pre className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#F0F6FC] text-xs font-mono whitespace-pre-wrap">
                                  {executionResult.customResult.input}
                                </pre>
                              </div>

                              {executionResult.customResult.expected && (
                                <div className="space-y-1">
                                  <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                    Expected Output:
                                  </span>
                                  <pre className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#3FB950] text-xs font-mono whitespace-pre-wrap font-bold">
                                    {executionResult.customResult.expected}
                                  </pre>
                                </div>
                              )}

                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                                  Actual Output:
                                </span>
                                <pre className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[#3FB950] text-xs font-mono whitespace-pre-wrap">
                                  {executionResult.customResult.output || "(empty output)"}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Console Drawer Bar */}
            <div className="border-t border-[#30363D] bg-[#161B22] px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-[#8B949E] shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#8B949E]" />
                <span className="font-semibold text-xs text-[#C9D1D9]">Console</span>
                {executionResult?.verdict && (
                  <span className="text-[10px] text-zinc-400">
                    ({executionResult.verdict})
                  </span>
                )}
              </div>

              {/* Right Side Controls: Metrics + Expand/Close Button */}
              <div className="flex items-center gap-3">
                {executionResult && (
                  <div className="flex items-center gap-2.5 text-[10px] text-[#8B949E]">
                    <span>Runtime: {executionResult.runtimeMs}ms</span>
                    <span>Memory: {(executionResult.memoryKb / 1024).toFixed(1)}MB</span>
                  </div>
                )}
                <button
                  onClick={() => setIsConsoleDrawerOpen((prev) => !prev)}
                  title={isConsoleDrawerOpen ? "Close console" : "Expand console"}
                  className="p-1 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors flex items-center gap-1"
                >
                  <span className="text-[11px] font-medium">{isConsoleDrawerOpen ? "Close" : "Expand"}</span>
                  {isConsoleDrawerOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Console Logs Drawer */}
            {isConsoleDrawerOpen && (
              <div className="h-28 bg-[#0D1117] p-3 overflow-y-auto font-mono text-xs text-[#8B949E] space-y-1 border-t border-[#30363D] shrink-0">
                <div className="text-zinc-500 text-[10px]">-- Execution Diagnostics --</div>
                {executionResult ? (
                  <>
                    <div>Language Runtime: {selectedLanguage.toUpperCase()} (Sandbox Isolated)</div>
                    <div>Verdict: {executionResult.verdict}</div>
                    <div>Runtime Elapsed: {executionResult.runtimeMs} ms</div>
                    <div>Memory Consumed: {(executionResult.memoryKb / 1024).toFixed(2)} MB</div>
                    {executionResult.error && (
                      <div className="text-rose-400">Stderr: {executionResult.error}</div>
                    )}
                  </>
                ) : (
                  <div>Ready. Run code to view standard output diagnostics.</div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* SOURCE AUDIT PROVENANCE MODAL                                */}
      {/* ============================================================ */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white font-mono">
                    Official Provenance & Verification Audit
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Archival record for {question.title}
                </p>
              </div>
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs font-mono">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
                <div className="text-[11px] uppercase font-bold text-indigo-400 flex items-center justify-between">
                  <span>Canonical Classification</span>
                  <SourceBadge sourceType={question.sourceType} />
                </div>
                <div className="text-zinc-300">
                  <span className="text-zinc-500">Frequency: </span>
                  <span className="font-bold text-white">{question.frequency || 1} reported occurrence(s)</span>
                </div>
                {question.importanceReason && (
                  <div className="text-zinc-300">
                    <span className="text-zinc-500">Rationale: </span>
                    <span className="text-purple-300">{question.importanceReason}</span>
                  </div>
                )}
              </div>

              {/* Linked Sources */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Linked Archival Documents ({question.sources?.length || 1})
                </h4>
                {question.sources?.map((src: any, idx: number) => (
                  <div
                    key={src.id || idx}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200">
                        {src.sourceDocument || "Archival Source Document"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-emerald-400 text-[10px]">
                        {src.evidenceType || "VERIFIED"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                      <div>
                        <span className="text-zinc-500">Page: </span>
                        <span className="text-zinc-300">{src.page ? `Page ${src.page}` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Shift / Slot: </span>
                        <span className="text-zinc-300">{src.shift || "Official Paper"}</span>
                      </div>
                      {src.notes && (
                        <div className="col-span-2 text-zinc-400 text-[11px]">
                          <span className="text-zinc-500">Notes: </span>
                          {src.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
