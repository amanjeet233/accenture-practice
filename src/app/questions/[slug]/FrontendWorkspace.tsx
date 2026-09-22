"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DifficultyBadge,
  ImportanceBadge,
  SourceBadge,
  MustDoBadge,
  RepeatedPatternBadge,
} from "@/components/ui/Badge";
import { analyzeQuestionEvidence } from "@/lib/importance";
import { WhyImportantCard } from "@/components/questions/WhyImportantCard";
import { ProgressiveHintSolution } from "@/components/questions/ProgressiveHintSolution";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  Terminal,
  MonitorCheck,
  Code2,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoCodeEditor = dynamic(
  () =>
    import("@/components/editor/MonacoCodeEditor").then(
      (mod) => mod.MonacoCodeEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-xs font-mono text-[#8B949E] bg-[#0D1117]">
        Loading Monaco Code Editor...
      </div>
    ),
  }
);

interface FrontendWorkspaceProps {
  question: any;
}

export function FrontendWorkspace({ question }: FrontendWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [isBookmarked, setIsBookmarked] = useState(question.isBookmarked || false);
  const [isUpdatingBookmark, setIsUpdatingBookmark] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"preview" | "specs">("preview");

  // Default starter code based on question or defaults
  const [htmlCode, setHtmlCode] = useState<string>(() => {
    if (question.slug?.includes("shopping-cart")) {
      return `<table id="items-table">\n  <thead>\n    <tr><th>Item</th><th>Action</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Chips</td>\n      <td><button id="add-to-cart-chips">Add to Cart</button></td>\n    </tr>\n    <tr>\n      <td>Soda</td>\n      <td><button id="add-to-cart-soda">Add to Cart</button></td>\n    </tr>\n  </tbody>\n</table>\n\n<h3>Shopping Cart</h3>\n<table id="cart-table">\n  <thead>\n    <tr><th>Item</th><th>Qty</th></tr>\n  </thead>\n  <tbody id="cart-body">\n  </tbody>\n</table>`;
    }
    if (question.slug?.includes("counter")) {
      return `<div class="counter-card">\n  <h2>Interactive Counter</h2>\n  <div id="counter-value">0</div>\n  <div class="controls">\n    <button id="btn-dec">- Decrement</button>\n    <button id="btn-inc">+ Increment</button>\n    <button id="btn-rst">Reset</button>\n  </div>\n</div>`;
    }
    if (question.slug?.includes("textarea")) {
      return `<div class="editor-container">\n  <h3>Character & Word Counter</h3>\n  <textarea id="myTextarea" rows="5" cols="40" placeholder="Type your text here..."></textarea>\n  <div class="stats">\n    <span>Characters: <b id="char-count">0</b></span>\n    <span>Words: <b id="word-count">0</b></span>\n  </div>\n</div>`;
    }
    return `<div id="app">\n  <h1>${question.title}</h1>\n  <p>Implement the requested component specifications below.</p>\n  <button id="action-btn">Click Me</button>\n  <div id="output"></div>\n</div>`;
  });

  const [cssCode, setCssCode] = useState<string>(
    `body {\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #0D1117;\n  color: #F0F6FC;\n  padding: 20px;\n}\n\nbutton {\n  background: #21262D;\n  color: #F0F6FC;\n  border: 1px solid #30363D;\n  padding: 6px 12px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 13px;\n  margin: 4px;\n  transition: all 0.2s;\n}\n\nbutton:hover {\n  background: #30363D;\n  border-color: #58A6FF;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n  margin-top: 10px;\n}\n\nth, td {\n  border: 1px solid #30363D;\n  padding: 8px 12px;\n  text-align: left;\n}\n\nth {\n  background: #161B22;\n  color: #58A6FF;\n}`
  );

  const [jsCode, setJsCode] = useState<string>(() => {
    if (question.slug?.includes("shopping-cart")) {
      return `// Implement Cart Quantity Update\nconst cartBody = document.getElementById('cart-body');\nconst items = {};\n\ndocument.getElementById('add-to-cart-chips')?.addEventListener('click', () => {\n  items['Chips'] = (items['Chips'] || 0) + 1;\n  renderCart();\n});\n\ndocument.getElementById('add-to-cart-soda')?.addEventListener('click', () => {\n  items['Soda'] = (items['Soda'] || 0) + 1;\n  renderCart();\n});\n\nfunction renderCart() {\n  cartBody.innerHTML = Object.entries(items)\n    .map(([name, qty]) => \`<tr><td>\${name}</td><td>\${qty}</td></tr>\`)\n    .join('');\n}`;
    }
    if (question.slug?.includes("counter")) {
      return `let count = 0;\nconst valEl = document.getElementById('counter-value');\n\ndocument.getElementById('btn-inc')?.addEventListener('click', () => {\n  count++;\n  if (valEl) valEl.innerText = count;\n});\n\ndocument.getElementById('btn-dec')?.addEventListener('click', () => {\n  count = Math.max(0, count - 1);\n  if (valEl) valEl.innerText = count;\n});\n\ndocument.getElementById('btn-rst')?.addEventListener('click', () => {\n  count = 0;\n  if (valEl) valEl.innerText = count;\n});`;
    }
    return `// JavaScript DOM Logic\ndocument.getElementById('action-btn')?.addEventListener('click', () => {\n  const out = document.getElementById('output');\n  if (out) out.innerText = 'Action executed successfully!';\n});`;
  });

  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>("");

  const updatePreview = () => {
    setPreviewSrcDoc(
      `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}<\/script></body></html>`
    );
  };

  useEffect(() => {
    updatePreview();
  }, [htmlCode, cssCode, jsCode]);

  const handleBookmarkToggle = async () => {
    if (isUpdatingBookmark) return;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    setIsUpdatingBookmark(true);
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id }),
      });
    } catch {
      setIsBookmarked(!nextState);
    } finally {
      setIsUpdatingBookmark(false);
    }
  };

  const evidence = analyzeQuestionEvidence(question);

  return (
    <div className="flex flex-col h-[calc(100vh-2.75rem)] bg-[#0D1117] text-[#F0F6FC] overflow-hidden font-sans select-none">
      {/* ─── TOP TOOLBAR ─── */}
      <header className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363D] bg-[#161B22] text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Link
            href="/home/accenture?tab=FRONTEND"
            className="flex items-center gap-1 text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Accenture Frontend</span>
          </Link>
          <span className="text-[#30363D]">/</span>
          <span className="font-semibold text-[#F0F6FC] truncate max-w-xs sm:max-w-md">
            {question.title}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
          {evidence.isMustDo && <MustDoBadge />}
          <SourceBadge sourceType={question.sourceType} sourceShift={question.shift} />
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={handleBookmarkToggle}
            disabled={isUpdatingBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
            className={cn(
              "p-1.5 rounded transition-colors border border-transparent hover:border-[#30363D] hover:bg-[#21262D]",
              isBookmarked ? "text-[#E3B341]" : "text-[#8B949E]"
            )}
          >
            <Bookmark className={cn("w-3.5 h-3.5", isBookmarked && "fill-[#E3B341]")} />
          </button>

          {/* Run Preview */}
          <button
            onClick={updatePreview}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] font-semibold border border-[#30363D] transition-colors text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Preview</span>
          </button>

          {/* Submit */}
          <button
            onClick={updatePreview}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#3FB950] hover:bg-[#3FB950]/90 text-[#0D1117] font-semibold transition-colors text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Solution</span>
          </button>
        </div>
      </header>

      {/* ─── SPLIT VIEW: LEETCODE / TUF WORKSPACE ─── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#30363D] overflow-hidden min-h-0">
        {/* LEFT PANE: Problem Description & Specifications */}
        <div className="flex flex-col h-full overflow-y-auto bg-[#0D1117] p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#30363D]">
          <div>
            <h1 className="text-xl font-bold font-mono text-[#F0F6FC]">{question.title}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <DifficultyBadge difficulty={question.difficulty} />
              {evidence.isMustDo && <MustDoBadge />}
              {evidence.isRepeatedPattern && (
                <RepeatedPatternBadge
                  sources={evidence.corroboratedSources}
                  frequency={question.frequency}
                />
              )}
            </div>
          </div>

          <WhyImportantCard question={question} />

          {/* Description */}
          <div className="space-y-3 font-sans text-xs text-[#8B949E] leading-relaxed">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
              Problem Statement
            </h3>
            <div className="whitespace-pre-line text-[#C9D1D9] bg-[#161B22] p-4 rounded-lg border border-[#30363D]">
              {question.description}
            </div>
          </div>

          {/* Test cases / Objectives */}
          {question.testCases && question.testCases.length > 0 && (
            <div className="space-y-2 font-mono text-xs">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                Assessment Specifications
              </h3>
              <div className="space-y-2">
                {question.testCases.map((tc: any, idx: number) => (
                  <div
                    key={tc.id || idx}
                    className="p-3 rounded-lg border border-[#30363D] bg-[#161B22] space-y-1"
                  >
                    <div className="text-[10px] text-[#58A6FF] uppercase">Test Case {idx + 1}</div>
                    <div className="text-[#C9D1D9]">
                      <span className="text-[#6E7681]">Input Event:</span> {tc.input}
                    </div>
                    <div className="text-[#3FB950]">
                      <span className="text-[#6E7681]">Expected State:</span> {tc.expectedOutput}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progressive Hint / Solution */}
          <ProgressiveHintSolution
            questionType="HTML_CSS_JS"
            hints={question.hints || []}
            approach={question.approach}
          />
        </div>

        {/* RIGHT PANE: Multi-tab Monaco Editor & Live Output */}
        <div className="flex flex-col h-full overflow-hidden bg-[#0D1117] divide-y divide-[#30363D]">
          {/* Top Half: Code Editor */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0D1117]">
            {/* Editor Tab Strip */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#161B22] border-b border-[#30363D] text-xs font-mono">
              <div className="flex items-center gap-1">
                {(["html", "css", "js"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 rounded text-xs uppercase font-bold transition-all",
                      activeTab === tab
                        ? "bg-[#21262D] text-[#58A6FF] border border-[#58A6FF]/40"
                        : "text-[#8B949E] hover:text-[#F0F6FC]"
                    )}
                  >
                    {tab === "html" ? "index.html" : tab === "css" ? "style.css" : "script.js"}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-[#6E7681]">Live Sandbox Active</span>
            </div>

            {/* Monaco Editor Pane */}
            <div className="flex-1 min-h-0">
              {activeTab === "html" && (
                <MonacoCodeEditor
                  code={htmlCode}
                  language="html"
                  onChange={(val) => setHtmlCode(val || "")}
                />
              )}
              {activeTab === "css" && (
                <MonacoCodeEditor
                  code={cssCode}
                  language="css"
                  onChange={(val) => setCssCode(val || "")}
                />
              )}
              {activeTab === "js" && (
                <MonacoCodeEditor
                  code={jsCode}
                  language="javascript"
                  onChange={(val) => setJsCode(val || "")}
                />
              )}
            </div>
          </div>

          {/* Bottom Half: Live Iframe Preview & Output */}
          <div className="h-[42%] flex flex-col bg-[#0D1117]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#161B22] border-b border-[#30363D] text-xs font-mono">
              <span className="font-semibold text-[#8B949E] uppercase flex items-center gap-1.5">
                <MonitorCheck className="w-3.5 h-3.5 text-[#58A6FF]" />
                Live Component Sandbox Output
              </span>
              <button
                onClick={updatePreview}
                className="text-[11px] text-[#58A6FF] hover:underline"
              >
                Reload Output
              </button>
            </div>
            <div className="flex-1 bg-zinc-950">
              <iframe
                srcDoc={previewSrcDoc}
                title="Live Component Output"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
