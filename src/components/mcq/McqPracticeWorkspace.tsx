"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  ChevronDown,
  LayoutGrid,
  ShieldCheck,
  FileCode2,
  CornerDownLeft,
  Search,
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

  // Questions are authoritative from server
  const questions = initialQuestions;

  // Active question index
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User answers keyed by question ID
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  // Marked for review set of question IDs
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Completion modal state
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Mobile navigator visibility
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);

  // Topic dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  // Topic list computation
  const allTopicItems = useMemo(() => {
    const list: { slug: string; name: string }[] = [{ slug: "all", name: "All Topics" }];
    if (topicOptions && topicOptions.length > 0) {
      topicOptions.forEach((opt) => list.push({ slug: opt.slug, name: opt.name }));
    } else {
      allCategories.forEach((cat) => list.push({ slug: cat, name: cat }));
    }
    return list;
  }, [topicOptions, allCategories]);

  const currentTopicName = useMemo(() => {
    if (currentCategory === "all") return "All Topics";
    const found = allTopicItems.find(
      (o) => o.slug === currentCategory || o.name.toLowerCase() === currentCategory.toLowerCase()
    );
    return found ? found.name : currentCategory;
  }, [currentCategory, allTopicItems]);

  const filteredTopicItems = useMemo(() => {
    if (!topicSearchQuery.trim()) return allTopicItems;
    const q = topicSearchQuery.toLowerCase();
    return allTopicItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [allTopicItems, topicSearchQuery]);

  // Reset answer states and index when topic / initialQuestions changes
  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setMarkedQuestions(new Set());
    setSecondsElapsed(0);
    setCurrentCategory(selectedCategory);
  }, [initialQuestions, selectedCategory]);

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = !!currentAnswer;
  const isMarked = currentQ ? markedQuestions.has(currentQ.id) : false;

  // Ref for scrolling navigator to current question
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
      <div className="fixed inset-0 z-50 bg-[#0A0D12] text-[#F0F6FC] flex flex-col font-sans select-none items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#161B22] border border-[#30363D] flex items-center justify-center mx-auto text-[#8B949E] shadow-xl">
            <HelpCircle className="w-7 h-7 text-[#58A6FF]" />
          </div>
          <h2 className="text-lg font-bold text-[#F0F6FC]">No questions found</h2>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            There are currently no MCQs available in the database for this topic.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href={returnUrl}
              className="px-4 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] border border-[#30363D] text-xs font-medium transition-colors"
            >
              ← Back to Module
            </Link>
            <Link
              href="/accenture/mcq/practice"
              className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-md transition-colors"
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
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 min-w-0 bg-[#0B0E14] text-[#F0F6FC] flex flex-col font-sans select-none overflow-hidden">
      {/* ─── PROGRESS BAR ─── */}
      <div className="w-full h-[2px] bg-[#161B22] shrink-0">
        <div
          className="h-full bg-gradient-to-r from-[#1F6FEB] via-[#58A6FF] to-[#3FB950] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* TOP HEADER BAR */}
      {/* ========================================================================= */}
      <header className="h-14 border-b border-[#21262D] bg-[#0D1117]/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Exit + Brand */}
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          <Link
            href={returnUrl}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]/80 font-mono text-[11px] transition-all"
            title="Exit Practice Mode"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Exit</span>
          </Link>

          <div className="h-4 w-[1px] bg-[#21262D] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-wide text-[#F0F6FC] hidden sm:inline">
              Accenture MCQ
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F6FEB]/15 text-[#58A6FF] border border-[#1F6FEB]/30 font-mono font-bold tracking-wider">
              PRACTICE
            </span>
          </div>
        </div>

        {/* Center: Topic Dropdown & Question Counter */}
        <div className="min-w-0 flex items-center justify-center gap-2.5">
          {/* Custom Styled Topic Dropdown Popover */}
          <div ref={dropdownRef} className="relative hidden md:block">
            <button
              onClick={() => {
                setIsDropdownOpen((prev) => !prev);
                setTopicSearchQuery("");
              }}
              className="flex items-center gap-2 bg-[#161B22] hover:bg-[#1C2128] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-lg px-3 py-1 text-xs transition-all shadow-sm"
              title="Filter by topic"
            >
              <Filter className="w-3.5 h-3.5 text-[#58A6FF] shrink-0" />
              <span className="font-medium text-[#E6EDF3] max-w-[200px] truncate">
                {currentTopicName}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8B949E] transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-[#58A6FF]" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-[#161B22]/98 backdrop-blur-xl border border-[#30363D] shadow-2xl p-2 z-50 flex flex-col animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Search Header */}
                <div className="relative mb-2 shrink-0">
                  <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={topicSearchQuery}
                    onChange={(e) => setTopicSearchQuery(e.target.value)}
                    placeholder="Search topics..."
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF]/60"
                    autoFocus
                  />
                </div>

                {/* Items List */}
                <div className="overflow-y-auto space-y-0.5 max-h-64 pr-0.5">
                  {filteredTopicItems.length === 0 ? (
                    <div className="py-3 text-center text-xs text-[#6E7681] font-mono">
                      No matching topics
                    </div>
                  ) : (
                    filteredTopicItems.map((item) => {
                      const isSelected =
                        item.slug === currentCategory ||
                        (item.slug !== "all" && item.name.toLowerCase() === currentCategory.toLowerCase());

                      return (
                        <button
                          key={item.slug}
                          onClick={() => {
                            setCurrentCategory(item.slug);
                            setIsDropdownOpen(false);
                            if (item.slug === "all") {
                              router.push("/accenture/mcq/practice");
                            } else {
                              router.push(`/accenture/mcq/practice?topic=${encodeURIComponent(item.slug)}`);
                            }
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-[#1F6FEB]/15 text-[#58A6FF] font-medium border border-[#1F6FEB]/30"
                              : "text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F0F6FC] border border-transparent"
                          }`}
                        >
                          <span className="truncate pr-2">{item.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#58A6FF] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Question Index Pill */}
          <div className="whitespace-nowrap font-mono text-xs text-[#8B949E] bg-[#161B22] px-2.5 py-1 rounded-lg border border-[#30363D] shadow-sm">
            <span className="text-[#8B949E] text-[10px]">QUESTION</span>{" "}
            <span className="text-[#F0F6FC] font-bold">{currentIndex + 1}</span>
            <span className="text-[#6E7681]">/{questions.length}</span>
            {totalPages > 1 && (
              <span className="ml-1 text-[#58A6FF]/80 text-[10px]">(p.{currentPage})</span>
            )}
          </div>
        </div>

        {/* Right: Timer, Live Score & Controls */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161B22] border border-[#30363D] text-xs font-mono text-[#8B949E] shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span className="text-[#E6EDF3] font-medium tracking-wide">{formatTime(secondsElapsed)}</span>
          </div>

          {/* Live Score */}
          {answeredList.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161B22] border border-[#30363D] text-xs font-mono shadow-sm">
              <span className="inline-flex items-center text-[#3FB950] font-bold">
                {correctCount} <span className="text-[10px] ml-0.5 text-[#3FB950]/80">✓</span>
              </span>
              <span className="text-[#30363D]">•</span>
              <span className="inline-flex items-center text-[#F85149] font-bold">
                {incorrectCount} <span className="text-[10px] ml-0.5 text-[#F85149]/80">✕</span>
              </span>
            </div>
          )}

          {/* Mobile navigator button */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] text-xs font-mono transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Nav</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] transition-colors shadow-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-[#8B949E]" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3-PANEL MAIN BODY */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 grid overflow-hidden lg:grid-cols-[minmax(320px,1.05fr)_minmax(360px,1fr)_76px] xl:grid-cols-[minmax(380px,1.1fr)_minmax(420px,1fr)_80px]">
        {/* ─── LEFT PANEL: QUESTION DETAILS ─── */}
        <div className="hidden min-w-0 lg:flex flex-col border-r border-[#21262D] bg-[#0D1117] overflow-y-auto">
          <div className="p-6 xl:p-8 space-y-6 flex-1">
            {/* Unified Meta Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#1F6FEB]/15 text-[#58A6FF] border border-[#1F6FEB]/30">
                  Q{currentQ.questionNumber}
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#238636]/15 text-[#3FB950] border border-[#3FB950]/30">
                  {currentQ.id}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#161B22] text-[#8B949E] border border-[#30363D]">
                  {currentQ.category}
                </span>
                <DifficultyBadge difficulty={currentQ.difficulty as any} />
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#161B22] text-[#6E7681] border border-[#30363D]">
                  {currentQ.sourceType.replace(/_/g, " ")}
                </span>
              </div>

              {/* Mark for Review Button */}
              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs transition-all shadow-sm ${
                  isMarked
                    ? "bg-[#D29922]/20 text-[#E3B341] border-[#D29922] shadow-[0_0_12px_rgba(210,153,34,0.15)]"
                    : "bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] border-[#30363D] hover:bg-[#21262D]"
                }`}
                title="Mark / Unmark for Review (Hotkey: M)"
              >
                {isMarked ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#E3B341]" />
                    <span className="font-semibold text-[#E3B341]">Marked</span>
                    <span className="text-[10px] bg-[#D29922]/30 px-1 rounded text-[#E3B341] ml-0.5">M</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Review</span>
                    <span className="text-[10px] bg-[#21262D] px-1 rounded text-[#6E7681] ml-0.5">M</span>
                  </>
                )}
              </button>
            </div>

            {/* Question Stem */}
            <div className="space-y-4 pt-1">
              <h2 className="text-lg xl:text-xl font-semibold text-[#F0F6FC] leading-relaxed tracking-normal font-sans">
                {currentQ.stem}
              </h2>

              {/* Code Snippet Box */}
              {currentQ.codeBlock && (
                <div className="rounded-xl border border-[#30363D] bg-[#0A0D12] overflow-hidden shadow-md">
                  <div className="px-3.5 py-1.5 border-b border-[#21262D] bg-[#161B22]/60 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#8B949E] flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-[#58A6FF]" />
                      {currentQ.codeLanguage || "Snippet"}
                    </span>
                    <span className="text-[10px] font-mono text-[#6E7681]">Syntax</span>
                  </div>
                  <pre className="p-4 font-mono text-xs sm:text-sm text-[#79C0FF] overflow-x-auto whitespace-pre leading-relaxed">
                    <code>{currentQ.codeBlock}</code>
                  </pre>
                </div>
              )}

              {/* Importance Note / Verified Source */}
              {currentQ.importanceReason && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#161B22]/70 border border-[#30363D]/70 text-xs text-[#8B949E] font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#58A6FF] shrink-0" />
                  <span>{currentQ.importanceReason}</span>
                </div>
              )}
            </div>

            {/* Explanation / Answer Feedback Card */}
            {isAnswered && (
              <div className="space-y-3.5 pt-4 border-t border-[#21262D] animate-in fade-in-50 duration-200">
                {currentAnswer!.isCorrect ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#238636]/15 border border-[#3FB950]/50 text-[#3FB950] font-mono text-xs shadow-[0_0_15px_rgba(63,185,80,0.1)]">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3FB950]" />
                    <span className="font-bold">Correct! Great job.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#DA3633]/15 border border-[#F85149]/50 text-[#F85149] font-mono text-xs shadow-[0_0_15px_rgba(248,81,73,0.1)]">
                    <XCircle className="w-4 h-4 shrink-0 text-[#F85149]" />
                    <span className="font-bold">Incorrect. Correct answer is Option {currentQ.correctKey}.</span>
                  </div>
                )}

                {/* Explanation Content Box */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/80 p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#58A6FF]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explanation & Key Concept</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#8B949E]">
                      Correct: <strong className="text-[#3FB950] ml-1">Option {currentQ.correctKey}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D]/80 text-xs font-mono text-[#C9D1D9] flex items-start gap-2">
                    <span className="text-[#8B949E] font-bold">[{currentQ.correctKey}]:</span>
                    <span className="text-[#F0F6FC] font-medium leading-relaxed">
                      {currentQ.options[currentQ.correctKey]}
                    </span>
                  </div>

                  <p className="text-xs text-[#8B949E] leading-relaxed font-sans pt-1">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── CENTER PANEL: ANSWER OPTIONS & FOOTER ─── */}
        <div className="min-w-0 flex min-h-0 flex-col bg-[#0B0E14] overflow-y-auto">
          <div className="p-5 sm:p-6 xl:p-8 space-y-5 flex-1">
            {/* Mobile Question Summary (hidden on desktop) */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F6FEB]/15 text-[#58A6FF] border border-[#1F6FEB]/30">
                  Q{currentQ.questionNumber}
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#238636]/15 text-[#3FB950] border border-[#3FB950]/30">
                  {currentQ.id}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#161B22] text-[#8B949E] border border-[#30363D]">
                  {currentQ.category}
                </span>
                <DifficultyBadge difficulty={currentQ.difficulty as any} />
              </div>

              <h2 className="text-base font-medium text-[#F0F6FC] leading-relaxed">
                {currentQ.stem}
              </h2>

              {currentQ.codeBlock && (
                <pre className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] font-mono text-xs text-[#79C0FF] overflow-x-auto whitespace-pre leading-relaxed my-2">
                  <code>{currentQ.codeBlock}</code>
                </pre>
              )}

              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
                  isMarked
                    ? "bg-[#D29922]/20 text-[#E3B341] border-[#D29922]"
                    : "bg-[#161B22] text-[#8B949E] border-[#30363D]"
                }`}
              >
                {isMarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
              </button>
            </div>

            {/* ANSWER OPTIONS Heading */}
            <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#58A6FF] animate-pulse" />
                <h3 className="font-mono text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                  Answer Options
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#6E7681]">Choose one response [A - D]</span>
            </div>

            {/* Clickable Option Cards */}
            <div className="space-y-3">
              {(["A", "B", "C", "D"] as const).map((key) => {
                const optionText = currentQ.options[key];
                if (!optionText) return null;
                const isSelected = currentAnswer?.selectedKey === key;
                const isOptionCorrect = currentQ.correctKey === key;

                let cardStyle =
                  "border-[#30363D]/80 bg-[#161B22] text-[#E6EDF3] hover:border-[#58A6FF]/60 hover:bg-[#1C2128] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:scale-[1.006]";
                let badgeStyle = "bg-[#21262D] text-[#8B949E] border-[#30363D] group-hover:border-[#58A6FF]/60 group-hover:text-[#58A6FF]";
                let statusIcon = null;

                if (isAnswered) {
                  if (isSelected && isOptionCorrect) {
                    cardStyle =
                      "border-[#3FB950] bg-[#238636]/15 text-[#3FB950] font-medium shadow-[0_0_16px_rgba(63,185,80,0.18)]";
                    badgeStyle = "bg-[#3FB950] text-[#0A0D12] border-[#3FB950] font-bold";
                    statusIcon = <Check className="w-4 h-4 text-[#3FB950] shrink-0" />;
                  } else if (isSelected && !isOptionCorrect) {
                    cardStyle =
                      "border-[#F85149] bg-[#DA3633]/15 text-[#F85149] font-medium shadow-[0_0_16px_rgba(248,81,73,0.18)]";
                    badgeStyle = "bg-[#F85149] text-[#FFFFFF] border-[#F85149] font-bold";
                    statusIcon = <X className="w-4 h-4 text-[#F85149] shrink-0" />;
                  } else if (isOptionCorrect) {
                    cardStyle = "border-[#3FB950] bg-[#238636]/10 text-[#3FB950] font-medium border-dashed";
                    badgeStyle = "bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950] font-bold";
                    statusIcon = <Check className="w-4 h-4 text-[#3FB950] shrink-0" />;
                  } else {
                    cardStyle = "border-[#21262D]/60 bg-[#161B22]/30 text-[#6E7681] opacity-60";
                    badgeStyle = "bg-[#21262D]/40 text-[#6E7681] border-[#30363D]/30";
                  }
                }

                return (
                  <button
                    key={key}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(key)}
                    aria-label={`Option ${key}: ${optionText}`}
                    aria-pressed={isSelected}
                    className={`w-full min-w-0 text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 group cursor-pointer disabled:cursor-default ${cardStyle}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 border transition-all ${badgeStyle}`}
                    >
                      {key}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed pt-0.5">
                      {optionText}
                    </span>
                    {statusIcon ? (
                      statusIcon
                    ) : (
                      <span className="text-[10px] font-mono text-[#6E7681] opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                        [{key}]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile-only: Feedback + Explanation below options */}
            {isAnswered && (
              <div className="lg:hidden space-y-3 pt-3 border-t border-[#21262D]">
                {currentAnswer!.isCorrect ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#238636]/15 border border-[#3FB950] text-[#3FB950] font-mono text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">✓ Correct</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#DA3633]/15 border border-[#F85149] text-[#F85149] font-mono text-xs">
                    <XCircle className="w-4 h-4" />
                    <span className="font-bold">✕ Expected: {currentQ.correctKey}</span>
                  </div>
                )}

                <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#58A6FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explanation</span>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── SLEEK FOOTER NAVIGATION ─── */}
          <div className="h-14 border-t border-[#21262D] bg-[#0D1117] px-5 sm:px-6 flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] disabled:opacity-30 disabled:hover:bg-[#161B22] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-all disabled:cursor-not-allowed shadow-sm"
              title="Previous (←)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
              <span className="hidden sm:inline text-[10px] text-[#6E7681]">←</span>
            </button>

            {/* Keyboard Shortcuts Hint Bar */}
            <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-[#6E7681]">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D] text-[#8B949E]">A-D</kbd>
                <span>Select</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D] text-[#8B949E]">M</kbd>
                <span>Mark</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D] text-[#8B949E]">← →</kbd>
                <span>Move</span>
              </span>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3fb950] text-white font-mono text-xs font-semibold shadow-md transition-all active:scale-95"
              title="Next (→)"
            >
              <span>
                {currentIndex === questions.length - 1
                  ? currentPage < totalPages
                    ? "Next Page"
                    : "Finish"
                  : "Next"}
              </span>
              <span className="hidden sm:inline text-[10px] opacity-80">→</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── RIGHT PANEL: VERTICAL TINY RAIL NODE STEPPER NAVIGATOR ─── */}
        <aside
          aria-label="Question timeline"
          className="hidden min-h-0 overflow-y-auto border-l border-[#21262D] bg-[#0B0E14] px-2 py-4 lg:block w-full"
        >
          <div className="relative mx-auto w-8 before:absolute before:left-1/2 before:top-3 before:bottom-3 before:w-px before:-translate-x-1/2 before:bg-[#21262D]">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const ansState = answers[q.id];
              const isAns = Boolean(ansState);
              const isM = markedQuestions.has(q.id);

              let nodeClass = "bg-[#161B22] text-[#8B949E] border-[#30363D] hover:border-[#58A6FF]/60 hover:text-white";
              if (isAns) {
                nodeClass = ansState.isCorrect
                  ? "bg-[#238636] text-white border-[#3FB950] font-bold"
                  : "bg-[#DA3633] text-white border-[#F85149] font-bold";
              } else if (isM) {
                nodeClass = "bg-[#D29922] text-[#0B0E14] border-[#E3B341] font-bold";
              }

              return (
                <div key={q.id} className="relative z-10 flex justify-center pb-2.5">
                  <button
                    ref={isCurrent ? currentBtnRef : null}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Question ${idx + 1}`}
                    aria-current={isCurrent ? "step" : undefined}
                    title={`Question ${idx + 1}${isAns ? (ansState.isCorrect ? " (Correct)" : " (Incorrect)") : isM ? " (Marked)" : ""}`}
                    className={`h-7 w-7 rounded-full border font-mono text-[10px] font-bold transition-all flex items-center justify-center ${nodeClass} ${
                      isCurrent
                        ? "ring-[2.5px] ring-[#58A6FF] ring-offset-2 ring-offset-[#0B0E14] scale-110 shadow-lg"
                        : ""
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
      {/* MOBILE NAVIGATOR DRAWER */}
      {/* ========================================================================= */}
      {showMobileNav && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
          <div
            className="bg-[#161B22] border-t border-[#30363D] rounded-t-2xl max-h-[70vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363D] shrink-0">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#58A6FF]" />
                <h3 className="font-mono font-bold text-xs text-[#F0F6FC]">Question Navigator</h3>
                <span className="text-[10px] font-mono text-[#8B949E]">
                  ({answeredList.length}/{questions.length})
                </span>
              </div>
              <button
                onClick={() => setShowMobileNav(false)}
                className="p-1 rounded-lg hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="px-5 py-2.5 grid grid-cols-4 gap-2 text-center font-mono border-b border-[#30363D] shrink-0">
              <div className="p-2 rounded-lg bg-[#0D1117] border border-[#30363D]">
                <div className="text-[9px] text-[#8B949E]">Total</div>
                <div className="text-xs font-bold text-[#F0F6FC]">{questions.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0D1117] border border-[#3FB950]/30">
                <div className="text-[9px] text-[#3FB950]">Correct</div>
                <div className="text-xs font-bold text-[#3FB950]">{correctCount}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0D1117] border border-[#F85149]/30">
                <div className="text-[9px] text-[#F85149]">Wrong</div>
                <div className="text-xs font-bold text-[#F85149]">{incorrectCount}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0D1117] border border-[#D29922]/30">
                <div className="text-[9px] text-[#E3B341]">Marked</div>
                <div className="text-xs font-bold text-[#E3B341]">{markedCount}</div>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const ansState = answers[q.id];
                  const isAns = Boolean(ansState);
                  const isM = markedQuestions.has(q.id);

                  let btnBg = "bg-[#0D1117] text-[#8B949E] border-[#30363D]";
                  if (isAns) {
                    btnBg = ansState.isCorrect
                      ? "bg-[#238636]/20 text-[#3FB950] border-[#3FB950]/50"
                      : "bg-[#DA3633]/20 text-[#F85149] border-[#F85149]/50";
                  } else if (isM) {
                    btnBg = "bg-[#D29922]/20 text-[#E3B341] border-[#D29922]/60";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowMobileNav(false);
                      }}
                      className={`relative h-11 rounded-lg border font-mono text-xs font-semibold flex items-center justify-center transition-all ${btnBg} ${
                        isCurrent ? "ring-2 ring-[#58A6FF] font-bold text-white" : ""
                      }`}
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SESSION SUMMARY MODAL */}
      {/* ========================================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1F6FEB]/20 to-[#3FB950]/20 border border-[#58A6FF]/40 flex items-center justify-center text-[#58A6FF] shadow-inner">
                <Award className="w-6 h-6 text-[#58A6FF]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#F0F6FC]">
                  Practice Session Completed
                </h3>
                <p className="text-xs text-[#8B949E] font-mono">Accenture Assessment Preparation</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Total Answered</div>
                <div className="text-xl font-bold text-[#F0F6FC] mt-0.5">
                  {answeredList.length} <span className="text-xs text-[#6E7681]">/ {questions.length}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Accuracy</div>
                <div className="text-xl font-bold text-[#3FB950] mt-0.5">
                  {accuracyPct}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Correct Answers</div>
                <div className="text-xl font-bold text-[#3FB950] mt-0.5">
                  {correctCount}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                <div className="text-[#8B949E] text-[10px]">Time Spent</div>
                <div className="text-xl font-bold text-[#58A6FF] mt-0.5">
                  {formatTime(secondsElapsed)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] font-mono text-xs font-medium transition-colors"
              >
                Review Questions
              </button>
              <Link
                href={returnUrl}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3fb950] text-white font-mono text-xs font-semibold text-center shadow-md transition-all"
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

