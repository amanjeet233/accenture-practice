"use client";

import React, { useState } from "react";
import { MonitorCheck, Play, RotateCcw, CheckCircle2 } from "lucide-react";

export default function FrontendSandboxPage() {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");

  const [htmlCode, setHtmlCode] = useState<string>(
    `<div class="counter-card">\n  <h2>Interactive Counter</h2>\n  <div id="counter-value">0</div>\n  <div class="controls">\n    <button id="btn-dec">- Decrement</button>\n    <button id="btn-inc">+ Increment</button>\n    <button id="btn-rst">Reset</button>\n  </div>\n</div>`
  );

  const [cssCode, setCssCode] = useState<string>(
    `.counter-card {\n  font-family: system-ui, sans-serif;\n  background: #18181b;\n  color: #fafafa;\n  padding: 24px;\n  border-radius: 8px;\n  border: 1px solid #27272a;\n  text-align: center;\n  max-width: 320px;\n  margin: 40px auto;\n}\n\n#counter-value {\n  font-size: 3rem;\n  font-weight: 700;\n  margin: 16px 0;\n  color: #818cf8;\n}\n\nbutton {\n  background: #27272a;\n  color: white;\n  border: 1px solid #3f3f46;\n  padding: 8px 12px;\n  margin: 0 4px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 12px;\n}\n\nbutton:hover {\n  background: #3f3f46;\n}`
  );

  const [jsCode, setJsCode] = useState<string>(
    `let count = 0;\nconst valEl = document.getElementById('counter-value');\n\ndocument.getElementById('btn-inc').addEventListener('click', () => {\n  count++;\n  valEl.innerText = count;\n});\n\ndocument.getElementById('btn-dec').addEventListener('click', () => {\n  count = Math.max(0, count - 1);\n  valEl.innerText = count;\n});\n\ndocument.getElementById('btn-rst').addEventListener('click', () => {\n  count = 0;\n  valEl.innerText = count;\n});`
  );

  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>(
    `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}<\/script></body></html>`
  );

  const handleUpdatePreview = () => {
    setPreviewSrcDoc(
      `<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}<\/script></body></html>`
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-zinc-950 overflow-hidden">
      {/* Frontend Lab Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white font-mono flex items-center gap-1.5">
            <MonitorCheck className="w-4 h-4 text-indigo-400" />
            FRONTEND LAB & LIVE SANDBOX
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-mono">
            Challenge: Interactive Counter Component
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdatePreview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-medium text-xs transition-colors"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Update Live Preview</span>
          </button>
        </div>
      </div>

      {/* Split Pane: Code Editor on Left, Live Iframe Preview on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 overflow-hidden">
        {/* Editor Pane */}
        <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* File Tab Selector */}
          <div className="flex items-center border-b border-zinc-800 bg-zinc-900/40 text-xs font-mono px-2">
            <button
              onClick={() => setActiveTab("html")}
              className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                activeTab === "html"
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              index.html
            </button>
            <button
              onClick={() => setActiveTab("css")}
              className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                activeTab === "css"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              style.css
            </button>
            <button
              onClick={() => setActiveTab("js")}
              className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                activeTab === "js"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              script.js
            </button>
          </div>

          {/* Active Code Area */}
          <div className="flex-1 relative overflow-hidden bg-zinc-950">
            {activeTab === "html" && (
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 font-mono text-xs bg-zinc-950 text-zinc-200 resize-none focus:outline-none leading-relaxed border-0"
              />
            )}
            {activeTab === "css" && (
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 font-mono text-xs bg-zinc-950 text-zinc-200 resize-none focus:outline-none leading-relaxed border-0"
              />
            )}
            {activeTab === "js" && (
              <textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 font-mono text-xs bg-zinc-950 text-zinc-200 resize-none focus:outline-none leading-relaxed border-0"
              />
            )}
          </div>
        </div>

        {/* Live Preview Iframe */}
        <div className="flex flex-col h-full bg-zinc-900/30 overflow-hidden">
          <div className="px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Sandboxed Component Render Preview</span>
            <span className="text-[10px] text-zinc-500">iframe sandbox active</span>
          </div>
          <iframe
            title="Frontend Live Preview"
            srcDoc={previewSrcDoc}
            sandbox="allow-scripts"
            className="flex-1 w-full h-full border-0 bg-zinc-950"
          />
        </div>
      </div>
    </div>
  );
}
