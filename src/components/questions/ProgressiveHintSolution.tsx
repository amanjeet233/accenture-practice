"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  Check,
  Copy,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Code2,
  Database,
  ArrowRight,
  Play,
} from "lucide-react";

export interface ProgressiveHintSolutionProps {
  questionType: "CODING" | "SQL" | "HTML_CSS_JS" | string;
  hints?: Array<{ content: string; orderIndex?: number }> | string[];
  approach?: string | null;
  javaSolution?: string | null;
  sqlSolution?: string | null;
  commonMistakes?: string | null;
  onApplyCode?: (code: string) => void;
  className?: string;
}

export function ProgressiveHintSolution({
  questionType,
  hints = [],
  approach,
  javaSolution,
  sqlSolution,
  commonMistakes,
  onApplyCode,
  className = "",
}: ProgressiveHintSolutionProps) {
  // Normalize hints array to strings
  const hintList: string[] = hints.map((h) =>
    typeof h === "string" ? h : h.content || ""
  );

  // Progressive reveal step:
  // 0: All hidden (default)
  // 1: Hint 1 visible
  // 2: Hint 1 + 2 visible
  // 3: Hint 1 + 2 + 3 visible
  // 4: Approach visible
  // 5: Solution visible
  const [revealStep, setRevealStep] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSolutionCollapsed, setIsSolutionCollapsed] = useState(false);

  const isSql = questionType === "SQL";
  const solutionCode = isSql ? sqlSolution : javaSolution;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getHintTitle = (idx: number) => {
    if (isSql) {
      if (idx === 0) return "Hint 1 — Required Tables";
      if (idx === 1) return "Hint 2 — JOIN Relationship";
      return "Hint 3 — Filter & Aggregation Logic";
    }
    if (idx === 0) return "Hint 1 — Conceptual Direction";
    if (idx === 1) return "Hint 2 — Technique & Data Structure";
    return "Hint 3 — Step-by-Step Algorithm";
  };

  return (
    <div className={`space-y-4 font-mono text-xs ${className}`}>
      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-[#30363D] pb-2 text-[#8B949E]">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#D29922]" />
          <span className="font-semibold uppercase tracking-wider text-[#F0F6FC]">
            Progressive Hints & Solution
          </span>
        </div>
        {revealStep > 0 && (
          <button
            onClick={() => setRevealStep(0)}
            className="text-[11px] text-[#8B949E] hover:text-[#F0F6FC] transition-colors flex items-center gap-1"
          >
            <EyeOff className="w-3 h-3" />
            <span>Hide All</span>
          </button>
        )}
      </div>

      {/* Progress Step Indicator */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        {[
          { step: 1, label: "Hint 1" },
          { step: 2, label: "Hint 2" },
          { step: 3, label: "Hint 3" },
          { step: 4, label: "Approach" },
          { step: 5, label: isSql ? "SQL Solution" : "Java 21 Solution" },
        ].map((item) => (
          <div
            key={item.step}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
              revealStep >= item.step
                ? "bg-[#1f2937] text-[#58A6FF] border-[#58A6FF]/40 font-semibold"
                : "bg-[#161B22] text-[#8B949E] border-[#30363D]"
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HINT 1                                                        */}
      {/* ------------------------------------------------------------- */}
      {revealStep >= 1 && hintList[0] && (
        <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[#58A6FF] font-semibold text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#D29922]">💡</span> {getHintTitle(0)}
            </span>
            <span className="text-[10px] text-[#8B949E] font-normal">Concept</span>
          </div>
          <p className="text-[#F0F6FC] font-sans text-xs leading-relaxed">
            {hintList[0]}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HINT 2                                                        */}
      {/* ------------------------------------------------------------- */}
      {revealStep >= 2 && hintList[1] && (
        <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[#58A6FF] font-semibold text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#58A6FF]">🔧</span> {getHintTitle(1)}
            </span>
            <span className="text-[10px] text-[#8B949E] font-normal">Technique</span>
          </div>
          <p className="text-[#F0F6FC] font-sans text-xs leading-relaxed">
            {hintList[1]}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HINT 3                                                        */}
      {/* ------------------------------------------------------------- */}
      {revealStep >= 3 && hintList[2] && (
        <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[#58A6FF] font-semibold text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#3FB950]">📝</span> {getHintTitle(2)}
            </span>
            <span className="text-[10px] text-[#8B949E] font-normal">Algorithm</span>
          </div>
          <p className="text-[#F0F6FC] font-sans text-xs leading-relaxed">
            {hintList[2]}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* APPROACH                                                      */}
      {/* ------------------------------------------------------------- */}
      {revealStep >= 4 && approach && (
        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[#58A6FF] font-semibold text-xs border-b border-[#30363D]/80 pb-2">
            <span className="flex items-center gap-1.5">
              <span>📘</span> Editorial Approach & Complexity
            </span>
          </div>
          <div className="text-[#F0F6FC] font-sans text-xs leading-relaxed whitespace-pre-line">
            {approach}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VERIFIED SOLUTION REVEAL                                      */}
      {/* ------------------------------------------------------------- */}
      {revealStep >= 5 && solutionCode && (
        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-3 animate-in fade-in duration-200">
          {/* Solution Header Bar */}
          <div className="flex items-center justify-between border-b border-[#30363D]/80 pb-2.5">
            <div className="flex items-center gap-2">
              {isSql ? (
                <Database className="w-4 h-4 text-[#58A6FF]" />
              ) : (
                <Code2 className="w-4 h-4 text-[#D29922]" />
              )}
              <span className="font-bold text-[#F0F6FC] text-xs">
                {isSql ? "Verified SQL Solution" : "Verified Java 21 Solution"}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#0D1117] text-[#58A6FF] border border-[#30363D] text-[10px]">
                {isSql ? "PostgreSQL / MySQL" : "Java 21 CP Standard"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(solutionCode)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D1117] hover:bg-[#1f2937] text-[#F0F6FC] border border-[#30363D] text-[11px] transition-colors"
                title="Copy solution code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-[#3FB950]" />
                    <span className="text-[#3FB950]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#8B949E]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {onApplyCode && !isSql && (
                <button
                  onClick={() => onApplyCode(solutionCode)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D1117] hover:bg-[#1f2937] text-[#58A6FF] border border-[#30363D] text-[11px] transition-colors"
                  title="Load solution into editor"
                >
                  <Play className="w-3 h-3 fill-[#58A6FF]" />
                  <span>Insert</span>
                </button>
              )}

              <button
                onClick={() => setIsSolutionCollapsed(!isSolutionCollapsed)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0D1117] hover:bg-[#1f2937] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] text-[11px] transition-colors"
                title={isSolutionCollapsed ? "Expand solution" : "Collapse solution"}
              >
                {isSolutionCollapsed ? "Show" : "Hide"}
              </button>
            </div>
          </div>

          {/* Solution Code Body */}
          {!isSolutionCollapsed && (
            <div className="space-y-3">
              <pre className="p-3.5 rounded bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{solutionCode}</code>
              </pre>

              {/* Common Mistakes Section */}
              {commonMistakes && (
                <div className="p-3 rounded bg-[#0D1117] border border-[#30363D] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#D29922] font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Common Mistakes & Edge Cases to Avoid</span>
                  </div>
                  <div className="text-[#8B949E] font-sans text-xs whitespace-pre-line leading-relaxed pl-5">
                    {commonMistakes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* NEXT STEP REVEAL BUTTONS                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-1 flex items-center gap-2 flex-wrap">
        {revealStep === 0 && (
          <button
            onClick={() => setRevealStep(1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#1f2937] text-[#F0F6FC] border border-[#30363D] text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#D29922]" />
            <span>Show Hint 1</span>
          </button>
        )}

        {revealStep === 1 && (
          <button
            onClick={() => setRevealStep(2)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#1f2937] text-[#F0F6FC] border border-[#30363D] text-xs font-semibold transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Show Hint 2</span>
          </button>
        )}

        {revealStep === 2 && (
          <button
            onClick={() => setRevealStep(3)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#1f2937] text-[#F0F6FC] border border-[#30363D] text-xs font-semibold transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#3FB950]" />
            <span>Show Hint 3</span>
          </button>
        )}

        {revealStep === 3 && (
          <button
            onClick={() => setRevealStep(4)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#1f2937] text-[#F0F6FC] border border-[#30363D] text-xs font-semibold transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Show Approach & Algorithm</span>
          </button>
        )}

        {revealStep === 4 && (
          <button
            onClick={() => setRevealStep(5)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#58A6FF]/10 hover:bg-[#58A6FF]/20 text-[#58A6FF] border border-[#58A6FF]/40 text-xs font-bold transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isSql ? "Show SQL Solution" : "Show Java 21 Solution"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
