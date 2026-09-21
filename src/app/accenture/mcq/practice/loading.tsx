import React from "react";

export default function AccenturePracticeLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0D1117] p-4 animate-pulse">
      <div className="h-12 border-b border-[#30363D] bg-[#161B22]" />
      <div className="grid h-[calc(100vh-3rem)] lg:grid-cols-[38%_1fr_200px]">
        <div className="hidden border-r border-[#30363D] p-6 lg:block">
          <div className="h-5 w-32 rounded bg-[#21262D]" />
          <div className="mt-8 h-24 rounded bg-[#161B22]" />
        </div>
        <div className="p-5">
          <div className="h-5 w-40 rounded bg-[#21262D]" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 rounded border border-[#30363D] bg-[#161B22]" />
            ))}
          </div>
        </div>
        <div className="hidden border-l border-[#30363D] p-3 lg:block">
          <div className="h-4 w-24 rounded bg-[#21262D]" />
        </div>
      </div>
    </div>
  );
}