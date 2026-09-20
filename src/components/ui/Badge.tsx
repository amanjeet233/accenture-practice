"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Difficulty, Importance, SourceType, VerificationStatus } from "@/types";
import {
  DIFFICULTY_CONFIG,
  IMPORTANCE_CONFIG,
  SOURCE_TYPE_CONFIG,
  VERIFICATION_CONFIG,
} from "@/lib/constants";
import { ShieldCheck, CheckCircle2, Users, HelpCircle } from "lucide-react";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.MEDIUM;
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border leading-none",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface ImportanceBadgeProps {
  importance: Importance;
  className?: string;
}

export function ImportanceBadge({ importance, className }: ImportanceBadgeProps) {
  const config = IMPORTANCE_CONFIG[importance] || IMPORTANCE_CONFIG.MEDIUM;
  return (
    <span
      title={config.description}
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border leading-none",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface SourceBadgeProps {
  sourceType: SourceType;
  sourceShift?: string | null;
  className?: string;
}

export function SourceBadge({ sourceType, sourceShift, className }: SourceBadgeProps) {
  const config = SOURCE_TYPE_CONFIG[sourceType] || SOURCE_TYPE_CONFIG.PRACTICE;
  return (
    <span
      title={config.tooltip + (sourceShift ? ` - ${sourceShift}` : "")}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border font-medium leading-none",
        config.badgeClass,
        className
      )}
    >
      <span>{config.label}</span>
      {sourceShift && <span className="text-[#6E7681]">({sourceShift})</span>}
    </span>
  );
}

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const config = VERIFICATION_CONFIG[status] || VERIFICATION_CONFIG.UNVERIFIED;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-mono leading-none",
        config.textClass,
        className
      )}
    >
      {status === "HIGH_CONFIDENCE" && <ShieldCheck className="w-3 h-3 text-[#3FB950]" />}
      {status === "OFFICIALLY_VERIFIED" && <CheckCircle2 className="w-3 h-3 text-[#58A6FF]" />}
      {status === "COMMUNITY_VERIFIED" && <Users className="w-3 h-3 text-[#8B949E]" />}
      {status === "UNVERIFIED" && <HelpCircle className="w-3 h-3 text-[#6E7681]" />}
      <span>{config.label}</span>
    </span>
  );
}

interface MustDoBadgeProps {
  className?: string;
}

export function MustDoBadge({ className }: MustDoBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/25 leading-none",
        className
      )}
      title="Evidence-backed Must Do problem prioritized from assessment reports"
    >
      <span>★</span>
      <span>Must Do</span>
    </span>
  );
}

interface RepeatedPatternBadgeProps {
  sources?: Array<{ documentTitle?: string; title?: string; shift?: string | null; date?: string | null }> | string[];
  frequency?: number;
  className?: string;
}

export function RepeatedPatternBadge({
  sources = [],
  frequency,
  className,
}: RepeatedPatternBadgeProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formattedSources = sources.map((s) => {
    if (typeof s === "string") return { title: s, shift: null, date: null };
    return {
      title: s.documentTitle || s.title || "Archival Source Document",
      shift: s.shift || null,
      date: s.date || null,
    };
  });

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161B22] text-[#8B949E] border border-[#30363D] hover:text-[#F0F6FC] hover:border-[#58A6FF]/40 transition-colors cursor-pointer leading-none",
          className
        )}
        title="Click to view corroborated sources"
      >
        <span>Repeated</span>
        {frequency && frequency > 1 && (
          <span className="text-[#58A6FF] font-semibold">({frequency}x)</span>
        )}
      </button>

      {isOpen && formattedSources.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full mt-1.5 z-40 w-72 p-2.5 rounded-md bg-[#161B22] border border-[#30363D] shadow-xl text-xs font-mono"
          >
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#30363D] text-[11px] font-semibold text-[#F0F6FC]">
              <span>Repeated Pattern Sources</span>
              <span className="text-[10px] text-[#8B949E]">{formattedSources.length} reports</span>
            </div>
            <ul className="space-y-1 text-[10px] text-[#8B949E]">
              {formattedSources.map((src, i) => (
                <li
                  key={i}
                  className="p-1.5 rounded bg-[#0D1117] border border-[#30363D] space-y-0.5"
                >
                  <div className="font-medium text-[#F0F6FC] truncate">{src.title}</div>
                  {(src.shift || src.date) && (
                    <div className="flex items-center gap-2 text-[9px] text-[#6E7681]">
                      {src.shift && <span>Slot: {src.shift}</span>}
                      {src.shift && src.date && <span>•</span>}
                      {src.date && <span>{src.date}</span>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
