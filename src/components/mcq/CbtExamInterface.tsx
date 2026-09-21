"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Send,
  AlertCircle,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ArrowLeft,
  Check,
  X,
  Award,
  BarChart3,
  Flame,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { SafeMockQuestion, MockTestEvaluationResult } from "@/lib/mockTestService";

export type QuestionStatus =
  | "NOT_VISITED"
  | "VISITED_NOT_ANSWERED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_AND_MARKED_FOR_REVIEW";

interface CbtExamInterfaceProps {
  questions: SafeMockQuestion[];
  testTitle?: string;
  durationMins?: number;
  testId?: string;
  returnUrl?: string;
}

export function CbtExamInterface({
  questions,
  testTitle = "Accenture Assessment Simulation (CBT)",
  durationMins = 30,
  testId = "accenture-cbt-test",
  returnUrl = "/accenture",
}: CbtExamInterfaceProps) {
  const router = useRouter();
  const sessionStorageKey = `cbt_session_${testId}`;

  // Mode: "ACTIVE_TEST" | "SUBMITTED"
  const [testMode, setTestMode] = useState<"ACTIVE_TEST" | "SUBMITTED">("ACTIVE_TEST");

  // Current active question index (0-indexed)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User responses: questionId -> "A" | "B" | "C" | "D"
  const [userAnswers, setUserAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});

  // Marked for Review question IDs
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());

  // Visited question IDs
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set([questions[0]?.id].filter(Boolean)));

  // Countdown timer in seconds (strictly prevents negative values)
  const totalDurationSeconds = durationMins * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(totalDurationSeconds);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Evaluated result from server
  const [evaluationResult, setEvaluationResult] = useState<MockTestEvaluationResult | null>(null);

  // Review mode filter: "all" | "correct" | "incorrect" | "unattempted"
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "unattempted">("all");

  // --------------------------------------------------------------------------
  // RESTORE SESSION ON PAGE LOAD (Prevents refresh data loss or reshuffle)
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(sessionStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userAnswers) setUserAnswers(parsed.userAnswers);
        if (parsed.markedQuestions) setMarkedQuestions(new Set(parsed.markedQuestions));
        if (parsed.visitedQuestions) setVisitedQuestions(new Set(parsed.visitedQuestions));
        if (typeof parsed.currentIndex === "number" && parsed.currentIndex < questions.length) {
          setCurrentIndex(parsed.currentIndex);
        }
        if (typeof parsed.timeRemaining === "number" && parsed.timeRemaining > 0) {
          setTimeRemaining(parsed.timeRemaining);
        }
        if (parsed.evaluationResult) {
          setEvaluationResult(parsed.evaluationResult);
          setTestMode("SUBMITTED");
        }
      }
    } catch {
      // ignore localStorage parse errors
    }
  }, [sessionStorageKey, questions.length]);

  // --------------------------------------------------------------------------
  // SAVE SESSION TO LOCALSTORAGE
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (testMode === "ACTIVE_TEST") {
      try {
        localStorage.setItem(
          sessionStorageKey,
          JSON.stringify({
            userAnswers,
            markedQuestions: Array.from(markedQuestions),
            visitedQuestions: Array.from(visitedQuestions),
            currentIndex,
            timeRemaining,
          })
        );
      } catch {
        // ignore storage quota errors
      }
    }
  }, [userAnswers, markedQuestions, visitedQuestions, currentIndex, timeRemaining, testMode, sessionStorageKey]);

  // Track visited questions as user navigates
  const currentQ = questions[currentIndex] || questions[0];
  useEffect(() => {
    if (currentQ?.id && !visitedQuestions.has(currentQ.id)) {
      setVisitedQuestions((prev) => new Set([...prev, currentQ.id]));
    }
  }, [currentQ?.id, visitedQuestions]);

  // --------------------------------------------------------------------------
  // SUBMIT TEST HANDLER (Authoritative Server Evaluation)
  // --------------------------------------------------------------------------
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const timeUsedSeconds = Math.max(1, totalDurationSeconds - timeRemaining);

    try {
      const payload = {
        testId,
        questionIds: questions.map((q) => q.id),
        userAnswers,
        markedQuestionIds: Array.from(markedQuestions),
        timeUsedSeconds,
      };

      const res = await fetch("/api/accenture/mock-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const result: MockTestEvaluationResult = await res.json();
      setEvaluationResult(result);
      setTestMode("SUBMITTED");
      setShowSubmitModal(false);

      // Save evaluated result
      try {
        localStorage.setItem(
          sessionStorageKey,
          JSON.stringify({
            evaluationResult: result,
            timeUsedSeconds,
          })
        );
      } catch {
        // ignore
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to evaluate test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, totalDurationSeconds, timeRemaining, testId, questions, userAnswers, markedQuestions, sessionStorageKey]);

  // --------------------------------------------------------------------------
  // COUNTDOWN TIMER (Auto-Submits when reaching 0, prevents negative values)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (testMode !== "ACTIVE_TEST") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testMode, handleSubmitTest]);

  // Format timer: MM:SS
  const formatTime = (secs: number) => {
    const safeSecs = Math.max(0, secs);
    const m = Math.floor(safeSecs / 60);
    const s = safeSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------
  // QUESTION PALETTE STATE ENGINE
  // --------------------------------------------------------------------------
  const getQuestionStatus = useCallback(
    (qId: string): QuestionStatus => {
      const hasAnswer = !!userAnswers[qId];
      const isMarked = markedQuestions.has(qId);
      const isVisited = visitedQuestions.has(qId);

      if (isMarked && hasAnswer) return "ANSWERED_AND_MARKED_FOR_REVIEW";
      if (isMarked) return "MARKED_FOR_REVIEW";
      if (hasAnswer) return "ANSWERED";
      if (isVisited) return "VISITED_NOT_ANSWERED";
      return "NOT_VISITED";
    },
    [userAnswers, markedQuestions, visitedQuestions]
  );

  // Compute stats for palette summary & modal
  const paletteStats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let notVisited = 0;

    for (const q of questions) {
      const st = getQuestionStatus(q.id);
      if (st === "ANSWERED") answered++;
      else if (st === "ANSWERED_AND_MARKED_FOR_REVIEW") {
        answered++;
        marked++;
      } else if (st === "MARKED_FOR_REVIEW") marked++;
      else if (st === "VISITED_NOT_ANSWERED") notAnswered++;
      else notVisited++;
    }

    return { answered, notAnswered, marked, notVisited, total: questions.length };
  }, [questions, getQuestionStatus]);

  // Actions
  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const selectedKey = currentQ ? userAnswers[currentQ.id] : undefined;
  const isCurrentMarked = currentQ ? markedQuestions.has(currentQ.id) : false;

  // =========================================================================
  // RENDER: SUBMITTED / RESULTS VIEW (Answers only revealed after submission)
  // =========================================================================
  if (testMode === "SUBMITTED" && evaluationResult) {
    const filteredReviewQuestions = evaluationResult.reviewQuestions.filter((q) => {
      if (reviewFilter === "correct") return q.isCorrect;
      if (reviewFilter === "incorrect") return q.isAttempted && !q.isCorrect;
      if (reviewFilter === "unattempted") return !q.isAttempted;
      return true;
    });

    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#111827] font-sans antialiased">
        {/* CBT Header */}
        <header className="bg-white border-b border-[#D9DEE7] sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-[#2563EB] text-white px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase font-mono">
                CBT Scorecard
              </span>
              <h1 className="text-base font-bold text-[#111827] hidden sm:block">
                {testTitle}
              </h1>
            </div>
            <Link
              href={returnUrl}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] px-3 py-1.5 rounded border border-[#BFDBFE] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hub</span>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Executive Scorecard Banner */}
          <div className="bg-white rounded-lg border border-[#D9DEE7] p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5E7EB] pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase ${
                      evaluationResult.isPassed
                        ? "bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]"
                        : "bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]"
                    }`}
                  >
                    {evaluationResult.isPassed ? "PASSED (Benchmark Met)" : "NEEDS PRACTICE"}
                  </span>
                  <span className="text-xs text-[#6B7280]">Accenture Standard 65% Benchmark</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#111827]">
                  Final Assessment Result
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Server-verified evaluation computed from canonical answer database.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#2563EB] font-mono">
                    {evaluationResult.score} / {evaluationResult.totalQuestions}
                  </div>
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                    Total Score ({evaluationResult.percentage}%)
                  </div>
                </div>
                <div className="h-10 w-[1px] bg-[#E5E7EB]" />
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#16A34A] font-mono">
                    {evaluationResult.accuracy}%
                  </div>
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                    Accuracy
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-6 text-center">
              <div className="p-3 bg-[#F9FAFB] rounded border border-[#E5E7EB]">
                <div className="text-[11px] text-[#6B7280] uppercase font-semibold">Attempted</div>
                <div className="text-xl font-bold text-[#111827] mt-1 font-mono">
                  {evaluationResult.attempted} / {evaluationResult.totalQuestions}
                </div>
              </div>
              <div className="p-3 bg-[#F0FDF4] rounded border border-[#BBF7D0]">
                <div className="text-[11px] text-[#16A34A] uppercase font-semibold">Correct</div>
                <div className="text-xl font-bold text-[#16A34A] mt-1 font-mono">
                  {evaluationResult.correct}
                </div>
              </div>
              <div className="p-3 bg-[#FEF2F2] rounded border border-[#FECACA]">
                <div className="text-[11px] text-[#DC2626] uppercase font-semibold">Incorrect</div>
                <div className="text-xl font-bold text-[#DC2626] mt-1 font-mono">
                  {evaluationResult.incorrect}
                </div>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded border border-[#E5E7EB]">
                <div className="text-[11px] text-[#6B7280] uppercase font-semibold">Unattempted</div>
                <div className="text-xl font-bold text-[#6B7280] mt-1 font-mono">
                  {evaluationResult.unattempted}
                </div>
              </div>
              <div className="p-3 bg-[#F9FAFB] rounded border border-[#E5E7EB] col-span-2 sm:col-span-1">
                <div className="text-[11px] text-[#6B7280] uppercase font-semibold">Time Used</div>
                <div className="text-xl font-bold text-[#2563EB] mt-1 font-mono">
                  {evaluationResult.timeUsedFormatted}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Question Review Section */}
          <div className="bg-white rounded-lg border border-[#D9DEE7] p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Question-by-Question Review & Canonical Explanations
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Inspect your response against verified canonical answers.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-[#F3F4F6] p-1 rounded-md border border-[#E5E7EB]">
                {(["all", "correct", "incorrect", "unattempted"] as const).map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setReviewFilter(flt)}
                    className={`px-3 py-1 text-xs font-semibold rounded capitalize transition-colors ${
                      reviewFilter === flt
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {filteredReviewQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-lg border ${
                    q.isCorrect
                      ? "border-[#86EFAC] bg-[#F0FDF4]/40"
                      : q.isAttempted
                      ? "border-[#FCA5A5] bg-[#FEF2F2]/40"
                      : "border-[#D9DEE7] bg-white"
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#E5E7EB] text-[#374151]">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[#4B5563]">{q.category}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white border border-[#D9DEE7] text-[#6B7280]">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs font-semibold">
                      {q.isCorrect ? (
                        <span className="flex items-center gap-1 text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#86EFAC]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                        </span>
                      ) : q.isAttempted ? (
                        <span className="flex items-center gap-1 text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded border border-[#FCA5A5]">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (0)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#D1D5DB]">
                          <MinusCircle className="w-3.5 h-3.5" /> Unattempted (0)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stem */}
                  <div className="text-sm font-medium text-[#111827] whitespace-pre-wrap leading-relaxed">
                    {q.stem}
                  </div>

                  {/* Options Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(["A", "B", "C", "D"] as const).map((k) => {
                      const text = q.options[k];
                      const isSelected = q.userSelectedKey === k;
                      const isAnswer = q.correctKey === k;

                      let optStyle = "border-[#E5E7EB] bg-white text-[#374151]";
                      if (isAnswer) {
                        optStyle = "border-[#16A34A] bg-[#DCFCE7] text-[#14532D] font-semibold";
                      } else if (isSelected && !isAnswer) {
                        optStyle = "border-[#DC2626] bg-[#FEE2E2] text-[#7F1D1D]";
                      }

                      return (
                        <div
                          key={k}
                          className={`p-3 rounded-md border text-xs flex items-start gap-2.5 ${optStyle}`}
                        >
                          <span className="font-mono font-bold shrink-0">{k}.</span>
                          <span className="flex-1">{text}</span>
                          {isAnswer && <Check className="w-4 h-4 text-[#16A34A] shrink-0" />}
                          {isSelected && !isAnswer && <X className="w-4 h-4 text-[#DC2626] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  {q.explanation && (
                    <div className="p-3.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                      <div className="text-[11px] font-bold text-[#2563EB] uppercase font-mono tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Explanation</span>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // RENDER: ACTIVE CBT EXAM INTERFACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#111827] font-sans antialiased flex flex-col justify-between">
      {/* 1. CBT Exam Header */}
      <header className="bg-white border-b border-[#D9DEE7] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#111827] text-white px-2.5 py-1 rounded text-xs font-bold tracking-wider uppercase font-mono">
              ACCENTURE CBT
            </span>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-[#111827]">{testTitle}</h1>
              <p className="text-[11px] text-[#6B7280]">
                Section: {currentQ?.category || "Cognitive & Technical Assessment"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm font-bold border ${
                timeRemaining <= 300
                  ? "bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5] animate-pulse"
                  : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Time Left: {formatTime(timeRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Exam Body: Split View (Question Canvas Right, Palette Left/Side) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Palette & Navigation (4 cols on lg) */}
        <aside className="lg:col-span-4 bg-white rounded-lg border border-[#D9DEE7] p-5 space-y-5 shadow-sm h-fit">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider font-mono">
              Question Palette
            </h2>
            <div className="text-xs text-[#6B7280] mt-0.5">
              {paletteStats.answered} of {paletteStats.total} Questions Answered
            </div>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(q.id);
              const isCurrent = idx === currentIndex;

              let btnStyle = "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]"; // NOT_VISITED
              if (status === "ANSWERED") {
                btnStyle = "bg-[#16A34A] text-white border-[#16A34A]";
              } else if (status === "ANSWERED_AND_MARKED_FOR_REVIEW") {
                btnStyle = "bg-[#7C3AED] text-white border-[#7C3AED] ring-2 ring-[#16A34A]";
              } else if (status === "MARKED_FOR_REVIEW") {
                btnStyle = "bg-[#7C3AED] text-white border-[#7C3AED]";
              } else if (status === "VISITED_NOT_ANSWERED") {
                btnStyle = "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-9 rounded font-mono text-xs font-bold border flex items-center justify-center transition-all ${btnStyle} ${
                    isCurrent ? "ring-2 ring-[#2563EB] ring-offset-1 scale-105" : "hover:opacity-90"
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  <span>{(idx + 1).toString().padStart(2, "0")}</span>
                  {status === "ANSWERED_AND_MARKED_FOR_REVIEW" && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#16A34A] rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-[#E5E7EB] space-y-2 text-[11px] text-[#4B5563]">
            <div className="font-semibold text-[#111827] uppercase tracking-wider text-[10px] font-mono">
              Legend:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#16A34A]" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#FEE2E2] border border-[#FCA5A5]" />
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#7C3AED]" />
                <span>Marked Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#F3F4F6] border border-[#E5E7EB]" />
                <span>Not Visited</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Question & Options Canvas (8 cols on lg) */}
        <section className="lg:col-span-8 bg-white rounded-lg border border-[#D9DEE7] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-6">
            {/* Top Question Meta */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold bg-[#EFF6FF] text-[#2563EB] px-2.5 py-1 rounded border border-[#BFDBFE]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold text-[#6B7280]">
                  {currentQ?.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                  Marks: +1 / -0
                </span>
              </div>
            </div>

            {/* Stem */}
            <div className="text-base font-medium text-[#111827] leading-relaxed whitespace-pre-wrap font-sans">
              {currentQ?.stem}
            </div>

            {/* Radio Options */}
            <div className="space-y-3 pt-2">
              {(["A", "B", "C", "D"] as const).map((key) => {
                const optText = currentQ?.options?.[key];
                if (!optText) return null;
                const isSelected = selectedKey === key;

                return (
                  <label
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    className={`p-4 rounded-lg border text-sm flex items-start gap-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF] font-semibold ring-1 ring-[#2563EB]"
                        : "border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQ?.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(key)}
                      className="w-4 h-4 mt-0.5 text-[#2563EB] border-[#D1D5DB] focus:ring-[#2563EB] shrink-0"
                    />
                    <span className="font-mono font-bold shrink-0">{key}.</span>
                    <span className="flex-1 leading-normal">{optText}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Buttons (Previous, Mark for Review, Clear Response, Save & Next) */}
          <div className="pt-6 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 rounded-md border border-[#D1D5DB] text-xs font-semibold text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleToggleMarkForReview}
                className={`px-3.5 py-2 rounded-md border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isCurrentMarked
                    ? "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]"
                    : "border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6]"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isCurrentMarked ? "Marked for Review" : "Mark for Review"}</span>
              </button>

              <button
                onClick={handleClearResponse}
                disabled={!selectedKey}
                className="px-3.5 py-2 rounded-md border border-[#D1D5DB] text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Clear Response
              </button>
            </div>

            <button
              onClick={handleSaveAndNext}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-5 py-2 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>{currentIndex === questions.length - 1 ? "Save Response" : "Save & Next"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* 3. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9DEE7] p-6 max-w-md w-full space-y-5 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111827]">
                Confirm Exam Submission
              </h3>
              <p className="text-xs text-[#6B7280]">
                Are you sure you want to finish and submit your test? Once submitted, answers cannot be modified.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
              <div className="p-3 bg-[#F0FDF4] rounded border border-[#BBF7D0]">
                <div className="text-[#16A34A] font-semibold">Answered</div>
                <div className="text-xl font-bold text-[#16A34A] mt-0.5">
                  {paletteStats.answered}
                </div>
              </div>
              <div className="p-3 bg-[#FEF2F2] rounded border border-[#FECACA]">
                <div className="text-[#DC2626] font-semibold">Not Answered</div>
                <div className="text-xl font-bold text-[#DC2626] mt-0.5">
                  {paletteStats.notAnswered + paletteStats.notVisited}
                </div>
              </div>
              <div className="p-3 bg-[#F5F3FF] rounded border border-[#DDD6FE] col-span-2">
                <div className="text-[#7C3AED] font-semibold">Marked for Review</div>
                <div className="text-xl font-bold text-[#7C3AED] mt-0.5">
                  {paletteStats.marked}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626]">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded border border-[#D1D5DB] text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
