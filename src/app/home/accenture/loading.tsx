import React from "react";

export default function AccentureHomeLoading() {
  return (
    <div className="flex h-full min-h-0 font-sans text-xs animate-pulse">
      {/* Left Sidebar Skeleton */}
      <aside className="hidden h-full w-64 shrink-0 border-r border-[#30363D] bg-[#0D1117] p-4 lg:block space-y-4">
        <div className="border-b border-[#30363D] pb-3.5 space-y-2">
          <div className="h-5 w-28 bg-[#21262D] rounded"></div>
          <div className="h-3 w-36 bg-[#161B22] rounded"></div>
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-8 bg-[#161B22] rounded-md"></div>
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="mx-auto min-w-0 max-w-7xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-[#21262D] rounded"></div>
          <div className="h-7 w-16 bg-[#21262D] rounded"></div>
        </div>

        {/* Hero Skeleton */}
        <div className="h-32 rounded-xl border border-[#30363D] bg-[#161B22] p-6 flex flex-col justify-between">
          <div className="h-4 w-48 bg-[#21262D] rounded"></div>
          <div className="h-7 w-72 bg-[#21262D] rounded"></div>
          <div className="h-3 w-96 bg-[#21262D] rounded"></div>
        </div>

        {/* Stat Cards Skeleton */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 space-y-4">
          <div className="h-4 w-40 bg-[#21262D] rounded"></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-[#0D1117] p-3.5 space-y-2">
                <div className="h-3 w-20 bg-[#21262D] rounded"></div>
                <div className="h-6 w-16 bg-[#21262D] rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Grids Skeleton */}
        <div className="grid grid-cols-1 gap-5 border-t border-[#30363D] pt-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="h-4 w-28 bg-[#21262D] rounded"></div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-[#161B22] border border-[#30363D]"></div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-36 bg-[#21262D] rounded"></div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-[#161B22] border border-[#30363D]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
