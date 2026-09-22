"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DifficultyBadge,
  MustDoBadge,
  SourceBadge,
  RepeatedPatternBadge,
} from "@/components/ui/Badge";
import { analyzeQuestionEvidence } from "@/lib/importance";
import {
  CheckCircle2,
  Circle,
  Bookmark as BookmarkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuestionCardData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionType: string;
  sourceType: string;
  importance: "MUST_DO" | "HIGH" | "MEDIUM" | "LOW";
  importanceReason?: string | null;
  verificationStatus: string;
  frequency?: number;
  isRepeated?: boolean;
  year?: number | null;
  shift?: string | null;
  topics?: string[];
  companies?: string[];
  sourceDocument?: string | null;
  isSolved?: boolean;
  isBookmarked?: boolean;
}

interface QuestionCardProps {
  question: QuestionCardData;
  onBookmarkToggle?: (id: string, nextBookmarked: boolean) => void;
  className?: string;
}

export function QuestionCard({
  question,
  onBookmarkToggle,
  className,
}: QuestionCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(question.isBookmarked || false);
  const [isUpdatingBookmark, setIsUpdatingBookmark] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdatingBookmark) return;

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    setIsUpdatingBookmark(true);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id }),
      });
      const data = await res.json();
      if (!data.success) {
        setIsBookmarked(!nextState);
      } else if (onBookmarkToggle) {
        onBookmarkToggle(question.id, nextState);
      }
    } catch {
      setIsBookmarked(!nextState);
    } finally {
      setIsUpdatingBookmark(false);
    }
  };

  const evidence = analyzeQuestionEvidence(question as any);

  // Topics and metadata line
  const metaParts: string[] = [];
  if (question.topics && question.topics.length > 0) {
    metaParts.push(question.topics.slice(0, 3).join(" · "));
  }
  if (question.companies && question.companies.length > 0) {
    metaParts.push(question.companies[0]);
  }
  if (question.year) {
    metaParts.push(String(question.year));
  }
  if (question.shift) {
    metaParts.push(question.shift);
  }

  const targetHref = question.questionType === "SQL"
    ? `/sql/${question.slug}`
    : `/questions/${question.slug}`;

  return (
    <div
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 rounded-md bg-[#161B22] hover:bg-[#21262D]/60 border border-[#30363D] transition-colors text-xs font-mono",
        className
      )}
    >
      {/* Left: Status & Problem Title + Subtext */}
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div className="mt-0.5 shrink-0">
          {question.isSolved ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-[#30363D]" />
          )}
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={targetHref}
              className="font-medium text-[#F0F6FC] hover:text-[#58A6FF] transition-colors truncate"
            >
              {question.title}
            </Link>
            {evidence.isMustDo && <MustDoBadge />}
            {evidence.isRepeatedPattern && (
              <RepeatedPatternBadge
                sources={evidence.corroboratedSources}
                frequency={question.frequency}
              />
            )}
          </div>

          <div className="text-[10px] text-[#8B949E] truncate">
            {metaParts.join(" · ")}
          </div>
        </div>
      </div>

      {/* Right: Difficulty, Source, Bookmark & Solve Action */}
      <div className="flex items-center gap-2 shrink-0 sm:self-center justify-between sm:justify-end">
        <div className="flex items-center gap-1.5">
          <DifficultyBadge difficulty={question.difficulty} />
          <SourceBadge
            sourceType={question.sourceType as any}
            sourceShift={question.shift}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={isUpdatingBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
            className={cn(
              "p-1 rounded transition-colors",
              isBookmarked
                ? "text-[#D29922]"
                : "text-[#6E7681] hover:text-[#F0F6FC]"
            )}
          >
            <BookmarkIcon
              className={cn("w-3.5 h-3.5", isBookmarked && "fill-[#D29922]")}
            />
          </button>

          <Link
            href={targetHref}
            className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] border border-[#30363D] text-[11px] font-medium transition-colors"
          >
            Solve
          </Link>
        </div>
      </div>
    </div>
  );
}
