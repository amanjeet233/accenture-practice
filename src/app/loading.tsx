import React from "react";

export default function RootLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 rounded-xl border border-[#30363D]/60 bg-[#161B22]/60 p-6 flex flex-col justify-between">
        <div className="h-4 w-40 bg-[#21262D] rounded"></div>
        <div className="h-6 w-64 bg-[#21262D] rounded"></div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-[#30363D]/60 bg-[#161B22]/60 p-4 space-y-2">
            <div className="h-3 w-20 bg-[#21262D] rounded"></div>
            <div className="h-6 w-16 bg-[#21262D] rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 rounded-xl border border-[#30363D]/60 bg-[#161B22]/60 p-4 space-y-3">
          <div className="h-4 w-32 bg-[#21262D] rounded"></div>
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-8 bg-[#0D1117] rounded"></div>
            ))}
          </div>
        </div>
        <div className="h-64 rounded-xl border border-[#30363D]/60 bg-[#161B22]/60 p-4 space-y-3">
          <div className="h-4 w-32 bg-[#21262D] rounded"></div>
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-8 bg-[#0D1117] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
