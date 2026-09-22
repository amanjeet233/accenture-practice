"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { McqQuestionItem } from "@/lib/mcqService";
import { DifficultyBadge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  X,
  Check,
  Filter,
  Award,
} from "lucide-react";

interface TopicOption {
  slug: string;
  name: string;
  id: string;
}

interface McqPracticeWorkspaceProps {
  initialQuestions: McqQuestionItem[];
  totalQuestions: number;
  currentPage: number;
  totalPages: number;
  allCategories: string[];
  topicOptions?: TopicOption[];
  selectedCategory?: string;
  returnUrl?: string;
}

interface AnswerState {
  selectedKey: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  timestamp: number;
}

export function McqPracticeWorkspace({
  initialQuestions,
  totalQuestions,
  currentPage,
  totalPages,
  allCategories,
  topicOptions = [],
  selectedCategory = "all",
  returnUrl = "/home/accenture",
}: McqPracticeWorkspaceProps) {
  const router = useRouter();

  // Category filtering state
  const [currentCategory, setCurrentCategory] = useState<string>(selectedCategory);

  // Questions are authoritative from server - never fall back to global dataset
  const questions = initialQuestions;

  // Active question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User answers keyed by question ID
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  // Marked for review set of question IDs
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());

  // Reset answer states and index when topic / initialQuestions changes
  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setMarkedQuestions(new Set());
    setSecondsElapsed(0);
    setCurrentCategory(selectedCategory);
  }, [initialQuestions, selectedCategory]);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Completion modal state
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Mobile navigator visibility
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = !!currentAnswer;
  const isMarked = currentQ ? markedQuestions.has(currentQ.id) : false;

  // Ref for scrolling navigator to current question
  const navigatorRef = useRef<HTMLDivElement>(null);
  const currentBtnRef = useRef<HTMLButtonElement>(null);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-scroll navigator to current question
  useEffect(() => {
    if (currentBtnRef.current) {
      currentBtnRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentIndex]);

  // Option selection handler
  const handleSelectOption = useCallback(
    (key: "A" | "B" | "C" | "D") => {
      if (!currentQ) return;
      if (answers[currentQ.id]) return;

      const isCorrect = key === currentQ.correctKey;
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          selectedKey: key,
          isCorrect,
          timestamp: Date.now(),
        },
      }));
    },
    [currentQ, answers]
  );

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (currentPage < totalPages) {
      const topicQuery = selectedCategory === "all" ? "" : `?topic=${encodeURIComponent(selectedCategory)}`;
      const separator = topicQuery ? "&" : "?";
      router.push(`/accenture/mcq/practice${topicQuery}${separator}page=${currentPage + 1}`);
    } else {
      setShowSummaryModal(true);
    }
  }, [currentIndex, questions.length, currentPage, totalPages, selectedCategory, router]);

  const toggleMarkForReview = useCallback(() => {
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
  }, [currentQ]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
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
      } else if (["1", "a", "A"].includes(e.key)) {
        handleSelectOption("A");
      } else if (["2", "b", "B"].includes(e.key)) {
        handleSelectOption("B");
      } else if (["3", "c", "C"].includes(e.key)) {
        handleSelectOption("C");
      } else if (["4", "d", "D"].includes(e.key)) {
        handleSelectOption("D");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, toggleMarkForReview, handleSelectOption]);

  // Handle empty question set
  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D1117] text-[#F0F6FC] flex flex-col font-sans select-none items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4 font-mono">
          <div className="w-12 h-12 rounded-full bg-[#21262D] border border-[#30363D] flex items-center justify-center mx-auto text-[#8B949E]">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#F0F6FC]">No questions found</h2>
          <p className="text-xs text-[#8B949E]">
            There are currently no MCQs available in the database for this topic.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href={returnUrl}
              className="px-3 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] border border-[#30363D] text-xs"
            >
              ← Back to Module
            </Link>
            <Link
              href="/accenture/mcq/practice"
              className="px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold"
            >
              Browse All MCQs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Statistics
  const answeredList = Object.values(answers);
  const correctCount = answeredList.filter((a) => a.isCorrect).length;
  const incorrectCount = answeredList.filter((a) => !a.isCorrect).length;
  const markedCount = markedQuestions.size;
  const accuracyPct =
    answeredList.length > 0 ? Math.round((correctCount / answeredList.length) * 100) : 0;

  // Get navigator pill style for a question
  const getNavPillStyle = (q: McqQuestionItem, idx: number) => {
    const ans = answers[q.id];
    const isCurrent = idx === currentIndex;
    const marked = markedQuestions.has(q.id);

    let bg = "bg-[#21262D] text-[#6E7681] border-[#30363D]";
    let icon = null;

    if (ans) {
      if (ans.isCorrect) {
        bg = "bg-[#238636]/20 text-[#3FB950] border-[#3FB950]/50";
        icon = <Check className="w-2.5 h-2.5" />;
      } else {
        bg = "bg-[#DA3633]/20 text-[#F85149] border-[#F85149]/50";
        icon = <X className="w-2.5 h-2.5" />;
      }
    }

    if (marked && !ans) {
      bg = "bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/50";
    }

    const ring = isCurrent ? "ring-2 ring-[#58A6FF] ring-offset-1 ring-offset-[#0D1117]" : "";

    return { bg, icon, ring, marked };
  };

  return (
    <div className="fixed inset-0 z-50 min-w-0 bg-[#0D1117] text-[#F0F6FC] flex flex-col font-sans select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* TOP HEADER BAR */}
      {/* ========================================================================= */}
      <header className="h-14 border-b border-[#30363D] bg-[#161B22]/95 backdrop-blur px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Exit + Brand */}
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          <Link
            href={returnUrl}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] font-mono text-[11px] transition-colors"
            title="Exit Practice Mode"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Exit</span>
          </Link>

          <div className="h-4 w-[1px] bg-[#30363D] hidden sm:block" />

          <span className="truncate font-mono font-bold text-[11px] tracking-wider text-[#F0F6FC] hidden sm:inline">
            ACCENTURE PRACTICE
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30 font-mono font-semibold">
            MCQ
          </span>
        </div>

        {/* Center: Topic + Progress */}
        <div className="min-w-0 flex items-center justify-center gap-2">
          {/* Category Selector */}
          <div className="hidden md:flex items-center gap-1 bg-[#0D1117] border border-[#30363D] rounded px-2 py-0.5 text-[11px] font-mono">
            <Filter className="w-3 h-3 text-[#8B949E]" />
            <select
              value={currentCategory}
              onChange={(e) => {
                const val = e.target.value;
                setCurrentCategory(val);
                if (val === "all") {
                  router.push("/accenture/mcq/practice");
                } else {
                  router.push(`/accenture/mcq/practice?topic=${encodeURIComponent(val)}`);
                }
              }}
              className="bg-transparent text-[#C9D1D9] focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="all" className="bg-[#161B22] text-[#F0F6FC]">
                All Topics
              </option>
              {topicOptions && topicOptions.length > 0
                ? topicOptions.map((opt) => (
                    <option key={opt.slug} value={opt.slug} className="bg-[#161B22] text-[#F0F6FC]">
                      {opt.name}
                    </option>
                  ))
                : allCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#161B22] text-[#F0F6FC]">
                      {cat}
                    </option>
                  ))}
            </select>
          </div>

          {/* Question Counter */}
          <div className="whitespace-nowrap font-mono text-[11px] text-[#8B949E] bg-[#0D1117] px-2 py-1 rounded border border-[#30363D]">
            Q <span className="text-[#F0F6FC] font-semibold">{currentQ.questionNumber}</span>
            <span className="text-[#6E7681]">/{totalQuestions}</span>
            <span className="ml-1 text-[#6E7681]">(page {currentPage}/{totalPages})</span>
          </div>
        </div>

        {/* Right: Timer, Score, Fullscreen */}
        <div className="shrink-0 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[11px] font-mono text-[#8B949E]">
            <Clock className="w-3 h-3 text-[#58A6FF]" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          {answeredList.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[11px] font-mono">
              <span className="text-[#3FB950] font-semibold">{correctCount}✓</span>
              <span className="text-[#F85149] font-semibold">{incorrectCount}✕</span>
            </div>
          )}

          {/* Mobile navigator toggle */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] border border-[#30363D] text-[11px] font-mono transition-colors"
          >
            <span>Nav</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3-PANEL MAIN BODY */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 grid overflow-hidden lg:grid-cols-[minmax(320px,1.05fr)_minmax(360px,1fr)_220px] xl:grid-cols-[minmax(380px,1.1fr)_minmax(420px,1fr)_220px]">
        {/* ─── LEFT PANEL: QUESTION ─── */}
        <div className="hidden min-w-0 lg:flex flex-col border-r border-[#30363D] overflow-y-auto">
          <div className="p-5 xl:p-7 space-y-5 flex-1">
            {/* Question Number + Meta */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
                  Question {currentQ.questionNumber}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D] uppercase">
                  {currentQ.category}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={currentQ.difficulty as any} />
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#6E7681] border border-[#30363D]">
                  {currentQ.sourceType}
                </span>
              </div>
            </div>

            {/* Mark for Review */}
            <button
              onClick={toggleMarkForReview}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs transition-colors ${
                isMarked
                  ? "bg-[#D29922]/20 text-[#E3B341] border-[#D29922]"
                  : "bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border-[#30363D] hover:bg-[#21262D]"
              }`}
              title="Mark / Unmark for Review (Key: M)"
            >
              {isMarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#E3B341]" />
                  <span className="font-semibold text-[#E3B341]">Marked for Review</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Mark for Review</span>
                </>
              )}
            </button>

            {/* Question Stem */}
            <div className="space-y-3">
              <h2 className="max-w-3xl text-lg xl:text-xl font-medium text-[#F0F6FC] leading-[1.5] tracking-normal font-sans">
                {currentQ.stem}
              </h2>
              {currentQ.importanceReason && (
                <p className="text-xs text-[#8B949E] font-mono border-l-2 border-[#58A6FF]/40 pl-3">
                  {currentQ.importanceReason}
                </p>
              )}
            </div>

            {/* Explanation (shown after answering, in left panel to keep options clean) */}
            {isAnswered && (
              <div className="space-y-3 pt-3 border-t border-[#30363D]/80">
                {currentAnswer!.isCorrect ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-[#238636]/15 border border-[#3FB950] text-[#3FB950] font-mono text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">✓ Correct Answer</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-[#DA3633]/15 border border-[#F85149] text-[#F85149] font-mono text-xs">
                    <XCircle className="w-4 h-4" />
                    <span className="font-bold">✕ Incorrect — Expected: Option {currentQ.correctKey}</span>
                  </div>
                )}

                {/* Explanation Card */}
                <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#58A6FF]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explanation</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#8B949E]">
                      Correct:{" "}
                      <strong className="text-[#3FB950]">
                        Option {currentQ.correctKey}
                      </strong>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#0D1117] border border-[#30363D] text-xs font-mono text-[#C9D1D9]">
                    <span className="text-[#8B949E] mr-1.5">{currentQ.correctKey}:</span>
                    <span className="text-[#F0F6FC] font-medium">
                      {currentQ.options[currentQ.correctKey]}
                    </span>
                  </div>

                  <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── CENTER PANEL: OPTIONS + CONTROLS ─── */}
        <div className="min-w-0 flex min-h-0 flex-col overflow-y-auto">
          <div className="p-4 sm:p-5 xl:p-7 space-y-4 flex-1">
            {/* Mobile-only: Question stem (shown above options on mobile/tablet where left panel is hidden) */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
                  Question {currentQ.questionNumber}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D] uppercase">
                  {currentQ.category}
                </span>
                <DifficultyBadge difficulty={currentQ.difficulty as any} />
              </div>

              <h2 className="text-sm sm:text-base font-medium text-[#F0F6FC] leading-relaxed">
                {currentQ.stem}
              </h2>

              {/* Mobile Mark for Review */}
              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-2 py-1 rounded border font-mono text-[11px] transition-colors ${
                  isMarked
                    ? "bg-[#D29922]/20 text-[#E3B341] border-[#D29922]"
                    : "bg-[#161B22] text-[#8B949E] border-[#30363D]"
                }`}
              >
                {isMarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                <span>{isMarked ? "Marked" : "Mark"}</span>
              </button>
            </div>

            {/* ANSWER heading */}
            <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
              <h3 className="font-mono text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider">
                Answer options
              </h3>
              <span className="text-[10px] font-mono text-[#6E7681]">Choose one response</span>
            </div>

            {/* Four Clickable Options */}
            <div className="space-y-2.5">
              {(["A", "B", "C", "D"] as const).map((key) => {
                const optionText = currentQ.options[key];
                const isSelected = currentAnswer?.selectedKey === key;
                const isOptionCorrect = currentQ.correctKey === key;

                let cardStyle = "border-[#30363D] bg-[#161B22] text-[#F0F6FC] hover:border-[#58A6FF]/60 hover:bg-[#21262D]/60";
                let badgeStyle = "bg-[#21262D] text-[#8B949E] border-[#30363D]";
                let statusIcon = null;

                if (isAnswered) {
                  if (isSelected && isOptionCorrect) {
                    cardStyle = "border-[#3FB950] bg-[#238636]/15 text-[#3FB950] font-medium shadow-[0_0_12px_rgba(63,185,80,0.12)]";
                    badgeStyle = "bg-[#3FB950] text-[#0D1117] border-[#3FB950] font-bold";
                    statusIcon = <Check className="w-4 h-4 text-[#3FB950] shrink-0" />;
                  } else if (isSelected && !isOptionCorrect) {
                    cardStyle = "border-[#F85149] bg-[#DA3633]/15 text-[#F85149] font-medium shadow-[0_0_12px_rgba(248,81,73,0.12)]";
                    badgeStyle = "bg-[#F85149] text-[#FFFFFF] border-[#F85149] font-bold";
                    statusIcon = <X className="w-4 h-4 text-[#F85149] shrink-0" />;
                  } else if (isOptionCorrect) {
                    cardStyle = "border-[#3FB950] bg-[#238636]/10 text-[#3FB950] font-medium border-dashed";
                    badgeStyle = "bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950] font-bold";
                    statusIcon = <Check className="w-4 h-4 text-[#3FB950] shrink-0" />;
                  } else {
                    cardStyle = "border-[#30363D]/50 bg-[#161B22]/40 text-[#6E7681]";
                    badgeStyle = "bg-[#21262D]/50 text-[#6E7681] border-[#30363D]/40";
                  }
                }

                return (
                  <button
                    key={key}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(key)}
                    aria-label={`Option ${key}: ${optionText}`}
                    aria-pressed={isSelected}
                    className={`w-full min-w-0 text-left p-3.5 sm:p-4 rounded-md border transition-colors duration-150 flex items-start gap-3 group cursor-pointer disabled:cursor-default ${cardStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs shrink-0 border transition-colors ${badgeStyle}`}
                    >
                      {key}
                    </span>
                    <span className="flex-1 text-xs sm:text-sm leading-relaxed pt-0.5">
                      {optionText}
                    </span>
                    {statusIcon}
                  </button>
                );
              })}
            </div>

            {/* Mobile-only: Feedback + Explanation (below options) */}
            {isAnswered && (
              <div className="lg:hidden space-y-3 pt-3 border-t border-[#30363D]/80">
                {currentAnswer!.isCorrect ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-[#238636]/15 border border-[#3FB950] text-[#3FB950] font-mono text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">✓ Correct</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-[#DA3633]/15 border border-[#F85149] text-[#F85149] font-mono text-xs">
                    <XCircle className="w-4 h-4" />
                    <span className="font-bold">✕ Expected: {currentQ.correctKey}</span>
                  </div>
                )}

                <div className="rounded-md border border-[#30363D] bg-[#161B22] p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#58A6FF]">
                    <Sparkles className="w-3 h-3" />
                    <span>Explanation</span>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── COMPACT FOOTER NAV (inside center panel) ─── */}
          <div className="h-12 border-t border-[#30363D] bg-[#161B22] px-4 sm:px-5 flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] disabled:opacity-40 disabled:hover:bg-[#21262D] text-[#F0F6FC] border border-[#30363D] font-mono text-[11px] font-medium transition-colors disabled:cursor-not-allowed"
              title="Previous (←)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex-1" />

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-[#FFFFFF] font-mono text-[11px] font-semibold shadow-sm transition-colors"
              title="Next (→)"
            >
              <span>
                {currentIndex === questions.length - 1
                  ? currentPage < totalPages
                    ? "Next Page"
                    : "Finish"
                  : "Next"}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── RIGHT PANEL: VERTICAL TINY RAIL NODE STEPPER NAVIGATOR ─── */}
        <aside aria-label="Question timeline" className="hidden min-h-0 overflow-y-auto border-l border-[#30363D] bg-[#0D1117] px-2 py-3 lg:block w-14 shrink-0">
          <div className="relative mx-auto w-8 before:absolute before:left-1/2 before:top-3 before:bottom-3 before:w-px before:-translate-x-1/2 before:bg-[#30363D]">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const ansState = answers[q.id];
              const isAns = Boolean(ansState);
              const isM = markedQuestions.has(q.id);

              let nodeClass = "bg-[#21262D] text-[#8B949E] border-[#30363D]";
              if (isAns) {
                nodeClass = ansState.isCorrect
                  ? "bg-[#238636] text-white border-[#3FB950]"
                  : "bg-[#DA3633] text-white border-[#F85149]";
              } else if (isM) {
                nodeClass = "bg-[#D29922] text-[#0D1117] border-[#E3B341]";
              }

              return (
                <div key={q.id} className="relative z-10 flex justify-center pb-2">
                  <button
                    ref={isCurrent ? currentBtnRef : null}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Question ${idx + 1}`}
                    aria-current={isCurrent ? "step" : undefined}
                    title={`Question ${idx + 1}${isAns ? (ansState.isCorrect ? " (Correct)" : " (Incorrect)") : isM ? " (Marked)" : ""}`}
                    className={`h-7 w-7 rounded-full border font-mono text-[10px] font-bold transition-all flex items-center justify-center ${nodeClass} ${
                      isCurrent
                        ? "ring-2 ring-[#58A6FF] ring-offset-2 ring-offset-[#0D1117] scale-110"
                        : "hover:border-[#58A6FF]"
                    }`}
                  >
                    {idx + 1}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE NAVIGATOR (bottom sheet) */}
      {/* ========================================================================= */}
      {showMobileNav && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div
            className="bg-[#161B22] border-t border-[#30363D] rounded-t-xl max-h-[60vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Nav Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363D] shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-xs text-[#F0F6FC]">Question Navigator</h3>
                <span className="text-[10px] font-mono text-[#6E7681]">
                  {answeredList.length}/{questions.length}
                </span>
              </div>
              <button
                onClick={() => setShowMobileNav(false)}
                className="p-1 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Nav Stats */}
            <div className="px-4 py-2 grid grid-cols-4 gap-2 text-center font-mono border-b border-[#30363D] shrink-0">
              <div className="p-1.5 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[9px] text-[#8B949E]">Total</div>
                <div className="text-xs font-bold text-[#F0F6FC]">{questions.length}</div>
              </div>
              <div className="p-1.5 rounded bg-[#0D1117] border border-[#3FB950]/30">
                <div className="text-[9px] text-[#3FB950]">Correct</div>
                <div className="text-xs font-bold text-[#3FB950]">{correctCount}</div>
              </div>
              <div className="p-1.5 rounded bg-[#0D1117] border border-[#F85149]/30">
                <div className="text-[9px] text-[#F85149]">Wrong</div>
                <div className="text-xs font-bold text-[#F85149]">{incorrectCount}</div>
              </div>
              <div className="p-1.5 rounded bg-[#0D1117] border border-[#D29922]/30">
                <div className="text-[9px] text-[#E3B341]">Marked</div>
                <div className="text-xs font-bold text-[#E3B341]">{markedCount}</div>
              </div>
            </div>

            {/* Mobile Nav Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {questions.map((q, idx) => {
                  const { bg, icon, ring, marked } = getNavPillStyle(q, idx);

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowMobileNav(false);
                      }}
                      className={`relative h-10 rounded border font-mono text-xs font-semibold flex items-center justify-center transition-all ${bg} ${ring} hover:opacity-90`}
                    >
                      <span>{idx + 1}</span>
                      {icon && <span className="absolute -top-0.5 -right-0.5">{icon}</span>}
                      {marked && !answers[q.id] && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E3B341]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SESSION SUMMARY MODAL */}
      {/* ========================================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#58A6FF]/15 border border-[#58A6FF]/40 flex items-center justify-center text-[#58A6FF]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-base text-[#F0F6FC]">
                  Practice Session Completed
                </h3>
                <p className="text-xs text-[#8B949E]">Accenture MCQ Preparation</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Total Answered</div>
                <div className="text-lg font-bold text-[#F0F6FC] mt-0.5">
                  {answeredList.length} / {questions.length}
                </div>
              </div>
              <div className="p-3 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Accuracy</div>
                <div className="text-lg font-bold text-[#3FB950] mt-0.5">
                  {accuracyPct}%
                </div>
              </div>
              <div className="p-3 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Correct Answers</div>
                <div className="text-lg font-bold text-[#3FB950] mt-0.5">
                  {correctCount}
                </div>
              </div>
              <div className="p-3 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Time Spent</div>
                <div className="text-lg font-bold text-[#58A6FF] mt-0.5">
                  {formatTime(secondsElapsed)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-2 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-colors"
              >
                Review Questions
              </button>
              <Link
                href={returnUrl}
                className="flex-1 py-2 rounded bg-[#238636] hover:bg-[#2ea043] text-[#FFFFFF] font-mono text-xs font-semibold text-center transition-colors"
              >
                Return to Hub
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
