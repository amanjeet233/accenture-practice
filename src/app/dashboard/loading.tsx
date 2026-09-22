import React from "react";

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="h-28 rounded-xl border border-[#30363D] bg-[#161B22] p-5 sm:p-6 flex flex-col justify-between">
        <div className="h-3 w-44 bg-[#21262D] rounded"></div>
        <div className="h-7 w-56 bg-[#21262D] rounded"></div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-[#161B22] border border-[#30363D] p-4 space-y-2">
            <div className="h-3 w-16 bg-[#21262D] rounded"></div>
            <div className="h-7 w-20 bg-[#21262D] rounded"></div>
            <div className="h-2.5 w-28 bg-[#21262D] rounded"></div>
          </div>
        ))}
      </div>

      {/* Topics & Diagnostic Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-4 space-y-3">
          <div className="h-4 w-32 bg-[#21262D] rounded"></div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-[#21262D] rounded"></div>
                  <div className="h-3 w-12 bg-[#21262D] rounded"></div>
                </div>
                <div className="h-2 bg-[#0D1117] rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-4 space-y-3">
          <div className="h-4 w-40 bg-[#21262D] rounded"></div>
          <div className="h-32 rounded-lg bg-[#0D1117] border border-[#30363D] p-4 flex items-center justify-center">
            <div className="h-4 w-48 bg-[#21262D] rounded"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4 space-y-3">
        <div className="h-4 w-48 bg-[#21262D] rounded"></div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((k) => (
            <div key={k} className="h-10 rounded bg-[#0D1117] border border-[#30363D]/40"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
