"use client";

import React from "react";
import { Sparkles, ShieldCheck, Flame, Repeat, FileText, CheckCircle2 } from "lucide-react";
import { analyzeQuestionEvidence, QuestionEvidenceInput } from "@/lib/importance";
import { MustDoBadge, RepeatedPatternBadge } from "@/components/ui/Badge";

interface WhyImportantCardProps {
  question: QuestionEvidenceInput;
  className?: string;
}

export function WhyImportantCard({ question, className }: WhyImportantCardProps) {
  const evidence = analyzeQuestionEvidence(question);

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 space-y-3.5 font-mono text-xs ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold flex items-center gap-1.5 text-[12px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Why this question is important
          </span>
        </div>

        <div className="flex items-center gap-2">
          {evidence.isMustDo && <MustDoBadge />}
          {evidence.isRepeatedPattern && (
            <RepeatedPatternBadge
              sources={evidence.corroboratedSources}
              frequency={question.frequency}
            />
          )}
        </div>
      </div>

      {/* Dynamic Evidence Reasons List */}
      <div className="space-y-2 font-sans text-xs">
        <ul className="space-y-1.5 text-zinc-300">
          {evidence.evidenceReasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-400 shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Repeated Pattern Corroboration Block (if repeated across sources) */}
      {evidence.isRepeatedPattern && evidence.corroboratedSources.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-purple-950/20 border border-purple-800/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
            <span className="flex items-center gap-1.5">
              <span>🔥</span> Repeated Pattern
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              {evidence.corroboratedSources.length} Corroborated Source{evidence.corroboratedSources.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold font-mono">
            Reported in:
          </div>

          <ul className="space-y-1 font-mono text-[11px] text-zinc-300">
            {evidence.corroboratedSources.map((src, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-1.5 rounded bg-zinc-950/70 border border-zinc-800/60"
              >
                <span className="truncate max-w-[240px] text-zinc-200">{src.documentTitle}</span>
                {src.shift && (
                  <span className="text-[10px] text-zinc-400 shrink-0">({src.shift})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scientific/Evidence Footer Note */}
      <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Reasons derived strictly from stored archival examination data. No arbitrary numerical score.</span>
      </div>
    </div>
  );
}
