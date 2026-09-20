import Link from "next/link";
import { Compass, ArrowLeft, Terminal, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-6 shadow-2xl backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <span>ERROR 404</span>
            <span>•</span>
            <span>NOT FOUND</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Target Resource Unavailable
          </h1>
          <p className="text-sm text-zinc-400 font-sans leading-relaxed">
            The question, assessment, or page you requested could not be located in the platform registry.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/questions"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Question Bank</span>
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-zinc-800/80">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to platform home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
