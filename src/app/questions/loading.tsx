import React from "react";

export default function QuestionsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans animate-pulse">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="space-y-1">
          <div className="h-6 w-48 bg-[#21262D] rounded"></div>
          <div className="h-3 w-80 bg-[#161B22] rounded"></div>
        </div>
        <div className="h-8 w-28 bg-[#161B22] rounded border border-[#30363D]"></div>
      </div>

      <div className="h-10 bg-[#161B22] border border-[#30363D] rounded-lg"></div>

      <div className="rounded-xl border border-[#30363D] bg-[#161B22] overflow-hidden">
        <div className="h-10 bg-[#0D1117]/80 border-b border-[#30363D]"></div>
        <div className="divide-y divide-[#30363D]/60">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 p-3 flex items-center justify-between">
              <div className="h-4 w-72 bg-[#21262D] rounded"></div>
              <div className="h-4 w-16 bg-[#21262D] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
