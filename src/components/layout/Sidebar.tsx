"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Code2,
  Building2,
  Database,
  MonitorCheck,
  Timer,
  Milestone,
  TrendingUp,
  Bookmark,
  History,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-[#30363D] bg-[#0D1117] select-none text-xs">
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {/* Primary Navigation */}
        <div className="space-y-0.5">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8B949E] font-semibold">
            Platform
          </div>

          {/* Home */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname === "/dashboard"
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Home
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname === "/dashboard" ? "text-[#58A6FF]" : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">Home</span>
          </Link>

          {/* Problems */}
          <Link
            href="/questions"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/questions")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Code2
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname.startsWith("/questions") ? "text-[#58A6FF]" : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">Problems</span>
          </Link>

          {/* Accenture PYQs (existing company page preserved) */}
          <Link
            href="/companies/accenture"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/companies/accenture")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Building2
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname.startsWith("/companies/accenture")
                  ? "text-[#58A6FF]"
                  : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">Accenture PYQs</span>
          </Link>

          {/* SQL */}
          <Link
            href="/sql"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/sql")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Database
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname.startsWith("/sql") ? "text-[#58A6FF]" : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">SQL</span>
          </Link>

          {/* Frontend */}
          <Link
            href="/frontend"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/frontend")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <MonitorCheck
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname.startsWith("/frontend") ? "text-[#58A6FF]" : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">Frontend</span>
          </Link>

          {/* Mock Tests */}
          <Link
            href="/mock-tests"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/mock-tests")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Timer
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname.startsWith("/mock-tests") ? "text-[#58A6FF]" : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">Mock Tests</span>
          </Link>

          {/* Roadmap */}
          <Link
            href="/practice"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/practice")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Milestone
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname.startsWith("/practice") ? "text-[#58A6FF]" : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">Roadmap</span>
          </Link>

          {/* Progress */}
          <Link
            href="/progress"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/progress")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <TrendingUp
              className={`w-3.5 h-3.5 shrink-0 ${
                pathname.startsWith("/progress") ? "text-[#58A6FF]" : "text-[#8B949E]"
              }`}
            />
            <span className="truncate">Progress</span>
          </Link>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-0.5 pt-2 border-t border-[#30363D]/60">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8B949E] font-semibold">
            Workspace
          </div>
          <Link
            href="/bookmarks"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/bookmarks")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 shrink-0 text-[#8B949E]" />
            <span className="truncate">Bookmarks</span>
          </Link>

          <Link
            href="/submissions"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname.startsWith("/submissions")
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0 text-[#8B949E]" />
            <span className="truncate">History</span>
          </Link>

          <Link
            href="/profile"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
              pathname === "/profile"
                ? "bg-[#21262D] text-[#F0F6FC] font-medium border-l-2 border-[#58A6FF]"
                : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0 text-[#8B949E]" />
            <span className="truncate">Settings</span>
          </Link>
        </div>
      </div>

      {/* Footer Engine Status */}
      <div className="p-2.5 border-t border-[#30363D] text-[10px] font-mono text-[#8B949E] flex items-center justify-between bg-[#161B22]/30">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />
          <span>OpenJDK 21</span>
        </div>
        <span className="text-[#6E7681]">LTS</span>
      </div>
    </aside>
  );
}
