"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { McqQuestionItem } from "@/lib/mcqService";
import { DifficultyBadge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutGrid,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Info,
  X,
  Check,
  Filter,
  Share2,
  Award,
} from "lucide-react";

interface McqPracticeWorkspaceProps {
  initialQuestions: McqQuestionItem[];
  allCategories: string[];
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
  allCategories,
  selectedCategory = "all",
  returnUrl = "/accenture/mcq",
}: McqPracticeWorkspaceProps) {
  const router = useRouter();

  // Category filtering state
  const [currentCategory, setCurrentCategory] = useState<string>(selectedCategory);

  const filteredQuestions = useMemo(() => {
    if (currentCategory === "all") return initialQuestions;
    return initialQuestions.filter(
      (q) => q.category.toLowerCase() === currentCategory.toLowerCase()
    );
  }, [initialQuestions, currentCategory]);

  const questions = filteredQuestions.length > 0 ? filteredQuestions : initialQuestions;

  // Active question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User answers keyed by question ID
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  // Marked for review set of question IDs
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());

  // Navigator drawer state
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [navigatorFilter, setNavigatorFilter] = useState<"all" | "answered" | "unanswered" | "marked">("all");

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Completion modal state
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = !!currentAnswer;
  const isMarked = currentQ ? markedQuestions.has(currentQ.id) : false;

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

  // Option selection handler
  const handleSelectOption = useCallback(
    (key: "A" | "B" | "C" | "D") => {
      if (!currentQ) return;
      // Allow only once or allow re-clicking? Prompt: "When user clicks an answer: Immediately show: ✓ Correct Answer or ✕ Incorrect Answer. Then show: Correct answer, Explanation. Practice mode may reveal the answer immediately after selection. Do not reveal the answer before selection."
      // If already answered, keep choice
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
    } else {
      setShowSummaryModal(true);
    }
  }, [currentIndex, questions.length]);

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
      // Don't trigger if input or textarea focused
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

  // Statistics
  const answeredList = Object.values(answers);
  const correctCount = answeredList.filter((a) => a.isCorrect).length;
  const incorrectCount = answeredList.filter((a) => !a.isCorrect).length;
  const markedCount = markedQuestions.size;
  const accuracyPct =
    answeredList.length > 0 ? Math.round((correctCount / answeredList.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0D1117] text-[#F0F6FC] flex flex-col font-sans select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR (Minimalist, Large Workspace, No Distractions) */}
      {/* ========================================================================= */}
      <header className="h-14 border-b border-[#30363D] bg-[#161B22]/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Left: Exit Link & Brand Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={returnUrl}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] font-mono text-xs transition-colors"
            title="Exit Practice Mode"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </Link>

          <div className="h-4 w-[1px] bg-[#30363D] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs tracking-wider text-[#F0F6FC]">
                ACCENTURE PRACTICE
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30 font-mono font-semibold">
                MCQ
              </span>
            </div>
          </div>
        </div>

        {/* Center: Category Filter & Progress Indicator */}
        <div className="flex items-center gap-3">
          {/* Category Selector Dropdown */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] rounded px-2 py-1 text-xs font-mono">
            <Filter className="w-3 h-3 text-[#8B949E]" />
            <select
              value={currentCategory}
              onChange={(e) => {
                setCurrentCategory(e.target.value);
                setCurrentIndex(0);
              }}
              className="bg-transparent text-[#C9D1D9] focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#161B22] text-[#F0F6FC]">
                All Topics ({initialQuestions.length})
              </option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#161B22] text-[#F0F6FC]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Question Index Counter */}
          <div className="font-mono text-xs text-[#8B949E] bg-[#0D1117] px-2.5 py-1 rounded border border-[#30363D]">
            <span className="text-[#F0F6FC] font-semibold">{currentIndex + 1}</span>
            <span className="text-[#6E7681]"> / {questions.length}</span>
          </div>
        </div>

        {/* Right: Live Timer, Quick Score, Navigator Trigger, Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Timer */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-xs font-mono text-[#8B949E]">
            <Clock className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          {/* Quick Accuracy Score */}
          {answeredList.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-xs font-mono">
              <span className="text-[#3FB950] font-semibold">{correctCount}✓</span>
              <span className="text-[#F85149] font-semibold">{incorrectCount}✕</span>
              <span className="text-[#8B949E] text-[10px]">({accuracyPct}%)</span>
            </div>
          )}

          {/* Question Navigator Drawer Button */}
          <button
            onClick={() => setIsNavigatorOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-medium transition-colors ${
              isNavigatorOpen
                ? "bg-[#58A6FF]/20 text-[#58A6FF] border-[#58A6FF]"
                : "bg-[#21262D] text-[#F0F6FC] hover:bg-[#30363D] border-[#30363D]"
            }`}
            title="Toggle Question Navigator Grid (Key: N)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Navigator</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] transition-colors"
            title="Toggle Fullscreen Workspace"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (Large, Centered, Distraction-Free Layout) */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-6 my-auto">
          {/* Top Question Metadata Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-[#30363D]/80 pb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Question Number Badge */}
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30">
                Question {currentIndex + 1}
              </span>

              {/* Category */}
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                {currentQ.category}
              </span>

              {/* Difficulty */}
              <DifficultyBadge difficulty={currentQ.difficulty as any} />

              {/* Source Classification */}
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#6E7681] border border-[#30363D]">
                {currentQ.sourceType}
              </span>
            </div>

            {/* Mark for Review Button */}
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

          {/* Question Stem / Statement */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-[#F0F6FC] leading-relaxed tracking-normal font-sans">
              {currentQ.stem}
            </h2>
            {currentQ.importanceReason && (
              <p className="text-xs text-[#8B949E] font-mono border-l-2 border-[#58A6FF]/40 pl-3">
                {currentQ.importanceReason}
              </p>
            )}
          </div>

          {/* Four Clickable Options (A, B, C, D) */}
          <div className="space-y-3 pt-2">
            {(["A", "B", "C", "D"] as const).map((key) => {
              const optionText = currentQ.options[key];
              const isSelected = currentAnswer?.selectedKey === key;
              const isOptionCorrect = currentQ.correctKey === key;

              // Styling logic:
              // BEFORE user selection: neutral cards with clean hover effects
              // AFTER user selection:
              // - If this option was selected and is correct -> Vibrant Green
              // - If this option was selected and is incorrect -> Vibrant Red
              // - If this option is the actual correct answer (and user picked something else) -> Highlighted Green
              let cardStyle = "border-[#30363D] bg-[#161B22] text-[#F0F6FC] hover:border-[#58A6FF]/60 hover:bg-[#21262D]/60";
              let badgeStyle = "bg-[#21262D] text-[#8B949E] border-[#30363D]";
              let statusIcon = null;

              if (isAnswered) {
                if (isSelected && isOptionCorrect) {
                  // User picked correctly
                  cardStyle = "border-[#3FB950] bg-[#238636]/15 text-[#3FB950] font-medium shadow-[0_0_15px_rgba(63,185,80,0.15)]";
                  badgeStyle = "bg-[#3FB950] text-[#0D1117] border-[#3FB950] font-bold";
                  statusIcon = <Check className="w-4 h-4 text-[#3FB950] shrink-0" />;
                } else if (isSelected && !isOptionCorrect) {
                  // User picked incorrectly
                  cardStyle = "border-[#F85149] bg-[#DA3633]/15 text-[#F85149] font-medium shadow-[0_0_15px_rgba(248,81,73,0.15)]";
                  badgeStyle = "bg-[#F85149] text-[#FFFFFF] border-[#F85149] font-bold";
                  statusIcon = <X className="w-4 h-4 text-[#F85149] shrink-0" />;
                } else if (isOptionCorrect) {
                  // Reveal correct answer when user was incorrect
                  cardStyle = "border-[#3FB950] bg-[#238636]/10 text-[#3FB950] font-medium border-dashed";
                  badgeStyle = "bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950] font-bold";
                  statusIcon = <Check className="w-4 h-4 text-[#3FB950] shrink-0" />;
                } else {
                  // Other neutral options after answer
                  cardStyle = "border-[#30363D]/50 bg-[#161B22]/40 text-[#6E7681]";
                  badgeStyle = "bg-[#21262D]/50 text-[#6E7681] border-[#30363D]/40";
                }
              }

              return (
                <button
                  key={key}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-md border transition-all duration-150 flex items-start gap-3.5 group cursor-pointer disabled:cursor-default ${cardStyle}`}
                >
                  {/* Option Letter Badge */}
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs shrink-0 border transition-colors ${badgeStyle}`}
                  >
                    {key}
                  </span>

                  {/* Option Text */}
                  <span className="flex-1 text-xs sm:text-sm leading-relaxed pt-0.5">
                    {optionText}
                  </span>

                  {/* Status Indicator Icon if answered */}
                  {statusIcon}
                </button>
              );
            })}
          </div>

          {/* ======================================================================= */}
          {/* IMMEDIATE FEEDBACK & EXPLANATION (Revealed Only After User Selection) */}
          {/* ======================================================================= */}
          {isAnswered && (
            <div className="space-y-4 pt-4 border-t border-[#30363D]/80 animate-in fade-in duration-200">
              {/* Correct / Incorrect Banner */}
              {currentAnswer.isCorrect ? (
                <div className="flex items-center justify-between p-3.5 rounded-md bg-[#238636]/15 border border-[#3FB950] text-[#3FB950] font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />
                    <span className="font-bold text-sm">✓ Correct Answer</span>
                  </div>
                  <span className="text-[11px] text-[#3FB950]/80">Well done!</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-md bg-[#DA3633]/15 border border-[#F85149] text-[#F85149] font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-[#F85149]" />
                    <span className="font-bold text-sm">✕ Incorrect Answer</span>
                  </div>
                  <span className="text-[11px] text-[#F85149]/80">
                    Expected: Option {currentQ.correctKey}
                  </span>
                </div>
              )}

              {/* Explanation Card */}
              <div className="rounded-md border border-[#30363D] bg-[#161B22] p-4 sm:p-5 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#58A6FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explanation & Solution</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#8B949E]">
                    Correct:{" "}
                    <strong className="text-[#3FB950]">
                      Option {currentQ.correctKey}
                    </strong>
                  </div>
                </div>

                {/* Correct Answer Quote */}
                <div className="p-2.5 rounded bg-[#0D1117] border border-[#30363D] text-xs font-mono text-[#C9D1D9]">
                  <span className="text-[#8B949E] mr-2">Option {currentQ.correctKey}:</span>
                  <span className="text-[#F0F6FC] font-medium">
                    {currentQ.options[currentQ.correctKey]}
                  </span>
                </div>

                {/* Conceptual Explanation Markdown text */}
                <div className="text-xs text-[#8B949E] leading-relaxed space-y-2 pt-1 font-sans">
                  <p>{currentQ.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM CONTROL BAR (Previous, Next, Mark for Review, Keyboard Hints) */}
      {/* ========================================================================= */}
      <footer className="h-16 border-t border-[#30363D] bg-[#161B22] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Left: Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] disabled:opacity-40 disabled:hover:bg-[#21262D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Previous Question (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Center: Keyboard Shortcuts Legend */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-[#6E7681]">
          <span>
            <kbd className="px-1.5 py-0.5 bg-[#0D1117] border border-[#30363D] rounded text-[#8B949E]">
              1-4
            </kbd>{" "}
            Select
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-[#0D1117] border border-[#30363D] rounded text-[#8B949E]">
              ←
            </kbd>{" "}
            Prev
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-[#0D1117] border border-[#30363D] rounded text-[#8B949E]">
              →
            </kbd>{" "}
            Next
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-[#0D1117] border border-[#30363D] rounded text-[#8B949E]">
              M
            </kbd>{" "}
            Review
          </span>
        </div>

        {/* Right: Mark for Review & Next Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleMarkForReview}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded border font-mono text-xs transition-colors ${
              isMarked
                ? "bg-[#D29922]/20 text-[#E3B341] border-[#D29922]"
                : "bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] border-[#30363D]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isMarked ? "Marked" : "Mark"}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-[#FFFFFF] font-mono text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Next Question (Right Arrow)"
          >
            <span>
              {currentIndex === questions.length - 1 ? "Finish Session" : "Next"}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 4. QUESTION NAVIGATOR (Slide-over Drawer / Grid Modal) */}
      {/* ========================================================================= */}
      {isNavigatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#161B22] border-l border-[#30363D] flex flex-col h-full shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#30363D] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#58A6FF]" />
                <h3 className="font-mono font-bold text-sm text-[#F0F6FC]">
                  Question Navigator
                </h3>
              </div>
              <button
                onClick={() => setIsNavigatorOpen(false)}
                className="p-1 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Statistics Summary */}
            <div className="p-4 border-b border-[#30363D] grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                <div className="text-[10px] text-[#8B949E]">Total</div>
                <div className="text-sm font-bold text-[#F0F6FC]">{questions.length}</div>
              </div>
              <div className="p-2 rounded bg-[#0D1117] border border-[#3FB950]/30">
                <div className="text-[10px] text-[#3FB950]">Correct</div>
                <div className="text-sm font-bold text-[#3FB950]">{correctCount}</div>
              </div>
              <div className="p-2 rounded bg-[#0D1117] border border-[#F85149]/30">
                <div className="text-[10px] text-[#F85149]">Wrong</div>
                <div className="text-sm font-bold text-[#F85149]">{incorrectCount}</div>
              </div>
              <div className="p-2 rounded bg-[#0D1117] border border-[#D29922]/30">
                <div className="text-[10px] text-[#E3B341]">Marked</div>
                <div className="text-sm font-bold text-[#E3B341]">{markedCount}</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-[#30363D] flex items-center gap-1 text-[11px] font-mono overflow-x-auto">
              {(["all", "answered", "unanswered", "marked"] as const).map((tab) => (
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

            {/* Question Pills Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isCurrent = idx === currentIndex;
                  const marked = markedQuestions.has(q.id);

                  // Filter logic
                  if (navigatorFilter === "answered" && !ans) return null;
                  if (navigatorFilter === "unanswered" && ans) return null;
                  if (navigatorFilter === "marked" && !marked) return null;

                  let pillStyle = "bg-[#21262D] text-[#8B949E] border-[#30363D] hover:border-[#58A6FF]";

                  if (ans) {
                    if (ans.isCorrect) {
                      pillStyle = "bg-[#238636] text-[#FFFFFF] border-[#2ea043]";
                    } else {
                      pillStyle = "bg-[#DA3633] text-[#FFFFFF] border-[#f85149]";
                    }
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
                      className={`relative h-10 rounded border font-mono text-xs font-semibold flex items-center justify-center transition-all ${pillStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {marked && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E3B341]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend Footer */}
            <div className="p-3 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-around text-[10px] font-mono text-[#8B949E]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#238636]" /> Correct
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#DA3633]" /> Wrong
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#E3B341]" /> Marked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#21262D] border border-[#30363D]" /> Unvisited
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SESSION SUMMARY MODAL (Triggered on Finish or Exit) */}
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

            {/* Summary Metrics */}
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

            {/* Modal Actions */}
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
