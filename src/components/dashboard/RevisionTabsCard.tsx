"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DifficultyBadge, ImportanceBadge, MustDoBadge, SourceBadge } from "@/components/ui/Badge";
import {
  Calendar,
  Clock,
  AlertTriangle,
  XCircle,
  Bookmark,
  Flame,
  ArrowRight,
  RotateCw,
  CheckCircle2,
} from "lucide-react";

interface RevisionTabsCardProps {
  today: any[];
  thisWeek: any[];
  needsRevision: any[];
  incorrect: any[];
  bookmarked: any[];
  mustDo: any[];
}

type TabKey = "today" | "thisWeek" | "needsRevision" | "incorrect" | "bookmarked" | "mustDo";

export function RevisionTabsCard({
  today,
  thisWeek,
  needsRevision,
  incorrect,
  bookmarked,
  mustDo,
}: RevisionTabsCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("today");

  const tabConfig = {
    today: {
      label: "Today",
      icon: <Calendar className="w-3.5 h-3.5" />,
      items: today,
      description: "Leitner box spaced-repetition items due for review today.",
    },
    thisWeek: {
      label: "This Week",
      icon: <Clock className="w-3.5 h-3.5" />,
      items: thisWeek,
      description: "Problems attempted or practiced within the past 7 days.",
    },
    needsRevision: {
      label: "Needs Revision",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      items: needsRevision,
      description: "Questions in topics with test-case accuracy below 60%.",
    },
    incorrect: {
      label: "Incorrect",
      icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
      items: incorrect,
      description: "Questions with failed submissions (Wrong Answer or Error).",
    },
    bookmarked: {
      label: "Bookmarked",
      icon: <Bookmark className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />,
      items: bookmarked,
      description: "Questions saved to your personal revision queue.",
    },
    mustDo: {
      label: "Must Do",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />,
      items: mustDo,
      description: "Uncompleted priority problems backed by official paper evidence.",
    },
  };

  const currentTab = tabConfig[activeTab];
  const items = currentTab.items;

  return (
    <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4 font-mono text-xs">
      {/* Tab Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white font-mono">
            Smart Revision Queues
          </h3>
        </div>

        {/* 6 Tabs: Today, This Week, Needs Revision, Incorrect, Bookmarked, Must Do */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {(Object.keys(tabConfig) as TabKey[]).map((key) => {
            const cfg = tabConfig[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {cfg.icon}
                <span>{cfg.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isActive ? "bg-indigo-800 text-indigo-200" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {cfg.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description subtitle */}
      <p className="text-[11px] text-zinc-400 font-sans">{currentTab.description}</p>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="p-8 text-center rounded-lg bg-zinc-950/60 border border-zinc-800/60 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <div className="font-semibold text-zinc-200">Queue is clear!</div>
          <p className="text-[11px] text-zinc-500 font-sans max-w-md mx-auto">
            No questions currently pending in this category. Continue practicing to maintain concept recall.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {items.slice(0, 8).map((q: any) => (
            <div
              key={q.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/20 px-2 rounded-md transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/questions/${q.slug}`}
                    className="font-semibold text-xs text-zinc-100 hover:text-indigo-300 transition-colors truncate max-w-md"
                  >
                    {q.title}
                  </Link>
                  <DifficultyBadge difficulty={q.difficulty as any} />
                  {q.importance === "MUST_DO" && <MustDoBadge />}
                  {q.questionType && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                      {q.questionType}
                    </span>
                  )}
                </div>
                {q.importanceReason && (
                  <p className="text-[11px] text-zinc-400 line-clamp-1 font-sans">
                    {q.importanceReason}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/questions/${q.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-200 text-xs font-mono font-medium border border-zinc-700 transition-colors"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
