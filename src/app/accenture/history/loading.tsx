import React from "react";

export default function AccentureHistoryLoading() {
  return (
    <div className="p-6 font-sans animate-pulse">
      <div className="h-6 w-48 rounded bg-[#21262D]" />
      <div className="mt-6 space-y-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-12 rounded border border-[#30363D] bg-[#161B22]" />
        ))}
      </div>
    </div>
  );
}