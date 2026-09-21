import React from "react";

export default function AccentureModuleLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 font-sans text-xs animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-[#21262D] rounded" />
        <div className="h-3 w-3 bg-[#21262D] rounded" />
        <div className="h-3 w-24 bg-[#21262D] rounded" />
        <div className="h-3 w-3 bg-[#21262D] rounded" />
        <div className="h-3 w-28 bg-[#21262D] rounded" />
      </div>

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-[#21262D] rounded" />
          <div className="h-3 w-80 bg-[#21262D] rounded" />
        </div>
      </div>

      {/* Practice banner skeleton */}
      <div className="p-4 rounded-md border border-[#30363D] bg-[#161B22] flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#21262D]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-40 bg-[#21262D] rounded" />
          <div className="h-2 w-64 bg-[#21262D] rounded" />
        </div>
        <div className="h-8 w-36 bg-[#21262D] rounded" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border border-[#30363D] bg-[#161B22] overflow-hidden">
        {/* Table header */}
        <div className="border-b border-[#30363D] bg-[#0D1117]/80 px-3 py-2 flex items-center gap-4">
          <div className="h-3 w-12 bg-[#21262D] rounded" />
          <div className="h-3 w-32 bg-[#21262D] rounded flex-1" />
          <div className="h-3 w-16 bg-[#21262D] rounded" />
          <div className="h-3 w-20 bg-[#21262D] rounded" />
          <div className="h-3 w-24 bg-[#21262D] rounded" />
        </div>
        {/* Table rows */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="border-b border-[#30363D]/60 px-3 py-2.5 flex items-center gap-4">
            <div className="h-3.5 w-3.5 rounded-full bg-[#21262D]" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-[#21262D] rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
              <div className="h-2 w-32 bg-[#21262D]/60 rounded" />
            </div>
            <div className="h-4 w-12 bg-[#21262D] rounded" />
            <div className="h-3 w-16 bg-[#21262D] rounded" />
            <div className="h-4 w-20 bg-[#21262D] rounded" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-3 w-28 bg-[#21262D] rounded" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-7 bg-[#21262D] rounded" />
          <div className="h-7 w-7 bg-[#21262D] rounded" />
          <div className="h-7 w-7 bg-[#21262D] rounded" />
        </div>
      </div>
    </div>
  );
}
