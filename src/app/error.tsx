"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-6 shadow-2xl backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase">
            Runtime Exception
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Unexpected Error Encountered
          </h1>
          <p className="text-xs text-zinc-400 font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-left overflow-x-auto">
            {error?.message || "An unexpected error occurred during page rendering."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
