"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Timer,
  Send,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Bookmark,
  BookmarkCheck,
  Code2,
  Database,
  Globe,
  RotateCcw,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  Flame,
  AlertCircle,
  Play,
  FileCode,
  Eye,
  Layers,
  HelpCircle,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/Badge";
import { MonacoCodeEditor } from "@/components/editor/MonacoCodeEditor";

type QuestionStatus = "NOT_VISITED" | "VISITED" | "ANSWERED" | "MARKED_FOR_REVIEW";

interface MockQuestion {
  id: string;
  orderIdx: number;
  marks: number;
  question: {
    id: string;
    title: string;
    slug: string;
    description: string;
    inputFormat?: string | null;
    outputFormat?: string | null;
    constraints?: string | null;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionType: "CODING" | "SQL" | "FRONTEND" | "HTML_CSS_JS";
    starterCode?: string | null;
    sqlSchemaSql?: string | null;
    sqlSeedData?: string | null;
    sqlExpectedQuery?: string | null;
    htmlTemplate?: string | null;
    cssTemplate?: string | null;
    jsTemplate?: string | null;
    examplesList?: Array<{
      input: string;
      output: string;
      explanation?: string | null;
    }>;
    questionTopics?: Array<{
      topic: { id: string; name: string; slug: string };
    }>;
    testCasesList?: Array<{
      input: string;
      expectedOutput: string;
    }>;
  };
}

interface MockTestInterfaceProps {
  mockTest: {
    id: string;
    title: string;
    slug: string;
    description: string;
    company: string;
    mockType: "SOURCE_BASED" | "PATTERN_BASED" | string;
    durationMins: number;
    totalMarks: number;
    passingMarks: number;
    questions: any[];
  };
}

interface SubmissionResult {
  attemptId: string;
  mockTestId: string;
  mockTitle: string;
  mockType: "SOURCE_BASED" | "PATTERN_BASED";
  score: number;
  totalMarks: number;
  passingMarks: number;
  isPassed: boolean;
  accuracy: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  codingAccuracy: number;
  sqlAccuracy: number;
  frontendAccuracy: number;
  easyAccuracy: number;
  mediumAccuracy: number;
  hardAccuracy: number;
  topicPerformance: Array<{
    topic: string;
    total: number;
    correct: number;
    accuracy: number;
    isWeak: boolean;
  }>;
  weakTopics: string[];
  solvedQuestions: any[];
  incorrectQuestions: any[];
  unattemptedQuestions: any[];
  allQuestions: any[];
}

