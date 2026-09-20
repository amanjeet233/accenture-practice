"use client";

import React, { useState } from "react";
import { TopicAccuracy } from "@/lib/analytics";
import { AlertCircle, BrainCircuit, Code2, Database, Globe, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface TopicAnalysisCardProps {
  dsaTopics: TopicAccuracy[];
  sqlTopics: TopicAccuracy[];
  frontendTopics: TopicAccuracy[];
  weakAreas: TopicAccuracy[];
}

export function TopicAnalysisCard({
  dsaTopics,
  sqlTopics,
  frontendTopics,
  weakAreas,
}: TopicAnalysisCardProps) {
  const [activeCategory, setActiveCategory] = useState<"DSA" | "SQL" | "FRONTEND" | "ALL">("ALL");

  const currentTopics =
    activeCategory === "ALL"
      ? [...dsaTopics, ...sqlTopics, ...frontendTopics]
      : activeCategory === "DSA"
      ? dsaTopics
      : activeCategory === "SQL"
      ? sqlTopics
      : frontendTopics;

  return (
    <div className="space-y-6">
      {/* 1. Weak Areas Callout Banner (Calculated strictly from actual submissions) */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-zinc-900/60 to-zinc-900/60 border border-rose-900/40 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Targeted Weak Areas Diagnostic (&lt;60% Accuracy)</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-normal">
            Calculated strictly from actual sandbox submission data
          </span>
        </div>

        {weakAreas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {weakAreas.map((w) => (
              <div
                key={w.name}
                className="p-3 rounded-lg bg-zinc-950/80 border border-rose-800/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate">{w.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                    {w.accuracy}% Acc
                  </span>
                </div>
                <div className="text-[11px] text-rose-300/80 font-sans flex items-center justify-between">
                  <span>{w.category} Domain</span>
                  <span className="font-semibold text-rose-400 uppercase text-[10px]">Needs revision</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {w.acceptedSubmissions}/{w.totalSubmissions} attempts passed
                </div>
              </div>
            ))}
          </div>
        ) : [...dsaTopics, ...sqlTopics, ...frontendTopics].reduce((acc, t) => acc + t.totalSubmissions, 0) === 0 ? (
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-500" />
            <span>No topic evaluations recorded yet. Run solutions or mock tests to populate your weak-area diagnostic.</span>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>All attempted topics are performing above the 60% proficiency threshold.</span>
          </div>
        )}
      </div>

      {/* 2. Detailed Topic Accuracy Grid with Category Tabs */}
      <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4 font-mono text-xs">
        {/* Category Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Topic-Wise Accuracy & Mastery Matrix
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px]">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeCategory === "ALL"
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setActiveCategory("DSA")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                activeCategory === "DSA"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-indigo-300"
              }`}
            >
              <Code2 className="w-3 h-3" /> DSA ({dsaTopics.length})
            </button>
            <button
              onClick={() => setActiveCategory("SQL")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                activeCategory === "SQL"
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
            >
              <Database className="w-3 h-3" /> SQL ({sqlTopics.length})
            </button>
            <button
              onClick={() => setActiveCategory("FRONTEND")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                activeCategory === "FRONTEND"
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-zinc-400 hover:text-cyan-300"
              }`}
            >
              <Globe className="w-3 h-3" /> Frontend ({frontendTopics.length})
            </button>
          </div>
        </div>

        {/* Topics Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {currentTopics.map((topic) => {
            const hasAttempted = topic.accuracy !== null;
            const isWeak = topic.isWeak;

            return (
              <div
                key={topic.name}
                className={`p-3.5 rounded-lg border font-mono space-y-2 transition-colors ${
                  isWeak
                    ? "bg-rose-950/20 border-rose-800/40"
                    : hasAttempted
                    ? "bg-zinc-950/60 border-zinc-800"
                    : "bg-zinc-950/30 border-zinc-800/50 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-100 truncate">{topic.name}</span>
                  {hasAttempted ? (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        isWeak
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : topic.accuracy! >= 80
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : "bg-amber-950 text-amber-300 border-amber-800"
                      }`}
                    >
                      {topic.accuracy}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-600">Unattempted</span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      !hasAttempted
                        ? "bg-transparent"
                        : isWeak
                        ? "bg-rose-500"
                        : topic.accuracy! >= 80
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${hasAttempted ? topic.accuracy : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Solved: {topic.solvedCount}</span>
                  <span>
                    {hasAttempted
                      ? `${topic.acceptedSubmissions}/${topic.totalSubmissions} runs`
                      : "0 runs"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnostic standard notice */}
        <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[10px] text-zinc-500">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Accuracies calculated strictly from active evaluation runs. Unattempted topics remain neutral.</span>
        </div>
      </div>
    </div>
  );
}
