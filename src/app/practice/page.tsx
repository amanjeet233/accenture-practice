"use client";

import React, { useState } from "react";
import { Play, RotateCcw, Terminal, Clock, Cpu } from "lucide-react";

export default function PracticePlayground() {
  const [language, setLanguage] = useState<string>("java");
  const [code, setCode] = useState<string>(
    `// Java 21 Competitive Scratchpad\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Ready to code Java 21");\n    }\n}`
  );
  const [customInput, setCustomInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runtimeMs, setRuntimeMs] = useState<number | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setRuntimeMs(null);

    try {
      const res = await fetch("/api/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, customInput }),
      });
      const data = await res.json();
      if (data.success) {
        setOutput(data.data.output || "Program executed with return: " + (data.data.verdict || "OK"));
        setRuntimeMs(data.data.runtimeMs);
      } else {
        setOutput("Error: " + data.error);
      }
    } catch (err: any) {
      setOutput("Execution error: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(`// JavaScript Scratchpad & Playground\nconsole.log("Hello from scratchpad!");`);
    setOutput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-zinc-950 overflow-hidden">
      {/* Playground Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white font-mono flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-indigo-400" />
            CODING PLAYGROUND
          </span>
          <span className="text-zinc-600">|</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-medium transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-white fill-white" />
            <span>{isRunning ? "Running..." : "Run Code (Ctrl+Enter)"}</span>
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 overflow-hidden">
        {/* Code Editor */}
        <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-4 font-mono text-xs bg-zinc-950 text-zinc-200 resize-none focus:outline-none leading-relaxed border-0"
            placeholder="// Write code here..."
          />
        </div>

        {/* Input & Output */}
        <div className="flex flex-col h-full overflow-hidden bg-zinc-900/30 divide-y divide-zinc-800">
          {/* Custom Input */}
          <div className="h-44 p-3 flex flex-col space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 font-semibold">
              Standard Input (stdin):
            </span>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom input parameters here..."
              className="w-full flex-1 p-2 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-300 resize-none focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Execution Output */}
          <div className="flex-1 p-3 flex flex-col overflow-hidden space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                Execution Output:
              </span>
              {runtimeMs !== null && (
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {runtimeMs}ms
                </span>
              )}
            </div>
            <pre className="w-full flex-1 p-3 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded text-zinc-200 overflow-auto whitespace-pre-wrap">
              {output || (isRunning ? "Executing program in sandbox..." : "Run code to view output here.")}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
