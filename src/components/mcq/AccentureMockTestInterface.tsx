"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SafeMockQuestion,
  MockTestEvaluationResult,
  ReviewQuestionItem,
} from "@/lib/mockTestService";
import { DifficultyBadge } from "@/components/ui/Badge";
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
  Sparkles,
  ArrowLeft,
  Check,
  X,
  Award,
  BarChart3,
  Flame,
  HelpCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface AccentureMockTestInterfaceProps {
  questions: SafeMockQuestion[];
  testTitle?: string;
  durationMins?: number;
  returnUrl?: string;
}

export function AccentureMockTestInterface({
  questions,
  testTitle = "Accenture Assessment Timed Mock Test",
  durationMins = 30,
  returnUrl = "/accenture/mock-tests",
}: AccentureMockTestInterfaceProps) {
  const router = useRouter();

  // Test mode state: "ACTIVE_TEST" | "RESULTS" | "REVIEW"
  const [testMode, setTestMode] = useState<"ACTIVE_TEST" | "RESULTS" | "REVIEW">("ACTIVE_TEST");

  // Navigation
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User responses during active test (QuestionId -> "A" | "B" | "C" | "D")
  const [userAnswers, setUserAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});

  // Marked for review (Set of question IDs)
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());

  // Question Navigator Drawer state
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [navigatorFilter, setNavigatorFilter] = useState<"all" | "attempted" | "unattempted" | "marked">("all");

  // Countdown Timer in seconds
  const totalDurationSeconds = durationMins * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(totalDurationSeconds);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Submission confirmation dialog
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Evaluated results returned by server
  const [evaluationResult, setEvaluationResult] = useState<MockTestEvaluationResult | null>(null);

  // Review mode filter
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect" | "unattempted">("all");

  const currentQ = questions[currentIndex] || questions[0];
  const isMarked = currentQ ? markedQuestions.has(currentQ.id) : false;
  const selectedOption = currentQ ? userAnswers[currentQ.id] : undefined;

  // Active question in review mode
  const currentReviewQ = evaluationResult?.reviewQuestions?.[currentIndex];

  // --------------------------------------------------------------------------
  // Countdown Timer & Auto-Submit
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (testMode !== "ACTIVE_TEST") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit when countdown reaches 0
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testMode]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------
  // User Actions (Select Option, Clear Response, Mark for Review)
  // --------------------------------------------------------------------------
  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    if (testMode !== "ACTIVE_TEST" || !currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  };

  const handleClearResponse = () => {
    if (testMode !== "ACTIVE_TEST" || !currentQ) return;
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const toggleMarkForReview = () => {
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

  // --------------------------------------------------------------------------
  // Navigation (Previous, Next)
  // --------------------------------------------------------------------------
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (testMode === "ACTIVE_TEST") {
      setShowSubmitConfirm(true);
    }
  }, [currentIndex, questions.length, testMode]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMarkForReview();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsNavigatorOpen((prev) => !prev);
      } else if (testMode === "ACTIVE_TEST") {
        if (["1", "a", "A"].includes(e.key)) handleSelectOption("A");
        else if (["2", "b", "B"].includes(e.key)) handleSelectOption("B");
        else if (["3", "c", "C"].includes(e.key)) handleSelectOption("C");
        else if (["4", "d", "D"].includes(e.key)) handleSelectOption("D");
        else if (e.key === "Backspace" || e.key.toLowerCase() === "c") handleClearResponse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, toggleMarkForReview, testMode]);

  // --------------------------------------------------------------------------
  // Server-Side Submission & Evaluation
  // --------------------------------------------------------------------------
  const handleSubmitTest = async (isAutoSubmit: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const timeUsedSeconds = totalDurationSeconds - timeRemaining;
    const questionIds = questions.map((q) => q.id);

    try {
      const res = await fetch("/api/accenture/mock-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIds,
          userAnswers,
          timeUsedSeconds,
          markedQuestionIds: Array.from(markedQuestions),
          testId: "accenture-full-mock-test",
          startedAt: new Date(Date.now() - timeUsedSeconds * 1000).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed.");
      }

      const evalResult: MockTestEvaluationResult = await res.json();
      setEvaluationResult(evalResult);
      setShowSubmitConfirm(false);
      setTestMode("RESULTS");
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err?.message || "Failed to submit test. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Attempt metrics
  const attemptedCount = Object.keys(userAnswers).length;
  const unattemptedCount = questions.length - attemptedCount;
  const markedCount = markedQuestions.size;

  // =========================================================================
  // VIEW 1: RESULTS & SCORECARD SCREEN
  // =========================================================================
  if (testMode === "RESULTS" && evaluationResult) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D1117] text-[#F0F6FC] flex flex-col font-sans select-none overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto space-y-6 my-auto">
          {/* Header Card */}
          <div className="rounded-md border border-[#30363D] bg-[#161B22] p-6 text-center space-y-3 relative overflow-hidden">
            <div className="inline-flex p-3 rounded-full bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="font-mono text-[11px] text-[#8B949E] uppercase tracking-wider">
                Accenture Assessment Simulation
              </div>
              <h1 className="text-2xl font-bold font-mono text-[#F0F6FC] mt-1">
                {testTitle}
              </h1>
              <p className="text-xs text-[#8B949E] mt-1">
                Completed in {evaluationResult.timeUsedFormatted} • Standard Cognitive & Technical Pattern
              </p>
            </div>

            {/* Pass / Needs Practice Status Banner */}
            <div className="pt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold border ${
                  evaluationResult.isPassed
                    ? "bg-[#238636]/20 text-[#3FB950] border-[#3FB950]"
                    : "bg-[#D29922]/20 text-[#E3B341] border-[#D29922]"
                }`}
              >
                {evaluationResult.isPassed ? "PASSING SCORE ACHIEVED" : "NEEDS ADDITIONAL PRACTICE"}
                <span>({evaluationResult.percentage}%)</span>
              </span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* REQUIRED SCORECARD METRICS (As per Step 8 Specifications) */}
          {/* Total Questions, Attempted, Correct, Incorrect, Unattempted, Score, Accuracy, Time Used */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            {/* Total Questions */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#8B949E]">Total Questions</div>
              <div className="text-2xl font-bold text-[#F0F6FC] mt-1">
                {evaluationResult.totalQuestions}
              </div>
              <div className="text-[10px] text-[#6E7681] mt-0.5">Accenture format</div>
            </div>

            {/* Attempted */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#8B949E]">Attempted</div>
              <div className="text-2xl font-bold text-[#58A6FF] mt-1">
                {evaluationResult.attempted}
              </div>
              <div className="text-[10px] text-[#6E7681] mt-0.5">
                {Math.round((evaluationResult.attempted / evaluationResult.totalQuestions) * 100)}% coverage
              </div>
            </div>

            {/* Correct */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#3FB950]">Correct</div>
              <div className="text-2xl font-bold text-[#3FB950] mt-1">
                {evaluationResult.correct}
              </div>
              <div className="text-[10px] text-[#3FB950]/70 mt-0.5">
                +{evaluationResult.correct} marks
              </div>
            </div>

            {/* Incorrect */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#F85149]">Incorrect</div>
              <div className="text-2xl font-bold text-[#F85149] mt-1">
                {evaluationResult.incorrect}
              </div>
              <div className="text-[10px] text-[#F85149]/70 mt-0.5">0 marks</div>
            </div>

            {/* Unattempted */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#8B949E]">Unattempted</div>
              <div className="text-2xl font-bold text-[#8B949E] mt-1">
                {evaluationResult.unattempted}
              </div>
              <div className="text-[10px] text-[#6E7681] mt-0.5">Skipped questions</div>
            </div>

            {/* Score */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#8B949E]">Score</div>
              <div className="text-2xl font-bold text-[#F0F6FC] mt-1">
                {evaluationResult.score}{" "}
                <span className="text-sm font-normal text-[#8B949E]">
                  / {evaluationResult.totalQuestions}
                </span>
              </div>
              <div className="text-[10px] text-[#6E7681] mt-0.5">{evaluationResult.percentage}% overall</div>
            </div>

            {/* Accuracy */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#8B949E]">Accuracy</div>
              <div className="text-2xl font-bold text-[#58A6FF] mt-1">
                {evaluationResult.accuracy}%
              </div>
              <div className="text-[10px] text-[#6E7681] mt-0.5">Correct / Attempted</div>
            </div>

            {/* Time Used */}
            <div className="p-4 rounded border border-[#30363D] bg-[#161B22]">
              <div className="text-[11px] text-[#8B949E]">Time Used</div>
              <div className="text-2xl font-bold text-[#F0F6FC] mt-1">
                {evaluationResult.timeUsedFormatted}
              </div>
              <div className="text-[10px] text-[#6E7681] mt-0.5">
                of {durationMins}m allocated
              </div>
            </div>
          </div>

          {/* Topic / Category Breakdown Table */}
          <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#58A6FF]" />
              <span>Domain Performance Breakdown</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#30363D] text-[#8B949E] text-[11px]">
                    <th className="py-2 px-3">Topic / Category</th>
                    <th className="py-2 px-3 text-center">Questions</th>
                    <th className="py-2 px-3 text-center">Attempted</th>
                    <th className="py-2 px-3 text-center">Correct</th>
                    <th className="py-2 px-3 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/60">
                  {Object.entries(evaluationResult.categoryBreakdown).map(([cat, stat]) => (
                    <tr key={cat} className="hover:bg-[#21262D]/40">
                      <td className="py-2 px-3 text-[#F0F6FC] font-medium">{cat}</td>
                      <td className="py-2 px-3 text-center text-[#8B949E]">{stat.total}</td>
                      <td className="py-2 px-3 text-center text-[#8B949E]">{stat.attempted}</td>
                      <td className="py-2 px-3 text-center text-[#3FB950] font-semibold">
                        {stat.correct}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`font-semibold ${
                            stat.accuracy >= 70
                              ? "text-[#3FB950]"
                              : stat.accuracy >= 40
                              ? "text-[#D29922]"
                              : "text-[#F85149]"
                          }`}
                        >
                          {stat.accuracy}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons: Review Answers & Return */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setTestMode("REVIEW");
              }}
              className="flex-1 py-2.5 rounded bg-[#238636] hover:bg-[#2ea043] text-[#FFFFFF] font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review Answers (With Solutions & Explanations)</span>
            </button>
            <Link
              href={returnUrl}
              className="px-6 py-2.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium text-center transition-colors"
            >
              Back to Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: REVIEW ANSWERS MODE (After Test Submission)
  // =========================================================================
  if (testMode === "REVIEW" && evaluationResult && currentReviewQ) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D1117] text-[#F0F6FC] flex flex-col font-sans select-none overflow-hidden">
        {/* Review Top Header */}
        <header className="h-14 border-b border-[#30363D] bg-[#161B22] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTestMode("RESULTS")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] font-mono text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Scorecard</span>
            </button>
            <div className="h-4 w-[1px] bg-[#30363D] hidden sm:block" />
            <div className="font-mono text-xs font-bold text-[#58A6FF] flex items-center gap-2">
              <span>TEST REVIEW MODE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30">
                Q {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#0D1117] border border-[#30363D]">
              <span className="text-[#3FB950] font-semibold">
                {evaluationResult.correct} Correct
              </span>
              <span className="text-[#6E7681]">•</span>
              <span className="text-[#F85149] font-semibold">
                {evaluationResult.incorrect} Incorrect
              </span>
            </div>
            <button
              onClick={() => setIsNavigatorOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D]"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Navigator</span>
            </button>
          </div>
        </header>

        {/* Review Question Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6 my-auto">
            {/* Metadata row */}
            <div className="flex items-center justify-between border-b border-[#30363D]/80 pb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
                  Question {currentIndex + 1}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                  {currentReviewQ.category}
                </span>
                <DifficultyBadge difficulty={currentReviewQ.difficulty as any} />
              </div>

              {/* Status Pill */}
              <div>
                {currentReviewQ.isCorrect ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#238636]/20 text-[#3FB950] border border-[#3FB950] font-mono text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Correct (+1)</span>
                  </span>
                ) : currentReviewQ.isAttempted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DA3633]/20 text-[#F85149] border border-[#F85149] font-mono text-xs font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incorrect</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#30363D]/40 text-[#8B949E] border border-[#30363D] font-mono text-xs font-medium">
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Unattempted</span>
                  </span>
                )}
              </div>
            </div>

            {/* Question Stem */}
            <h2 className="text-base sm:text-lg font-medium text-[#F0F6FC] leading-relaxed">
              {currentReviewQ.stem}
            </h2>

            {/* Review Options */}
            <div className="space-y-3 pt-1">
              {(["A", "B", "C", "D"] as const).map((key) => {
                const optText = currentReviewQ.options[key];
                const isUserChoice = currentReviewQ.userSelectedKey === key;
                const isActualCorrect = currentReviewQ.correctKey === key;

                let cardStyle = "border-[#30363D]/60 bg-[#161B22]/60 text-[#8B949E]";
                let badgeStyle = "bg-[#21262D] text-[#8B949E] border-[#30363D]";
                let note = null;

                if (isActualCorrect) {
                  cardStyle = "border-[#3FB950] bg-[#238636]/15 text-[#3FB950] font-medium";
                  badgeStyle = "bg-[#3FB950] text-[#0D1117] border-[#3FB950] font-bold";
                  note = (
                    <span className="text-[11px] font-mono text-[#3FB950] font-semibold shrink-0">
                      ✓ Correct Answer
                    </span>
                  );
                } else if (isUserChoice && !isActualCorrect) {
                  cardStyle = "border-[#F85149] bg-[#DA3633]/15 text-[#F85149] font-medium";
                  badgeStyle = "bg-[#F85149] text-white border-[#F85149] font-bold";
                  note = (
                    <span className="text-[11px] font-mono text-[#F85149] font-semibold shrink-0">
                      ✕ Your Choice
                    </span>
                  );
                }

                return (
                  <div
                    key={key}
                    className={`p-3.5 sm:p-4 rounded-md border flex items-start gap-3.5 ${cardStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs shrink-0 border ${badgeStyle}`}
                    >
                      {key}
                    </span>
                    <span className="flex-1 text-xs sm:text-sm leading-relaxed pt-0.5">
                      {optText}
                    </span>
                    {note}
                  </div>
                );
              })}
            </div>

            {/* Explanation Section */}
            <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4 sm:p-5 space-y-2.5 font-sans">
              <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2 font-mono text-xs">
                <span className="text-[#58A6FF] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Technical Explanation</span>
                </span>
                <span className="text-[#8B949E]">
                  Answer: <strong className="text-[#3FB950]">Option {currentReviewQ.correctKey}</strong>
                </span>
              </div>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                {currentReviewQ.explanation}
              </p>
            </div>
          </div>
        </main>

        {/* Review Footer Navigation */}
        <footer className="h-16 border-t border-[#30363D] bg-[#161B22] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] disabled:opacity-40 text-[#F0F6FC] border border-[#30363D] font-mono text-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="font-mono text-xs text-[#8B949E]">
            Question {currentIndex + 1} of {questions.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] disabled:opacity-40 text-[#F0F6FC] border border-[#30363D] font-mono text-xs transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE TIMED TEST MODE
  // =========================================================================
  const isTimeCritical = timeRemaining <= 300; // Under 5 mins
  const isTimeUrgent = timeRemaining <= 60; // Under 1 min

  return (
    <div className="fixed inset-0 z-50 bg-[#0D1117] text-[#F0F6FC] flex flex-col font-sans select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* ACTIVE TEST TOP BAR */}
      {/* Example requirement: Q 7 / 30 \n 18:42 */}
      {/* ========================================================================= */}
      <header className="h-16 border-b border-[#30363D] bg-[#161B22] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Left: Test Title & Question Counter */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs tracking-wider text-[#F0F6FC]">
                ACCENTURE MOCK TEST
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#D29922]/15 text-[#E3B341] border border-[#D29922]/30 font-mono font-semibold">
                TIMED EXAM
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#8B949E] hidden sm:block">
              {testTitle}
            </div>
          </div>
        </div>

        {/* Center: Question Counter (Q 7 / 30) & Countdown Timer (18:42) */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono">
          {/* Question Index formatted as required: Q X / Total */}
          <div className="text-center">
            <div className="text-[10px] text-[#8B949E] uppercase tracking-wider">
              Question
            </div>
            <div className="text-sm sm:text-base font-bold text-[#F0F6FC]">
              Q {currentIndex + 1} / {questions.length}
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#30363D]" />

          {/* Countdown Timer (e.g. 18:42) */}
          <div className="text-center">
            <div className="text-[10px] text-[#8B949E] uppercase tracking-wider">
              Time Remaining
            </div>
            <div
              className={`text-sm sm:text-base font-bold flex items-center gap-1.5 justify-center ${
                isTimeUrgent
                  ? "text-[#F85149] animate-pulse"
                  : isTimeCritical
                  ? "text-[#E3B341]"
                  : "text-[#58A6FF]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatCountdown(timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Right: Question Navigator Trigger & Submit Test */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsNavigatorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs transition-colors cursor-pointer"
            title="Open Question Navigator Grid (Key: N)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span className="hidden sm:inline">Navigator</span>
          </button>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-mono text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* ACTIVE TEST MAIN WORKSPACE */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-6 my-auto">
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between border-b border-[#30363D]/80 pb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                {currentQ.category}
              </span>
              <DifficultyBadge difficulty={currentQ.difficulty as any} />
            </div>

            {/* Mark for Review Button */}
            <button
              onClick={toggleMarkForReview}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs transition-colors cursor-pointer ${
                isMarked
                  ? "bg-[#D29922]/20 text-[#E3B341] border-[#D29922]"
                  : "bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border-[#30363D] hover:bg-[#21262D]"
              }`}
              title="Mark for Review (Key: M)"
            >
              {isMarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#E3B341]" />
                  <span className="font-semibold text-[#E3B341]">Marked</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Mark for Review</span>
                </>
              )}
            </button>
          </div>

          {/* Question Stem */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-medium text-[#F0F6FC] leading-relaxed">
              {currentQ.stem}
            </h2>
          </div>

          {/* Four Interactive Options (A, B, C, D) */}
          {/* NOTE: Correct answers are NEVER revealed here during active test! */}
          <div className="space-y-3 pt-2">
            {(["A", "B", "C", "D"] as const).map((key) => {
              const optionText = currentQ.options[key];
              const isSelected = selectedOption === key;

              return (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-md border transition-all duration-150 flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? "border-[#58A6FF] bg-[#58A6FF]/15 text-[#F0F6FC] font-medium shadow-[0_0_12px_rgba(88,166,255,0.15)]"
                      : "border-[#30363D] bg-[#161B22] text-[#C9D1D9] hover:border-[#58A6FF]/60 hover:bg-[#21262D]/60"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs shrink-0 border transition-colors ${
                      isSelected
                        ? "bg-[#58A6FF] text-[#0D1117] border-[#58A6FF] font-bold"
                        : "bg-[#21262D] text-[#8B949E] border-[#30363D]"
                    }`}
                  >
                    {key}
                  </span>
                  <span className="flex-1 text-xs sm:text-sm leading-relaxed pt-0.5">
                    {optionText}
                  </span>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#58A6FF] mt-2 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Support Clear Response */}
          {selectedOption && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleClearResponse}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8B949E] hover:text-[#F85149] transition-colors py-1 px-2 rounded hover:bg-[#21262D]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Response</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* ACTIVE TEST BOTTOM NAVIGATION BAR */}
      {/* ========================================================================= */}
      <footer className="h-16 border-t border-[#30363D] bg-[#161B22] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] disabled:opacity-40 text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Center: Status indicators & shortcuts */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#8B949E]">
          <span className="hidden sm:inline text-[#6E7681]">
            Attempted: <strong className="text-[#58A6FF]">{attemptedCount}</strong> / {questions.length}
          </span>
          <span className="hidden sm:inline text-[#6E7681]">•</span>
          <span className="hidden sm:inline text-[#6E7681]">
            Marked: <strong className="text-[#E3B341]">{markedCount}</strong>
          </span>
        </div>

        {/* Right: Next / Submit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-[#FFFFFF] font-mono text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>Review & Submit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* QUESTION NAVIGATOR DRAWER */}
      {/* ========================================================================= */}
      {isNavigatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#161B22] border-l border-[#30363D] flex flex-col h-full shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#30363D] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#58A6FF]" />
                <h3 className="font-mono font-bold text-sm text-[#F0F6FC]">
                  Question Navigator
                </h3>
              </div>
              <button
                onClick={() => setIsNavigatorOpen(false)}
                className="p-1 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Counts */}
            <div className="p-4 border-b border-[#30363D] grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[10px] text-[#58A6FF]">Attempted</div>
                <div className="text-sm font-bold text-[#58A6FF]">{attemptedCount}</div>
              </div>
              <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[10px] text-[#8B949E]">Unattempted</div>
                <div className="text-sm font-bold text-[#F0F6FC]">{unattemptedCount}</div>
              </div>
              <div className="p-2 rounded bg-[#0D1117] border border-[#D29922]/30">
                <div className="text-[10px] text-[#E3B341]">Marked</div>
                <div className="text-sm font-bold text-[#E3B341]">{markedCount}</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-[#30363D] flex items-center gap-1 text-[11px] font-mono">
              {(["all", "attempted", "unattempted", "marked"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setNavigatorFilter(tab)}
                  className={`px-2 py-1 rounded transition-colors capitalize ${
                    navigatorFilter === tab
                      ? "bg-[#21262D] text-[#58A6FF] font-semibold border border-[#30363D]"
                      : "text-[#8B949E] hover:text-[#F0F6FC]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Grid of Pills */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const isAns = !!userAnswers[q.id];
                  const isCurrent = idx === currentIndex;
                  const isM = markedQuestions.has(q.id);

                  if (navigatorFilter === "attempted" && !isAns) return null;
                  if (navigatorFilter === "unattempted" && isAns) return null;
                  if (navigatorFilter === "marked" && !isM) return null;

                  let pillStyle = "bg-[#21262D] text-[#8B949E] border-[#30363D] hover:border-[#58A6FF]";

                  if (isAns) {
                    pillStyle = "bg-[#238636] text-[#FFFFFF] border-[#2ea043]";
                  }

                  if (isCurrent) {
                    pillStyle += " ring-2 ring-[#58A6FF] ring-offset-2 ring-offset-[#161B22]";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsNavigatorOpen(false);
                      }}
                      className={`relative h-10 rounded border font-mono text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${pillStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isM && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E3B341]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="p-3 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-around text-[10px] font-mono text-[#8B949E]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#238636]" /> Attempted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#E3B341]" /> Marked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#21262D] border border-[#30363D]" /> Unattempted
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMIT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D29922]/15 border border-[#D29922]/40 flex items-center justify-center text-[#E3B341]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-base text-[#F0F6FC]">
                  Submit Test?
                </h3>
                <p className="text-xs text-[#8B949E]">Are you sure you want to finish?</p>
              </div>
            </div>

            {/* Attempt summary */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded bg-[#0D1117] border border-[#30363D] text-center font-mono text-xs">
              <div>
                <div className="text-[10px] text-[#8B949E]">Attempted</div>
                <div className="text-base font-bold text-[#3FB950]">{attemptedCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8B949E]">Unattempted</div>
                <div className="text-base font-bold text-[#F85149]">{unattemptedCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8B949E]">Marked</div>
                <div className="text-base font-bold text-[#E3B341]">{markedCount}</div>
              </div>
            </div>

            {unattemptedCount > 0 && (
              <p className="text-xs text-[#D29922] font-mono">
                ⚠️ You have {unattemptedCount} unattempted question(s). Unattempted questions will be scored 0.
              </p>
            )}

            {submitError && (
              <p className="text-xs text-[#F85149] font-mono">{submitError}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={() => handleSubmitTest(false)}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <span>Yes, Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
