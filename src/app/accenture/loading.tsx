import React from "react";

export default function AccentureLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-xs animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-[#21262D] rounded" />
        <div className="h-3 w-3 bg-[#21262D] rounded" />
        <div className="h-3 w-24 bg-[#21262D] rounded" />
      </div>

      {/* Header skeleton */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-40 bg-[#21262D] rounded" />
          <div className="h-7 w-48 bg-[#21262D] rounded" />
          <div className="h-3 w-96 bg-[#21262D] rounded" />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-[#30363D]/60">
          <div className="h-8 w-28 bg-[#21262D] rounded" />
          <div className="h-8 w-28 bg-[#21262D] rounded" />
          <div className="h-8 w-32 bg-[#21262D] rounded" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded border border-[#30363D] bg-[#161B22]/80">
            <div className="h-3 w-16 bg-[#21262D] rounded" />
            <div className="h-6 w-12 bg-[#21262D] rounded mt-2" />
            <div className="h-2 w-24 bg-[#21262D] rounded mt-1.5" />
          </div>
        ))}
      </div>

      {/* Module cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-3.5 rounded border border-[#30363D] bg-[#161B22] flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-[#21262D]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-[#21262D] rounded" />
              <div className="h-2 w-48 bg-[#21262D] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
