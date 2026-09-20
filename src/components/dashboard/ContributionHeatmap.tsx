"use client";

import React, { useState } from "react";
import { HeatmapDay } from "@/lib/analytics";
import { Flame, Calendar, Trophy, Zap } from "lucide-react";

interface ContributionHeatmapProps {
  days: HeatmapDay[];
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export function ContributionHeatmap({
  days,
  currentStreak,
  longestStreak,
  totalActiveDays,
}: ContributionHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Group 365 days into 7 rows (Sunday to Saturday) across ~53 weeks
  // First, find the day of the week of days[0]
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  days.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getCellClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-950/90 border-emerald-800/50 hover:border-emerald-500";
      case 2:
        return "bg-emerald-800 border-emerald-700/60 hover:border-emerald-400";
      case 3:
        return "bg-emerald-600 border-emerald-500 hover:border-emerald-300";
      case 4:
        return "bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/40";
      case 0:
      default:
        return "bg-zinc-900/90 border-zinc-800/60 hover:border-zinc-700";
    }
  };

  const totalSolved = days.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4 font-mono text-xs">
      {/* Top Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Activity & Contribution Heatmap
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            {totalSolved} solutions submitted across the past 12 months.
          </p>
        </div>

        {/* Streak Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-mono font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{currentStreak} Day{currentStreak === 1 ? "" : "s"} Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5 text-indigo-400" />
            <span>Longest: {longestStreak}d</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px] space-y-2">
          {/* Week Columns Grid */}
          <div className="flex gap-[3px] items-center">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-[11px] h-[11px] rounded-[2px] border transition-all cursor-pointer ${getCellClass(
                      day.level
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Month Labels & Bottom Legend */}
          <div className="flex items-center justify-between pt-2 text-[10px] text-zinc-500 font-mono">
            <div className="flex items-center gap-4">
              <span>{totalActiveDays} Active Coding Days</span>
              {hoveredDay && (
                <span className="text-zinc-300 font-semibold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  {hoveredDay.count} problem{hoveredDay.count === 1 ? "" : "s"} on{" "}
                  {new Date(hoveredDay.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Scale Legend */}
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-800" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800 border border-emerald-700" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-500" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