export function MockTestInterface({ mockTest }: MockTestInterfaceProps) {
  const questions = mockTest.questions || [];
  const totalDurationSec = mockTest.durationMins * 60;

  // Active question state
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const currentItem = questions[activeIdx];
  const currentQuestion = currentItem?.question;

  // Left-panel tab for Frontend questions: "problem" or "html_preview"
  const [leftTab, setLeftTab] = useState<"problem" | "html_preview">("problem");

  // Filter tab on Result page
  const [resultQuestionFilter, setResultQuestionFilter] = useState<"ALL" | "SOLVED" | "INCORRECT" | "UNATTEMPTED">("ALL");

  // Timers: Total, Countdown Remaining, and Active Question Stopwatch
  const [timeLeftSec, setTimeLeftSec] = useState<number>(totalDurationSec);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<Record<string, number>>({});

  // 4 Navigation Statuses: NOT_VISITED, VISITED, ANSWERED, MARKED_FOR_REVIEW
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>(() => {
    const initial: Record<string, QuestionStatus> = {};
    questions.forEach((q, idx) => {
      initial[q.question.id] = idx === 0 ? "VISITED" : "NOT_VISITED";
    });
    return initial;
  });

  // Code state per question
  const [codes, setCodes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((mq) => {
      const q = mq.question;
      let defaultStarter = "";
      if (q.starterCode) {
        try {
          const parsed = JSON.parse(q.starterCode);
          defaultStarter = parsed.java || parsed.javascript || parsed.python || parsed.sql || "";
        } catch {
          defaultStarter = q.starterCode;
        }
      }
      if (!defaultStarter) {
        if (q.questionType === "SQL") {
          defaultStarter = "-- Write your SQL query here\nSELECT ";
        } else if (q.questionType === "HTML_CSS_JS" || q.questionType === "FRONTEND") {
          defaultStarter = q.jsTemplate || "// Write your JavaScript DOM logic here\n";
        } else {
          defaultStarter = `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Write your solution here
    }
}
`;
        }
      }
      initial[q.id] = defaultStarter;
    });
    return initial;
  });

  // Language state per question: Java 21 default for coding
  const [languages, setLanguages] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((mq) => {
      const q = mq.question;
      if (q.questionType === "SQL") {
        initial[q.id] = "sql";
      } else if (q.questionType === "HTML_CSS_JS" || q.questionType === "FRONTEND") {
        initial[q.id] = "javascript";
      } else {
        initial[q.id] = "java";
      }
    });
    return initial;
  });

  // Submission & evaluation states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Quick Test Run Output State
  const [isTestingCode, setIsTestingCode] = useState<boolean>(false);
  const [testRunOutput, setTestRunOutput] = useState<{
    verdict: string;
    message?: string;
    passed?: number;
    total?: number;
    sampleResults?: any[];
  } | null>(null);

  // Modal alert dialog for milestone warnings (10m, 5m, 1m)
  const [milestoneModal, setMilestoneModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    level: "WARNING" | "CRITICAL";
  } | null>(null);

  const warnedTenMinRef = useRef(false);
  const warnedFiveMinRef = useRef(false);
  const warnedOneMinRef = useRef(false);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Main countdown timer & Question-specific stopwatch
  useEffect(() => {
    if (timeLeftSec <= 0 || submissionResult || isSubmitting) return;

    const interval = setInterval(() => {
      // 1. Decrement overall time left
      setTimeLeftSec((prev) => {
        const nextTime = prev - 1;

        // Check milestones
        if (nextTime === 600 && !warnedTenMinRef.current) {
          warnedTenMinRef.current = true;
          setMilestoneModal({
            show: true,
            title: "⏱️ 10 Minutes Remaining",
            message: "You have 10 minutes left. Please review your marked questions and verify your written solutions.",
            level: "WARNING",
          });
        } else if (nextTime === 300 && !warnedFiveMinRef.current) {
          warnedFiveMinRef.current = true;
          setMilestoneModal({
            show: true,
            title: "⚠️ 5 Minutes Remaining",
            message: "5 minutes remaining. Finalize your answers now. Unsaved changes will be submitted automatically at 00:00.",
            level: "WARNING",
          });
        } else if (nextTime === 60 && !warnedOneMinRef.current) {
          warnedOneMinRef.current = true;
          setMilestoneModal({
            show: true,
            title: "🚨 1 Minute Remaining",
            message: "Final minute! The system will auto-submit when the countdown reaches 00:00.",
            level: "CRITICAL",
          });
        }

        if (nextTime <= 0) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return nextTime;
      });

      // 2. Increment stopwatch for current active question
      if (currentQuestion) {
        setTimeSpentPerQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeftSec, currentQuestion, submissionResult, isSubmitting]);

  // Navigate to Question & update status from NOT_VISITED to VISITED
  const navigateToQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const targetQ = questions[targetIdx].question;

    setQuestionStatuses((prev) => {
      const currentStatus = prev[targetQ.id];
      if (currentStatus === "NOT_VISITED") {
        return { ...prev, [targetQ.id]: "VISITED" };
      }
      return prev;
    });

    setActiveIdx(targetIdx);
    setTestRunOutput(null);
    setLeftTab("problem");
  };

  // Handle code change
  const handleCodeChange = (newCode: string) => {
    if (!currentQuestion) return;
    setCodes((prev) => ({ ...prev, [currentQuestion.id]: newCode }));

    // Transition to ANSWERED if user typed content (preserve MARKED_FOR_REVIEW)
    setQuestionStatuses((prev) => {
      const current = prev[currentQuestion.id];
      if (current === "MARKED_FOR_REVIEW") return prev;
      const hasContent = newCode.trim().length > 0;
      return {
        ...prev,
        [currentQuestion.id]: hasContent ? "ANSWERED" : "VISITED",
      };
    });
  };

  // Toggle "Mark for Review"
  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    setQuestionStatuses((prev) => {
      const current = prev[currentQuestion.id];
      const hasContent = (codes[currentQuestion.id] || "").trim().length > 0;
      if (current === "MARKED_FOR_REVIEW") {
        return {
          ...prev,
          [currentQuestion.id]: hasContent ? "ANSWERED" : "VISITED",
        };
      } else {
        return {
          ...prev,
          [currentQuestion.id]: "MARKED_FOR_REVIEW",
        };
      }
    });
  };

  // Reset code to original question template
  const resetCode = () => {
    if (!currentQuestion) return;
    let defaultStarter = "";
    if (currentQuestion.starterCode) {
      try {
        const parsed = JSON.parse(currentQuestion.starterCode);
        defaultStarter = parsed.javascript || parsed.js || parsed.python || parsed.sql || "";
      } catch {
        defaultStarter = currentQuestion.starterCode;
      }
    }
    if (!defaultStarter) {
      if (currentQuestion.questionType === "SQL") {
        defaultStarter = "-- Write your SQL query here\nSELECT ";
      } else if (currentQuestion.questionType === "HTML_CSS_JS" || currentQuestion.questionType === "FRONTEND") {
        defaultStarter = currentQuestion.jsTemplate || "// Write your JavaScript DOM logic here\n";
      } else {
        defaultStarter = "// Write your solution here\nfunction solution() {\n  \n}\n";
      }
    }
    setCodes((prev) => ({ ...prev, [currentQuestion.id]: defaultStarter }));
  };

  // Run Test / Sanity Check on Current Code
  const handleTestRun = async () => {
    if (!currentQuestion) return;
    setIsTestingCode(true);
    setTestRunOutput(null);

    const userCode = codes[currentQuestion.id] || "";
    const lang = languages[currentQuestion.id] || "javascript";

    try {
      if (currentQuestion.questionType === "SQL") {
        const res = await fetch("/api/sql/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: userCode,
            schemaSql: currentQuestion.sqlSchemaSql,
            seedSql: currentQuestion.sqlSeedData,
            expectedQuery: currentQuestion.sqlExpectedQuery,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setTestRunOutput({
            verdict: data.data.isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
            message: data.data.isCorrect ? "Query returned matching result set!" : "Row output difference detected.",
            sampleResults: data.data.rows,
          });
        } else {
          setTestRunOutput({
            verdict: "ERROR",
            message: data.error?.message || "SQL syntax or execution error.",
          });
        }
      } else if (currentQuestion.questionType === "HTML_CSS_JS" || currentQuestion.questionType === "FRONTEND") {
        // Quick frontend sanity check
        const hasListeners = userCode.includes("addEventListener") || userCode.includes("onclick") || userCode.includes("function");
        setTestRunOutput({
          verdict: hasListeners ? "READY_TO_SUBMIT" : "NOTICE",
          message: hasListeners
            ? "Frontend script contains event listeners / DOM logic. Ready for final evaluation."
            : "No DOM listener or event handler detected. Verify your querySelector/getElementById logic.",
        });
      } else {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            language: lang,
            sourceCode: userCode,
            isTestRun: true,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setTestRunOutput({
            verdict: data.data.status,
            passed: data.data.passedTestCases,
            total: data.data.totalTestCases,
            message: data.data.errorMessage || `${data.data.passedTestCases}/${data.data.totalTestCases} Sample Cases Passed`,
          });
        } else {
          setTestRunOutput({
            verdict: "ERROR",
            message: data.error?.message || "Execution error.",
          });
        }
      }
    } catch (err: any) {
      setTestRunOutput({
        verdict: "ERROR",
        message: err.message || "Failed to execute test run.",
      });
    } finally {
      setIsTestingCode(false);
    }
  };

  // Perform Final Submit
  const executeSubmission = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const durationSeconds = totalDurationSec - timeLeftSec;

    const answersPayload: Record<
      string,
      { code: string; language: string; status: QuestionStatus; timeSpentSec: number }
    > = {};

    questions.forEach((mq) => {
      const q = mq.question;
      answersPayload[q.id] = {
        code: codes[q.id] || "",
        language: languages[q.id] || (q.questionType === "SQL" ? "sql" : "javascript"),
        status: questionStatuses[q.id] || "NOT_VISITED",
        timeSpentSec: timeSpentPerQuestion[q.id] || 0,
      };
    });

    try {
      const res = await fetch(`/api/mock-tests/${mockTest.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationSeconds,
          answers: answersPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Evaluation failed on backend");
      }

      setSubmissionResult(json.data);
      setShowSubmitConfirm(false);
      setMilestoneModal(null);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    executeSubmission();
  };

  // Palette status tallies
  const statusCounts = useMemo(() => {
    let notVisited = 0;
    let visited = 0;
    let answered = 0;
    let marked = 0;

    Object.values(questionStatuses).forEach((st) => {
      if (st === "NOT_VISITED") notVisited++;
      else if (st === "VISITED") visited++;
      else if (st === "ANSWERED") answered++;
      else if (st === "MARKED_FOR_REVIEW") marked++;
    });

    return { notVisited, visited, answered, marked };
  }, [questionStatuses]);

  // ==========================================
  // VIEW: RESULT ANALYSIS DASHBOARD
  // ==========================================
  if (submissionResult) {
    const filteredQuestions = submissionResult.allQuestions.filter((q) => {
      if (resultQuestionFilter === "SOLVED") return q.isCorrect;
      if (resultQuestionFilter === "INCORRECT") return q.isAttempted && !q.isCorrect;
      if (resultQuestionFilter === "UNATTEMPTED") return !q.isAttempted;
      return true;
    });

    return (
      <div className="min-h-screen bg-[#08080d] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Top Banner Card */}
          <div className="p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border ${
                      submissionResult.mockType === "SOURCE_BASED"
                        ? "bg-emerald-950/70 text-emerald-300 border-emerald-700/60"
                        : "bg-blue-950/70 text-blue-300 border-blue-700/60"
                    }`}
                  >
                    {submissionResult.mockType === "SOURCE_BASED" ? "SOURCE-BASED MOCK" : "PATTERN-BASED MOCK"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-zinc-400">
                    Attempt #{submissionResult.attemptId.slice(0, 8)}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {submissionResult.mockTitle}
                </h1>
                <p className="text-xs text-zinc-400 font-sans">
                  Automated examination evaluation completed against sandboxed test suites.
                </p>
              </div>

              {/* Status Outcome Badge */}
              <div className="flex items-center gap-4">
                <div
                  className={`px-5 py-3 rounded-xl border flex items-center gap-3 ${
                    submissionResult.isPassed
                      ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-300"
                      : "bg-rose-950/40 border-rose-600/50 text-rose-300"
                  }`}
                >
                  {submissionResult.isPassed ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-mono opacity-80">
                      Benchmark Result
                    </div>
                    <div className="text-base font-bold font-mono">
                      {submissionResult.isPassed ? "PASSED CUTOFF" : "NEEDS IMPROVEMENT"}
                    </div>
                    <div className="text-[10px] opacity-70 font-mono">
                      Threshold: {submissionResult.passingMarks} / {submissionResult.totalMarks} Marks
                    </div>
                  </div>
                </div>

                <Link
                  href="/mock-tests"
                  className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs transition-colors flex items-center gap-2"
                >
                  <span>Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* KPI Summary Grid (Score, Accuracy, Correct, Incorrect, Unattempted, Time Taken) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-zinc-800 font-mono">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Score</div>
                <div className="text-xl font-bold text-indigo-400 mt-1">
                  {submissionResult.score} <span className="text-xs text-zinc-500">/ {submissionResult.totalMarks}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Accuracy</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {submissionResult.accuracy}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Correct</div>
                <div className="text-xl font-bold text-emerald-300 mt-1">
                  {submissionResult.correct}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Incorrect</div>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {submissionResult.incorrect}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Unattempted</div>
                <div className="text-xl font-bold text-zinc-400 mt-1">
                  {submissionResult.unattempted}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Time Taken</div>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  {formatTime(submissionResult.timeTakenSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Accuracy Breakdowns (Type & Difficulty) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discipline Breakdown */}
            <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold font-mono text-zinc-200">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Accuracy by Question Type</span>
              </div>
              <div className="space-y-3.5 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Coding Accuracy
                    </span>
                    <span className="font-semibold text-zinc-200">{submissionResult.codingAccuracy}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${submissionResult.codingAccuracy}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-amber-400" /> SQL Accuracy
                    </span>
                    <span className="font-semibold text-zinc-200">{submissionResult.sqlAccuracy}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${submissionResult.sqlAccuracy}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" /> Frontend Accuracy
                    </span>
                    <span className="font-semibold text-zinc-200">{submissionResult.frontendAccuracy}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${submissionResult.frontendAccuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold font-mono text-zinc-200">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Accuracy by Difficulty Level</span>
              </div>
              <div className="space-y-3.5 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span className="text-emerald-400 font-semibold">Easy Accuracy</span>
                    <span className="font-semibold text-zinc-200">{submissionResult.easyAccuracy}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${submissionResult.easyAccuracy}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span className="text-amber-400 font-semibold">Medium Accuracy</span>
                    <span className="font-semibold text-zinc-200">{submissionResult.mediumAccuracy}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${submissionResult.mediumAccuracy}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span className="text-rose-400 font-semibold">Hard Accuracy</span>
                    <span className="font-semibold text-zinc-200">{submissionResult.hardAccuracy}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${submissionResult.hardAccuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Topic Performance & Weak Topics */}
          <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold font-mono text-zinc-200">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Topic Performance</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Weak Topics Threshold: &lt; 60% Accuracy
              </span>
            </div>

            {/* Weak Topics Warning Callout */}
            {submissionResult.weakTopics.length > 0 ? (
              <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/50 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Weak Topics Identified ({submissionResult.weakTopics.length}):</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {submissionResult.weakTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 rounded bg-amber-900/40 border border-amber-700/50 text-amber-300 font-semibold text-[11px]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 font-sans pt-1">
                  Focus your next revision blocks on these topics to meet the recommended minimum standard.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No weak topics detected. All evaluated topics achieved &gt;= 60% accuracy!</span>
              </div>
            )}

            {/* Topic Performance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {submissionResult.topicPerformance.map((tp) => (
                <div
                  key={tp.topic}
                  className={`p-3.5 rounded-lg border font-mono text-xs space-y-2 ${
                    tp.isWeak
                      ? "bg-rose-950/20 border-rose-800/30 text-rose-200"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate max-w-[140px]">{tp.topic}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tp.isWeak
                          ? "bg-rose-900/50 text-rose-300 border border-rose-700/50"
                          : "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50"
                      }`}
                    >
                      {tp.accuracy}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tp.isWeak ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${tp.accuracy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Tested: {tp.total}</span>
                    <span>Solved: {tp.correct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Detailed Question Breakdown with Filters */}
          <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold font-mono text-zinc-200">
                Question Breakdown ({submissionResult.allQuestions.length} Questions)
              </h3>

              {/* Solved / Incorrect / Unattempted Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
                <button
                  onClick={() => setResultQuestionFilter("ALL")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    resultQuestionFilter === "ALL" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All ({submissionResult.allQuestions.length})
                </button>
                <button
                  onClick={() => setResultQuestionFilter("SOLVED")}
                  className={`px-2.5 py-1 rounded transition-colors text-emerald-400 ${
                    resultQuestionFilter === "SOLVED" ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800" : "hover:text-emerald-300"
                  }`}
                >
                  Solved ({submissionResult.solvedQuestions.length})
                </button>
                <button
                  onClick={() => setResultQuestionFilter("INCORRECT")}
                  className={`px-2.5 py-1 rounded transition-colors text-rose-400 ${
                    resultQuestionFilter === "INCORRECT" ? "bg-rose-950 text-rose-300 font-bold border border-rose-800" : "hover:text-rose-300"
                  }`}
                >
                  Incorrect ({submissionResult.incorrectQuestions.length})
                </button>
                <button
                  onClick={() => setResultQuestionFilter("UNATTEMPTED")}
                  className={`px-2.5 py-1 rounded transition-colors text-zinc-400 ${
                    resultQuestionFilter === "UNATTEMPTED" ? "bg-zinc-800 text-zinc-200 font-bold" : "hover:text-zinc-200"
                  }`}
                >
                  Unattempted ({submissionResult.unattemptedQuestions.length})
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredQuestions.map((q: any, idx: number) => {
                const isCorrect = q.isCorrect;
                const isAttempted = q.isAttempted;

                return (
                  <div
                    key={q.questionId}
                    className={`p-4 rounded-lg border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isCorrect
                        ? "bg-emerald-950/15 border-emerald-800/40"
                        : isAttempted
                        ? "bg-rose-950/10 border-rose-800/30"
                        : "bg-zinc-950/60 border-zinc-800/70"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-500 font-bold">Q{idx + 1}.</span>
                        <span className="font-bold text-white text-sm">{q.title}</span>
                        <DifficultyBadge difficulty={q.difficulty as any} className="text-[9px] py-0 px-1.5" />
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
                          {q.questionType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
                        <span>Marks: <strong className={isCorrect ? "text-emerald-400" : "text-zinc-400"}>{q.marksAwarded} / {q.marks}</strong></span>
                        <span>•</span>
                        <span>Time: <strong>{formatTime(q.timeSpentSec || 0)}</strong></span>
                        <span>•</span>
                        <span>Status: <span className="uppercase text-[10px]">{q.status.replace(/_/g, " ")}</span></span>
                        {q.evaluationMessage && (
                          <>
                            <span>•</span>
                            <span className={isCorrect ? "text-emerald-400/80" : "text-rose-400/80"}>
                              {q.evaluationMessage}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Solved
                        </span>
                      ) : isAttempted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-950/60 border border-rose-700/60 text-rose-300 font-semibold text-xs">
                          <XCircle className="w-4 h-4 text-rose-400" /> Incorrect
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold text-xs">
                          Unattempted
                        </span>
                      )}

                      <Link
                        href={`/problems/${q.slug}`}
                        target="_blank"
                        className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authentic Data & Benchmark Disclaimer */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 text-xs font-mono text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Assessment Metric Accuracy Standards</span>
            </div>
            <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
              In adherence with our authentic evaluation standards, no simulated percentiles or estimated nationwide ranks are generated. Cutoff benchmarks represent academic syllabus mastery standards and do not claim to be formal company hiring guarantees.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: TIMED EXAMINATION INTERFACE
  // ==========================================
  const currentQuestionTime = timeSpentPerQuestion[currentQuestion?.id || ""] || 0;
  const currentStatus = questionStatuses[currentQuestion?.id || ""] || "NOT_VISITED";
  const isCurrentMarked = currentStatus === "MARKED_FOR_REVIEW";
  const isFrontend = currentQuestion?.questionType === "HTML_CSS_JS" || currentQuestion?.questionType === "FRONTEND";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#09090f] overflow-hidden select-none">
      {/* 1. TOP HEADER: TITLE, TRIPLE TIMERS, SUBMIT BUTTON */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs font-mono z-10 shrink-0">
        {/* Left: Title & Strict Mock Type */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-bold text-white tracking-wide truncate max-w-[160px] sm:max-w-xs md:max-w-sm">
            {mockTest.title}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
              mockTest.mockType === "SOURCE_BASED"
                ? "bg-emerald-950/70 text-emerald-300 border-emerald-700/60"
                : "bg-blue-950/70 text-blue-300 border-blue-700/60"
            }`}
          >
            {mockTest.mockType === "SOURCE_BASED" ? "SOURCE-BASED" : "PATTERN-BASED"}
          </span>
        </div>

        {/* Center: TRIPLE TIMERS (Total Time, Remaining Time, Question Time) */}
        <div className="flex items-center gap-2 sm:gap-4 bg-zinc-900/90 px-3 py-1 rounded-lg border border-zinc-800 text-xs">
          {/* Total Duration */}
          <div className="hidden sm:flex items-center gap-1 text-zinc-400">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Total:</span>
            <span>{mockTest.durationMins}m</span>
          </div>

          <span className="hidden sm:inline text-zinc-700">|</span>

          {/* Remaining Time (Live Countdown) */}
          <div className="flex items-center gap-1.5">
            <Timer className={`w-3.5 h-3.5 ${timeLeftSec <= 300 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Remaining:</span>
            <span
              className={`font-bold font-mono tracking-wider text-xs sm:text-sm ${
                timeLeftSec <= 60
                  ? "text-rose-400 font-extrabold animate-pulse"
                  : timeLeftSec <= 300
                  ? "text-rose-300 font-bold"
                  : "text-amber-300"
              }`}
            >
              {formatTime(timeLeftSec)}
            </span>
          </div>

          <span className="text-zinc-700">|</span>

          {/* Question Time (Stopwatch for current question) */}
          <div className="flex items-center gap-1 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Q-Time:</span>
            <span className="font-mono text-cyan-300 text-xs sm:text-sm">{formatTime(currentQuestionTime)}</span>
          </div>
        </div>

        {/* Right: Submit Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>

      {/* 2. SPLIT WORKSPACE: Left Question/DOM View, Right Editor + Palette */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Problem Details + Testcases / DOM Structure */}
        <div className="lg:col-span-6 flex flex-col h-full border-r border-zinc-800 bg-zinc-950 overflow-hidden">
          {/* Subheader Toolbar */}
          <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-semibold">
                Question {activeIdx + 1} of {questions.length}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-indigo-400 font-semibold">{currentItem.marks} Marks</span>
              <DifficultyBadge difficulty={currentQuestion?.difficulty as any} className="text-[10px] py-0 px-1.5" />
            </div>

            {/* Toggle Mark for Review */}
            <button
              onClick={toggleMarkForReview}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border ${
                isCurrentMarked
                  ? "bg-purple-950/80 text-purple-300 border-purple-700/60"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {isCurrentMarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Marked for Review</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Mark for Review</span>
                </>
              )}
            </button>
          </div>

          {/* Tabs for Frontend: [Problem Statement] | [HTML Template & DOM Preview] */}
          {isFrontend && (
            <div className="flex items-center border-b border-zinc-800 bg-zinc-900/40 text-xs font-mono px-4">
              <button
                onClick={() => setLeftTab("problem")}
                className={`py-2 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                  leftTab === "problem"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Problem Statement</span>
              </button>
              <button
                onClick={() => setLeftTab("html_preview")}
                className={`py-2 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                  leftTab === "html_preview"
                    ? "border-cyan-500 text-cyan-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>HTML Structure & Live Preview</span>
              </button>
            </div>
          )}

          {/* Left Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-zinc-300 font-sans leading-relaxed">
            {leftTab === "html_preview" && isFrontend ? (
              <div className="space-y-4 font-mono">
                <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 uppercase text-[10px] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Provided HTML Template
                    </span>
                    <span className="text-[10px] text-zinc-500">Read-Only Structure</span>
                  </div>
                  <pre className="p-2.5 rounded bg-zinc-950 text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                    {currentQuestion?.htmlTemplate || "<!-- No template specified -->"}
                  </pre>
                </div>

                {/* Rendered Sandbox Iframe */}
                <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <span className="font-bold text-zinc-300 uppercase text-[10px]">
                    Live Component Render Preview
                  </span>
                  <div className="rounded-lg overflow-hidden border border-zinc-800 bg-white min-h-[160px] p-4 text-black">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: currentQuestion?.htmlTemplate || "",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">{currentQuestion?.title}</h2>
                  {currentQuestion?.questionTopics && currentQuestion.questionTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {currentQuestion.questionTopics.map((qt: any) => (
                        <span
                          key={qt.topic.id}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400"
                        >
                          {qt.topic.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="whitespace-pre-line text-zinc-300 leading-relaxed font-sans text-xs">
                  {currentQuestion?.description}
                </div>

                {/* Input & Output Format */}
                {(currentQuestion?.inputFormat || currentQuestion?.outputFormat) && (
                  <div className="space-y-3 font-mono text-xs">
                    {currentQuestion.inputFormat && (
                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                        <span className="font-bold text-zinc-200 uppercase text-[10px]">Input Format</span>
                        <p className="text-zinc-400 whitespace-pre-wrap font-sans text-xs">
                          {currentQuestion.inputFormat}
                        </p>
                      </div>
                    )}
                    {currentQuestion.outputFormat && (
                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                        <span className="font-bold text-zinc-200 uppercase text-[10px]">Output Format</span>
                        <p className="text-zinc-400 whitespace-pre-wrap font-sans text-xs">
                          {currentQuestion.outputFormat}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Constraints */}
                {currentQuestion?.constraints && (
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1 font-mono text-xs">
                    <span className="font-bold text-amber-400 uppercase text-[10px]">Constraints</span>
                    <pre className="text-zinc-400 whitespace-pre-wrap font-mono text-[11px]">
                      {currentQuestion.constraints}
                    </pre>
                  </div>
                )}

                {/* SQL Schema Preview */}
                {currentQuestion?.questionType === "SQL" && currentQuestion.sqlSchemaSql && (
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2 font-mono text-xs">
                    <span className="font-bold text-amber-400 uppercase text-[10px] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" /> Database Table Schema
                    </span>
                    <pre className="p-2.5 rounded bg-zinc-950 text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                      {currentQuestion.sqlSchemaSql}
                    </pre>
                  </div>
                )}

                {/* Sample Examples */}
                {currentQuestion?.examplesList && currentQuestion.examplesList.length > 0 && (
                  <div className="space-y-3 font-mono text-xs">
                    <span className="font-bold text-zinc-200 uppercase text-[10px]">Sample Examples</span>
                    {currentQuestion.examplesList.map((ex: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-2">
                        <div className="text-[10px] text-zinc-500 font-semibold">Example {i + 1}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                            <span className="text-zinc-500 block text-[9px] uppercase">Input:</span>
                            <code className="text-zinc-300 whitespace-pre-wrap">{ex.input}</code>
                          </div>
                          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                            <span className="text-zinc-500 block text-[9px] uppercase">Expected Output:</span>
                            <code className="text-emerald-400 whitespace-pre-wrap">{ex.output}</code>
                          </div>
                        </div>
                        {ex.explanation && (
                          <p className="text-[11px] text-zinc-400 font-sans">{ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Monaco Editor + Question Palette */}
        <div className="lg:col-span-6 flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
          {/* Editor Header Toolbar */}
          <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs font-mono shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 font-semibold">Editor</span>
              {currentQuestion?.questionType === "SQL" ? (
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px]">
                  SQL Engine
                </span>
              ) : isFrontend ? (
                <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-[10px]">
                  JavaScript (DOM Script)
                </span>
              ) : (
                <select
                  value={languages[currentQuestion?.id || ""] || "java"}
                  onChange={(e) => {
                    if (currentQuestion) {
                      setLanguages((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }));
                    }
                  }}
                  className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none"
                >
                  <option value="java">Java 21 (OpenJDK)</option>
                  <option value="cpp">C++ 20 (GCC)</option>
                  <option value="python">Python 3.12</option>
                  <option value="javascript">JavaScript (Node.js)</option>
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetCode}
                title="Reset code to original template"
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleTestRun}
                disabled={isTestingCode}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Play className="w-3 h-3" />
                <span>{isTestingCode ? "Running..." : "Test Code"}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden">
            {currentQuestion && (
              <MonacoCodeEditor
                language={languages[currentQuestion.id] || (currentQuestion.questionType === "SQL" ? "sql" : "java")}
                code={codes[currentQuestion.id] || ""}
                onChange={handleCodeChange}
                fontSize={13}
              />
            )}
          </div>

          {/* Test Run Output Drawer */}
          {testRunOutput && (
            <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800 font-mono text-xs shrink-0 max-h-36 overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Test Result:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      testRunOutput.verdict === "ACCEPTED" || testRunOutput.verdict === "READY_TO_SUBMIT"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {testRunOutput.verdict}
                  </span>
                </div>
                <button
                  onClick={() => setTestRunOutput(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                >
                  ✕ Close
                </button>
              </div>
              <p className="text-zinc-400 text-[11px] whitespace-pre-wrap">{testRunOutput.message}</p>
            </div>
          )}

          {/* QUESTION PALETTE (1 2 3 4 5 ...) & STATUSES */}
          <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 space-y-3 shrink-0">
            {/* Legend & Navigation Buttons */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  disabled={activeIdx === 0}
                  onClick={() => navigateToQuestion(activeIdx - 1)}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 flex items-center gap-1 transition-colors text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  disabled={activeIdx === questions.length - 1}
                  onClick={() => navigateToQuestion(activeIdx + 1)}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 flex items-center gap-1 transition-colors text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Legend */}
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered ({statusCounts.answered})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Marked for Review ({statusCounts.marked})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Visited ({statusCounts.visited})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" /> Not Visited ({statusCounts.notVisited})
                </span>
              </div>
            </div>

            {/* Question Palette Buttons (1 2 3 4 5...) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {questions.map((q, idx) => {
                const status = questionStatuses[q.question.id] || "NOT_VISITED";
                const isSelected = activeIdx === idx;

                let statusClass = "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"; // NOT_VISITED

                if (status === "ANSWERED") {
                  statusClass = "bg-emerald-950/80 text-emerald-300 border-emerald-600/80 font-bold";
                } else if (status === "MARKED_FOR_REVIEW") {
                  statusClass = "bg-purple-950/80 text-purple-300 border-purple-600/80 font-bold";
                } else if (status === "VISITED") {
                  statusClass = "bg-blue-950/60 text-blue-300 border-blue-600/60";
                }

                if (isSelected) {
                  statusClass += " ring-2 ring-indigo-400 ring-offset-1 ring-offset-zinc-950";
                }

                return (
                  <button
                    key={q.question.id}
                    onClick={() => navigateToQuestion(idx)}
                    className={`w-8 h-8 rounded text-xs font-mono transition-all border flex items-center justify-center relative ${statusClass}`}
                  >
                    <span>{idx + 1}</span>
                    {status === "MARKED_FOR_REVIEW" && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 border border-zinc-950" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MILESTONE WARNING MODAL (10m, 5m, 1m) */}
      {milestoneModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center gap-3 text-white">
              <AlertTriangle className={`w-6 h-6 shrink-0 ${milestoneModal.level === "CRITICAL" ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
              <h3 className="text-base font-bold">{milestoneModal.title}</h3>
            </div>

            <p className="text-zinc-300 font-sans leading-relaxed text-xs">
              {milestoneModal.message}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setMilestoneModal(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
              >
                Continue Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-5 font-mono text-xs">
            <div className="flex items-center gap-3 text-white">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <h3 className="text-base font-bold">Confirm Mock Submission</h3>
            </div>

            <p className="text-zinc-400 font-sans leading-relaxed">
              Are you sure you want to finish and submit your test? Once submitted, your solutions will be automatically evaluated against testcases.
            </p>

            {/* Status Breakdown in Modal */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <div className="flex justify-between text-emerald-400">
                <span>Answered:</span>
                <span className="font-bold">{statusCounts.answered}</span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>Marked for Review:</span>
                <span className="font-bold">{statusCounts.marked}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>Visited (Pending):</span>
                <span className="font-bold">{statusCounts.visited}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Not Visited:</span>
                <span className="font-bold">{statusCounts.notVisited}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-amber-400 bg-amber-950/30 p-2.5 rounded border border-amber-800/40">
              <span>Time Remaining:</span>
              <span className="font-bold">{formatTime(timeLeftSec)}</span>
            </div>

            {submitError && (
              <div className="p-2.5 rounded bg-rose-950/50 border border-rose-800 text-rose-300 text-[11px]">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors"
              >
                Back to Test
              </button>
              <button
                disabled={isSubmitting}
                onClick={executeSubmission}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold flex items-center gap-2 transition-colors shadow-md shadow-emerald-950"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Grading Solutions...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Finish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
